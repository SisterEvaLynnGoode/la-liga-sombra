import type { SkillBucket } from "@/lib/reports/skills";

/** Shapes returned by /api/teacher/dashboard/mastery, shared by all three reports. */

export interface BossScore {
  bossId: string;
  label: string;
  afterCaso: number;
  status: "completed" | "in_progress" | "skipped" | "not_started";
  scorePct: number | null;
  points: number | null;
  ending: string | null;
  completedAt: string | null;
  stages: Array<{ label: string; skill: string; score: number; maxScore: number; pct: number | null; skipped: boolean }>;
}

export interface Profile {
  vocabByTopic: SkillBucket[];
  grammarBySkill: SkillBucket[];
  listening: SkillBucket | null;
  speaking: SkillBucket | null;
  overallPct: number | null;
  totalItems: number;
  totalMastered: number;
  strengths: SkillBucket[];
  needsWork: SkillBucket[];
}

export interface Student {
  studentId: string;
  displayName: string;
  /** The real name, when the teacher has set one. Null falls back to the game handle. */
  reportName: string | null;
  sisId: string | null;
  bosses: BossScore[];
  bossAveragePct: number | null;
  bossesGraded: number;
  profile: Profile;
}

/** The class-wide aggregates behind the charts (migration 044). */
export interface ClassAnalytics {
  errorKinds: Array<{ kind: string; events: number; students: number }>;
  latency: Array<{ studentId: string; medianMs: number; timedEvents: number }>;
  coverage: Array<{ caso: number; completed: number; inProgress: number; credited: number; notStarted: number }>;
  firstTryByCase: Array<{ studentId: string; caso: number; items: number; firstTry: number }>;
  rosterSize: number;
}

export interface Payload {
  students: Student[];
  analytics: ClassAnalytics | null;
  className: string | null;
  teacherName: string | null;
  generatedAt: string;
}

/** One row of /api/teacher/dashboard/grades — the ACTFL band comes from there. */
export interface GradeRow {
  studentId: string;
  displayName: string;
  band: string;
  bandIndex: number;
  gradePct: number;
  gradeLetter: string;
  casesSolved: number;
}

/**
 * The name to print. display_name is whatever the student typed when they
 * joined — "MopHead", "babyskelly" — which is fine in the game and useless on
 * a report a family reads, so the teacher's report_name wins when it is set.
 */
export function nameFor(s: Student): string {
  return s.reportName?.trim() || s.displayName;
}

export function statusWord(status: BossScore["status"]): string {
  return status === "in_progress" ? "in progress"
    : status === "not_started" ? "not started"
    : status;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** Every bucket a student has, flattened — the denominator for their own totals. */
export function allBuckets(p: Profile): SkillBucket[] {
  return [
    ...p.vocabByTopic,
    ...p.grammarBySkill,
    ...(p.listening ? [p.listening] : []),
    ...(p.speaking ? [p.speaking] : []),
  ];
}

/**
 * A student's first-try accuracy across everything they have met.
 *
 * Kept beside mastery everywhere, because mastery alone reads generously: the
 * Academy re-asks an item until the student gets it, so mastery tops out near
 * 100 for most of a class. First try is what separates knowing from
 * eventually getting there.
 */
export function firstTryPctOf(p: Profile): number | null {
  if (!p.totalItems) return null;
  const ft = allBuckets(p).reduce((n, b) => n + b.firstTry, 0);
  return Math.round((ft / p.totalItems) * 100);
}
