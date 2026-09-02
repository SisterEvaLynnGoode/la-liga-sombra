/**
 * Caso 4 — el paquete del suplente.
 *
 * WHY THIS EXISTS
 *
 * Mr. Tommy is out on the Monday that opens Caso 4, which is the day the
 * family and emotion vocabulary would have been introduced. The class still has
 * to arrive on Tuesday knowing what «la abuela» and «está preocupada» mean.
 *
 * THE PACKET RUNS ITSELF — SEATED, SILENT, STUDENT-GUIDED
 *
 * The realistic assumption is that the substitute hands out the packet and does
 * nothing else. So nothing in here depends on an adult delivering, timing or
 * managing anything:
 *
 *   • Every page is desk work. Nobody stands up, nobody pairs off, nobody
 *     leaves their chair — a class out of its seats for a stranger is a
 *     discipline problem, not a lesson, and it will be the sub who wears it.
 *   • The route through the period is printed for the STUDENTS at the top of
 *     page 1, with a tick box and a time estimate per page, so a student who
 *     finishes early knows what to do next without asking anyone.
 *   • Every page ends with its own «si terminas» line, so the answer to "I'm
 *     done" is on the page rather than at the front of the room.
 *   • Nothing is collected. Students keep the packet and bring it Tuesday.
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
 *   reading      a letter to read for evidence, answering FROM the text and
 *                copying the words that prove it
 *   personal     their own family and their own likes, which no generated
 *                worksheet can ask for
 *
 * Nothing here is matched, unscrambled, or filled in from a bank. When the HQ
 * packet arrives on Thursday it will be the first time they have done those
 * with these words.
 *
 * WHERE THE SPEAKING WENT
 *
 * An earlier draft had a stand-up partner interview on page 3, for the school's
 * Student Talk goal. It came out: a sub day is the wrong day to have thirty
 * beginners on their feet. The other school goal — citing textual evidence —
 * survives the change intact and is now carried by the letter on page 3, which
 * is silent. The speaking is the part that can be redone in five minutes on
 * Tuesday with the teacher in the room.
 *
 * NOT A SPOILER
 *
 * The Familia Vargas is invented, NOT the Montoya family from the case. Same
 * relationships, same grammar, different people — so the skill transfers and
 * the mystery survives contact with Monday.
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
    subtitle: "Hand out the packet. That is the whole job. Everything else is printed for the students.",
    blocks: [
      {
        kind: "instructions",
        text:
          "THE WHOLE PLAN. Give each student the five stapled student pages. They work through them in order, at their desks, on their own. " +
          "Page 1 tells them the route, how long each page should take, and what to do if they finish early — you do not have to time anything or announce anything.",
      },
      {
        kind: "grid",
        title: "The four things worth knowing",
        columns: 2,
        pairs: [
          { spanish: "Nobody stands up", english: "Every page is desk work on purpose. There is no partner activity and no reason for anyone to be out of their seat." },
          { spanish: "No Spanish needed", english: "If a student asks how a word sounds, tell them to write their best guess and circle it. Being corrected on Tuesday is the lesson working." },
          { spanish: "Nothing is collected", english: "Students keep the packet and bring it back Tuesday. There is nothing to grade, sort or return." },
          { spanish: "\"I'm finished\"", english: "Every page has a «si terminas» line at the bottom telling them what to do next. Point at it." },
        ],
      },
      {
        kind: "instructions",
        text:
          "IF THE PERIOD IS LONGER (block schedule). Nothing changes — the pages simply run longer. Page 1's drawing and page 4's family tree will absorb as much time as they are given, and both are worth it.",
      },
      {
        kind: "instructions",
        text:
          "ONE FAVOUR. Please leave me a note saying roughly how far the class got — which page number most students reached. " +
          "That is more useful to me than a behaviour report, and it is the only thing I need from you.",
      },
    ],
    footer: "Caso 4 · La Familia Sospechosa — substitute plan. Thank you for covering.",
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
          "Mr. Tommy is out today, so this packet is your instructions. Work through it in order, at your desk, on your own. Do not wait to be told what to do next — it is all written down.",
      },
      {
        kind: "checklist",
        title: "Tu ruta de hoy · your route through this packet",
        instructions: "Tick each page as you finish it. If you run out of time, that is fine — bring the packet back tomorrow.",
        items: [
          { label: "Página 1", minutes: 12, detail: "LAS CARAS — draw a face for all twelve feelings." },
          { label: "Página 2", minutes: 13, detail: "LA FAMILIA VARGAS — six clues, one family tree. The hardest page." },
          { label: "Página 3", minutes: 12, detail: "LA CARTA — read the letter, answer, and copy the proof." },
          { label: "Página 4", minutes: 10, detail: "¿CÓMO ESTÁ? — write the feelings and work out who said what." },
          { label: "Página 5", minutes: 8, detail: "MI FAMILIA — your own family. Finish at home if you need to." },
        ],
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
    footer: "Página 1 de 5 · si terminas: dibuja tu propia cara ahora mismo, escribe cómo estás, y pasa a la página 2.",
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
    footer: "Página 2 de 5 · la más difícil. Si terminas: escribe una pista número 7 que sea verdad, y pasa a la página 3.",
  },

  // ── 3 · Reading for evidence, silently ─────────────────────────────────
  {
    id: "c4-la-carta",
    day: "Página 3",
    title: "La carta — lee y prueba tu respuesta",
    subtitle: "A letter from abuela Pilar to her grandson. Everything you need is in the text.",
    blocks: [
      {
        kind: "instructions",
        text:
          "Read the letter twice before you write anything. You will not understand every word — you do not need to. " +
          "For every answer you must copy the Spanish words that PROVE it. Copying the proof is the skill; the answer on its own is only half the work.",
      },
      {
        kind: "citeEvidence",
        title: "Carta de la abuela Pilar a su nieto Nico",
        instructions:
          "The people are the same Familia Vargas from page 2, so use that tree if you get stuck. Answer in English or Spanish — but the evidence line must be copied in Spanish, exactly as written.",
        passage: [
          "Querido Nico:",
          "Recibo tu carta hoy y estoy muy contenta. Escribes muy bien.",
          "Tu tío Óscar abre su tienda nueva el sábado. Está nervioso, pero yo estoy tranquila: trabaja mucho.",
          "Tu prima Valeria comparte su cuarto con el perro y no está feliz. Está enojada con su padre.",
          "Yo vivo sola, pero no estoy triste. Recibo cartas de toda la familia.",
          "Tu madre Beatriz está preocupada porque tú no comes bien. Yo también.",
          "Un abrazo grande, tu abuela Pilar",
        ],
        questions: [
          {
            q: "¿Cómo está la abuela cuando recibe la carta de Nico?",
            answer: "Contenta / happy.",
            evidence: "Recibo tu carta hoy y estoy muy contenta.",
          },
          {
            q: "¿Quién está nervioso, y por qué?",
            answer: "El tío Óscar — abre su tienda nueva el sábado.",
            evidence: "Tu tío Óscar abre su tienda nueva el sábado. Está nervioso",
          },
          {
            q: "¿Por qué está enojada Valeria?",
            answer: "Comparte su cuarto con el perro; está enojada con su padre.",
            evidence: "comparte su cuarto con el perro y no está feliz. Está enojada con su padre.",
          },
          {
            q: "La abuela vive sola. ¿Está triste? Copia las palabras exactas.",
            answer: "No — dice que no está triste porque recibe cartas de toda la familia.",
            evidence: "Yo vivo sola, pero no estoy triste.",
          },
          {
            q: "¿Quién está preocupada por Nico?",
            answer: "Su madre Beatriz (y la abuela también).",
            evidence: "Tu madre Beatriz está preocupada porque tú no comes bien.",
          },
        ],
      },
    ],
    footer: "Página 3 de 5 · si terminas: subraya en la carta los verbos -IR que puedas encontrar (hay cinco), y pasa a la página 4.",
  },

  // ── 4 · Applying the feelings, still at the desk ───────────────────────
  {
    id: "c4-como-esta",
    day: "Página 4",
    title: "¿Cómo está? — el cuaderno del detective",
    subtitle: "Same family, harder thinking. You are now reading people, not sentences.",
    blocks: [
      {
        kind: "scenarios",
        title: "Escribe el sentimiento",
        instructions:
          "Write ONE feeling word from page 1 on each line. Watch the ending: a boy is -o, a girl is -a.",
        items: [
          { situation: "Valeria's dog sleeps in her room again. She is…", answer: "enojada" },
          { situation: "Óscar's new shop opens on Saturday. He is…", answer: "nervioso" },
          { situation: "Beatriz cannot sleep because Nico is not eating. She is…", answer: "preocupada" },
          { situation: "Pilar gets letters from the whole family. She is…", answer: "contenta / feliz" },
          { situation: "Nico worked all day on the coffee farm. He is…", answer: "cansado" },
          { situation: "Nobody is talking and nothing is happening. Nico is…", answer: "aburrido" },
        ],
      },
      {
        kind: "deduction",
        title: "¿Quién habla? · who said it?",
        instructions:
          "Four lines from four different members of the Familia Vargas. Use the letter on page 3 and the tree on page 2 to work out who said each one. Write the name.",
        clues: [
          "A. «Abro mi tienda el sábado. No duermo bien.»",
          "B. «Comparto mi cuarto con el perro. ¡No es justo!»",
          "C. «Vivo sola, pero recibo muchas cartas.»",
          "D. «Mi hijo no come bien. Estoy preocupada.»",
        ],
        wordBank: ["Pilar", "Beatriz", "Óscar", "Rosa", "Nico", "Valeria"],
        questions: [
          { q: "A —", answer: "Óscar" },
          { q: "B —", answer: "Valeria" },
          { q: "C —", answer: "Pilar" },
          { q: "D —", answer: "Beatriz" },
        ],
      },
      {
        kind: "writeLines",
        title: "Tu informe · your report",
        instructions:
          "Two sentences in Spanish about the Familia Vargas. Use «está» + a feeling in each. This is exactly what you will do in tomorrow's case.",
        prompts: ["Yo creo que ___________ está…", "La persona más sospechosa es ___________ porque está…"],
        lines: 1,
      },
    ],
    footer: "Página 4 de 5 · si terminas: escribe una quinta línea («E») que uno de ellos podría decir, y pasa a la página 5.",
  },

  // ── 4 · Their own family ───────────────────────────────────────────────
  {
    id: "c4-mi-familia",
    day: "Página 5",
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
    footer: "Página 5 de 5 · termina en casa si es necesario. Mañana abrimos el Caso 4: La Familia Sospechosa.",
  },
];
