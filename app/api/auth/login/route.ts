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

  type StudentRow = { id: string; display_name: string; class_id: string | null; pin_hash: string | null; pin_salt: string | null };

  // Find student by name + class (case-insensitive)
  const { data: stuData } = await supabase
    .from("students")
    .select("id, display_name, class_id, pin_hash, pin_salt")
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
      .select("id, display_name, class_id, pin_hash, pin_salt")
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

  if (!verifyPin(pin, student.pin_salt, student.pin_hash)) {
    return NextResponse.json({ error: "PIN incorrecto. Inténtalo de nuevo." }, { status: 401 });
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
