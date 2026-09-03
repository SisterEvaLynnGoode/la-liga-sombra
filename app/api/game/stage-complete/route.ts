import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ActivityType } from "@/lib/types/database";
import { cleanScore } from "@/lib/games/score-guard";

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { unitNumber, stageIndex, activityType, score, maxScore, timeSpentSeconds } =
    await request.json() as {
      unitNumber: number;
      stageIndex: number;
      activityType: ActivityType;
      score: number;
      maxScore: number;
      timeSpentSeconds: number;
    };

  if (unitNumber == null || stageIndex == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createClient();

  // Resolve unit DB id from number
  const { data: unitRows } = await supabase
    .from("units").select("id").eq("number", unitNumber).limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!unitId) return NextResponse.json({ error: "Unit not found" }, { status: 404 });

  // Update stage_index and set status = in_progress
  await supabase
    .from("unit_progress")
    .update({ stage_index: stageIndex + 1, status: "in_progress" })
    .eq("student_id", session.studentId)
    .eq("unit_id", unitId);

  // Record attempt
  if (activityType && score != null && maxScore != null) {
    const clean = cleanScore({ score, maxScore, timeSpentSeconds });
    if (!clean.ok) return NextResponse.json({ error: clean.reason }, { status: 400 });
    await supabase.from("attempts").insert({
      student_id: session.studentId,
      unit_id: unitId,
      activity_type: activityType,
      score: clean.value.score,
      max_score: clean.value.maxScore,
      time_spent_seconds: clean.value.timeSpentSeconds,
    });
  }

  return NextResponse.json({ ok: true });
}
