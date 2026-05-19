import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { UnitContent } from "@/lib/types/unit-content";
import { getSkillWeights } from "@/lib/mastery";
import { generateStakeoutQuestions } from "@/lib/question-generator";
import UnitPlayer from "../UnitPlayer";

// ── Which unit numbers have Cold Case content built ───────────────────────────
const COLD_CASE_UNITS = new Set([1]);

// Cold case content loader
function getColdCaseContent(unitNumber: number): UnitContent | null {
  if (!COLD_CASE_UNITS.has(unitNumber)) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@/content/unit-0${unitNumber}-cold.json`) as UnitContent;
  } catch {
    return null;
  }
}

interface PageProps {
  params: { unitId: string };
}

export default async function ColdCasePage({ params }: PageProps) {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const unitNumber = parseInt(params.unitId, 10);
  if (isNaN(unitNumber) || unitNumber < 1) redirect("/mission-board");

  const content = getColdCaseContent(unitNumber);
  if (!content) redirect("/mission-board"); // cold case not built for this unit yet

  const supabase = createClient();

  // Resolve Supabase unit row
  const { data: unitRows } = await supabase
    .from("units").select("id").eq("number", unitNumber).limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!unitId) redirect("/mission-board");

  // Verify cold case is unlocked: original must be completed ≥24h ago
  const { data: progressRows } = await supabase
    .from("unit_progress")
    .select("status, case_solved, completed_at")
    .eq("student_id", session.studentId)
    .eq("unit_id", unitId)
    .limit(1);

  const progress = (progressRows as Array<{
    status: string; case_solved: boolean; completed_at: string | null;
  }> | null)?.[0];

  // Must be completed
  if (!progress?.case_solved && progress?.status !== "completed") redirect("/mission-board");

  // Must be ≥24h since completion
  if (progress.completed_at) {
    const completedMs = new Date(progress.completed_at).getTime();
    const hoursSince = (Date.now() - completedMs) / 3_600_000;
    if (hoursSince < 24) redirect("/mission-board"); // Too soon — mission board shows countdown
  }

  // Generate stakeout questions from cold content
  const stakeoutQuestions = content.stages[content.stages.length - 1]?.type === "lineup"
    ? generateStakeoutQuestions(
        content,
        await getSkillWeights(session.studentId, unitId, content.vocab.map((v) => v.spanish))
      )
    : [];

  return (
    <UnitPlayer
      content={content}
      unitId={unitId}
      unitNumber={unitNumber}
      classId={session.classId}
      initialStageIndex={0}
      isCompleted={false}
      stakeoutQuestions={stakeoutQuestions}
      difficulty="cold"
    />
  );
}
