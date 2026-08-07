/**
 * Semana 1 — the paper packet.
 *
 * Week one runs with no computers, so this is the whole week: five student
 * pages plus a teacher key, designed to be printed once and handed out.
 *
 * It is not derived from a unit, because week one happens before Caso 1. It IS
 * derived from lib/decks/intro.ts for the survival phrases — the same ten
 * phrases the Day 1 deck teaches, in the same wording, so paper and projector
 * never disagree in front of a class.
 *
 * Design constraints, all of them from "there are no computers":
 *   • every answer is written, circled or drawn — nothing to submit
 *   • no phrase appears on a worksheet that the deck has not introduced
 *   • two of the five pages are drawing pages, because a week of grammar
 *     tables on paper in the first week of Spanish 1 is how you lose a class
 *   • the key is a separate page so it can be left in the printer tray
 */

import { SURVIVAL_PHRASES } from "@/lib/decks/intro";

export type {
  MatchPair, ScenarioItem, CommandItem, WeekOneBlock, WeekOnePage, KeySection,
} from "@/lib/worksheets/paper";

import type { MatchPair, CommandItem, WeekOnePage } from "@/lib/worksheets/paper";

// ── Vocabulary, kept small on purpose ────────────────────────────────────────

const GREETINGS: MatchPair[] = [
  { spanish: "hola", english: "hi / hello" },
  { spanish: "buenos días", english: "good morning" },
  { spanish: "buenas tardes", english: "good afternoon" },
  { spanish: "buenas noches", english: "good evening / good night" },
  { spanish: "adiós", english: "goodbye" },
  { spanish: "hasta luego", english: "see you later" },
  { spanish: "¿cómo estás?", english: "how are you?" },
  { spanish: "bien, gracias", english: "fine, thank you" },
];

/**
 * Classroom commands, in the tú form because that is how they will actually be
 * said to a student. "Guarda el teléfono" is on the list deliberately: the
 * phone norm from the Day 2 deck is easier to hold when the class already
 * knows the Spanish for it.
 */
const COMMANDS: CommandItem[] = [
  { spanish: "Levántate", english: "Stand up" },
  { spanish: "Siéntate", english: "Sit down" },
  { spanish: "Escucha", english: "Listen" },
  { spanish: "Escribe", english: "Write" },
  { spanish: "Abre el libro", english: "Open the book" },
  { spanish: "Cierra la puerta", english: "Close the door" },
  { spanish: "Mira la pizarra", english: "Look at the board" },
  { spanish: "Repite, por favor", english: "Repeat, please" },
  { spanish: "Saca un lápiz", english: "Take out a pencil" },
  { spanish: "Guarda el teléfono", english: "Put the phone away" },
];

const SPECIALTIES: MatchPair[] = [
  { spanish: "el arte", english: "art" },
  { spanish: "la música", english: "music" },
  { spanish: "la comida", english: "food" },
  { spanish: "los deportes", english: "sports" },
  { spanish: "la tecnología", english: "technology" },
  { spanish: "los idiomas", english: "languages" },
  { spanish: "la historia", english: "history" },
  { spanish: "los animales", english: "animals" },
];

// ── The week ─────────────────────────────────────────────────────────────────

export const WEEK_ONE_PAGES: WeekOnePage[] = [
  {
    id: "expediente",
    day: "Día 1",
    title: "Expediente de Recluta",
    subtitle: "Recruit file · La Liga Sombra",
    blocks: [
      {
        kind: "instructions",
        text:
          "Every agent in La Liga Sombra has a file. This one is yours. Draw your own face in the photo frame — it does not have to be good, it has to be yours — then fill in the file. Anything in Spanish you do not know yet, leave blank and come back to it on Friday.",
      },
      {
        kind: "badge",
        title: "Placa de Agente",
        instructions:
          "Draw your portrait in the frame. Print your agent name in the box below it — this is the name your class will call you all year, so choose one you can live with.",
        fields: [
          "Nombre de agente / Agent name",
          "Nombre real / Real name",
          "Edad / Age",
          "Escuela / School",
          "Fecha de reclutamiento / Date recruited",
          "Firma / Signature",
        ],
      },
      {
        kind: "writeLines",
        title: "Primera declaración",
        instructions:
          "In English. Two or three sentences each. Your teacher will read these — they are how the year starts.",
        prompts: [
          "Why did you sign up for Spanish? Any honest answer counts, including “it fit my schedule.”",
          "Name one thing you already know how to say in Spanish, and where you learned it.",
          "What would make this class a good one for you?",
        ],
        lines: 2,
      },
      {
        kind: "survey",
        title: "Reclutamiento / Recruiting",
        instructions:
          "Stand up. Ask five classmates for their name in Spanish and write both names down. You only need two words to do this: «Me llamo…» and «¿Y tú?»",
        question: "Me llamo ______ . ¿Y tú?",
        columns: ["Nombre real", "Nombre de agente"],
        rows: 5,
      },
    ],
    footer: "Guarda esta página. La necesitas el viernes.",
  },

  {
    id: "saludos",
    day: "Día 2",
    title: "Los Saludos",
    subtitle: "Greetings · How the room starts every day",
    blocks: [
      { kind: "refBox", title: "Referencia", pairs: GREETINGS },
      {
        kind: "match",
        title: "A. Empareja / Match",
        instructions: "Draw a line from the Spanish to the English.",
        pairs: GREETINGS.slice(0, 6),
      },
      {
        kind: "scenarios",
        title: "B. ¿Qué dices? / What do you say?",
        instructions:
          "Write the Spanish greeting you would use. Use the reference box. Watch the clock — Spanish splits the day differently than you might expect.",
        items: [
          { situation: "It is 8:15 in the morning and you walk into Spanish class.", answer: "Buenos días" },
          { situation: "It is 2:00 in the afternoon and you see your teacher in the hall.", answer: "Buenas tardes" },
          { situation: "It is 9:00 at night and you are leaving a family party.", answer: "Buenas noches" },
          { situation: "A friend asks how you are and you are doing fine.", answer: "Bien, gracias" },
        ],
      },
      {
        kind: "writeLines",
        title: "C. Un diálogo",
        instructions:
          "Write a three-line conversation between two agents meeting for the first time. Use only what is in the reference box plus “me llamo…”. Spanish only.",
        prompts: ["— ", "— ", "— "],
        lines: 1,
      },
      {
        kind: "wordSearch",
        title: "D. Sopa de letras",
        instructions: "Find all eight greetings. They run across, down and diagonally.",
        words: ["hola", "adiós", "gracias", "buenos", "tardes", "noches", "luego", "bien"],
        seed: 11,
      },
    ],
  },

  {
    id: "supervivencia",
    day: "Día 3",
    title: "Frases de Supervivencia",
    subtitle: "The ten phrases that keep you in the room",
    blocks: [
      {
        kind: "instructions",
        text:
          "These are the same ten phrases from the briefing on day one. You are not memorizing them for a quiz — you are learning them so that when you are lost in October you can say so in Spanish instead of going quiet.",
      },
      {
        kind: "refBox",
        title: "Las diez frases",
        pairs: SURVIVAL_PHRASES.map((p) => ({ spanish: p.spanish, english: p.english })),
      },
      {
        kind: "scenarios",
        title: "A. ¿Qué dices? / What do you say?",
        instructions: "Write the Spanish phrase. Use the box above — copying it correctly is the point.",
        items: [
          { situation: "Your teacher said something and you did not catch any of it.", answer: "No entiendo" },
          { situation: "You want to know the Spanish word for “backpack.”", answer: "¿Cómo se dice…?" },
          { situation: "Someone said a word you have never heard and you want its meaning.", answer: "¿Qué significa…?" },
          { situation: "You heard it, but it went by too fast.", answer: "Más despacio" },
          { situation: "You need to leave the room for two minutes.", answer: "¿Puedo ir al baño?" },
          { situation: "You want your teacher to say the whole thing one more time.", answer: "Otra vez, por favor" },
        ],
      },
      {
        kind: "writeLines",
        title: "B. La más importante",
        instructions:
          "Circle the phrase in the box you think you will need most this year. Then, in English, explain why in one sentence.",
        prompts: ["Because…"],
        lines: 2,
      },
      {
        kind: "survey",
        title: "C. La encuesta",
        instructions:
          "Ask five classmates which phrase they circled. Write their name and their phrase. You will find out fast that everybody is worried about the same two.",
        question: "¿Qué frase necesitas más?",
        columns: ["Nombre", "Su frase"],
        rows: 5,
      },
    ],
    footer: "Tip: «No sé — todavía» is the only one on the list that is about your attitude, not your Spanish.",
  },

  {
    id: "mandatos",
    day: "Día 4",
    title: "Los Mandatos",
    subtitle: "Classroom commands · Listen, then move",
    blocks: [
      {
        kind: "instructions",
        text:
          "Your teacher will say each command out loud and the class will do it — standing up, sitting down, opening books. You will hear each one many times before you ever have to read it. In each box below, draw a quick stick figure doing the action. Bad drawings are fine and often better.",
      },
      {
        kind: "drawGrid",
        title: "Dibuja el mandato / Draw the command",
        instructions: "One small drawing per box. Do not write the English — the drawing is your translation.",
        items: COMMANDS,
      },
      {
        kind: "scenarios",
        title: "A. ¿Qué mandato? / Which command?",
        instructions: "Write the Spanish command your teacher would use.",
        items: [
          { situation: "The class is too loud and you need them to hear you.", answer: "Escucha" },
          { situation: "A student is still standing after the bell.", answer: "Siéntate" },
          { situation: "The hallway is noisy and the door is open.", answer: "Cierra la puerta" },
          { situation: "A phone is out during instruction.", answer: "Guarda el teléfono" },
          { situation: "You want the class to say a word again after you.", answer: "Repite, por favor" },
        ],
      },
      {
        kind: "gameBox",
        title: "Class game",
        spanishName: "Simón dice",
        minutes: 15,
        steps: [
          "Everyone stands. The teacher gives a command in Spanish — «Levántate», «Siéntate», «Mira la pizarra».",
          "If the command starts with «Simón dice», do it. If it does not, do not move.",
          "Anyone who moves on a command without «Simón dice» sits down for one round, then rejoins. Nobody is out for long.",
          "Speed up. Once the class is warm, hand the front of the room to a student and let them call the commands.",
          "Last three standing become the callers for the next round.",
        ],
      },
    ],
  },

  {
    id: "persona",
    day: "Día 5",
    title: "Tu Persona de Detective",
    subtitle: "Your detective persona · Who you are on this team",
    blocks: [
      {
        kind: "instructions",
        text:
          "Twenty cases are coming, in twenty countries. Before the first one, decide who you are when you work them. Draw yourself as the agent — coat, hat, camera, notebook, whatever your version has — and then introduce that agent in Spanish using the frame below.",
      },
      {
        kind: "persona",
        title: "El agente",
        instructions:
          "Draw your detective in the box. Then complete the introduction. Every blank can be filled with what you learned this week plus your own name and age.",
        frame: [
          "Me llamo ______________________ .",
          "Mi nombre de agente es ______________________ .",
          "Tengo ________ años.",
          "Soy de ______________________ .",
          "Mi especialidad es ______________________ .",
        ],
        options: SPECIALTIES,
      },
      {
        kind: "writeLines",
        title: "La primera pista",
        instructions:
          "In English: describe one object in your house that could not be replaced if it disappeared. Not the most expensive one — the one that would actually hurt to lose. This is the question the whole year is built on.",
        prompts: ["The object:", "Who it really belongs to:", "Why it would hurt to lose it:"],
        lines: 2,
      },
      {
        kind: "gameBox",
        title: "Class activity",
        spanishName: "La Galería de Agentes",
        minutes: 15,
        steps: [
          "Tape your finished agent page to the wall or lay it face-up on your desk.",
          "Walk the room in silence for five minutes and look at every agent.",
          "Find three agents whose specialty is different from yours and write their agent names below.",
          "Find one agent you would want beside you on a hard case, and write one sentence in English saying why.",
        ],
      },
      {
        kind: "writeLines",
        title: "Tu equipo",
        instructions: "From the gallery walk.",
        prompts: ["Tres agentes diferentes:", "Mi compañero/a ideal — ¿por qué?"],
        lines: 2,
      },
    ],
    // Deliberately does NOT promise Caso 1. The paper weeks run before the game
    // and must stand on their own — announcing a case the class cannot open yet
    // because there are no Chromebooks is a promise made to be broken.
    footer: "Bienvenidos a La Liga Sombra. Guarda tu expediente — tu placa y tu agente son tuyos todo el año.",
  },
];

