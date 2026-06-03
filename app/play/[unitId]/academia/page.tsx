import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getVocabReadinessScore } from "@/lib/mastery";
import type { UnitContent } from "@/lib/types/unit-content";
import AcademiaWrapper from "./AcademiaWrapper";

// Unit content registry — mirrors /play/[unitId]/page.tsx
function getUnitContent(unitNumber: number): UnitContent | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 1) return require("@/content/unit-01.json") as UnitContent;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 2) return require("@/content/unit-02.json") as UnitContent;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 3) return require("@/content/unit-03.json") as UnitContent;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 4) return require("@/content/unit-04.json") as UnitContent;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 5) return require("@/content/unit-05.json") as UnitContent;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 6) return require("@/content/unit-06.json") as UnitContent;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 7) return require("@/content/unit-07.json") as UnitContent;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 8) return require("@/content/unit-08.json") as UnitContent;
  return null;
}

interface PageProps {
  params: { unitId: string };
}

export default async function AcademiaPage({ params }: PageProps) {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const unitNumber = parseInt(params.unitId, 10);
  if (isNaN(unitNumber) || unitNumber < 1) redirect("/mission-board");

  const content = getUnitContent(unitNumber);
  if (!content) redirect(`/play/${unitNumber}/gate`); // shows Próximamente panel

  const supabase = createClient();

  // Verify unit is accessible
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

  // Determine routing tier (needed by AcademiaWrapper to pass to academia-complete API)
  const vocabTerms = content.vocab.map((v) => v.spanish);
  const readiness = await getVocabReadinessScore(session.studentId, vocabTerms);

  // Check for teacher flags — unlock (bypass) takes precedence over retry challenge
  const { data: teacherFlags } = await supabase
    .from("student_flags")
    .select("flag_type, context")
    .eq("student_id", session.studentId)
    .eq("unit_id", unitId)
    .in("flag_type", ["academia_unlocked", "academia_retry_challenge"])
    .is("resolved_at", null);

  const flagTypes = (teacherFlags as Array<{ flag_type: string; context: Record<string, unknown> }> | null) ?? [];
  const isUnlocked      = flagTypes.some((f) => f.flag_type === "academia_unlocked");
  const retryChallenge  = !isUnlocked && flagTypes.find((f) => f.flag_type === "academia_retry_challenge");
  const challengeMessage = retryChallenge
    ? (retryChallenge.context?.teacherMessage as string | undefined) ?? null
    : null;

  return (
    <AcademiaWrapper
      unitNumber={unitNumber}
      vocab={content.vocab}
      sentences={content.academiaConfig?.sentences}
      unitId={unitId}
      routingTier={readiness.tier}
      isUnlocked={isUnlocked}
      retryChallenge={!!retryChallenge}
      challengeMessage={challengeMessage}
    />
  );
}
