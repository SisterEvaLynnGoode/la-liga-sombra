import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/game/stakeout-reward
 *
 * Called only when a student passes the Vigilancia stakeout.
 * Awards:
 *   • vigilancia_exitosa badge (once per unit)
 *   • 100-point bonus attempt (activity_type = stakeout, score = 100)
 */
export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { unitNumber } = await request.json() as { unitNumber: number };
  if (!unitNumber) return NextResponse.json({ error: "Missing unitNumber" }, { status: 400 });

  const supabase = createClient();

  const { data: unitRows } = await supabase
    .from("units").select("id").eq("number", unitNumber).limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!unitId) return NextResponse.json({ error: "Unit not found" }, { status: 404 });

  const newBadges: string[] = [];

  // Badge (deduplicated per unit)
  const { data: existing } = await supabase
    .from("badges")
    .select("id")
    .eq("student_id", session.studentId)
    .eq("badge_type", "vigilancia_exitosa")
    .eq("unit_id", unitId)
    .limit(1);

  if (!existing?.length) {
    await supabase.from("badges").insert({
      student_id: session.studentId,
      badge_type: "vigilancia_exitosa",
      unit_id: unitId,
    });
    newBadges.push("vigilancia_exitosa");
  }

  // 100-point bonus attempt
  await supabase.from("attempts").insert({
    student_id: session.studentId,
    unit_id: unitId,
    activity_type: "stakeout",
    score: 100,
    max_score: 100,
    time_spent_seconds: 0,
  });

  return NextResponse.json({ ok: true, newBadges });
}
