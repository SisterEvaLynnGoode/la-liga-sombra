/**
 * POST /api/game/listening-flag
 *
 * Thin wrapper around /api/game/student-flag for listening comprehension flags.
 * Kept for backward compatibility — new code should call /api/game/student-flag directly.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const FLAG_MAP: Record<string, string> = {
  needs_support:       "needs_listening_support",
  transcript_revealed: "transcript_revealed",
  listening_skipped:   "listening_skipped",
};

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: true });

  const body = await request.json().catch(() => ({})) as {
    unitId?: string;
    flag?: string;
  };

  const { unitId, flag } = body;
  if (!flag || !FLAG_MAP[flag]) {
    return NextResponse.json({ error: "Invalid flag" }, { status: 400 });
  }

  const supabase = createClient();
  try {
    await supabase.from("student_flags").insert({
      student_id: session.studentId,
      flag_type:  FLAG_MAP[flag],
      unit_id:    unitId ?? null,
      context:    {},
    });
  } catch { /* silent */ }

  return NextResponse.json({ ok: true });
}
