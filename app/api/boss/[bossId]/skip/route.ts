import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

// Which unit to unlock when each boss is skipped or completed
const BOSS_UNLOCKS_UNIT: Record<string, number> = {
  "unit-5-eclipse": 6,
};

interface Params { params: { bossId: string } }

/** POST — skip boss and unlock the next unit */
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const nextUnit = BOSS_UNLOCKS_UNIT[params.bossId];
  if (!nextUnit) return NextResponse.json({ error: "Unknown boss" }, { status: 400 });

  const supabase = createClient();

  // Mark boss as skipped
  await supabase.from("boss_progress").upsert({
    primary_student_id: session.studentId,
    boss_id: params.bossId,
    skipped_at: new Date().toISOString(),
    last_saved_at: new Date().toISOString(),
  }, { onConflict: "primary_student_id,boss_id" });

  // Unlock next unit
  const { data: unitRows } = await supabase
    .from("units").select("id").eq("number", nextUnit).limit(1);
  const nextUnitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;

  if (nextUnitId) {
    await supabase.from("unit_progress")
      .update({ status: "available" })
      .eq("student_id", session.studentId)
      .eq("unit_id", nextUnitId)
      .eq("status", "locked");
  }

  return NextResponse.json({ ok: true, unlockedUnit: nextUnit });
}
