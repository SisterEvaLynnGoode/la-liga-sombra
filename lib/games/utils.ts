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
