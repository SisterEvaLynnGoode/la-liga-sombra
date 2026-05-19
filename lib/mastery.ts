// Server-side mastery helpers — only import from Server Components / Route Handlers.
import { createClient } from "@/lib/supabase/server";

export type ReadinessTier = "ready" | "recommended" | "required";

export interface ReadinessResult {
  tier: ReadinessTier;
  score: number; // 0–1, class-average correct/attempts across the given vocab terms
}

/**
 * Compute a student's readiness score for a set of vocab terms.
 *
 * score = avg(correct / attempts) per known term.
 * Unknown terms (no mastery row yet) count as 0.
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
  const { data } = await supabase
    .from("mastery")
    .select("vocab_term, attempts, correct")
    .eq("student_id", studentId)
    .in("vocab_term", vocabTerms);

  const rows = (data ?? []) as Array<{ vocab_term: string; attempts: number; correct: number }>;

  let total = 0;
  for (const term of vocabTerms) {
    const row = rows.find((r) => r.vocab_term === term);
    if (row && row.attempts > 0) {
      total += row.correct / row.attempts;
    }
    // unseen term → 0 contribution
  }

  const score = total / vocabTerms.length;
  const tier: ReadinessTier =
    score >= 0.8 ? "ready" : score >= 0.5 ? "recommended" : "required";

  return { tier, score };
}
