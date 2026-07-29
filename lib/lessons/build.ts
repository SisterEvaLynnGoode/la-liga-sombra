/**
 * Lesson-plan builder.
 *
 * One derived plan per case, feeding every surface that shows a lesson plan.
 *
 * Why derived: the old plan lived in three places — lib/pacing/plan.ts, a hand-
 * written block inside WorksheetsClient, and a static PDF built by a Python
 * script that stopped being true in June. Nothing told anyone when they
 * disagreed. This is the same drift that made us stop generating vocab decks in
 * Canva, so lesson plans get the same treatment: ONE function reads what
 * actually exists and everything else renders its output.
 *
 * Everything here is DERIVED, never authored twice:
 *   day structure + minutes      ← the unit's own stage list
 *   objectives                   ← vocab count, grammar lesson, culture lesson
 *   "watch for" notes            ← the story deck's teacherNote
 *   materials + readiness        ← what the caller found on disk
 *   gaps                         ← anything the unit is missing
 *
 * A unit that gains a mechanic gets an updated plan for free. A unit missing a
 * culture sheet says so on the page instead of printing a plan for a handout
 * that does not exist.
 */

import type { UnitContent, StageData } from "@/lib/types/unit-content";
import type { UnitMeta } from "@/lib/game/units";
import type { GrammarLesson } from "@/lib/worksheets/grammar";
import type { CultureLesson } from "@/lib/worksheets/culture";
import type { CaseStory } from "@/lib/decks/stories";
import { getSchedule, meetingForWorkItem, type Schedule, type ScheduleId } from "@/lib/lessons/schedule";

/** Teacher-facing English name for each stage type. */
const STAGE_LABEL: Record<string, string> = {
  cutscene: "Chief's briefing",
  vocabMatch: "Vocabulary match",
  swipeSort: "Swipe-sort drill",
  sentenceBuilder: "Sentence builder",
  dialogueChoice: "Witness interview",
  interrogation: "Interrogation",
  readingComp: "Evidence reading",
  listeningComp: "Listening (audio)",
  chaseMap: "Chase map",
  timedFlashcards: "Timed flashcards",
  liveStakeout: "Live stakeout (timed)",
  lineup: "Lineup — the arrest",
};

/** Stages that reward a clue and therefore must not be skipped. */
const CLUE_BEARING = new Set([
  "dialogueChoice", "readingComp", "listeningComp", "interrogation",
  "chaseMap", "liveStakeout", "timedFlashcards", "sentenceBuilder", "swipeSort",
]);

export interface LessonStep {
  mins: number;
  what: string;
}

/** One meeting of the class — a period or a block, depending on the schedule. */
export interface LessonDay {
  n: number;
  /** Meeting label from the schedule, e.g. "Wed / Thu — 80-min block". */
  title: string;
  subtitle: string;
  minutes: number;
  /** Work items packed into this meeting, e.g. ["Field II", "HQ"]. */
  workItems: string[];
  /** Shown as "Project:" / "Print:" chips at the top of the meeting. */
  project: string[];
  print: string[];
  steps: LessonStep[];
  exitTicket: string;
  link?: { href: string; label: string };
}

export interface Material {
  label: string;
  ready: boolean;
  note?: string;
  href?: string;
}

export interface LessonPlan {
  meta: {
    unitNumber: number;
    caseTitle: string;
    country: string;
    city: string;
    criminal: string;
    stolenItem: string;
    band: string;
    grammarTitle: string;
    cultureTheme: string | null;
    vocabCount: number;
    stageLabels: string[];
    totalMinutes: number;
  };
  objectives: string[];
  /** ACTFL communicative modes this week actually exercises. */
  standards: string[];
  materials: Material[];
  days: LessonDay[];
  schedule: { id: string; label: string; description: string; totalMinutes: number };
  assessment: string[];
  differentiation: string[];
  /** Case-specific things to say out loud, pulled from the story deck. */
  watchFor: string[];
  /** Anything missing. Rendered loudly so nobody plans around a gap. */
  gaps: string[];
}

/** A single work item, authored at its natural ~50-minute shape. */
interface WorkItem {
  title: string;
  subtitle: string;
  project: string[];
  print: string[];
  steps: LessonStep[];
  exitTicket: string;
  link?: { href: string; label: string };
}

/**
 * Pack the five work items into the schedule's meetings and scale each step so
 * the times add up to the real period length.
 *
 * The scaling is the point. On a block schedule two items share 80 minutes, not
 * 100, so simply concatenating them would print a plan that overruns the period
 * by twenty minutes — which is exactly the kind of quiet lie that makes a
 * teacher stop trusting the document.
 */
function packIntoMeetings(items: WorkItem[], schedule: Schedule): LessonDay[] {
  const days: LessonDay[] = [];

  schedule.meetings.forEach((meeting, mi) => {
    const mine = items.filter((_, i) => meetingForWorkItem(schedule, i).key === meeting.key);
    if (mine.length === 0) return;

    const natural = mine.reduce((t, it) => t + it.steps.reduce((a, s) => a + s.mins, 0), 0);
    const scale = natural > 0 ? meeting.minutes / natural : 1;

    // Scale, floor to whole minutes, then hand any rounding remainder to the
    // longest step so the printed times sum exactly to the period.
    const steps: LessonStep[] = mine.flatMap((it) =>
      it.steps.map((s) => ({ mins: Math.max(1, Math.floor(s.mins * scale)), what: s.what }))
    );
    const drift = meeting.minutes - steps.reduce((t, s) => t + s.mins, 0);
    if (drift !== 0 && steps.length > 0) {
      let longest = 0;
      steps.forEach((s, i) => { if (s.mins > steps[longest].mins) longest = i; });
      steps[longest] = { ...steps[longest], mins: Math.max(1, steps[longest].mins + drift) };
    }

    days.push({
      n: mi + 1,
      title: meeting.label,
      subtitle: mine.map((it) => it.subtitle).join("  ·  "),
      minutes: meeting.minutes,
      workItems: mine.map((it) => it.title),
      project: mine.flatMap((it) => it.project),
      print: mine.flatMap((it) => it.print),
      steps,
      exitTicket: mine.map((it) => it.exitTicket).join("  +  "),
      link: mine.find((it) => it.link)?.link,
    });
  });

  return days;
}

/** Rough ACTFL band by position in the sequence. */
function bandFor(n: number): string {
  if (n <= 4) return "Novice Low → Novice Mid";
  if (n <= 8) return "Novice Mid → Novice High";
  if (n <= 13) return "Novice High → Intermediate Low";
  return "Intermediate Low";
}

/** Split the non-intro stages across the two Field days, lineup always last. */
function splitFieldStages(stages: StageData[]): { day2: string[]; day3: string[] } {
  const middle = stages
    .filter((s) => s.type !== "cutscene" && s.type !== "vocabMatch")
    .map((s) => STAGE_LABEL[s.type] ?? s.type);

  if (middle.length === 0) return { day2: [], day3: [] };
  const lineupIdx = middle.findIndex((l) => l === STAGE_LABEL.lineup);
  const body = lineupIdx >= 0 ? middle.slice(0, lineupIdx) : middle;
  const tail = lineupIdx >= 0 ? middle.slice(lineupIdx) : [];

  const cut = Math.ceil(body.length / 2);
  return { day2: body.slice(0, cut), day3: [...body.slice(cut), ...tail] };
}

export interface BuildLessonInput {
  unit: UnitMeta;
  content: UnitContent;
  grammar: GrammarLesson | null;
  culture: CultureLesson | null;
  story: CaseStory | null;
  storyMinutes: number | null;
  vocabDeckSlides: number | null;
  /** Caller checks disk; the builder stays pure. */
  hasAudio: boolean;
  hasColdCase: boolean;
  hasScrollWorld: boolean;
  /** Which bell schedule to lay the five work items out against. */
  scheduleId?: ScheduleId;
}

export function buildLessonPlan(input: BuildLessonInput): LessonPlan {
  const { unit, content, grammar, culture, story, storyMinutes, vocabDeckSlides } = input;
  const n = unit.number;
  const vocabCount = content.vocab.length;
  const stageLabels = content.stages.map((s) => STAGE_LABEL[s.type] ?? s.type);
  const { day2, day3 } = splitFieldStages(content.stages);
  const clueStages = content.stages.filter((s) => CLUE_BEARING.has(s.type)).length;

  // ── Gaps ────────────────────────────────────────────────────────────────
  const gaps: string[] = [];
  if (!story) gaps.push("No story deck for this case yet — Day 1 opens on the vocabulary deck instead.");
  if (!grammar || grammar.drills.length === 0)
    gaps.push("No grammar lesson authored — the Day 4 grammar file will print with an empty word bank.");
  if (!culture) gaps.push("No culture lesson authored — there is no Day 5 handout for this case.");
  if (!input.hasAudio) gaps.push("The listening clip for this case is missing from disk — that stage will play silence.");
  if (!content.vocab.some((v) => v.section))
    gaps.push("Vocabulary is not annotated with sections/examples, so the vocab deck prints word + translation only.");

  // ── Objectives ──────────────────────────────────────────────────────────
  const objectives: string[] = [
    `Recognize and produce the ${vocabCount} key terms of this case.`,
  ];
  if (grammar) objectives.push(`Use ${grammar.title} accurately in speech and writing.`);
  if (culture) objectives.push(`Analyze ${culture.theme} through its products, practices and perspectives, and build a cultural product.`);
  objectives.push(`Interpret Spanish witness testimony and justify an accusation with evidence from ${clueStages} clue-bearing sources.`);

  // ── Standards (ACTFL modes actually exercised) ──────────────────────────
  const standards = [
    "Interpretive listening — unsubtitled witness audio, three replays.",
    "Interpretive reading — case documents, diaries and logs in Spanish.",
    "Interpersonal — dialogue choices with a witness who responds to register and politeness.",
    "Presentational — written sentence production and the arc's end-of-unit presentation.",
    "Cultures — products, practices and perspectives of the host country.",
  ];

  // ── Materials ───────────────────────────────────────────────────────────
  const materials: Material[] = [
    { label: story ? `Story deck — ${storyMinutes ?? "?"} min, project` : "Story deck", ready: !!story, href: "/teacher/decks" },
    { label: vocabDeckSlides ? `Vocabulary deck — ${vocabDeckSlides} slides, project` : "Vocabulary deck", ready: !!vocabDeckSlides, href: "/teacher/decks" },
    { label: `The case itself — ${content.stages.length} stages, Chromebooks`, ready: true, href: `/play/${n}` },
    { label: "Vocabulary + Grammar files — print", ready: !!grammar && grammar.drills.length > 0, href: "/teacher/worksheets" },
    { label: "Culture file — print", ready: !!culture, href: "/teacher/worksheets" },
    { label: "Cultural Passport page — print", ready: true, href: "/teacher/pasaporte" },
    { label: "Listening audio", ready: input.hasAudio },
  ];
  if (input.hasColdCase) materials.push({ label: "Cold case (re-play / make-up work)", ready: true, href: `/play/${n}/cold` });
  if (input.hasScrollWorld) materials.push({ label: "Scroll-world flythrough (optional hook)", ready: true, href: `/teacher/mundo/${n}` });

  // ── Work items ──────────────────────────────────────────────────────────
  // Five fixed items. The schedule decides how they pack into meetings, and
  // the minutes below are the "natural" 50-minute shape — they get scaled to
  // whatever the real meeting length is when the items are assembled.
  const items: WorkItem[] = [];

  items.push({
    title: "Briefing",
    subtitle: "Why this theft matters, and the words you need",
    project: [story ? "Story deck" : "Vocabulary deck", "Vocabulary deck"],
    print: [],
    steps: [
      story
        ? { mins: storyMinutes ?? 15, what: `Story deck — the stolen ${unit.stolenItem}, the host country, and the case vocabulary in context. Use the CORE toggle if you are tight on time.` }
        : { mins: 10, what: "Open on the vocabulary deck title slide and set the scene from the case description." },
      { mins: 15, what: `Vocabulary deck — project the ${vocabCount} terms. Choral repetition; students copy the section headers into their notes.` },
      { mins: 20, what: "Chromebooks out. Students play the chief's briefing and the vocabulary match stage." },
      { mins: 5, what: "Regroup. Who is the suspect, and what was taken?" },
    ],
    exitTicket: "One sentence in Spanish naming what was stolen and from where.",
    link: { href: "/teacher/decks", label: "Open the decks" },
  });

  items.push({
    title: "Field I",
    subtitle: day2.length ? day2.join(" · ") : "Case work",
    project: [],
    print: [],
    steps: [
      { mins: 5, what: "Do Now: three words from yesterday on the board — students give the English." },
      { mins: 35, what: `Students work the case: ${day2.join(", ") || "continue the case stages"}. Every stage here pays out a clue; they should be writing clues down.` },
      { mins: 10, what: "Clue check. Read out what the class has so far and confirm everyone is holding the same evidence." },
    ],
    exitTicket: "Write the clue you collected today, in Spanish.",
    link: { href: `/play/${n}`, label: "Open the case" },
  });

  items.push({
    title: "Field II — the arrest",
    subtitle: day3.length ? day3.join(" · ") : "Solve the case",
    project: [],
    print: [],
    steps: [
      { mins: 5, what: "Do Now: restate the clues collected so far as a class." },
      { mins: 35, what: `Students finish the case: ${day3.join(", ") || "the remaining stages"}. Remind them to read every suspect description before choosing.` },
      { mins: 10, what: "Debrief the arrest. Which clue actually eliminated the decoys? Make students justify it, not just name the culprit." },
    ],
    exitTicket: "Name the culprit and give one piece of evidence, in Spanish.",
    link: { href: `/play/${n}`, label: "Open the case" },
  });

  items.push({
    title: "HQ — paper day",
    subtitle: grammar ? grammar.title : "Vocabulary and grammar",
    project: [],
    print: ["Vocabulary file", "Grammar file"],
    steps: [
      { mins: 5, what: "Warm-up: post the suspect's name. Students brainstorm five Spanish words that describe them." },
      { mins: 15, what: "Vocabulary file — matching, translation, unscramble. No screens." },
      { mins: 25, what: `Grammar file — reference table and mini-lesson${grammar ? ` on ${grammar.title}` : ""}, then the drills and the production task.` },
      { mins: 5, what: "Exit ticket." },
    ],
    exitTicket: "One original Spanish sentence using this week's grammar.",
    link: { href: "/teacher/worksheets", label: "Print the files" },
  });

  items.push({
    title: "Culture",
    subtitle: culture ? culture.theme : "Culture day (no handout authored yet)",
    project: [],
    print: culture ? ["Culture file", "Passport page"] : ["Passport page"],
    steps: culture
      ? [
          { mins: 10, what: `Read the three P's: products, practices, perspectives of ${culture.theme}.` },
          { mins: 10, what: "Comprehension questions, then the compare-to-your-own-culture prompt. Let two pairs report out." },
          { mins: 25, what: `Cultural product: ${culture.project.title}. ${culture.project.brief.split(".")[0]}.` },
          { mins: 5, what: "Add the finished page to the Cultural Passport and initial the stamp box." },
        ]
      : [
          { mins: 20, what: "No culture file exists for this case yet. Substitute the country slides from the story deck and run a discussion." },
          { mins: 25, what: "Students complete their Cultural Passport page for this country." },
          { mins: 5, what: "Initial the stamp box." },
        ],
    exitTicket: "Passport page complete and stamped.",
    link: { href: "/teacher/worksheets", label: "Print the culture file" },
  });

  // ── Assessment / differentiation ────────────────────────────────────────
  const assessment = [
    "Formative: in-game accuracy per stage, visible per student on the dashboard.",
    "Formative: the four daily exit tickets.",
    `Summative: the graded ${culture ? culture.project.title : "cultural product"} and the arc's presentation milestone.`,
    "Standards-based: the ACTFL band on the Grades tab updates from mastery, so replaying to improve raises the grade.",
  ];

  const differentiation = [
    "Struggling: the in-app Academia and the deck's vocabulary slides stay available as a word reference during paper work.",
    "Struggling: the listening stage allows three replays, and the case gives a hint after a wrong lineup choice.",
    "Heritage / advanced: have them read the case documents without the glossary, and answer the culture comparison in Spanish.",
    input.hasColdCase
      ? "Absent or needs another attempt: assign the cold case — same grammar, different crime."
      : "Absent: students can replay any stage; mastery is recency-weighted, so a later, better attempt counts.",
  ];

  // ── Watch-for, lifted from the story deck's teacher note ────────────────
  const watchFor: string[] = [];
  if (story) {
    story.teacherNote
      .split(/(?<=\.)\s+(?=[A-Z])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 40)
      .slice(0, 6)
      .forEach((s) => watchFor.push(s));
  }

  const schedule = getSchedule(input.scheduleId);
  const days = packIntoMeetings(items, schedule);
  const totalMinutes = days.reduce((t, d) => t + d.minutes, 0);

  return {
    meta: {
      unitNumber: n,
      caseTitle: content.caseTitle,
      country: unit.country,
      city: content.city,
      criminal: content.criminalName,
      stolenItem: unit.stolenItem,
      band: bandFor(n),
      grammarTitle: grammar?.title ?? "—",
      cultureTheme: culture?.theme ?? null,
      vocabCount,
      stageLabels,
      totalMinutes,
    },
    objectives,
    standards,
    materials,
    days,
    schedule: {
      id: schedule.id,
      label: schedule.label,
      description: schedule.description,
      totalMinutes,
    },
    assessment,
    differentiation,
    watchFor,
    gaps,
  };
}
