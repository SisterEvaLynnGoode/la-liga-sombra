/**
 * The full-year (36-week) pacing plan for La Liga Sombra.
 *
 * Six six-week arcs across two semesters. Semester 1 (weeks 1–18, Units 1–10)
 * moves students Novice Low → Intermediate Low in the present day. Semester 2
 * (weeks 19–36, Units 11–20) is the time-travel arc: students stand in the past
 * but narrate in the present, which keeps grammar in review while the settings
 * change. See docs/SEMESTER_2_CURRICULUM_MAP.md.
 *
 * Each unit week runs the 5-day engine — Briefing · Field · Field · HQ · Culture
 * — the same structure lib/lessons/build.ts generates per case. If you change the
 * engine, change it in BOTH places or the Pacing tab and the printed lesson plan
 * will quietly disagree, which is the drift this plan was rewritten to remove.
 *
 * Weeks whose case has not been built yet carry `status: "planned"` so the tab
 * shows them greyed rather than implying a link that goes nowhere.
 */

export type WeekType = "unit" | "milestone" | "boss" | "capstone" | "review";
export type Semester = 1 | 2;
export type ArcNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface PacingTask {
  id: string;
  label: string;
  /**
   * Index into WORK_ITEMS (lib/lessons/schedule.ts) for the five weekly work
   * items. The Pacing tab prefixes the label with the meeting that work item
   * falls in under the teacher's chosen schedule ("Mon", "W/Th block", …).
   * Ids never change when the schedule does, so saved progress survives.
   */
  workItem?: 0 | 1 | 2 | 3 | 4;
}

export interface PacingLink {
  href: string;
  label: string;
}

export interface PacingWeek {
  week: number;
  semester: Semester;
  arc: ArcNumber;
  title: string;
  type: WeekType;
  unitNumber?: number;
  summary: string;
  tasks: PacingTask[];
  link?: PacingLink;
  /** "planned" = the content for this week has not been built yet. */
  status?: "planned";
}

export interface Arc {
  n: ArcNumber;
  semester: Semester;
  title: string;
  weeks: string;
  band: string;
}

export const ARCS: Arc[] = [
  // ── Semester 1 · present day ────────────────────────────────────────────
  { n: 1, semester: 1, title: "Foundations", weeks: "Weeks 1–6", band: "Novice Low → Mid" },
  { n: 2, semester: 1, title: "Daily life & description", weeks: "Weeks 7–12", band: "Novice Mid → High" },
  { n: 3, semester: 1, title: "Culture & future", weeks: "Weeks 13–18", band: "Novice High → Intermediate Low" },
  // ── Semester 2 · the time-travel arc ────────────────────────────────────
  { n: 4, semester: 2, title: "Through time · present-tense consolidation", weeks: "Weeks 19–24", band: "Novice High → Intermediate Low" },
  { n: 5, semester: 2, title: "Pronouns & the pursuit", weeks: "Weeks 25–30", band: "Intermediate Low" },
  { n: 6, semester: 2, title: "Into the past tense · the confrontation", weeks: "Weeks 31–36", band: "Intermediate Low → Mid" },
];

export const SEMESTERS: Array<{ n: Semester; title: string; weeks: string; blurb: string }> = [
  { n: 1, title: "Semester 1 · The Present Day", weeks: "Weeks 1–18 · Casos 1–10",
    blurb: "Ten countries, ten thefts, present day. Novice Low to Intermediate Low." },
  { n: 2, title: "Semester 2 · A Través del Tiempo", weeks: "Weeks 19–36 · Casos 11–20",
    blurb: "El Cronista steals each treasure from its own era. Students stand in the past and narrate in the present." },
];

// Reusable task templates ------------------------------------------------------

/**
 * The 5-day engine. These five labels MUST stay in step with the days that
 * lib/lessons/build.ts generates — the Pacing tab and the printed lesson plan
 * are two views of the same week.
 */
const unitTasks = (w: number): PacingTask[] => [
  { id: `w${w}-t1`, workItem: 0, label: "Briefing: story deck → vocab deck → open the case" },
  { id: `w${w}-t2`, workItem: 1, label: "Field I: clue-bearing stages" },
  { id: `w${w}-t3`, workItem: 2, label: "Field II: finish the case + justify the arrest" },
  { id: `w${w}-t4`, workItem: 3, label: "HQ: Vocabulary + Grammar files on paper" },
  { id: `w${w}-t5`, workItem: 4, label: "Culture file + Pasaporte page, stamp it" },
];

const WORKSHEETS: PacingLink = { href: "/teacher/worksheets", label: "Print worksheets" };
const PRESENTATIONS: PacingLink = { href: "/teacher/presentations", label: "Open presentations" };
const PASAPORTE: PacingLink = { href: "/teacher/pasaporte", label: "Open Pasaporte" };
const LESSONS: PacingLink = { href: "/teacher/lessons", label: "Open the lesson plan" };

export const SEMESTER: PacingWeek[] = [
  // ── Arc 1 ──────────────────────────────────────────────────────────────────
  {
    week: 1, semester: 1, arc: 1, title: "Orientation + Unit 1 · México", type: "unit", unitNumber: 1,
    summary: "Set up agent accounts, hand out the Pasaporte Cultural, and play Caso I (¿Quién soy yo?). Greetings, intros, numbers.",
    tasks: [
      { id: "w1-t0", label: "Create class + student accounts; hand out Pasaportes" },
      ...unitTasks(1).slice(0, 3),
    ],
    link: PASAPORTE,
  },
  {
    week: 2, semester: 1, arc: 1, title: "Unit 2 · Puerto Rico", type: "unit", unitNumber: 2,
    summary: "Caso II (El robo en la escuela). Classroom vocab, ser + adjectives, -AR verbs. Culture: school-life comparison.",
    tasks: unitTasks(2), link: WORKSHEETS,
  },
  {
    week: 3, semester: 1, arc: 1, title: "Unit 3 · España", type: "unit", unitNumber: 3,
    summary: "Caso III (Persecución por Madrid). Places, transport, the verb ir. Culture: curate a museum gallery.",
    tasks: unitTasks(3), link: WORKSHEETS,
  },
  {
    week: 4, semester: 1, arc: 1, title: "Review & culture catch-up", type: "review",
    summary: "Re-teach the vocabulary and grammar the Inbox and Units tabs flag as weak. Finish any culture pages.",
    tasks: [
      { id: "w4-t1", label: "Review flagged vocab (Units + Vocabulary tabs)" },
      { id: "w4-t2", label: "Re-teach struggling grammar from the Inbox" },
      { id: "w4-t3", label: "Finish/collect Pasaporte pages for Units 1–3" },
    ],
  },
  {
    week: 5, semester: 1, arc: 1, title: "Milestone 1 prep · Field Report", type: "milestone",
    summary: "Hand out the Milestone 1 planning sheet. Students draft a 60-second 'Field Report' from the sentence frames and practice.",
    tasks: [
      { id: "w5-t1", label: "Hand out Milestone 1 sheet + rubric" },
      { id: "w5-t2", label: "Students draft scripts from the frames" },
      { id: "w5-t3", label: "Practice in pairs" },
    ],
    link: PRESENTATIONS,
  },
  {
    week: 6, semester: 1, arc: 1, title: "Milestone 1 presentations", type: "milestone",
    summary: "Students give the 60-second Field Report. Score with the rubric (target: Novice Mid).",
    tasks: [
      { id: "w6-t1", label: "Students present (Field Report)" },
      { id: "w6-t2", label: "Score with the presentational rubric" },
      { id: "w6-t3", label: "Log culture-participation in the Pasaporte tracker" },
    ],
    link: PRESENTATIONS,
  },

  // ── Arc 2 ──────────────────────────────────────────────────────────────────
  {
    week: 7, semester: 1, arc: 2, title: "Unit 4 · Costa Rica", type: "unit", unitNumber: 4,
    summary: "Caso IV (La Familia Sospechosa). Family, emotions, ser vs estar. Culture: pura-vida eco-brochure.",
    tasks: unitTasks(4), link: WORKSHEETS,
  },
  {
    week: 8, semester: 1, arc: 2, title: "Unit 5 · Argentina", type: "unit", unitNumber: 5,
    summary: "Caso V (Hackeo en Buenos Aires). Tech, numbers, dates, tener-expressions. Culture: mate / recipe card.",
    tasks: unitTasks(5), link: WORKSHEETS,
  },
  {
    week: 9, semester: 1, arc: 2, title: "Operación Eclipse · boss mission", type: "boss",
    summary: "The capstone of Units 1–5: a five-country chase. Students pick a difficulty + partner, then debrief the ethical decision.",
    tasks: [
      { id: "w9-t1", label: "Students choose difficulty + Solo/Compañero" },
      { id: "w9-t2", label: "Play Operación Eclipse to the Desenlace" },
      { id: "w9-t3", label: "Class debrief on the ethical decision (Costa Rica)" },
    ],
  },
  {
    week: 10, semester: 1, arc: 2, title: "Unit 6 · Colombia", type: "unit", unitNumber: 6,
    summary: "Caso VI (El Chef Misterioso). Food, stem-changing verbs, demonstratives. Culture: Colombian recipe card.",
    tasks: unitTasks(6), link: WORKSHEETS,
  },
  {
    week: 11, semester: 1, arc: 2, title: "Milestone 2 prep · Case Briefing", type: "milestone",
    summary: "Hand out the Milestone 2 sheet. Students build note cards for a 2-minute Case Briefing + culture comparison.",
    tasks: [
      { id: "w11-t1", label: "Hand out Milestone 2 sheet + rubric" },
      { id: "w11-t2", label: "Students make 3 note cards from the frames" },
      { id: "w11-t3", label: "Practice with cards in pairs" },
    ],
    link: PRESENTATIONS,
  },
  {
    week: 12, semester: 1, arc: 2, title: "Milestone 2 presentations", type: "milestone",
    summary: "Students give the 2-minute Case Briefing. Score with the rubric (target: Novice High).",
    tasks: [
      { id: "w12-t1", label: "Students present (Case Briefing)" },
      { id: "w12-t2", label: "Score with the presentational rubric" },
      { id: "w12-t3", label: "Update the Pasaporte tracker" },
    ],
    link: PRESENTATIONS,
  },

  // ── Arc 3 ──────────────────────────────────────────────────────────────────
  {
    week: 13, semester: 1, arc: 3, title: "Unit 7 · Chile", type: "unit", unitNumber: 7,
    summary: "Caso VII (Sabotaje en el Festival). Arts, weather, stem-changers, ordinals. Culture: festival poster.",
    tasks: unitTasks(7), link: WORKSHEETS,
  },
  {
    week: 14, semester: 1, arc: 3, title: "Unit 8 · Perú", type: "unit", unitNumber: 8,
    summary: "Caso VIII (El Mercado Robado). Markets, the preterite, comparatives. Culture: market role-play.",
    tasks: unitTasks(8), link: WORKSHEETS,
  },
  {
    week: 15, semester: 1, arc: 3, title: "Unit 9 · República Dominicana + Operación Medianoche", type: "unit", unitNumber: 9,
    summary:
      "Caso IX (El Taíno Robado) on the short days, and the Units 6–8 boss on the long ones. Medianoche has to run the week AFTER Unit 8 while the preterite is still new — that is the whole point of it — so it takes the two block days and Caso IX runs lean around it.",
    tasks: [
      // Work items 2 and 3 are the two 80-minute blocks under blockFull, and both
      // fall inside the single block under blockAB — so the boss lands on long
      // periods in every schedule. Five task ids either way: the Pacing tab
      // persists check-off by id, so the count must not change.
      { id: "w15-t1", workItem: 0, label: "Briefing: story deck → vocab deck → open Caso IX" },
      { id: "w15-t2", workItem: 1, label: "Field: play Caso IX through the arrest" },
      { id: "w15-t3", workItem: 2, label: "Medianoche I: difficulty + Solo/Compañero, play to the analyst" },
      { id: "w15-t4", workItem: 3, label: "Medianoche II: the decision, the warehouse, then debrief the choice" },
      { id: "w15-t5", workItem: 4, label: "HQ + Culture for Caso IX: files on paper, Pasaporte page" },
    ],
    link: WORKSHEETS,
  },
  {
    week: 16, semester: 1, arc: 3, title: "Unit 10 · Ecuador + Capstone research", type: "unit", unitNumber: 10,
    summary: "Caso X (La Expo del Futuro). Careers, future tense. Then launch the Capstone: research a city, design a case.",
    tasks: [
      ...unitTasks(10).slice(0, 3),
      { id: "w16-t4", label: "Launch Capstone: students pick a city & research" },
    ],
    link: PRESENTATIONS,
  },
  {
    week: 17, semester: 1, arc: 3, title: "Capstone · build & practice", type: "capstone",
    summary: "Students design their original case (suspect with ser/estar, three Spanish clues), write a script from frames, and rehearse.",
    tasks: [
      { id: "w17-t1", label: "Design the case (suspect, clues, culprit)" },
      { id: "w17-t2", label: "Write the presentation script from frames" },
      { id: "w17-t3", label: "Practice out loud (self-check)" },
    ],
    link: PRESENTATIONS,
  },
  {
    week: 18, semester: 1, arc: 3, title: "Capstone presentations + reflection", type: "capstone",
    summary: "Students present 'Diseña Tu Propio Caso'; the class solves each with the Audience Sheet. Finish the Pasaporte reflection.",
    tasks: [
      { id: "w18-t1", label: "Capstone presentations (class solves each case)" },
      { id: "w18-t2", label: "Score with the rubric (target: Intermediate Low)" },
      { id: "w18-t3", label: "Students complete the Pasaporte final reflection" },
    ],
    link: PASAPORTE,
  },

  // ══ SEMESTER 2 · "A Través del Tiempo" ═══════════════════════════════════
  // El Cronista steals each treasure from its own era, before it can become
  // that country's heritage. Grammar stays in the present tense for most of
  // the semester via the historical present, so Units 11–16 are review-first.

  // ── Arc 4 · Through time, present-tense consolidation ──────────────────────
  {
    week: 19, semester: 2, arc: 4, title: "Unit 11 · Honduras — the time machine opens", type: "unit", unitNumber: 11,
    summary: "Caso XI (El Misterio de la Estela). The prologue explains time travel and the three rules; Copán in the year 750. Present-tense -AR/-ER/-IR review, and the historical present that carries the whole semester.",
    tasks: [
      { id: "w19-t0", label: "Play the time-machine prologue cutscene as a class" },
      ...unitTasks(19).slice(0, 5),
    ],
    link: LESSONS,
  },
  {
    week: 20, semester: 2, arc: 4, title: "Unit 12 · Guatemala", type: "unit", unitNumber: 12,
    summary: "Caso XII (La Máscara de Jade). Tikal, year 700. The deep re-teach of SER vs. ESTAR — the #1 Semester 1 struggle — with the swipe-sort drill.",
    tasks: unitTasks(20), link: LESSONS,
  },
  {
    week: 21, semester: 2, arc: 4, title: "Unit 13 · El Salvador", type: "unit", unitNumber: 13,
    summary: "Caso XIII (La Vasija Pintada). Joya de Cerén, year 600. Stem-changing verbs and the nosotros exception — the boot.",
    tasks: unitTasks(21), link: LESSONS,
  },
  {
    week: 22, semester: 2, arc: 4, title: "Review & culture catch-up", type: "review",
    summary: "Re-teach what the Inbox and Units tabs flag as weak across Casos 11–13. Finish outstanding Pasaporte pages for Honduras, Guatemala and El Salvador.",
    tasks: [
      { id: "w22-t1", label: "Review flagged vocab (Units + Vocabulary tabs)" },
      { id: "w22-t2", label: "Re-teach SER vs. ESTAR if the grammar ledger still flags it" },
      { id: "w22-t3", label: "Finish/collect Pasaporte pages for Units 11–13" },
    ],
  },
  {
    week: 23, semester: 2, arc: 4, title: "Milestone 3 prep · Dispatch from the Past", type: "milestone",
    summary: "Students draft a 90-second dispatch reporting from one era they visited — narrated in the present tense, as the historical present requires.",
    tasks: [
      { id: "w23-t1", label: "Hand out the Milestone 3 sheet + rubric" },
      { id: "w23-t2", label: "Students draft a dispatch from one era" },
      { id: "w23-t3", label: "Practice in pairs — check they stay in the present" },
    ],
    link: PRESENTATIONS,
  },
  {
    week: 24, semester: 2, arc: 4, title: "Milestone 3 presentations", type: "milestone",
    summary: "Students deliver the dispatch. Score with the presentational rubric (target: Intermediate Low).",
    tasks: [
      { id: "w24-t1", label: "Students present (Dispatch from the Past)" },
      { id: "w24-t2", label: "Score with the presentational rubric" },
      { id: "w24-t3", label: "Update the Pasaporte tracker" },
    ],
    link: PRESENTATIONS,
  },

  // ── Arc 5 · Pronouns & the pursuit ─────────────────────────────────────────
  {
    week: 25, semester: 2, arc: 5, title: "Unit 14 · Nicaragua", type: "unit", unitNumber: 14,
    summary: "Caso XIV (El Manuscrito de Darío). León in 1907, the year Rubén Darío came home. Gustar, encantar and interesar with indirect object pronouns — the verb agrees with the thing, not the person.",
    tasks: unitTasks(25), link: LESSONS,
  },
  {
    week: 26, semester: 2, arc: 5, title: "Unit 15 · Cuba", type: "unit", unitNumber: 15,
    summary: "Caso XV (El Disco Maestro). Havana, 1954. Direct and indirect object pronouns together — me lo, te la, and the le + lo → se lo rule.",
    tasks: unitTasks(26), link: LESSONS,
  },
  {
    week: 27, semester: 2, arc: 5, title: "Operación Reloj de Arena · midterm boss", type: "boss",
    summary: "The capstone of Casos 11–15: a present-tense mastery gauntlet across five eras, at boss speed. No past tense yet.",
    tasks: [
      { id: "w27-t1", label: "Students choose difficulty + Solo/Compañero" },
      { id: "w27-t2", label: "Play Operación Reloj de Arena to the Desenlace" },
      { id: "w27-t3", label: "Class debrief: what does El Cronista actually want?" },
    ],
  },
  {
    week: 28, semester: 2, arc: 5, title: "Unit 16 · Uruguay", type: "unit", unitNumber: 16,
    summary: "Caso XVI (Montevideo, the first World Cup, 1930). Reflexive verbs and daily routine, kept at Spanish-1 level. Vocabulary: sport, routine.",
    tasks: unitTasks(28), link: LESSONS, status: "planned",
  },
  {
    week: 29, semester: 2, arc: 5, title: "Milestone 4 prep · The Cronista File", type: "milestone",
    summary: "Students assemble a case file on El Cronista from every era they have visited so far, and rehearse a 2-minute briefing that uses object pronouns to stop repeating nouns.",
    tasks: [
      { id: "w29-t1", label: "Hand out the Milestone 4 sheet + rubric" },
      { id: "w29-t2", label: "Students build the file from their solved cases" },
      { id: "w29-t3", label: "Practice — listen for lo/la/le doing real work" },
    ],
    link: PRESENTATIONS,
  },
  {
    week: 30, semester: 2, arc: 5, title: "Milestone 4 presentations", type: "milestone",
    summary: "Students present the Cronista File. Score with the rubric (target: Intermediate Low, sustained).",
    tasks: [
      { id: "w30-t1", label: "Students present (The Cronista File)" },
      { id: "w30-t2", label: "Score with the presentational rubric" },
      { id: "w30-t3", label: "Update the Pasaporte tracker" },
    ],
    link: PRESENTATIONS,
  },

  // ── Arc 6 · Into the past tense, and the confrontation ─────────────────────
  {
    week: 31, semester: 2, arc: 6, title: "Unit 17 · Panamá", type: "unit", unitNumber: 17,
    summary: "Caso XVII (the Canal opening, 1914). Comparatives and superlatives, with demonstratives back in review. Vocabulary: work, machines, measurement.",
    tasks: unitTasks(31), link: LESSONS, status: "planned",
  },
  {
    week: 32, semester: 2, arc: 6, title: "Unit 18 · Paraguay", type: "unit", unitNumber: 18,
    summary: "Caso XVIII (Guaraní harp and ñandutí lace). Affirmative tú commands, framed as how-to instructions. Vocabulary: crafts, music, instructions.",
    tasks: unitTasks(32), link: LESSONS, status: "planned",
  },
  {
    week: 33, semester: 2, arc: 6, title: "Unit 19 · Venezuela — the past tense arrives", type: "unit", unitNumber: 19,
    summary: "Caso XIX (the Angel Falls expedition, 1937). A gentle first preterite: recognition plus fue, hizo, tuvo, llegó. The first case narrated as something that finished.",
    tasks: unitTasks(33), link: LESSONS, status: "planned",
  },
  {
    week: 34, semester: 2, arc: 6, title: "Unit 20 · Bolivia + Capstone research", type: "unit", unitNumber: 20,
    summary: "Caso XX (Tiwanaku, Lake Titicaca). A gentle imperfect — era, había, tenía — with a light contrast against the preterite. Then launch the year-end Capstone.",
    tasks: [
      ...unitTasks(34).slice(0, 5),
      { id: "w34-t6", label: "Launch the Capstone: students pick an era and design a case" },
    ],
    link: PRESENTATIONS, status: "planned",
  },
  {
    week: 35, semester: 2, arc: 6, title: "Final boss · El Cronista + Capstone build", type: "boss",
    summary: "The cumulative confrontation with El Cronista across the whole arc. Then students build their own time-travel case for the Capstone.",
    tasks: [
      { id: "w35-t1", label: "Play the final boss to the Desenlace" },
      { id: "w35-t2", label: "Class debrief: was stopping him the right call?" },
      { id: "w35-t3", label: "Capstone: design the case (era, suspect, three clues)" },
      { id: "w35-t4", label: "Capstone: write the script from the frames" },
    ],
    status: "planned",
  },
  {
    week: 36, semester: 2, arc: 6, title: "Capstone presentations + year reflection", type: "capstone",
    summary: "Students present their own time-travel case; the class solves each with the Audience Sheet. Then the full-year Pasaporte reflection across all twenty countries.",
    tasks: [
      { id: "w36-t1", label: "Capstone presentations (class solves each case)" },
      { id: "w36-t2", label: "Score with the rubric (target: Intermediate Low → Mid)" },
      { id: "w36-t3", label: "Students complete the full-year Pasaporte reflection" },
    ],
    link: PASAPORTE, status: "planned",
  },
];

/** Flat list of every task id across the whole year. */
export const ALL_TASK_IDS: string[] = SEMESTER.flatMap((w) => w.tasks.map((t) => t.id));

/**
 * Task ids you can actually teach today — planned-but-unbuilt weeks excluded.
 * Progress is measured against this so the bar can reach 100% with the content
 * that exists, instead of being permanently capped by Casos 14–20.
 */
export const TEACHABLE_TASK_IDS: string[] = SEMESTER.filter((w) => w.status !== "planned").flatMap(
  (w) => w.tasks.map((t) => t.id)
);
