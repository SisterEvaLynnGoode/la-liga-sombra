import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { guardStudent, isResponse } from "@/lib/auth/teacher";

/**
 * POST /api/teacher/unlock-academia
 *
 * Teacher action: grant a student permission to bypass Academia for a specific unit.
 * Creates an `academia_unlocked` flag in student_flags.
 * The student's /play/[unitId]/academia page checks for this flag and shows a bypass button.
 *
 * Body: { studentId: string, unitNumber: number }
 */
export async function POST(request: NextRequest) {
  let body: { studentId?: string; unitNumber?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { studentId, unitNumber } = body;
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

  // Idempotent: only insert if no existing unlock flag for this student+unit
  const { data: existing } = await supabase
    .from("student_flags")
    .select("id")
    .eq("student_id", studentId)
    .eq("unit_id", unitRow.id)
    .eq("flag_type", "academia_unlocked")
    .limit(1);

  if ((existing?.length ?? 0) > 0) {
    return NextResponse.json({ success: true, alreadyUnlocked: true });
  }

  const { error } = await supabase.from("student_flags").insert({
    student_id: studentId,
    flag_type: "academia_unlocked",
    unit_id: unitRow.id,
    context: { unlockedByTeacher: true, unitNumber },
    // Auto-acknowledge teacher-initiated flags — no need to clutter the inbox
    acknowledged_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
