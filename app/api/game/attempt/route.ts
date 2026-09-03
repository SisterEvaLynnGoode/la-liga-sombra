import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { cleanScore } from "@/lib/games/score-guard";

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { unitId, activityType, score, maxScore, timeSpentSeconds } = await request.json();

  if (!unitId || !activityType || score == null || maxScore == null || timeSpentSeconds == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Everything below arrives from the student's own browser. Validate it.
  const clean = cleanScore({ score, maxScore, timeSpentSeconds });
  if (!clean.ok) return NextResponse.json({ error: clean.reason }, { status: 400 });

  const supabase = createClient();
  const { error } = await supabase.from("attempts").insert({
    student_id: session.studentId,
    unit_id: unitId,
    activity_type: activityType,
    score: clean.value.score,
    max_score: clean.value.maxScore,
    time_spent_seconds: clean.value.timeSpentSeconds,
  });

  if (error) {
    console.error("Attempt insert error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
