import { NextRequest, NextResponse } from "next/server";
import { guardClass, isResponse } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {

  const classId = request.nextUrl.searchParams.get("classId") ?? "";
  const guard = await guardClass(classId);
  if (isResponse(guard)) return guard;

  const supabase = createClient();
  const { data: studentsData } = await supabase.from("students").select("id").eq("class_id", classId);
  const studentIds = (studentsData as Array<{ id: string }> | null)?.map((s) => s.id) ?? [];

  if (!studentIds.length) return NextResponse.json({ terms: [], totalStudents: 0 });

  const { data: masteryData } = await supabase
    .from("mastery")
    .select("student_id, vocab_term, attempts, correct")
    .in("student_id", studentIds);

  const mastery = (masteryData ?? []) as Array<{ student_id: string; vocab_term: string; attempts: number; correct: number }>;

  // Aggregate per vocab term
  const termMap = new Map<string, { totalAttempts: number; totalCorrect: number; studentsSeen: Set<string>; studentsWhoMastered: number }>();
  for (const m of mastery) {
    if (m.attempts === 0) continue;
    const cur = termMap.get(m.vocab_term) ?? { totalAttempts: 0, totalCorrect: 0, studentsSeen: new Set(), studentsWhoMastered: 0 };
    cur.totalAttempts += m.attempts;
    cur.totalCorrect += m.correct;
    cur.studentsSeen.add(m.student_id);
    if (m.attempts > 0 && m.correct / m.attempts >= 0.8) cur.studentsWhoMastered++;
    termMap.set(m.vocab_term, cur);
  }

  const terms = Array.from(termMap.entries())
    .map(([term, { totalAttempts, totalCorrect, studentsSeen, studentsWhoMastered }]) => ({
      term,
      studentsSeen: studentsSeen.size,
      studentsWhoMastered,
      classMasteryPct: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
      avgAttempts: Math.round(totalAttempts / studentsSeen.size),
    }))
    .sort((a, b) => a.classMasteryPct - b.classMasteryPct);

  return NextResponse.json({ terms, totalStudents: studentIds.length });
}
