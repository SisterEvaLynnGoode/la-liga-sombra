/**
 * POST /api/game/student-flag
 *
 * Canonical endpoint for all student support flags.
 * Writes to the student_flags table.
 *
 * Automatically fires a `repeated_skipping` flag when a student
 * has skipped 3+ stages in the same unit within the last hour.
 *
 * Never returns an error that would block the student.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: true });

  const body = await request.json().catch(() => ({})) as {
    flagType?: string;
    unitId?: string;
    context?: Record<string, unknown>;
  };

  if (!body.flagType) {
    return NextResponse.json({ error: "Missing flagType" }, { status: 400 });
  }

  const supabase = createClient();

  // Insert the primary flag
  await supabase.from("student_flags").insert({
    student_id: session.studentId,
    flag_type:  body.flagType,
    unit_id:    body.unitId ?? null,
    context:    body.context ?? {},
  }).then(({ error }) => {
    if (error) console.error("student_flag insert error:", error);
  });

  // ── Repeated-skipping detection ──────────────────────────────────────────
  // If this is a stage_skipped event, check how many skips the student
  // has in this unit in the last 60 minutes. Fire repeated_skipping if ≥ 3.
  if (body.flagType === "stage_skipped" && body.unitId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentSkips } = await supabase
      .from("student_flags")
      .select("id")
      .eq("student_id", session.studentId)
      .eq("unit_id", body.unitId)
      .eq("flag_type", "stage_skipped")
      .gte("created_at", oneHourAgo);

    const skipCount = (recentSkips ?? []).length; // includes the one just inserted
    if (skipCount >= 3) {
      // Check if we already fired repeated_skipping in this window
      const { data: existing } = await supabase
        .from("student_flags")
        .select("id")
        .eq("student_id", session.studentId)
        .eq("unit_id", body.unitId)
        .eq("flag_type", "repeated_skipping")
        .gte("created_at", oneHourAgo)
        .limit(1);

      if (!existing?.length) {
        await supabase.from("student_flags").insert({
          student_id: session.studentId,
          flag_type:  "repeated_skipping",
          unit_id:    body.unitId,
          context:    { skipCount, windowMinutes: 60 },
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
