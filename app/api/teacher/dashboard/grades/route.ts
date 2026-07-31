import { NextRequest, NextResponse } from "next/server";
import { guardClass, guardStudent, isResponse } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";
import { computeClassGrades } from "@/lib/grading";
import { buildStudentReport } from "@/lib/grading-report";

// Class gradebook. GET returns each student's ACTFL band + skills, plus a
// gradebook-style course grade and a parent-safe narrative; PATCH sets a
// student's district SIS/Aeries ID for export mapping.

const DAY = 86_400_000;

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? "";
  const guard = await guardClass(classId);
  if (isResponse(guard)) return guard;

  const supabase = createClient();
  const { data: studentsData } = await supabase
    .from("students").select("id, display_name, sis_id").eq("class_id", classId);
  const students = (studentsData ?? []) as Array<{ id: string; display_name: string; sis_id: string | null }>;
  const ids = students.map((s) => s.id);

  const grades = await computeClassGrades(ids, supabase);

  // Extra signals for the narrative — batched, never per-student.
  const since = new Date(Date.now() - 21 * DAY).toISOString();
  const [flagsRes, eventsRes] = ids.length
    ? await Promise.all([
        supabase
          .from("student_flags")
          .select("student_id")
          .in("student_id", ids)
          .eq("flag_type", "mastery_up")
          .gte("created_at", since),
        supabase
          .from("item_events")
          .select("student_id, created_at")
          .in("student_id", ids)
          .order("created_at", { ascending: false })
          .limit(4000),
      ])
    : [{ data: [] }, { data: [] }];

  const leveledUp = new Set(
    ((flagsRes.data ?? []) as Array<{ student_id: string }>).map((f) => f.student_id)
  );

  // Most recent activity per student (events come back newest-first).
  const lastSeen = new Map<string, number>();
  for (const e of (eventsRes.data ?? []) as Array<{ student_id: string; created_at: string }>) {
    if (!lastSeen.has(e.student_id)) lastSeen.set(e.student_id, Date.parse(e.created_at));
  }

  /**
   * "Cases assigned so far" = the furthest any student in this class has got.
   * Using each student's own unlocked count would be circular (unlocking is
   * progress-driven, so it would always sit one ahead of what they finished);
   * the class's leading edge is the closest available proxy for what the
   * teacher has actually taken them through.
   */
  const casesAssigned = Math.max(
    1,
    ...ids.map((id) => grades.get(id)?.casesSolved ?? 0)
  );

  const rows = students.map((s) => {
    const grd = grades.get(s.id);
    const firstName = (s.display_name ?? "").trim().split(/\s+/)[0] || "This student";

    const seen = lastSeen.get(s.id);
    const daysSinceActive = seen ? Math.floor((Date.now() - seen) / DAY) : null;

    const report = grd
      ? buildStudentReport({
          firstName,
          grade: grd,
          casesAssigned,
          leveledUpRecently: leveledUp.has(s.id),
          daysSinceActive,
        })
      : null;

    return {
      studentId: s.id,
      displayName: s.display_name,
      sisId: s.sis_id ?? "",
      band: grd?.band ?? "Novice Low",
      bandIndex: grd?.bandIndex ?? 0,
      // ACTFL proficiency composite — kept, but no longer the headline number.
      scorePct: grd ? Math.round(grd.score * 100) : 0,
      casesSolved: grd?.casesSolved ?? 0,
      vocab: grd?.skills.vocab.hasData ? Math.round(grd.skills.vocab.score * 100) : null,
      grammar: grd?.skills.grammar.hasData ? Math.round(grd.skills.grammar.score * 100) : null,
      communication: grd?.skills.communication.hasData ? Math.round(grd.skills.communication.score * 100) : null,
      // Gradebook-style grade + parent narrative.
      gradePct: report?.courseGrade.pct ?? 0,
      gradeLetter: report?.courseGrade.letter ?? "—",
      provisional: report?.courseGrade.provisional ?? true,
      narrative: report?.narrative ?? "",
      teacherNote: report?.teacherNote ?? "",
      daysSinceActive,
    };
  }).sort((a, b) => b.gradePct - a.gradePct || a.displayName.localeCompare(b.displayName));

  return NextResponse.json({ rows, casesAssigned });
}

export async function PATCH(request: NextRequest) {
  const { studentId, sisId } = await request.json() as { studentId?: string; sisId?: string };
  const guard = await guardStudent(studentId ?? null);
  if (isResponse(guard)) return guard;

  const supabase = createClient();
  const clean = typeof sisId === "string" ? sisId.trim().slice(0, 40) : "";
  const { error } = await supabase.from("students").update({ sis_id: clean || null }).eq("id", studentId!);
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
