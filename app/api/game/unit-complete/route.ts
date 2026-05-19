import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { checkAndAwardUnitBadges } from "@/lib/games/badges";

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { unitNumber, score, maxScore, timeSpentSeconds } =
    await request.json() as { unitNumber: number; score: number; maxScore: number; timeSpentSeconds: number };

  if (!unitNumber) return NextResponse.json({ error: "Missing unitNumber" }, { status: 400 });

  const supabase = createClient();

  const { data: unitRows } = await supabase.from("units").select("id").eq("number", unitNumber).limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!unitId) return NextResponse.json({ error: "Unit not found" }, { status: 404 });

  // Record lineup attempt
  await supabase.from("attempts").insert({
    student_id: session.studentId,
    unit_id: unitId,
    activity_type: "lineup",
    score: score ?? 1,
    max_score: maxScore ?? 1,
    time_spent_seconds: timeSpentSeconds ?? 0,
  });

  // Mark unit completed
  await supabase
    .from("unit_progress")
    .update({ status: "completed", case_solved: true, criminal_caught: true, completed_at: new Date().toISOString() })
    .eq("student_id", session.studentId)
    .eq("unit_id", unitId);

  // Boss-gated units: instead of auto-unlocking the next unit, create a boss_progress
  // entry. The next unit only unlocks after the boss is completed or skipped.
  const BOSS_AFTER_UNIT: Record<number, string> = {
    5: "unit-5-eclipse",
  };

  const bossId = BOSS_AFTER_UNIT[unitNumber];
  if (bossId) {
    // Create boss_progress entry (idempotent — ignore if already exists)
    await supabase.from("boss_progress").upsert({
      primary_student_id: session.studentId,
      boss_id: bossId,
      current_stage: 0,
      started_at: new Date().toISOString(),
      last_saved_at: new Date().toISOString(),
    }, { onConflict: "primary_student_id,boss_id", ignoreDuplicates: true });
  } else {
    // Normal flow: unlock next unit
    const { data: nextUnitRows } = await supabase.from("units").select("id").eq("number", unitNumber + 1).limit(1);
    const nextUnitId = (nextUnitRows as Array<{ id: string }> | null)?.[0]?.id;
    if (nextUnitId) {
      await supabase.from("unit_progress")
        .update({ status: "available" })
        .eq("student_id", session.studentId)
        .eq("unit_id", nextUnitId)
        .eq("status", "locked");
    }
  }

  // Check and award all applicable badges (unit_completed, perfect_score, speed_demon, vocab_master, streaks)
  const newBadges = await checkAndAwardUnitBadges(supabase, session.studentId, unitId);

  return NextResponse.json({ ok: true, newBadges });
}
