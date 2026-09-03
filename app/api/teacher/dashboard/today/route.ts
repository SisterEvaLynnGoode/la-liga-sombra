import { NextRequest, NextResponse } from "next/server";
import { guardClass, isResponse } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";
import { computeClassGrades } from "@/lib/grading";
import { SEMESTER } from "@/lib/pacing/plan";

/**
 * The five-minutes-before-class endpoint.
 *
 * WHY THIS EXISTS
 *
 * The dashboard had eleven tabs and none of them answered the question a
 * teacher actually opens it with: who needs me today, and is this class where
 * it should be? Overview had participation percentages, Inbox had flags,
 * Grades had percentages, Students had a roster — four tabs to assemble one
 * answer, before first period, by hand.
 *
 * This returns that answer already assembled: a short list of named students
 * with a REASON and a suggested action, and the class's position against the
 * 36-week plan. Everything else stays where it is.
 *
 * ONE REQUEST, NOT FOUR
 *
 * The landing view must be fast and must not thrash on a school connection, so
 * this composes grades, activity, flags and pacing server-side rather than
 * making the browser fetch four endpoints and join them.
 *
 * IT DOES NOT GUESS THE WEEK
 *
 * Pace needs a term start date. Deriving one from the earliest attempt would be
 * wrong for exactly this class — the first weeks ran on paper with no
 * Chromebooks — so an unset date returns `termStart: null` and the UI asks for
 * it instead of reporting a confident, false week number.
 */

const DAY = 86_400_000;

/** Highest severity first: this list is read top-down and acted on in order. */
export type HelpSeverity = "urgent" | "watch";

export interface HelpRow {
  studentId: string;
  name: string;
  /** Short label — the category of problem. */
  reason: string;
  /** The specific fact behind it, in the teacher's words. */
  detail: string;
  /** What to actually do about it. */
  action: string;
  severity: HelpSeverity;
}

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? "";
  const guard = await guardClass(classId);
  if (isResponse(guard)) return guard;

  const supabase = createClient();

  const [{ data: classRows }, { data: studentsData }] = await Promise.all([
    supabase.from("classes").select("term_start").eq("id", classId).limit(1),
    supabase.from("students").select("id, display_name").eq("class_id", classId),
  ]);

  const termStart = (classRows as Array<{ term_start: string | null }> | null)?.[0]?.term_start ?? null;
  const students = (studentsData ?? []) as Array<{ id: string; display_name: string }>;
  const ids = students.map((s) => s.id);
  const nameById = new Map(students.map((s) => [s.id, s.display_name]));

  if (!ids.length) {
    return NextResponse.json({
      termStart, week: null, expectedUnit: null,
      vitals: { students: 0, activeToday: 0, activeThisWeek: 0, medianCases: 0, onPace: 0 },
      needHelp: [], pace: { ahead: 0, onTrack: 0, behind: 0, notStarted: 0 }, flags: 0,
    });
  }

  const since = new Date(Date.now() - 30 * DAY).toISOString();
  const [grades, eventsRes, flagsRes] = await Promise.all([
    computeClassGrades(ids, supabase),
    supabase
      .from("attempts")
      .select("student_id, completed_at")
      .in("student_id", ids)
      .gte("completed_at", since)
      .order("completed_at", { ascending: false })
      .limit(6000),
    supabase
      .from("student_flags")
      .select("student_id, flag_type")
      .in("student_id", ids)
      .is("resolved_at", null),
  ]);

  // Most recent activity per student.
  const lastSeen = new Map<string, number>();
  for (const e of (eventsRes.data ?? []) as Array<{ student_id: string; completed_at: string }>) {
    if (!lastSeen.has(e.student_id)) lastSeen.set(e.student_id, Date.parse(e.completed_at));
  }

  const flagsByStudent = new Map<string, string[]>();
  for (const f of (flagsRes.data ?? []) as Array<{ student_id: string; flag_type: string }>) {
    flagsByStudent.set(f.student_id, [...(flagsByStudent.get(f.student_id) ?? []), f.flag_type]);
  }

  // ── Where the plan says this class should be ────────────────────────────
  let week: number | null = null;
  let expectedUnit: number | null = null;
  if (termStart) {
    const started = Date.parse(termStart + "T00:00:00Z");
    const raw = Math.floor((Date.now() - started) / (7 * DAY)) + 1;
    week = Math.min(36, Math.max(1, raw));
    // Walk back to the most recent week that actually teaches a unit, so a
    // boss or review week still reports a sensible "should be on" number.
    for (let w = week; w >= 1; w--) {
      const pw = SEMESTER.find((x) => x.week === w);
      if (pw?.unitNumber) { expectedUnit = pw.unitNumber; break; }
    }
  }

  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const weekAgo = Date.now() - 7 * DAY;

  const pace = { ahead: 0, onTrack: 0, behind: 0, notStarted: 0 };
  const needHelp: HelpRow[] = [];

  for (const s of students) {
    const g = grades.get(s.id);
    const cases = g?.casesSolved ?? 0;
    const seen = lastSeen.get(s.id);
    const daysIdle = seen ? Math.floor((Date.now() - seen) / DAY) : null;
    const name = nameById.get(s.id) ?? "—";
    const flags = flagsByStudent.get(s.id) ?? [];

    // ── Pace buckets ────────────────────────────────────────────────────
    if (cases === 0 && !seen) pace.notStarted++;
    else if (expectedUnit === null) pace.onTrack++;
    else if (cases >= expectedUnit) pace.ahead++;
    else if (cases >= expectedUnit - 1) pace.onTrack++;
    else pace.behind++;

    // ── Who needs the teacher, most urgent first ─────────────────────────
    // Each student appears AT MOST ONCE. A list that names the same child four
    // times for four reasons is a list nobody reads.
    if (cases === 0 && !seen) {
      needHelp.push({
        studentId: s.id, name, severity: "urgent",
        reason: "Nunca ha entrado",
        detail: "No ha jugado ni una vez.",
        action: "Comprueba que puede iniciar sesión — nombre, código de clase y PIN.",
      });
    } else if (daysIdle !== null && daysIdle >= 7) {
      needHelp.push({
        studentId: s.id, name, severity: "urgent",
        reason: "Inactivo",
        detail: `${daysIdle} días sin jugar. ${cases} caso(s) resuelto(s).`,
        action: "Siéntate con él/ella hoy y abre el caso siguiente juntos.",
      });
    } else if (flags.includes("academia_skipped_after_failure")) {
      needHelp.push({
        studentId: s.id, name, severity: "urgent",
        reason: "Se rindió tras fallar",
        detail: "Saltó la Academia después de fallar — señal de bloqueo, no de pereza.",
        action: "Repasa el vocabulario de la unidad con él/ella antes de volver al caso.",
      });
    } else if (expectedUnit !== null && cases < expectedUnit - 1) {
      needHelp.push({
        studentId: s.id, name, severity: "watch",
        reason: "Atrasado",
        detail: `Va por el caso ${cases}; la clase va por el ${expectedUnit}.`,
        action: "Dale tiempo dirigido esta semana, o empareja con alguien que vaya adelantado.",
      });
    } else if (flags.includes("needs_listening_support")) {
      needHelp.push({
        studentId: s.id, name, severity: "watch",
        reason: "Comprensión auditiva",
        detail: "Pidió ayuda o reveló la transcripción varias veces.",
        action: "Auriculares, y déjale bajar la velocidad del audio.",
      });
    } else {
      const weak = (["vocab", "grammar", "communication"] as const)
        .filter((k) => g?.skills[k].hasData && g.skills[k].score < 0.5);
      if (weak.length) {
        const LABEL = { vocab: "vocabulario", grammar: "gramática", communication: "lectura y escucha" } as const;
        needHelp.push({
          studentId: s.id, name, severity: "watch",
          reason: "Precisión baja",
          detail: `Flojo en ${weak.map((k) => LABEL[k]).join(" y ")}.`,
          action: "Repetir un caso ya resuelto sube la nota — recuérdaselo.",
        });
      }
    }
  }

  const order = { urgent: 0, watch: 1 } as const;
  needHelp.sort((a, b) => order[a.severity] - order[b.severity] || a.name.localeCompare(b.name));

  const solvedCounts = students.map((s) => grades.get(s.id)?.casesSolved ?? 0).sort((a, b) => a - b);
  const medianCases = solvedCounts.length
    ? solvedCounts[Math.floor(solvedCounts.length / 2)]
    : 0;

  return NextResponse.json({
    termStart,
    week,
    expectedUnit,
    vitals: {
      students: students.length,
      activeToday: Array.from(lastSeen.values()).filter((t) => t >= startOfToday.getTime()).length,
      activeThisWeek: Array.from(lastSeen.values()).filter((t) => t >= weekAgo).length,
      medianCases,
      onPace: pace.ahead + pace.onTrack,
    },
    pace,
    needHelp,
    flags: (flagsRes.data ?? []).length,
  });
}

export async function PATCH(request: NextRequest) {
  const { classId, termStart } = (await request.json()) as { classId?: string; termStart?: string | null };
  const guard = await guardClass(classId ?? null);
  if (isResponse(guard)) return guard;

  // null clears it; anything else must be a real ISO date, because a bad value
  // would silently produce a wrong week number on every future page load.
  let value: string | null = null;
  if (termStart != null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(termStart) || Number.isNaN(Date.parse(termStart))) {
      return NextResponse.json({ error: "termStart must be YYYY-MM-DD" }, { status: 400 });
    }
    value = termStart;
  }

  const supabase = createClient();
  const { error } = await supabase.from("classes").update({ term_start: value }).eq("id", classId!);
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json({ ok: true, termStart: value });
}
