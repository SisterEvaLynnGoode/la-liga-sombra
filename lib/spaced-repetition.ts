/**
 * Spaced repetition — server-side only.
 *
 * Implements a simplified Leitner-style interval scheduling:
 *   accuracy ≥ 90%  →  review every 14 days
 *   accuracy 70-89% →  review every  5 days
 *   accuracy 50-69% →  review every  2 days
 *   accuracy  < 50% →  review every  1 day (daily)
 *
 * "Overdue score" = daysSinceLastSeen / intervalDays.
 * Higher score = more overdue = higher review priority.
 */

import { createClient } from "@/lib/supabase/server";
import { shuffle } from "@/lib/games/utils";

// ── Intervals ─────────────────────────────────────────────────────────────────

export function intervalDays(accuracy: number): number {
  if (accuracy >= 0.9) return 14;
  if (accuracy >= 0.7) return  5;
  if (accuracy >= 0.5) return  2;
  return 1;
}

export function overdueScore(accuracy: number, lastSeenIso: string): number {
  const daysSince = (Date.now() - new Date(lastSeenIso).getTime()) / 86_400_000;
  return daysSince / intervalDays(accuracy);
}

// ── BriefingTerm ──────────────────────────────────────────────────────────────

export interface BriefingTerm {
  spanish:      string;
  english:      string;
  audio?:       string;
  unitNumber:   number;
  accuracy:     number;   // 0–1
  overdueScore: number;   // higher = more overdue
  options:      string[]; // 4 English MC options (correct included)
  correctIndex: number;
}

// ── Unit content loader (server-side) ─────────────────────────────────────────

function loadUnitVocab(n: number): Array<{ spanish: string; english: string; audio?: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const u = require(`@/content/unit-0${n}.json`) as { vocab: Array<{ spanish: string; english: string; audio?: string }> };
    return u.vocab;
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const u = require(`@/content/unit-${n}.json`) as { vocab: Array<{ spanish: string; english: string; audio?: string }> };
      return u.vocab;
    } catch {
      return [];
    }
  }
}

// ── Main export ────────────────────────────────────────────────────────────────

/**
 * Returns up to 3 BriefingTerms for a student's daily briefing, or [] if
 * no briefing should be shown (too few terms, already had briefing today, etc.)
 */
export async function getOverdueTermsForBriefing(
  studentId: string,
  supabase: ReturnType<typeof createClient>
): Promise<BriefingTerm[]> {

  const cutoff18h = new Date(Date.now() - 18 * 3_600_000).toISOString();

  // 1. Has student already had a briefing today / within 18 hours?
  const { data: recentBriefings } = await supabase
    .from("daily_briefings")
    .select("briefing_date, created_at")
    .eq("student_id", studentId)
    .gte("created_at", cutoff18h)
    .limit(1);

  if (recentBriefings?.length) return []; // already briefed recently

  // 2. Does student have ≥5 mastery terms?
  const { data: masteryRows } = await supabase
    .from("mastery")
    .select("vocab_term, attempts, correct, last_seen")
    .eq("student_id", studentId);

  const mastery = (masteryRows ?? []) as Array<{
    vocab_term: string; attempts: number; correct: number; last_seen: string;
  }>;

  if (mastery.length < 5) return []; // brand-new student

  // 3. Get unlocked unit numbers
  const { data: progressRows } = await supabase
    .from("unit_progress")
    .select("unit_id")
    .eq("student_id", studentId)
    .neq("status", "locked");

  const unlockedUnitIds = (progressRows ?? []).map((r: { unit_id: string }) => r.unit_id);
  if (!unlockedUnitIds.length) return [];

  const { data: unitRows } = await supabase
    .from("units")
    .select("id, number")
    .in("id", unlockedUnitIds)
    .order("number");

  const unlockedNums = (unitRows ?? []).map((r: { number: number }) => r.number);

  // 4. Build vocab map: term → { english, audio, unitNumber }
  const vocabMap = new Map<string, { english: string; audio?: string; unitNumber: number }>();
  const allEnglish: string[] = [];

  for (const num of unlockedNums) {
    for (const v of loadUnitVocab(num)) {
      if (!vocabMap.has(v.spanish)) {
        vocabMap.set(v.spanish, { english: v.english, audio: v.audio, unitNumber: num });
        allEnglish.push(v.english);
      }
    }
  }

  // 5. Find overdue terms
  const overdue: BriefingTerm[] = [];

  for (const row of mastery) {
    if (!row.attempts || !row.last_seen) continue;
    const meta = vocabMap.get(row.vocab_term);
    if (!meta) continue; // term not in unlocked units

    const acc  = row.correct / row.attempts;
    const score = overdueScore(acc, row.last_seen);
    if (score < 1) continue; // not yet due

    // Build 4-option MC
    const distractors = shuffle(
      allEnglish.filter((e) => e.toLowerCase() !== meta.english.toLowerCase())
    ).slice(0, 3);

    if (distractors.length < 3) continue;

    const opts = shuffle([meta.english, ...distractors]);
    overdue.push({
      spanish:      row.vocab_term,
      english:      meta.english,
      audio:        meta.audio,
      unitNumber:   meta.unitNumber,
      accuracy:     Math.round(acc * 100) / 100,
      overdueScore: score,
      options:      opts,
      correctIndex: opts.indexOf(meta.english),
    });
  }

  // 6. Return top 3 most overdue
  return overdue
    .sort((a, b) => b.overdueScore - a.overdueScore)
    .slice(0, 3);
}

// ── Streak helper ─────────────────────────────────────────────────────────────

/** Count consecutive days of completed briefings ending today. */
export function briefingStreak(completedDates: string[]): number {
  const unique = Array.from(new Set(completedDates)).sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  let check = today;
  for (const d of unique) {
    if (d === check) {
      streak++;
      const dt = new Date(check);
      dt.setUTCDate(dt.getUTCDate() - 1);
      check = dt.toISOString().slice(0, 10);
    } else if (d < check) break;
  }
  return streak;
}

// ── Interleaved case review (Workstream B1) ───────────────────────────────────

export interface ReviewTermResult {
  spanish: string;
  english: string;
  unitNumber: number;
  overdueScore: number;
}

/**
 * Prior-unit terms most due for review, for interleaving into a NEW unit's
 * Vigilancia deck ("Expediente antiguo" items). Unlike the daily briefing this
 * has no once-per-day gate and no 3-term cap — the stakeout generator decides
 * how many to use. Only terms the student has actually practiced are eligible.
 */
export async function getOverdueReviewTerms(
  studentId: string,
  supabase: ReturnType<typeof createClient>,
  beforeUnitNumber: number,
  limit = 6
): Promise<ReviewTermResult[]> {
  if (beforeUnitNumber <= 1) return [];

  const { data: masteryRows } = await supabase
    .from("mastery")
    .select("vocab_term, attempts, correct, last_seen")
    .eq("student_id", studentId);

  const mastery = (masteryRows ?? []) as Array<{
    vocab_term: string; attempts: number; correct: number; last_seen: string;
  }>;
  if (!mastery.length) return [];

  // Vocab from all PRIOR units only
  const vocabMap = new Map<string, { english: string; unitNumber: number }>();
  for (let n = 1; n < beforeUnitNumber; n++) {
    for (const v of loadUnitVocab(n)) {
      if (!vocabMap.has(v.spanish)) vocabMap.set(v.spanish, { english: v.english, unitNumber: n });
    }
  }
  if (!vocabMap.size) return [];

  const due: ReviewTermResult[] = [];
  for (const row of mastery) {
    if (!row.attempts || !row.last_seen) continue;
    const meta = vocabMap.get(row.vocab_term);
    if (!meta) continue;
    const acc = row.correct / row.attempts;
    const score = overdueScore(acc, row.last_seen);
    if (score < 0.5) continue; // fresh enough — don't recycle yet
    due.push({ spanish: row.vocab_term, english: meta.english, unitNumber: meta.unitNumber, overdueScore: score });
  }

  return due.sort((a, b) => b.overdueScore - a.overdueScore).slice(0, limit);
}
