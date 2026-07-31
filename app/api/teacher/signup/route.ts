import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signToken, TEACHER_COOKIE, THIRTY_DAYS } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/teacher";
import { generateClassCode } from "@/lib/auth/validation";

/**
 * Open-beta teacher signup.
 *
 * Previously this accepted a redemption code, and a codeless signup started a
 * 30-day trial that LOCKED THE TEACHER OUT on expiry. For open beta there is no
 * code and no expiry: anyone can create an account.
 *
 * It also creates the teacher's first class in the same request. Account
 * creation and "get a code to give your students" used to be two separate
 * screens, and a teacher who stopped after the first one had an account no
 * student could join. One step, one code, done.
 *
 * The redemption_codes table and the admin minting UI are left in place — they
 * are simply no longer on the signup path, so paid cohorts can be reintroduced
 * later without rebuilding anything.
 */

const DEFAULT_PERIOD = "Period 1";

export async function POST(request: NextRequest) {
  const { email, name, password, periodName } = (await request.json()) as {
    email?: string; name?: string; password?: string; periodName?: string;
  };

  const cleanEmail = (email ?? "").trim().toLowerCase();
  const cleanName = (name ?? "").trim();
  const cleanPeriod = (periodName ?? "").trim() || DEFAULT_PERIOD;

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!cleanName) {
    return NextResponse.json({ error: "Enter the name your students will see." }, { status: 400 });
  }

  const supabase = createClient();

  const { data: existing } = await supabase.from("teachers").select("id").eq("email", cleanEmail).limit(1);
  if ((existing as unknown[] | null)?.length) {
    return NextResponse.json(
      { error: "An account with that email already exists. Log in instead." },
      { status: 409 }
    );
  }

  const { hash, salt } = hashPassword(password);
  const { data: teacher, error: insErr } = await supabase
    .from("teachers")
    .insert({
      email: cleanEmail,
      name: cleanName,
      password_hash: hash,
      password_salt: salt,
      plan: "beta",
      status: "active",
      trial_ends_at: null, // open beta — nothing expires
    })
    .select("id")
    .single();

  if (insErr || !teacher) {
    console.error("teacher signup insert error:", insErr);
    return NextResponse.json({ error: "Could not create account. Try again." }, { status: 500 });
  }

  const teacherId = (teacher as { id: string }).id;

  // First class, same request. Retry on code collision.
  let classCode = "";
  for (let i = 0; i < 10; i++) {
    const candidate = generateClassCode();
    const { data: clash } = await supabase
      .from("classes").select("id").eq("class_code", candidate).maybeSingle();
    if (!clash) { classCode = candidate; break; }
  }

  if (classCode) {
    const { error: classErr } = await supabase.from("classes").insert({
      class_code: classCode,
      teacher_name: cleanName,
      period_name: cleanPeriod,
      teacher_id: teacherId,
    });
    // A failed class insert must not fail the signup — the account is already
    // real, and they can add a class from Settings.
    if (classErr) {
      console.error("first-class insert error:", classErr);
      classCode = "";
    }
  }

  const token = await signToken({ role: "teacher", teacherId, isAdmin: false });
  const response = NextResponse.json({ ok: true, classCode, periodName: cleanPeriod });
  response.cookies.set(TEACHER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
  return response;
}
