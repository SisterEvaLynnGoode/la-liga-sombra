/**
 * Teacher password-reset tokens.
 *
 * Rules this file enforces, because getting any of them wrong is a real
 * account-takeover bug rather than a bug report:
 *
 *  - The raw token is returned to the caller ONCE and never stored. Only its
 *    SHA-256 hash goes in the database, so a leak of password_resets cannot be
 *    replayed to seize an account.
 *  - Tokens expire (60 minutes) and are single-use.
 *  - Requesting a reset invalidates that teacher's earlier outstanding tokens,
 *    so an old link in an old email stops working.
 *  - Nothing here reveals whether an email exists — that decision belongs to
 *    the route, which always answers the same way.
 */

import { createHash, randomBytes, timingSafeEqual } from "crypto";
import type { createClient } from "@/lib/supabase/server";

type Supa = ReturnType<typeof createClient>;

const TTL_MINUTES = 60;

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Constant-time compare so token checks cannot be timed. */
export function tokensMatch(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Issue a reset token for a teacher. Returns the RAW token — the only time it
 * exists in readable form. Caller is responsible for delivering it.
 */
export async function createResetToken(teacherId: string, supabase: Supa): Promise<string> {
  // Retire any outstanding tokens for this teacher first.
  await supabase
    .from("password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("teacher_id", teacherId)
    .is("used_at", null);

  const raw = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60_000).toISOString();

  const { error } = await supabase.from("password_resets").insert({
    teacher_id: teacherId,
    token_hash: hashToken(raw),
    expires_at: expiresAt,
  });
  if (error) throw new Error(`could not create reset token: ${error.message}`);

  return raw;
}

export interface ResetLookup {
  id: string;
  teacherId: string;
}

/**
 * Resolve a raw token to a live reset row, or null. Checks existence, expiry
 * and single-use in one place so no caller can forget one of them.
 */
export async function findLiveReset(rawToken: string, supabase: Supa): Promise<ResetLookup | null> {
  if (!rawToken || rawToken.length < 20) return null;

  const { data } = await supabase
    .from("password_resets")
    .select("id, teacher_id, token_hash, expires_at, used_at")
    .eq("token_hash", hashToken(rawToken))
    .limit(1);

  const row = (data as Array<{
    id: string; teacher_id: string; token_hash: string; expires_at: string; used_at: string | null;
  }> | null)?.[0];

  if (!row) return null;
  if (!tokensMatch(row.token_hash, hashToken(rawToken))) return null;
  if (row.used_at) return null;
  if (Date.parse(row.expires_at) < Date.now()) return null;

  return { id: row.id, teacherId: row.teacher_id };
}

/** Burn the token. Call this only after the password is actually changed. */
export async function consumeReset(resetId: string, supabase: Supa): Promise<void> {
  await supabase
    .from("password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("id", resetId)
    .is("used_at", null);
}

export const RESET_TTL_MINUTES = TTL_MINUTES;
