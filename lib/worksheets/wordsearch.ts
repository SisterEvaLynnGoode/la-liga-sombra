/**
 * Word-search generator for the paper packets.
 *
 * Generated from the day's own vocabulary list rather than hand-built, so a
 * puzzle can never drift from the words the page teaches.
 *
 * Deterministic on purpose: the same words always produce the same grid. A
 * worksheet that reshuffles every time it is opened cannot be re-printed for an
 * absent student, and the answer key would stop matching the copies already
 * handed out.
 *
 * Accents are stripped from the GRID only. Spanish word searches conventionally
 * drop them (there is no good way to hide "á" among filler letters), and the
 * word list printed beside the puzzle keeps its accents so students still see
 * the correct spelling.
 */

export interface WordSearch {
  size: number;
  /** grid[row][col], uppercase A–Z plus Ñ. */
  grid: string[][];
  /** As printed beside the puzzle — accents intact. */
  words: string[];
  /** Words that would not fit and were dropped, so callers can notice. */
  omitted: string[];
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Strip accents, drop spaces and articles — grids hold letters, not phrases. */
function normalize(word: string): string {
  return word
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-ZÑ]/g, "");
}

/** Small deterministic PRNG — same seed, same grid, every print. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const DIRECTIONS: Array<[number, number]> = [
  [0, 1],   // →
  [1, 0],   // ↓
  [1, 1],   // ↘
  [-1, 1],  // ↗
];

export function buildWordSearch(rawWords: string[], size = 12, seed = 42): WordSearch {
  const rand = rng(seed);
  const grid: (string | null)[][] = Array.from({ length: size }, () =>
    Array<string | null>(size).fill(null),
  );

  // Longest first — long words have the fewest legal placements, so placing
  // them while the grid is empty is what keeps the whole set fitting.
  const entries = rawWords
    .map((w) => ({ raw: w, norm: normalize(w) }))
    .filter((e) => e.norm.length >= 3)
    .sort((a, b) => b.norm.length - a.norm.length);

  const placed: string[] = [];
  const omitted: string[] = [];

  for (const entry of entries) {
    if (entry.norm.length > size) { omitted.push(entry.raw); continue; }
    let done = false;

    for (let attempt = 0; attempt < 300 && !done; attempt++) {
      const [dr, dc] = DIRECTIONS[Math.floor(rand() * DIRECTIONS.length)];
      const r0 = Math.floor(rand() * size);
      const c0 = Math.floor(rand() * size);
      const rEnd = r0 + dr * (entry.norm.length - 1);
      const cEnd = c0 + dc * (entry.norm.length - 1);
      if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) continue;

      // Overlaps are fine only where the letters already agree.
      let ok = true;
      for (let i = 0; i < entry.norm.length; i++) {
        const cell = grid[r0 + dr * i][c0 + dc * i];
        if (cell !== null && cell !== entry.norm[i]) { ok = false; break; }
      }
      if (!ok) continue;

      for (let i = 0; i < entry.norm.length; i++) {
        grid[r0 + dr * i][c0 + dc * i] = entry.norm[i];
      }
      placed.push(entry.raw);
      done = true;
    }
    if (!done) omitted.push(entry.raw);
  }

  const filled = grid.map((row) =>
    row.map((cell) => cell ?? ALPHABET[Math.floor(rand() * ALPHABET.length)]),
  );

  return {
    size,
    grid: filled,
    // Printed in the order the page lists them, not the order they were placed.
    words: rawWords.filter((w) => placed.includes(w)),
    omitted,
  };
}
