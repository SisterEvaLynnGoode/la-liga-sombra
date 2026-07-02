import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = request.nextUrl.searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "Missing studentId" }, { status: 400 });

  const supabase = createClient();

  const [studentRes, progressRes, attemptsRes, masteryRes, unitsRes, canDoRes, reportsRes] = await Promise.all([
    supabase.from("students").select("id, display_name, created_at").eq("id", studentId).limit(1),
    supabase.from("unit_progress").select("unit_id, status, stage_index, case_solved, completed_at").eq("student_id", studentId),
    supabase.from("attempts").select("unit_id, activity_type, score, max_score, time_spent_seconds, completed_at").eq("student_id", studentId).order("completed_at", { ascending: false }).limit(50),
    supabase.from("mastery").select("vocab_term, attempts, correct, last_seen").eq("student_id", studentId).order("attempts", { ascending: false }),
    supabase.from("units").select("id, number, country, title_es").order("number"),
    supabase.from("can_do_ratings").select("unit_id, statement, rating").eq("student_id", studentId),
    supabase.from("field_reports").select("unit_id, report_text, created_at").eq("student_id", studentId).order("created_at", { ascending: false }).limit(20),
  ]);

  const student = (studentRes.data as Array<{ id: string; display_name: string; created_at: string }> | null)?.[0];
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const progress = (progressRes.data ?? []) as Array<{ unit_id: string; status: string; stage_index: number; case_solved: boolean; completed_at: string | null }>;
  const attempts = (attemptsRes.data ?? []) as Array<{ unit_id: string; activity_type: string; score: number; max_score: number; time_spent_seconds: number; completed_at: string }>;
  const masteryRaw = (masteryRes.data ?? []) as Array<{ vocab_term: string; attempts: number; correct: number; last_seen: string }>;
  const units = (unitsRes.data ?? []) as Array<{ id: string; number: number; country: string; title_es: string }>;

  const unitProgress = units.map((u) => {
    const prog = progress.find((p) => p.unit_id === u.id);
    const unitAttempts = attempts.filter((a) => a.unit_id === u.id);
    const totalTime = unitAttempts.reduce((s, a) => s + a.time_spent_seconds, 0);
    const avgScore = unitAttempts.length
      ? Math.round((unitAttempts.reduce((s, a) => s + (a.max_score > 0 ? a.score / a.max_score : 0), 0) / unitAttempts.length) * 100)
      : 0;
    return {
      number: u.number, country: u.country, titleEs: u.title_es,
      status: prog?.status ?? "locked",
      stageIndex: prog?.stage_index ?? 0,
      caseSolved: prog?.case_solved ?? false,
      completedAt: prog?.completed_at ?? null,
      avgScore, totalTimeSeconds: totalTime,
      attemptCount: unitAttempts.length,
    };
  });

  const mastery = masteryRaw.map((m) => ({
    term: m.vocab_term,
    attempts: m.attempts,
    correct: m.correct,
    masteryPct: m.attempts > 0 ? Math.round((m.correct / m.attempts) * 100) : 0,
    lastSeen: m.last_seen,
  })).sort((a, b) => a.masteryPct - b.masteryPct);

  const recentAttempts = attempts.slice(0, 20).map((a) => {
    const u = units.find((u) => u.id === a.unit_id);
    return { ...a, unitNumber: u?.number ?? 0, unitCountry: u?.country ?? "?" };
  });

  // Can-do self-ratings (B4) — the student's own read on each unit's goals.
  // Compare against avgScore/mastery: over-confident or under-confident students
  // are exactly who to talk to first.
  const canDoRaw = (canDoRes.data ?? []) as Array<{ unit_id: string; statement: string; rating: number }>;
  const canDo = canDoRaw.map((c) => ({
    unitNumber: units.find((u) => u.id === c.unit_id)?.number ?? 0,
    statement: c.statement,
    rating: c.rating,
  })).sort((a, b) => a.unitNumber - b.unitNumber);

  // Detective field reports (B3) — free writing for the teacher to review.
  const reportsRaw = (reportsRes.data ?? []) as Array<{ unit_id: string; report_text: string; created_at: string }>;
  const fieldReports = reportsRaw.map((r) => ({
    unitNumber: units.find((u) => u.id === r.unit_id)?.number ?? 0,
    text: r.report_text,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ student: { id: student.id, displayName: student.display_name, createdAt: student.created_at }, unitProgress, mastery, recentAttempts, canDo, fieldReports });
}
