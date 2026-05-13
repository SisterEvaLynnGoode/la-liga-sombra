import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

async function getStudentIds(supabase: ReturnType<typeof createClient>, classId: string) {
  const { data } = await supabase.from("students").select("id").eq("class_id", classId);
  return (data as Array<{ id: string }> | null)?.map((s) => s.id) ?? [];
}

export async function GET(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = request.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "Missing classId" }, { status: 400 });

  const supabase = createClient();
  const studentIds = await getStudentIds(supabase, classId);
  if (!studentIds.length) {
    return NextResponse.json({ totalStudents: 0, avgCompletionPct: 0, avgTimeMinutes: 0, unitCompletion: [], inactiveStudents: [] });
  }

  // Fetch in parallel
  const [studentsRes, progressRes, attemptsRes, unitsRes] = await Promise.all([
    supabase.from("students").select("id, display_name, created_at").eq("class_id", classId),
    supabase.from("unit_progress").select("student_id, unit_id, status").in("student_id", studentIds),
    supabase.from("attempts").select("student_id, time_spent_seconds, completed_at").in("student_id", studentIds),
    supabase.from("units").select("id, number, country").order("number"),
  ]);

  const students = (studentsRes.data ?? []) as Array<{ id: string; display_name: string; created_at: string }>;
  const progress = (progressRes.data ?? []) as Array<{ student_id: string; unit_id: string; status: string }>;
  const attempts = (attemptsRes.data ?? []) as Array<{ student_id: string; time_spent_seconds: number; completed_at: string }>;
  const units = (unitsRes.data ?? []) as Array<{ id: string; number: number; country: string }>;

  // Avg completion %: per student → number of completed / total units
  const totalUnits = units.length;
  const completedPerStudent = students.map((s) => {
    const done = progress.filter((p) => p.student_id === s.id && p.status === "completed").length;
    return totalUnits > 0 ? (done / totalUnits) * 100 : 0;
  });
  const avgCompletionPct = completedPerStudent.length
    ? Math.round(completedPerStudent.reduce((a, b) => a + b, 0) / completedPerStudent.length)
    : 0;

  // Avg time per activity (seconds)
  const totalTimeSeconds = attempts.reduce((a, b) => a + b.time_spent_seconds, 0);
  const avgTimeMinutes = attempts.length ? Math.round(totalTimeSeconds / attempts.length / 60) : 0;

  // Unit completion counts
  const unitCompletion = units.map((u) => ({
    number: u.number,
    country: u.country,
    completed: progress.filter((p) => p.unit_id === u.id && p.status === "completed").length,
    total: students.length,
  }));

  // Inactive students: last attempt > 7 days ago or never played
  const lastActiveMap = new Map<string, number>();
  for (const a of attempts) {
    const t = new Date(a.completed_at).getTime();
    if (!lastActiveMap.has(a.student_id) || t > lastActiveMap.get(a.student_id)!) {
      lastActiveMap.set(a.student_id, t);
    }
  }
  const inactiveStudents = students
    .map((s) => {
      const last = lastActiveMap.get(s.id);
      const daysInactive = last ? Math.floor((Date.now() - last) / 86400000) : 999;
      return { id: s.id, displayName: s.display_name, lastActive: last ? new Date(last).toISOString() : null, daysInactive };
    })
    .filter((s) => s.daysInactive >= 7)
    .sort((a, b) => b.daysInactive - a.daysInactive);

  return NextResponse.json({ totalStudents: students.length, avgCompletionPct, avgTimeMinutes, unitCompletion, inactiveStudents });
}
