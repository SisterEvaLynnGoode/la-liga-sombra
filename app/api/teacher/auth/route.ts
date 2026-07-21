import { NextRequest, NextResponse } from "next/server";
import { signToken, TEACHER_COOKIE, THIRTY_DAYS } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

// Owner/admin login via the shared TEACHER_PASSWORD. Resolves to the admin
// teacher account so the session carries a teacherId (Phase 2). Other teachers
// use /api/teacher/login (email + password).
export async function POST(request: NextRequest) {
  const { password } = await request.json();

  const correct = process.env.TEACHER_PASSWORD;
  if (!correct) {
    return NextResponse.json({ error: "Teacher access is not configured. Set TEACHER_PASSWORD." }, { status: 500 });
  }

  if (!password || password !== correct) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const supabase = createClient();
  const { data: adminRows } = await supabase
    .from("teachers").select("id").eq("is_admin", true).order("created_at").limit(1);
  const adminId = (adminRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!adminId) {
    return NextResponse.json({ error: "No admin account found. Run the teacher-accounts migration." }, { status: 500 });
  }

  const token = await signToken({ role: "teacher", teacherId: adminId, isAdmin: true });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TEACHER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(TEACHER_COOKIE);
  return response;
}
