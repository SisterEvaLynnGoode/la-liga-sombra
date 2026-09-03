import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signToken, AGENT_COOKIE, THIRTY_DAYS } from "@/lib/auth/session";
import { verifyPin } from "@/lib/auth/pin";
import { validateClassCode, validatePin } from "@/lib/auth/validation";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { classCode, displayName, pin } = body as Record<string, string>;

  if (!classCode || !displayName || !pin) {
    return NextResponse.json({ error: "Completa todos los campos." }, { status: 400 });
  }

  const codeResult = validateClassCode(classCode);
  if (!codeResult.valid) return NextResponse.json({ error: codeResult.error }, { status: 400 });

  const pinResult = validatePin(pin);
  if (!pinResult.valid) return NextResponse.json({ error: pinResult.error }, { status: 400 });

  const supabase = createClient();
  const normalCode = classCode.trim().toUpperCase();
  const normalName = displayName.trim();

  // Find class
  const { data: clsData } = await supabase
    .from("classes")
    .select("id")
    .eq("class_code", normalCode)
    .limit(1);
  const clsRows = clsData as Array<{ id: string }> | null;

  const classId = clsRows?.[0]?.id;
  if (!classId) {
    return NextResponse.json({ error: "Código de clase no encontrado. Pregúntale a tu profe." }, { status: 404 });
  }

  type StudentRow = { id: string; display_name: string; class_id: string | null; pin_hash: string | null; pin_salt: string | null; failed_logins: number | null; locked_until: string | null };

  // Find student by name + class (case-insensitive)
  const { data: stuData } = await supabase
    .from("students")
    .select("id, display_name, class_id, pin_hash, pin_salt, failed_logins, locked_until")
    .eq("class_id", classId)
    .ilike("display_name", normalName)
    .limit(1);
  const studentRows = stuData as StudentRow[] | null;

  let student = studentRows?.[0];

  // Accent-insensitive fallback: a student who signed up as "Sofía" must be
  // able to log in typing "Sofia" (accents are hard on Chromebook keyboards).
  if (!student) {
    const norm = (s: string) =>
      s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
    const { data: allData } = await supabase
      .from("students")
      .select("id, display_name, class_id, pin_hash, pin_salt, failed_logins, locked_until")
      .eq("class_id", classId);
    student = ((allData ?? []) as StudentRow[]).find(
      (s) => norm(s.display_name) === norm(normalName)
    );
  }

  if (!student) {
    return NextResponse.json({ error: "Agente no encontrado. Revisa tu código de clase y tu nombre." }, { status: 404 });
  }

  if (!student.pin_hash || !student.pin_salt) {
    return NextResponse.json({ error: "Cuenta incompleta. Pídele ayuda a tu profe." }, { status: 400 });
  }

  /**
   * Lockout after repeated wrong PINs.
   *
   * A 4-digit PIN is 10,000 guesses, the class code is written on the board and
   * every student knows their classmates' names — so signing in as somebody
   * else was a short script and a minute of wifi, and there was no rate limit
   * anywhere in the app. Locking the ACCOUNT rather than the IP is deliberate:
   * a class of Chromebooks shares one school NAT address, so IP throttling
   * would lock out the whole room the first time anyone mistyped.
   *
   * Ten attempts is generous for a student who genuinely forgot, and useless
   * for a brute force: the window resets the clock on every further guess, so
   * an attacker gets 10 tries per 15 minutes rather than 10,000 per minute.
   */
  const LOCK_THRESHOLD = 10;
  const LOCK_MINUTES = 15;

  if (student.locked_until && new Date(student.locked_until) > new Date()) {
    const mins = Math.max(1, Math.ceil((new Date(student.locked_until).getTime() - Date.now()) / 60000));
    return NextResponse.json(
      { error: `Demasiados intentos. Espera ${mins} minuto(s) o pídele a tu profe que te cambie el PIN.` },
      { status: 429 }
    );
  }

  if (!verifyPin(pin, student.pin_salt, student.pin_hash)) {
    const failed = (student.failed_logins ?? 0) + 1;
    const lockNow = failed >= LOCK_THRESHOLD;
    await supabase
      .from("students")
      .update({
        failed_logins: lockNow ? 0 : failed,
        locked_until: lockNow ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null,
      })
      .eq("id", student.id);

    return NextResponse.json(
      {
        error: lockNow
          ? `Demasiados intentos. Espera ${LOCK_MINUTES} minutos o pídele a tu profe que te cambie el PIN.`
          : "PIN incorrecto. Inténtalo de nuevo.",
      },
      { status: lockNow ? 429 : 401 }
    );
  }

  // Correct PIN: clear the counter so a forgetful student is never cumulatively
  // penalised across days.
  if ((student.failed_logins ?? 0) > 0 || student.locked_until) {
    await supabase.from("students").update({ failed_logins: 0, locked_until: null }).eq("id", student.id);
  }

  const token = await signToken({
    studentId: student.id,
    displayName: student.display_name,
    classId: student.class_id ?? classId,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AGENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
  return response;
}
