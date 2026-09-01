/**
 * Building multiple-choice options that are actually answerable.
 *
 * THE BUG THIS FIXES
 *
 * Every generated multiple-choice drill built its distractors like this:
 *
 *   const distractors = shuffle(allAnswers.filter((a) => a !== correct)).slice(0, 3);
 *
 * An exact string comparison. The vocabulary has 884 entries covering 483
 * distinct Spanish words, so the same word is glossed more than once — and
 * fifteen of them are glossed DIFFERENTLY:
 *
 *   la plaza   → "plaza" / "plaza / town square" / "square, plaza"
 *   la receta  → "the recipe" / "prescription"
 *   llevar     → "to carry / to take" / "to carry / wear" / "to take, to carry"
 *   el maíz    → "corn" / "corn / maize"
 *
 * `!==` only removed the exact gloss picked as the answer, so the OTHER correct
 * glosses of the very same word stayed in the pool and were served as wrong
 * answers. A student hearing «la plaza» saw "plaza", "plaza / town square" and
 * "square, plaza" side by side, picked one, and was told they were wrong. For
 * «la receta» the two glosses mean different things, so the question had no
 * findable answer at all.
 *
 * That is what "the audio questions don't match any of the answers" was.
 *
 * THE RULE HERE
 *
 * A candidate is rejected as a distractor when it could reasonably be marked
 * correct for the same prompt:
 *
 *   1. it is the same string as the answer (accent- and case-insensitively);
 *   2. it is another gloss of the SAME term (the authoritative check — it is
 *      what actually catches all fifteen);
 *   3. it shares a slash- or comma-separated alternative with the answer, so
 *      "plaza" and "plaza / town square" cannot co-occur even if the two came
 *      from vocabulary entries we could not pair up.
 *
 * Options are also de-duplicated, so the same text can never appear twice, and
 * a question that cannot find three clean distractors is dropped rather than
 * shipped short — a three-option question in a four-option UI is its own bug.
 */

/** Accent- and case-insensitive, whitespace-collapsed. */
export function normalizeOption(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** "plaza / town square" → ["plaza", "town square"]. Also splits on commas. */
function alternatives(s: string): string[] {
  return normalizeOption(s)
    .split(/[/,]/)
    .map((p) => p.replace(/\(.*?\)/g, "").trim())
    .filter(Boolean);
}

/** True when `candidate` could legitimately be marked correct alongside `answer`. */
export function conflicts(candidate: string, answer: string): boolean {
  if (normalizeOption(candidate) === normalizeOption(answer)) return true;
  const a = new Set(alternatives(answer));
  return alternatives(candidate).some((alt) => a.has(alt));
}

export interface MCBuildResult {
  options: string[];
  correctIndex: number;
}

/**
 * Four shuffled options for one prompt, or null when there is not enough clean
 * material to build a fair question.
 *
 * `answer`      the correct response.
 * `pool`        every candidate response, duplicates allowed.
 * `sameTermAnswers` every OTHER correct response for this same prompt — pass
 *               all glosses of the term. This is the check that matters.
 * `rand`        injectable for deterministic tests.
 */
export function buildOptions(
  answer: string,
  pool: string[],
  sameTermAnswers: string[] = [],
  rand: () => number = Math.random
): MCBuildResult | null {
  const banned = [answer, ...sameTermAnswers];

  const seen = new Set<string>([normalizeOption(answer)]);
  const candidates: string[] = [];
  for (const c of pool) {
    const key = normalizeOption(c);
    if (seen.has(key)) continue;                       // no duplicate options
    if (banned.some((b) => conflicts(c, b))) continue; // no second correct answer
    seen.add(key);
    candidates.push(c);
  }

  if (candidates.length < 3) return null;

  const picked = shuffleWith(candidates, rand).slice(0, 3);
  const options = shuffleWith([answer, ...picked], rand);
  return { options, correctIndex: options.indexOf(answer) };
}

/** Fisher–Yates with an injectable source, so tests can pin the order. */
export function shuffleWith<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Re-order an authored question's options so the answer is not always in the
 * same slot, keeping `correctIndex` pointed at it.
 *
 * The grammar drills need this: all 64 authored questions put the answer at
 * index 0, so "always pick A" scored 100% and the drill measured nothing.
 */
export function reshuffleAuthored<T extends { options: string[]; correctIndex: number }>(
  q: T,
  rand: () => number = Math.random
): T {
  const answer = q.options[q.correctIndex];
  if (answer === undefined) return q;
  const options = shuffleWith(q.options, rand);
  return { ...q, options, correctIndex: options.indexOf(answer) };
}
