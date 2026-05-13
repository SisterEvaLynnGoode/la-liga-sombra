import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = request.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "Missing classId" }, { status: 400 });

  const supabase = createClient();
  const { data: studentsData } = await supabase.from("students").select("id").eq("class_id", classId);
  const studentIds = (studentsData as Array<{ id: string }> | null)?.map((s) => s.id) ?? [];
  const totalStudents = studentIds.length;

  const [progressRes, attemptsRes, masteryRes, unitsRes] = await Promise.all([
    studentIds.length ? supabase.from("unit_progress").select("student_id, unit_id, status").in("student_id", studentIds) : Promise.resolve({ data: [] }),
    studentIds.length ? supabase.from("attempts").select("unit_id, activity_type, score, max_score, time_spent_seconds").in("student_id", studentIds) : Promise.resolve({ data: [] }),
    studentIds.length ? supabase.from("mastery").select("student_id, vocab_term, attempts, correct").in("student_id", studentIds) : Promise.resolve({ data: [] }),
    supabase.from("units").select("id, number, country, title_es").order("number"),
  ]);

  const progress = (progressRes.data ?? []) as Array<{ student_id: string; unit_id: string; status: string }>;
  const attempts = (attemptsRes.data ?? []) as Array<{ unit_id: string; activity_type: string; score: number; max_score: number; time_spent_seconds: number }>;
  const mastery = (masteryRes.data ?? []) as Array<{ student_id: string; vocab_term: string; attempts: number; correct: number }>;
  const units = (unitsRes.data ?? []) as Array<{ id: string; number: number; country: string; title_es: string }>;

  const result = units.map((u) => {
    const unitProgress = progress.filter((p) => p.unit_id === u.id);
    const unitAttempts = attempts.filter((a) => a.unit_id === u.id);

    const completionCount = unitProgress.filter((p) => p.status === "completed").length;
    const inProgressCount = unitProgress.filter((p) => p.status === "in_progress").length;

    const scoredAttempts = unitAttempts.filter((a) => a.max_score > 0);
    const avgScore = scoredAttempts.length
      ? Math.round((scoredAttempts.reduce((s, a) => s + a.score / a.max_score, 0) / scoredAttempts.length) * 100)
      : 0;
    const avgTimeMinutes = unitAttempts.length
      ? Math.round(unitAttempts.reduce((s, a) => s + a.time_spent_seconds, 0) / unitAttempts.length / 60)
      : 0;

    // Activity breakdown
    const byType = new Map<string, { total: number; count: number }>();
    for (const a of unitAttempts) {
      if (a.max_score === 0) continue;
      const cur = byType.get(a.activity_type) ?? { total: 0, count: 0 };
      byType.set(a.activity_type, { total: cur.total + a.score / a.max_score, count: cur.count + 1 });
    }
    const activityBreakdown = Array.from(byType.entries()).map(([type, { total, count }]) => ({
      type, avgScore: Math.round((total / count) * 100), count,
    })).sort((a, b) => a.avgScore - b.avgScore);

    // Hardest vocab for this unit (class-wide mastery %)
    const termMap = new Map<string, { totalAttempts: number; totalCorrect: number; seen: number }>();
    for (const m of mastery) {
      if (m.attempts === 0) continue;
      const cur = termMap.get(m.vocab_term) ?? { totalAttempts: 0, totalCorrect: 0, seen: 0 };
      termMap.set(m.vocab_term, { totalAttempts: cur.totalAttempts + m.attempts, totalCorrect: cur.totalCorrect + m.correct, seen: cur.seen + 1 });
    }
    const hardestVocab = Array.from(termMap.entries())
      .map(([term, { totalAttempts, totalCorrect, seen }]) => ({
        term, masteryPct: Math.round((totalCorrect / totalAttempts) * 100), studentsSeen: seen,
      }))
      .sort((a, b) => a.masteryPct - b.masteryPct)
      .slice(0, 5);

    return {
      number: u.number, country: u.country, titleEs: u.title_es,
      completionCount, inProgressCount, totalStudents,
      avgScore, avgTimeMinutes, activityBreakdown, hardestVocab,
    };
  });

  return NextResponse.json({ units: result });
}
