/**
 * Per-case STORY decks — the pre-case briefing shown before students play.
 *
 * Different job from lib/decks/build.ts. That deck DRILLS vocabulary; this one
 * tells students what was stolen, whose it was, and why anyone should care,
 * so that when the case opens they are recovering something that means
 * something instead of chasing an arbitrary object.
 *
 * Written in English (these run in week one of Spanish 1) with the case's own
 * Spanish woven in and glossed. Authored per case, like grammar.ts and
 * culture.ts — narrative can't be derived from a content file.
 *
 * ── Rules for authors ─────────────────────────────────────────────────────
 *
 * 1. EVERY slide is flagged `real: true` or `real: false`.
 *      real: true  → verifiable fact about the real world. The deck stamps it
 *                    ESTO ES REAL, and it must survive a student googling it.
 *      real: false → invented for the case (the museum, the artifact, the thief).
 *    Students repeat what we show them, so the line is drawn on the slide
 *    itself, not in a footnote the class never reads.
 *
 * 2. NO CASE FICTION ON A `real: true` SLIDE. Not one clause. A stamped slide
 *    that smuggles in the thief or the artifact launders fiction as fact and
 *    poisons the real claims sitting next to it.
 *      BUT: the agent's second person is NOT fiction. "You are about to spend a
 *      week working this city" asserts nothing false. Rule 2 strips the case off
 *      these slides; it must not strip the reader out of the room. A stamped
 *      slide with no "you" on it is where the deck goes dead — that is a
 *      measured failure mode, not a hypothetical one.
 *
 * 3. NO SPOILERS. The briefing sets up the case; it does not solve it. Never
 *    print a `clueReward` or the `bonusClue` on a slide — students earn those.
 *
 * 4. DON'T TEACH A MOVE THE GAME PUNISHES. Cross-check any "here's what to do"
 *    claim against the unit's dialogueChoice options before writing it.
 *
 * 5. CULTURE IS NOT THE VILLAIN'S COSTUME. Never introduce a real tradition and
 *    then convert it into the identifying mark of the criminal. Some of these
 *    students are from these cultures.
 */

export interface StoryFact {
  label: string;
  value: string;
}

/** One narrative slide. */
export interface StoryBeat {
  eyebrow: string;
  headline: string;
  /** Paragraphs. Keep to 2–3; this is projected, not read silently. */
  body: string[];
  /** Optional oversized pull line. Must NOT restate a sentence in `body`. */
  pull?: string;
  /** Optional fact rows rendered as a sidebar table. */
  facts?: StoryFact[];
  /** True = real-world fact (stamped ESTO ES REAL). False = case fiction. */
  real: boolean;
  /**
   * Cuttable when short on time. The deck renders a "core" mode that drops
   * these, so trimming is a button the teacher presses at 7:52 a.m. rather
   * than an instruction buried in teacherNote that nobody reads.
   */
  optional?: boolean;
}

/** A vocabulary slide that shows the phrase doing a job inside the case. */
export interface StoryVocabBeat {
  /** Why these words matter at this exact moment in the investigation. */
  eyebrow: string;
  headline: string;
  /** The setup sentence — what the agent is trying to do. */
  situation: string;
  entries: Array<{
    spanish: string;
    english: string;
    /** How it actually sounds in the field. */
    note?: string;
  }>;
  /**
   * A 30-second out-loud task. The deck's whole argument is that these phrases
   * are tools, so students hold one before the laptops open.
   */
  production?: { instruction: string; say: string };
}

export interface CaseStory {
  /** One line under the case title on the cover. */
  hook: string;
  /** Opening scene: the crime. */
  crime: StoryBeat;
  /** The stolen thing, and what kind of thing it is. */
  artifact: StoryBeat[];
  /** Country and city. */
  place: StoryBeat[];
  /** Why the theft is a loss — the emotional turn. */
  stakes: StoryBeat;
  /** Vocabulary, in the order the investigation needs it. */
  vocab: StoryVocabBeat[];
  /** What the student is about to do in the game. */
  expect: { headline: string; items: Array<{ label: string; text: string }> };
  /** Turn-and-talk before they play. */
  discuss: { prompt: string; followups: string[] };
  /** Last line on the screen before they open laptops. */
  closer: string;
  teacherNote: string;
}

export const STORIES: Record<number, CaseStory> = {
  1: {
    hook: "Someone walked out of a museum with a two-hundred-year-old guitar. You get four suspects, two witnesses, and twelve Spanish phrases.",

    crime: {
      eyebrow: "El Crimen",
      headline: "3:14 A.M.",
      body: [
        "At 3:14 in the morning, a motion sensor on the second floor of the Museo de la Música blinks once and goes quiet. By sunrise the case marked GUITARRA DEL SOL is empty.",
        "No broken glass. No forced door. Whoever did this knew the building, knew the schedule, and walked out through the front.",
        "There are four suspects and two witnesses. Here is your problem, agente: both witnesses saw something, and you cannot ask either one of them a single question. Yet.",
      ],
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "La Guitarra del Sol",
        body: [
          "A guitar, two hundred years old, with a sunburst inlaid around the sound hole in mother-of-pearl. La guitarra means the guitar. El sol means the sun.",
          "It was built in Jalisco in 1826 — five years after Mexico won its independence, and decades before anyone wrote the word mariachi down. It did not start out as a mariachi guitar. It became one the way instruments always do: by being played in one, over and over, for two centuries.",
          "It is not behind glass because it is fragile. It is behind glass because it is still in tune.",
        ],
        facts: [
          { label: "Nombre", value: "La Guitarra del Sol" },
          { label: "Hecha en / Made in", value: "Jalisco, 1826" },
          { label: "Materiales", value: "Cedar, rosewood, mother-of-pearl" },
          { label: "Último concierto", value: "Plaza de los Mariachis, 2019" },
        ],
        real: false,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "México",
        body: [
          "You are about to spend a week working a case in the most populous Spanish-speaking country on Earth — more people speak Spanish here than in Spain and Argentina put together. For some of you this is already the Spanish you hear at home. For the rest of you, it is the Spanish you will hear most.",
          "Spanish is not the only language here. Mexico recognizes 68 Indigenous language groups and 364 distinct variants. Náhuatl alone is spoken by more than a million and a half people today — not historically, today. Spanish borrowed words from it, and English borrowed them from Spanish: tomato, avocado, coyote, chile.",
        ],
        facts: [
          { label: "Capital", value: "Ciudad de México (CDMX)" },
          { label: "Población", value: "~130 million" },
          { label: "Idiomas", value: "Spanish + 68 Indigenous language groups" },
          { label: "Moneda", value: "el peso mexicano" },
          { label: "Fiesta nacional", value: "16 de septiembre — Independencia" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "La Ciudad · The City",
        headline: "Guadalajara, Jalisco",
        body: [
          "You will hear this city before you see it. In the Plaza de los Mariachis, groups in full charro suits play in the open air, hired song by song — you walk up, you name a song, you pay, they play it. This is a job. It has been someone's job in that plaza for generations.",
          "Guadalajara anchors one of Mexico's three largest metropolitan areas and is the capital of the state of Jalisco — the heart of mariachi country. The nearby town of Cocula is called la cuna del mariachi, the cradle of mariachi.",
          "Jalisco is also the emblematic home of charrería — often called the Mexican rodeo, though it is scored on style rather than speed. It is Mexico's national sport, and it has been on the same UNESCO heritage list as mariachi since 2016.",
        ],
        facts: [
          { label: "Estado", value: "Jalisco" },
          { label: "Población", value: "~5.3 million (metro)" },
          { label: "Conocida por", value: "Mariachi, charrería, Hospicio Cabañas" },
          { label: "Apodo", value: "La Perla de Occidente" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "You Cannot Put Mariachi in a Display Case",
      body: [
        "In 2011, UNESCO added mariachi to its list of the Intangible Cultural Heritage of Humanity. Intangible means you cannot box it up. It is not the wood and the strings — it is the songs, the way they pass from a grandparent to a grandchild, the knowledge of which one to play and when.",
        "That is what makes stealing a working instrument worse than it looks. An instrument that gets played is part of a living tradition. An instrument locked in a private collection is furniture.",
      ],
      pull: "Stealing an instrument that is still played is not stealing a thing. It is stealing a sound.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · Get In the Door",
        headline: "You Cannot Interview Anyone You Cannot Greet",
        situation:
          "You land in Guadalajara. In Mexico you do not open with a question — you open with a greeting. Skip it and you sound like someone with something to hide. Greet the witness and he talks. Rush him and you get nothing.",
        entries: [
          { spanish: "hola", english: "hello", note: "Works any time of day." },
          { spanish: "buenos días", english: "good morning", note: "Until about noon." },
          { spanish: "buenas tardes", english: "good afternoon", note: "Noon until dark." },
          { spanish: "buenas noches", english: "good night / good evening", note: "After dark — both hello AND goodbye." },
          { spanish: "adiós", english: "goodbye" },
        ],
        production: {
          instruction: "Thirty seconds. Turn to the person next to you and greet them with the one that fits right now.",
          say: "Buenos días. / Buenas tardes.",
        },
      },
      {
        eyebrow: "Herramienta 2 · Keep Them Talking",
        headline: "Politeness Is an Investigative Technique",
        situation:
          "A witness who feels respected keeps talking. A witness who feels interrogated remembers nothing. These three words are worth more to you than a search warrant.",
        entries: [
          { spanish: "por favor", english: "please" },
          { spanish: "gracias", english: "thank you" },
          { spanish: "de nada", english: "you're welcome", note: "Literally: 'of nothing.'" },
        ],
      },
      {
        eyebrow: "Herramienta 3 · Names",
        headline: "Two Ways to Ask — Pick by Who You Are Talking To",
        situation:
          "Your four suspects all use aliases — El Camaleón, La Serpiente, El Toro, El Pájaro. Before you can even ask a name, Spanish makes you choose how formal to be: tú for someone your own age, usted for an adult or anyone you have just met. Both are correct Spanish. Choosing usted is how you show respect, and it is what the shopkeeper gets. One warning about timing: once a witness has told you what you needed, thank him instead of asking one more question.",
        entries: [
          { spanish: "me llamo…", english: "my name is…", note: "Literally: 'I call myself.' Watch for this one in the letter." },
          { spanish: "¿cómo te llamas?", english: "what's your name? (tú)", note: "The ¿ opens the question. Someone your own age." },
          { spanish: "¿cómo se llama usted?", english: "what's your name? (usted)", note: "An adult or a stranger. Recognize it — you'll hear it long before you need to write it." },
        ],
      },
      {
        eyebrow: "Herramienta 4 · The Question That Solves It",
        headline: "¿De Dónde Eres?",
        situation:
          "This is not small talk. Your four suspects are from four different cities — Guadalajara, Ciudad de México, Monterrey, Cancún — and the guitar was built and stolen in exactly one of them. Somebody is going to tell you where they are from, in their own words, without being asked.",
        entries: [
          { spanish: "¿de dónde eres?", english: "where are you from?" },
          { spanish: "soy de…", english: "I'm from…", note: "Learn this sentence shape. You will see it again in ten minutes." },
        ],
        production: {
          instruction: "Thirty seconds, partners. Ask it, answer it for real, then switch.",
          say: "¿De dónde eres? — Soy de ______.",
        },
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa gives you the case. Everything after this is in Spanish." },
        { label: "Vocabulario", text: "Match all twelve phrases. You will need every one." },
        { label: "Testigo", text: "Interview Don Rodrigo. Wrong words get you a second try and a hint — right words get you the clue." },
        { label: "Evidencia", text: "Read a letter the thief wrote. He tells you more than he means to." },
        { label: "Escucha", text: "Listen to a recording. No subtitles, three replays." },
        { label: "La Rueda", text: "Four suspects, one arrest. Read every description before you choose." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: why would a thief want something he can never show anyone?",
      followups: [
        "And: what would you lose if the thing you use most went behind glass?",
      ],
    },

    closer: "El caso está abierto. Buena suerte, agente.",

    teacherNote:
      "Run immediately before students open Caso 1. The minute estimate in the toolbar is calibrated for a real 9th-grade room, not for reading aloud at speed — trust it. The NÚCLEO toggle drops the optional México slide and is the version to use first period, when students are still settling. The spine is that the unit's 'boring' greetings vocabulary is the actual murder weapon: '¿De dónde eres?' is the question that catches El Camaleón, because he writes 'Soy de Guadalajara' in his own letter. If students leave with one idea, make it that one — it reframes every introductions unit they will ever sit through. Don't skip the two thirty-second production beats; they are the only moment students speak, and the deck's whole claim is that these phrases are tools. Say the ESTO ES REAL distinction out loud once: the museum, the guitar, and the thief are invented, while Guadalajara, Plaza de los Mariachis, charrería, and the UNESCO listings are real and will survive a student googling them. The deck deliberately does NOT reveal the hat clue or the left-handed bonus clue — students earn both in the game. Note on tú/usted: the deck shows both name questions on purpose, because students meet the usted form in the game whether or not you teach it. Point out that the game's own CORRECT answer to Don Rodrigo is usted — '¿Vio algo sospechoso esta mañana?' ('vio', not 'viste'). The game rejects '¿Cómo se llama usted exactamente?' for PACING — you already have the clue — and not because the usted form is wrong. If a student asks, that distinction is worth thirty seconds.",
  },
};

export function getCaseStory(unitNumber: number): CaseStory | null {
  return STORIES[unitNumber] ?? null;
}
