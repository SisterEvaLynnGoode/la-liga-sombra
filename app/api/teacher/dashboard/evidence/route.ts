/**
 * GET /api/teacher/dashboard/evidence?classId=…
 *
 * The five aggregates behind the Evidence of Learning packet (migration 048).
 * Separate from the mastery endpoint because it is a different document with a
 * different audience, and because nothing here is needed to print a parent
 * report — there is no reason to make that request five RPCs heavier.
 */
import { NextRequest, NextResponse } from "next/server";
import { guardClass, isResponse } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";

export interface EvidencePayload {
  errorTrend: Array<{ month: string; kind: string; events: number; students: number }>;
  briefings: Array<{
    studentId: string; briefings: number; completed: number; skipped: number;
    termsShown: number; termsCorrect: number; distinctDays: number;
    firstDay: string | null; lastDay: string | null;
  }>;
  canDo: Array<{ studentId: string; caso: number | null; statement: string; rating: number; createdAt: string }>;
  signals: Array<{ flagType: string; month: string; n: number; students: number; resolved: number }>;
  sentences: Array<{ expected: string; chosen: string; errorKind: string | null; n: number; students: number }>;
  roster: Array<{ studentId: string; displayName: string; reportName: string | null }>;
  className: string | null;
  teacherName: string | null;
  generatedAt: string;
}

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? "";
  const guard = await guardClass(classId);
  if (isResponse(guard)) return guard;

  const supabase = createClient();

  const [unitsRes, trendRes, briefRes, canDoRes, sigRes, sentRes, rosterRes, classRes] = await Promise.all([
    supabase.from("units").select("id, number"),
    supabase.rpc("class_error_trend", { p_class_id: classId }),
    supabase.rpc("class_briefings", { p_class_id: classId }),
    supabase.rpc("class_can_do", { p_class_id: classId }),
    supabase.rpc("class_signals", { p_class_id: classId }),
    supabase.rpc("class_sentence_attempts", { p_class_id: classId }),
    supabase.from("students").select("id, display_name, report_name")
      .eq("class_id", classId).is("archived_at", null).order("display_name"),
    supabase.from("classes").select("class_code, period_name, teacher_name").eq("id", classId).limit(1),
  ]);

  const unitNumberById = new Map(
    ((unitsRes.data ?? []) as Array<{ id: string; number: number }>).map((u) => [u.id, u.number])
  );
  const cls = ((classRes.data ?? []) as Array<{ class_code: string; period_name: string; teacher_name: string }>)[0] ?? null;

  const payload: EvidencePayload = {
    errorTrend: ((trendRes.data ?? []) as Array<{ month: string; error_kind: string; events: number; students: number }>)
      .map((r) => ({ month: r.month, kind: r.error_kind, events: r.events, students: r.students })),
    briefings: ((briefRes.data ?? []) as Array<{
      student_id: string; briefings: number; completed: number; skipped: number;
      terms_shown: number; terms_correct: number; distinct_days: number;
      first_day: string | null; last_day: string | null;
    }>).map((r) => ({
      studentId: r.student_id, briefings: r.briefings, completed: r.completed, skipped: r.skipped,
      termsShown: r.terms_shown, termsCorrect: r.terms_correct, distinctDays: r.distinct_days,
      firstDay: r.first_day, lastDay: r.last_day,
    })),
    canDo: ((canDoRes.data ?? []) as Array<{
      student_id: string; unit_id: string | null; statement: string; rating: number; created_at: string;
    }>).map((r) => ({
      studentId: r.student_id,
      caso: r.unit_id ? unitNumberById.get(r.unit_id) ?? null : null,
      statement: r.statement, rating: r.rating, createdAt: r.created_at,
    })),
    signals: ((sigRes.data ?? []) as Array<{ flag_type: string; month: string; n: number; students: number; resolved: number }>)
      .map((r) => ({ flagType: r.flag_type, month: r.month, n: r.n, students: r.students, resolved: r.resolved })),
    sentences: ((sentRes.data ?? []) as Array<{ expected: string; chosen: string; error_kind: string | null; n: number; students: number }>)
      .map((r) => ({ expected: r.expected, chosen: r.chosen, errorKind: r.error_kind, n: r.n, students: r.students })),
    roster: ((rosterRes.data ?? []) as Array<{ id: string; display_name: string; report_name: string | null }>)
      .map((r) => ({ studentId: r.id, displayName: r.display_name, reportName: r.report_name })),
    className: cls ? `${cls.class_code} — ${cls.period_name}` : null,
    teacherName: cls?.teacher_name ?? null,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload);
}
