import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = request.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "Missing classId" }, { status: 400 });

  const supabase = createClient();
  const { data: studentsData } = await supabase
    .from("students").select("id, display_name, created_at").eq("class_id", classId);
  const students = (studentsData ?? []) as Array<{ id: string; display_name: string; created_at: string }>;

  if (!students.length) return NextResponse.json({ students: [] });

  const ids = students.map((s) => s.id);
  const [progressRes, attemptsRes, masteryRes, badgesRes, academiaRes] = await Promise.all([
    supabase.from("unit_progress").select("student_id, status").in("student_id", ids),
    supabase.from("attempts").select("student_id, time_spent_seconds, completed_at").in("student_id", ids),
    supabase.from("mastery").select("student_id, attempts, correct").in("student_id", ids),
    supabase.from("badges").select("student_id, id").in("student_id", ids),
    supabase.from("academia_sessions").select("student_id, retry_count").in("student_id", ids),
  ]);

  const progress = (progressRes.data ?? []) as Array<{ student_id: string; status: string }>;
  const attempts = (attemptsRes.data ?? []) as Array<{ student_id: string; time_spent_seconds: number; completed_at: string }>;
  const mastery = (masteryRes.data ?? []) as Array<{ student_id: string; attempts: number; correct: number }>;
  const badges = (badgesRes.data ?? []) as Array<{ student_id: string; id: string }>;
  const academiaSessions = (academiaRes.data ?? []) as Array<{ student_id: string; retry_count: number }>;

  const result = students.map((s) => {
    const myProgress = progress.filter((p) => p.student_id === s.id);
    const myAttempts = attempts.filter((a) => a.student_id === s.id);
    const myMastery = mastery.filter((m) => m.student_id === s.id);

    const unitsCompleted = myProgress.filter((p) => p.status === "completed").length;
    const totalTimeSeconds = myAttempts.reduce((sum, a) => sum + a.time_spent_seconds, 0);

    const lastAttempt = myAttempts.reduce<string | null>((latest, a) => {
      if (!latest || a.completed_at > latest) return a.completed_at;
      return latest;
    }, null);

    const totalAttempts = myMastery.reduce((s, m) => s + m.attempts, 0);
    const totalCorrect = myMastery.reduce((s, m) => s + m.correct, 0);
    const masteryPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    // Total academia retries across all units for this student
    const myAcademia = academiaSessions.filter((a) => a.student_id === s.id);
    const totalAcademiaRetries = myAcademia.reduce((sum, a) => sum + (a.retry_count ?? 0), 0);

    return {
      id: s.id,
      displayName: s.display_name,
      joinedAt: s.created_at,
      unitsCompleted,
      totalTimeSeconds,
      lastActive: lastAttempt,
      masteryPct,
      badgeCount: badges.filter((b) => b.student_id === s.id).length,
      academiaRetries: totalAcademiaRetries,
      academiaSessions: myAcademia.length,
    };
  });

  return NextResponse.json({ students: result });
}
