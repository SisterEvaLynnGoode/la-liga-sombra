import { NextRequest, NextResponse } from "next/server";
import { signToken, TEACHER_COOKIE, THIRTY_DAYS } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  const correct = process.env.TEACHER_PASSWORD;
  if (!correct) {
    return NextResponse.json({ error: "Teacher access is not configured. Set TEACHER_PASSWORD." }, { status: 500 });
  }

  if (!password || password !== correct) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await signToken({ role: "teacher" });
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
