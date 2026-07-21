import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { computeClassGrades } from "@/lib/grading";

// Class gradebook (Phase 1). GET returns each student's ACTFL band + skills;
// PATCH sets a student's district SIS/Aeries ID for export mapping.

export async function GET(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const classId = request.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "Missing classId" }, { status: 400 });

  const supabase = createClient();
  const { data: studentsData } = await supabase
    .from("students").select("id, display_name, sis_id").eq("class_id", classId);
  const students = (studentsData ?? []) as Array<{ id: string; display_name: string; sis_id: string | null }>;

  const grades = await computeClassGrades(students.map((s) => s.id), supabase);

  const rows = students.map((s) => {
    const grd = grades.get(s.id);
    return {
      studentId: s.id,
      displayName: s.display_name,
      sisId: s.sis_id ?? "",
      band: grd?.band ?? "Novice Low",
      bandIndex: grd?.bandIndex ?? 0,
      scorePct: grd ? Math.round(grd.score * 100) : 0,
      casesSolved: grd?.casesSolved ?? 0,
      vocab: grd ? Math.round(grd.skills.vocab.score * 100) : 0,
      grammar: grd ? Math.round(grd.skills.grammar.score * 100) : 0,
      communication: grd ? Math.round(grd.skills.communication.score * 100) : 0,
    };
  }).sort((a, b) => b.bandIndex - a.bandIndex || b.scorePct - a.scorePct);

  return NextResponse.json({ rows });
}

export async function PATCH(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { studentId, sisId } = await request.json() as { studentId?: string; sisId?: string };
  if (!studentId) return NextResponse.json({ error: "Missing studentId" }, { status: 400 });

  const supabase = createClient();
  const clean = typeof sisId === "string" ? sisId.trim().slice(0, 40) : "";
  const { error } = await supabase.from("students").update({ sis_id: clean || null }).eq("id", studentId);
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
