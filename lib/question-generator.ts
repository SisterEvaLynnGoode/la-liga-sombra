/**
 * Stakeout question generator
 *
 * Generates 12-15 rapid-fire questions from existing unit content.
 * Three types are mixed according to the student's weakest skill:
 *
 *  • vocab      — MC: prompt in one language → pick translation
 *  • sentence   — tap-to-order: scrambled words → correct sentence
 *  • listening  — MC: play vocab audio → pick the matching translation
 *
 * All inputs come from the unit JSON that's already in memory —
 * no new content authoring is required.
 */

import type { UnitContent, SentenceItem } from "@/lib/types/unit-content";
import type { SkillWeights } from "@/lib/mastery";

// ── Question types ─────────────────────────────────────────────────────────────

export interface VocabStakeoutQ {
  type: "vocab";
  promptLang: "es" | "en";
  prompt: string;
  answer: string;
  options: string[];      // 4 choices, correct one included
  correctIndex: number;
  /** True when this is a spaced-repetition item recycled from a PRIOR unit. */
  isReview?: boolean;
  /** The prior unit the term came from (display only). */
  reviewUnitNumber?: number;
}

/** A prior-unit term due for review (from lib/spaced-repetition.ts). */
export interface ReviewTerm {
  spanish: string;
  english: string;
  unitNumber: number;
}

export interface SentenceStakeoutQ {
  type: "sentence";
  words: string[];        // scrambled word tokens
  correctSentence: string;
}

export interface ListeningStakeoutQ {
  type: "listening";
  audioUrl: string;
  promptWord: string;     // the Spanish word being played
  options: string[];      // 4 English translations
  correctIndex: number;
}

export type StakeoutQuestion = VocabStakeoutQ | SentenceStakeoutQ | ListeningStakeoutQ;

// ── Fisher-Yates shuffle ───────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/** Pick N distinct random items from an array (non-destructive). */
function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/** Build 3 distractors from the vocab pool that are NOT the correct answer. */
function buildDistractors(
  correct: string,
  pool: string[],
  count = 3
): string[] {
  const others = pool.filter((p) => p.toLowerCase() !== correct.toLowerCase());
  return pickN(others, count);
}

// ── Question builders ──────────────────────────────────────────────────────────

function buildVocabQuestions(content: UnitContent, count: number): VocabStakeoutQ[] {
  const vocab = shuffle(content.vocab).slice(0, count * 2); // oversample then trim
  const allEnglish = content.vocab.map((v) => v.english);
  const allSpanish = content.vocab.map((v) => v.spanish);

  const questions: VocabStakeoutQ[] = [];

  for (const v of vocab) {
    if (questions.length >= count) break;

    // Alternate direction question by question
    const esFirst = questions.length % 2 === 0;
    const prompt   = esFirst ? v.spanish : v.english;
    const answer   = esFirst ? v.english : v.spanish;
    const pool     = esFirst ? allEnglish : allSpanish;
    const distract = buildDistractors(answer, pool);

    if (distract.length < 3) continue; // not enough vocab for 4-choice MC

    const opts = shuffle([answer, ...distract]);
    questions.push({
      type: "vocab",
      promptLang: esFirst ? "es" : "en",
      prompt,
      answer,
      options: opts,
      correctIndex: opts.indexOf(answer),
    });
  }

  return questions;
}

function buildSentenceQuestions(
  sentences: SentenceItem[],
  count: number
): SentenceStakeoutQ[] {
  return shuffle(sentences).slice(0, count).map((s) => {
    const words = s.sentence
      .replace(/[.!?¿¡]/g, "")
      .split(/\s+/)
      .filter(Boolean);
    return {
      type: "sentence",
      words: shuffle(words),
      correctSentence: s.sentence,
    };
  });
}

function buildListeningQuestions(content: UnitContent, count: number): ListeningStakeoutQ[] {
  const withAudio = content.vocab.filter((v) => v.audio);
  if (!withAudio.length) return [];

  const allEnglish = content.vocab.map((v) => v.english);
  const questions: ListeningStakeoutQ[] = [];

  for (const v of shuffle(withAudio)) {
    if (questions.length >= count) break;
    const distract = buildDistractors(v.english, allEnglish);
    if (distract.length < 3) continue;
    const opts = shuffle([v.english, ...distract]);
    questions.push({
      type: "listening",
      audioUrl: v.audio!,
      promptWord: v.spanish,
      options: opts,
      correctIndex: opts.indexOf(v.english),
    });
  }

  return questions;
}

/**
 * Interleaved review questions (Workstream B1): MC vocab items built from
 * PRIOR units' overdue terms so old vocabulary keeps resurfacing inside new
 * cases. Distractors mix current-unit and review-pool words.
 */
function buildReviewQuestions(
  reviewTerms: ReviewTerm[],
  content: UnitContent,
  count: number
): VocabStakeoutQ[] {
  const englishPool = [...content.vocab.map((v) => v.english), ...reviewTerms.map((t) => t.english)];
  const spanishPool = [...content.vocab.map((v) => v.spanish), ...reviewTerms.map((t) => t.spanish)];

  const questions: VocabStakeoutQ[] = [];
  for (const t of shuffle(reviewTerms)) {
    if (questions.length >= count) break;
    const esFirst = questions.length % 2 === 0;
    const prompt = esFirst ? t.spanish : t.english;
    const answer = esFirst ? t.english : t.spanish;
    const distract = buildDistractors(answer, esFirst ? englishPool : spanishPool);
    if (distract.length < 3) continue;
    const opts = shuffle([answer, ...distract]);
    questions.push({
      type: "vocab",
      promptLang: esFirst ? "es" : "en",
      prompt,
      answer,
      options: opts,
      correctIndex: opts.indexOf(answer),
      isReview: true,
      reviewUnitNumber: t.unitNumber,
    });
  }
  return questions;
}

// ── Sentence source ────────────────────────────────────────────────────────────

/** Collect sentences from sentenceBuilder stages in the unit JSON. */
function extractSentences(content: UnitContent): SentenceItem[] {
  const sentences: SentenceItem[] = [];
  for (const stage of content.stages) {
    if (stage.type === "sentenceBuilder") {
      sentences.push(...stage.sentences);
    }
  }
  return sentences;
}

// ── Main export ────────────────────────────────────────────────────────────────

const TOTAL_QUESTIONS = 13;

/** Share of the deck reserved for prior-unit review when review terms exist. */
const REVIEW_SHARE = 0.25;

/**
 * Generate a weighted mix of 13 stakeout questions.
 *
 * `weights` controls how many of each type to include.
 * If a type can't fill its quota (e.g., no sentences in this unit),
 * the deficit is distributed to the other types.
 *
 * `reviewTerms` (optional) injects ~25% spaced-repetition items from prior
 * units, labeled "Expediente antiguo" in the UI (Workstream B1).
 */
export function generateStakeoutQuestions(
  content: UnitContent,
  weights: SkillWeights,
  reviewTerms: ReviewTerm[] = []
): StakeoutQuestion[] {
  const sentences = extractSentences(content);
  const hasAudio  = content.vocab.some((v) => v.audio);

  // Redistribute grammar weight to vocab if no sentences available
  let w = { ...weights };
  if (!sentences.length) {
    w = { vocab: w.vocab + w.grammar * 0.6, listening: w.listening + w.grammar * 0.4, grammar: 0 };
  }
  // Redistribute listening weight to vocab if no audio
  if (!hasAudio) {
    w = { vocab: w.vocab + w.listening, listening: 0, grammar: w.grammar };
  }

  // Normalize
  const sum = w.vocab + w.listening + w.grammar || 1;
  w = { vocab: w.vocab / sum, listening: w.listening / sum, grammar: w.grammar / sum };

  // Compute counts (guaranteed ≥1 vocab if we have vocab)
  let nVocab  = clamp(Math.round(w.vocab     * TOTAL_QUESTIONS), 1, TOTAL_QUESTIONS - 2);
  const nListen = clamp(Math.round(w.listening * TOTAL_QUESTIONS), 0, TOTAL_QUESTIONS - nVocab);
  let nSent   = TOTAL_QUESTIONS - nVocab - nListen;
  // Cap sentence questions by available sentences
  nSent   = Math.min(nSent, sentences.length);
  nVocab  = TOTAL_QUESTIONS - nListen - nSent;

  // Reserve ~25% of the vocab quota for prior-unit review terms (B1).
  const nReview = reviewTerms.length
    ? Math.min(Math.round(TOTAL_QUESTIONS * REVIEW_SHARE), reviewTerms.length, Math.max(0, nVocab - 1))
    : 0;
  nVocab -= nReview;

  const vocabQs  = buildVocabQuestions(content, nVocab);
  const reviewQs = buildReviewQuestions(reviewTerms, content, nReview);
  const sentQs   = buildSentenceQuestions(sentences, nSent);
  const listenQs = buildListeningQuestions(content, nListen);

  // Pad with extra vocab if other types came up short
  const total = vocabQs.length + reviewQs.length + sentQs.length + listenQs.length;
  const extra = total < TOTAL_QUESTIONS
    ? buildVocabQuestions(content, TOTAL_QUESTIONS - total)
    : [];

  return shuffle([...vocabQs, ...reviewQs, ...sentQs, ...listenQs, ...extra]);
}
