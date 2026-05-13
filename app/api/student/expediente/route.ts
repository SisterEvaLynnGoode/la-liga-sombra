import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { computeCurrentStreak } from "@/lib/games/badges";

export async function GET() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient();
  const { studentId, classId } = session;

  const { data: classRows } = await supabase.from("classes").select("class_code, period_name").eq("id", classId).limit(1);
  const cls = (classRows as Array<{ class_code: string; period_name: string }> | null)?.[0];

  const [badgesRes, attemptsRes, masteryRes, progressRes] = await Promise.all([
    supabase.from("badges").select("badge_type, unit_id, earned_at").eq("student_id", studentId).order("earned_at"),
    supabase.from("attempts").select("time_spent_seconds, completed_at").eq("student_id", studentId),
    supabase.from("mastery").select("attempts, correct").eq("student_id", studentId),
    supabase.from("unit_progress").select("unit_id, case_solved").eq("student_id", studentId),
  ]);

  const badges = (badgesRes.data ?? []) as Array<{ badge_type: string; unit_id: string | null; earned_at: string }>;
  const attempts = (attemptsRes.data ?? []) as Array<{ time_spent_seconds: number; completed_at: string }>;
  const mastery = (masteryRes.data ?? []) as Array<{ attempts: number; correct: number }>;
  const progress = (progressRes.data ?? []) as Array<{ unit_id: string; case_solved: boolean }>;

  const casesSolved = progress.filter((p) => p.case_solved).length;
  const totalTimeSeconds = attempts.reduce((s, a) => s + a.time_spent_seconds, 0);
  const masteryTerms = mastery.filter((m) => m.attempts > 0 && m.correct / m.attempts >= 0.8).length;
  const streak = computeCurrentStreak(attempts.map((a) => a.completed_at));

  return NextResponse.json({
    displayName: session.displayName,
    classCode: cls?.class_code ?? "",
    periodName: cls?.period_name ?? "",
    stats: { casesSolved, totalTimeSeconds, masteryTermsMastered: masteryTerms, currentStreak: streak },
    badges,
  });
}
