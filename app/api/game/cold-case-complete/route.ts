import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { checkAndAwardUnitBadges } from "@/lib/games/badges";
import { cleanScore } from "@/lib/games/score-guard";

/**
 * POST /api/game/cold-case-complete
 *
 * Called when a student completes a Cold Case.
 * - Records cold_case_completed_at and cold_case_score on unit_progress
 * - Awards "detective_frio" badge (first time only)
 * - Awards standard unit badges (perfect_score, speed_demon, etc.)
 * - Does NOT unlock the next unit (cold cases are bonus content)
 */
export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { unitNumber, score, maxScore, timeSpentSeconds } =
    await request.json() as { unitNumber: number; score: number; maxScore: number; timeSpentSeconds: number };

  if (!unitNumber) return NextResponse.json({ error: "Missing unitNumber" }, { status: 400 });

  // The lineup result is computed in the browser, so it is not trusted.
  // Defaults mirror the previous behaviour for callers that omit the fields.
  const checked = cleanScore({ score: score ?? 1, maxScore: maxScore ?? 1, timeSpentSeconds: timeSpentSeconds ?? 0 });
  if (!checked.ok) return NextResponse.json({ error: checked.reason }, { status: 400 });
  const clean = checked.value;

  const supabase = createClient();

  const { data: unitRows } = await supabase.from("units").select("id").eq("number", unitNumber).limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!unitId) return NextResponse.json({ error: "Unit not found" }, { status: 404 });

  // Record cold case attempt
  await supabase.from("attempts").insert({
    student_id: session.studentId,
    unit_id: unitId,
    activity_type: "lineup",
    score: clean.score,
    max_score: clean.maxScore,
    time_spent_seconds: clean.timeSpentSeconds,
  });

  // Update unit_progress cold case fields
  await supabase
    .from("unit_progress")
    .update({
      cold_case_completed_at: new Date().toISOString(),
      cold_case_score: clean.score,
    })
    .eq("student_id", session.studentId)
    .eq("unit_id", unitId);

  // Award detective_frio badge (once per unit)
  const { data: existing } = await supabase
    .from("badges")
    .select("id")
    .eq("student_id", session.studentId)
    .eq("badge_type", "detective_frio")
    .eq("unit_id", unitId)
    .limit(1);

  const newBadges: string[] = [];

  if (!existing?.length) {
    await supabase.from("badges").insert({
      student_id: session.studentId,
      badge_type: "detective_frio",
      unit_id: unitId,
    });
    newBadges.push("detective_frio");
  }

  // cold_case_master (C3): all 10 cold cases completed
  const { data: coldRows } = await supabase
    .from("unit_progress")
    .select("unit_id, cold_case_completed_at")
    .eq("student_id", session.studentId)
    .not("cold_case_completed_at", "is", null);
  if ((coldRows?.length ?? 0) >= 10) {
    const { data: masterBadge } = await supabase
      .from("badges").select("id")
      .eq("student_id", session.studentId).eq("badge_type", "cold_case_master").limit(1);
    if (!masterBadge?.length) {
      await supabase.from("badges").insert({ student_id: session.studentId, badge_type: "cold_case_master" });
      newBadges.push("cold_case_master");
    }
  }

  // Also check standard performance badges (perfect score, speed demon, etc.)
  const additionalBadges = await checkAndAwardUnitBadges(supabase, session.studentId, unitId);

  return NextResponse.json({ ok: true, newBadges: [...newBadges, ...additionalBadges] });
}
