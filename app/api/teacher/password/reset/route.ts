import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/auth/teacher";
import { findLiveReset, consumeReset } from "@/lib/auth/password-reset";
import { signToken, TEACHER_COOKIE, THIRTY_DAYS } from "@/lib/auth/session";

/**
 * Complete a password reset.
 *
 * The token is burned only AFTER the password write succeeds — burning first
 * would strand a teacher with a dead link and an unchanged password if the
 * update failed.
 *
 * On success the teacher is logged straight in. Making someone who just proved
 * control of their inbox type the password they set four seconds ago is pure
 * friction, and this is the exact moment they are most likely to give up.
 */
export async function POST(request: NextRequest) {
  const { token, password } = (await request.json().catch(() => ({}))) as {
    token?: string; password?: string;
  };

  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const supabase = createClient();
  const reset = await findLiveReset(token ?? "", supabase);
  if (!reset) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  const { hash, salt } = hashPassword(password);
  const { error: updErr } = await supabase
    .from("teachers")
    .update({ password_hash: hash, password_salt: salt })
    .eq("id", reset.teacherId);

  if (updErr) {
    console.error("[password-reset] update failed:", updErr);
    return NextResponse.json({ error: "Could not update the password. Try again." }, { status: 500 });
  }

  await consumeReset(reset.id, supabase);

  const { data: tRows } = await supabase
    .from("teachers").select("is_admin").eq("id", reset.teacherId).limit(1);
  const isAdmin = (tRows as Array<{ is_admin: boolean }> | null)?.[0]?.is_admin ?? false;

  const jwt = await signToken({ role: "teacher", teacherId: reset.teacherId, isAdmin });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TEACHER_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
  return response;
}
