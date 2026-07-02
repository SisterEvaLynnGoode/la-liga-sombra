/**
 * Unified student stats — the ONE authoritative definition of "dominado".
 *
 * Before this module, Casillero, Gimnasio, and Expediente each computed
 * "vocab dominado" with different thresholds (≥0.80/any attempts vs
 * ≥0.85/≥5 attempts), so the same account showed three different counts
 * (QA v11 P3). Every surface must now go through here.
 *
 * Definition: a term is mastered when its RECENCY-WEIGHTED accuracy is ≥ 0.8
 * with ≥ 3 lifetime attempts. Recency weighting uses the last 10 item_events
 * per term with an exponential half-life of 14 days, so a student who
 * struggled in August but nails a term in October reads as mastered — the
 * lifetime `mastery` counters remain only as a fallback when the event log
 * is thin (pre-instrumentation accounts).
 *
 * Server-side only (imports the server Supabase client type).
 */

import type { createClient } from "@/lib/supabase/server";

export const MASTERY_THRESHOLD = 0.8;
export const MASTERY_MIN_ATTEMPTS = 3;
export const RECENCY_HALF_LIFE_DAYS = 14;
export const RECENCY_SAMPLE_SIZE = 10;

type Supa = ReturnType<typeof createClient>;

export interface TermAccuracy {
  /** 0–1 accuracy; recency-weighted when events exist, lifetime otherwise. */
  accuracy: number;
  /** Lifetime attempt count (gates the ≥3-attempts mastery rule). */
  attempts: number;
  /** True when the accuracy came from recency-weighted item_events. */
  fromEvents: boolean;
}

/**
 * Exponentially-weighted accuracy over event samples (newest counts most).
 * Returns null when there are no samples.
 */
export function recencyWeightedAccuracy(
  samples: Array<{ correct: boolean; createdAt: string }>,
  halfLifeDays: number = RECENCY_HALF_LIFE_DAYS
): number | null {
  if (!samples.length) return null;
  const now = Date.now();
  let num = 0, den = 0;
  for (const s of samples) {
    const ageDays = Math.max(0, (now - new Date(s.createdAt).getTime()) / 86_400_000);
    const w = Math.pow(0.5, ageDays / halfLifeDays);
    den += w;
    if (s.correct) num += w;
  }
  return den > 0 ? num / den : null;
}

/** The single mastery rule. */
export function isMastered(acc: TermAccuracy): boolean {
  return acc.attempts >= MASTERY_MIN_ATTEMPTS && acc.accuracy >= MASTERY_THRESHOLD;
}

/**
 * Per-term accuracy map for one student: lifetime `mastery` rows blended with
 * the last RECENCY_SAMPLE_SIZE vocab item_events per term.
 */
export async function computeTermAccuracies(
  studentId: string,
  supabase: Supa,
  vocabTerms?: string[]
): Promise<Map<string, TermAccuracy>> {
  let masteryQuery = supabase
    .from("mastery")
    .select("vocab_term, attempts, correct")
    .eq("student_id", studentId);
  if (vocabTerms?.length) masteryQuery = masteryQuery.in("vocab_term", vocabTerms);

  let eventsQuery = supabase
    .from("item_events")
    .select("item_key, correct, created_at")
    .eq("student_id", studentId)
    .eq("skill", "vocab")
    .order("created_at", { ascending: false })
    .limit(1500);
  if (vocabTerms?.length) eventsQuery = eventsQuery.in("item_key", vocabTerms);

  const [masteryRes, eventsRes] = await Promise.all([masteryQuery, eventsQuery]);

  const out = new Map<string, TermAccuracy>();

  // Lifetime baseline
  for (const row of (masteryRes.data ?? []) as Array<{ vocab_term: string; attempts: number; correct: number }>) {
    if (row.attempts > 0) {
      out.set(row.vocab_term, {
        accuracy: row.correct / row.attempts,
        attempts: row.attempts,
        fromEvents: false,
      });
    }
  }

  // Recency override where events exist
  const samplesByTerm = new Map<string, Array<{ correct: boolean; createdAt: string }>>();
  for (const ev of (eventsRes.data ?? []) as Array<{ item_key: string; correct: boolean; created_at: string }>) {
    const arr = samplesByTerm.get(ev.item_key) ?? [];
    if (arr.length < RECENCY_SAMPLE_SIZE) {
      arr.push({ correct: ev.correct, createdAt: ev.created_at });
      samplesByTerm.set(ev.item_key, arr);
    }
  }
  samplesByTerm.forEach((samples, term) => {
    const acc = recencyWeightedAccuracy(samples);
    if (acc === null) return;
    const lifetime = out.get(term);
    out.set(term, {
      accuracy: acc,
      // attempts still counts lifetime volume (events are a subset of it)
      attempts: Math.max(lifetime?.attempts ?? 0, samples.length),
      fromEvents: true,
    });
  });

  return out;
}

export interface StudentStats {
  /** Terms meeting the authoritative mastery rule. */
  termsMastered: number;
  /** Terms with at least one attempt. */
  termsSeen: number;
}

/** The number every surface (Casillero, Gimnasio, Expediente) must display. */
export async function getStudentStats(studentId: string, supabase: Supa): Promise<StudentStats> {
  const acc = await computeTermAccuracies(studentId, supabase);
  let mastered = 0;
  acc.forEach((a) => { if (isMastered(a)) mastered++; });
  return { termsMastered: mastered, termsSeen: acc.size };
}
