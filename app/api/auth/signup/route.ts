import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signToken, AGENT_COOKIE, THIRTY_DAYS } from "@/lib/auth/session";
import { generateSalt, hashPin } from "@/lib/auth/pin";
import { validateDisplayName, validateClassCode, validatePin } from "@/lib/auth/validation";
import type { UnitStatus } from "@/lib/types/database";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { classCode, displayName, pin } = body as Record<string, string>;

  // ── Validate inputs ──────────────────────────────────────────────────────
  const codeResult = validateClassCode(classCode);
  if (!codeResult.valid) return NextResponse.json({ error: codeResult.error }, { status: 400 });

  const nameResult = validateDisplayName(displayName);
  if (!nameResult.valid) return NextResponse.json({ error: nameResult.error }, { status: 400 });

  const pinResult = validatePin(pin);
  if (!pinResult.valid) return NextResponse.json({ error: pinResult.error }, { status: 400 });

  const supabase = createClient();
  const normalCode = classCode.trim().toUpperCase();

  // ── Verify class exists ──────────────────────────────────────────────────
  const { data: clsData } = await supabase
    .from("classes")
    .select("id")
    .eq("class_code", normalCode)
    .limit(1);
  const clsRows = clsData as Array<{ id: string }> | null;

  const classId = clsRows?.[0]?.id;
  if (!classId) {
    return NextResponse.json({ error: "Código de clase no encontrado. Pregúntale a tu profe el código correcto." }, { status: 404 });
  }

  // ── Check name uniqueness within class ───────────────────────────────────
  const normalName = displayName.trim();
  const { data: existingData } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId)
    .ilike("display_name", normalName)
    .limit(1);
  const existingRows = existingData as Array<{ id: string }> | null;

  if (existingRows && existingRows.length > 0) {
    return NextResponse.json({ error: "Ese nombre ya existe en tu clase. Elige otro diferente." }, { status: 409 });
  }

  // ── Create student ───────────────────────────────────────────────────────
  const salt = generateSalt();
  const pinHash = hashPin(pin, salt);

  const { data: student, error: insertErr } = await supabase
    .from("students")
    .insert({
      display_name: normalName,
      class_code: normalCode,
      class_id: classId,
      pin_hash: pinHash,
      pin_salt: salt,
    })
    .select("id")
    .single();

  if (insertErr || !student) {
    console.error("Student insert error:", insertErr);
    return NextResponse.json({ error: "No se pudo crear la cuenta. Inténtalo de nuevo." }, { status: 500 });
  }

  // ── Initialize unit_progress (unit 1 available, rest locked) ─────────────
  const { data: units } = await supabase.from("units").select("id").order("number");
  if (units && units.length > 0) {
    const progressRows = units.map((u, i) => ({
      student_id: student.id,
      unit_id: u.id,
      status: (i === 0 ? "available" : "locked") as UnitStatus,
      case_solved: false,
      criminal_caught: false,
    }));
    await supabase.from("unit_progress").insert(progressRows);
  }

  // ── Set session cookie ───────────────────────────────────────────────────
  const token = await signToken({
    studentId: student.id,
    displayName: normalName,
    classId: classId,
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
