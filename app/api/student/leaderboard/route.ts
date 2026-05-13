import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient();
  const { classId, studentId: myId } = session;

  const { data: studentsData } = await supabase.from("students").select("id, display_name").eq("class_id", classId);
  const students = (studentsData ?? []) as Array<{ id: string; display_name: string }>;
  const ids = students.map((s) => s.id);

  if (!ids.length) return NextResponse.json({ entries: [] });

  const [badgesRes, masteryRes] = await Promise.all([
    supabase.from("badges").select("student_id, badge_type").in("student_id", ids).eq("badge_type", "unit_completed"),
    supabase.from("mastery").select("student_id, attempts, correct").in("student_id", ids),
  ]);

  const badges = (badgesRes.data ?? []) as Array<{ student_id: string; badge_type: string }>;
  const mastery = (masteryRes.data ?? []) as Array<{ student_id: string; attempts: number; correct: number }>;

  const entries = students.map((s) => {
    const casesSolved = badges.filter((b) => b.student_id === s.id).length;
    const myMastery = mastery.filter((m) => m.student_id === s.id);
    const totalA = myMastery.reduce((t, m) => t + m.attempts, 0);
    const totalC = myMastery.reduce((t, m) => t + m.correct, 0);
    const masteryPct = totalA > 0 ? Math.round((totalC / totalA) * 100) : 0;
    return { id: s.id, displayName: s.display_name, isMe: s.id === myId, casesSolved, masteryPct };
  }).sort((a, b) => b.casesSolved - a.casesSolved || b.masteryPct - a.masteryPct);

  return NextResponse.json({ entries });
}
