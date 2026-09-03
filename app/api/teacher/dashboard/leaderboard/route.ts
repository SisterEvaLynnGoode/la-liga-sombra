import { NextRequest, NextResponse } from "next/server";
import { guardClass, isResponse } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";
import { weekStartOf } from "@/lib/gradebook/breakdown";

/**
 * The scoreboard, rebuilt so it is worth projecting.
 *
 * WHAT WAS WRONG WITH THE OLD ONE
 *
 * It returned three top-ten lists — cases solved, badges earned, vocabulary
 * mastery — all computed over all time. Three problems, and they compounded:
 *
 *  1. The three lists were the SAME five students in three different orders.
 *     Whoever plays most solves most cases, earns most badges and answers most
 *     vocabulary. Thirty names in the class, six of them ever visible.
 *  2. All-time ranking is frozen. A student who fell behind in September can
 *     work hard in November and move nowhere, because the leader is up by
 *     forty cases. A board that cannot change is not an incentive, it is a
 *     standings table.
 *  3. Mastery percent rewarded caution. Four vocabulary answers at 100% beat
 *     four hundred at 92%, so the safest way to top that column was to barely
 *     play.
 *
 * WHAT THIS RETURNS INSTEAD
 *
 *  - A CLASS goal, not an individual one: cases the whole class solved this
 *    week, against one per student, which is the rate the 36-week plan
 *    assumes. On a projector this is the part everyone is on the same side of.
 *  - Four WEEKLY categories that reset every Monday, chosen so different
 *    students can win them: volume, accuracy, improvement since last week, and
 *    consecutive days. "Mayor progreso" is deliberately winnable from the
 *    bottom of the class — it measures change, not position.
 *  - One small all-time list, kept because the long haul should still count,
 *    but demoted to a footer instead of being the whole board.
 *
 * The accuracy categories require a minimum number of points in play to be
 * eligible, so the winner is someone who worked, not someone who risked
 * nothing.
 */

/** Points in play during the week before a student is ranked on accuracy. */
const MIN_POINTS = 15;
const DAY = 86_400_000;
const TOP_N = 5;

export interface LeaderRow {
  id: string;
  displayName: string;
  /** Sort key. */
  value: number;
  /** Preformatted for display — "92%", "+14 pts", "4 días". */
  display: string;
}

export interface LeaderCategory {
  key: string;
  title: string;
  emoji: string;
  /** One line under the title saying what it takes to win it. */
  note: string;
  entries: LeaderRow[];
  /** Shown instead of an empty list, so a blank card still says something. */
  emptyNote: string;
}

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? "";
  const guard = await guardClass(classId);
  if (isResponse(guard)) return guard;

  const supabase = createClient();
  const { data: studentsData } = await supabase
    .from("students")
    .select("id, display_name")
    .eq("class_id", classId);

  const students = (studentsData ?? []) as Array<{ id: string; display_name: string }>;
  const thisWeek = weekStartOf(new Date().toISOString());
  if (!students.length) {
    return NextResponse.json({ weekStart: thisWeek, classGoal: null, categories: [], allTime: [] });
  }

  const ids = students.map((s) => s.id);
  const lastWeek = weekStartOf(new Date(Date.now() - 7 * DAY).toISOString());
  // Two full weeks, so "improvement since last week" has both halves to compare.
  const since = new Date(Date.parse(lastWeek + "T00:00:00Z")).toISOString();

  const [attemptsRes, badgesRes, dayRes] = await Promise.all([
    supabase
      .from("attempts")
      .select("student_id, score, max_score, completed_at")
      .in("student_id", ids)
      .gte("completed_at", since)
      .limit(20000),
    supabase
      .from("badges")
      .select("student_id, earned_at")
      .in("student_id", ids)
      .eq("badge_type", "case_solved"),
    // Streaks need more history than two weeks, but only the dates.
    supabase
      .from("attempts")
      .select("student_id, completed_at")
      .in("student_id", ids)
      .gte("completed_at", new Date(Date.now() - 60 * DAY).toISOString())
      .limit(20000),
  ]);

  const attempts = (attemptsRes.data ?? []) as Array<{
    student_id: string; score: number; max_score: number; completed_at: string;
  }>;
  const caseBadges = (badgesRes.data ?? []) as Array<{ student_id: string; earned_at: string }>;

  // ── Accuracy per student, this week and last ──────────────────────────────
  // Points, not attempts: a ten-question activity should count for ten times a
  // one-question one. max_score is validated server-side (see score-guard), so
  // these ratios cannot exceed 1.
  type Tally = { points: number; possible: number };
  const acc = new Map<string, { now: Tally; prev: Tally }>();

  for (const a of attempts) {
    const w = weekStartOf(a.completed_at);
    if (w !== thisWeek && w !== lastWeek) continue;
    const cur = acc.get(a.student_id) ?? { now: { points: 0, possible: 0 }, prev: { points: 0, possible: 0 } };
    const bucket = w === thisWeek ? cur.now : cur.prev;
    bucket.points += a.score;
    bucket.possible += a.max_score;
    acc.set(a.student_id, cur);
  }

  /** student -> the set of days they played, for streaks. */
  const days = new Map<string, Set<string>>();
  for (const r of (dayRes.data ?? []) as Array<{ student_id: string; completed_at: string }>) {
    const set = days.get(r.student_id) ?? new Set<string>();
    set.add(r.completed_at.slice(0, 10));
    days.set(r.student_id, set);
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const yesterdayKey = new Date(Date.now() - DAY).toISOString().slice(0, 10);

  /**
   * Consecutive days played, counting back from today. A run that ended before
   * yesterday is over — reporting it would tell the class someone is on a
   * streak when they actually stopped last week.
   */
  function streak(studentId: string): number {
    const set = days.get(studentId);
    if (!set) return 0;
    const start = set.has(todayKey) ? todayKey : set.has(yesterdayKey) ? yesterdayKey : null;
    if (!start) return 0;
    let n = 0;
    let t = Date.parse(start + "T00:00:00Z");
    while (set.has(new Date(t).toISOString().slice(0, 10))) {
      n++;
      t -= DAY;
    }
    return n;
  }

  /** Zero never places: an empty podium is more honest than a podium of nobodies. */
  const rank = (rows: LeaderRow[]) =>
    rows
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value || a.displayName.localeCompare(b.displayName))
      .slice(0, TOP_N);

  // ── Casos ─────────────────────────────────────────────────────────────────
  const casesThisWeek = new Map<string, number>();
  const casesAllTime = new Map<string, number>();
  for (const b of caseBadges) {
    casesAllTime.set(b.student_id, (casesAllTime.get(b.student_id) ?? 0) + 1);
    if (weekStartOf(b.earned_at) === thisWeek) {
      casesThisWeek.set(b.student_id, (casesThisWeek.get(b.student_id) ?? 0) + 1);
    }
  }

  const byCases = rank(
    students.map((s) => {
      const n = casesThisWeek.get(s.id) ?? 0;
      return { id: s.id, displayName: s.display_name, value: n, display: `${n} caso${n === 1 ? "" : "s"}` };
    })
  );

  // ── Precisión ─────────────────────────────────────────────────────────────
  const byAccuracy = rank(
    students.map((s) => {
      const t = acc.get(s.id)?.now;
      const pct = t && t.possible >= MIN_POINTS ? Math.round((t.points / t.possible) * 100) : 0;
      return { id: s.id, displayName: s.display_name, value: pct, display: `${pct}%` };
    })
  );

  // ── Mayor progreso ────────────────────────────────────────────────────────
  // Percentage points gained since last week. Real work is required in BOTH
  // weeks, otherwise one lucky answer after a quiet week takes the category.
  const byGrowth = rank(
    students.map((s) => {
      const t = acc.get(s.id);
      const ok = t && t.now.possible >= MIN_POINTS && t.prev.possible >= MIN_POINTS;
      const gain = ok
        ? Math.round((t.now.points / t.now.possible) * 100) - Math.round((t.prev.points / t.prev.possible) * 100)
        : 0;
      return { id: s.id, displayName: s.display_name, value: gain, display: `+${gain} pts` };
    })
  );

  // ── Días seguidos ─────────────────────────────────────────────────────────
  const byStreak = rank(
    students.map((s) => {
      const n = streak(s.id);
      return { id: s.id, displayName: s.display_name, value: n, display: `${n} día${n === 1 ? "" : "s"}` };
    })
  );

  const categories: LeaderCategory[] = [
    {
      key: "cases",
      title: "Casos esta semana",
      emoji: "\u{1F50E}",
      note: "Casos cerrados desde el lunes.",
      entries: byCases,
      emptyNote: "Todavía nadie ha cerrado un caso esta semana.",
    },
    {
      key: "accuracy",
      title: "Precisión",
      emoji: "\u{1F3AF}",
      note: `Aciertos de esta semana (mínimo ${MIN_POINTS} puntos en juego).`,
      entries: byAccuracy,
      emptyNote: `Nadie llega aún a ${MIN_POINTS} puntos esta semana.`,
    },
    {
      key: "growth",
      title: "Mayor progreso",
      emoji: "\u{1F4C8}",
      note: "Cuánto subió su precisión respecto a la semana pasada.",
      entries: byGrowth,
      emptyNote: "Hace falta trabajo en dos semanas seguidas para comparar.",
    },
    {
      key: "streak",
      title: "Días seguidos",
      emoji: "\u{1F525}",
      note: "Días consecutivos jugando, hasta hoy.",
      entries: byStreak,
      emptyNote: "Ninguna racha activa ahora mismo.",
    },
  ];

  const allTime = students
    .map((s) => {
      const n = casesAllTime.get(s.id) ?? 0;
      return { id: s.id, displayName: s.display_name, value: n, display: `${n}` };
    })
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value || a.displayName.localeCompare(b.displayName))
    .slice(0, TOP_N);

  const solvedThisWeek = Array.from(casesThisWeek.values()).reduce((a, b) => a + b, 0);

  return NextResponse.json({
    weekStart: thisWeek,
    classGoal: {
      solved: solvedThisWeek,
      // One case per student per week is the rate the 36-week plan assumes.
      target: students.length,
      contributing: casesThisWeek.size,
      students: students.length,
    },
    categories,
    allTime,
  });
}
