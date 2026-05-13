import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { computeCurrentStreak } from "@/lib/games/badges";
import ExpedienteClient from "./ExpedienteClient";

export const metadata = { title: "Mi Expediente — La Liga Sombra" };

export default async function ExpedientePage() {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const supabase = createClient();
  const { studentId, classId } = session;

  const [clsRes, badgesRes, attemptsRes, masteryRes, progressRes] = await Promise.all([
    supabase.from("classes").select("class_code, period_name").eq("id", classId).limit(1),
    supabase.from("badges").select("badge_type, unit_id, earned_at").eq("student_id", studentId).order("earned_at"),
    supabase.from("attempts").select("time_spent_seconds, completed_at").eq("student_id", studentId),
    supabase.from("mastery").select("attempts, correct").eq("student_id", studentId),
    supabase.from("unit_progress").select("unit_id, case_solved").eq("student_id", studentId),
  ]);

  const cls = (clsRes.data as Array<{ class_code: string; period_name: string }> | null)?.[0];
  const badges = (badgesRes.data ?? []) as Array<{ badge_type: string; unit_id: string | null; earned_at: string }>;
  const attempts = (attemptsRes.data ?? []) as Array<{ time_spent_seconds: number; completed_at: string }>;
  const mastery = (masteryRes.data ?? []) as Array<{ attempts: number; correct: number }>;
  const progress = (progressRes.data ?? []) as Array<{ unit_id: string; case_solved: boolean }>;

  const casesSolved = progress.filter((p) => p.case_solved).length;
  const totalTimeSeconds = attempts.reduce((s, a) => s + a.time_spent_seconds, 0);
  const masteryTermsMastered = mastery.filter((m) => m.attempts > 0 && m.correct / m.attempts >= 0.8).length;
  const currentStreak = computeCurrentStreak(attempts.map((a) => a.completed_at));

  return (
    <ExpedienteClient
      displayName={session.displayName}
      classCode={cls?.class_code ?? ""}
      periodName={cls?.period_name ?? ""}
      stats={{ casesSolved, totalTimeSeconds, masteryTermsMastered, currentStreak }}
      badges={badges}
    />
  );
}
