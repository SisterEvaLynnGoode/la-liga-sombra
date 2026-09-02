/**
 * Caso 4 — el paquete del suplente.
 *
 * WHY THIS EXISTS
 *
 * Mr. Tommy is out on the Monday that opens Caso 4, which is the day the
 * family and emotion vocabulary would have been introduced. A substitute who
 * speaks no Spanish has to deliver it, and the class still has to arrive on
 * Tuesday knowing what «la abuela» and «está preocupada» mean.
 *
 * NOT REPETITIVE WITH THE HQ PACKET — THE POINT OF THE DESIGN
 *
 * The HQ worksheets later in the week (lib/worksheets/generate.ts) do the
 * mechanical practice for this same vocabulary: two-column matching, translate
 * both directions, unscrambles, and word-bank fill-in. If this packet did any
 * of that, Thursday would feel like Monday photocopied.
 *
 * So this packet deliberately owns a different half of the work — meaning
 * rather than mechanics:
 *
 *   drawing      students draw the twelve emotions, which is how an adjective
 *                gets learned without an English column
 *   deduction    a family tree reconstructed from Spanish clues — the words are
 *                the tool, not the exercise
 *   talking      partner script with printed frames, the school's Student Talk
 *                goal, and something a sub can actually run with a timer
 *   personal     their own family and their own likes, which no generated
 *                worksheet can ask for
 *
 * Nothing here is matched, unscrambled, or filled in from a bank. When the HQ
 * packet arrives on Thursday it will be the first time they have done those
 * with these words.
 *
 * NOT A SPOILER
 *
 * The deduction puzzle uses the invented Familia Vargas, NOT the Montoya family
 * from the case. Same relationships, same grammar, different people — so the
 * skill transfers and the mystery survives contact with Monday.
 *
 * FOR THE SUBSTITUTE
 *
 * Page 1 is written to the adult in the room, not the students. It needs no
 * Spanish and no prep: every activity is either silent work or a scripted
 * partner drill with a timer.
 */

import type { MatchPair, WeekOnePage } from "@/lib/worksheets/paper";

const FAMILY: MatchPair[] = [
  { spanish: "la madre / la mamá", english: "mother / mom" },
  { spanish: "el padre / el papá", english: "father / dad" },
  { spanish: "el hermano", english: "brother" },
  { spanish: "la hermana", english: "sister" },
  { spanish: "la abuela", english: "grandmother" },
  { spanish: "el abuelo", english: "grandfather" },
  { spanish: "el tío", english: "uncle" },
  { spanish: "la tía", english: "aunt" },
  { spanish: "el primo", english: "male cousin" },
  { spanish: "la prima", english: "female cousin" },
  { spanish: "el nieto", english: "grandson" },
  { spanish: "el esposo / el marido", english: "husband" },
];

const EMOTIONS: MatchPair[] = [
  { spanish: "contento / contenta", english: "happy, pleased" },
  { spanish: "triste", english: "sad" },
  { spanish: "nervioso / nerviosa", english: "nervous" },
  { spanish: "enojado / enojada", english: "angry" },
  { spanish: "cansado / cansada", english: "tired" },
  { spanish: "preocupado / preocupada", english: "worried" },
  { spanish: "emocionado / emocionada", english: "excited" },
  { spanish: "aburrido / aburrida", english: "bored" },
  { spanish: "asustado / asustada", english: "scared" },
  { spanish: "sorprendido / sorprendida", english: "surprised" },
  { spanish: "tranquilo / tranquila", english: "calm" },
  { spanish: "feliz", english: "joyful" },
];

const IR_VERBS: MatchPair[] = [
  { spanish: "vivir", english: "to live" },
  { spanish: "escribir", english: "to write" },
  { spanish: "abrir", english: "to open" },
  { spanish: "recibir", english: "to receive" },
  { spanish: "compartir", english: "to share" },
  { spanish: "describir", english: "to describe" },
];

export const CASO_4_PAGES: WeekOnePage[] = [
  // ── 0 · The substitute's page ──────────────────────────────────────────
  {
    id: "c4-suplente",
    day: "Para el suplente",
    title: "Substitute plan — do not copy this page for students",
    subtitle: "No Spanish required. Everything is on the students' pages; you are running a clock, not a lesson.",
    blocks: [
      {
        kind: "instructions",
        text:
          "THE SHORT VERSION. Hand out the four student pages stapled. They work through them in order. " +
          "You do not need to pronounce anything — if a student asks how a word sounds, tell them to ask a neighbour, then to write down their best guess and circle it. " +
          "Guessing and being corrected on Tuesday is the lesson working, not failing.",
      },
      {
        kind: "grid",
        title: "Timing — a 50-minute period",
        columns: 2,
        pairs: [
          { spanish: "0–5 min", english: "Hand out. Students write their name and read the box at the top of page 1." },
          { spanish: "5–20 min", english: "Page 1 — LAS CARAS. Silent drawing. They draw twelve faces. Expect it to be quiet and busy." },
          { spanish: "20–35 min", english: "Page 2 — LA FAMILIA VARGAS. Silent puzzle. Hardest page; let them help each other quietly." },
          { spanish: "35–45 min", english: "Page 3 — HABLAR. Loud on purpose. Students stand, find three partners, read the script. Set a 3-minute timer per partner." },
          { spanish: "45–50 min", english: "Page 4 — MI FAMILIA. Start it; it is homework if unfinished. Collect nothing; they keep the packet." },
        ],
      },
      {
        kind: "grid",
        title: "80-minute block instead?",
        columns: 2,
        pairs: [
          { spanish: "Add 15 min", english: "Let page 1 run long — the drawing is the vocabulary lesson, not a warm-up." },
          { spanish: "Add 15 min", english: "Page 3: run FIVE partners instead of three, still 3 minutes each." },
          { spanish: "Any time left", english: "Page 4 finished in class, then they may draw their own family tree on the back." },
        ],
      },
      {
        kind: "instructions",
        text:
          "IF IT GOES WRONG. If the class will not settle for page 3, skip it and have them finish pages 2 and 4 silently — " +
          "the speaking is the part I can redo myself on Tuesday, and the puzzle is the part I cannot. " +
          "Please leave me a note saying which pages the class actually got through. That is more useful to me than a behaviour report.",
      },
    ],
    footer: "Caso 4 · La Familia Sospechosa — substitute plan. Questions: leave a note on the desk.",
  },

  // ── 1 · Emotions, by drawing them ──────────────────────────────────────
  {
    id: "c4-caras",
    day: "Página 1",
    title: "Las caras — draw the feeling",
    subtitle: "Twelve emotions. No English needed: if you can draw it, you know it.",
    blocks: [
      {
        kind: "instructions",
        text:
          "Agent — a new case opens tomorrow, in Costa Rica, inside one family. Somebody in that family is lying, and you will catch them by watching how they FEEL, not what they say. " +
          "Draw a face for each word below. Simple is fine — two eyes and a mouth is enough. The English is there if you need it, but try to draw first and check second.",
      },
      {
        kind: "faceGrid",
        title: "¿Cómo está?",
        instructions: "One face per box. Do all twelve — the four hardest ones are the four you will need most.",
        columns: 4,
        words: EMOTIONS,
      },
      {
        kind: "instructions",
        text:
          "THE -O / -A RULE. Most of these change their last letter depending on who you are talking about: " +
          "a boy is «cansado», a girl is «cansada». Two of the twelve never change no matter what — find them and circle them. (Hint: they do not end in -o or -a.)",
      },
    ],
    footer: "Página 1 de 4 · si terminas temprano, dibuja tu propia cara ahora mismo y escribe cómo estás.",
  },

  // ── 2 · Family, by deduction ───────────────────────────────────────────
  {
    id: "c4-familia-vargas",
    day: "Página 2",
    title: "La Familia Vargas — reconstruye el árbol",
    subtitle: "Seven people. Six clues in Spanish. Work out who is who.",
    blocks: [
      {
        kind: "instructions",
        text:
          "This is a practice family — not the family in tomorrow's case. Read every clue before you write anything, the way a real detective reads a whole file first. " +
          "You do not need to understand every word. You need to understand ENOUGH.",
      },
      {
        kind: "deduction",
        title: "Las pistas · the clues",
        instructions:
          "Use the clues to fill in the tree, then answer the questions. Every answer is provable from the clues — if you are guessing, read again.",
        clues: [
          "1. La abuela Pilar vive en San José. Tiene dos hijos: Beatriz y Óscar.",
          "2. Beatriz es la madre de Nico. Nico tiene quince años.",
          "3. Óscar es el tío de Nico. Óscar y su esposa Rosa tienen una hija: Valeria.",
          "4. Valeria es la prima de Nico. Valeria escribe en su diario todos los días.",
          "5. Nico es el nieto de Pilar. Recibe una carta de su abuela cada mes.",
          "6. Rosa no es hija de Pilar. Rosa es la esposa de Óscar.",
        ],
        wordBank: ["Pilar", "Beatriz", "Óscar", "Rosa", "Nico", "Valeria"],
        questions: [
          { q: "¿Quién es la abuela de Valeria?", answer: "Pilar" },
          { q: "¿Quién es el tío de Nico?", answer: "Óscar" },
          { q: "¿Quién es la prima de Nico?", answer: "Valeria" },
          { q: "¿Quién es la madre de Nico?", answer: "Beatriz" },
          { q: "¿Quién es la esposa de Óscar?", answer: "Rosa" },
          { q: "¿Quién es el nieto de Pilar?", answer: "Nico" },
          { q: "Rosa is married into this family. Which Spanish words in clue 6 prove it?", answer: "«Rosa no es hija de Pilar. Rosa es la esposa de Óscar.»" },
        ],
      },
      {
        kind: "familyTree",
        title: "El árbol de la familia Vargas",
        instructions: "Write each name in the right box. The top row is the oldest generation.",
        rows: [
          { slots: ["la abuela"] },
          { slots: ["la hija", "el hijo", "la esposa del hijo"] },
          { slots: ["el nieto", "la nieta"] },
        ],
        wordBank: ["Pilar", "Beatriz", "Óscar", "Rosa", "Nico", "Valeria"],
      },
    ],
    footer: "Página 2 de 4 · la más difícil. Si la terminas, ya sabes lo que necesitas para mañana.",
  },

  // ── 3 · Talking ────────────────────────────────────────────────────────
  {
    id: "c4-hablar",
    day: "Página 3",
    title: "Hablar — pregunta a tres compañeros",
    subtitle: "Read the script exactly. Write down what they actually say.",
    blocks: [
      {
        kind: "instructions",
        text:
          "Stand up and find someone who is NOT at your table. Read the script as written — you are not supposed to invent Spanish yet. " +
          "Three partners, three minutes each. The substitute will time you.",
      },
      {
        kind: "partnerTalk",
        title: "El guion · the script",
        instructions:
          "Person A reads the A lines. Person B answers with the frame. Then swap. Write your partner's exact words in the evidence line — copy what they said, do not summarise it.",
        frames: [
          "A: —Hola. ¿Cómo estás hoy?",
          "B: —Estoy ___________. (usa una palabra de la página 1)",
          "A: —¿Por qué?",
          "B: —Porque ___________.",
          "A: —¿Cuántas personas hay en tu familia?",
          "B: —En mi familia hay ___________ personas.",
          "A: —¿Con quién vives?",
          "B: —Vivo con mi ___________ y mi ___________.",
        ],
        rounds: 3,
        evidencePrompt: "Palabras exactas de mi compañero/a: «__________________________» — ___________ (nombre).",
      },
      {
        kind: "writeLines",
        title: "Después de hablar",
        instructions: "Look at your three evidence lines. Write two sentences in Spanish about your classmates — not about yourself.",
        prompts: ["Hoy, ___________ está…", "En la familia de ___________ hay…"],
        lines: 2,
      },
    ],
    footer: "Página 3 de 4 · esta página se hace de pie y en voz alta. Es normal que haya ruido.",
  },

  // ── 4 · Their own family ───────────────────────────────────────────────
  {
    id: "c4-mi-familia",
    day: "Página 4",
    title: "Mi familia — y lo que me gusta",
    subtitle: "Your family, your words. Nothing here has a right answer.",
    blocks: [
      {
        kind: "instructions",
        text:
          "MI, TU, SU — «mi hermana» = my sister. «tu hermana» = your sister. «su hermana» = his, her or your-formal sister. " +
          "More than one? Add an -s: mis hermanas, tus primos, sus tíos. That is the whole rule.",
      },
      {
        kind: "familyTree",
        title: "Mi árbol familiar",
        instructions:
          "Draw YOUR family — however your family is actually shaped. Add boxes, remove boxes, use pets, use whoever raised you. Label each person in Spanish: mi madre, mi tío, mi hermana.",
        rows: [
          { slots: ["", ""] },
          { slots: ["", "", ""] },
          { slots: ["yo", ""] },
        ],
      },
      {
        kind: "iconGrid",
        title: "Verbos -IR",
        instructions: "Six new verbs. Four have a picture; two do not. Write your own reminder for those two.",
        columns: 6,
        items: IR_VERBS,
      },
      {
        kind: "writeLines",
        title: "Me gusta / No me gusta",
        instructions:
          "«Me gusta» + one thing. «Me gustan» + more than one thing. Write three sentences about your family using one -IR verb in each.",
        prompts: [
          "Me gusta compartir…",
          "Mi ___________ vive en…",
          "Mi ___________ y yo escribimos / abrimos / recibimos…",
        ],
        lines: 1,
      },
      {
        kind: "grid",
        title: "Referencia rápida — la familia",
        columns: 3,
        pairs: FAMILY,
      },
    ],
    footer: "Página 4 de 4 · termina en casa si es necesario. Mañana abrimos el Caso 4: La Familia Sospechosa.",
  },
];
