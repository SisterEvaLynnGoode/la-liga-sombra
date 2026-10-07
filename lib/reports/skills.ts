/**
 * The skills profile behind the gradebook, the admin export and the parent
 * report card.
 *
 * WHAT COUNTS, AND WHY IT MATTERS
 *
 * item_events holds one row per interaction, and some stages interact many
 * times per thing learned. Read naively the database says students sit at 23%
 * in vocabulary and 23% in grammar. Both numbers are artefacts:
 *
 *   • academia-reconocimiento is a memory match game: 104,000 card flips at 12%
 *     "correct" across the school. A flip that does not pair is how matching
 *     works, not a child failing. Excluded in SQL (migration 041).
 *   • dialogueChoice-typed used to ask the student to type the detective's own
 *     closing line, up to twenty-four words of it, and across the school it
 *     was answered correctly once in 63 attempts. The stage was fixed: it now
 *     asks for a line of eight words or fewer, grades a near miss as a near
 *     miss, and logs one event per item instead of one per press of Comprobar.
 *     So it counts again — but only from the date of that fix. The earlier
 *     events are still in item_events and still readable there; they are not
 *     counted, because their targets no longer exist in the content and so
 *     could never be mastered. Migration 043 holds the cutoff; 041 is the
 *     history.
 *   • sentenceBuilder logs every press of Comprobar, so a student who shuffles
 *     the word order four times before getting it right logs 1 correct and 3
 *     wrong. Counting rows would score care as failure.
 *
 * So nothing here counts rows. The database folds the stream to one row per
 * ITEM — a word, a sentence, a question — and this module turns those into:
 *
 *   mastered   — right at least once. The number a parent or an administrator
 *                should read.
 *   firstTry   — right the first time they met it. The teacher's number: it
 *                separates "knew it" from "worked it out".
 *
 * An item never answered correctly is what "needs more work" means, and it is
 * what the practice activities in the parent report are built from.
 */

import { UNITS } from "@/lib/game/units";
import { GRAMMAR } from "@/lib/worksheets/grammar";

/** Stages whose event stream is not an ability signal. Mirrored in migration 043. */
export const EXCLUDED_STAGES = ["academia-reconocimiento"];

/**
 * dialogueChoice-typed counts from here. Earlier events came from the version
 * whose typed target was the detective's closing line.
 *
 * Mirrors typed_dialogue_counted_from() in migration 043, which is what the
 * aggregates actually apply — this constant is for anything on the TypeScript
 * side that needs to explain or reproduce the boundary.
 */
export const TYPED_DIALOGUE_COUNTED_FROM = new Date("2026-10-07T00:00:00Z");

/** One row of class_skill_summary(): a student's items for one caso + skill. */
export interface SkillSummaryRow {
  student_id: string;
  unit_id: string | null;
  skill: string;
  items: number;
  mastered: number;
  first_try: number;
}

/** One row of student_unmastered_items(). */
export interface UnmasteredRow {
  unit_id: string | null;
  skill: string;
  item_key: string;
}

export interface SkillBucket {
  /** Human label an administrator can read without knowing the game. */
  label: string;
  /** Caso number this came from, for the teacher's own reference. */
  caso: number | null;
  items: number;
  mastered: number;
  firstTry: number;
  /** 0–100, mastered / items. */
  masteredPct: number | null;
  /** First-try accuracy, 0–100 — how much was already known. */
  firstTryPct: number | null;
  /** Items still unmastered, when the caller asked for them. */
  unmastered: string[];
}

export interface SkillProfile {
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

/**
 * The vocabulary topic of a caso, in words an administrator understands.
 *
 * The request was explicit: a topic, not "Caso 7". The unit registry already
 * describes each case in those terms, so the label comes from there rather than
 * a second list that would drift out of step.
 */
export function vocabTopic(caso: number): string {
  const unit = UNITS.find((u) => u.number === caso);
  if (!unit) return `Caso ${caso}`;
  const d = unit.description.split("—")[0].split(" - ")[0].trim();
  const topic = d.charAt(0).toUpperCase() + d.slice(1);
  return `${topic} (${unit.country})`;
}

/** The grammar point of a caso, by the name it is taught under. */
export function grammarSkill(caso: number): string {
  const lesson = GRAMMAR[caso];
  if (lesson) return lesson.title;
  const unit = UNITS.find((u) => u.number === caso);
  return unit ? `Grammar — ${unit.titleEs}` : `Caso ${caso}`;
}

function pct(part: number, whole: number): number | null {
  return whole > 0 ? Math.round((part / whole) * 100) : null;
}

function makeBucket(
  label: string,
  caso: number | null,
  rows: SkillSummaryRow[],
  unmastered: string[] = []
): SkillBucket {
  const items = rows.reduce((n, r) => n + r.items, 0);
  const mastered = rows.reduce((n, r) => n + r.mastered, 0);
  const firstTry = rows.reduce((n, r) => n + r.first_try, 0);
  return {
    label,
    caso,
    items,
    mastered,
    firstTry,
    masteredPct: pct(mastered, items),
    firstTryPct: pct(firstTry, items),
    unmastered: unmastered.slice(0, 12),
  };
}

/**
 * Build one student's profile from the aggregated rows.
 *
 * `unitNumberById` maps a unit uuid to its caso number. Rows from a unit with
 * no caso number still count toward listening and speaking (which are not
 * per-caso) but are left out of the topic lists rather than labelled "Caso
 * null".
 */
export function buildSkillProfile(
  rows: SkillSummaryRow[],
  unitNumberById: Map<string, number>,
  unmastered: UnmasteredRow[] = []
): SkillProfile {
  const byCaso = new Map<number, SkillSummaryRow[]>();
  for (const r of rows) {
    const caso = r.unit_id ? unitNumberById.get(r.unit_id) : undefined;
    if (caso == null) continue;
    const list = byCaso.get(caso) ?? [];
    list.push(r);
    byCaso.set(caso, list);
  }

  const missesFor = (caso: number | null, skill: string): string[] =>
    unmastered
      .filter((u) => u.skill === skill && (caso == null || (u.unit_id ? unitNumberById.get(u.unit_id) === caso : false)))
      .map((u) => u.item_key);

  const vocabByTopic: SkillBucket[] = [];
  const grammarBySkill: SkillBucket[] = [];
  for (const [caso, list] of Array.from(byCaso.entries()).sort((a, b) => a[0] - b[0])) {
    const vocab = list.filter((r) => r.skill === "vocab");
    const grammar = list.filter((r) => r.skill === "grammar");
    if (vocab.length) vocabByTopic.push(makeBucket(vocabTopic(caso), caso, vocab, missesFor(caso, "vocab")));
    if (grammar.length) grammarBySkill.push(makeBucket(grammarSkill(caso), caso, grammar, missesFor(caso, "grammar")));
  }

  const listenRows = rows.filter((r) => r.skill === "listening");
  const speakRows = rows.filter((r) => r.skill === "speaking");
  const listening = listenRows.length
    ? makeBucket("Listening — understanding spoken Spanish", null, listenRows, missesFor(null, "listening"))
    : null;
  const speaking = speakRows.length
    ? makeBucket("Speaking — saying it out loud", null, speakRows, missesFor(null, "speaking"))
    : null;

  const all = [...vocabByTopic, ...grammarBySkill, ...(listening ? [listening] : []), ...(speaking ? [speaking] : [])];
  const totalItems = all.reduce((n, b) => n + b.items, 0);
  const totalMastered = all.reduce((n, b) => n + b.mastered, 0);

  // Strengths and gaps come only from areas with enough items to mean
  // something. Four attempts is not a judgement about a child.
  //
  // Both numbers are used, because mastery alone is generous: the Academy
  // repeats a word until the student gets it, so "mastered" tops out near 100%
  // for almost everyone (median 100, and only 19% of areas below 75). First-try
  // accuracy spreads properly (median 83, a quarter below 58) and is what
  // separates "knows it" from "got there in the end". A strength has to be both
  // learned and solid; a gap is either genuinely unlearned OR consistently
  // shaky on first contact.
  const judgeable = all.filter((b) => b.items >= 4 && b.masteredPct != null);
  const strengths = [...judgeable]
    .filter((b) => b.masteredPct! >= 90 && (b.firstTryPct ?? 0) >= 75)
    .sort((a, b) => (b.firstTryPct ?? 0) - (a.firstTryPct ?? 0))
    .slice(0, 4);
  const needsWork = [...judgeable]
    .filter((b) => b.masteredPct! < 75 || (b.firstTryPct ?? 100) < 60)
    .sort((a, b) => (a.masteredPct! + (a.firstTryPct ?? 0)) - (b.masteredPct! + (b.firstTryPct ?? 0)))
    .slice(0, 4);

  return {
    vocabByTopic,
    grammarBySkill,
    listening,
    speaking,
    overallPct: pct(totalMastered, totalItems),
    totalItems,
    totalMastered,
    strengths,
    needsWork,
  };
}
