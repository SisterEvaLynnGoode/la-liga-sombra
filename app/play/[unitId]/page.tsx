import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { UnitContent } from "@/lib/types/unit-content";
import UnitPlayer from "./UnitPlayer";

// Unit content registry — add new units here as they're built
function getUnitContent(unitNumber: number): UnitContent | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 1) return require("@/content/unit-01.json") as UnitContent;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 2) return require("@/content/unit-02.json") as UnitContent;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 3) return require("@/content/unit-03.json") as UnitContent;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 4) return require("@/content/unit-04.json") as UnitContent;
  return null;
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
  if (!content) redirect("/mission-board"); // unit not built yet

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

  return (
    <UnitPlayer
      content={content}
      unitId={unitId}
      unitNumber={unitNumber}
      classId={session.classId}
      initialStageIndex={initialStageIndex}
      isCompleted={isCompleted}
    />
  );
}
