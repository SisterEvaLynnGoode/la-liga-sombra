/**
 * GET /api/teacher/dashboard/mastery?classId=…[&studentId=…][&unmastered=all]
 *
 * Boss-fight scores plus the skills profile behind them, for the Notas tab,
 * the admin export and the parent report. One endpoint so those three can
 * never disagree about a child's numbers.
 *
 * With studentId it returns that one student in full (every topic, every
 * unmastered item). Without, it returns the class: one row per student, with
 * the per-topic detail trimmed to what a summary table shows.
 *
 * unmastered=all adds every student's missed items in one query, which is what
 * a set of parent report cards needs — otherwise printing a class meant one
 * request per child, each re-running the class aggregate.
 */
import { NextRequest, NextResponse } from "next/server";
import { guardClass, isResponse } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";
import {
  buildSkillProfile,
  type SkillSummaryRow,
  type UnmasteredRow,
  type SkillProfile,
} from "@/lib/reports/skills";

/** Boss ids → the name a teacher and an administrator will recognise. */
const BOSS_LABELS: Record<string, { label: string; afterCaso: number }> = {
  "unit-5-eclipse":        { label: "Operación Eclipse",        afterCaso: 5 },
  "unit-8-medianoche":     { label: "Operación Medianoche",     afterCaso: 8 },
  "unit-15-reloj-arena":   { label: "Operación Reloj de Arena", afterCaso: 15 },
  "unit-26-ultima-cronica":{ label: "Operación Última Crónica", afterCaso: 26 },
  "unit-32-coleccion":     { label: "Operación La Colección",   afterCaso: 32 },
};

export interface BossScore {
  bossId: string;
  label: string;
  afterCaso: number;
  status: "completed" | "in_progress" | "skipped" | "not_started";
  /** 0–100 for the gradebook. Null when this fight predates per-stage recording. */
  scorePct: number | null;
  points: number | null;
  difficulty: string | null;
  ending: string | null;
  completedAt: string | null;
  /** Per-stage detail, when it was recorded. */
  stages: Array<{ label: string; skill: string; score: number; maxScore: number; pct: number | null; skipped: boolean }>;
}

export interface StudentMastery {
  studentId: string;
  displayName: string;
  /** The student's real name, when the teacher has set one. Null falls back to displayName. */
  reportName: string | null;
  sisId: string | null;
  bosses: BossScore[];
  /** The single number for a gradebook: average of graded boss fights. */
  bossAveragePct: number | null;
  bossesGraded: number;
  profile: SkillProfile;
}

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? "";
  const onlyStudent = request.nextUrl.searchParams.get("studentId");
  const wantAllMisses = request.nextUrl.searchParams.get("unmastered") === "all";
  const guard = await guardClass(classId);
  if (isResponse(guard)) return guard;

  const supabase = createClient();

  const { data: studentRows } = await supabase
    .from("students")
    .select("id, display_name, sis_id, report_name")
    .eq("class_id", classId)
    .is("archived_at", null)
    .order("display_name");
  let students = (studentRows ?? []) as Array<{ id: string; display_name: string; sis_id: string | null; report_name: string | null }>;
  if (onlyStudent) students = students.filter((s) => s.id === onlyStudent);
  if (!students.length) return NextResponse.json({ students: [], className: null });

  const ids = students.map((s) => s.id);

  // The skill aggregate is computed in the database (migration 039). Reading
  // raw events here returned at most 1000 rows — a sliver of the ~30,000 a
  // class generates — so most students came back with an empty profile.
  const [unitsRes, bossRes, summaryRes, classRes] = await Promise.all([
    supabase.from("units").select("id, number"),
    supabase.from("boss_progress")
      .select("primary_student_id, boss_id, difficulty, completed_at, skipped_at, final_score, final_ending, score_pct, stage_data, current_stage")
      .in("primary_student_id", ids),
    supabase.rpc("class_skill_summary", { p_class_id: classId }),
    supabase.from("classes").select("class_code, period_name, teacher_name").eq("id", classId).limit(1),
  ]);

  // The items a student has never got right drive the practice activities, so
  // they are only fetched for a single-student report.
  let unmastered: UnmasteredRow[] = [];
  const missesByStudent = new Map<string, UnmasteredRow[]>();
  if (onlyStudent) {
    const { data } = await supabase.rpc("student_unmastered_items", {
      p_student_id: onlyStudent,
      p_limit: 200,
    });
    unmastered = (data ?? []) as UnmasteredRow[];
  } else if (wantAllMisses) {
    const { data } = await supabase.rpc("class_unmastered_items", {
      p_class_id: classId,
      p_per_student: 40,
    });
    for (const row of (data ?? []) as Array<UnmasteredRow & { student_id: string }>) {
      const list = missesByStudent.get(row.student_id) ?? [];
      list.push({ unit_id: row.unit_id, skill: row.skill, item_key: row.item_key });
      missesByStudent.set(row.student_id, list);
    }
  }

  const unitNumberById = new Map(
    ((unitsRes.data ?? []) as Array<{ id: string; number: number }>).map((u) => [u.id, u.number])
  );
  const bossRows = (bossRes.data ?? []) as Array<{
    primary_student_id: string; boss_id: string; difficulty: string | null;
    completed_at: string | null; skipped_at: string | null; final_score: number | null;
    final_ending: string | null; score_pct: number | null; current_stage: number | null;
    stage_data: { results?: Array<{ label: string; skill: string; score: number; maxScore: number; skipped: boolean }> } | null;
  }>;
  const summary = (summaryRes.data ?? []) as SkillSummaryRow[];
  const cls = ((classRes.data ?? []) as Array<{ class_code: string; period_name: string; teacher_name: string }>)[0] ?? null;

  const result: StudentMastery[] = students.map((s) => {
    const mine = bossRows.filter((b) => b.primary_student_id === s.id);

    const bosses: BossScore[] = Object.entries(BOSS_LABELS).map(([bossId, meta]) => {
      const row = mine.find((b) => b.boss_id === bossId);
      const stages = (row?.stage_data?.results ?? []).map((r) => ({
        label: r.label,
        skill: r.skill,
        score: r.score,
        maxScore: r.maxScore,
        pct: r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : null,
        skipped: r.skipped,
      }));
      const status: BossScore["status"] = !row
        ? "not_started"
        : row.completed_at ? "completed"
        : row.skipped_at ? "skipped"
        : (row.current_stage ?? 0) > 0 ? "in_progress"
        : "not_started";
      return {
        bossId,
        label: meta.label,
        afterCaso: meta.afterCaso,
        status,
        scorePct: row?.score_pct ?? null,
        points: row?.final_score ?? null,
        difficulty: row?.difficulty ?? null,
        ending: row?.final_ending ?? null,
        completedAt: row?.completed_at ?? null,
        stages,
      };
    });

    const graded = bosses.filter((b) => b.scorePct != null);
    const bossAveragePct = graded.length
      ? Math.round(graded.reduce((n, b) => n + (b.scorePct ?? 0), 0) / graded.length)
      : null;

    return {
      studentId: s.id,
      displayName: s.display_name,
      reportName: s.report_name,
      sisId: s.sis_id,
      bosses,
      bossAveragePct,
      bossesGraded: graded.length,
      profile: buildSkillProfile(
        summary.filter((r) => r.student_id === s.id),
        unitNumberById,
        onlyStudent ? unmastered : (missesByStudent.get(s.id) ?? [])
      ),
    };
  });

  return NextResponse.json({
    students: result,
    className: cls ? `${cls.class_code} — ${cls.period_name}` : null,
    teacherName: cls?.teacher_name ?? null,
    generatedAt: new Date().toISOString(),
  });
}
