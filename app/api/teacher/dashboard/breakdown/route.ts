import { NextRequest, NextResponse } from "next/server";
import { guardClass, isResponse } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";
import { buildBreakdown, type AttemptRow, type ProgressRow } from "@/lib/gradebook/breakdown";

/**
 * Per-case and per-week gradebook detail for one class.
 *
 * Separate from /grades on purpose: /grades is the summary row a teacher reads
 * every day and must stay cheap, while this walks the whole attempt history and
 * is only fetched when they open a breakdown view.
 */

// PostgREST caps a plain select at 1000 rows. A year of a full class is well
// past that, so page explicitly — silently truncating would show a teacher a
// gradebook that is missing weeks, which is worse than showing nothing.
const PAGE = 1000;
const MAX_ROWS = 20_000;

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? "";
  const guard = await guardClass(classId);
  if (isResponse(guard)) return guard;

  const supabase = createClient();

  const { data: studentsData } = await supabase
    .from("students").select("id, display_name").eq("class_id", classId).order("display_name");
  const students = (studentsData ?? []) as Array<{ id: string; display_name: string }>;
  const ids = students.map((s) => s.id);

  if (!ids.length) {
    return NextResponse.json({ students: [], rows: [], unitNumbers: [], weeks: [], truncated: false });
  }

  const { data: unitsData } = await supabase.from("units").select("id, number, country, title_es");
  const units = (unitsData ?? []) as Array<{ id: string; number: number; country: string; title_es: string }>;
  const unitNumberById = new Map(units.map((u) => [u.id, u.number]));

  // Attempts, paged.
  const attempts: AttemptRow[] = [];
  let truncated = false;
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await supabase
      .from("attempts")
      .select("student_id, unit_id, activity_type, score, max_score, time_spent_seconds, completed_at")
      .in("student_id", ids)
      .order("completed_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
    const page = (data ?? []) as AttemptRow[];
    attempts.push(...page);
    if (page.length < PAGE) break;
    if (from + PAGE >= MAX_ROWS) truncated = true;
  }

  const { data: progressData } = await supabase
    .from("unit_progress")
    .select("student_id, unit_id, case_solved, cold_case_completed_at")
    .in("student_id", ids);

  const { students: breakdown, unitNumbers, weekStarts } = buildBreakdown(
    ids,
    attempts,
    (progressData ?? []) as ProgressRow[],
    unitNumberById
  );

  const nameById = new Map(students.map((s) => [s.id, s.display_name]));
  const rows = breakdown.map((b) => ({
    studentId: b.studentId,
    displayName: nameById.get(b.studentId) ?? "",
    cases: b.cases,
    weeks: b.weeks,
  }));

  // Case labels so the header reads "Caso 3 · España" rather than a bare number.
  const caseLabels = unitNumbers.map((n) => {
    const u = units.find((x) => x.number === n);
    return { unitNumber: n, country: u?.country ?? "", title: u?.title_es ?? "" };
  });

  return NextResponse.json({ rows, unitNumbers, caseLabels, weeks: weekStarts, truncated });
}
