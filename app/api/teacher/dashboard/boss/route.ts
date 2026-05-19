import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = request.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "Missing classId" }, { status: 400 });

  const supabase = createClient();
  const { data: studentsData } = await supabase.from("students").select("id, display_name").eq("class_id", classId);
  const students = (studentsData ?? []) as Array<{ id: string; display_name: string }>;
  const studentIds = students.map((s) => s.id);

  if (!studentIds.length) return NextResponse.json({ bosses: [] });

  const { data: bossRows } = await supabase
    .from("boss_progress")
    .select("primary_student_id, boss_id, difficulty, current_stage, ethical_choices, partner_name, started_at, completed_at, skipped_at, final_score, final_ending, last_saved_at")
    .in("primary_student_id", studentIds);

  const rows = (bossRows ?? []) as Array<{
    primary_student_id: string; boss_id: string;
    difficulty: string | null; current_stage: number;
    ethical_choices: Array<{ choice: string }>;
    partner_name: string | null;
    started_at: string; completed_at: string | null; skipped_at: string | null;
    final_score: number | null; final_ending: string | null; last_saved_at: string;
  }>;

  // Aggregate by boss_id
  const bossIds = Array.from(new Set(rows.map((r) => r.boss_id)));

  const bosses = bossIds.map((bossId) => {
    const bossStudents = rows.filter((r) => r.boss_id === bossId);
    const total = studentIds.length;
    const started    = bossStudents.length;
    const completed  = bossStudents.filter((r) => r.completed_at).length;
    const skipped    = bossStudents.filter((r) => r.skipped_at && !r.completed_at).length;
    const withPartner = bossStudents.filter((r) => r.partner_name).length;

    // Difficulty distribution
    const diffCount = { easy: 0, normal: 0, hard: 0 };
    for (const r of bossStudents) {
      if (r.difficulty && r.difficulty in diffCount) {
        diffCount[r.difficulty as keyof typeof diffCount]++;
      }
    }

    // Ending distribution
    const endingCount: Record<string, number> = {};
    for (const r of bossStudents.filter((r) => r.final_ending)) {
      endingCount[r.final_ending!] = (endingCount[r.final_ending!] ?? 0) + 1;
    }

    // Ethical choice distribution
    const choiceCount = { A: 0, B: 0, C: 0 };
    for (const r of bossStudents) {
      const choices = r.ethical_choices ?? [];
      const c = choices[0]?.choice;
      if (c === "A" || c === "B" || c === "C") choiceCount[c]++;
    }

    // Avg completion time (minutes)
    const completedRows = bossStudents.filter((r) => r.completed_at && r.started_at);
    const avgMinutes = completedRows.length
      ? Math.round(completedRows.reduce((s, r) => {
          return s + (new Date(r.completed_at!).getTime() - new Date(r.started_at).getTime()) / 60000;
        }, 0) / completedRows.length)
      : null;

    // Per-student detail
    const studentDetail = students.map((s) => {
      const bp = bossStudents.find((r) => r.primary_student_id === s.id);
      if (!bp) return { id: s.id, displayName: s.display_name, status: "not_started", difficulty: null, ending: null, score: null, partnerName: null };
      return {
        id: s.id,
        displayName: s.display_name,
        status: bp.completed_at ? "completed" : bp.skipped_at ? "skipped" : "in_progress",
        difficulty: bp.difficulty,
        ending: bp.final_ending,
        score: bp.final_score,
        partnerName: bp.partner_name,
        ethicalChoice: bp.ethical_choices?.[0]?.choice ?? null,
      };
    });

    return {
      bossId,
      total,
      started,
      completed,
      skipped,
      completionPct: total > 0 ? Math.round((completed / total) * 100) : 0,
      collaborationRate: started > 0 ? Math.round((withPartner / started) * 100) : 0,
      difficultyDist: diffCount,
      endingDist: endingCount,
      choiceDist: choiceCount,
      avgCompletionMinutes: avgMinutes,
      students: studentDetail,
    };
  });

  return NextResponse.json({ bosses });
}
