/**
 * POST /api/teacher/student-archive  { studentId, archived }
 *
 * Archives a student (hidden from the roster, the gradebook, every dashboard
 * and the leaderboards, and refused at login), or restores one.
 *
 * Nothing is deleted. A class collects junk accounts — test logins, duplicates,
 * a name typed three different ways — and the teacher needs them gone from the
 * roster, but "gone" must not mean a real student's term of work is
 * unrecoverable because of one misclick. Archiving is a single nullable column,
 * so restoring is exact.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { guardClass, isResponse } from "@/lib/auth/teacher";

export async function POST(request: NextRequest) {
  const { studentId, archived } = (await request.json().catch(() => ({}))) as {
    studentId?: string;
    archived?: boolean;
  };
  if (!studentId || typeof archived !== "boolean") {
    return NextResponse.json({ error: "Missing studentId or archived." }, { status: 400 });
  }

  const supabase = createClient();

  const { data: rows } = await supabase
    .from("students")
    .select("id, display_name, class_id")
    .eq("id", studentId)
    .limit(1);
  const student = (rows as Array<{ id: string; display_name: string; class_id: string | null }> | null)?.[0];
  if (!student?.class_id) return NextResponse.json({ error: "Student not found." }, { status: 404 });

  const guard = await guardClass(student.class_id);
  if (isResponse(guard)) return guard;

  const { error } = await supabase
    .from("students")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", studentId);

  if (error) return NextResponse.json({ error: "Could not update the student." }, { status: 500 });

  return NextResponse.json({ ok: true, archived, displayName: student.display_name });
}
