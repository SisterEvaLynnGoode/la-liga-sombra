import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getVocabReadinessScore } from "@/lib/mastery";
import { UNITS } from "@/lib/game/units";
import GateClient from "./GateClient";

// Unit content registry — mirrors the one in /play/[unitId]/page.tsx
function getUnitContent(unitNumber: number) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 1) return require("@/content/unit-01.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 2) return require("@/content/unit-02.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 3) return require("@/content/unit-03.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 4) return require("@/content/unit-04.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 5) return require("@/content/unit-05.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 6) return require("@/content/unit-06.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 7) return require("@/content/unit-07.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 8) return require("@/content/unit-08.json");
  return null;
}

interface PageProps {
  params: { unitId: string };
}

export default async function GatePage({ params }: PageProps) {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const unitNumber = parseInt(params.unitId, 10);
  if (isNaN(unitNumber) || unitNumber < 1) redirect("/mission-board");

  const content = getUnitContent(unitNumber);
  if (!content) redirect("/mission-board");

  const supabase = createClient();

  // Verify unit is accessible to this student
  const { data: unitRows } = await supabase
    .from("units").select("id").eq("number", unitNumber).limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!unitId) redirect("/mission-board");

  const { data: progressRows } = await supabase
    .from("unit_progress")
    .select("status")
    .eq("student_id", session.studentId)
    .eq("unit_id", unitId)
    .limit(1);

  const status = (progressRows as Array<{ status: string }> | null)?.[0]?.status;
  if (!status || status === "locked") redirect("/mission-board");

  // If already completed, skip gate and go straight to play (replay mode)
  if (status === "completed") redirect(`/play/${unitNumber}`);

  // Compute readiness score from mastery data
  const vocabTerms = (content.vocab as Array<{ spanish: string }>).map((v) => v.spanish);
  const readiness = await getVocabReadinessScore(session.studentId, vocabTerms);

  // Find country name for display
  const unit = UNITS.find((u) => u.number === unitNumber);

  return (
    <GateClient
      unitNumber={unitNumber}
      country={unit?.country ?? content.country}
      tier={readiness.tier}
      scorePercent={Math.round(readiness.score * 100)}
    />
  );
}
