/**
 * Per-case and per-week gradebook breakdowns.
 *
 * WHY THIS EXISTS
 *
 * The Grades tab used to show one number per student, computed over everything
 * they had ever done. That number answers "how is this student doing?" and
 * nothing else. It cannot answer the two questions a teacher actually asks at a
 * grading deadline:
 *
 *   1. "What did they do THIS WEEK?"  — what goes in the district gradebook.
 *   2. "How did they do on Caso 7?"   — which level to reteach, and to whom.
 *
 * Both are already in the data (`attempts` carries unit_id, activity_type,
 * score/max_score and completed_at); nothing was reading them that way.
 *
 * TWO METRICS, ON PURPOSE — they are not the same question and will disagree.
 *
 *   Per case  → BEST attempt per activity, averaged across the activities in
 *               that case. Students are told replaying raises their grade, so
 *               the case record must show their best work or that promise is a
 *               lie. A case someone fixed on the third try reads high, and it
 *               should.
 *
 *   Per week  → RAW accuracy on the work completed inside that week. This is a
 *               record of a week that has already happened; it must not change
 *               later because of something done in a different week. That is the
 *               whole point of a weekly column.
 *
 * So a case can read 95% while the week it was first attempted reads 60%. That
 * is not a bug — one is "where they got to", the other is "how that week went".
 * The UI labels both.
 *
 * Pure functions over plain rows: no Supabase, no dates beyond what is passed
 * in, so the arithmetic can be reasoned about and tested directly.
 */

export interface AttemptRow {
  student_id: string;
  unit_id: string;
  activity_type: string;
  score: number;
  max_score: number;
  time_spent_seconds: number;
  completed_at: string;
}

export interface ProgressRow {
  student_id: string;
  unit_id: string;
  case_solved: boolean;
  cold_case_completed_at?: string | null;
}

/** One student's record on one case. */
export interface CaseCell {
  unitNumber: number;
  /** 0–100 from their BEST attempt at each activity. Null = never attempted. */
  pct: number | null;
  /** How many attempts they logged here (replays included). */
  attempts: number;
  /** Distinct activities attempted — low numbers mean a half-finished case. */
  activities: number;
  solved: boolean;
  coldSolved: boolean;
  /** ISO date of their most recent attempt on this case. */
  lastWorked: string | null;
}

/** One student's record for one calendar week. */
export interface WeekCell {
  /** Monday of the week, YYYY-MM-DD. */
  weekStart: string;
  /** 0–100, raw accuracy on work completed that week. Null = no work. */
  pct: number | null;
  attempts: number;
  /** Cases they touched that week, ascending. */
  unitNumbers: number[];
  /** Minutes of recorded work. */
  minutes: number;
}

export interface StudentBreakdown {
  studentId: string;
  cases: CaseCell[];
  weeks: WeekCell[];
}

/** Monday of the week containing `iso`, as YYYY-MM-DD (UTC). */
export function weekStartOf(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getUTCDay();               // 0 Sun … 6 Sat
  const backToMonday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - backToMonday);
  return d.toISOString().slice(0, 10);
}

/** "Aug 25" — the column header a teacher can scan. */
export function weekLabel(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return weekStart;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

interface Best { score: number; max: number }

/**
 * Build every student's per-case and per-week record.
 *
 * `unitNumberById` maps the attempts' unit_id to the case number the teacher
 * knows it by; attempts on units we cannot resolve are skipped rather than
 * bucketed under a wrong case, because a wrong case number sends a teacher to
 * reteach the wrong lesson.
 */
export function buildBreakdown(
  studentIds: string[],
  attempts: AttemptRow[],
  progress: ProgressRow[],
  unitNumberById: Map<string, number>
): { students: StudentBreakdown[]; unitNumbers: number[]; weekStarts: string[] } {
  // student → unit → activity → best ratio
  const bestByCase = new Map<string, Map<number, Map<string, Best>>>();
  const caseMeta = new Map<string, Map<number, { attempts: number; last: string | null }>>();
  // student → weekStart → running totals
  const weekAgg = new Map<string, Map<string, { score: number; max: number; attempts: number; units: Set<number>; seconds: number }>>();

  const seenUnits = new Set<number>();
  const seenWeeks = new Set<string>();

  for (const a of attempts) {
    const unitNumber = unitNumberById.get(a.unit_id);
    if (unitNumber === undefined || a.max_score <= 0) continue;
    seenUnits.add(unitNumber);

    // ── per case: best attempt at each activity ──────────────────────────
    let byUnit = bestByCase.get(a.student_id);
    if (!byUnit) { byUnit = new Map(); bestByCase.set(a.student_id, byUnit); }
    let byActivity = byUnit.get(unitNumber);
    if (!byActivity) { byActivity = new Map(); byUnit.set(unitNumber, byActivity); }
    const prev = byActivity.get(a.activity_type);
    if (!prev || a.score / a.max_score > prev.score / prev.max) {
      byActivity.set(a.activity_type, { score: a.score, max: a.max_score });
    }

    let metaByUnit = caseMeta.get(a.student_id);
    if (!metaByUnit) { metaByUnit = new Map(); caseMeta.set(a.student_id, metaByUnit); }
    const meta = metaByUnit.get(unitNumber) ?? { attempts: 0, last: null };
    meta.attempts += 1;
    if (!meta.last || a.completed_at > meta.last) meta.last = a.completed_at;
    metaByUnit.set(unitNumber, meta);

    // ── per week: raw accuracy inside the week ───────────────────────────
    const ws = weekStartOf(a.completed_at);
    if (!ws) continue;
    seenWeeks.add(ws);
    let byWeek = weekAgg.get(a.student_id);
    if (!byWeek) { byWeek = new Map(); weekAgg.set(a.student_id, byWeek); }
    const w = byWeek.get(ws) ?? { score: 0, max: 0, attempts: 0, units: new Set<number>(), seconds: 0 };
    w.score += a.score;
    w.max += a.max_score;
    w.attempts += 1;
    w.units.add(unitNumber);
    w.seconds += a.time_spent_seconds ?? 0;
    byWeek.set(ws, w);
  }

  // Solved flags come from unit_progress, not from attempts: a student can have
  // attempts on a case they never closed out, and the teacher needs to see that
  // difference (worked on it ≠ solved it).
  const solved = new Map<string, Map<number, { solved: boolean; cold: boolean }>>();
  for (const p of progress) {
    const unitNumber = unitNumberById.get(p.unit_id);
    if (unitNumber === undefined) continue;
    seenUnits.add(unitNumber);
    let m = solved.get(p.student_id);
    if (!m) { m = new Map(); solved.set(p.student_id, m); }
    m.set(unitNumber, { solved: !!p.case_solved, cold: !!p.cold_case_completed_at });
  }

  const unitNumbers = Array.from(seenUnits).sort((a, b) => a - b);
  const weekStarts = Array.from(seenWeeks).sort();

  const students = studentIds.map((id) => {
    const byUnit = bestByCase.get(id);
    const metaByUnit = caseMeta.get(id);
    const solvedByUnit = solved.get(id);

    const cases: CaseCell[] = unitNumbers.map((n) => {
      const acts = byUnit?.get(n);
      let pct: number | null = null;
      if (acts && acts.size) {
        let sum = 0;
        acts.forEach((b) => { sum += b.score / b.max; });
        pct = Math.round((sum / acts.size) * 100);
      }
      const meta = metaByUnit?.get(n);
      const s = solvedByUnit?.get(n);
      return {
        unitNumber: n,
        pct,
        attempts: meta?.attempts ?? 0,
        activities: acts?.size ?? 0,
        solved: s?.solved ?? false,
        coldSolved: s?.cold ?? false,
        lastWorked: meta?.last ?? null,
      };
    });

    const byWeek = weekAgg.get(id);
    const weeks: WeekCell[] = weekStarts.map((ws) => {
      const w = byWeek?.get(ws);
      return {
        weekStart: ws,
        pct: w && w.max > 0 ? Math.round((w.score / w.max) * 100) : null,
        attempts: w?.attempts ?? 0,
        unitNumbers: w ? Array.from(w.units).sort((a, b) => a - b) : [],
        minutes: w ? Math.round(w.seconds / 60) : 0,
      };
    });

    return { studentId: id, cases, weeks };
  });

  return { students, unitNumbers, weekStarts };
}
