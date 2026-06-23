/**
 * The 18-week semester pacing plan for La Liga Sombra.
 *
 * Three six-week arcs move students up the ACTFL scale from Novice Low to
 * Intermediate Low. Each unit week runs the 4-day engine (Field · Field · HQ ·
 * Culture); review/prep weeks, the boss mission, the milestones, and the capstone
 * fill out the rest. Rendered by the dashboard Pacing tab with per-class check-off.
 */

export type WeekType = "unit" | "milestone" | "boss" | "capstone" | "review";

export interface PacingTask {
  id: string;
  label: string;
}

export interface PacingLink {
  href: string;
  label: string;
}

export interface PacingWeek {
  week: number;
  arc: 1 | 2 | 3;
  title: string;
  type: WeekType;
  unitNumber?: number;
  summary: string;
  tasks: PacingTask[];
  link?: PacingLink;
}

export interface Arc {
  n: 1 | 2 | 3;
  title: string;
  weeks: string;
  band: string;
}

export const ARCS: Arc[] = [
  { n: 1, title: "Foundations", weeks: "Weeks 1–6", band: "Novice Low → Mid" },
  { n: 2, title: "Daily life & description", weeks: "Weeks 7–12", band: "Novice Mid → High" },
  { n: 3, title: "Culture & future", weeks: "Weeks 13–18", band: "Novice High → Intermediate Low" },
];

// Reusable task templates ------------------------------------------------------

const unitTasks = (w: number): PacingTask[] => [
  { id: `w${w}-t1`, label: "Day 1–2 · Field: play the case (Academia + stages)" },
  { id: `w${w}-t2`, label: "Day 3 · HQ: Vocabulary + Grammar worksheets" },
  { id: `w${w}-t3`, label: "Day 4 · Culture file + Pasaporte page" },
  { id: `w${w}-t4`, label: "Stamp passports for solved case" },
];

const WORKSHEETS: PacingLink = { href: "/teacher/worksheets", label: "Print worksheets" };
const PRESENTATIONS: PacingLink = { href: "/teacher/presentations", label: "Open presentations" };
const PASAPORTE: PacingLink = { href: "/teacher/pasaporte", label: "Open Pasaporte" };

export const SEMESTER: PacingWeek[] = [
  // ── Arc 1 ──────────────────────────────────────────────────────────────────
  {
    week: 1, arc: 1, title: "Orientation + Unit 1 · México", type: "unit", unitNumber: 1,
    summary: "Set up agent accounts, hand out the Pasaporte Cultural, and play Caso I (¿Quién soy yo?). Greetings, intros, numbers.",
    tasks: [
      { id: "w1-t0", label: "Create class + student accounts; hand out Pasaportes" },
      ...unitTasks(1).slice(0, 3),
    ],
    link: PASAPORTE,
  },
  {
    week: 2, arc: 1, title: "Unit 2 · Puerto Rico", type: "unit", unitNumber: 2,
    summary: "Caso II (El robo en la escuela). Classroom vocab, ser + adjectives, -AR verbs. Culture: school-life comparison.",
    tasks: unitTasks(2), link: WORKSHEETS,
  },
  {
    week: 3, arc: 1, title: "Unit 3 · España", type: "unit", unitNumber: 3,
    summary: "Caso III (Persecución por Madrid). Places, transport, the verb ir. Culture: curate a museum gallery.",
    tasks: unitTasks(3), link: WORKSHEETS,
  },
  {
    week: 4, arc: 1, title: "Review & culture catch-up", type: "review",
    summary: "Re-teach the vocabulary and grammar the Inbox and Units tabs flag as weak. Finish any culture pages.",
    tasks: [
      { id: "w4-t1", label: "Review flagged vocab (Units + Vocabulary tabs)" },
      { id: "w4-t2", label: "Re-teach struggling grammar from the Inbox" },
      { id: "w4-t3", label: "Finish/collect Pasaporte pages for Units 1–3" },
    ],
  },
  {
    week: 5, arc: 1, title: "Milestone 1 prep · Field Report", type: "milestone",
    summary: "Hand out the Milestone 1 planning sheet. Students draft a 60-second 'Field Report' from the sentence frames and practice.",
    tasks: [
      { id: "w5-t1", label: "Hand out Milestone 1 sheet + rubric" },
      { id: "w5-t2", label: "Students draft scripts from the frames" },
      { id: "w5-t3", label: "Practice in pairs" },
    ],
    link: PRESENTATIONS,
  },
  {
    week: 6, arc: 1, title: "Milestone 1 presentations", type: "milestone",
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
    week: 7, arc: 2, title: "Unit 4 · Costa Rica", type: "unit", unitNumber: 4,
    summary: "Caso IV (La Familia Sospechosa). Family, emotions, ser vs estar. Culture: pura-vida eco-brochure.",
    tasks: unitTasks(4), link: WORKSHEETS,
  },
  {
    week: 8, arc: 2, title: "Unit 5 · Argentina", type: "unit", unitNumber: 5,
    summary: "Caso V (Hackeo en Buenos Aires). Tech, numbers, dates, tener-expressions. Culture: mate / recipe card.",
    tasks: unitTasks(5), link: WORKSHEETS,
  },
  {
    week: 9, arc: 2, title: "Operación Eclipse · boss mission", type: "boss",
    summary: "The capstone of Units 1–5: a five-country chase. Students pick a difficulty + partner, then debrief the ethical decision.",
    tasks: [
      { id: "w9-t1", label: "Students choose difficulty + Solo/Compañero" },
      { id: "w9-t2", label: "Play Operación Eclipse to the Desenlace" },
      { id: "w9-t3", label: "Class debrief on the ethical decision (Costa Rica)" },
    ],
  },
  {
    week: 10, arc: 2, title: "Unit 6 · Colombia", type: "unit", unitNumber: 6,
    summary: "Caso VI (El Chef Misterioso). Food, stem-changing verbs, demonstratives. Culture: Colombian recipe card.",
    tasks: unitTasks(6), link: WORKSHEETS,
  },
  {
    week: 11, arc: 2, title: "Milestone 2 prep · Case Briefing", type: "milestone",
    summary: "Hand out the Milestone 2 sheet. Students build note cards for a 2-minute Case Briefing + culture comparison.",
    tasks: [
      { id: "w11-t1", label: "Hand out Milestone 2 sheet + rubric" },
      { id: "w11-t2", label: "Students make 3 note cards from the frames" },
      { id: "w11-t3", label: "Practice with cards in pairs" },
    ],
    link: PRESENTATIONS,
  },
  {
    week: 12, arc: 2, title: "Milestone 2 presentations", type: "milestone",
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
    week: 13, arc: 3, title: "Unit 7 · Chile", type: "unit", unitNumber: 7,
    summary: "Caso VII (Sabotaje en el Festival). Arts, weather, stem-changers, ordinals. Culture: festival poster.",
    tasks: unitTasks(7), link: WORKSHEETS,
  },
  {
    week: 14, arc: 3, title: "Unit 8 · Perú", type: "unit", unitNumber: 8,
    summary: "Caso VIII (El Mercado Robado). Markets, the preterite, comparatives. Culture: market role-play.",
    tasks: unitTasks(8), link: WORKSHEETS,
  },
  {
    week: 15, arc: 3, title: "Unit 9 · República Dominicana", type: "unit", unitNumber: 9,
    summary: "Caso IX (El Taíno Robado). Body, health, the verb doler. Culture: Taíno heritage + health poster.",
    tasks: unitTasks(9), link: WORKSHEETS,
  },
  {
    week: 16, arc: 3, title: "Unit 10 · Ecuador + Capstone research", type: "unit", unitNumber: 10,
    summary: "Caso X (La Expo del Futuro). Careers, future tense. Then launch the Capstone: research a city, design a case.",
    tasks: [
      ...unitTasks(10).slice(0, 3),
      { id: "w16-t4", label: "Launch Capstone: students pick a city & research" },
    ],
    link: PRESENTATIONS,
  },
  {
    week: 17, arc: 3, title: "Capstone · build & practice", type: "capstone",
    summary: "Students design their original case (suspect with ser/estar, three Spanish clues), write a script from frames, and rehearse.",
    tasks: [
      { id: "w17-t1", label: "Design the case (suspect, clues, culprit)" },
      { id: "w17-t2", label: "Write the presentation script from frames" },
      { id: "w17-t3", label: "Practice out loud (self-check)" },
    ],
    link: PRESENTATIONS,
  },
  {
    week: 18, arc: 3, title: "Capstone presentations + reflection", type: "capstone",
    summary: "Students present 'Diseña Tu Propio Caso'; the class solves each with the Audience Sheet. Finish the Pasaporte reflection.",
    tasks: [
      { id: "w18-t1", label: "Capstone presentations (class solves each case)" },
      { id: "w18-t2", label: "Score with the rubric (target: Intermediate Low)" },
      { id: "w18-t3", label: "Students complete the Pasaporte final reflection" },
    ],
    link: PASAPORTE,
  },
];

/** Flat list of every task id, for progress totals. */
export const ALL_TASK_IDS: string[] = SEMESTER.flatMap((w) => w.tasks.map((t) => t.id));
