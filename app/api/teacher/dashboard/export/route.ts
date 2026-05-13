import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
  ].join("\n");
}

export async function GET(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = request.nextUrl.searchParams.get("classId");
  const type = request.nextUrl.searchParams.get("type") ?? "students"; // students | vocab | attempts | mastery
  if (!classId) return NextResponse.json({ error: "Missing classId" }, { status: 400 });

  const supabase = createClient();
  const { data: studentsData } = await supabase.from("students").select("id, display_name, created_at").eq("class_id", classId);
  const students = (studentsData ?? []) as Array<{ id: string; display_name: string; created_at: string }>;
  const ids = students.map((s) => s.id);

  let csv = "";
  const filename = `export-${type}-${Date.now()}.csv`;

  if (type === "students") {
    const [progressRes, attemptsRes, badgesRes] = await Promise.all([
      ids.length ? supabase.from("unit_progress").select("student_id, status").in("student_id", ids) : Promise.resolve({ data: [] }),
      ids.length ? supabase.from("attempts").select("student_id, time_spent_seconds, completed_at").in("student_id", ids) : Promise.resolve({ data: [] }),
      ids.length ? supabase.from("badges").select("student_id").in("student_id", ids) : Promise.resolve({ data: [] }),
    ]);
    const progress = (progressRes.data ?? []) as Array<{ student_id: string; status: string }>;
    const attempts = (attemptsRes.data ?? []) as Array<{ student_id: string; time_spent_seconds: number; completed_at: string }>;
    const badges = (badgesRes.data ?? []) as Array<{ student_id: string }>;
    const rows = students.map((s) => {
      const myAttempts = attempts.filter((a) => a.student_id === s.id);
      const lastActive = myAttempts.reduce<string | null>((l, a) => (!l || a.completed_at > l ? a.completed_at : l), null);
      return {
        display_name: s.display_name,
        joined: s.created_at.slice(0, 10),
        units_completed: progress.filter((p) => p.student_id === s.id && p.status === "completed").length,
        total_time_minutes: Math.round(myAttempts.reduce((t, a) => t + a.time_spent_seconds, 0) / 60),
        badges: badges.filter((b) => b.student_id === s.id).length,
        last_active: lastActive?.slice(0, 10) ?? "never",
      };
    });
    csv = toCSV(rows);
  } else if (type === "vocab") {
    if (!ids.length) { csv = "term,attempts,correct,mastery_pct,student_id\n"; }
    else {
      const { data } = await supabase.from("mastery").select("student_id, vocab_term, attempts, correct, last_seen").in("student_id", ids);
      const rows = ((data ?? []) as Array<{ student_id: string; vocab_term: string; attempts: number; correct: number; last_seen: string }>).map((m) => ({
        display_name: students.find((s) => s.id === m.student_id)?.display_name ?? "",
        term: m.vocab_term,
        attempts: m.attempts,
        correct: m.correct,
        mastery_pct: m.attempts > 0 ? Math.round((m.correct / m.attempts) * 100) : 0,
        last_seen: m.last_seen.slice(0, 10),
      }));
      csv = toCSV(rows);
    }
  } else if (type === "attempts") {
    if (!ids.length) { csv = ""; }
    else {
      const { data } = await supabase.from("attempts").select("student_id, unit_id, activity_type, score, max_score, time_spent_seconds, completed_at").in("student_id", ids).order("completed_at", { ascending: false });
      const rows = ((data ?? []) as Array<{ student_id: string; unit_id: string; activity_type: string; score: number; max_score: number; time_spent_seconds: number; completed_at: string }>).map((a) => ({
        student: students.find((s) => s.id === a.student_id)?.display_name ?? "",
        activity_type: a.activity_type,
        score: a.score, max_score: a.max_score,
        pct: a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0,
        time_seconds: a.time_spent_seconds,
        completed_at: a.completed_at.slice(0, 16),
      }));
      csv = toCSV(rows);
    }
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
