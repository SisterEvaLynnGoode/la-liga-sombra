import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

// Human-readable labels for flag types
const FLAG_LABELS: Record<string, { en: string; urgency: number }> = {
  help_requested:                 { en: "Student requested help",           urgency: 1 },
  repeated_skipping:              { en: "Skipped 3+ stages in one session", urgency: 2 },
  academia_skipped_after_failure: { en: "Skipped Academia after failing",   urgency: 2 },
  needs_listening_support:        { en: "Requested extra audio replays",    urgency: 3 },
  listening_skipped:              { en: "Skipped Listening Comprehension",  urgency: 3 },
  stage_skipped:                  { en: "Skipped a game stage",             urgency: 5 },
  transcript_revealed:            { en: "Revealed transcript early",        urgency: 4 },
  repeated_failure:               { en: "Repeated failure",                 urgency: 2 },
  image_mismatch_reported:        { en: "Reported image mismatch",          urgency: 4 },
};

export async function GET(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = request.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "Missing classId" }, { status: 400 });

  const supabase = createClient();

  // Get all students in this class
  const { data: studentsData } = await supabase
    .from("students").select("id, display_name").eq("class_id", classId);
  const students = (studentsData ?? []) as Array<{ id: string; display_name: string }>;
  if (!students.length) return NextResponse.json({ flags: [], unacknowledgedCount: 0, errorPatterns: [] });

  const studentIds = students.map((s) => s.id);
  const studentMap = Object.fromEntries(students.map((s) => [s.id, s.display_name]));

  // Get all flags for these students
  const { data: flagsData } = await supabase
    .from("student_flags")
    .select("id, student_id, flag_type, unit_id, context, created_at, acknowledged_at, resolved_at, teacher_note")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false })
    .limit(500);

  const rawFlags = (flagsData ?? []) as Array<{
    id: string;
    student_id: string;
    flag_type: string;
    unit_id: string | null;
    context: Record<string, unknown>;
    created_at: string;
    acknowledged_at: string | null;
    resolved_at: string | null;
    teacher_note: string | null;
  }>;

  // Error-pattern digest (Workstream A4): classified mistakes from the last
  // 14 days of item_events, grouped by error kind + unit. Surfaces things like
  // "5 students are making agreement errors in Unit 4" without opening a report.
  const since = new Date(Date.now() - 14 * 86_400_000).toISOString();
  const { data: errData } = await supabase
    .from("item_events")
    .select("student_id, unit_id, error_kind")
    .in("student_id", studentIds)
    .not("error_kind", "is", null)
    .gte("created_at", since)
    .limit(2000);
  const errEvents = (errData ?? []) as Array<{ student_id: string; unit_id: string | null; error_kind: string }>;

  // Resolve unit numbers if we have unit_ids (flags + error events)
  const unitIds = Array.from(new Set([
    ...rawFlags.map((f) => f.unit_id),
    ...errEvents.map((e) => e.unit_id),
  ].filter(Boolean))) as string[];
  let unitMap: Record<string, number> = {};
  if (unitIds.length) {
    const { data: unitsData } = await supabase
      .from("units").select("id, number").in("id", unitIds);
    unitMap = Object.fromEntries(
      (unitsData as Array<{ id: string; number: number }> ?? []).map((u) => [u.id, u.number])
    );
  }

  const ERROR_LABELS: Record<string, string> = {
    word_order:  "word order",
    conjugation: "verb conjugation",
    agreement:   "gender/number agreement",
    vocab:       "vocabulary choice",
    spelling:    "spelling",
  };
  const errGroups = new Map<string, { students: Set<string>; count: number }>();
  for (const e of errEvents) {
    const key = `${e.error_kind}|${e.unit_id ?? ""}`;
    const g = errGroups.get(key) ?? { students: new Set<string>(), count: 0 };
    g.students.add(e.student_id);
    g.count += 1;
    errGroups.set(key, g);
  }
  const errorPatterns = Array.from(errGroups.entries())
    .map(([key, g]) => {
      const [errorKind, unitId] = key.split("|");
      return {
        errorKind,
        label: ERROR_LABELS[errorKind] ?? errorKind,
        unitNumber: unitId ? (unitMap[unitId] ?? null) : null,
        studentCount: g.students.size,
        eventCount: g.count,
      };
    })
    // Only patterns affecting 2+ students are actionable class-wide
    .filter((p) => p.studentCount >= 2)
    .sort((a, b) => b.studentCount - a.studentCount || b.eventCount - a.eventCount)
    .slice(0, 5);

  const flags = rawFlags.map((f) => ({
    id:             f.id,
    studentId:      f.student_id,
    studentName:    studentMap[f.student_id] ?? "Unknown",
    flagType:       f.flag_type,
    flagLabel:      FLAG_LABELS[f.flag_type]?.en ?? f.flag_type,
    urgency:        FLAG_LABELS[f.flag_type]?.urgency ?? 5,
    unitNumber:     f.unit_id ? (unitMap[f.unit_id] ?? null) : null,
    context:        f.context,
    createdAt:      f.created_at,
    acknowledged:   !!f.acknowledged_at,
    resolved:       !!f.resolved_at,
    teacherNote:    f.teacher_note,
  }));

  const unacknowledgedCount = flags.filter((f) => !f.acknowledged).length;

  return NextResponse.json({ flags, unacknowledgedCount, errorPatterns });
}

// PATCH: acknowledge, add note, or resolve a flag
export async function PATCH(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    id: string;
    action: "acknowledge" | "resolve" | "add_note";
    note?: string;
  };

  if (!body.id || !body.action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = createClient();
  const update: { acknowledged_at?: string; resolved_at?: string; teacher_note?: string } = {};

  if (body.action === "acknowledge") update.acknowledged_at = new Date().toISOString();
  if (body.action === "resolve")     { update.acknowledged_at = new Date().toISOString(); update.resolved_at = new Date().toISOString(); }
  if (body.action === "add_note" && body.note !== undefined) update.teacher_note = body.note;

  const { error } = await supabase.from("student_flags").update(update).eq("id", body.id);
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
