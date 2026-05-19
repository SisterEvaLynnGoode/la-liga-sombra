import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { briefingStreak } from "@/lib/spaced-repetition";
import type { BadgeType } from "@/lib/types/database";

/**
 * POST /api/briefing/complete
 *
 * Records the result of a daily briefing session.
 * - Upserts mastery rows for each answered term
 * - Inserts a daily_briefings record
 * - Checks for badge eligibility (informe_completo, estudiante_disciplinado, agente_elite)
 *
 * Body: {
 *   termsAnswered: Array<{ spanish: string; correct: boolean }>;
 *   skipped: boolean;
 *   timeSeconds: number;
 * }
 */
export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    termsAnswered: Array<{ spanish: string; correct: boolean }>;
    skipped: boolean;
    timeSeconds: number;
  };

  const { termsAnswered, skipped, timeSeconds } = body;
  const todayUtc = new Date().toISOString().slice(0, 10);
  const supabase = createClient();

  const termsShown    = termsAnswered.map((t) => t.spanish);
  const termsCorrect  = termsAnswered.filter((t) => t.correct).length;
  const completed     = !skipped && termsAnswered.length >= 3;

  // 1. Insert daily_briefings record (ignore conflict — edge case protection)
  await supabase.from("daily_briefings").upsert({
    student_id:        session.studentId,
    briefing_date:     todayUtc,
    terms_shown:       termsShown,
    terms_correct:     termsCorrect,
    completed,
    skipped,
    time_spent_seconds: timeSeconds ?? 0,
  }, { onConflict: "student_id,briefing_date", ignoreDuplicates: false });

  // 2. Update mastery for each term (increment attempts + correct)
  for (const t of termsAnswered) {
    // Fetch existing mastery row
    const { data: existing } = await supabase
      .from("mastery")
      .select("id, attempts, correct")
      .eq("student_id", session.studentId)
      .eq("vocab_term", t.spanish)
      .limit(1);

    const row = (existing ?? []) as Array<{ id: string; attempts: number; correct: number }>;
    if (row.length) {
      await supabase.from("mastery").update({
        attempts:  row[0].attempts + 1,
        correct:   row[0].correct + (t.correct ? 1 : 0),
        last_seen: new Date().toISOString(),
      }).eq("id", row[0].id);
    } else {
      await supabase.from("mastery").insert({
        student_id: session.studentId,
        vocab_term: t.spanish,
        attempts:   1,
        correct:    t.correct ? 1 : 0,
        last_seen:  new Date().toISOString(),
      });
    }
  }

  // 3. Record points as attempts entry (10 pts per correct answer)
  if (termsCorrect > 0) {
    // Need any unit_id as FK — use first unlocked unit
    const { data: firstUnit } = await supabase
      .from("unit_progress")
      .select("unit_id")
      .eq("student_id", session.studentId)
      .neq("status", "locked")
      .limit(1);
    const unitId = (firstUnit as Array<{ unit_id: string }> | null)?.[0]?.unit_id;
    if (unitId) {
      await supabase.from("attempts").insert({
        student_id:         session.studentId,
        unit_id:            unitId,
        activity_type:      "daily_briefing",
        score:              termsCorrect * 10,
        max_score:          30,
        time_spent_seconds: timeSeconds ?? 0,
      });
    }
  }

  // ── Badge checks ─────────────────────────────────────────────────────────────

  const newBadges: BadgeType[] = [];

  const { data: existingBadges } = await supabase
    .from("badges")
    .select("badge_type, earned_at")
    .eq("student_id", session.studentId);

  const earned = (existingBadges ?? []) as Array<{ badge_type: string; earned_at: string }>;
  const hasBadge = (type: string) => earned.some((b) => b.badge_type === type);

  // Need first unit for badge FK
  const { data: firstUnitRow } = await supabase
    .from("unit_progress").select("unit_id").eq("student_id", session.studentId).neq("status", "locked").limit(1);
  const firstUnitId = (firstUnitRow as Array<{ unit_id: string }> | null)?.[0]?.unit_id;

  async function award(type: BadgeType) {
    if (!firstUnitId) return;
    await supabase.from("badges").insert({ student_id: session!.studentId, badge_type: type, unit_id: firstUnitId });
    newBadges.push(type);
  }

  // informe_completo — awarded every time all 3 are completed (no dedup)
  if (completed) await award("informe_completo");

  // Streak badges — require completed=true streak
  if (!hasBadge("agente_elite") || !hasBadge("estudiante_disciplinado")) {
    const { data: briefingRows } = await supabase
      .from("daily_briefings")
      .select("briefing_date")
      .eq("student_id", session.studentId)
      .eq("completed", true)
      .order("briefing_date", { ascending: false })
      .limit(31);

    const dates = (briefingRows ?? []).map((r: { briefing_date: string }) => r.briefing_date);
    const streak = briefingStreak(dates);

    if (streak >= 30 && !hasBadge("agente_elite")) await award("agente_elite");
    else if (streak >= 5  && !hasBadge("estudiante_disciplinado")) await award("estudiante_disciplinado");
  }

  return NextResponse.json({ ok: true, newBadges, completed, termsCorrect });
}
