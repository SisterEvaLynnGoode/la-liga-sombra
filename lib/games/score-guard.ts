/**
 * Server-side validation for anything a student's browser claims about a score.
 *
 * WHY THIS EXISTS
 *
 * Every score in this game is calculated in the browser and POSTed. The routes
 * used to accept whatever arrived: `score`, `maxScore` and `timeSpentSeconds`
 * were null-checked and inserted. The database only enforced `score >= 0`,
 * `max_score > 0` and `time_spent_seconds >= 0` — nothing said a score had to
 * be less than or equal to its own maximum.
 *
 * That was not theoretical. 32 rows in the live attempts table carried
 * score > max_score, up to 133%, from a real bug in the stakeout stage. The
 * gradebook divides score by max_score with no clamp, so those rows inflated
 * real students' course grades.
 *
 * And the same hole is trivially reachable on purpose. The class code is
 * written on the board and any student with the developer console open can
 * POST `{score: 999999, maxScore: 1}` and read back a five-digit percentage.
 * A gradebook that can be edited by its subjects is not a gradebook.
 *
 * WHAT THIS DOES NOT DO
 *
 * It cannot verify that a student actually earned a legitimate-looking score —
 * a browser that says "9/10" is indistinguishable from one that means it. The
 * goal is narrower and achievable: no impossible values, and nothing that can
 * corrupt the class's grade maths. Bounds are generous on purpose, because a
 * false rejection loses a student real work.
 */

export interface ScoreInput {
  score: unknown;
  maxScore: unknown;
  timeSpentSeconds?: unknown;
}

export interface CleanScore {
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
}

/** One activity cannot sanely be worth more than this many points. */
const MAX_POINTS = 1000;
/** 6 hours. Longer than any class period, short enough to bound a tampered value. */
const MAX_SECONDS = 21_600;

function num(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return v;
}

/**
 * Returns the cleaned values, or a reason string when the payload is not
 * salvageable. Callers should return 400 with the reason rather than silently
 * writing something they had to guess at.
 */
export function cleanScore(input: ScoreInput): { ok: true; value: CleanScore } | { ok: false; reason: string } {
  const score = num(input.score);
  const maxScore = num(input.maxScore);
  const rawTime = input.timeSpentSeconds === undefined ? 0 : num(input.timeSpentSeconds);

  if (score === null || maxScore === null) return { ok: false, reason: "score and maxScore must be numbers" };
  if (rawTime === null) return { ok: false, reason: "timeSpentSeconds must be a number" };

  // Integers only: the column is an integer, and a float silently truncates.
  const s = Math.round(score);
  const m = Math.round(maxScore);
  const t = Math.round(rawTime);

  if (m < 1 || m > MAX_POINTS) return { ok: false, reason: `maxScore must be between 1 and ${MAX_POINTS}` };
  if (s < 0) return { ok: false, reason: "score cannot be negative" };
  if (s > m) return { ok: false, reason: "score cannot exceed maxScore" };
  if (t < 0) return { ok: false, reason: "timeSpentSeconds cannot be negative" };

  // Time is clamped rather than rejected: a tab left open over lunch is a
  // plausible accident, and losing the student's actual score over it would be
  // a worse outcome than recording a capped duration.
  return { ok: true, value: { score: s, maxScore: m, timeSpentSeconds: Math.min(t, MAX_SECONDS) } };
}
