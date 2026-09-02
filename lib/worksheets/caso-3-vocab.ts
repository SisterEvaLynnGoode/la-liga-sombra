/**
 * Caso 3 — Guía de Campo (Madrid).
 *
 * WHY THIS EXISTS
 *
 * Caso 3's week is four days: Labor Day takes the Monday, which is the day the
 * vocabulary would normally have been introduced. Without it students open the
 * case on Tuesday having never seen «la comisaría» or «¿adónde?».
 *
 * So this is not a week of seatwork — it is a field guide plus the one lesson
 * that got cut. Pages 1–2 are reference: illustrated, English kept small,
 * meant to sit open beside the Chromebook for the whole case. Pages 3–5 are the
 * Monday that never happened, front-loaded into Tuesday.
 *
 * The vocabulary is the unit's own list, copied here in the same wording as
 * content/unit-03.json so the paper and the game cannot drift apart. The icons
 * carry the meaning: a student mid-interrogation wants a picture of a bus, not
 * an English word to translate twice.
 *
 * The four question words and `ir + a` are the load-bearing part. Caso 3 is
 * built on asking where someone went and how they got there; a student who
 * cannot read «¿adónde vas?» cannot start the case at all.
 */

import type { MatchPair, WeekOnePage } from "@/lib/worksheets/paper";

// ── The unit's vocabulary, grouped for teaching ──────────────────────────────

const LANDMARKS: MatchPair[] = [
  { spanish: "la Puerta del Sol", english: "the main square" },
  { spanish: "el Museo del Prado", english: "the Prado Museum" },
  { spanish: "el Parque del Retiro", english: "Retiro Park" },
  { spanish: "la Gran Vía", english: "the main street" },
  { spanish: "la Estación de Atocha", english: "Atocha train station" },
];

const PLACES: MatchPair[] = [
  { spanish: "el aeropuerto", english: "airport" },
  { spanish: "el hotel", english: "hotel" },
  { spanish: "la farmacia", english: "pharmacy" },
  { spanish: "el restaurante", english: "restaurant" },
  { spanish: "el mercado", english: "market" },
  { spanish: "la plaza", english: "plaza" },
  { spanish: "la calle", english: "street" },
  { spanish: "el banco", english: "bank" },
  { spanish: "la comisaría", english: "police station" },
];

const TRANSPORT: MatchPair[] = [
  { spanish: "el metro", english: "subway" },
  { spanish: "el autobús", english: "bus" },
  { spanish: "el taxi", english: "taxi" },
  { spanish: "el tren", english: "train" },
  { spanish: "la bicicleta", english: "bicycle" },
  { spanish: "el coche", english: "car" },
  { spanish: "el avión", english: "airplane" },
  { spanish: "a pie", english: "on foot" },
];

const ER_VERBS: MatchPair[] = [
  { spanish: "comer", english: "to eat" },
  { spanish: "beber", english: "to drink" },
  { spanish: "correr", english: "to run" },
  { spanish: "leer", english: "to read" },
  { spanish: "vender", english: "to sell" },
  { spanish: "ver", english: "to see" },
  { spanish: "aprender", english: "to learn" },
  { spanish: "comprender", english: "to understand" },
];

const QUESTIONS: MatchPair[] = [
  { spanish: "¿adónde?", english: "where to?" },
  { spanish: "¿cuándo?", english: "when?" },
  { spanish: "¿cómo?", english: "how?" },
  { spanish: "¿por qué?", english: "why?" },
  { spanish: "¿quién?", english: "who?" },
  { spanish: "¿cuánto?", english: "how much / many?" },
];

// ── Pages ────────────────────────────────────────────────────────────────────

export const CASO_3_PAGES: WeekOnePage[] = [
  // ── 1 · Reference: places ──────────────────────────────────────────────
  {
    id: "c3-lugares",
    day: "Guía de Campo · 1",
    title: "Madrid — los lugares",
    subtitle: "Keep this page open while you work the case. You are not expected to memorise it today.",
    blocks: [
      {
        kind: "instructions",
        text:
          "This is your field guide, agent. La Sombra is moving through Madrid and every witness will tell you a PLACE. " +
          "You do not need to translate these into English to use them — look at the picture, then look for that place on your map.",
      },
      {
        kind: "iconGrid",
        title: "Los cinco lugares famosos de Madrid",
        instructions: "Real places. You can look all five up online tonight — they exist, and the case gets better when you know what they look like.",
        columns: 5,
        items: LANDMARKS,
      },
      {
        kind: "iconGrid",
        title: "Lugares de la ciudad",
        instructions: "Circle the three you think a thief would use. You will find out on Friday whether you were right.",
        columns: 5,
        items: PLACES,
      },
      {
        kind: "writeLines",
        title: "Tu barrio · Your neighbourhood",
        instructions: "Which of these places exist within a mile of your house? Write the Spanish, not the English.",
        prompts: ["Cerca de mi casa hay…", "No hay… cerca de mi casa.", "Mi lugar favorito es…"],
        lines: 1,
      },
    ],
    footer: "Caso 3 · Persecución por Madrid — guía de campo, página 1 de 2. No la pierdas.",
  },

  // ── 2 · Reference: transport, verbs, questions ─────────────────────────
  {
    id: "c3-transporte",
    day: "Guía de Campo · 2",
    title: "El transporte y las preguntas",
    subtitle: "The other half of the guide. Every suspect went somewhere, and got there somehow.",
    blocks: [
      {
        kind: "iconGrid",
        title: "¿Cómo vas? · How do you get there?",
        instructions: "Madrid has one of the best metro systems in the world — that is why «el metro» comes up in almost every interview.",
        columns: 4,
        items: TRANSPORT,
      },
      {
        kind: "grid",
        title: "Las seis preguntas del detective",
        columns: 3,
        pairs: QUESTIONS,
      },
      {
        kind: "instructions",
        text:
          "IR + A — the single most useful thing on this page. «Voy a» = I go to / I am going to. «Vas a» = you go to. " +
          "«Va a» = he, she or it goes to. Watch the trap: a + el joins into AL. Voy al banco, never «voy a el banco». Voy a la plaza stays as it is.",
      },
      {
        kind: "iconGrid",
        title: "Verbos -ER",
        instructions: "Six of these have a picture. Two do not, because nobody can draw «to understand» — write your own reminder in the box instead.",
        columns: 4,
        items: ER_VERBS,
      },
    ],
    footer: "Caso 3 · guía de campo, página 2 de 2.",
  },

  // ── 3 · The lesson Labor Day took ──────────────────────────────────────
  {
    id: "c3-adonde",
    day: "Día 1 · martes",
    title: "¿Adónde vas? ¿Cómo vas?",
    subtitle: "Plan La Sombra's route across Madrid. This is the sentence you will type most often in this case.",
    blocks: [
      {
        kind: "instructions",
        text:
          "Follow the frame exactly and you cannot get it wrong: «Voy a ___ en ___.» " +
          "Remember AL for masculine places (al banco, al mercado, al hotel) and A LA for feminine ones (a la plaza, a la farmacia, a la comisaría). " +
          "For walking there is no «en» — you just say «a pie».",
      },
      {
        kind: "routePlan",
        title: "La ruta de La Sombra",
        instructions:
          "Witnesses put La Sombra in these five places, in this order. Write each leg of the journey in Spanish. Choose any transport that makes sense — a thief does not take a plane across one city.",
        frame: "Voy a ___________ en ___________.",
        legs: [
          { from: "el hotel", to: "el Museo del Prado", hint: "It is 15 minutes away." },
          { from: "el Museo del Prado", to: "la Estación de Atocha", hint: "Carrying something heavy." },
          { from: "la Estación de Atocha", to: "el mercado", hint: "Across the city." },
          { from: "el mercado", to: "la Gran Vía", hint: "Three streets. He is in a hurry." },
          { from: "la Gran Vía", to: "el aeropuerto", hint: "He is trying to leave the country." },
        ],
      },
      {
        kind: "partnerTalk",
        title: "Interrogatorio · pregunta a tu compañero",
        instructions:
          "Stand up. Find a partner who is NOT sitting at your table. Run the script three times with three different people, and write down exactly what each one says — their words, not your summary.",
        frames: [
          "A: —Hola. ¿Adónde vas los sábados?",
          "B: —Voy a ___________.",
          "A: —¿Cómo vas?",
          "B: —Voy en ___________. / Voy a pie.",
          "A: —¿Con quién vas?",
          "B: —Voy con ___________.",
        ],
        rounds: 3,
        evidencePrompt: "Write your partner's exact words: «__________________________» — dijo ___________.",
      },
    ],
    footer: "Si terminas: escribe tu propia ruta de cinco lugares por Madrid al reverso.",
  },

  // ── 4 · Reading, with evidence ─────────────────────────────────────────
  {
    id: "c3-informe",
    day: "Día 2 · miércoles",
    title: "El informe del testigo",
    subtitle: "Read a real witness statement. Answer from the text — and prove it.",
    blocks: [
      {
        kind: "citeEvidence",
        title: "Declaración de la señora Ramos, vendedora del mercado",
        instructions:
          "Read it twice before you write anything. For every answer you must copy the Spanish words that prove it — the line number is not enough. This is what «citing evidence» means, and you will do it in every case this year.",
        passage: [
          "Me llamo Rosa Ramos. Vendo fruta en el mercado de la plaza.",
          "El martes, un hombre alto compra dos manzanas. No come nada.",
          "Lee un papel pequeño muchas veces. Está nervioso.",
          "Pregunta: «¿Adónde va el autobús número 27?»",
          "Yo comprendo la pregunta, pero no comprendo por qué corre después.",
          "No va a pie. No va en taxi. Va en autobús, a las tres de la tarde.",
        ],
        questions: [
          {
            q: "¿Dónde trabaja la señora Ramos?",
            answer: "En el mercado (de la plaza) — vende fruta.",
            evidence: "Vendo fruta en el mercado de la plaza.",
          },
          {
            q: "¿Qué hace el hombre con el papel?",
            answer: "Lo lee muchas veces.",
            evidence: "Lee un papel pequeño muchas veces.",
          },
          {
            q: "¿Cómo va el hombre? ¿Y a qué hora?",
            answer: "Va en autobús, a las tres de la tarde.",
            evidence: "Va en autobús, a las tres de la tarde.",
          },
          {
            q: "¿Qué NO comprende la señora Ramos?",
            answer: "No comprende por qué el hombre corre después.",
            evidence: "no comprendo por qué corre después",
          },
        ],
      },
      {
        kind: "writeLines",
        title: "Tu conclusión de detective",
        instructions: "Two sentences in Spanish. Use one -ER verb and one «va a».",
        prompts: ["Yo creo que el hombre…", "Después, va a…"],
        lines: 2,
      },
    ],
  },

  // ── 5 · Consolidation before the case opens ────────────────────────────
  {
    id: "c3-repaso",
    day: "Día 3 · jueves",
    title: "Repaso antes de abrir el caso",
    subtitle: "Everything from the field guide, one last time — then Madrid is yours.",
    blocks: [
      {
        kind: "wordSearch",
        title: "Sopa de letras · Madrid",
        instructions: "Fourteen words from the guide are hidden here — across, down and diagonally. Accents are not printed in the grid.",
        words: [
          "METRO", "AUTOBUS", "TAXI", "TREN", "BICICLETA", "COCHE", "AVION",
          "MERCADO", "PLAZA", "BANCO", "HOTEL", "FARMACIA", "CALLE", "MUSEO",
        ],
        size: 14,
        seed: 303,
      },
      {
        kind: "iconGrid",
        title: "Autoevaluación · cover the English and name each one",
        instructions:
          "Fold the page so the words are hidden, then name each picture out loud in Spanish. Anything you cannot name, circle — those are the ones to look at again tonight.",
        columns: 6,
        // Exactly two rows of six. Fourteen ran the page 63px past the
        // printable area, which costs a whole second sheet per student.
        items: [...TRANSPORT, ...PLACES.slice(0, 4)],
        hideEnglish: true,
      },
      {
        kind: "survey",
        title: "Encuesta de la clase · ¿Cómo vienes a la escuela?",
        instructions:
          "Ask six classmates. Write their answer in Spanish. Then count: which transport wins in this class?",
        question: "¿Cómo vienes a la escuela? — Vengo en ___ / Vengo a pie.",
        columns: ["Nombre", "¿Cómo viene?"],
        rows: 6,
      },
    ],
    footer: "Caso 3 abre el viernes. Trae la guía de campo — la vas a necesitar.",
  },
];
