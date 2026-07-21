import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signToken, TEACHER_COOKIE, THIRTY_DAYS } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/teacher";

// Teacher login by email + password (non-owner teachers). The owner keeps using
// /api/teacher/auth with the shared password.
export async function POST(request: NextRequest) {
  const { email, password } = await request.json() as { email?: string; password?: string };
  const cleanEmail = (email ?? "").trim().toLowerCase();
  if (!cleanEmail || !password) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });

  const supabase = createClient();
  const { data: rows } = await supabase
    .from("teachers").select("id, password_hash, password_salt, is_admin, status").eq("email", cleanEmail).limit(1);
  const t = (rows as Array<{ id: string; password_hash: string | null; password_salt: string | null; is_admin: boolean; status: string }> | null)?.[0];

  // Uniform error to avoid leaking which emails exist
  const bad = () => NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  if (!t || !t.password_hash || !t.password_salt) return bad();
  if (!verifyPassword(password, t.password_salt, t.password_hash)) return bad();
  if (t.status !== "active") return NextResponse.json({ error: "This account is inactive. Contact support." }, { status: 403 });

  const token = await signToken({ role: "teacher", teacherId: t.id, isAdmin: t.is_admin });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TEACHER_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: THIRTY_DAYS, path: "/",
  });
  return response;
}
