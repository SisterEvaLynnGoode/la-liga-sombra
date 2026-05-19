import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { BossContent, BossState } from "@/lib/types/boss";
import BossPlayer from "./BossPlayer";

function loadBossContent(bossId: string): BossContent | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@/content/bosses/${bossId}.json`) as BossContent;
  } catch { return null; }
}

interface PageProps { params: { bossId: string } }

export default async function BossPage({ params }: PageProps) {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const content = loadBossContent(params.bossId);
  if (!content) redirect("/mission-board");

  const supabase = createClient();

  // Ensure student has a boss_progress row (unit-complete creates it; fallback here)
  const { data: rows } = await supabase
    .from("boss_progress")
    .select("*")
    .eq("primary_student_id", session.studentId)
    .eq("boss_id", params.bossId)
    .limit(1);

  const rawRow = (rows as unknown[])?.[0] as Record<string, unknown> | undefined;

  // Verify the prerequisite unit is completed
  if (!rawRow) {
    const { data: unitRows } = await supabase.from("units").select("id").eq("number", content.unlockAfterUnit).limit(1);
    const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
    const { data: prog } = await supabase.from("unit_progress").select("case_solved").eq("student_id", session.studentId).eq("unit_id", unitId ?? "__none__").limit(1);
    if (!(prog as Array<{ case_solved: boolean }> | null)?.[0]?.case_solved) redirect("/mission-board");

    // Create row now
    await supabase.from("boss_progress").insert({
      primary_student_id: session.studentId,
      boss_id: params.bossId,
      current_stage: 0,
    });
  }

  const initialState: BossState = {
    id: (rawRow?.id as string) ?? "",
    primaryStudentId: session.studentId,
    partnerStudentId: (rawRow?.partner_student_id as string | null) ?? null,
    bossId: params.bossId,
    difficulty: (rawRow?.difficulty as BossState["difficulty"]) ?? null,
    currentStage: (rawRow?.current_stage as number) ?? 0,
    stageData: (rawRow?.stage_data as Record<string, unknown>) ?? {},
    ethicalChoices: (rawRow?.ethical_choices as BossState["ethicalChoices"]) ?? [],
    partnerName: (rawRow?.partner_name as string | null) ?? null,
    startedAt: (rawRow?.started_at as string) ?? new Date().toISOString(),
    lastSavedAt: (rawRow?.last_saved_at as string) ?? new Date().toISOString(),
    completedAt: (rawRow?.completed_at as string | null) ?? null,
    skippedAt: (rawRow?.skipped_at as string | null) ?? null,
    finalScore: (rawRow?.final_score as number | null) ?? null,
    finalEnding: (rawRow?.final_ending as BossState["finalEnding"]) ?? null,
  };

  return (
    <BossPlayer
      content={content}
      initialState={initialState}
      displayName={session.displayName}
    />
  );
}
