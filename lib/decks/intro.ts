/**
 * Orientation decks — Day 1 and Day 2 of the school year.
 *
 * These are the first thing a class ever sees. They sit in the Story tab ahead
 * of Caso 1 because they do the same job a case story deck does — tell students
 * what they are about to do and why anyone should care — only the thing being
 * introduced is the course itself.
 *
 * They obey the same author rules as lib/decks/stories.ts. In particular rule 1:
 * every slide is flagged real or fiction, and the agency premise is never
 * stamped ESTO ES REAL. Day 1 teaches that stamp explicitly, because students
 * are about to see it on every deck for the rest of the year and it is worth
 * ninety seconds to say out loud what it means.
 *
 * No new slide kinds. These are built from the six that already render.
 *
 * Everything personal lives in TEACHER_PROFILE below, in one object, so the
 * teacher slides can be rewritten without reading the rest of this file.
 */

import type { StoryDeck, StorySlide } from "@/lib/decks/story-build";
import { estimateMinutes } from "@/lib/decks/story-build";
import type { StoryFact } from "@/lib/decks/stories";

export const TEACHER_PROFILE = {
  /** How students should address you, exactly as it should read on the slide. */
  name: "Mr. Tommy (they/them)",

  /**
   * The "who I am" paragraphs. Specific beats general: students believe a
   * teacher who says something concrete.
   */
  bio: [
    "My name is Tommy Martin-Edwards, and everyone here calls me Mr. Tommy. Here is the first thing you should know about me: I did not grow up speaking Spanish. I learned it in a classroom, exactly the way you are about to, and then I went and got a degree in teaching it. Everything I can do in this language, I got by doing the thing I am going to ask you to do.",
    "Then I went and used it. I have spent time in Mexico and in Spain speaking Spanish every day, and I walked the Camino de Santiago across northern Spain on foot. That is the point where a language stops being a school subject — when it is the only way to ask a stranger where you are sleeping tonight.",
    "One more thing, said on day one so that nobody has to wonder or guess: I am queer, and I have a husband. If you ever want to ask me about queer history, that is one of my favorite things to talk about.",
  ],

  /** Sidebar rows on the "Quién Soy" slide. */
  facts: [
    { label: "Cómo llamarme", value: "Mr. Tommy (they/them)" },
    { label: "Enseñando desde", value: "2010–2011" },
    { label: "También he enseñado", value: "Español, chino, tecnología — y fui subdirector" },
    { label: "Países que conozco", value: "España, México, Canadá, Francia, Bélgica, China" },
    { label: "Pregúntame sobre", value: "El Camino de Santiago, o la historia queer" },
  ] as StoryFact[],

  /**
   * The bio for FAMILY-facing material (back-to-school night), which is a
   * different audience and a different room. Kept separate rather than
   * trimming `bio` above, because the student Day 1 version is a deliberate
   * choice and should not change when the parent one does.
   */
  familyBio: [
    "My name is Tommy Martin-Edwards, and your student calls me Mr. Tommy. I did not grow up speaking Spanish. I learned it in a classroom, exactly the way your student is about to, and then I went and got a degree in teaching it. Everything I can do in this language, I got by doing the thing I am going to ask them to do.",
    "Then I went and used it. I have spent time in Mexico and in Spain speaking Spanish every day, and I walked the Camino de Santiago across northern Spain on foot. That is the point where a language stops being a school subject — when it is the only way to ask a stranger where you are sleeping tonight.",
    "This is my fifteenth year teaching. I have taught Spanish, Chinese and Technology, and served as an assistant principal, which means I have read a lot of syllabi and I know which parts you actually want: how grades work, what your student will be able to do, and how to help. Those are on the next pages.",
  ],

  /** Sidebar rows for the family syllabus. */
  familyFacts: [
    { label: "Cómo llamarme", value: "Mr. Tommy (they/them)" },
    { label: "Enseñando desde", value: "2010–2011" },
    { label: "También he enseñado", value: "Español, chino, tecnología — y fui subdirector" },
    { label: "Países que conozco", value: "España, México, Canadá, Francia, Bélgica, China" },
    { label: "Pregúntame sobre", value: "El Camino de Santiago" },
  ] as StoryFact[],

  /** Why this class is a video game — its own slide, because it earns one. */
  whyTheGame: [
    "This class is a video game because I built it. I am an amateur coder, and I made La Liga Sombra myself — the cases, the suspects, the countries, all of it.",
    "I made it because I thought learning Spanish should be more fun than a textbook, and because I could not find the thing I wanted to teach with. So I wrote it.",
    "I am proud of it, and I hope you like it. If you find something broken in it this year, tell me — you will be telling the person who can actually fix it.",
  ],

  /** Where students get the class code. */
  classCode: "En la pizarra · on the board",
};

/**
 * The ten survival phrases, shared.
 *
 * Week 1 is taught on paper (lib/worksheets/week-one.ts) and on the projector
 * (this deck). They must be the same ten phrases in the same wording, or a
 * student who learns "otra vez, por favor" from a worksheet meets a different
 * phrase on screen the same afternoon. One list, two surfaces.
 */
export const SURVIVAL_PHRASES: Array<{ spanish: string; english: string; note?: string }> = [
        { spanish: "Hola / Buenos días", english: "Hi / Good morning", note: "How class starts. Every day." },
        { spanish: "Me llamo…", english: "My name is…", note: "Literally 'I call myself.'" },
        { spanish: "No entiendo", english: "I don't understand", note: "The single most useful thing you will say this year." },
        { spanish: "¿Cómo se dice…?", english: "How do you say…?", note: "Point at the thing. It works." },
        { spanish: "¿Qué significa…?", english: "What does … mean?", note: "The other half of the same tool." },
        { spanish: "Otra vez, por favor", english: "Again, please", note: "Ask for the repeat. Always ask for the repeat." },
        { spanish: "Más despacio", english: "Slower", note: "You are allowed to slow anyone down, including me." },
        { spanish: "¿Puedo ir al baño?", english: "May I go to the bathroom?", note: "Yes, in Spanish. Yes, really." },
        { spanish: "Tengo una pregunta", english: "I have a question", note: "Interrupt me with this one." },
        { spanish: "No sé — todavía", english: "I don't know — yet", note: "The 'todavía' is the whole point." },
      ];

/** Day 1 — the premise, you, and their first ten words. */
function dayOneSlides(): StorySlide[] {
  return [
    {
      kind: "storyCover",
      unitNumber: 0,
      caseTitle: "Expediente 000 · Reclutamiento",
      country: "La Liga Sombra",
      city: "Día 1",
      hook: "Twenty countries. Twenty stolen things. One year to get them back — and you cannot do it in English.",
    },

    {
      kind: "storyBeat",
      eyebrow: "El Trabajo · The Job",
      headline: "You have been recruited",
      body: [
        "For the next year you work for an agency that recovers stolen things. Not money — things that cannot be replaced. A two-hundred-year-old guitar. A jade mask. The only recording of a song.",
        "Someone is taking them, one at a time, across twenty Spanish-speaking countries. You will follow that person from Mexico to Cuba to Uruguay, and you will be about one step behind the whole way.",
        "Every case gives you suspects, witnesses, and evidence. To use any of it, you have to understand what people are telling you. They are telling you in Spanish.",
      ],
      pull: "The Spanish is not the homework. The Spanish is how you solve it.",
      real: false,
    },

    {
      kind: "storyBeat",
      eyebrow: "La Regla de la Clase",
      headline: "Half of this is invented. Half of it is not.",
      body: [
        "The agency is made up. The thief is made up. The stolen guitar is made up.",
        "The countries are not. The cities are not. The history, the music, the food, the languages people actually speak in these places — none of that is made up, and you are going to learn a lot of it by accident while chasing someone who does not exist.",
        "So every slide you see this year carries one of two stamps. ESTO ES REAL means you can go look it up tonight and it will hold. FICCIÓN DEL CASO means it is part of the story. If you ever cannot tell which you are looking at, ask me — that is a fair question and I will answer it every time.",
      ],
      pull: "ESTO ES REAL / FICCIÓN DEL CASO. Look for the stamp.",
      real: true,
    },

    {
      kind: "storyBeat",
      eyebrow: "Quién Soy · Who I Am",
      headline: TEACHER_PROFILE.name,
      body: TEACHER_PROFILE.bio,
      facts: TEACHER_PROFILE.facts,
      real: true,
    },

    {
      kind: "storyBeat",
      eyebrow: "Por Qué Un Videojuego",
      headline: "Your teacher built this",
      body: TEACHER_PROFILE.whyTheGame,
      pull: "If you find something broken, tell me. I'm the one who can fix it.",
      real: true,
    },

    {
      kind: "storyBeat",
      eyebrow: "Por Qué Español",
      headline: "This is not a foreign language here",
      body: [
        "The United States has one of the largest Spanish-speaking populations of any country on Earth. Tens of millions of people speak it at home, and California is one of the states where that is most true — in this state, roughly one person in four speaks Spanish at home.",
        "That means Spanish is not a language you will use someday if you travel. It is a language on the bus, at work, in the next classroom, and in a lot of your houses.",
        "Spanish is also the official or national language of twenty countries. You are going to work a case in every one of them.",
      ],
      real: true,
    },

    {
      kind: "storyBeat",
      eyebrow: "Si Ya Lo Hablas",
      headline: "Some of you already speak this",
      body: [
        "Some of you grew up with Spanish. You may have been told at some point that the Spanish you speak is 'not real Spanish,' or that it is slang, or that it is wrong. That is not true, and it is not what happens in this room.",
        "The Spanish your family speaks is a real dialect of a language spoken by roughly half a billion people, and no country owns it. What you will get here is more of it — more words, more situations, and the writing side, which almost nobody gets at home.",
        "And you are going to hear accents from twenty countries this year, including probably your own. Nobody in this room mocks an accent. That one is not negotiable.",
      ],
      real: true,
    },

    {
      kind: "storyVocab",
      eyebrow: "Tus Primeras Palabras",
      headline: "Ten phrases you will use all year",
      situation:
        "You do not need much Spanish to survive day one. You need enough to tell me you are lost, and enough to ask for a word you do not have. Everything else can wait.",
      entries: SURVIVAL_PHRASES,
      production: {
        instruction:
          "Turn to the person next to you. Say your name in Spanish, then say the one phrase on this list you think you will need most this year. You will both be bad at this. That is today's goal.",
        say: "Hola, me llamo ______. Creo que voy a necesitar «______».",
      },
    },

    {
      kind: "storyDiscuss",
      prompt:
        "You are about to spend a year recovering things that cannot be replaced. What is one object in your house that could not be replaced if it disappeared — not the most expensive one, the one that would actually hurt to lose?",
      followups: [
        "Who does it belong to, really — you, or somebody who came before you?",
        "If a museum asked to display it, would your family say yes?",
        "Now the harder one: who decides what belongs in a museum in the first place?",
      ],
    },

    {
      kind: "storyCloser",
      text: "Tomorrow you get your badge, the rules of the agency, and the first Spanish you will actually use in this room. Bring a pencil — everything for now is on paper.",
      caseTitle: "Expediente 000 · Reclutamiento",
    },
  ];
}

/**
 * The room's rules, shared. Quoted verbatim by the family syllabus so parents
 * read the same six norms their student was given on day two — not a softened
 * paraphrase written for adults.
 */
export const CLASS_NORMS: Array<{ label: string; text: string }> = [
        {
          label: "Se habla",
          text: "You will speak Spanish badly, out loud, in front of people, starting today. That is the job — not the part where you failed at the job. A class where nobody risks a wrong sentence is a class where nobody learns to talk.",
        },
        {
          label: "Treinta segundos",
          text: "Before you ask me or a translator, sit in it for thirty seconds. The struggle is where the word sticks. After thirty seconds, ask loudly and I will help.",
        },
        {
          label: "Sin burlas",
          text: "Nobody in this room gets laughed at. Not for an accent, not for a wrong answer, not for the Spanish your family speaks — and not for how you look, who you are, who you love, what you can afford, or what you are still figuring out. You do not have to be friends with everyone in here. You do have to make this a room where anyone can take a risk out loud. This is the one rule with no version where you get a warning.",
        },
        {
          label: "Llega y empieza",
          text: "There is work on the board when the bell rings. Start it before you talk to me. Five minutes at the top of class is over three full class periods across the year.",
        },
        {
          label: "Sin teléfonos",
          text: "Phones are not out in this school, so they are not out in here — not face down on the desk, not in your lap, not in your sleeve. Away means away. Right now the tools for this class are a pencil and your own voice; when the computers arrive, a school laptop joins them and it is the only screen you need. If something real is going on at home, come tell me and we will deal with it together — that conversation happens with me, not with a phone under the desk.",
        },
        {
          label: "Se puede repetir",
          text: "Almost everything here can be done again for full credit. A bad score on a case is information, not a sentence. What cannot be fixed is work you never turned in at all.",
        },
      ];

/** Day 2 — norms, how the grade actually works, and how the class runs on paper. */
function dayTwoSlides(): StorySlide[] {
  return [
    {
      kind: "storyCover",
      unitNumber: 0,
      caseTitle: "Expediente 000 · Protocolo",
      country: "La Liga Sombra",
      city: "Día 2",
      hook: "Every agency has rules. Here are ours, what they are for, and how you actually earn a grade in this room.",
    },

    {
      kind: "storyExpect",
      eyebrow: "Las Normas",
      headline: "Normas de la Agencia · How this room works",
      items: CLASS_NORMS,
    },

    {
      kind: "storyBeat",
      eyebrow: "La Nota · Your Grade",
      headline: "Seventy percent how well. Thirty percent how much.",
      body: [
        "Your percentage in the gradebook is built from two things. Seventy percent is quality — how accurate your work is across vocabulary, grammar, and listening. Thirty percent is completion — how many of the assigned cases you actually finished.",
        "That split is deliberate. It means careful work is worth more than fast work, but it also means you cannot skip half the cases and coast on being good at Spanish. Both halves are real.",
        "There is a second number you will see, and it is not your grade: your proficiency level. That one measures what you can do with the language, it only ever goes up, and it is the number that actually matters when you get to Spanish 2.",
      ],
      pull: "Almost nothing here sinks a grade except work that never got done.",
      real: true,
    },

    {
      kind: "storyExpect",
      eyebrow: "La Nota",
      headline: "Lo que cuenta · What helps and what hurts",
      items: [
        {
          label: "Cuenta a tu favor",
          text: "Finishing cases. Speaking out loud even when it comes out wrong. Asking. Redoing something you scored badly on. Showing up.",
        },
        {
          label: "No cuenta en tu contra",
          text: "A wrong verb ending. An accent. Not knowing a word. Needing something repeated three times. Being slower than the person next to you.",
        },
        {
          label: "Sí cuenta en tu contra",
          text: "Nothing turned in. Running a whole assignment through a translator or an AI and handing me its Spanish instead of yours — I can tell, and more importantly it means you learned nothing that day.",
        },
        {
          label: "Sobre los traductores",
          text: "Looking up one word is research and it is fine. Pasting a paragraph is not. If you are not sure which side of that line you are on, ask me before you do it, not after.",
        },
      ],
    },

    {
      kind: "storyBeat",
      eyebrow: "Cómo Funciona · How This Runs",
      headline: "Everything starts on paper",
      body: [
        "There is a version of this class that lives on a computer — the cases, the suspects, the twenty countries. You saw it yesterday. You will get it. You are not getting it this week, because the school does not have the machines for us yet.",
        "So we start where every investigation actually starts: on paper, out loud, with each other. Every page you fill in these first weeks is the same Spanish you would be doing on a screen. None of it is a warm-up and none of it is filler.",
        "Keep every page. Your expediente, your badge, your agent — those are yours from today, and the day the computers arrive you will already know who you are when you open the first case.",
      ],
      pull: "The Spanish is real whether the screen is there or not.",
      facts: [
        { label: "Ahora", value: "Papel, voz y lápiz" },
        { label: "Después", value: "El juego, cuando lleguen las computadoras" },
        { label: "Lo que traes", value: "Un lápiz y tu expediente" },
        { label: "Lo que guardas", value: "Todas las páginas — son tu archivo" },
      ],
      real: true,
    },

    {
      kind: "storyDiscuss",
      prompt:
        "One rule on that list is going to be the hard one for you personally. Not the one you disagree with — the one you know you will break. Tell your partner which one, and what would actually help you keep it.",
      followups: [
        "Which rule would you add if this were your classroom?",
        "Which one would you delete, and what would go wrong if we did?",
      ],
    },

    {
      kind: "storyCloser",
      text: "Bienvenidos a La Liga Sombra. Your training starts now, on paper, in this room. The cases open the day the computers do — and you will already be ready for them.",
      caseTitle: "Expediente 000 · Protocolo",
    },
  ];
}

const DAY_ONE_NOTE = `Your two slides — "Quién Soy" and "Por Qué Un Videojuego" — read from TEACHER_PROFILE at the top of lib/decks/intro.ts. Edit them there and they change everywhere.

A note on the third bio paragraph: it is written to be said plainly and then moved past, not dwelt on. Naming it on day one is what makes it ordinary, which is the point. If there is a period where you would rather say it out loud than project it, cut that paragraph from TEACHER_PROFILE and the slide reflows with no gap.

The slide that earns its time is "La Regla de la Clase" (real vs. fiction). Students see the ESTO ES REAL stamp on every deck for the rest of the year; ninety seconds spent naming the convention now saves the recurring "wait, is this real?" question later, and it is also the slide that keeps the game from teaching anyone false history.

"Si Ya Lo Hablas" is written to be read almost verbatim — it is aimed at heritage speakers who have been told their Spanish is wrong. If that is not your room this period, it still lands, because the no-mocking norm on Day 2 depends on it.

The ten phrases are not a quiz. Nobody memorizes them today. They exist so that "no entiendo" and "otra vez, por favor" are available on day two, which is when students actually need them.`;

const DAY_TWO_NOTE = `The grade slide is derived from the real grading engine (lib/grading-report.ts): 70% quality, 30% completion, proficiency tracked separately. If you change the weights in the code, change them here — this slide is the promise students will hold you to in October.

Norms are a starter set built around how this course actually works, not a generic list. Cut freely. The two worth keeping if you cut everything else are "Sin burlas" — deliberately written wider than language, because a room where you can be mocked for anything is not a room where you will risk a sentence in a language you are bad at — and "Se puede repetir", since retakes are what make the proficiency score honest.

"Sin teléfonos" states the school-wide ban rather than a classroom preference, so it should match whatever the office says this year. If the policy changes, change this line.

The "Cómo Funciona" slide replaces what used to be a login walkthrough. It is worth saying out loud rather than skipping: students who were shown a video game on Day 1 and then handed a worksheet on Day 3 will decide, quietly, that the game was a bait-and-switch. Naming the reason — the machines are not here yet — and promising the paper is the same Spanish is what keeps the first two weeks from feeling like a consolation prize.

Do not give a date for the computers unless you actually have one. "When they arrive" survives being wrong; "next Monday" does not.`;

function toDeck(
  unitNumber: number,
  label: string,
  caseTitle: string,
  city: string,
  slides: StorySlide[],
  teacherNote: string,
): StoryDeck {
  const core = slides.filter((s) => !(s.kind === "storyBeat" && s.optional));
  return {
    meta: {
      unitNumber,
      caseTitle,
      country: "La Liga Sombra",
      city,
      slideCount: slides.length,
      estimatedMinutes: estimateMinutes(slides),
      coreSlideCount: core.length,
      coreMinutes: estimateMinutes(core),
      label,
    },
    slides,
    teacherNote,
  };
}

/**
 * Both orientation decks, in teaching order. Prepended to the Story tab so the
 * first thing in the list is the first thing of the year.
 *
 * unitNumber 0 and 0.5 are selector keys, not units — no unit 0 exists in the
 * database and these decks deliberately never touch one.
 */
export function buildIntroDecks(): StoryDeck[] {
  return [
    toDeck(0, "Día 1 · Bienvenida y reclutamiento", "Expediente 000 · Reclutamiento", "Día 1", dayOneSlides(), DAY_ONE_NOTE),
    toDeck(0.5, "Día 2 · Normas, nota y protocolo", "Expediente 000 · Protocolo", "Día 2", dayTwoSlides(), DAY_TWO_NOTE),
  ];
}
