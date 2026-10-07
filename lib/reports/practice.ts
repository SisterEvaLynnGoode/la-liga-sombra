/**
 * The practice activity printed beside each gap on the parent report.
 *
 * Written to be done at a kitchen table in five minutes by an adult who does
 * not speak Spanish: no app, no printing, no login, and never "review the
 * vocabulary", which tells a parent nothing. Each one says what to say, what
 * the child should answer, and what counts as right.
 *
 * The words and sentences the child actually missed are spliced in by
 * `practiceFor`, so the activity is about their gaps rather than a generic list.
 */

import type { SkillBucket } from "./skills";

export interface PracticeActivity {
  title: string;
  minutes: number;
  /** Step by step, for the adult. */
  steps: string[];
  /** The child's own missed items, when there are any worth printing. */
  items: string[];
}

/**
 * Grammar practice by caso. The key is the caso whose grammar point it drills;
 * the text matches what that caso teaches (see lib/worksheets/grammar.ts).
 */
const GRAMMAR_PRACTICE: Record<number, { title: string; steps: string[] }> = {
  1: { title: "Greetings at the door", steps: [
    "For one day, greet each other in Spanish: buenos días (morning), buenas tardes (afternoon), buenas noches (night).",
    "Ask ¿Cómo te llamas? — they answer Me llamo ___.",
    "Right answer: the greeting matches the time of day.",
  ]},
  2: { title: "Describe three people", steps: [
    "Point at three people (family, a photo, someone on TV).",
    "Your child says one sentence each: Mi hermano es alto. La maestra es simpática.",
    "Right answer: es + a describing word, and -o/-a matching (alto for a boy, alta for a girl).",
  ]},
  3: { title: "Where are you going?", steps: [
    "Ask ¿Adónde vas? about five places in your day — school, the shop, home.",
    "They answer Voy a la tienda / Voy al parque.",
    "Right answer: a + la, or al for masculine places (al parque, not a el parque).",
  ]},
  4: { title: "Family and feelings", steps: [
    "Name five relatives: mi tía, mi primo, mi abuela…",
    "Then ask ¿Cómo está? about each one today: Está cansada. Está contento.",
    "Right answer: ser for who they are, estar for how they feel right now.",
  ]},
  5: { title: "Numbers out loud", steps: [
    "Read out house numbers, prices or the clock, and have your child say each number in Spanish.",
    "Then ask the date: ¿Qué fecha es hoy? — el quince de marzo.",
    "Right answer: day before month, with de between them.",
  ]},
  6: { title: "What's for dinner?", steps: [
    "While cooking, ask ¿Qué quieres? and ¿Qué prefieres?",
    "They answer Quiero… / Prefiero… / Puedo ayudar.",
    "Right answer: the stem change is there — quiero not quero, puedo not podo.",
  ]},
  7: { title: "What are you doing right now?", steps: [
    "Three times during the evening, ask ¿Qué estás haciendo?",
    "They answer Estoy comiendo. Estoy estudiando. Estoy viendo la tele.",
    "Right answer: estoy + a verb ending in -ando or -iendo.",
  ]},
  8: { title: "Who did you give it to?", steps: [
    "Hand your child three small objects and ask ¿A quién se lo das?",
    "They answer Se lo doy a papá. Te lo doy a ti.",
    "Right answer: the person comes before the thing.",
  ]},
  9: { title: "Where does it hurt?", steps: [
    "Play doctor for five minutes. Ask ¿Qué te duele?",
    "They answer Me duele la cabeza. Me duelen los pies.",
    "Right answer: duele for one thing, duelen for two.",
  ]},
  10: { title: "What will you do tomorrow?", steps: [
    "Ask ¿Qué vas a hacer mañana? three times.",
    "They answer Voy a estudiar. Voy a jugar.",
    "Right answer: voy a + the plain verb, with nothing added to the end.",
  ]},
  16: { title: "Narrate the morning routine", steps: [
    "At breakfast, ask ¿Qué haces por la mañana?",
    "They narrate: Me levanto a las seis. Me ducho. Me visto.",
    "Right answer: the little me is there — me levanto, not just levanto.",
  ]},
  17: { title: "Compare things around the house", steps: [
    "Pick two objects. Ask ¿Cuál es más grande?",
    "They answer El sofá es más grande que la silla. Este libro es mejor que ese.",
    "Right answer: más … que, and mejor rather than más bueno.",
  ]},
  18: { title: "Give me instructions", steps: [
    "Have your child teach you something simple in Spanish — making a sandwich, folding a shirt.",
    "They must use commands: Toma el pan. Pon el queso. Corta.",
    "Right answer: short command forms — toma, pon, haz, ven.",
  ]},
  19: { title: "What happened yesterday?", steps: [
    "Ask ¿Qué pasó ayer? and let them tell you three things in Spanish.",
    "Listen for the past: llegó, vio, fue, comió.",
    "Right answer: the verb sounds different from today's — llegó, not llega.",
  ]},
  20: { title: "How was it, and what happened?", steps: [
    "Ask about a memory: ¿Cómo era tu escuela antes?",
    "Then ask ¿Qué pasó un día? for a single event.",
    "Right answer: era/había for how things were, and llegó/pasó for the one event.",
  ]},
  21: { title: "Three things I did", steps: [
    "Ask ¿Qué hiciste ayer? Your child answers with three finished actions.",
    "Listen for -é and -ó endings: llegué, hablé, comió, salió.",
    "Right answer: the stress is at the end — habló, not hablo.",
  ]},
  22: { title: "The irregular five", steps: [
    "Ask about yesterday using these verbs: ir, hacer, tener, decir, estar.",
    "They answer Fui…, Hice…, Tuve…, Dije…, Estuve…",
    "Right answer: no accent at the end of these — fui, hice, tuve.",
  ]},
  23: { title: "When you were little", steps: [
    "Ask ¿Cómo era tu cuarto cuando eras pequeño?",
    "They describe with era, había, tenía, iba.",
    "Right answer: descriptions and habits, not single events.",
  ]},
  24: { title: "While I was… , suddenly…", steps: [
    "Give them a starter: Mientras yo cocinaba…",
    "They finish with a sudden event: …sonó el teléfono.",
    "Right answer: the background verb ends -aba/-ía, the interruption is a one-off.",
  ]},
  25: { title: "Who gave what to whom", steps: [
    "Pass an object around and narrate: Se lo di a mamá. Me lo dio.",
    "Right answer: person first, thing second — and le + lo becomes se lo.",
  ]},
  26: { title: "What have you done today?", steps: [
    "At bedtime ask ¿Qué has hecho hoy?",
    "They answer He comido… He estudiado… He visto…",
    "Right answer: he/has/ha + a verb ending -ado or -ido.",
  ]},
  27: { title: "What will happen next year?", steps: [
    "Ask ¿Qué harás el año que viene?",
    "They answer Estudiaré… Iré… Tendré…",
    "Right answer: the ending is attached to the whole verb — estudiaré.",
  ]},
  28: { title: "What would you do?", steps: [
    "Ask ¿Qué harías con mil dólares?",
    "They answer Compraría… Iría… Daría…",
    "Right answer: endings in -ía.",
  ]},
  29: { title: "For whom, and why", steps: [
    "Ask about a gift or a chore: ¿Para quién es? ¿Por qué lo haces?",
    "They answer Es para mi hermana. Lo hago por amor.",
    "Right answer: para for the person it is for, por for the reason.",
  ]},
  30: { title: "Wishes out loud", steps: [
    "Ask ¿Qué quieres que pase mañana?",
    "They answer Quiero que… / Ojalá que… / Espero que…",
    "Right answer: the second verb changes shape — vuelva, sea, esté.",
  ]},
  31: { title: "I don't think so", steps: [
    "Make claims and have your child doubt them in Spanish: No creo que sea verdad. Dudo que llueva.",
    "Right answer: after no creo que the verb shifts — sea, llueva, tenga.",
  ]},
  32: { title: "What is made here?", steps: [
    "Ask about your town: ¿Qué se hace aquí? ¿Qué se come aquí?",
    "They answer Aquí se come… Aquí se habla… Aquí se construyó…",
    "Right answer: se + the verb, with no person named.",
  ]},
};

const VOCAB_PRACTICE = {
  title: "Five-word round",
  steps: [
    "Say the English word; your child says the Spanish. Then swap: you say the Spanish, they say the English.",
    "Keep any word they miss in the pile and go round again until the pile is empty.",
    "Five minutes is plenty. Doing it twice in a week beats one long session.",
  ],
};

const LISTENING_PRACTICE = {
  title: "Listen and retell",
  steps: [
    "In the game, open the Training Room and play any witness clip, or replay a case's audio.",
    "Your child listens once and tells you in English what the person said.",
    "Then play it again and ask for two Spanish words they caught. Catching the gist first is the skill.",
  ],
};

const SPEAKING_PRACTICE = {
  title: "Thirty seconds out loud",
  steps: [
    "Set a timer for thirty seconds and ask your child to describe their day in Spanish, out loud.",
    "No stopping to correct. Hesitation is fine; silence is the only thing to fix.",
    "Afterwards, pick one sentence together and say it again, better.",
  ],
};

/** The activity for one weak area, with the child's own missed items. */
export function practiceFor(bucket: SkillBucket, kind: "vocab" | "grammar" | "listening" | "speaking"): PracticeActivity {
  if (kind === "grammar") {
    const authored = bucket.caso != null ? GRAMMAR_PRACTICE[bucket.caso] : undefined;
    const base = authored ?? {
      title: "Say it three ways",
      steps: [
        "Take one sentence your child missed and read it aloud together.",
        "Then change one word — the person, the time, the place — and say it again. Three versions is enough.",
        "Right answer: the verb changes to match the new sentence.",
      ],
    };
    return { ...base, minutes: 5, items: bucket.unmastered.slice(0, 5) };
  }
  if (kind === "listening") return { ...LISTENING_PRACTICE, minutes: 5, items: [] };
  if (kind === "speaking") return { ...SPEAKING_PRACTICE, minutes: 5, items: [] };
  return { ...VOCAB_PRACTICE, minutes: 5, items: bucket.unmastered.slice(0, 5) };
}
