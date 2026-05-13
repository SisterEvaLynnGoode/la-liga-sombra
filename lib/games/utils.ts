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
