import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { checkAndAwardUnitBadges } from "@/lib/games/badges";

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

  const supabase = createClient();

  const { data: unitRows } = await supabase.from("units").select("id").eq("number", unitNumber).limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!unitId) return NextResponse.json({ error: "Unit not found" }, { status: 404 });

  // Record cold case attempt
  await supabase.from("attempts").insert({
    student_id: session.studentId,
    unit_id: unitId,
    activity_type: "lineup",
    score: score ?? 1,
    max_score: maxScore ?? 1,
    time_spent_seconds: timeSpentSeconds ?? 0,
  });

  // Update unit_progress cold case fields
  await supabase
    .from("unit_progress")
    .update({
      cold_case_completed_at: new Date().toISOString(),
      cold_case_score: score ?? 1,
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

  // Also check standard performance badges (perfect score, speed demon, etc.)
  const additionalBadges = await checkAndAwardUnitBadges(supabase, session.studentId, unitId);

  return NextResponse.json({ ok: true, newBadges: [...newBadges, ...additionalBadges] });
}
