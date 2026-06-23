/**
 * Presentation-milestone content for the printable rubric + planning sheets.
 *
 * Three milestones ladder across the 18-week semester (one per six-week arc),
 * moving students up the ACTFL presentational scale from Novice Mid to
 * Intermediate Low. A single scalable rubric grades all three; expectations
 * (the target band) rise each time.
 *
 * Plain text only, so it prints clean in black and white.
 */

// ── Rubric ──────────────────────────────────────────────────────────────────

export interface RubricLevel {
  label: string;
  band: string;
  points: number;
}

export interface RubricRow {
  criterion: string; // Spanish label
  en: string; // English label
  /** Descriptor for each level, lowest → highest */
  cells: [string, string, string, string];
}

export const RUBRIC_LEVELS: RubricLevel[] = [
  { label: "Necesita apoyo", band: "Novice Low", points: 1 },
  { label: "En desarrollo", band: "Novice Mid", points: 2 },
  { label: "Logrado", band: "Novice High", points: 3 },
  { label: "Sobresaliente", band: "Intermediate Low", points: 4 },
];

export const RUBRIC_ROWS: RubricRow[] = [
  {
    criterion: "Contenido",
    en: "Content & completion",
    cells: [
      "Missing several required parts; very short.",
      "Includes some required parts; incomplete.",
      "Includes all required parts of the task.",
      "All parts, plus extra detail or a personal touch.",
    ],
  },
  {
    criterion: "Vocabulario",
    en: "Vocabulary",
    cells: [
      "Few unit words; relies on English.",
      "Some unit words; noticeable gaps.",
      "Uses unit vocabulary correctly throughout.",
      "Rich, varied vocabulary beyond the minimum.",
    ],
  },
  {
    criterion: "Gramática",
    en: "Grammar control",
    cells: [
      "Frequent errors block meaning.",
      "Errors, but meaning is mostly clear.",
      "Unit structures used correctly; minor slips.",
      "Accurate, with some longer or complex sentences.",
    ],
  },
  {
    criterion: "Comprensibilidad",
    en: "Comprehensibility",
    cells: [
      "Hard to understand; little practice evident.",
      "Understandable with effort.",
      "Clearly understandable; good pronunciation.",
      "Confident, natural pronunciation and pacing.",
    ],
  },
  {
    criterion: "Presentación",
    en: "Delivery",
    cells: [
      "Reads everything; little eye contact; switches to English.",
      "Some preparation; some eye contact.",
      "Prepared; good eye contact; stays in Spanish and in character.",
      "Polished and engaging; fully in role.",
    ],
  },
];

// ── Milestones 1 & 2 ────────────────────────────────────────────────────────

export interface SentenceFrame {
  es: string;
  en: string;
}

export interface Milestone {
  number: number;
  titleEs: string;
  titleEn: string;
  arc: string;
  week: string;
  durationSec: number;
  mode: string; // how it's delivered
  targetBand: string;
  blurb: string;
  requiredParts: string[];
  frames: SentenceFrame[];
  checklist: string[];
}

export const MILESTONES: Milestone[] = [
  {
    number: 1,
    titleEs: "Informe de Campo",
    titleEn: "Field Report",
    arc: "Arc 1 (Units 1–3)",
    week: "End of Week 6",
    durationSec: 60,
    mode: "Mostly memorized — no notes",
    targetBand: "Novice Mid",
    blurb:
      "Introduce your agent and share one culture fact from a country you have solved. Short, confident, in character. This is your first time speaking Spanish to an audience — keep it simple and practice until it flows.",
    requiredParts: [
      "A greeting",
      "Your agent name",
      "Where your agent is 'from'",
      "One culture fact, in Spanish, from a solved case",
      "A closing line",
    ],
    frames: [
      { es: "Hola, me llamo Agente ____.", en: "Hello, my name is Agent ____." },
      { es: "Soy de ____.", en: "I'm from ____." },
      { es: "Mi especialidad es ____.", en: "My specialty is ____." },
      { es: "En ____, aprendí que ____.", en: "In ____ (country), I learned that ____. (culture fact)" },
      { es: "Gracias. ¡Hasta la próxima!", en: "Thank you. Until next time!" },
    ],
    checklist: [
      "I practiced out loud at least 3 times",
      "I can say it without reading",
      "It is about 60 seconds",
      "I stayed in Spanish the whole time",
      "I made eye contact with the audience",
    ],
  },
  {
    number: 2,
    titleEs: "Informe del Caso",
    titleEn: "Case Briefing",
    arc: "Arc 2 (Units 4–6 + Operación Eclipse)",
    week: "End of Week 12",
    durationSec: 120,
    mode: "Note cards allowed — do not read a full script",
    targetBand: "Novice High",
    blurb:
      "Brief the agency on a case you solved, then compare that country's culture to your own. Use up to three note cards — glance, don't read. Stay in your detective role and keep it in Spanish.",
    requiredParts: [
      "Which case and country",
      "The suspect you caught",
      "Three important clues or vocabulary words",
      "One culture comparison (that country vs. your own)",
      "A closing line",
    ],
    frames: [
      { es: "Resolví el Caso ____ en ____.", en: "I solved Case ____ in ____ (country)." },
      { es: "El criminal es ____.", en: "The criminal is ____." },
      { es: "Tres pistas importantes son: ____, ____, y ____.", en: "Three important clues are: ____, ____, and ____." },
      { es: "En ____, la cultura es diferente de la mía porque ____.", en: "In ____, the culture is different from mine because ____." },
      { es: "Caso cerrado. Gracias por su atención.", en: "Case closed. Thank you for your attention." },
    ],
    checklist: [
      "I made three note cards (not a full script)",
      "I practiced with the cards at least 3 times",
      "It is about 2 minutes",
      "My culture comparison has a real detail",
      "I stayed in Spanish and in character",
    ],
  },
];

// ── Capstone ────────────────────────────────────────────────────────────────

export interface CapstoneStep {
  titleEs: string;
  titleEn: string;
  instructions: string;
  fields: string[];
}

export interface CapstoneSpec {
  titleEs: string;
  titleEn: string;
  arc: string;
  week: string;
  targetBand: string;
  blurb: string;
  steps: CapstoneStep[];
  scriptFrames: SentenceFrame[];
  selfCheck: string[];
}

export const CAPSTONE: CapstoneSpec = {
  titleEs: "Diseña Tu Propio Caso",
  titleEn: "Design Your Own Case",
  arc: "Arc 3 finale (after Units 7–10)",
  week: "Weeks 17–18",
  targetBand: "Intermediate Low",
  blurb:
    "You are now a senior agent. Research a real Spanish-speaking city, invent your own original case set there, and present it to the class — who will try to solve it. This is your final mission: language, culture, creativity, and presentation all in one.",
  steps: [
    {
      titleEs: "Paso 1 · Investiga",
      titleEn: "Research",
      instructions:
        "Choose a real Spanish-speaking country and city you have NOT solved a case in yet. Research it.",
      fields: [
        "País / Country:",
        "Ciudad / City:",
        "Tres datos culturales (en español) / Three culture facts:",
        "Tres palabras de vocabulario en español / Three Spanish vocab words:",
        "El tesoro cultural robado / The cultural treasure that was stolen:",
      ],
    },
    {
      titleEs: "Paso 2 · Diseña el Caso",
      titleEn: "Design the Case",
      instructions:
        "Invent the crime and the suspects. Describe your main suspect in three Spanish sentences using ser and estar.",
      fields: [
        "El crimen / The crime (1–2 sentences):",
        "Sospechoso principal — descripción en español (3 oraciones con ser/estar):",
        "Tres pistas, en español / Three clues, in Spanish:",
        "¿Quién es el culpable? / Who is guilty? (the answer — keep it secret!):",
      ],
    },
    {
      titleEs: "Paso 3 · Escribe tu Guion",
      titleEn: "Write your Script",
      instructions:
        "Plan how you will present the case to the class. Use the frames below. The class will listen and try to guess the culprit.",
      fields: [
        "Apertura — briefing del caso / Opening briefing:",
        "Presenta a los sospechosos / Introduce the suspects:",
        "Da las pistas / Give the clues:",
        "La revelación / The reveal:",
      ],
    },
  ],
  scriptFrames: [
    { es: "Buenas tardes, agentes. Tenemos un caso en ____.", en: "Good afternoon, agents. We have a case in ____." },
    { es: "Alguien robó ____.", en: "Someone stole ____." },
    { es: "Hay tres sospechosos. El primero es ____. Es ____ y está ____.", en: "There are three suspects. The first is ____. He/she is ____ and is feeling ____." },
    { es: "La primera pista es ____.", en: "The first clue is ____." },
    { es: "¿Quién creen que es el culpable? … ¡El culpable es ____!", en: "Who do you think is guilty? … The culprit is ____!" },
  ],
  selfCheck: [
    "My case is set in a real Spanish-speaking city I researched",
    "My suspect description uses ser and estar correctly",
    "All three clues are written in Spanish",
    "My culture facts are accurate and in Spanish",
    "I practiced my presentation out loud at least 3 times",
    "The class can follow and try to solve my case",
  ],
};

// ── Audience / peer sheet ───────────────────────────────────────────────────

export const AUDIENCE_PROMPTS: string[] = [
  "País del caso / Case country:",
  "¿Qué robaron? / What was stolen?:",
  "Describe a un sospechoso / Describe one suspect (in Spanish):",
  "Tu sospechoso — ¿quién es el culpable? / Your guess for the culprit:",
  "Una cosa que aprendiste sobre la cultura / One culture thing you learned:",
];

export const AUDIENCE_FEEDBACK: SentenceFrame[] = [
  { es: "Me gustó… / I liked…", en: "" },
  { es: "Aprendí que… / I learned that…", en: "" },
  { es: "Una pregunta: … / A question: …", en: "" },
];
