/**
 * Worksheet generator.
 *
 * Pure functions that turn a unit's vocab list + grammar lesson into the data
 * for a printable, black-and-white, detective-themed worksheet packet.
 *
 * Determinism: a seeded shuffle keeps the printed sheet stable for a given unit
 * so the teacher's answer key always matches what students see.
 */

import { getGrammarLesson, type GrammarLesson } from "./grammar";
import { getCultureLesson, type CultureLesson } from "./culture";

export interface VocabPair {
  spanish: string;
  english: string;
}

export interface MatchActivity {
  /** Spanish column, in order */
  spanish: string[];
  /** English column, shuffled, with the index of its correct Spanish match */
  english: Array<{ text: string; answerLetter: string }>;
}

export interface TranslateItem {
  prompt: string;     // the word shown
  answer: string;     // what they write
  direction: "es-en" | "en-es";
}

export interface UnscrambleItem {
  scrambled: string;  // scrambled Spanish letters
  hint: string;       // English meaning
  answer: string;     // the real Spanish word
}

export interface WordBankItem {
  sentence: string;   // sentence with a "____" blank
  answer: string;     // word from the bank
}

export interface WorksheetPacket {
  unitNumber: number;
  country: string;
  city?: string;
  caseTitle: string;
  caseDescription: string;
  criminalName: string;
  vocabCount: number;
  grammar: GrammarLesson;
  culture: CultureLesson | null;
  match: MatchActivity;
  translate: TranslateItem[];
  unscramble: UnscrambleItem[];
  wordBank: { bank: string[]; items: WordBankItem[] };
  writingPrompts: string[];
  allVocab: VocabPair[];
}

// ── Seeded shuffle (mulberry32) ───────────────────────────────────────────────
function seeded(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const rng = seeded(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Strip parenthetical glosses and slashes so the "answer" word is clean. */
function primaryForm(s: string): string {
  // Take the part before "/" or "(" — keeps "alto" from "alto / alta (m/f)"
  return s.split("/")[0].split("(")[0].split("—")[0].trim();
}

/** Scramble a word's letters deterministically (and ensure it differs from the original). */
function scramble(word: string, seed: number): string {
  const clean = word.replace(/\s+/g, " ").trim();
  if (clean.length <= 2) return clean.split("").reverse().join("");
  // Scramble letters within each word, preserving spaces
  return clean
    .split(" ")
    .map((token, ti) => {
      const chars = token.split("");
      let out = chars;
      let tries = 0;
      do {
        out = shuffleSeeded(chars, seed + ti * 31 + tries);
        tries++;
      } while (out.join("") === token && tries < 6);
      return out.join("");
    })
    .join(" ");
}

export function buildWorksheetPacket(unit: {
  unitNumber: number;
  country: string;
  city?: string;
  caseTitle: string;
  caseDescription: string;
  criminalName: string;
  vocab: VocabPair[];
  grammarDescription: string;
}): WorksheetPacket {
  const seed = unit.unitNumber * 1009;

  // Filter out "mini-glosario" study-card style entries (they aren't clean vocab)
  const cleanVocab = unit.vocab.filter(
    (v) => !v.english.includes("★") && !v.spanish.includes("★")
  );

  // ── 1. Matching (first 10 terms) ────────────────────────────────────────────
  const matchPool = cleanVocab.slice(0, 10);
  const matchSpanish = matchPool.map((v) => primaryForm(v.spanish));
  const englishShuffled = shuffleSeeded(
    matchPool.map((v, i) => ({ text: primaryForm(v.english), correctIndex: i })),
    seed + 1
  );
  // Each English item gets the letter (A, B, C…) of its correct Spanish row.
  const match: MatchActivity = {
    spanish: matchSpanish,
    english: englishShuffled.map((e) => ({
      text: e.text,
      answerLetter: LETTERS[e.correctIndex],
    })),
  };

  // ── 2. Translate the Evidence (next chunk, both directions) ──────────────────
  const translatePool = shuffleSeeded(cleanVocab, seed + 2).slice(0, 12);
  const translate: TranslateItem[] = translatePool.map((v, i) => {
    const esEn = i % 2 === 0;
    return esEn
      ? { prompt: primaryForm(v.spanish), answer: primaryForm(v.english), direction: "es-en" }
      : { prompt: primaryForm(v.english), answer: primaryForm(v.spanish), direction: "en-es" };
  });

  // ── 3. Unscramble the Clues (6 terms, single-word preferred) ─────────────────
  const unscramblePool = shuffleSeeded(
    cleanVocab.filter((v) => primaryForm(v.spanish).replace(/\s/g, "").length >= 3),
    seed + 3
  ).slice(0, 6);
  const unscramble: UnscrambleItem[] = unscramblePool.map((v, i) => {
    const answer = primaryForm(v.spanish);
    return {
      scrambled: scramble(answer, seed + 100 + i).toUpperCase(),
      hint: primaryForm(v.english),
      answer,
    };
  });

  // ── 4. Crack the Code (word-bank fill-in using grammar drill sentences) ──────
  const grammar = getGrammarLesson(unit.unitNumber, unit.grammarDescription);
  const bankItems: WordBankItem[] = grammar.drills.map((d) => ({
    sentence: d.prompt.replace(/____+/g, "____"),
    answer: d.answer,
  }));
  const wordBank = {
    bank: shuffleSeeded(bankItems.map((b) => b.answer), seed + 4),
    items: bankItems,
  };

  // ── 5. Detective writing prompts (Informe Final) ─────────────────────────────
  const writingPrompts = buildWritingPrompts(unit, cleanVocab);

  return {
    unitNumber: unit.unitNumber,
    country: unit.country,
    city: unit.city,
    caseTitle: unit.caseTitle,
    caseDescription: unit.caseDescription,
    criminalName: unit.criminalName,
    vocabCount: cleanVocab.length,
    grammar,
    culture: getCultureLesson(unit.unitNumber),
    match,
    translate,
    unscramble,
    wordBank,
    writingPrompts,
    allVocab: cleanVocab.map((v) => ({
      spanish: primaryForm(v.spanish),
      english: primaryForm(v.english),
    })),
  };
}

function buildWritingPrompts(
  unit: { country: string; criminalName: string },
  vocab: VocabPair[]
): string[] {
  const sample = vocab.slice(0, 5).map((v) => primaryForm(v.spanish));
  return [
    `Describe al sospechoso "${unit.criminalName}" en 3 oraciones. Usa el vocabulario de la unidad. / Describe the suspect "${unit.criminalName}" in 3 sentences using this unit's vocabulary.`,
    `Escribe un informe corto (4–5 oraciones) sobre tu caso en ${unit.country}. Incluye al menos cuatro palabras nuevas. / Write a short report (4–5 sentences) about your case in ${unit.country}. Include at least four new words.`,
    `Usa estas palabras en oraciones originales: ${sample.join(", ")}. / Use these words in original sentences: ${sample.join(", ")}.`,
  ];
}
