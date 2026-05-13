import type { BadgeType } from "@/lib/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface BadgeMeta {
  type: BadgeType;
  label: string;
  description: string;
  emoji: string;
  color: string; // Tailwind color token for the badge
}

export const BADGE_META: Record<string, BadgeMeta> = {
  unit_completed: { type: "unit_completed", label: "Caso Resuelto",   description: "Solved a unit case",                    emoji: "🔎", color: "#c9933a" },
  case_solved:    { type: "case_solved",    label: "Caso Resuelto",   description: "Solved a case",                         emoji: "🔎", color: "#c9933a" },
  perfect_score:  { type: "perfect_score",  label: "Puntaje Perfecto",description: "Every activity in a unit scored 100%",   emoji: "⭐", color: "#fbbf24" },
  speed_demon:    { type: "speed_demon",    label: "Velocidad Rayo",  description: "Completed a unit in under 20 minutes",   emoji: "⚡", color: "#60a5fa" },
  vocab_master:   { type: "vocab_master",   label: "Maestro de Vocab",description: "90%+ average mastery across all vocab",  emoji: "📚", color: "#4ade80" },
  streak_3:       { type: "streak_3",       label: "Racha de 3 Días", description: "Played 3 days in a row",                emoji: "🔥", color: "#fb923c" },
  streak_7:       { type: "streak_7",       label: "Racha de 7 Días", description: "Played 7 days in a row",                emoji: "🔥", color: "#ef4444" },
  speed_run:      { type: "speed_run",      label: "Carrera Rápida",  description: "Fast completion",                       emoji: "⚡", color: "#60a5fa" },
  cultural_expert:{ type: "cultural_expert",label: "Experto Cultural", description: "Cultural knowledge master",             emoji: "🌎", color: "#a78bfa" },
  first_case:     { type: "first_case",     label: "Primer Caso",     description: "Solved your first case",                emoji: "🕵️", color: "#c9933a" },
};

// ── Badge awarding ─────────────────────────────────────────────────────────────

async function awardIfNew(
  supabase: SupabaseClient,
  studentId: string,
  unitId: string | null,
  badgeType: BadgeType
): Promise<boolean> {
  let query = supabase
    .from("badges")
    .select("id")
    .eq("student_id", studentId)
    .eq("badge_type", badgeType)
    .limit(1);

  if (unitId) query = query.eq("unit_id", unitId);
  else query = query.is("unit_id", null);

  const { data } = await query;
  if (data && data.length > 0) return false;

  await supabase.from("badges").insert({
    student_id: studentId,
    badge_type: badgeType,
    unit_id: unitId ?? null,
  });
  return true;
}

export function computeCurrentStreak(timestamps: string[]): number {
  const days = Array.from(new Set(timestamps.map((t) => t.slice(0, 10)))).sort().reverse();
  if (!days.length) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / 86_400_000;
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}

export async function checkAndAwardUnitBadges(
  supabase: SupabaseClient,
  studentId: string,
  unitId: string
): Promise<BadgeType[]> {
  const earned: BadgeType[] = [];

  // unit_completed (passport stamp)
  if (await awardIfNew(supabase, studentId, unitId, "unit_completed")) earned.push("unit_completed");

  // first_case: no previously completed units (this is their first)
  const { data: prev } = await supabase
    .from("badges").select("id").eq("student_id", studentId).eq("badge_type", "unit_completed").limit(2);
  if ((prev?.length ?? 0) === 1) {
    if (await awardIfNew(supabase, studentId, null, "first_case")) earned.push("first_case");
  }

  // Fetch this unit's attempts
  const { data: unitAttempts } = await supabase
    .from("attempts")
    .select("score, max_score, time_spent_seconds")
    .eq("student_id", studentId)
    .eq("unit_id", unitId);

  const attempts = (unitAttempts as Array<{ score: number; max_score: number; time_spent_seconds: number }>) ?? [];
  const scored = attempts.filter((a) => a.max_score > 0);

  // perfect_score: every scored activity was 100%
  if (scored.length > 0 && scored.every((a) => a.score === a.max_score)) {
    if (await awardIfNew(supabase, studentId, unitId, "perfect_score")) earned.push("perfect_score");
  }

  // speed_demon: total time < 20 min
  const totalTime = attempts.reduce((s, a) => s + a.time_spent_seconds, 0);
  if (totalTime > 0 && totalTime < 1200) {
    if (await awardIfNew(supabase, studentId, unitId, "speed_demon")) earned.push("speed_demon");
  }

  // vocab_master: avg mastery across all recorded terms >= 90%
  const { data: mastery } = await supabase
    .from("mastery")
    .select("attempts, correct")
    .eq("student_id", studentId);

  const masteryRows = (mastery as Array<{ attempts: number; correct: number }>) ?? [];
  if (masteryRows.length >= 5) {
    const totalA = masteryRows.reduce((s, m) => s + m.attempts, 0);
    const totalC = masteryRows.reduce((s, m) => s + m.correct, 0);
    if (totalA > 0 && totalC / totalA >= 0.9) {
      if (await awardIfNew(supabase, studentId, null, "vocab_master")) earned.push("vocab_master");
    }
  }

  // Streaks
  const { data: allAttempts } = await supabase
    .from("attempts")
    .select("completed_at")
    .eq("student_id", studentId)
    .order("completed_at", { ascending: false });

  const streak = computeCurrentStreak(
    ((allAttempts as Array<{ completed_at: string }>) ?? []).map((a) => a.completed_at)
  );
  if (streak >= 3 && (await awardIfNew(supabase, studentId, null, "streak_3"))) earned.push("streak_3");
  if (streak >= 7 && (await awardIfNew(supabase, studentId, null, "streak_7"))) earned.push("streak_7");

  return earned;
}
