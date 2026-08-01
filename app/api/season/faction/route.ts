import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { resolveFaction, isFactionId, FACTIONS } from "@/lib/season/factions";

/** Read the current student's faction, and whether they still get to choose. */
export async function GET() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient();
  const { faction, endedBoss } = await resolveForStudent(supabase, session.studentId);

  return NextResponse.json({
    faction,
    detail: faction ? FACTIONS[faction] : null,
    /** True only when nothing has assigned them yet — the picker's gate. */
    mayChoose: faction === null,
    /** Whether the faction came from their own boss ending, for the UI copy. */
    fromBoss: Boolean(endedBoss),
  });
}

/** Pick a side. Only available to a student who does not already have one. */
export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { faction?: string };
  if (!isFactionId(body.faction)) {
    return NextResponse.json({ error: "Unknown faction" }, { status: 400 });
  }

  const supabase = createClient();
  const { faction: current } = await resolveForStudent(supabase, session.studentId);

  // A faction is the consequence of a decision students already made at the end
  // of Reloj de Arena. Letting them re-pick here would turn that decision into a
  // menu, and would also let anyone hop to whichever faction is winning.
  if (current) {
    return NextResponse.json(
      { error: "Ya tienes bando.", faction: current },
      { status: 409 },
    );
  }

  const { error } = await supabase
    .from("students")
    .update({ faction: body.faction })
    .eq("id", session.studentId);

  if (error) return NextResponse.json({ error: "Could not save." }, { status: 500 });

  return NextResponse.json({ ok: true, faction: body.faction, detail: FACTIONS[body.faction] });
}

async function resolveForStudent(
  supabase: ReturnType<typeof createClient>,
  studentId: string,
) {
  const { data: rows } = await supabase
    .from("students").select("faction").eq("id", studentId).limit(1);
  const override = (rows as Array<{ faction: string | null }> | null)?.[0]?.faction ?? null;

  const { data: bossRows } = await supabase
    .from("boss_progress")
    .select("final_ending")
    .eq("primary_student_id", studentId)
    .eq("boss_id", "unit-15-reloj-arena")
    .limit(1);
  const endedBoss = (bossRows as Array<{ final_ending: string | null }> | null)?.[0]?.final_ending ?? null;

  return { faction: resolveFaction({ override, bossEnding: endedBoss }), endedBoss };
}
