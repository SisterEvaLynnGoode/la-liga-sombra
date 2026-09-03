import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getSkillWeights } from "@/lib/mastery";
import { generateStakeoutQuestions } from "@/lib/question-generator";
import { getOverdueReviewTerms } from "@/lib/spaced-repetition";
import UnitPlayer from "./UnitPlayer";
import { loadUnitContent } from "@/lib/game/unit-content";

// Unit content registry — add new units here as they're built
function getUnitContent(unitNumber: number) {
  // One registry for every route — see lib/game/unit-content.ts for why.
  return loadUnitContent(unitNumber);
}

interface PageProps {
  params: { unitId: string };
}

export default async function PlayPage({ params }: PageProps) {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const unitNumber = parseInt(params.unitId, 10);
  if (isNaN(unitNumber) || unitNumber < 1) redirect("/mission-board");

  const content = getUnitContent(unitNumber);
  // If unit content hasn't shipped, send the student to the gate URL — the gate
  // page renders a friendly Próximamente panel instead of silently redirecting.
  if (!content) redirect(`/play/${unitNumber}/gate`);

  const supabase = createClient();

  // Resolve Supabase unit row
  const { data: unitRows } = await supabase
    .from("units")
    .select("id")
    .eq("number", unitNumber)
    .limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!unitId) redirect("/mission-board");

  // Get student's progress for this unit
  const { data: progressRows } = await supabase
    .from("unit_progress")
    .select("status, case_solved")
    .eq("student_id", session.studentId)
    .eq("unit_id", unitId)
    .limit(1);

  const progress = (progressRows as Array<{ status: string; case_solved: boolean }> | null)?.[0];

  // Locked units are not playable
  if (!progress || progress.status === "locked") redirect("/mission-board");

  // Fetch stage_index separately (added in migration 003 — may be missing on old rows)
  const { data: stageRows } = await supabase
    .from("unit_progress")
    .select("stage_index")
    .eq("student_id", session.studentId)
    .eq("unit_id", unitId)
    .limit(1);

  const rawStageIndex = (stageRows as Array<{ stage_index: number | null }> | null)?.[0]?.stage_index;
  const initialStageIndex = rawStageIndex ?? 0;
  const isCompleted = progress.status === "completed" || progress.case_solved;

  // Pre-generate stakeout questions using student's skill weights.
  // Only needed for units whose last stage is a lineup (the stakeout precedes it).
  // ~25% of the deck is interleaved review from prior units' overdue terms (B1).
  const hasLineup = content.stages[content.stages.length - 1]?.type === "lineup";
  const stakeoutQuestions = hasLineup
    ? generateStakeoutQuestions(
        content,
        await getSkillWeights(
          session.studentId,
          unitId,
          content.vocab.map((v) => v.spanish)
        ),
        await getOverdueReviewTerms(session.studentId, supabase, unitNumber)
      )
    : [];

  return (
    <UnitPlayer
      content={content}
      unitId={unitId}
      unitNumber={unitNumber}
      classId={session.classId}
      agentName={session.displayName}
      initialStageIndex={initialStageIndex}
      isCompleted={isCompleted}
      stakeoutQuestions={stakeoutQuestions}
    />
  );
}
