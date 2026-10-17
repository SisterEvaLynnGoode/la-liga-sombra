import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getVocabReadinessScore } from "@/lib/mastery";
import { loadUnitContent } from "@/lib/game/unit-content";
import AcademiaWrapper from "./AcademiaWrapper";

interface PageProps {
  params: { unitId: string };
}

export default async function AcademiaPage({ params }: PageProps) {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const unitNumber = parseInt(params.unitId, 10);
  if (isNaN(unitNumber) || unitNumber < 1) redirect("/mission-board");

  // Was a hand-written `if (unitNumber === n)` chain that stopped at 10, so
  // every student who reached Caso 11 was redirected away from the vocabulary
  // training and into the case cold. lib/game/unit-content.ts exists because
  // two other routes had already drifted apart the same way; this one was
  // never moved onto it. Adding a case is now adding a JSON file, nothing else.
  const content = loadUnitContent(unitNumber);
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
