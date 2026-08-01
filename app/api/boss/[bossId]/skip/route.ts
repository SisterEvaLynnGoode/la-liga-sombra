import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { loadBossContent } from "@/lib/boss/content";

interface Params { params: { bossId: string } }

/** POST — skip boss and unlock the next unit */
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Which unit this boss unlocks comes from the boss's own content file.
  const content = loadBossContent(params.bossId);
  if (!content) return NextResponse.json({ error: "Unknown boss" }, { status: 400 });
  const nextUnit = content.nextUnit;

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
