/**
 * Season standings, computed rather than stored.
 *
 * Everything the scoring needs already exists: unit_progress knows who solved
 * what, and attempts knows how well. Writing a season_scores table would put a
 * second copy of the truth in the database, and the two would disagree the
 * first time a student redid a case — which they are explicitly encouraged to
 * do, since retakes are what make the proficiency score honest.
 *
 * Cost of computing instead: a couple of queries per scoreboard load. The
 * scoreboard is projected once or twice a period, not polled.
 */

import { createClient } from "@/lib/supabase/server";
import {
  buildStandings, resolveFaction, scoreCase, SEASON_UNITS,
  type FactionId, type FactionStanding,
} from "@/lib/season/factions";

/** Production is what the season rewards most, so it is measured separately. */
const PRODUCTION_ACTIVITIES = new Set(["academia_production"]);

export interface SeasonRow {
  studentId: string;
  displayName: string;
  faction: FactionId;
  points: number;
  casesSolved: number;
}

export interface SeasonBoard {
  standings: FactionStanding[];
  /** Teacher-only. Students never see per-student numbers. */
  rows: SeasonRow[];
  unassigned: Array<{ studentId: string; displayName: string }>;
}

export async function getSeasonBoard(classId: string): Promise<SeasonBoard> {
  const supabase = createClient();

  const { data: studentRows } = await supabase
    .from("students")
    .select("id, display_name, faction")
    .eq("class_id", classId);
  const students = (studentRows ?? []) as Array<{ id: string; display_name: string; faction: string | null }>;
  if (!students.length) return { standings: buildStandings([]), rows: [], unassigned: [] };

  const ids = students.map((s) => s.id);

  // Season units, by database id — content files are numbered, the DB is not.
  const { data: unitRows } = await supabase
    .from("units").select("id, number").in("number", SEASON_UNITS);
  const units = (unitRows ?? []) as Array<{ id: string; number: number }>;
  const unitIds = units.map((u) => u.id);

  const { data: bossRows } = await supabase
    .from("boss_progress")
    .select("primary_student_id, final_ending")
    .eq("boss_id", "unit-15-reloj-arena")
    .in("primary_student_id", ids);
  const endingByStudent = new Map(
    ((bossRows ?? []) as Array<{ primary_student_id: string; final_ending: string | null }>)
      .map((r) => [r.primary_student_id, r.final_ending]),
  );

  // No season units in the database yet → everyone is simply unassigned.
  if (!unitIds.length) {
    return factionOnly(students, endingByStudent);
  }

  const { data: progressRows } = await supabase
    .from("unit_progress")
    .select("student_id, unit_id, case_solved")
    .in("student_id", ids)
    .in("unit_id", unitIds);

  const { data: attemptRows } = await supabase
    .from("attempts")
    .select("student_id, unit_id, activity_type, score, max_score")
    .in("student_id", ids)
    .in("unit_id", unitIds);

  const solved = new Set(
    ((progressRows ?? []) as Array<{ student_id: string; unit_id: string; case_solved: boolean }>)
      .filter((r) => r.case_solved)
      .map((r) => `${r.student_id}|${r.unit_id}`),
  );

  // Bucket attempts per student+unit, keeping production apart from the rest.
  const buckets = new Map<string, { accSum: number; accN: number; prodSum: number; prodN: number }>();
  for (const a of (attemptRows ?? []) as Array<{
    student_id: string; unit_id: string; activity_type: string; score: number; max_score: number;
  }>) {
    if (!a.max_score) continue; // a zero denominator is a broken row, not a zero score
    const key = `${a.student_id}|${a.unit_id}`;
    const b = buckets.get(key) ?? { accSum: 0, accN: 0, prodSum: 0, prodN: 0 };
    const frac = Math.max(0, Math.min(1, a.score / a.max_score));
    if (PRODUCTION_ACTIVITIES.has(a.activity_type)) { b.prodSum += frac; b.prodN += 1; }
    else { b.accSum += frac; b.accN += 1; }
    buckets.set(key, b);
  }

  const rows: SeasonRow[] = [];
  const unassigned: Array<{ studentId: string; displayName: string }> = [];

  for (const s of students) {
    const faction = resolveFaction({ override: s.faction, bossEnding: endingByStudent.get(s.id) });
    if (!faction) { unassigned.push({ studentId: s.id, displayName: s.display_name }); continue; }

    let points = 0;
    let casesSolved = 0;
    for (const u of units) {
      const key = `${s.id}|${u.id}`;
      const didSolve = solved.has(key);
      if (!didSolve) continue;
      casesSolved += 1;
      const b = buckets.get(key);
      points += scoreCase({
        solved: true,
        accuracy: b && b.accN ? b.accSum / b.accN : 0,
        production: b && b.prodN ? b.prodSum / b.prodN : undefined,
      });
    }
    rows.push({ studentId: s.id, displayName: s.display_name, faction, points, casesSolved });
  }

  return {
    standings: buildStandings(rows.map((r) => ({
      faction: r.faction, studentId: r.studentId, points: r.points, casesSolved: r.casesSolved,
    }))),
    rows: rows.sort((a, b) => b.points - a.points),
    unassigned,
  };
}

/** Season units not in the database yet: report membership, no scores. */
function factionOnly(
  students: Array<{ id: string; display_name: string; faction: string | null }>,
  endingByStudent: Map<string, string | null>,
): SeasonBoard {
  const rows: SeasonRow[] = [];
  const unassigned: Array<{ studentId: string; displayName: string }> = [];
  for (const s of students) {
    const faction = resolveFaction({ override: s.faction, bossEnding: endingByStudent.get(s.id) });
    if (faction) rows.push({ studentId: s.id, displayName: s.display_name, faction, points: 0, casesSolved: 0 });
    else unassigned.push({ studentId: s.id, displayName: s.display_name });
  }
  return {
    standings: buildStandings(rows.map((r) => ({
      faction: r.faction, studentId: r.studentId, points: 0, casesSolved: 0,
    }))),
    rows,
    unassigned,
  };
}
