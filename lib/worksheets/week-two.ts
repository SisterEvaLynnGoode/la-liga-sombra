/**
 * Semana 2 — the second paper week.
 *
 * Same constraint as Semana 1 and one more: this runs BEFORE the game and must
 * stay independent of it. No case is named, no page ends by pointing at Caso 1,
 * nothing here needs a Chromebook. If the devices arrive late, week three can
 * follow the same shape without anything having been promised.
 *
 * Targets, in the order a first-year actually needs them:
 *   ¿de dónde eres? → numbers → classroom objects → hay + numbers + objects
 * The last two days apply all three at once, on drawing pages, because
 * applying vocabulary is what makes it stick and week two is where a paper-only
 * class starts to go flat.
 */

import type { MatchPair, WeekOnePage } from "@/lib/worksheets/paper";

const ORIGINS: MatchPair[] = [
  { spanish: "¿De dónde eres?", english: "Where are you from?" },
  { spanish: "Soy de…", english: "I am from…" },
  { spanish: "¿De dónde es tu familia?", english: "Where is your family from?" },
  { spanish: "Mi familia es de…", english: "My family is from…" },
  { spanish: "¿Dónde vives?", english: "Where do you live?" },
  { spanish: "Vivo en…", english: "I live in…" },
  { spanish: "aquí", english: "here" },
  { spanish: "también", english: "also / too" },
];

/** 0–20 plus the tens, which is everything needed for ages and quantities. */
const NUMBERS: MatchPair[] = [
  { spanish: "0", english: "cero" }, { spanish: "1", english: "uno" },
  { spanish: "2", english: "dos" }, { spanish: "3", english: "tres" },
  { spanish: "4", english: "cuatro" }, { spanish: "5", english: "cinco" },
  { spanish: "6", english: "seis" }, { spanish: "7", english: "siete" },
  { spanish: "8", english: "ocho" }, { spanish: "9", english: "nueve" },
  { spanish: "10", english: "diez" }, { spanish: "11", english: "once" },
  { spanish: "12", english: "doce" }, { spanish: "13", english: "trece" },
  { spanish: "14", english: "catorce" }, { spanish: "15", english: "quince" },
  { spanish: "16", english: "dieciséis" }, { spanish: "17", english: "diecisiete" },
  { spanish: "18", english: "dieciocho" }, { spanish: "19", english: "diecinueve" },
  { spanish: "20", english: "veinte" }, { spanish: "30", english: "treinta" },
];

const OBJECTS: MatchPair[] = [
  { spanish: "el lápiz", english: "pencil" },
  { spanish: "el bolígrafo", english: "pen" },
  { spanish: "el cuaderno", english: "notebook" },
  { spanish: "el libro", english: "book" },
  { spanish: "la mochila", english: "backpack" },
  { spanish: "el papel", english: "paper" },
  { spanish: "la silla", english: "chair" },
  { spanish: "el escritorio", english: "desk" },
  { spanish: "la puerta", english: "door" },
  { spanish: "la ventana", english: "window" },
  { spanish: "la pizarra", english: "board" },
  { spanish: "el reloj", english: "clock" },
];

export const WEEK_TWO_PAGES: WeekOnePage[] = [
  {
    id: "de-donde-eres",
    day: "Día 6",
    title: "¿De Dónde Eres?",
    subtitle: "Where you are from · and where your people are from",
    blocks: [
      {
        kind: "instructions",
        text:
          "Every agent file lists an origin. Yours might be one place, or two, or a place you have never been but your family talks about. All of those are real answers — write the one that is true for you.",
      },
      { kind: "refBox", title: "Referencia", pairs: ORIGINS },
      {
        kind: "writeLines",
        title: "A. Tu respuesta",
        instructions:
          "Answer in Spanish using the reference box. Place names stay in Spanish or English — Oakland is Oakland.",
        prompts: ["¿De dónde eres?", "¿De dónde es tu familia?", "¿Dónde vives?"],
        lines: 1,
      },
      {
        kind: "labelScene",
        title: "B. Tu mapa",
        instructions:
          "Draw a simple map or picture of a place that matters to you — a country, a city, a street, a house. It does not have to look right. Then label three things on it in Spanish or English.",
        sceneHint: "Dibuja tu lugar",
        labels: 3,
      },
      {
        kind: "survey",
        title: "C. La encuesta",
        instructions:
          "Ask five classmates where they and their family are from. Ask in Spanish: «¿De dónde eres?» You will need «¿Y tu familia?» for the second column.",
        question: "¿De dónde eres?",
        columns: ["Nombre", "Es de…", "Su familia es de…"],
        rows: 5,
      },
    ],
  },

  {
    id: "numeros",
    day: "Día 7",
    title: "Los Números",
    subtitle: "0–30 · ages, quantities, and how old your agent is",
    blocks: [
      { kind: "grid", title: "Los números 0–30", columns: 4, pairs: NUMBERS },
      {
        kind: "scenarios",
        title: "A. Escribe el número / Write the number word",
        instructions: "Write the Spanish word, not the digit.",
        items: [
          { situation: "7", answer: "siete" },
          { situation: "12", answer: "doce" },
          { situation: "15", answer: "quince" },
          { situation: "19", answer: "diecinueve" },
        ],
      },
      {
        kind: "scenarios",
        title: "B. Matemáticas en español",
        instructions:
          "Solve it and write the answer as a Spanish word. «más» = plus, «menos» = minus.",
        items: [
          { situation: "dos + tres = ", answer: "cinco" },
          { situation: "diez + cinco = ", answer: "quince" },
          { situation: "veinte − ocho = ", answer: "doce" },
        ],
      },
      {
        kind: "writeLines",
        title: "C. ¿Cuántos años tienes?",
        instructions:
          "In Spanish: «Tengo ______ años.» Write your own age, then ask two classmates and write theirs the same way.",
        prompts: ["Yo:", "Compañero/a 1:", "Compañero/a 2:"],
        lines: 1,
      },
      {
        kind: "blankGrid",
        title: "D. Tu cartón de lotería",
        instructions:
          "Write any nine different numbers between 0 and 30 in the boxes — one per box, your choice, in digits.",
        rows: 3,
        cols: 3,
      },
      {
        kind: "gameBox",
        title: "Class game",
        spanishName: "Lotería de Números",
        minutes: 15,
        steps: [
          "The teacher calls numbers in Spanish, one at a time, and keeps a list of what was called.",
          "If the number is on your card, cross it out. Numbers are said once — listen, do not ask.",
          "Three in a row, column or diagonal: shout «¡Lotería!»",
          "The winner reads their three numbers back in Spanish to confirm. If they cannot say them, play continues.",
          "Second round: a student calls the numbers instead of the teacher.",
        ],
      },
    ],
    footer: "Ojo: en español se dice «tengo 15 años» — you HAVE years, you are not them.",
  },

  {
    id: "objetos",
    day: "Día 8",
    title: "Los Objetos de la Clase",
    subtitle: "Classroom objects · the things in front of you right now",
    blocks: [
      { kind: "grid", title: "Referencia", columns: 3, pairs: OBJECTS },
      {
        kind: "drawGrid",
        title: "A. Dibuja el objeto / Draw the object",
        instructions: "One small drawing per box. No English — the drawing is your translation.",
        items: OBJECTS.slice(0, 10).map((o) => ({ spanish: o.spanish, english: o.english })),
      },
      {
        kind: "scenarios",
        title: "B. ¿Qué es? / What is it?",
        instructions: "Write the Spanish word with its el or la.",
        items: [
          { situation: "You write with it and it can be erased.", answer: "el lápiz" },
          { situation: "You carry everything to school in it.", answer: "la mochila" },
          { situation: "You sit on it.", answer: "la silla" },
          { situation: "Your teacher writes on it at the front of the room.", answer: "la pizarra" },
          { situation: "You look at it when you want class to end.", answer: "el reloj" },
        ],
      },
      {
        kind: "wordSearch",
        title: "C. Sopa de letras",
        instructions: "Find the ten objects. Across, down and diagonally. Articles are not in the grid.",
        words: ["lapiz", "boligrafo", "cuaderno", "libro", "mochila", "papel", "silla", "puerta", "ventana", "reloj"],
        seed: 23,
      },
    ],
    footer: "el / la is not decoration — learn each word WITH its article and you never have to relearn it.",
  },

  {
    id: "mi-mochila",
    day: "Día 9",
    title: "Mi Mochila",
    subtitle: "Hay + números + objetos · everything from this week at once",
    blocks: [
      {
        kind: "instructions",
        text:
          "«Hay» means there is AND there are — one word for both, which is a gift. «Hay un libro.» «Hay tres lápices.» Plural nouns usually take an -s. Now empty your backpack onto your desk and draw what is actually in it, including the things that are not school supplies.",
      },
      {
        kind: "labelScene",
        title: "A. Dibuja tu mochila",
        instructions:
          "Draw the contents of your backpack. Then label six of them in Spanish, using the word bank and anything from Día 8.",
        sceneHint: "El contenido de tu mochila",
        labels: 6,
        wordBank: OBJECTS.map((o) => o.spanish),
      },
      {
        kind: "writeLines",
        title: "B. ¿Qué hay en tu mochila?",
        instructions:
          "Four sentences in Spanish, each one starting with «Hay». Use a number in at least three of them.",
        prompts: ["Hay ", "Hay ", "Hay ", "Hay ", "Hay "],
        lines: 1,
      },
      {
        kind: "survey",
        title: "C. Compara / Compare",
        instructions:
          "Ask three classmates what is in their backpack. Write one thing each of them has that you do not. Ask in Spanish: «¿Qué hay en tu mochila?»",
        question: "¿Qué hay en tu mochila?",
        columns: ["Nombre", "En su mochila hay…"],
        rows: 5,
      },
    ],
  },

  {
    id: "cartel",
    day: "Día 10",
    title: "El Cartel del Agente",
    subtitle: "Your agent poster · two weeks of Spanish on one page",
    blocks: [
      {
        kind: "instructions",
        text:
          "This one goes on the wall. Design a poster for your agent using only Spanish you have learned in these two weeks. Draw big, fill the space, and check every word against your earlier pages before you write it.",
      },
      {
        kind: "persona",
        title: "Diseña tu cartel",
        instructions:
          "Draw your agent, an object they always carry, and something from the place they are from. Then complete the five lines. Everything you need is on Día 6, 7 and 8.",
        frame: [
          "Me llamo ______________________ .",
          "Soy de ______________________ .",
          "Tengo ________ años.",
          "En mi mochila hay ______________________ .",
          "Mi color favorito es ______________________ .",
        ],
        options: [
          { spanish: "rojo", english: "red" },
          { spanish: "azul", english: "blue" },
          { spanish: "verde", english: "green" },
          { spanish: "negro", english: "black" },
          { spanish: "blanco", english: "white" },
          { spanish: "amarillo", english: "yellow" },
          { spanish: "morado", english: "purple" },
          { spanish: "anaranjado", english: "orange" },
        ],
      },
      {
        kind: "writeLines",
        title: "Puedo… / I can…",
        instructions:
          "Check yourself honestly — this is not graded. Write SÍ, MÁS O MENOS, or TODAVÍA NO next to each one. «Todavía no» is a fine answer in week two.",
        prompts: [
          "Puedo saludar a alguien en español.",
          "Puedo decir de dónde soy y cuántos años tengo.",
          "Puedo nombrar cinco objetos de la clase.",
          "Puedo pedir ayuda en español cuando no entiendo.",
        ],
        lines: 0,
      },
      {
        kind: "gameBox",
        title: "Class activity",
        spanishName: "La Galería de Carteles",
        minutes: 15,
        steps: [
          "Post your finished poster on the wall.",
          "Walk the gallery in silence for five minutes. Read every poster.",
          "Find three classmates who are from somewhere different from you, and one whose favourite colour matches yours.",
          "Write their names below in the table, in Spanish, using «es de…».",
          "Back at your seat: say one full sentence about a classmate out loud to your partner, in Spanish.",
        ],
      },
      {
        kind: "survey",
        title: "La galería",
        instructions: "From the gallery walk. Write in Spanish — «Ana es de México.»",
        question: "¿De dónde es tu compañero/a?",
        columns: ["Nombre", "Es de…"],
        rows: 4,
      },
    ],
    footer: "Dos semanas de español, cero computadoras. Ya puedes presentarte, contar y describir tu clase.",
  },
];
