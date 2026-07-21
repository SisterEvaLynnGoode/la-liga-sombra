import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signToken, TEACHER_COOKIE, THIRTY_DAYS } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/teacher";

// New-teacher signup. Two paths:
//  • WITH an access code (the Teachers Pay Teachers delivery mechanism) → full plan.
//  • WITHOUT a code → self-serve 30-day free trial (the TikTok/marketing CTA).
const TRIAL_DAYS = 30;

export async function POST(request: NextRequest) {
  const { code, email, name, password } = await request.json() as {
    code?: string; email?: string; name?: string; password?: string;
  };

  const cleanCode = (code ?? "").trim().toUpperCase();
  const cleanEmail = (email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const supabase = createClient();

  // If a code was supplied it must be real + unused. No code = free trial.
  let codeRow: { id: string; plan: string; redeemed_at: string | null } | undefined;
  if (cleanCode) {
    const { data: codeRows } = await supabase
      .from("redemption_codes").select("id, plan, redeemed_at").eq("code", cleanCode).limit(1);
    codeRow = (codeRows as Array<{ id: string; plan: string; redeemed_at: string | null }> | null)?.[0];
    if (!codeRow) return NextResponse.json({ error: "That access code isn't valid." }, { status: 400 });
    if (codeRow.redeemed_at) return NextResponse.json({ error: "That access code has already been used." }, { status: 409 });
  }

  // Email must be free
  const { data: existing } = await supabase.from("teachers").select("id").eq("email", cleanEmail).limit(1);
  if ((existing as unknown[] | null)?.length) {
    return NextResponse.json({ error: "An account with that email already exists. Log in instead." }, { status: 409 });
  }

  const trialEnds = codeRow ? null : new Date(Date.now() + TRIAL_DAYS * 86_400_000).toISOString();

  const { hash, salt } = hashPassword(password);
  const { data: teacher, error: insErr } = await supabase
    .from("teachers")
    .insert({
      email: cleanEmail,
      name: (name ?? "").trim() || null,
      password_hash: hash,
      password_salt: salt,
      plan: codeRow ? codeRow.plan : "trial",
      status: "active",
      trial_ends_at: trialEnds,
    })
    .select("id")
    .single();
  if (insErr || !teacher) {
    console.error("teacher signup insert error:", insErr);
    return NextResponse.json({ error: "Could not create account. Try again." }, { status: 500 });
  }

  // Redeem the code (guard against a race: only if still unredeemed)
  if (codeRow) {
    await supabase.from("redemption_codes")
      .update({ redeemed_by_teacher_id: (teacher as { id: string }).id, redeemed_at: new Date().toISOString() })
      .eq("id", codeRow.id).is("redeemed_at", null);
  }

  const token = await signToken({ role: "teacher", teacherId: (teacher as { id: string }).id, isAdmin: false });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TEACHER_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: THIRTY_DAYS, path: "/",
  });
  return response;
}
