/**
 * ACTFL mastery grading (Phase 1).
 *
 * Turns the game's continuous progress data into a defensible standards-based
 * grade: an ACTFL proficiency BAND per student, overall and per skill. Because
 * vocab mastery is recency-weighted (lib/stats), a student who replays and
 * improves automatically climbs — "retry for mastery" is built in.
 *
 * Bands (index): 0 Novice Low · 1 Novice Mid · 2 Novice High · 3 Intermediate Low.
 * The band is breadth-gated: you can't reach Intermediate Low on two cases —
 * proficiency reflects demonstrated RANGE, per ACTFL.
 *
 * Server-side only.
 */

import type { createClient } from "@/lib/supabase/server";
import { computeTermAccuracies, recencyWeightedAccuracy, RECENCY_SAMPLE_SIZE } from "@/lib/stats";

type Supa = ReturnType<typeof createClient>;

export const BANDS = ["Novice Low", "Novice Mid", "Novice High", "Intermediate Low"] as const;
export type Band = (typeof BANDS)[number];

/** A 0–1 sub-score mapped to a band index by fixed thresholds. */
export function scoreToBandIndex(score: number): number {
  if (score >= 0.78) return 3;
  if (score >= 0.55) return 2;
  if (score >= 0.30) return 1;
  return 0;
}

export interface SkillGrade {
  score: number;   // 0–1
  band: Band;
  bandIndex: number;
}

export interface StudentGrade {
  studentId: string;
  score: number;        // composite 0–1
  band: Band;
  bandIndex: number;
  casesSolved: number;
  skills: {
    vocab: SkillGrade;
    grammar: SkillGrade;
    communication: SkillGrade;
  };
}

function skill(score: number): SkillGrade {
  const bandIndex = scoreToBandIndex(score);
  return { score, band: BANDS[bandIndex], bandIndex };
}

// Composite weights — vocab and grammar carry the most signal.
const W = { vocab: 0.35, grammar: 0.25, communication: 0.25, breadth: 0.15 };

/**
 * Pure grade from the four 0–1 sub-scores + solved-case count.
 * Breadth-gates the band: Intermediate Low needs ≥6 cases, Novice High ≥3.
 */
export function gradeFromScores(
  studentId: string,
  vocab: number,
  grammar: number,
  communication: number,
  casesSolved: number
): StudentGrade {
  const breadthFrac = Math.min(1, casesSolved / 10);
  const score = W.vocab * vocab + W.grammar * grammar + W.communication * communication + W.breadth * breadthFrac;
  const cap = casesSolved >= 6 ? 3 : casesSolved >= 3 ? 2 : 1;
  const bandIndex = Math.min(scoreToBandIndex(score), cap);
  return {
    studentId, score, band: BANDS[bandIndex], bandIndex, casesSolved,
    skills: { vocab: skill(vocab), grammar: skill(grammar), communication: skill(communication) },
  };
}

/**
 * Compute one student's full grade. Batches the reads so a class-wide
 * recompute stays reasonable.
 */
export async function computeStudentGrade(studentId: string, supabase: Supa): Promise<StudentGrade> {
  const [termAcc, conceptRes, attemptsRes, progressRes] = await Promise.all([
    computeTermAccuracies(studentId, supabase),
    supabase.from("concept_mastery").select("attempts, correct").eq("student_id", studentId),
    supabase.from("attempts").select("score, max_score").eq("student_id", studentId),
    supabase.from("unit_progress").select("case_solved").eq("student_id", studentId),
  ]);

  // Vocab — mean recency-weighted accuracy across seen terms
  let vSum = 0, vN = 0;
  termAcc.forEach((a) => { if (a.attempts > 0) { vSum += a.accuracy; vN++; } });
  const vocab = vN ? vSum / vN : 0;

  // Grammar — mean accuracy across practiced concepts
  const concepts = (conceptRes.data ?? []) as Array<{ attempts: number; correct: number }>;
  let gSum = 0, gN = 0;
  for (const c of concepts) if (c.attempts > 0) { gSum += c.correct / c.attempts; gN++; }
  const grammar = gN ? gSum / gN : 0;

  // Communication — mean accuracy across all graded activities (interpretive,
  // interpersonal, presentational all land in `attempts`)
  const attempts = (attemptsRes.data ?? []) as Array<{ score: number; max_score: number }>;
  let cSum = 0, cN = 0;
  for (const a of attempts) if (a.max_score > 0) { cSum += a.score / a.max_score; cN++; }
  const communication = cN ? cSum / cN : 0;

  const casesSolved = ((progressRes.data ?? []) as Array<{ case_solved: boolean }>)
    .filter((p) => p.case_solved).length;

  return gradeFromScores(studentId, vocab, grammar, communication, casesSolved);
}

/**
 * Class-wide grades in a handful of batched queries (not 4× per student) —
 * for the Grades dashboard tab. Recency-weights vocab from item_events, same
 * as the single-student path.
 */
export async function computeClassGrades(studentIds: string[], supabase: Supa): Promise<Map<string, StudentGrade>> {
  const out = new Map<string, StudentGrade>();
  if (!studentIds.length) return out;

  const [masteryRes, eventsRes, conceptRes, attemptsRes, progressRes] = await Promise.all([
    supabase.from("mastery").select("student_id, vocab_term, attempts, correct").in("student_id", studentIds),
    supabase.from("item_events").select("student_id, item_key, correct, created_at").eq("skill", "vocab").in("student_id", studentIds).order("created_at", { ascending: false }).limit(8000),
    supabase.from("concept_mastery").select("student_id, attempts, correct").in("student_id", studentIds),
    supabase.from("attempts").select("student_id, score, max_score").in("student_id", studentIds),
    supabase.from("unit_progress").select("student_id, case_solved").in("student_id", studentIds),
  ]);

  // Group everything by student
  type Acc = { termLifetime: Map<string, { attempts: number; correct: number }>; termSamples: Map<string, Array<{ correct: boolean; createdAt: string }>>; gAtt: number; gCor: number; cAcc: number; cN: number; cases: number };
  const acc = new Map<string, Acc>();
  const g = (id: string): Acc => {
    let a = acc.get(id);
    if (!a) { a = { termLifetime: new Map(), termSamples: new Map(), gAtt: 0, gCor: 0, cAcc: 0, cN: 0, cases: 0 }; acc.set(id, a); }
    return a;
  };

  for (const m of (masteryRes.data ?? []) as Array<{ student_id: string; vocab_term: string; attempts: number; correct: number }>) {
    if (m.attempts > 0) g(m.student_id).termLifetime.set(m.vocab_term, { attempts: m.attempts, correct: m.correct });
  }
  for (const e of (eventsRes.data ?? []) as Array<{ student_id: string; item_key: string; correct: boolean; created_at: string }>) {
    const arr = g(e.student_id).termSamples.get(e.item_key) ?? [];
    if (arr.length < RECENCY_SAMPLE_SIZE) { arr.push({ correct: e.correct, createdAt: e.created_at }); g(e.student_id).termSamples.set(e.item_key, arr); }
  }
  for (const c of (conceptRes.data ?? []) as Array<{ student_id: string; attempts: number; correct: number }>) {
    if (c.attempts > 0) { const a = g(c.student_id); a.gAtt += c.attempts; a.gCor += c.correct; }
  }
  for (const at of (attemptsRes.data ?? []) as Array<{ student_id: string; score: number; max_score: number }>) {
    if (at.max_score > 0) { const a = g(at.student_id); a.cAcc += at.score / at.max_score; a.cN++; }
  }
  for (const p of (progressRes.data ?? []) as Array<{ student_id: string; case_solved: boolean }>) {
    if (p.case_solved) g(p.student_id).cases++;
  }

  for (const id of studentIds) {
    const a = acc.get(id);
    if (!a) { out.set(id, gradeFromScores(id, 0, 0, 0, 0)); continue; }
    // Vocab: recency-weighted per term (event samples), lifetime fallback
    const terms = new Set([...Array.from(a.termLifetime.keys()), ...Array.from(a.termSamples.keys())]);
    let vSum = 0, vN = 0;
    terms.forEach((t) => {
      const samples = a.termSamples.get(t);
      const rec = samples && samples.length ? recencyWeightedAccuracy(samples) : null;
      const life = a.termLifetime.get(t);
      const val = rec ?? (life && life.attempts > 0 ? life.correct / life.attempts : null);
      if (val !== null) { vSum += val; vN++; }
    });
    const vocab = vN ? vSum / vN : 0;
    const grammar = a.gAtt ? a.gCor / a.gAtt : 0;
    const communication = a.cN ? a.cAcc / a.cN : 0;
    out.set(id, gradeFromScores(id, vocab, grammar, communication, a.cases));
  }
  return out;
}

/**
 * Recompute a student's overall band, persist the snapshot, and — if the band
 * ROSE — drop a `mastery_up` flag in the teacher inbox. Called after a case is
 * completed. Returns the new grade (or null on any failure; never throws into
 * gameplay).
 */
export async function recomputeAndNotify(studentId: string, supabase: Supa): Promise<StudentGrade | null> {
  try {
    const grade = await computeStudentGrade(studentId, supabase);

    const { data: prevRows } = await supabase
      .from("student_mastery")
      .select("band_index")
      .eq("student_id", studentId)
      .limit(1);
    const prevIndex = (prevRows as Array<{ band_index: number }> | null)?.[0]?.band_index ?? -1;

    // Upsert the snapshot
    await supabase.from("student_mastery").upsert(
      { student_id: studentId, band_index: grade.bandIndex, band: grade.band, score: grade.score, updated_at: new Date().toISOString() },
      { onConflict: "student_id" }
    );

    // Level-up → notify (only real rises, not first-ever compute from -1→0)
    if (prevIndex >= 0 && grade.bandIndex > prevIndex) {
      await supabase.from("student_flags").insert({
        student_id: studentId,
        flag_type: "mastery_up",
        context: { from: BANDS[prevIndex], to: grade.band, skill: "overall" },
      });
    }

    return grade;
  } catch (e) {
    console.error("recomputeAndNotify error:", e);
    return null;
  }
}
