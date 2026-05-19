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
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
