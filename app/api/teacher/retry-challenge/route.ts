import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { guardStudent, isResponse } from "@/lib/auth/teacher";

/**
 * POST /api/teacher/retry-challenge
 *
 * Teacher action: challenge a student to try Academia again.
 * Creates an `academia_retry_challenge` flag — a motivational signal that appears
 * on the student's Academia intro screen encouraging them to push through.
 * Does NOT unlock the bypass; the student still has to complete the training.
 *
 * Body: { studentId: string, unitNumber: number, message?: string }
 */
export async function POST(request: NextRequest) {
  let body: { studentId?: string; unitNumber?: number; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { studentId, unitNumber, message } = body;
  if (!studentId || !unitNumber) {
    return NextResponse.json({ error: "Missing studentId or unitNumber" }, { status: 400 });
  }

  const guard = await guardStudent(studentId);
  if (isResponse(guard)) return guard;

  const supabase = createClient();

  // Resolve unit UUID from unit number
  const { data: unitRow, error: unitErr } = await supabase
    .from("units")
    .select("id")
    .eq("number", unitNumber)
    .limit(1)
    .single();

  if (unitErr || !unitRow) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 });
  }

  // Remove any existing retry challenge for this student+unit before inserting a fresh one
  await supabase
    .from("student_flags")
    .delete()
    .eq("student_id", studentId)
    .eq("unit_id", unitRow.id)
    .eq("flag_type", "academia_retry_challenge");

  const { error } = await supabase.from("student_flags").insert({
    student_id: studentId,
    flag_type: "academia_retry_challenge",
    unit_id: unitRow.id,
    context: {
      challengedByTeacher: true,
      unitNumber,
      ...(message?.trim() ? { teacherMessage: message.trim() } : {}),
    },
    acknowledged_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
