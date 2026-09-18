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

/**
 * Strip glosses so the "answer" word is clean.
 *
 * A SPACED slash separates alternatives ("screen / monitor", "alto / alta"),
 * so only the first is kept. An UNSPACED slash is part of the meaning
 * ("he/she arrived", "él/ella viene") and is kept whole. This used to split on
 * every slash, which turned 118 "he/she …" glosses into the single word "he":
 * Caso 25's matching column printed "he" ten times. Parentheticals are removed
 * wherever they sit rather than cut at the first "(", which had reduced
 * "(to) him/her/you formal" to an empty answer.
 */
function primaryForm(s: string): string {
  const cleaned = s
    .replace(/\([^)]*\)/g, " ")
    .split(/\s+\/\s+/)[0]
    .split("—")[0]
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || s.trim();
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
  // Skip terms whose Spanish or English repeats an earlier one (el poeta / la
  // poeta both gloss as "the poet"): two identical answers make the column
  // unanswerable.
  const matchPool: VocabPair[] = [];
  const seenEs = new Set<string>();
  const seenEn = new Set<string>();
  for (const v of cleanVocab) {
    const es = primaryForm(v.spanish).toLowerCase();
    const en = primaryForm(v.english).toLowerCase();
    if (seenEs.has(es) || seenEn.has(en)) continue;
    seenEs.add(es); seenEn.add(en);
    matchPool.push(v);
    if (matchPool.length === 10) break;
  }
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
  const writingPrompts = buildWritingPrompts(unit, cleanVocab, grammar.title);

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
  unit: { unitNumber: number; country: string; city?: string; criminalName: string },
  vocab: VocabPair[],
  grammarTitle: string
): string[] {
  const sample = vocab.slice(0, 5).map((v) => primaryForm(v.spanish));
  // Spanish 2: the report should practise the week's grammar, not just the
  // words. "Describe the suspect" alone would never touch the preterite or
  // the subjunctive the whole week was built around.
  if (unit.unitNumber >= 21) {
    const place = unit.city ?? unit.country;
    return [
      `Escribe un informe de 5–6 oraciones sobre el caso en ${place}. Usa la gramática de esta semana: ${grammarTitle}. Subraya cada verbo que la usa. / Write a 5–6 sentence report on the case in ${place} using this week's grammar (${grammarTitle}). Underline every verb that uses it.`,
      `Describe a "${unit.criminalName}" en 3 oraciones: cómo es, qué hizo y qué va a pasar ahora. / Describe "${unit.criminalName}" in 3 sentences: what they are like, what they did, and what happens now.`,
      `Usa estas palabras en oraciones originales: ${sample.join(", ")}. / Use these words in original sentences: ${sample.join(", ")}.`,
    ];
  }
  return [
    `Describe al sospechoso "${unit.criminalName}" en 3 oraciones. Usa el vocabulario de la unidad. / Describe the suspect "${unit.criminalName}" in 3 sentences using this unit's vocabulary.`,
    `Escribe un informe corto (4–5 oraciones) sobre tu caso en ${unit.country}. Incluye al menos cuatro palabras nuevas. / Write a short report (4–5 sentences) about your case in ${unit.country}. Include at least four new words.`,
    `Usa estas palabras en oraciones originales: ${sample.join(", ")}. / Use these words in original sentences: ${sample.join(", ")}.`,
  ];
}
