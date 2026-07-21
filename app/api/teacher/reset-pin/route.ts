import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSalt, hashPin } from "@/lib/auth/pin";
import { validatePin, validateClassCode } from "@/lib/auth/validation";
import { guardClass, isResponse } from "@/lib/auth/teacher";

export async function POST(request: NextRequest) {
  const { classCode, displayName, newPin } = await request.json();

  if (!classCode || !displayName || !newPin) {
    return NextResponse.json({ error: "All fields required." }, { status: 400 });
  }

  const codeCheck = validateClassCode(classCode);
  if (!codeCheck.valid) return NextResponse.json({ error: codeCheck.error }, { status: 400 });

  const pinCheck = validatePin(newPin);
  if (!pinCheck.valid) return NextResponse.json({ error: pinCheck.error }, { status: 400 });

  const supabase = createClient();
  const normalCode = classCode.trim().toUpperCase();

  const { data: clsData } = await supabase
    .from("classes")
    .select("id")
    .eq("class_code", normalCode)
    .limit(1);
  const clsRows = clsData as Array<{ id: string }> | null;

  const classId = clsRows?.[0]?.id;
  if (!classId) return NextResponse.json({ error: "Class code not found." }, { status: 404 });

  // Only a teacher who owns this class may reset a student's PIN.
  const guard = await guardClass(classId);
  if (isResponse(guard)) return guard;

  const { data: stuData } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId)
    .ilike("display_name", displayName.trim())
    .limit(1);
  const studentRows = stuData as Array<{ id: string }> | null;

  const studentId = studentRows?.[0]?.id;
  if (!studentId) return NextResponse.json({ error: "Student not found in that class." }, { status: 404 });

  const salt = generateSalt();
  const pinHash = hashPin(newPin, salt);

  const { error } = await supabase
    .from("students")
    .update({ pin_hash: pinHash, pin_salt: salt })
    .eq("id", studentId);

  if (error) return NextResponse.json({ error: "Could not reset PIN." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
