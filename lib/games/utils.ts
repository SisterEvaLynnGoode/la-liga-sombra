/** Remove accents, lowercase, strip punctuation, trim. */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Compare two answers accent- and case-insensitively. */
export function answersMatch(student: string, correct: string): boolean {
  return normalizeAnswer(student) === normalizeAnswer(correct);
}

/**
 * Flexible flashcard matching — forgiving of parenthetical notes and
 * slash-separated alternatives that appear in vocab pair answers.
 *
 * Rules:
 *  1. Strip parenthetical content before comparing:
 *     "calm (m/f)" → "calm", "good morning (greeting)" → "good morning"
 *  2. Split on " / " and check each variant independently:
 *     "dad / father" → student can write either "dad" or "father"
 *  3. Exact match after normalisation (no substring tricks that would let
 *     "fa" match "father").
 *
 * Examples that now pass:
 *  "calm"   vs "calm (m/f)"      ✓
 *  "father" vs "dad / father"    ✓
 *  "dad"    vs "dad / father"    ✓
 */
export function flexibleMatch(student: string, correct: string): boolean {
  if (!student.trim()) return false;

  // Strip anything inside parentheses, then normalise
  const clean = (s: string) =>
    normalizeAnswer(s.replace(/\([^)]*\)/g, " "));

  const s = clean(student);
  if (!s) return false;

  // Match against each slash-separated variant
  const variants = correct
    .split("/")
    .map((v) => clean(v))
    .filter(Boolean);

  return variants.some((v) => v === s);
}

/** Return true if student answer matches any of the acceptable answers. */
export function checkAnswer(student: string, acceptable: string[]): boolean {
  return acceptable.some((a) => answersMatch(student, a));
}

/**
 * Free-response matching, deliberately generous.
 *
 * `checkAnswer` demands the whole typed string equal one of the authored
 * answers, so a student who read the passage correctly and wrote "el 15 de
 * marzo de 2024, creo" was marked wrong. These questions check comprehension,
 * not transcription, so an answer that CONTAINS an acceptable answer as whole
 * words counts. A leading "no" still fails, so a negated sentence is not
 * accepted on the strength of the word it negates.
 */
export function looseCheckAnswer(student: string, acceptable: string[]): boolean {
  const s = normalizeAnswer(student);
  if (!s) return false;
  if (acceptable.some((a) => answersMatch(student, a))) return true;
  // "no seco" must not pass on the strength of "seco" — unless the right
  // answer is itself negative ("no registró ningún proyecto"), where a student
  // starting with "no" is on the correct track.
  const answerIsNegative = acceptable.some((a) => normalizeAnswer(a).startsWith("no "));
  if (!answerIsNegative && (s === "no" || s.startsWith("no "))) return false;
  // normalizeAnswer already stripped punctuation and collapsed runs of space,
  // so padding both sides turns "contains" into a whole-word test.
  const padded = ` ${s} `;
  return acceptable.some((a) => {
    const n = normalizeAnswer(a);
    return n.length > 0 && padded.includes(` ${n} `);
  });
}

/**
 * The shape of an answer: first letter of each word, the rest as underscores
 * ("el quince de marzo" → "e_ q_____ d_ m____"). Printed under a free-response
 * box so a student can see how many words to write and how each one starts,
 * without being handed the answer.
 */
export function answerShape(answer: string): string {
  return answer
    .trim()
    .split(/\s+/)
    .map((w) => (w.length <= 1 ? w : w[0] + "_".repeat(Math.min(w.length - 1, 12))))
    .join(" ");
}

/**
 * How much of a target sentence the student actually produced, 0–1.
 *
 * The typed dialogue turn asked students to reproduce a whole sentence and
 * compared it with `flexibleMatch`, which is all-or-nothing: one missing accent
 * or a dropped "usted" and a 15-word sentence came back wrong. Production
 * practice should reward the sentence being there, so the caller can accept a
 * high-enough overlap instead of demanding a transcript.
 */
export function wordOverlapRatio(student: string, target: string): number {
  const t = normalizeAnswer(target).split(" ").filter(Boolean);
  if (!t.length) return 0;
  const said = new Set(normalizeAnswer(student).split(" ").filter(Boolean));
  return t.filter((w) => said.has(w)).length / t.length;
}

/** Format seconds as M:SS */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Fisher-Yates shuffle — returns a new array. */
/**
 * Deterministic shuffle, seeded from the content being shuffled.
 *
 * Every game screen is server-rendered first and then hydrated in the browser.
 * A `Math.random()` shuffle in a useState initializer runs twice — once on the
 * server, once in the browser — and the two orders disagree, so React throws a
 * hydration error ("Text content does not match server-rendered HTML"), tears
 * down that part of the page and re-renders it. Students see the activity flash
 * or blank for a moment, and the error lands in the console as React #418/#425.
 *
 * Seeding from the words themselves keeps the order stable across that handoff
 * while still differing from one sentence or deck to the next. Use plain
 * `shuffle` for anything that only ever runs in the browser (an effect, a
 * button handler) — there is no server render to disagree with there.
 */
export function seededRandom(seed: string): () => number {
  // xmur3 string hash → mulberry32 PRNG. Small, stable and dependency-free.
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = (h ^= h >>> 16) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(arr: T[], seed: string): T[] {
  const rand = seededRandom(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
