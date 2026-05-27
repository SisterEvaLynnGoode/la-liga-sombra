import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { UNITS } from "@/lib/game/units";
import type { UnitStatus } from "@/lib/types/database";
import { getVocabReadinessScore } from "@/lib/mastery";
import { getOverdueTermsForBriefing } from "@/lib/spaced-repetition";
import MissionHeader from "@/components/mission-board/MissionHeader";
import CorkBoard from "@/components/mission-board/CorkBoard";
import AlertToast from "@/components/ui/AlertToast";
import DailyBriefingTrigger from "@/components/briefing/DailyBriefingTrigger";
import type { ColdCaseStatus } from "@/components/mission-board/ColdCaseCard";

// Units that have cold case content built — update as new cold cases are authored
const COLD_CASE_UNITS = new Set([1]);

// Boss definitions: { afterUnit → boss metadata }
const BOSS_AFTER_UNIT: Record<number, { id: string; title: string; subtitle: string }> = {
  5: { id: "unit-5-eclipse", title: "Operación Eclipse", subtitle: "Misión Especial — La Liga Sombra" },
};

export const metadata = { title: "Sala de Investigación — La Liga Sombra" };

export default async function MissionBoardPage() {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const supabase = createClient();

  // Fetch units + student progress + badges + briefing terms in parallel
  const [unitsRes, progressRes, badgesRes, briefingTerms, bossRows] = await Promise.all([
    supabase.from("units").select("id, number").order("number"),
    supabase.from("unit_progress")
      .select("unit_id, status, case_solved, criminal_caught, completed_at, cold_case_completed_at")
      .eq("student_id", session.studentId),
    supabase.from("badges").select("id").eq("student_id", session.studentId),
    getOverdueTermsForBriefing(session.studentId, supabase),
    supabase.from("boss_progress").select("boss_id, current_stage, completed_at, skipped_at, final_ending").eq("primary_student_id", session.studentId),
  ]);

  const dbUnits = unitsRes.data ?? [];
  let progress = progressRes.data ?? [];

  // ── Initialize progress for new students ─────────────────────────────────
  if (progress.length === 0 && dbUnits.length > 0) {
    const rows = dbUnits.map((u, i) => ({
      student_id: session.studentId,
      unit_id: u.id,
      status: (i === 0 ? "available" : "locked") as UnitStatus,
      case_solved: false,
      criminal_caught: false,
    }));
    await supabase.from("unit_progress").insert(rows);
    progress = rows.map((r) => ({
      unit_id: r.unit_id,
      status: r.status as UnitStatus,
      case_solved: r.case_solved,
      criminal_caught: r.criminal_caught,
      completed_at: null,
      cold_case_completed_at: null,
    }));
  }

  // Map DB unit id → progress row
  const progressByUnitId = new Map(progress.map((p) => [p.unit_id, p]));
  const unitIdByNumber = new Map(dbUnits.map((u) => [u.number, u.id]));

  // Identify available units so we can fetch readiness scores for them
  const availableUnits = UNITS.filter((unit) => {
    const unitId = unitIdByNumber.get(unit.number);
    const prog = unitId ? progressByUnitId.get(unitId) : undefined;
    return prog?.status === "available";
  });

  // Load vocab for available units and compute readiness in parallel
  const readinessMap = new Map<number, "ready" | "recommended" | "required">();
  if (availableUnits.length > 0) {
    await Promise.all(
      availableUnits.map(async (unit) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const content = require(`@/content/unit-0${unit.number}.json`) as { vocab: Array<{ spanish: string }> };
          const terms = content.vocab.map((v) => v.spanish);
          const r = await getVocabReadinessScore(session.studentId, terms);
          readinessMap.set(unit.number, r.tier);
        } catch {
          // content not yet built — treat as ready (no gate friction)
          readinessMap.set(unit.number, "ready");
        }
      })
    );
  }

  // Merge static unit metadata with live progress
  const now = Date.now();
  const COLD_UNLOCK_DELAY_MS = 24 * 3_600_000; // 24 hours

  const caseFiles = UNITS.map((unit) => {
    const unitId = unitIdByNumber.get(unit.number);
    const prog = unitId ? progressByUnitId.get(unitId) : undefined;
    const status = (prog?.status ?? "locked") as UnitStatus;

    // Compute cold case status for units that have cold content
    let coldCaseStatus: ColdCaseStatus | undefined;
    let coldCaseUnlocksAt: string | null = null;

    if (COLD_CASE_UNITS.has(unit.number) && prog?.case_solved) {
      if ((prog as { cold_case_completed_at?: string | null }).cold_case_completed_at) {
        coldCaseStatus = "completed";
      } else if (prog.completed_at) {
        const unlocksMs = new Date(prog.completed_at).getTime() + COLD_UNLOCK_DELAY_MS;
        if (now >= unlocksMs) {
          coldCaseStatus = "available";
        } else {
          coldCaseStatus = "locked";
          coldCaseUnlocksAt = new Date(unlocksMs).toISOString();
        }
      }
    }

    return {
      unit,
      status,
      caseSolved: prog?.case_solved ?? false,
      readinessLevel: status === "available" ? readinessMap.get(unit.number) : undefined,
      coldCaseStatus,
      coldCaseUnlocksAt,
    };
  });

  // Boss progress map — MUST be declared before bossEntries (uses it).
  // Previously declared after, causing a TDZ ReferenceError once a unit in
  // BOSS_AFTER_UNIT was completed — which crashed the entire mission board
  // for students who solved Caso V. Reported as the v5 P0 blocker.
  const bossProgressMap = new Map(
    ((bossRows?.data ?? []) as Array<{
      boss_id: string; current_stage: number;
      completed_at: string | null; skipped_at: string | null; final_ending: string | null;
    }>).map((b) => [b.boss_id, b])
  );

  // Boss entries for the CorkBoard
  type BossEntryType = import("@/components/mission-board/CorkBoard").BossEntry;
  const bossEntries: BossEntryType[] = Object.entries(BOSS_AFTER_UNIT).flatMap(([unitNumStr, meta]) => {
    const unitNum = parseInt(unitNumStr);
    const unitId = unitIdByNumber.get(unitNum);
    const prog = unitId ? progressByUnitId.get(unitId) : undefined;
    if (!prog?.case_solved) return []; // hide boss until original unit completed

    const bp = bossProgressMap.get(meta.id);
    let status: import("@/components/boss/BossCard").BossCardStatus;
    if (bp?.completed_at) status = "completed";
    else if (bp?.skipped_at) status = "skipped";
    else if (bp && (bp.current_stage ?? 0) > 0) status = "in_progress";
    else status = "available";

    return [{
      id: meta.id,
      title: meta.title,
      subtitle: meta.subtitle,
      afterUnitNumber: unitNum,
      status,
      currentStage: bp?.current_stage,
      totalStages: 8, // 0-7 phases
      finalEnding: bp?.final_ending,
    } as BossEntryType];
  });

  const casesSolved = progress.filter((p) => p.case_solved).length;
  const badgeCount = badgesRes.data?.length ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0b0a]">
      <MissionHeader
        displayName={session.displayName}
        casesSolved={casesSolved}
        totalCases={UNITS.length}
        badgeCount={badgeCount}
      />
      <CorkBoard caseFiles={caseFiles} bossEntries={bossEntries} />
      <AlertToast classId={session.classId} />
      {briefingTerms.length > 0 && (
        <DailyBriefingTrigger terms={briefingTerms} />
      )}
    </div>
  );
}
