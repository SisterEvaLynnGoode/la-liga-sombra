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
  if (!students.length) return NextResponse.json({ flags: [], unacknowledgedCount: 0 });

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

  // Resolve unit numbers if we have unit_ids
  const unitIds = Array.from(new Set(rawFlags.map((f) => f.unit_id).filter(Boolean))) as string[];
  let unitMap: Record<string, number> = {};
  if (unitIds.length) {
    const { data: unitsData } = await supabase
      .from("units").select("id, number").in("id", unitIds);
    unitMap = Object.fromEntries(
      (unitsData as Array<{ id: string; number: number }> ?? []).map((u) => [u.id, u.number])
    );
  }

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

  return NextResponse.json({ flags, unacknowledgedCount });
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
