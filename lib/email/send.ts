/**
 * Outbound email.
 *
 * There is no email provider configured on this project, so this module is
 * deliberately pluggable and deliberately honest about it:
 *
 *   RESEND_API_KEY set  → sends for real via Resend.
 *   not set             → does NOT send, and says so in the return value.
 *
 * The important part is the second case. Callers must branch on `delivered`
 * rather than assuming the mail went out, because silently pretending to have
 * emailed a password-reset link is how people get locked out of their accounts
 * with no idea why. Where nothing can be delivered, the reset flow surfaces the
 * link to the owner console instead so beta teachers can still be helped.
 *
 * Adding delivery later is one env var and a verified sending domain; nothing
 * that calls this needs to change.
 */

export interface SendResult {
  delivered: boolean;
  /** Why not, when delivered is false. Safe to log; never shown to a visitor. */
  reason?: string;
}

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

const FROM = process.env.EMAIL_FROM ?? "La Liga Sombra <noreply@la-liga-sombra.app>";

export async function sendEmail(mail: Mail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { delivered: false, reason: "no RESEND_API_KEY configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [mail.to], subject: mail.subject, text: mail.text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { delivered: false, reason: `resend ${res.status}: ${body.slice(0, 200)}` };
    }
    return { delivered: true };
  } catch (e) {
    return { delivered: false, reason: `resend threw: ${(e as Error).message}` };
  }
}

/** True when real delivery is possible. Used to decide what to tell the user. */
export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
