// Server-side mastery helpers — only import from Server Components / Route Handlers.
// Client components must call API routes instead.
import { createClient } from "@/lib/supabase/server";
import { computeTermAccuracies } from "@/lib/stats";

export type ReadinessTier = "ready" | "recommended" | "required";

export interface ReadinessResult {
  tier: ReadinessTier;
  score: number; // 0–1, class-average correct/attempts across the given vocab terms
}

/**
 * Compute a student's readiness score for a set of vocab terms.
 *
 * score = avg(per-term accuracy), where each term's accuracy is the
 * RECENCY-WEIGHTED value from lib/stats.ts (last 10 item_events, 14-day
 * half-life) with a fallback to lifetime correct/attempts for terms that
 * predate event instrumentation. Unknown terms count as 0.
 *
 * This fixes the lifetime-average bias: a student who struggled with a set
 * in August but has since mastered it no longer gets a permanently
 * depressed readiness score at the Academia gate.
 *
 * Tier thresholds:
 *   ≥ 0.80 → ready      (skip Academia)
 *   ≥ 0.50 → recommended (optional training)
 *   < 0.50 → required   (forced training)
 */
export async function getVocabReadinessScore(
  studentId: string,
  vocabTerms: string[]
): Promise<ReadinessResult> {
  if (!vocabTerms.length) return { tier: "ready", score: 1 };

  const supabase = createClient();
  const accuracies = await computeTermAccuracies(studentId, supabase, vocabTerms);

  let total = 0;
  for (const term of vocabTerms) {
    const acc = accuracies.get(term);
    if (acc && acc.attempts > 0) total += acc.accuracy;
    // unseen term → 0 contribution
  }

  const score = total / vocabTerms.length;
  const tier: ReadinessTier =
    score >= 0.8 ? "ready" : score >= 0.5 ? "recommended" : "required";

  return { tier, score };
}

// ── Stakeout skill weights ─────────────────────────────────────────────────────

export interface SkillWeights {
  vocab:     number;  // proportion of vocab questions   (0–1, sums to 1 across all three)
  listening: number;  // proportion of listening questions
  grammar:   number;  // proportion of sentence-builder questions
}

/**
 * Derive per-student skill weights for the Vigilancia stakeout question generator.
 *
 * Logic: invert each skill score so weaker skills get more questions.
 * Falls back to equal weights when there is no data yet.
 */
export async function getSkillWeights(
  studentId: string,
  unitId: string,
  vocabTerms: string[]
): Promise<SkillWeights> {
  const supabase = createClient();

  const [masteryRes, attemptsRes] = await Promise.all([
    vocabTerms.length
      ? supabase.from("mastery").select("attempts, correct").eq("student_id", studentId).in("vocab_term", vocabTerms)
      : Promise.resolve({ data: [] }),
    supabase.from("attempts")
      .select("activity_type, score, max_score")
      .eq("student_id", studentId)
      .eq("unit_id", unitId)
      .in("activity_type", ["listening", "vocab_match", "grammar"]),
  ]);

  const masteryRows  = (masteryRes.data  ?? []) as Array<{ attempts: number; correct: number }>;
  const attemptRows  = (attemptsRes.data ?? []) as Array<{ activity_type: string; score: number; max_score: number }>;

  // Vocab score from mastery table
  const totalAttempts = masteryRows.reduce((s, r) => s + r.attempts, 0);
  const totalCorrect  = masteryRows.reduce((s, r) => s + r.correct,  0);
  const vocabScore    = totalAttempts > 0 ? totalCorrect / totalAttempts : 0.5;

  // Listening score from attempts
  const lisRows = attemptRows.filter((r) => r.activity_type === "listening" && r.max_score > 0);
  const lisScore = lisRows.length
    ? lisRows.reduce((s, r) => s + r.score / r.max_score, 0) / lisRows.length
    : 0.5;

  // Grammar / sentence score from vocab_match + grammar attempts
  const gramRows = attemptRows.filter((r) =>
    (r.activity_type === "vocab_match" || r.activity_type === "grammar") && r.max_score > 0
  );
  const gramScore = gramRows.length
    ? gramRows.reduce((s, r) => s + r.score / r.max_score, 0) / gramRows.length
    : 0.5;

  // Invert: weak skill → high weight
  const rawV = 1 - vocabScore;
  const rawL = 1 - lisScore;
  const rawG = 1 - gramScore;
  const total = rawV + rawL + rawG || 1;

  return {
    vocab:     rawV / total,
    listening: rawL / total,
    grammar:   rawG / total,
  };
}
