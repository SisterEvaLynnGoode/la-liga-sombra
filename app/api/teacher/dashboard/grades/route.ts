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
  const { data: classData } = await supabase
    .from("classes").select("graded_through").eq("id", classId).limit(1);
  const gradedThrough = (classData as Array<{ graded_through: number | null }> | null)?.[0]?.graded_through ?? null;

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
   * How many cases count for the COMPLETION half of the grade.
   *
   * This used to be "the furthest any student in this class has got", which
   * meant the denominator grew the moment the fastest student finished a case
   * — and every other student's grade dropped, retroactively, for work that had
   * not been assigned to them yet. A student doing exactly what was asked would
   * watch their grade fall because somebody else worked ahead over the weekend.
   *
   * The teacher now decides when work is due, per class (`graded_through`).
   * Until they set it, completion is not counted at all and the course grade is
   * pure quality of the work actually done — which can never punish a student
   * for a case nobody assigned. `completionCounted` is returned so the UI can
   * say plainly which of the two is in effect rather than leaving the teacher to
   * guess why the number looks the way it does.
   */
  const completionCounted = gradedThrough !== null && gradedThrough > 0;

  const rows = students.map((s) => {
    const grd = grades.get(s.id);
    const firstName = (s.display_name ?? "").trim().split(/\s+/)[0] || "This student";

    const seen = lastSeen.get(s.id);
    const daysSinceActive = seen ? Math.floor((Date.now() - seen) / DAY) : null;

    // Not counting completion => denominator is their own solved count, so the
    // completion term is 1 and the grade is quality alone.
    const casesAssigned = completionCounted ? gradedThrough! : Math.max(1, grd?.casesSolved ?? 0);

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
      casesAssigned: report?.courseGrade.casesAssigned ?? casesAssigned,
      provisional: report?.courseGrade.provisional ?? true,
      narrative: report?.narrative ?? "",
      teacherNote: report?.teacherNote ?? "",
      daysSinceActive,
    };
  }).sort((a, b) => b.gradePct - a.gradePct || a.displayName.localeCompare(b.displayName));

  return NextResponse.json({
    rows,
    gradedThrough,
    completionCounted,
    // Where the class actually is, so the "graded through" control can suggest a
    // sensible value without silently applying one.
    classFurthest: Math.max(0, ...ids.map((id) => grades.get(id)?.casesSolved ?? 0)),
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json() as { studentId?: string; sisId?: string; classId?: string; gradedThrough?: number | null };

  // Setting how far the class is graded through — a class-level setting, so it
  // is guarded by class ownership, not by a student.
  if (Object.prototype.hasOwnProperty.call(body, "gradedThrough")) {
    const classGuard = await guardClass(body.classId ?? null);
    if (isResponse(classGuard)) return classGuard;

    const raw = body.gradedThrough;
    // null clears it (stop counting completion). Anything else must be a whole
    // number in range; a bad value is rejected rather than coerced, because
    // silently writing 0 would zero the completion half of everyone's grade.
    let value: number | null = null;
    if (raw !== null && raw !== undefined) {
      if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 0 || raw > 40) {
        return NextResponse.json({ error: "gradedThrough must be a whole number 0-40, or null" }, { status: 400 });
      }
      value = raw;
    }

    const supabase = createClient();
    const { error } = await supabase.from("classes").update({ graded_through: value }).eq("id", body.classId!);
    if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
    return NextResponse.json({ ok: true, gradedThrough: value });
  }

  const { studentId, sisId } = body;
  const guard = await guardStudent(studentId ?? null);
  if (isResponse(guard)) return guard;

  const supabase = createClient();
  const clean = typeof sisId === "string" ? sisId.trim().slice(0, 40) : "";
  const { error } = await supabase.from("students").update({ sis_id: clean || null }).eq("id", studentId!);
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
