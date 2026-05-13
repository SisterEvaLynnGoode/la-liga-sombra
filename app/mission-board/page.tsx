import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { UNITS } from "@/lib/game/units";
import type { UnitStatus } from "@/lib/types/database";
import MissionHeader from "@/components/mission-board/MissionHeader";
import CorkBoard from "@/components/mission-board/CorkBoard";
import AlertToast from "@/components/ui/AlertToast";

export const metadata = { title: "Sala de Investigación — La Liga Sombra" };

export default async function MissionBoardPage() {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const supabase = createClient();

  // Fetch units + student progress + badges in parallel
  const [unitsRes, progressRes, badgesRes] = await Promise.all([
    supabase.from("units").select("id, number").order("number"),
    supabase.from("unit_progress").select("unit_id, status, case_solved, criminal_caught").eq("student_id", session.studentId),
    supabase.from("badges").select("id").eq("student_id", session.studentId),
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
    }));
  }

  // Map DB unit id → progress row
  const progressByUnitId = new Map(progress.map((p) => [p.unit_id, p]));
  const unitIdByNumber = new Map(dbUnits.map((u) => [u.number, u.id]));

  // Merge static unit metadata with live progress
  const caseFiles = UNITS.map((unit) => {
    const unitId = unitIdByNumber.get(unit.number);
    const prog = unitId ? progressByUnitId.get(unitId) : undefined;
    return {
      unit,
      status: (prog?.status ?? "locked") as UnitStatus,
      caseSolved: prog?.case_solved ?? false,
    };
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
      <CorkBoard caseFiles={caseFiles} />
      <AlertToast classId={session.classId} />
    </div>
  );
}
