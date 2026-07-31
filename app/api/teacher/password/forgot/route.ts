import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createResetToken, RESET_TTL_MINUTES } from "@/lib/auth/password-reset";
import { sendEmail, emailConfigured } from "@/lib/email/send";

/**
 * Request a password reset.
 *
 * ALWAYS returns the same 200 body regardless of whether the email exists.
 * Anything else turns this endpoint into a way to test which teachers have
 * accounts here, which is a privacy leak about real people's employment.
 *
 * The `emailConfigured` flag in the response is about the SERVER's capability,
 * not about the submitted address, so it leaks nothing.
 */
export async function POST(request: NextRequest) {
  const { email } = (await request.json().catch(() => ({}))) as { email?: string };
  const cleanEmail = (email ?? "").trim().toLowerCase();

  const generic = NextResponse.json({
    ok: true,
    emailConfigured: emailConfigured(),
  });

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) return generic;

  const supabase = createClient();
  const { data } = await supabase
    .from("teachers")
    .select("id, status")
    .eq("email", cleanEmail)
    .limit(1);

  const teacher = (data as Array<{ id: string; status: string }> | null)?.[0];
  if (!teacher || teacher.status !== "active") return generic;

  try {
    const raw = await createResetToken(teacher.id, supabase);
    const origin = request.nextUrl.origin;
    const link = `${origin}/teacher/reset?token=${encodeURIComponent(raw)}`;

    const result = await sendEmail({
      to: cleanEmail,
      subject: "Reset your La Liga Sombra password",
      text:
        `Someone asked to reset the password for this La Liga Sombra teacher account.\n\n` +
        `Open this link to choose a new password:\n${link}\n\n` +
        `The link works once and expires in ${RESET_TTL_MINUTES} minutes.\n\n` +
        `If this wasn't you, ignore this email — nothing has changed.\n`,
    });

    if (!result.delivered) {
      // Do not pretend. Log the link so the owner can retrieve it from the
      // admin console and hand it to the teacher during beta.
      console.warn(
        `[password-reset] email NOT delivered (${result.reason}). Reset link for ${cleanEmail}: ${link}`
      );
    }
  } catch (e) {
    console.error("[password-reset] could not create token:", e);
  }

  return generic;
}
