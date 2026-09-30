/**
 * POST /api/teacher/student-pin  { studentId }
 *
 * Issues a NEW four-digit PIN for one student and returns it once, for the
 * teacher to read out.
 *
 * It cannot return the student's existing PIN, and no endpoint ever will: PINs
 * are stored as a salted HMAC (lib/auth/pin.ts), which is a one-way function.
 * The roster button therefore replaces the PIN rather than revealing it — the
 * student's old PIN stops working the moment this is called, which is the
 * honest trade for a teacher who needs a locked-out student playing again in
 * the next thirty seconds.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSalt, hashPin } from "@/lib/auth/pin";
import { guardClass, isResponse } from "@/lib/auth/teacher";
import crypto from "crypto";

/** A four-digit PIN, uniform over 0000-9999, minus the ones nobody should get. */
function generatePin(): string {
  const banned = new Set(["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "1234", "4321"]);
  for (;;) {
    const pin = String(crypto.randomInt(0, 10000)).padStart(4, "0");
    if (!banned.has(pin)) return pin;
  }
}

export async function POST(request: NextRequest) {
  const { studentId } = (await request.json().catch(() => ({}))) as { studentId?: string };
  if (!studentId) return NextResponse.json({ error: "Missing studentId." }, { status: 400 });

  const supabase = createClient();

  const { data: rows } = await supabase
    .from("students")
    .select("id, display_name, class_id")
    .eq("id", studentId)
    .limit(1);
  const student = (rows as Array<{ id: string; display_name: string; class_id: string | null }> | null)?.[0];
  if (!student?.class_id) return NextResponse.json({ error: "Student not found." }, { status: 404 });

  // Only the teacher who owns this student's class.
  const guard = await guardClass(student.class_id);
  if (isResponse(guard)) return guard;

  const pin = generatePin();
  const salt = generateSalt();

  const { error } = await supabase
    .from("students")
    .update({
      pin_hash: hashPin(pin, salt),
      pin_salt: salt,
      // A new PIN also clears a lockout — the usual reason a teacher is here.
      failed_logins: 0,
      locked_until: null,
    })
    .eq("id", studentId);

  if (error) return NextResponse.json({ error: "Could not set a new PIN." }, { status: 500 });

  return NextResponse.json({ ok: true, pin, displayName: student.display_name });
}
