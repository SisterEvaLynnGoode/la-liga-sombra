/**
 * Parent-facing course grade + narrative.
 *
 * WHY THIS IS SEPARATE FROM lib/grading.ts
 *
 * lib/grading.ts produces an ACTFL *proficiency* composite. That number is
 * correct for what it measures and wrong for what a parent reads. Its breadth
 * term is `casesSolved / (all cases)`, so a student in week 8 who is doing
 * exactly what was asked lands near 60% — because they cannot yet have solved
 * cases that have not been assigned. A parent sees 60% and reads a D-.
 *
 * So this module computes a second, gradebook-style number with a different
 * denominator: performance on the work the student has ACTUALLY been assigned.
 * A strong student in week 3 should read ~90%, not ~40%.
 *
 * Both numbers are shown. The band stays the standards-based signal; the course
 * grade is the one that is safe to send home.
 *
 * The narrative is deterministic — assembled from the real numbers, never
 * generated. This is the one surface in the app that makes claims about a
 * specific child to their family, so it must not be capable of inventing
 * something. Every sentence below is traceable to a value.
 */

import type { StudentGrade } from "@/lib/grading";

export interface CourseGrade {
  /** 0–100, gradebook-style: quality of work done × completion of work assigned. */
  pct: number;
  /** Letter, on a standard US scale. */
  letter: string;
  /** How many of the assigned cases they have finished. */
  casesSolved: number;
  casesAssigned: number;
  /** True when we have too little evidence to grade honestly. */
  provisional: boolean;
}

export interface StudentReport {
  courseGrade: CourseGrade;
  /** 2–4 sentences, safe to paste into an email home. */
  narrative: string;
  /** Short internal read for the teacher — not for parents. */
  teacherNote: string;
}

function letterFor(pct: number): string {
  if (pct >= 97) return "A+";
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C-";
  if (pct >= 67) return "D+";
  if (pct >= 63) return "D";
  if (pct >= 60) return "D-";
  return "F";
}

const SKILL_LABEL = {
  vocab: "vocabulary",
  grammar: "grammar",
  communication: "reading and listening",
} as const;

type SkillKey = keyof typeof SKILL_LABEL;

/**
 * Gradebook percentage.
 *
 * quality      = how accurate their work is (the three skill scores, averaged
 *                over the ones we have evidence for)
 * completion   = solved cases ÷ cases assigned so far
 *
 * Weighted 70/30. Completion is capped at 1 so finishing extra cases never
 * pushes past 100, and `casesAssigned` is clamped to at least casesSolved so a
 * student who has run ahead of the class is never punished for it.
 */
export function computeCourseGrade(grade: StudentGrade, casesAssignedRaw: number): CourseGrade {
  const casesAssigned = Math.max(1, casesAssignedRaw, grade.casesSolved);

  const present = (["vocab", "grammar", "communication"] as SkillKey[])
    .map((k) => grade.skills[k])
    .filter((s) => s.hasData);

  const quality = present.length ? present.reduce((t, s) => t + s.score, 0) / present.length : 0;
  const completion = Math.min(1, grade.casesSolved / casesAssigned);

  const pct = Math.round((quality * 0.7 + completion * 0.3) * 100);

  return {
    pct,
    letter: letterFor(pct),
    casesSolved: grade.casesSolved,
    casesAssigned,
    // Not enough evidence to put a letter on: no skill data, or nothing finished.
    provisional: present.length === 0 || grade.casesSolved === 0,
  };
}

/** Strongest / weakest skill among those with actual evidence. */
function rankSkills(grade: StudentGrade): { best: SkillKey | null; worst: SkillKey | null } {
  const withData = (["vocab", "grammar", "communication"] as SkillKey[])
    .filter((k) => grade.skills[k].hasData)
    .sort((a, b) => grade.skills[b].score - grade.skills[a].score);
  if (withData.length === 0) return { best: null, worst: null };
  if (withData.length === 1) return { best: withData[0], worst: null };
  return { best: withData[0], worst: withData[withData.length - 1] };
}

export interface ReportInput {
  firstName: string;
  grade: StudentGrade;
  casesAssigned: number;
  /** Did their ACTFL band go up recently? Drives the "improving" sentence. */
  leveledUpRecently?: boolean;
  /** Days since their last recorded activity, if known. */
  daysSinceActive?: number | null;
}

/**
 * Build the parent narrative. Deterministic and defensive: every branch is
 * driven by a number, and nothing is claimed that the data does not support.
 */
export function buildStudentReport(input: ReportInput): StudentReport {
  const { firstName, grade, casesAssigned, leveledUpRecently, daysSinceActive } = input;
  const course = computeCourseGrade(grade, casesAssigned);
  const { best, worst } = rankSkills(grade);
  const name = firstName || "This student";

  const s: string[] = [];

  // 1 — where they are.
  if (course.provisional) {
    s.push(
      `${name} has not completed enough work yet for a meaningful grade. ` +
        `So far ${course.casesSolved} of ${course.casesAssigned} assigned cases are finished.`
    );
  } else {
    s.push(
      `${name} has completed ${course.casesSolved} of ${course.casesAssigned} assigned cases ` +
        `and is currently earning ${course.pct}% (${course.letter}).`
    );
  }

  const withData = (["vocab", "grammar", "communication"] as SkillKey[]).filter((k) => grade.skills[k].hasData);
  const pctOf = (k: SkillKey) => Math.round(grade.skills[k].score * 100);
  const allWeak = withData.length > 1 && withData.every((k) => grade.skills[k].score < 0.55);

  if (withData.length === 1) {
    // Don't say "strongest area" when there is nothing to compare against —
    // that implies the other skills were measured and lost.
    const only = withData[0];
    s.push(`So far the only area with enough work to measure is ${SKILL_LABEL[only]}, at ${pctOf(only)}%.`);
  } else if (allWeak) {
    // Naming only the lowest would imply the others are fine. They aren't.
    const list = withData
      .map((k) => `${SKILL_LABEL[k]} (${pctOf(k)}%)`)
      .join(withData.length === 2 ? " and " : ", ")
      .replace(/, ([^,]*)$/, " and $1");
    s.push(
      `Right now several areas need work — ${list}. ` +
        `Replaying a finished case is the fastest way to raise these: grades update to reflect their best work, so practice counts.`
    );
  } else {
    // 2 — what is going well. Only claim a strength if it is genuinely solid.
    if (best && grade.skills[best].score >= 0.75) {
      s.push(`${SKILL_LABEL[best][0].toUpperCase()}${SKILL_LABEL[best].slice(1)} is a real strength — ${pctOf(best)}% accuracy on that work.`);
    } else if (best && grade.skills[best].score >= 0.55) {
      s.push(`Their strongest area right now is ${SKILL_LABEL[best]}, at ${pctOf(best)}%.`);
    }

    // 3 — what to work on. Honest, specific, paired with the fix.
    if (worst && grade.skills[worst].score < 0.55) {
      s.push(
        `The area to focus on is ${SKILL_LABEL[worst]}, currently ${pctOf(worst)}%. ` +
          `Replaying a finished case is the fastest way to raise this — grades update to reflect their best work, so practice counts.`
      );
    } else if (worst && grade.skills[worst].score < 0.75) {
      s.push(`${SKILL_LABEL[worst][0].toUpperCase()}${SKILL_LABEL[worst].slice(1)} is coming along and would benefit from a little more practice.`);
    }
  }

  // Explain the grade when unfinished work — not accuracy — is what is holding
  // it down. Without this a parent reads "real strength" next to a D and cannot
  // tell what to do about it. This is the most actionable sentence in the note.
  const completionFrac = course.casesSolved / course.casesAssigned;
  const qualityAvg = withData.length
    ? withData.reduce((t, k) => t + grade.skills[k].score, 0) / withData.length
    : 0;
  if (!course.provisional && completionFrac < 0.7 && qualityAvg >= 0.7) {
    const missing = course.casesAssigned - course.casesSolved;
    s.push(
      `The grade is lower than that accuracy suggests because ${missing} assigned ` +
        `${missing === 1 ? "case is" : "cases are"} still unfinished. ${name} is doing the work well — ` +
        `there just needs to be more of it, and finishing those would raise the grade quickly.`
    );
  }

  // A struggling student's note should not be nothing but deficits. If they
  // have actually finished cases, that is real and worth saying.
  if (allWeak && grade.casesSolved > 0) {
    s.push(
      `${name} has finished ${grade.casesSolved} ${grade.casesSolved === 1 ? "case" : "cases"}, which is something to build on.`
    );
  }

  // 4 — movement and engagement, only when the data actually says something.
  if (leveledUpRecently) {
    s.push(`${name} moved up a proficiency level recently, which is a good sign of steady progress.`);
  }
  if (typeof daysSinceActive === "number" && daysSinceActive >= 14) {
    s.push(`${name} has not worked on Spanish in about ${daysSinceActive} days; getting back to a short session or two each week would help.`);
  }

  // Teacher-only read — blunter, and never shown to families.
  const t: string[] = [];
  t.push(`Band ${grade.band}, proficiency ${Math.round(grade.score * 100)}%, course ${course.pct}%.`);
  if (course.provisional) t.push("Not enough evidence to grade — check they can log in and have been assigned work.");
  const weakAll = (["vocab", "grammar", "communication"] as SkillKey[])
    .filter((k) => grade.skills[k].hasData && grade.skills[k].score < 0.55);
  if (weakAll.length > 1) t.push(`Weak across ${weakAll.map((k) => SKILL_LABEL[k]).join(", ")} — not a single-skill gap.`);
  else if (worst && grade.skills[worst].score < 0.4) t.push(`${SKILL_LABEL[worst]} is very weak (${Math.round(grade.skills[worst].score * 100)}%) — worth a direct intervention.`);
  if (withData.length === 1) t.push("Only one skill has evidence; grade rests on a narrow base.");
  if (grade.casesSolved === 0 && casesAssigned > 1) t.push("Zero cases finished despite work being assigned.");
  if (!course.provisional && course.casesSolved / course.casesAssigned < 0.7 && qualityAvg >= 0.7)
    t.push("Grade is completion-limited, not ability-limited — chase the missing work, not remediation.");
  if (typeof daysSinceActive === "number" && daysSinceActive >= 14) t.push(`Inactive ~${daysSinceActive}d.`);

  return { courseGrade: course, narrative: s.join(" "), teacherNote: t.join(" ") };
}
