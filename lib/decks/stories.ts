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

  2: {
    hook: "Someone emptied a school computer lab. The principal saw him — and cannot tell you his name.",

    crime: {
      eyebrow: "El Crimen",
      headline: "The Lab Was Full on Friday",
      body: [
        "Monday morning, Escuela Secundaria del Viejo San Juan. The computer lab is missing mice, keyboards, and a new monitor. No window is broken. Whoever did this walked in during school hours and looked like he belonged.",
        "La Sra. Torres, the principal, passed him in the hallway. She can tell you how tall he is, what colour his hair is, and what he was doing. She cannot tell you his name.",
        "There are four students in the yearbook who could be him. Your whole job this case is turning a description into a name.",
      ],
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "A Computer Lab Is Not a Treasure",
        body: [
          "Nothing taken here is priceless. Mice, keyboards, one monitor — la computadora, el ratón, el teclado, la pantalla. You could replace all of it for the price of a plane ticket.",
          "That is exactly why it is worth your time. This is a public school. The lab is where students who do not have a computer at home write their essays and apply to college. The thief did not take a national treasure. He took other kids' homework.",
        ],
        pull: "Some thefts take something irreplaceable. This one took something ordinary — from people who could not replace it.",
        facts: [
          { label: "la computadora", value: "the computer" },
          { label: "el ratón", value: "the mouse (also: the mouse)" },
          { label: "el teclado", value: "the keyboard" },
          { label: "la pantalla", value: "the screen / monitor" },
          { label: "la impresora", value: "the printer" },
        ],
        real: false,
      },
    ],

    place: [
      {
        eyebrow: "El Territorio",
        headline: "Puerto Rico",
        body: [
          "You have not left the United States. Puerto Rico is a US territory, and Puerto Ricans have been US citizens since 1917 — which surprises a lot of people on the mainland. Residents of the island can vote in presidential primaries but not in the general election, and they send one non-voting representative to Congress.",
          "Spanish is the language of daily life; both Spanish and English are official. Roughly 40% of people on the island live below the federal poverty line — higher than any US state — which is part of why a school computer lab matters as much as it does here.",
        ],
        facts: [
          { label: "Capital", value: "San Juan" },
          { label: "Población", value: "~3.2 million" },
          { label: "Moneda", value: "US dollar" },
          { label: "Idiomas", value: "Español e inglés" },
          { label: "Ciudadanía", value: "US citizens since 1917" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "La Ciudad · The City",
        headline: "El Viejo San Juan",
        body: [
          "You are working a crime scene inside a five-hundred-year-old walled city. San Juan was founded in 1521, which makes it the oldest city under the US flag — older than St. Augustine, Florida, by more than forty years.",
          "The streets are paved in blue-grey adoquines, cast from furnace slag and carried over as ballast in the holds of Spanish ships. At the point of the peninsula stands El Morro, the fortress that guarded the harbour for centuries; it is a UNESCO World Heritage Site.",
          "And in the middle of all that history there is a regular public high school, with a regular computer lab, that somebody robbed on a Friday.",
        ],
        facts: [
          { label: "Fundada", value: "1521" },
          { label: "El Morro", value: "Castillo San Felipe del Morro" },
          { label: "Patrimonio", value: "UNESCO World Heritage" },
          { label: "Las calles", value: "adoquines — blue ballast cobblestones" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "In Spanish, You Do Not Have Qualities. You Are Them.",
      body: [
        "English says a person has brown hair and is tall. Spanish uses one verb, ser, for the things that make someone who they are: es alto, es moreno, es inteligente, es trabajador.",
        "That is why this case runs on ser. A witness who only saw someone for four seconds can still give you a sentence like 'Es alto y moreno' — and that sentence, stacked with three more like it, is enough to pick one student out of an entire yearbook.",
      ],
      pull: "Four short sentences with ser can identify a person you have never seen.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · What They Look Like",
        headline: "SER + Adjective Is the Whole Machine",
        situation:
          "Every witness in this case gives you the same shape of sentence: es + an adjective. Learn the pattern once and every description in the case unlocks. Watch the endings — adjectives change to match the person.",
        entries: [
          { spanish: "alto / alta", english: "tall" },
          { spanish: "bajo / baja", english: "short" },
          { spanish: "moreno / morena", english: "dark-haired" },
          { spanish: "rubio / rubia", english: "blond" },
        ],
        production: {
          instruction: "Thirty seconds. Describe the person next to you out loud — two sentences, no English.",
          say: "Es alto. / Es baja y morena.",
        },
      },
      {
        eyebrow: "Herramienta 2 · What They Are Like",
        headline: "A Description Is Not Only a Body",
        situation:
          "Witnesses remember personality as fast as they remember height, and in this case two suspects look almost identical. When appearance runs out, character is what is left.",
        entries: [
          { spanish: "simpático / simpática", english: "nice, friendly" },
          { spanish: "serio / seria", english: "serious" },
          { spanish: "tímido / tímida", english: "shy" },
          { spanish: "trabajador / trabajadora", english: "hard-working" },
          { spanish: "inteligente", english: "intelligent", note: "No -o/-a. Same for everyone." },
          { spanish: "gracioso / graciosa", english: "funny" },
        ],
      },
      {
        eyebrow: "Herramienta 3 · The Crime Scene",
        headline: "You Cannot Report a Theft You Cannot Name",
        situation:
          "These are the objects on the inventory list. You will read them in a diary, hear them in a voicemail, and see them in the principal's statement.",
        entries: [
          { spanish: "la computadora", english: "computer" },
          { spanish: "el teclado", english: "keyboard" },
          { spanish: "el ratón", english: "mouse" },
          { spanish: "la pantalla", english: "screen" },
          { spanish: "la impresora", english: "printer" },
          { spanish: "los auriculares", english: "headphones" },
        ],
      },
      {
        eyebrow: "Herramienta 4 · What They Do",
        headline: "Verbs Are Evidence Too",
        situation:
          "Nobody solves this on looks alone — two of your four suspects are tall and dark-haired. What separates people is what they DO all day. Listen for the -AR verbs; they are where the case actually turns.",
        entries: [
          { spanish: "estudiar", english: "to study" },
          { spanish: "usar", english: "to use" },
          { spanish: "trabajar", english: "to work" },
          { spanish: "escuchar", english: "to listen" },
          { spanish: "hablar", english: "to speak" },
        ],
        production: {
          instruction: "Thirty seconds, partners. Answer for real, in Spanish.",
          say: "¿Qué usas todos los días? — Uso ______.",
        },
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa sends you to San Juan. Everything after this is in Spanish." },
        { label: "Vocabulario", text: "Match the phrases. Descriptions are the entire case." },
        { label: "La Directora", text: "Interview Sra. Torres. She saw him; help her say what she saw." },
        { label: "El Diario", text: "Read a student's diary. Classmates get described one by one." },
        { label: "Escucha", text: "A voicemail. No subtitles, three replays." },
        { label: "El Anuario", text: "Four students in the yearbook. Read every description before choosing." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: if someone had to describe you so a stranger could pick you out of your whole grade, what three things would they say?",
      followups: [
        "Would 'alto' or 'moreno' actually narrow it down in this room?",
      ],
    },

    closer: "El caso está abierto. ¡Buena suerte, agente!",

    teacherNote:
      "Run immediately before students open Caso 2. The spine is that ser + adjective is not a grammar chore, it is the identification tool the entire case runs on — four short sentences narrow a yearbook to one student. The discussion prompt does real work: students discover on their own that physical description is weak (in most classrooms 'tall and dark-haired' fits a dozen people), which is exactly why the case forces them past appearance into behaviour. Two suspects are deliberately near-identical on looks. Watch the ESTO ES REAL stamps: the school, the theft, and the suspects are invented, while Puerto Rican citizenship, the 1521 founding, El Morro, the adoquines, and the poverty figure are real. The citizenship fact reliably surprises mainland students and is worth the thirty seconds. Use the NÚCLEO toggle to drop the territory slide if you are tight; the Viejo San Juan slide is the one that sets the scene. The deck does NOT reveal the headphones clue — students earn it.",
  },

  3: {
    hook: "A Velázquez left the Prado last night. She is on foot, she is fast, and she has a train to catch.",

    crime: {
      eyebrow: "El Crimen",
      headline: "She Is Not Hiding. She Is Moving.",
      body: [
        "Last night someone walked out of the Museo del Prado with a Velázquez under her arm. She is known as La Sombra, and she is the best in Europe at this.",
        "Here is what makes her different from every thief you have chased so far: she does not go to ground. Witnesses keep seeing her — crossing a plaza, going down a metro entrance, sitting in a café near the Retiro. Every single one of them saw her going somewhere.",
        "You are not searching a building, agente. You are reconstructing a route across a city, and you are one train behind.",
      ],
      pull: "Every witness saw her leaving. Nobody saw her stop.",
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "'El Infante'",
        body: [
          "A portrait of a royal child, painted by Diego Velázquez for the court of Felipe IV. Small, dark, and worth more than the building it hung in.",
          "It came off the wall between the last guard round and dawn. The frame is still there.",
        ],
        facts: [
          { label: "Pintor", value: "Diego Velázquez" },
          { label: "Museo", value: "Museo del Prado, Madrid" },
          { label: "Visto por última vez", value: "Sala 12, 23:40" },
        ],
        real: false,
      },
      {
        eyebrow: "El Contexto · The Real Thing",
        headline: "Velázquez Painted Everybody",
        body: [
          "Velázquez was the court painter to Felipe IV, and he did paint kings. But he also painted the palace's servants, cooks, and court dwarfs — and he painted them with exactly the same seriousness and dignity he gave the royal family. In the 1600s that was close to radical.",
          "His most famous work, Las Meninas, hangs in the Prado today. It puts you, the viewer, exactly where the king was standing. You are not looking at the painting; the painting is looking at you.",
        ],
        facts: [
          { label: "Las Meninas", value: "1656 — still in the Prado" },
          { label: "El Prado", value: "Opened to the public in 1819" },
          { label: "La colección", value: "The largest collection of Spanish painting on Earth" },
        ],
        real: true,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "España",
        body: [
          "Spain is where the Spanish language is from, but only about one Spanish speaker in ten lives there — the other ninety percent are in the Americas. If the accent in this case sounds different from Caso 1, that is why: in most of Spain, the c in 'gracias' is pronounced like the th in 'think'.",
          "Spain also has four official languages. Castilian Spanish is the national one; Catalan, Galician, and Basque are co-official in their regions, and Basque is not related to Spanish — or to any other known language on Earth.",
        ],
        facts: [
          { label: "Capital", value: "Madrid" },
          { label: "Población", value: "~48 million" },
          { label: "Moneda", value: "el euro" },
          { label: "Idiomas", value: "Castellano, catalán, gallego, euskera" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "La Ciudad · The City",
        headline: "Madrid",
        body: [
          "You are going to cross this city on foot, then by metro, then by train — in that order, and fast. Start at the Puerta del Sol, which is not just a plaza: set into the pavement there is Kilómetro Cero, the point from which every distance in Spain is measured. Every road in the country counts from that stone.",
          "From Sol it is a walk to the Prado, and past the Prado is the Retiro — a royal garden that stopped being royal and became the city's park. In 2021 UNESCO put the Paseo del Prado and the Retiro on the World Heritage list together.",
          "The Metro will take you the rest of the way. It is one of the largest subway systems in the world, and it runs until well after midnight — which is a problem, because so does she.",
        ],
        facts: [
          { label: "Puerta del Sol", value: "Kilómetro Cero — every Spanish road counts from here" },
          { label: "El Retiro", value: "Royal garden, now the city's park · UNESCO 2021" },
          { label: "Atocha", value: "Madrid's largest train station" },
          { label: "Población", value: "~6.7 million (metro)" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "The Prado Used to Be Private",
      body: [
        "For most of history, the great paintings of Spain hung in palaces, and the only people who saw them were the people invited into palaces. The Prado's collection began as the royal collection — art owned by one family.",
        "In 1819 it opened to the public, and a set of paintings that had belonged to kings became something anybody could walk in and look at. Millions of people a year now stand in front of Las Meninas.",
        "A stolen painting does not just change owners. It goes back to being private — seen by one person, in one room, who cannot even admit they have it.",
      ],
      pull: "It took two hundred years to make these paintings public. A theft undoes that in one night.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · The Only Question That Matters",
        headline: "¿Adónde Va?",
        situation:
          "Every witness in this case answers one question: where is she going? Spanish has a special question word for it — not ¿dónde? (where is something) but ¿adónde? (where TO). Pair it with ir, and you can track anyone.",
        entries: [
          { spanish: "ir", english: "to go" },
          { spanish: "voy a…", english: "I'm going to…" },
          { spanish: "va a…", english: "he/she is going to…" },
          { spanish: "¿adónde?", english: "where to?", note: "Different from ¿dónde? — this one has motion in it." },
        ],
        production: {
          instruction: "Thirty seconds, partners. Ask and answer for real.",
          say: "¿Adónde vas después de la escuela? — Voy a ______.",
        },
      },
      {
        eyebrow: "Herramienta 2 · The Map",
        headline: "Places Are Coordinates",
        situation:
          "A witness will not say 'she went north'. They will say she went to the pharmacy, the market, the police station. Each place name you know is one more point you can plot on her route.",
        entries: [
          { spanish: "la plaza", english: "the square" },
          { spanish: "la calle", english: "the street" },
          { spanish: "el mercado", english: "the market" },
          { spanish: "la farmacia", english: "the pharmacy" },
          { spanish: "el banco", english: "the bank" },
          { spanish: "la comisaría", english: "the police station" },
        ],
      },
      {
        eyebrow: "Herramienta 3 · How She Travels",
        headline: "On Foot Is Slower Than a Train",
        situation:
          "Knowing WHERE she went is only half of it. How she travelled tells you how much of a head start she has — and whether you can still close it.",
        entries: [
          { spanish: "a pie", english: "on foot" },
          { spanish: "el metro", english: "the subway" },
          { spanish: "el autobús", english: "the bus" },
          { spanish: "el taxi", english: "the taxi" },
          { spanish: "el tren", english: "the train" },
          { spanish: "el avión", english: "the plane", note: "If she reaches one of these, the case is over." },
        ],
        production: {
          instruction: "Thirty seconds, partners.",
          say: "¿Cómo vienes a la escuela? — Vengo a pie / en autobús / en coche.",
        },
      },
      {
        eyebrow: "Herramienta 4 · Interrogation Kit",
        headline: "Six Words Do All Your Work",
        situation:
          "You will interview a metro worker who saw her go past. You get a handful of questions before he goes back to his shift. These are the six that get you the most for the fewest words.",
        entries: [
          { spanish: "¿adónde?", english: "where to?" },
          { spanish: "¿cuándo?", english: "when?" },
          { spanish: "¿cómo?", english: "how?" },
          { spanish: "¿quién?", english: "who?" },
          { spanish: "¿por qué?", english: "why?" },
          { spanish: "¿cuánto?", english: "how much / how many?" },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa puts you on her trail. Everything after this is in Spanish." },
        { label: "Vocabulario", text: "Match the phrases — places, transport, and ir." },
        { label: "Construye", text: "Build sentences with ir a. This is how you state a route." },
        { label: "Testigo", text: "Interview Carlos, who works the Metro. He saw her go past." },
        { label: "Escucha", text: "Police radio. The full route, fast, no subtitles." },
        { label: "El Mapa", text: "Trace her across Madrid, stop by stop. Wrong turn, she gains ground." },
        { label: "El Periódico", text: "The last thing you read is the next morning's newspaper." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: every other thief this year gets caught by what they look like. La Sombra gets caught by where she went. What does a person's route through a city tell you that their face doesn't?",
      followups: [
        "Think about your own week — what would someone learn about you just from a map of where you go?",
      ],
    },

    closer: "¡Corre, agente! El caso está abierto.",

    teacherNote:
      "Run immediately before students open Caso 3. The spine is that this is the one case solved by movement rather than appearance — students track a route instead of matching a face, and 'ir a + place' is the tool that makes it possible. Point at the ¿dónde? vs ¿adónde? distinction on the first vocab slide; it is a real difference English does not mark and students will meet it again all year. Caso 3 ends on the reading rather than the lineup (the newspaper reports the outcome), so the expect slide is deliberately seven items — do not let students expect a lineup. Watch the ESTO ES REAL stamps: 'El Infante' and La Sombra are invented, while Velázquez, Las Meninas, the Prado's 1819 opening, Kilómetro Cero, and the Retiro's UNESCO listing are real. The Spain slide has the pronunciation note (the 'th' sound in gracias) — if your class has heritage speakers from Latin America, that slide is a good moment to say plainly that neither accent is the correct one. Use NÚCLEO to drop it if short on time.",
  },

  4: {
    hook: "Nobody broke into the house. Everyone who could have taken it is family.",

    crime: {
      eyebrow: "El Crimen",
      headline: "Nobody Broke In",
      body: [
        "Abuela Carmen's emerald necklace is gone from the blue box in her bedroom. No window forced, no door jimmied, no stranger anywhere on the property. The finca sits by itself near the Arenal volcano; you cannot wander onto it by accident.",
        "Four people were in that house this morning, and every one of them is related to her. One is her daughter. One is her grandson. There is no version of this case where the answer is a stranger.",
        "Three of them will tell you where they were, and you will be able to check it. One of them will tell you a story that does not hold together.",
      ],
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "El Collar de Esmeraldas",
        body: [
          "An emerald necklace, given to Carmen by her husband, who died eleven years ago. She has worn it to every wedding, every baptism, and every Christmas since.",
          "It is not the most valuable thing in the house. It is the only thing in the house she would not sell for any amount of money, and everyone in that family knows it. Whoever took it knew it too.",
        ],
        pull: "The thief did not take the most expensive thing in the house. They took the one thing she could not replace.",
        facts: [
          { label: "Objeto", value: "Un collar de esmeraldas" },
          { label: "De quién", value: "La abuela Carmen" },
          { label: "Regalo de", value: "Su esposo — hace más de treinta años" },
          { label: "Visto por última vez", value: "En la caja azul de su habitación" },
        ],
        real: false,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "Costa Rica",
        body: [
          "In 1948, Costa Rica abolished its army. Not reduced it — abolished it, wrote the ban into the constitution, and spent the military budget on schools and healthcare instead. It has not had a standing army since, which makes it one of a very small number of countries on Earth without one.",
          "It is also roughly the size of West Virginia and holds something like five percent of all species known to science. That is not a tourism slogan; it is the reason biologists move there.",
        ],
        facts: [
          { label: "Capital", value: "San José" },
          { label: "Población", value: "~5.2 million" },
          { label: "Moneda", value: "el colón" },
          { label: "Ejército", value: "Abolished in 1948" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "La Región · Where You Are",
        headline: "El Volcán Arenal",
        body: [
          "You are working this case in the shadow of a volcano that was quiet for centuries — so quiet people farmed its slopes and assumed it was just a hill. In 1968 it woke up without warning and destroyed two villages. It then stayed active for forty years, throwing lava most nights, and went quiet again in 2010.",
          "Today it is a national park, and the same heat that made it dangerous feeds hot springs that people travel across the world to sit in. The family in this case lives on land that has been in their name for generations.",
          "You will also hear one phrase constantly here: pura vida. It is not a slogan for tourists. Costa Ricans use it as hello, as thank you, as 'no problem', and as the answer to 'how are you'.",
        ],
        facts: [
          { label: "Erupción", value: "1968 — after centuries of silence" },
          { label: "Activo", value: "1968–2010" },
          { label: "Hoy", value: "Parque Nacional Volcán Arenal" },
          { label: "Pura vida", value: "Hello · thanks · no worries · I'm good" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "Spanish Makes a Liar Choose",
      body: [
        "English has one verb for 'to be', and it lets you be vague. Spanish has two, and it does not.",
        "SER is what someone permanently is: 'Es nervioso' means he is a nervous person, always has been. ESTAR is what is true right now: 'Está nervioso' means something is happening to him at this moment. Same English word. Completely different claim.",
        "That is the whole engine of this case. Everyone in the house will tell you where they are and how they feel, and both of those are ESTAR. A person who is inventing a morning has to keep every ESTAR consistent — and that is much harder than it sounds.",
      ],
      pull: "'Es nervioso' is a personality. 'Está nervioso' is an alibi problem.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · Who Is Who",
        headline: "You Cannot Interview a Family You Cannot Map",
        situation:
          "Four suspects, one surname, one house. Before you can catch anyone in a contradiction, you have to keep straight who is whose.",
        entries: [
          { spanish: "la abuela", english: "grandmother" },
          { spanish: "la madre / la mamá", english: "mother" },
          { spanish: "el nieto", english: "grandson" },
          { spanish: "el tío", english: "uncle" },
          { spanish: "el primo / la prima", english: "cousin" },
          { spanish: "el esposo", english: "husband" },
        ],
      },
      {
        eyebrow: "Herramienta 2 · The Two Verbs",
        headline: "SER vs. ESTAR",
        situation:
          "Both mean 'to be'. Ask yourself which question you are answering: WHO is this person (ser), or WHERE are they and HOW are they right now (estar)? Get this wrong and you will accuse the wrong relative.",
        entries: [
          { spanish: "es", english: "he/she is — identity, permanent traits", note: "Es simpática. Es mi tío." },
          { spanish: "está", english: "he/she is — location, right-now state", note: "Está en la cocina. Está nervioso." },
          { spanish: "estoy", english: "I am (location / state)" },
          { spanish: "estamos", english: "we are (location / state)" },
        ],
      },
      {
        eyebrow: "Herramienta 3 · How They Feel",
        headline: "Feelings Are Evidence",
        situation:
          "Every one of these goes with ESTAR, because every one of them can change in an hour. Listen for the ones that do not match what the person is telling you.",
        entries: [
          { spanish: "nervioso / nerviosa", english: "nervous" },
          { spanish: "tranquilo / tranquila", english: "calm" },
          { spanish: "preocupado / preocupada", english: "worried" },
          { spanish: "cansado / cansada", english: "tired" },
          { spanish: "enojado / enojada", english: "angry" },
          { spanish: "contento / contenta", english: "happy" },
        ],
        production: {
          instruction: "Thirty seconds. Ask your partner and answer honestly — this one is ESTAR.",
          say: "¿Cómo estás hoy? — Estoy ______.",
        },
      },
      {
        eyebrow: "Herramienta 4 · Whose Is It?",
        headline: "In a House Full of Relatives, 'Su' Is Doing a Lot of Work",
        situation:
          "When four people share a surname and a kitchen, saying whose thing you mean stops being grammar and starts being the case. Su collar — whose necklace? That ambiguity is real in Spanish, and people use it.",
        entries: [
          { spanish: "mi / mis", english: "my" },
          { spanish: "tu / tus", english: "your" },
          { spanish: "su / sus", english: "his / her / their", note: "Deliberately ambiguous. Ask who they mean." },
          { spanish: "nuestro / nuestra", english: "our" },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa sends you to the finca. Everything after this is in Spanish." },
        { label: "Vocabulario", text: "Match the phrases — family, feelings, ser and estar." },
        { label: "El Diario", text: "Read Abuela Carmen's diary. She describes her whole family." },
        { label: "Escucha", text: "A voicemail. No subtitles, three replays." },
        { label: "Interrogatorios", text: "Three family members, one at a time. Ask about where and how." },
        { label: "Construye", text: "Build the sentences that state what you now know." },
        { label: "La Acusación", text: "Name one person. In front of the whole family." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: you are about to accuse someone's grandson in front of his own grandmother. What makes an accusation fair instead of just a guess?",
      followups: [
        "How much evidence would you want before you said it out loud?",
      ],
    },

    closer: "¡Pura vida, agente! El caso está abierto.",

    teacherNote:
      "Run immediately before students open Caso 4. The spine is on the stakes slide: Spanish forces a distinction English lets you blur, and ESTAR — location and right-now state — is what a liar cannot keep consistent. Say that out loud; it reframes ser/estar from an arbitrary rule into a tool, and students meet the same contrast again in Caso 12. This case is emotionally different from the others: the suspects are a family, and the accusation happens in front of the grandmother. The discussion prompt leans into that on purpose and is the best one in the semester for teaching evidentiary standards — budget three minutes and let two pairs report. Watch the ESTO ES REAL stamps: the Montoya family, the finca, and the necklace are invented, while the 1948 abolition of the army, the 1968 Arenal eruption, the national park, and pura vida are real. The army fact reliably stops the room. Note the Arenal eruption did kill people; the slide says so plainly rather than presenting the volcano as scenery. Use NÚCLEO to drop the country slide if short.",
  },

  5: {
    hook: "Nothing was carried out of the building. 2.847 people were robbed anyway.",

    crime: {
      eyebrow: "El Crimen",
      headline: "The Doorman Saw Him Four Times and Never Once Stopped Him",
      body: [
        "Edificio Omega, Palermo, Buenos Aires. Between 15 March and 1 April, someone came into the building four separate times, always after eleven at night, and always in a hurry on the way out.",
        "Nothing was smashed. Nothing was carried out that anyone could see. The identity records of 2.847 Argentines left the building on a hard drive the size of a paperback.",
        "El portero — Tomás García — saw him every single time. Lo ve, pero no lo reconoce. He sees him, but he does not recognise him. Your job is to make four blurry sightings add up to one person.",
      ],
      pull: "No broken window. No alarm. 2.847 victims.",
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "You Cannot Put This in a Display Case",
        body: [
          "Every other case this year has an object: a guitar, a painting, a necklace. This one has a number. What was taken is the personal data of 2.847 people — names, ID numbers, addresses, the things that prove you are you.",
          "That is why this case is built out of numbers and dates. Los datos are not a thing you can photograph. The only way to describe what was stolen is to count it, and the only way to catch him is to work out exactly which nights he came.",
        ],
        pull: "The vocabulary of this case is numbers, because the crime is a number.",
        facts: [
          { label: "Víctimas", value: "2.847 argentinos" },
          { label: "Accesos", value: "15/03 · 18/03 · 22/03 · 01/04" },
          { label: "Hora", value: "Siempre después de las 23:00" },
          { label: "Robado", value: "Un servidor portátil y un disco duro" },
        ],
        real: false,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "Argentina",
        body: [
          "You are about to hear Spanish that will not sound like Caso 1. Argentines say vos instead of tú, and they pronounce ll and y like the 'sh' in 'show' — 'calle' comes out as CA-she. Your case files use tú, so you will not have to produce vos; you just should not be startled when you hear it.",
          "This is also the country of tango, which UNESCO added to its list of Intangible Cultural Heritage in 2009 — jointly with Uruguay, because both sides of the Río de la Plata invented it together and neither will concede the point.",
        ],
        facts: [
          { label: "Capital", value: "Buenos Aires" },
          { label: "Población", value: "~46 million" },
          { label: "Moneda", value: "el peso argentino" },
          { label: "El tango", value: "UNESCO Intangible Heritage, 2009" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "La Ciudad · The City",
        headline: "Buenos Aires · Palermo",
        body: [
          "You will be working nights in Palermo, the largest barrio in Buenos Aires — parks, design studios, tech offices, and streets that stay awake far later than the ones you know. People from this city call themselves porteños, 'people of the port', because the port is what built it.",
          "One thing you will see everywhere and should not misread: people carrying a gourd and a metal straw. That is mate, and it is shared — one cup, refilled, passed around a group in order. Being handed the mate is not an offer of a drink so much as an invitation into the circle.",
        ],
        facts: [
          { label: "Barrio", value: "Palermo — the city's largest" },
          { label: "Población", value: "~15 million (metro)" },
          { label: "Porteños", value: "'People of the port'" },
          { label: "El mate", value: "Shared, refilled, passed in order" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "This Is the One Crime in the Season That Could Happen to You",
      body: [
        "In 2021, Argentina's national identity registry was breached and citizens' ID data was offered for sale online. Every country this happens to says afterwards that they did not think it could happen to them.",
        "Identity data is a strange thing to steal, because the victim usually does not notice. A painting is missing from a wall the next morning. Your data is copied and the original stays exactly where it was — you find out two years later, when someone has taken a loan in your name.",
        "So this case has 2.847 victims who do not know yet that they are victims. That is what the number on the file means.",
      ],
      pull: "A stolen painting leaves a blank wall. Stolen data leaves nothing at all.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · TENER",
        headline: "In Spanish You Do Not Feel Hungry. You HAVE Hunger.",
        situation:
          "English uses 'to be' for age and feelings; Spanish uses tener, 'to have'. You are not 15 years old — you HAVE 15 years. Get this wrong and every witness statement about your suspect stops making sense.",
        entries: [
          { spanish: "tener… años", english: "to be … years old", note: "Tiene veintiocho años — he HAS 28 years." },
          { spanish: "tener prisa", english: "to be in a hurry", note: "The single most useful phrase in this case." },
          { spanish: "tener hambre", english: "to be hungry" },
          { spanish: "tener sed", english: "to be thirsty" },
          { spanish: "tener miedo", english: "to be afraid" },
        ],
        production: {
          instruction: "Thirty seconds, partners. Answer with tener, not ser.",
          say: "¿Cuántos años tienes? — Tengo ______ años.",
        },
      },
      {
        eyebrow: "Herramienta 2 · The Numbers Are the Case",
        headline: "You Have to Be Able to Say 2.847",
        situation:
          "The victim count, the entry times, the number of stolen passwords — every clue in this case is a number, and you will hear them spoken, not written. Note what Argentina does with punctuation: 2.847 uses a period where English uses a comma.",
        entries: [
          { spanish: "cien", english: "100" },
          { spanish: "doscientos", english: "200" },
          { spanish: "quinientos", english: "500", note: "Irregular — not 'cincocientos'." },
          { spanish: "mil", english: "1.000" },
          { spanish: "dos mil", english: "2.000" },
          { spanish: "un millón", english: "1.000.000" },
        ],
        production: {
          instruction: "Thirty seconds. Say the victim count out loud, together, twice.",
          say: "dos mil ochocientos cuarenta y siete",
        },
      },
      {
        eyebrow: "Herramienta 3 · The Date Trap",
        headline: "15/03 Is Not January 3rd",
        situation:
          "Argentina writes dates day first: 15/03/2024 is 15 March. Read it the American way and you will place your suspect in the building on the wrong nights, and the whole timeline collapses. This trap is deliberate and the case will spring it on you.",
        entries: [
          { spanish: "enero · febrero · marzo", english: "January · February · March" },
          { spanish: "abril · mayo · junio", english: "April · May · June" },
          { spanish: "el 15 de marzo", english: "15 March = 15/03" },
          { spanish: "el 1 de abril", english: "1 April = 01/04" },
        ],
      },
      {
        eyebrow: "Herramienta 4 · Lo, La, Los, Las",
        headline: "The Doorman's Sentence",
        situation:
          "'Lo ve, pero no lo reconoce.' He sees HIM, but he doesn't recognise HIM. Spanish replaces the thing you already mentioned with a short word placed BEFORE the verb — backwards from English. These four are direct object pronouns, and half the witness statements in this case use them.",
        entries: [
          { spanish: "lo", english: "him / it (masculine)", note: "Lo ve. — She sees him." },
          { spanish: "la", english: "her / it (feminine)", note: "La tiene. — He has it." },
          { spanish: "los", english: "them (masculine / mixed)" },
          { spanish: "las", english: "them (feminine)", note: "Las lleva consigo. — He carries them with him." },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa sends you to Palermo. Everything after this is in Spanish." },
        { label: "Vocabulario", text: "Match the phrases — tener, numbers, and the object pronouns." },
        { label: "Contrarreloj", text: "Timed flashcards. The clock is part of the test." },
        { label: "El Registro", text: "Read the building's security log. Watch the date format." },
        { label: "Escucha", text: "An intercepted call. No subtitles, three replays." },
        { label: "El Portero", text: "Interview Tomás García. He saw the suspect every single time." },
        { label: "La Rueda", text: "Four suspects. Read every description — the details are dates and numbers." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: a painting gets stolen and the wall is empty by morning. Your data gets stolen and everything looks exactly the same. Which theft is worse?",
      followups: [
        "How would you even find out?",
      ],
    },

    closer: "El caso está abierto. Buena suerte, agente.",

    teacherNote:
      "Run immediately before students open Caso 5. The spine is that this is the only case with no object — the stolen thing is a number, which is precisely why the unit's vocabulary is numbers, dates, and tener. Say that connection out loud; it turns the most tedious-looking vocabulary list of the semester into the case file itself. The date trap (15/03 = 15 March) is the single highest-value sixty seconds in this deck: students who read it the American way will build a wrong timeline and mis-identify the suspect, and the case springs the trap deliberately. The 2021 RENAPER breach on the stakes slide is real and makes the premise land — this is the one crime this year that could actually happen to them. The Argentina slide flags voseo and the 'sh' pronunciation as RECOGNITION only; the case files use tú, so tell students they will not be asked to produce vos. Watch the ESTO ES REAL stamps: Edificio Omega, the suspects, and the 2.847 figure are invented, while tango's UNESCO listing, mate, porteños, the date format, and the 2021 breach are real. Use NÚCLEO to drop the country slide if short.",
  },

  6: {
    hook: "You can photograph a recipe and still not be able to cook it.",

    crime: {
      eyebrow: "El Crimen",
      headline: "Four Cooks. One Kitchen. One Missing Recipe.",
      body: [
        "Restaurante La Candelaria, inside the walled city of Cartagena. This morning Chef Valentina Cruz opened the cabinet in her office and found her recipe book open to the wrong page — and her ajiaco recipe photographed.",
        "Four cooks were on shift. Every one of them can tell you exactly what they had to do this morning, because a professional kitchen runs on assignments: this station, these vegetables, that corn, those pots.",
        "One of them describes touching ingredients that were never on their station. That is the whole case, and it turns on three little words: este, ese, aquel.",
      ],
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "La Receta del Ajiaco",
        body: [
          "Not the book. A photograph of one page of it — which means the chef still has her recipe and has lost it at the same time.",
          "Ajiaco is a soup from Bogotá: chicken, corn, and three different kinds of potato that each fall apart at a different speed, which is the entire point. It is served with capers, cream, and avocado on the side.",
          "And it contains one herb, guascas, without which the soup is simply not ajiaco. That is the part people mean when they say a recipe is secret — not the list, the judgement.",
        ],
        pull: "The thief has the ingredients. He does not have the thirty years of knowing when to stop stirring.",
        facts: [
          { label: "El plato", value: "Ajiaco santafereño — from Bogotá" },
          { label: "Las papas", value: "Three varieties, on purpose" },
          { label: "La hierba", value: "Guascas — no substitute exists" },
          { label: "Se sirve con", value: "Alcaparras, crema, aguacate" },
        ],
        real: false,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "Colombia",
        body: [
          "Colombia is the second most biodiverse country on Earth after Brazil, in a fraction of the space — more bird species than any other country in the world. It is also the only South American country with coastline on both the Caribbean and the Pacific.",
          "Something worth knowing before you eat here: ajiaco is from Bogotá, up in the mountains at 2.600 metres, and you are investigating it in Cartagena, on the hot Caribbean coast. Colombians are precise about which region a dish belongs to, and getting it wrong is a real mistake, not a small one.",
        ],
        facts: [
          { label: "Capital", value: "Bogotá" },
          { label: "Población", value: "~52 million" },
          { label: "Moneda", value: "el peso colombiano" },
          { label: "Aves", value: "More bird species than any country on Earth" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "La Ciudad · The City",
        headline: "Cartagena de Indias",
        body: [
          "You are working inside a city that is still wearing its walls. Cartagena was founded in 1533 and fortified because it was the port through which Spain shipped everything it took out of South America — so it was attacked, constantly, by everyone. The Ciudad Amurallada and its fortresses are a UNESCO World Heritage Site.",
          "Today those walls hold plazas, balconies covered in bougainvillea, and restaurants like the one you are about to walk into. Gabriel García Márquez, who won the Nobel Prize, lived and wrote here.",
        ],
        facts: [
          { label: "Fundada", value: "1533" },
          { label: "Patrimonio", value: "UNESCO World Heritage — the walled city and forts" },
          { label: "Población", value: "~1 million" },
          { label: "Vivió aquí", value: "Gabriel García Márquez" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "A Recipe Is Instructions for Something You Cannot Write Down",
      body: [
        "A stolen painting is still the painting. A stolen recipe is a list of words that does not work. The thief now knows the ingredients of the ajiaco and still cannot make it, because the part that matters was never written down: how the potatoes should look when they start to collapse, how long the guascas can sit in the pot before it turns bitter.",
        "That knowledge lives in a person, and it got there because somebody older stood next to them and corrected them for years. It is the same reason a photograph of a recipe feels like a theft even though nothing left the building.",
      ],
      pull: "He stole the list. The cooking was never on the page.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · This, That, and That Over There",
        headline: "Spanish Has Three Distances. English Has Two.",
        situation:
          "English gives you this and that. Spanish gives you three: este (here, next to me), ese (there, near you), aquel (over there, away from both of us). In a kitchen where every cook has a station, those three words are a map — and a cook describing the wrong station gives himself away.",
        entries: [
          { spanish: "este / esta", english: "this one, right here" },
          { spanish: "ese / esa", english: "that one, near you" },
          { spanish: "aquel / aquella", english: "that one over there" },
          { spanish: "estos / estas", english: "these" },
        ],
        production: {
          instruction: "Thirty seconds. Point at three things at three distances and name them.",
          say: "Este… ese… aquel…",
        },
      },
      {
        eyebrow: "Herramienta 2 · Assignments",
        headline: "TENER QUE + Infinitive = What You Are Obligated to Do",
        situation:
          "Nobody in a professional kitchen says what they want to do. They say what they have to do. Every cook you interview will start a sentence with tengo que, and every one of those is a checkable claim.",
        entries: [
          { spanish: "tener que + infinitivo", english: "to have to do something" },
          { spanish: "tengo que…", english: "I have to…", note: "Tengo que limpiar estas verduras." },
          { spanish: "tiene que…", english: "he/she has to…" },
          { spanish: "tenemos que…", english: "we have to…" },
        ],
      },
      {
        eyebrow: "Herramienta 3 · Verbs That Change Inside",
        headline: "Querer, Poder, Preferir, Volver",
        situation:
          "Some verbs change their middle when you conjugate them: querer becomes quiero, poder becomes puedo. Listen for the difference between what a cook HAS to do and what he WANTS to do — the gap between those two is where you find your man.",
        entries: [
          { spanish: "querer → quiero", english: "to want → I want" },
          { spanish: "poder → puedo", english: "to be able → I can" },
          { spanish: "preferir → prefiero", english: "to prefer → I prefer" },
          { spanish: "volver → vuelvo", english: "to return → I return" },
        ],
      },
      {
        eyebrow: "Herramienta 4 · The Kitchen",
        headline: "You Cannot Catch a Cook Without the Ingredients",
        situation:
          "Every alibi in this case is made of food. When a cook tells you what he was handling, you need to know instantly whether it belongs to his station or somebody else's.",
        entries: [
          { spanish: "el maíz", english: "corn" },
          { spanish: "la papa", english: "potato" },
          { spanish: "el pollo", english: "chicken" },
          { spanish: "la cebolla", english: "onion" },
          { spanish: "las especias", english: "spices" },
          { spanish: "la receta", english: "the recipe" },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa sends you to Cartagena. Everything after this is in Spanish." },
        { label: "Vocabulario", text: "Match the phrases — food, demonstratives, tener que." },
        { label: "Construye", text: "Build sentences. This is how you state an assignment." },
        { label: "Escucha", text: "A kitchen microphone. No subtitles, three replays." },
        { label: "Interrogatorios", text: "Four cooks, one at a time. Ask what each had to do." },
        { label: "El Registro", text: "Read the morning's prep sheet. Compare it to what they told you." },
        { label: "La Rueda", text: "Four cooks. One of them described the wrong station." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: is a family recipe something a person owns, or something they are just holding for the next generation?",
      followups: [
        "Does it change your answer if they sell it?",
      ],
    },

    closer: "El caso está abierto. ¡Buena suerte, agente!",

    teacherNote:
      "Run immediately before students open Caso 6. The spine is that este/ese/aquel is not decorative grammar — it is the murder weapon. Four cooks describe what they touched, and the guilty one describes ingredients from a station that is not his; students literally cannot solve the case without the three-way distance distinction that English does not have. Do the pointing production beat, it takes thirty seconds and it makes the three distances physical. The stakes slide argues that the unwritten part of a recipe is the real thing — that is a different argument from Caso 1's intangible-heritage slide, so if you taught Caso 1, the two are worth contrasting out loud. Watch the ESTO ES REAL stamps: the restaurant, Chef Valentina, and the four cooks are invented, while ajiaco's ingredients, guascas, Cartagena's 1533 founding and UNESCO listing, the biodiversity claim, and García Márquez are real. The regional point matters and heritage speakers will confirm it: ajiaco is bogotano, and the case is set on the Caribbean coast. Use NÚCLEO to drop the country slide if short.",
  },

  7: {
    hook: "Nothing has been stolen yet. It is happening right now, while you watch.",

    crime: {
      eyebrow: "El Crimen",
      headline: "This One Is Still in Progress",
      body: [
        "Every other case this year began with something already gone. This one has not finished yet. Somebody is sabotaging the sound equipment at the Festival de Viña del Mar this afternoon — cutting into cables, mixing something into the main rig — and he is doing it while you read this.",
        "He is a technician, which means he is allowed to be standing next to the equipment. Nobody will stop him. The security cameras are rotating through dozens of angles and the show starts soon.",
        "That is why every sentence in this case is built the same way: está saliendo, está escribiendo, está saboteando. Not what he did. What he is doing.",
      ],
      pull: "You are not reconstructing a crime. You are watching one.",
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Amenazado · What Is at Stake",
        headline: "A Concert Only Exists Once",
        body: [
          "There is no object to recover here. Nothing will end up in a private vault. If the saboteur succeeds, what is destroyed is one night — a performance that thousands of people in the amphitheatre and millions watching across Latin America were going to share at the same moment, and that will never happen again in that form.",
          "Bands rehearse for months for a slot at this festival. Careers turn on it. A cut cable does not steal a thing; it steals an evening that was supposed to belong to everyone at once.",
        ],
        facts: [
          { label: "El objetivo", value: "Los equipos de sonido del escenario principal" },
          { label: "Cuándo", value: "Esta tarde — ahora mismo" },
          { label: "El método", value: "Cables cortados, equipo manipulado" },
          { label: "El uniforme", value: "Los técnicos honestos llevan azul" },
        ],
        real: false,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "Chile",
        body: [
          "Chile is over 4.000 kilometres long and almost nowhere more than 200 wide — a country shaped like a ribbon down the edge of a continent. It holds the driest desert on Earth in the north, the Atacama, where some weather stations have never recorded rain, and glaciers and fjords in the Patagonian south.",
          "It is also a country of poets. Pablo Neruda and Gabriela Mistral both won the Nobel Prize in Literature, and Mistral won it first — in 1945, the first Latin American writer of any gender to do so.",
        ],
        facts: [
          { label: "Capital", value: "Santiago" },
          { label: "Población", value: "~19 million" },
          { label: "Moneda", value: "el peso chileno" },
          { label: "Largo", value: "~4.300 km norte a sur" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "El Evento · The Festival",
        headline: "Viña del Mar y el Monstruo",
        body: [
          "You are on the Pacific coast, at the biggest music festival in Latin America. It has run since 1960 in an outdoor amphitheatre called the Quinta Vergara, and winners are handed a silver or gold seagull — la Gaviota — because the sea is right there.",
          "One thing you need to understand before you go in. The Viña audience is called el Monstruo, the Monster, and it earned the name: it will boo a famous act off the stage without apology and it has ended careers in ten minutes. Performing here is genuinely dangerous, which is exactly why winning here means so much.",
          "And check the date. February at this festival is high summer — you are south of the equator now, and the seasons are inverted.",
        ],
        facts: [
          { label: "Desde", value: "1960" },
          { label: "El lugar", value: "Quinta Vergara, Viña del Mar" },
          { label: "El premio", value: "La Gaviota de Plata y de Oro" },
          { label: "El público", value: "'El Monstruo'" },
          { label: "La estación", value: "Febrero = verano en Chile" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "Live Is the Whole Point",
      body: [
        "Everything else in this season could, in principle, be recovered. A guitar can be found. A painting can be returned. A recipe can be re-photographed.",
        "A live performance cannot be given back. The reason people fly across a continent to sit in the Quinta Vergara instead of watching a video is that everyone in it is having the same experience at the same second, and that is the thing a cut cable destroys.",
      ],
      pull: "You can return an object. Nobody can return a night.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · Right Now",
        headline: "ESTAR + -ANDO / -IENDO",
        situation:
          "This is the tense for things happening at this exact second, and this whole case lives in it. Take estar, then add -ando to -AR verbs and -iendo to -ER and -IR verbs. Every camera feed you watch will be described this way.",
        entries: [
          { spanish: "está saliendo", english: "he is leaving (right now)" },
          { spanish: "está escribiendo", english: "he is writing" },
          { spanish: "está cantando", english: "she is singing" },
          { spanish: "está tocando", english: "he is playing (an instrument)" },
          { spanish: "estoy mirando", english: "I am watching" },
        ],
        production: {
          instruction: "Thirty seconds. Look around the room and describe two people out loud.",
          say: "Está escribiendo. / Está hablando.",
        },
      },
      {
        eyebrow: "Herramienta 2 · Who Is Who Backstage",
        headline: "Everyone Here Has a Job",
        situation:
          "Your suspects are not students or relatives this time. They are professionals, and each one's job is their alibi: a singer on stage in front of thousands cannot also be behind it. Learn the job titles and half the cast eliminates itself.",
        entries: [
          { spanish: "el / la cantante", english: "singer" },
          { spanish: "el / la guitarrista", english: "guitarist" },
          { spanish: "el bailarín / la bailarina", english: "dancer" },
          { spanish: "el / la periodista", english: "journalist" },
          { spanish: "el actor / la actriz", english: "actor / actress" },
        ],
      },
      {
        eyebrow: "Herramienta 3 · Positions",
        headline: "Ordinals Are Camera Coordinates",
        situation:
          "You will be watching surveillance feeds with several people in frame, and witnesses will place someone by position rather than by name. First, second, third from the left. Miss the ordinal and you are watching the wrong person.",
        entries: [
          { spanish: "primero / primera", english: "first" },
          { spanish: "segundo / segunda", english: "second" },
          { spanish: "tercero / tercera", english: "third" },
          { spanish: "cuarto / cuarta", english: "fourth" },
          { spanish: "quinto / quinta", english: "fifth" },
        ],
      },
      {
        eyebrow: "Herramienta 4 · Weather and Season",
        headline: "It Is Summer and the Wind Comes Off the Pacific",
        situation:
          "Witnesses will describe an outdoor amphitheatre on a hot, windy afternoon. These are also the phrases that tell you it is February in the southern hemisphere — worth noticing, since it is the opposite of what your calendar says.",
        entries: [
          { spanish: "hace sol", english: "it's sunny" },
          { spanish: "hace viento", english: "it's windy" },
          { spanish: "hace calor", english: "it's hot" },
          { spanish: "el verano", english: "summer", note: "February in Chile." },
          { spanish: "el invierno", english: "winter", note: "July in Chile." },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa sends you to the festival. Everything after this is in Spanish." },
        { label: "Vocabulario", text: "Match the phrases — professions, weather, ordinals." },
        { label: "El Testigo", text: "Read an eyewitness transcript, written as it happens." },
        { label: "Escucha", text: "A witness at the festival. No subtitles, three replays." },
        { label: "Construye", text: "Build sentences in estar + -ando. This is how you report live." },
        { label: "Vigilancia", text: "Live stakeout. Cameras rotate, the clock runs, you pick the feed." },
        { label: "La Rueda", text: "Four people. Three of them were visibly somewhere else." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: the Viña audience, el Monstruo, will boo a famous performer off the stage. Is that fair?",
      followups: [
        "What does a crowd owe a performer — and what does a performer owe a crowd?",
      ],
    },

    closer: "¡Corre, agente! Las cámaras están rotando.",

    teacherNote:
      "Run immediately before students open Caso 7. The spine is the tense: this is the only case in the season where the crime has not finished, which is exactly why the grammar is the present progressive. Say that connection out loud — estar + -ando stops being a form to memorise and becomes the only way to report something you are watching. The live-stakeout stage is timed and rotates camera feeds, so students who cannot decode 'está saliendo' at speed will miss it; the production beat is worth doing twice. The southern-hemisphere seasons point (February = summer) reliably surprises students and is genuinely useful all year. Watch the ESTO ES REAL stamps: the saboteur and the four suspects are invented, while the festival's 1960 founding, the Quinta Vergara, la Gaviota, el Monstruo, Neruda and Mistral, and the Atacama are real. Gabriela Mistral won the Nobel before Neruda and is usually the less-known name — worth the extra ten seconds. The discussion prompt is the most argumentative one in the season and works well with a quick hands-up split before the turn-and-talk. Use NÚCLEO to drop the country slide if short.",
  },

  8: {
    hook: "This one already happened. Yesterday. And that changes every verb you own.",

    crime: {
      eyebrow: "El Crimen",
      headline: "You Are a Day Late",
      body: [
        "Yesterday morning, somewhere between eight and ten, pre-Columbian gold figurines disappeared from Don Aurelio's stall in the Mercado de San Pedro in Cusco. The thief is long gone. The market has been swept, restocked, and reopened.",
        "Everything you have done this year, you did in the present: the suspect IS tall, he IS leaving, he IS nervous. None of that works today. Nobody is doing anything — they already did it.",
        "Witnesses remember who arrived when, who said what to whom, and who left with what. To take that statement you need a tense you have never used: el pretérito. Llegué, llegaste, llegó.",
      ],
      pull: "The hardest thing about this case is not the thief. It is the tense.",
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "Las Figurillas de Oro",
        body: [
          "Small pre-Columbian gold figures, kept by Don Aurelio at a market stall rather than in a museum — which is more normal than it sounds, and is part of why they were taken.",
          "A collector offered him money for them. He said no. They were gone within two hours.",
        ],
        facts: [
          { label: "Qué", value: "Figurillas de oro precolombinas" },
          { label: "Dónde", value: "El puesto de Don Aurelio" },
          { label: "Cuándo", value: "Ayer, entre las 8:00 y las 10:00" },
          { label: "El mercado", value: "Mercado de San Pedro, Cusco" },
        ],
        real: false,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "Perú",
        body: [
          "Spanish is not the only official language here. Quechua, the language of the Inca empire, is co-official and is spoken by millions of people across the Andes today — this is a living language, not a historical one. You already use Quechua words without knowing it: cóndor, puma, llama, quinua, and pampa all came into English through Spanish from Quechua.",
          "Peru is also where the potato comes from. Not figuratively — there are thousands of native varieties grown in the Andes, in colours and shapes no supermarket has ever carried.",
        ],
        facts: [
          { label: "Capital", value: "Lima" },
          { label: "Población", value: "~34 million" },
          { label: "Idiomas", value: "Español, quechua, aimara" },
          { label: "La papa", value: "Thousands of native Andean varieties" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "La Ciudad · The City",
        headline: "Cusco",
        body: [
          "You are working at 3.400 metres, high enough that you will feel the altitude walking uphill. Cusco was the capital of the Inca empire — the name comes from Qosqo, and the city was laid out as its centre.",
          "Look down at the walls as you walk. The bottom few metres of many buildings are Inca stonework: enormous blocks cut so precisely that they hold together with no mortar at all, with Spanish colonial construction sitting on top. Earthquakes have repeatedly brought down the upper storeys and left the Inca foundations untouched.",
          "The Mercado de San Pedro is a working market, not a tourist exhibit — people buy their week's food there.",
        ],
        facts: [
          { label: "Altitud", value: "~3.400 m" },
          { label: "Qosqo", value: "Capital of the Inca empire" },
          { label: "Patrimonio", value: "UNESCO World Heritage, 1983" },
          { label: "Los muros", value: "Mortarless Inca stone under colonial walls" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "An Object Without Its Story Is Just Gold",
      body: [
        "Looting of pre-Columbian sites is a real and ongoing problem across Peru, and the country works constantly to get trafficked objects back — thousands have been repatriated from private collections and foreign museums.",
        "Here is what archaeologists say gets destroyed, and it is not the object. It is the information. A figurine dug up carefully tells you who made it, when, where it sat, what was buried beside it. The same figurine ripped out and sold tells you nothing at all. It stops being evidence and becomes decoration.",
        "That is why this theft matters more than the metal is worth. The gold survives the robbery. The history does not.",
      ],
      pull: "You can melt gold down and still have gold. You cannot melt down a story and get it back.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · The Past Tense",
        headline: "EL PRETÉRITO — What Happened and Finished",
        situation:
          "This is the big one, and it is new. The preterite is for actions that started and ended: he arrived, she bought, they left. For -AR verbs the endings are the pattern below. Learn this shape and you can take a statement about yesterday.",
        entries: [
          { spanish: "llegué", english: "I arrived", note: "Note the accent — it is on the last syllable." },
          { spanish: "llegaste", english: "you arrived" },
          { spanish: "llegó", english: "he / she arrived", note: "Accent again. Sin acento, 'llego' means 'I arrive'." },
          { spanish: "llegamos", english: "we arrived" },
          { spanish: "llegaron", english: "they arrived" },
        ],
        production: {
          instruction: "Thirty seconds, partners. Answer in the preterite — something that finished.",
          say: "¿Qué compraste ayer? — Compré ______.",
        },
      },
      {
        eyebrow: "Herramienta 2 · To Whom",
        headline: "ME, TE, LE, LES",
        situation:
          "Half of what witnesses remember is who said or gave something to whom. Spanish marks that with a separate little word: 'Le ofreció dinero' — he offered money TO HIM. Miss the le and you lose track of who is talking to whom.",
        entries: [
          { spanish: "me", english: "to me", note: "Me dijo — he told me." },
          { spanish: "te", english: "to you" },
          { spanish: "le", english: "to him / to her / to you (formal)", note: "Le ofreció — he offered to him." },
          { spanish: "les", english: "to them" },
        ],
      },
      {
        eyebrow: "Herramienta 3 · Comparisons",
        headline: "Nobody Remembers a Height. They Remember Who Was Taller.",
        situation:
          "Witnesses are terrible at numbers and excellent at comparisons. Not 'he was 1,85 m' but 'he was taller than Don Aurelio'. Comparisons are how a market full of people gets sorted into an order.",
        entries: [
          { spanish: "más… que", english: "more … than", note: "Más alto que Don Aurelio." },
          { spanish: "menos… que", english: "less … than" },
          { spanish: "tan… como", english: "as … as", note: "Tan grande como un costal." },
          { spanish: "mejor / peor", english: "better / worse" },
          { spanish: "el mayor / la mayor", english: "the oldest / the biggest" },
        ],
      },
      {
        eyebrow: "Herramienta 4 · The Market",
        headline: "A Real Market, Not a Gift Shop",
        situation:
          "The Mercado de San Pedro is where people buy food. Witnesses will place each other by what they were buying and which section they were standing in.",
        entries: [
          { spanish: "el puesto", english: "the stall" },
          { spanish: "la quinoa", english: "quinoa" },
          { spanish: "el maíz", english: "corn" },
          { spanish: "las especias", english: "spices" },
          { spanish: "los frijoles", english: "beans" },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa warns you: this case is in the past tense." },
        { label: "Vocabulario", text: "Match the phrases — market words, comparisons, pronouns." },
        { label: "El Informe", text: "Read the report of what happened yesterday morning." },
        { label: "Escucha", text: "A vendor's testimony. No subtitles, three replays." },
        { label: "Don Aurelio", text: "Interview the man whose stall was robbed." },
        { label: "Construye", text: "Build sentences in the preterite. State what happened." },
        { label: "La Rueda", text: "Four suspects. Arrival times and heights decide it." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: a museum in another country has an object that was dug up and taken a century ago. Should it be given back?",
      followups: [
        "Does it matter whether it was bought, or taken?",
      ],
    },

    closer: "El caso está abierto. Buena suerte, agente.",

    teacherNote:
      "Run immediately before students open Caso 8. This is the semester's hardest jump and the deck says so on purpose: every previous case happened in the present, and this one happened yesterday, so the preterite is not a new chapter but a new job requirement. Spend real time on the accent marks — llegó vs llego is the difference between 'he arrived' and 'I arrive', and students will meet both in the same paragraph. The stakes slide carries the argument worth keeping: looting destroys information, not just objects, and an artifact without context stops being evidence. That sets up the discussion prompt, which is the most genuinely contested question in the season — students split, and both sides have real arguments. Budget the full three minutes. Watch the ESTO ES REAL stamps: Don Aurelio, the figurines, and the suspects are invented, while Quechua's official status and living speakers, the Quechua loanwords, Andean potato varieties, Cusco's altitude and mortarless Inca walls, and Peru's repatriation work are real. Say plainly that Quechua is spoken today — students often assume Inca means extinct. Use NÚCLEO to drop the country slide if short.",
  },

  9: {
    hook: "The thief walked into a clinic and pretended to be sick. Your job is to work out who was faking.",

    crime: {
      eyebrow: "El Crimen",
      headline: "Everyone in the Waiting Room Had a Reason to Be There",
      body: [
        "Clínica Santa Bárbara, in the Zona Colonial of Santo Domingo. Yesterday morning, between nine and ten, El Taíno de Madera disappeared from its display case in the waiting area.",
        "The clinic was full. That is the problem. Every person near that case had a perfectly good reason to be sitting next to it: they were waiting to be seen. A stranger loitering by a display case is suspicious. A patient with a stomach ache is not.",
        "One of them was not sick. Everything you need is in what each of them said hurt, and whether they behaved like it did.",
      ],
      pull: "The perfect disguise in a clinic is a symptom.",
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "El Taíno de Madera",
        body: [
          "A carved wooden figure of a Taíno healer, held by the clinic and shown in the waiting room — a doctor's office displaying an image of the island's older idea of a healer.",
          "It is not gold and it is not large. It is a national treasure because of whose it is.",
        ],
        facts: [
          { label: "Qué", value: "Una figura de madera de un sanador taíno" },
          { label: "Dónde", value: "La vitrina de la sala de espera" },
          { label: "Cuándo", value: "Ayer, entre las 9:00 y las 10:00" },
        ],
        real: false,
      },
      {
        eyebrow: "El Contexto · The Real Thing",
        headline: "You Already Speak Taíno",
        body: [
          "The Taíno were the people living across the Caribbean when Europeans arrived in 1492. You have been told, probably, that they disappeared. That is not quite what happened, and the evidence is in your own mouth.",
          "Hurricane, canoe, hammock, barbecue, tobacco, iguana, savanna — all of them are Taíno words that entered English through Spanish. And genetic studies of people in the Dominican Republic and Puerto Rico today consistently find Indigenous Caribbean ancestry. Taíno heritage is present in the language, the food, and the people of these islands right now.",
        ],
        facts: [
          { label: "huracán", value: "hurricane" },
          { label: "canoa", value: "canoe" },
          { label: "hamaca", value: "hammock" },
          { label: "barbacoa", value: "barbecue" },
          { label: "iguana", value: "iguana" },
        ],
        real: true,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "República Dominicana",
        body: [
          "You are on Hispaniola, the island the Dominican Republic shares with Haiti — two countries, two languages, one island. This is also the country that gave the world merengue and bachata, both of which UNESCO has added to its Intangible Cultural Heritage list, merengue in 2016 and bachata in 2019.",
          "If the Spanish sounds fast to you here, you are not imagining it. Caribbean Spanish often drops the s at the end of syllables — 'má o meno' for 'más o menos' — which is one reason this case's listening stage gives you three replays.",
        ],
        facts: [
          { label: "Capital", value: "Santo Domingo" },
          { label: "Población", value: "~11 million" },
          { label: "Moneda", value: "el peso dominicano" },
          { label: "Patrimonio", value: "Merengue (2016) y bachata (2019)" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "La Ciudad · The City",
        headline: "La Zona Colonial",
        body: [
          "You are walking through the oldest continuously inhabited European-founded city in the Americas. Santo Domingo was established in 1498, and its Zona Colonial holds the first cathedral and the first university built in the hemisphere — the university dates to 1538.",
          "It is a UNESCO World Heritage Site, and it is also a normal neighbourhood where people live, run clinics, and hang laundry between five-hundred-year-old walls.",
        ],
        facts: [
          { label: "Fundada", value: "1498" },
          { label: "Primera catedral", value: "de las Américas" },
          { label: "Primera universidad", value: "1538" },
          { label: "Patrimonio", value: "UNESCO World Heritage, 1990" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "Stealing From People Who Were Told They No Longer Exist",
      body: [
        "The standard story is that the Taíno vanished. Their descendants in the Caribbean have spent generations being told that their heritage is a museum category rather than a living inheritance.",
        "So a carved Taíno healer is not simply an old object. It is one of a limited number of physical things that survive from a people whose existence is still argued about — and it was sitting in a clinic, where people came to be healed, which is not an accident.",
        "Take it out of that room and put it in a private collection, and you have removed one more piece of the evidence that they were here.",
      ],
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · The Body",
        headline: "You Cannot Check an Alibi You Cannot Name",
        situation:
          "Every suspect in this case claims something hurts. To catch the one who is lying you first have to know exactly what they are claiming.",
        entries: [
          { spanish: "la cabeza", english: "head" },
          { spanish: "el estómago", english: "stomach" },
          { spanish: "la espalda", english: "back" },
          { spanish: "la pierna", english: "leg" },
          { spanish: "el brazo", english: "arm" },
          { spanish: "el pie", english: "foot" },
        ],
      },
      {
        eyebrow: "Herramienta 2 · The Strange Verb",
        headline: "DOLER Agrees With the Body Part, Not With You",
        situation:
          "This verb works backwards from English. You do not say 'I hurt my head'. You say the head is hurting TO ME. And because the head is doing the verb, it changes with the body part — one thing, duele; two things, duelen.",
        entries: [
          { spanish: "me duele la cabeza", english: "my head hurts", note: "One body part → duele." },
          { spanish: "me duelen los pies", english: "my feet hurt", note: "Two body parts → duelen." },
          { spanish: "le duele el estómago", english: "his/her stomach hurts" },
          { spanish: "tener dolor de…", english: "to have a … ache", note: "Tengo dolor de cabeza. Easier, same meaning." },
        ],
        production: {
          instruction: "Thirty seconds. Answer honestly — and watch duele vs duelen.",
          say: "¿Qué te pasa? — Me duele ______.",
        },
      },
      {
        eyebrow: "Herramienta 3 · The Clinic",
        headline: "Who Works Here and Who Is Waiting",
        situation:
          "A clinic is full of people with official reasons to be there. Knowing the roles lets you sort staff from patients — and one of your suspects is neither.",
        entries: [
          { spanish: "el doctor / la doctora", english: "doctor" },
          { spanish: "el enfermero / la enfermera", english: "nurse" },
          { spanish: "la medicina", english: "medicine" },
          { spanish: "la pastilla", english: "pill" },
          { spanish: "la receta", english: "prescription" },
          { spanish: "la cita", english: "appointment" },
        ],
      },
      {
        eyebrow: "Herramienta 4 · The Question a Doctor Asks",
        headline: "¿Qué Te Pasa?",
        situation:
          "'What's happening to you?' is how you open every interview in this case. The answers are where the lie lives — because a person inventing an illness has to keep describing it consistently, and real pain and invented pain do not behave the same way.",
        entries: [
          { spanish: "¿qué te pasa?", english: "what's wrong / what's happening to you?" },
          { spanish: "estar enfermo / enferma", english: "to be sick" },
          { spanish: "la fiebre", english: "fever", note: "Measurable. Hard to fake." },
          { spanish: "el dolor", english: "pain", note: "Not measurable. Easy to fake." },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa sends you to the Zona Colonial. Everything after this is in Spanish." },
        { label: "Vocabulario", text: "Match the phrases — body, health, doler." },
        { label: "El Informe", text: "Read what happened in the waiting room yesterday." },
        { label: "Escucha", text: "A witness account. Fast Caribbean Spanish, three replays." },
        { label: "La Doctora", text: "Interview Doctora Méndez. She examined all of them." },
        { label: "Construye", text: "Build sentences with doler and tener dolor de." },
        { label: "La Rueda", text: "Four patients. One of them was never sick." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: hurricane, canoe, hammock, barbecue — all Taíno words you use in English. Why do you think nobody ever told you that?",
      followups: [
        "What else might be around you from people you were taught had disappeared?",
      ],
    },

    closer: "El caso está abierto. Buena suerte, agente.",

    teacherNote:
      "Run immediately before students open Caso 9. Two spines here. Grammatically: doler runs backwards from English — the body part does the verb, so duele/duelen changes with the body part and not with the person. Students who miss that will mis-hear every suspect statement. Thematically: the artifact slide and the discussion prompt are the strongest cultural moment in the semester. Read the Taíno loanword list out loud and let the room sit with it; most students have never been told that 'hurricane' and 'barbecue' are Indigenous Caribbean words, and the realisation lands hard. Be careful and accurate on framing: do not say the Taíno 'died out'. The deck deliberately says heritage persists in the language, the food, and the ancestry of Dominicans and Puerto Ricans today, and that is well supported. If you have Caribbean students, this deck is about their inheritance — let them talk. Watch the ESTO ES REAL stamps: the clinic, the figure, and the patients are invented, while the loanwords, the 1498 founding, the 1538 university, the UNESCO listings for merengue and bachata, and the s-dropping in Caribbean Spanish are real. Mention the s-dropping before the listening stage; it explains the difficulty rather than letting students conclude they are bad at listening. Use NÚCLEO to drop the country slide if short.",
  },

  10: {
    hook: "Everyone at the expo was talking about the future. One of them was lying about his.",

    crime: {
      eyebrow: "El Crimen",
      headline: "Your Last Case of the Semester",
      body: [
        "La Expo del Futuro, at a university in Quito. Students and inventors are presenting the things they are going to build — a robot that cleans Andean rivers, an AI for hospitals, a solar screen.",
        "In a display case in the middle of all that future sits something very old: a Montecristi toquilla-straw hat, woven by hand. An hour ago it stopped being in the case.",
        "Every person in that hall stood up and described their plans. One of them registered no project at all and said only that he was going to be rich soon. In a room where everyone is talking about the future, the giveaway is the person whose future has no details in it.",
      ],
      pull: "Everyone described what they will build. One man described only what he will have.",
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "El Sombrero de Paja Toquilla",
        body: [
          "Here is the thing almost nobody outside Ecuador knows: the Panama hat is not from Panama. It is Ecuadorian, it always has been, and the finest ones come from Montecristi.",
          "It is woven by hand from toquilla straw. The best weavers work at dawn and after dusk, because the straw has to stay damp and pliable and midday sun ruins it. A superfino can take months of work by one person and the weave can be fine enough to look like cloth.",
          "In 2012 UNESCO added the weaving of the Ecuadorian toquilla hat to its Intangible Cultural Heritage list. The hat in that case was not a souvenir. It was the output of a skill.",
        ],
        facts: [
          { label: "De dónde", value: "Montecristi, Ecuador — not Panama" },
          { label: "Material", value: "Paja toquilla" },
          { label: "Un superfino", value: "Months of work, by one weaver" },
          { label: "Se teje", value: "Al amanecer y al anochecer — never midday" },
          { label: "Patrimonio", value: "UNESCO Intangible Heritage, 2012" },
        ],
        real: true,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "Ecuador",
        body: [
          "The country is named after the line that runs through it. You can stand north of Quito with one foot in each hemisphere, and the Galápagos Islands off the coast are where Darwin worked out what he worked out.",
          "Ecuador also did something in 2008 that no country had done before: it wrote rights for nature directly into its constitution — rivers and forests as entities with legal standing rather than as property. Whatever you think of it, it is a genuinely new idea and it started here.",
        ],
        facts: [
          { label: "Capital", value: "Quito" },
          { label: "Población", value: "~18 million" },
          { label: "Moneda", value: "US dollar" },
          { label: "Idiomas", value: "Español, kichwa, shuar" },
          { label: "2008", value: "First country to give nature constitutional rights" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "La Ciudad · The City",
        headline: "Quito",
        body: [
          "You are at 2.850 metres, in one of the highest capital cities in the world, in a valley with volcanoes on both sides. Take the stairs slowly for the first day; everyone does.",
          "Quito's old town is one of the best-preserved colonial centres in the Americas, and it holds a distinction almost no city has: in 1978, when UNESCO created the World Heritage list, Quito was on the very first set of sites ever inscribed. There were twelve. It was one of them.",
        ],
        facts: [
          { label: "Altitud", value: "~2.850 m" },
          { label: "Patrimonio", value: "One of the first 12 World Heritage Sites, 1978" },
          { label: "La mitad del mundo", value: "The equator runs just north of the city" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "The Name Was Stolen First",
      body: [
        "Ecuadorian hats were shipped out through Panama, so that is where buyers thought they came from. In 1906 Theodore Roosevelt was photographed wearing one at the Panama Canal, the photo travelled the world, and the name stuck permanently.",
        "So for over a century the most famous hat on Earth has been credited to the wrong country. The weavers in Montecristi kept weaving, and the money and the fame went to a name that was never theirs.",
        "Which makes this the second theft, not the first. Somebody took the hat out of a case tonight. Somebody took the credit a hundred and twenty years ago.",
      ],
      pull: "You can steal an object in one night. Stealing where it comes from takes a century, and it works better.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · The Easy Future",
        headline: "IR A + Infinitive",
        situation:
          "The simplest way to talk about the future in Spanish is the same as English's 'going to': take ir, add a, add the plain verb. Every inventor at this expo will use it to describe their plans, and one of them will use it to describe nothing at all.",
        entries: [
          { spanish: "voy a…", english: "I'm going to…" },
          { spanish: "vas a…", english: "you're going to…" },
          { spanish: "va a…", english: "he/she is going to…" },
          { spanish: "vamos a…", english: "we're going to…" },
        ],
        production: {
          instruction: "Thirty seconds, partners. Answer for real.",
          say: "¿Qué vas a hacer este fin de semana? — Voy a ______.",
        },
      },
      {
        eyebrow: "Herramienta 2 · The Formal Future",
        headline: "One Ending, Every Verb",
        situation:
          "There is a second future tense, and it is easier than the present. You do not change the verb at all — you glue an ending onto the whole infinitive. Same endings for -AR, -ER and -IR. Every form carries an accent except nosotros.",
        entries: [
          { spanish: "seré", english: "I will be", note: "ser + é" },
          { spanish: "tendré", english: "I will have" },
          { spanish: "estudiaré", english: "I will study" },
          { spanish: "trabajarás", english: "you will work" },
          { spanish: "-é · -ás · -á · -emos · -án", english: "the whole pattern" },
        ],
      },
      {
        eyebrow: "Herramienta 3 · What They Will Be",
        headline: "Professions Are Claims You Can Check",
        situation:
          "Everyone here says what they are going to become. A claimed profession comes with a claimed project, a claimed university, a claimed plan — which means it can be verified, or fail to be.",
        entries: [
          { spanish: "el ingeniero / la ingeniera", english: "engineer" },
          { spanish: "el médico / la médica", english: "doctor" },
          { spanish: "el programador / la programadora", english: "programmer" },
          { spanish: "el científico / la científica", english: "scientist" },
          { spanish: "el empresario / la empresaria", english: "businessperson" },
          { spanish: "el / la periodista", english: "journalist" },
        ],
      },
      {
        eyebrow: "Herramienta 4 · What They Will Build",
        headline: "A Plan Has Nouns in It",
        situation:
          "A real plan is specific. Listen for whether a suspect names an actual thing — an invention, an app, a project, a goal — or just gestures at being rich. Vagueness is the tell.",
        entries: [
          { spanish: "el invento", english: "invention" },
          { spanish: "el proyecto", english: "project" },
          { spanish: "la aplicación", english: "app" },
          { spanish: "la inteligencia artificial", english: "artificial intelligence" },
          { spanish: "la meta", english: "goal" },
          { spanish: "el sueño", english: "dream" },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa gives you your last case of the semester." },
        { label: "Vocabulario", text: "Match the phrases — professions, technology, the future." },
        { label: "El Programa", text: "Read the expo programme. Every inventor registered a project." },
        { label: "Escucha", text: "A guard's testimony. No subtitles, three replays." },
        { label: "La Directora", text: "Interview Directora Paredes. She knows who was on the list." },
        { label: "Construye", text: "Build sentences in the future. State what each one claimed." },
        { label: "La Rueda", text: "Four people. Three described a future with details in it." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: the world calls it a Panama hat. Ecuador has been correcting people for over a century and it has not worked. Does it matter what a thing is called?",
      followups: [
        "Can you think of something else that is famous under the wrong name?",
      ],
    },

    closer: "Tu último caso, agente. El caso está abierto.",

    teacherNote:
      "Run immediately before students open Caso 10, the last case of the semester — the deck says so and that framing is worth using. The spine is that everyone at the expo describes their future, so the future tense is literally how suspects incriminate themselves: a real plan has nouns in it, and the thief's has none. The Panama hat fact is the single best hook in the semester; ask the class where the Panama hat comes from BEFORE you advance to the artifact slide and let them be wrong. The stakes slide then reframes the whole case — the object was stolen tonight, the credit was stolen in 1906 — which is a genuinely sophisticated idea that 9th graders get immediately. Note this artifact slide is stamped ESTO ES REAL, unlike other cases, because the toquilla hat is real; only the expo and the suspects are invented. Also real: the 2012 UNESCO listing, Quito's altitude, Quito being among the first twelve World Heritage Sites in 1978, and Ecuador's 2008 constitutional rights of nature. The simple future is easier than students expect — one ending set for all three verb families — so lead with that reassurance. Use NÚCLEO to drop the country slide if short.",
  },

  11: {
    hook: "The thief got there first. Not to the museum — to the year 750.",

    crime: {
      eyebrow: "El Crimen",
      headline: "You Are Not Chasing Him Across a City. You Are Chasing Him Across Time.",
      body: [
        "Everything changes with this case. The Liga Sombra has built a time machine, because a thief called El Cronista has worked out something worse than robbing museums: he goes back and takes each treasure before it ever becomes a country's heritage. If he wins, the object does not get stolen from history. It never enters history at all.",
        "Your first jump is Copán, Honduras, in the year 750. The Maya city is at its height. Scribes are carving, the plaza is full, and a stela of the king stands covered in glyphs.",
        "One of those glyphs will be gone by morning unless you find him. And he is easy to spot if you know what to look for: he is a foreigner in every era he visits, and he does not know how to work like the people around him.",
      ],
      pull: "He does not steal from museums. He steals from the past, before the museum exists.",
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "Un Glifo de la Estela del Rey",
        body: [
          "Not the whole monument — one carved glyph block out of the king's stela. A single sign, prised out in the dark.",
          "One stone. Which sounds survivable, until you know what a Maya inscription actually is.",
        ],
        facts: [
          { label: "Qué", value: "Un glifo sagrado" },
          { label: "De dónde", value: "La estela del rey, Copán" },
          { label: "Cuándo", value: "Año 750 — de noche" },
        ],
        real: false,
      },
      {
        eyebrow: "El Contexto · The Real Thing",
        headline: "Maya Writing Is Real Writing",
        body: [
          "The Maya built the only fully developed writing system in the ancient Americas — not pictures that suggest ideas, but a real script that records spoken language, sign by sign, with signs for whole words and signs for syllables. It can be read today. Most of the decipherment happened within the last sixty years.",
          "They also worked with a concept of zero and ran calendars accurate over enormous spans of time, centuries before either idea reached Europe.",
        ],
        facts: [
          { label: "La escritura", value: "Logosyllabic — words and syllables" },
          { label: "El cero", value: "Used centuries before it reached Europe" },
          { label: "Descifrada", value: "Largely within the last 60 years" },
          { label: "Copán", value: "UNESCO World Heritage, 1980" },
        ],
        real: true,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "Honduras",
        body: [
          "You are in western Honduras, near the Guatemalan border, in a green river valley that was one of the most important cities in the Maya world. Overhead you will hear scarlet macaws — guacamayas, Honduras's national bird — which nest around the ruins and which the Maya kept and carved.",
          "Copán is Honduras's great archaeological site and its most visited place. It is also, right now in the year you have landed in, simply a city where people live and work.",
        ],
        facts: [
          { label: "Capital", value: "Tegucigalpa" },
          { label: "Población", value: "~10.5 million" },
          { label: "Moneda", value: "el lempira" },
          { label: "Ave nacional", value: "La guacamaya roja" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "El Sitio · The Site",
        headline: "La Escalinata Jeroglífica",
        body: [
          "At Copán there is a stairway with writing carved into every step — sixty-three steps, roughly two thousand two hundred glyph blocks. It is the longest Maya inscription that exists anywhere, a dynasty's history written into a staircase.",
          "And we cannot fully read it. Not because anyone stole it. In the early twentieth century it was collapsing, and the blocks were gathered up and reassembled — largely in the wrong order. The stones are all still there. The sentence is not.",
        ],
        facts: [
          { label: "Escalones", value: "63" },
          { label: "Bloques de glifos", value: "~2.200" },
          { label: "Récord", value: "The longest known Maya inscription" },
          { label: "El problema", value: "Reassembled out of order — the text is scrambled" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "One Stone Is One Word",
      body: [
        "The Hieroglyphic Stairway is the proof of what is at stake tonight. Every one of those blocks survived. Not one was stolen. And the text is still unreadable in sequence, because the ORDER was lost — which means a Maya inscription is not decoration where each piece is interchangeable. It is a sentence.",
        "So prising one glyph off a stela is not taking a stone. It is deleting a word out of a sentence nobody has finished reading yet, and there is no second copy anywhere on Earth.",
      ],
      pull: "Nobody stole the Hieroglyphic Stairway, and we still cannot read it. That is how fragile a sentence in stone is.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · The Rule of Time Travel",
        headline: "You Stand in 750 and You Speak in the Present",
        situation:
          "This is the rule that governs the whole second half of the year. You are in the past, but nobody around you thinks so — for them this is now. So you narrate everything in the present tense: the scribe carves, the sun rises, the stranger walks. Historians call this the historical present, and it is why your grammar does not have to change when the century does.",
        entries: [
          { spanish: "El escriba trabaja.", english: "The scribe works / is working." },
          { spanish: "El sol sale.", english: "The sun rises." },
          { spanish: "El forastero llega de noche.", english: "The stranger arrives at night." },
        ],
      },
      {
        eyebrow: "Herramienta 2 · The Three Families",
        headline: "-AR, -ER, -IR",
        situation:
          "Every Spanish verb belongs to one of three groups, named for their last two letters. This case is your consolidation of all three at once — you will describe an entire working city, and every job in it is a verb.",
        entries: [
          { spanish: "trabajar → trabaja", english: "to work → he works", note: "-AR" },
          { spanish: "aprender → aprende", english: "to learn → he learns", note: "-ER" },
          { spanish: "vivir → vive", english: "to live → he lives", note: "-IR" },
          { spanish: "observar → observo", english: "to observe → I observe", note: "Your own job." },
        ],
        production: {
          instruction: "Thirty seconds, partners. One verb from each family, about a real person in this room.",
          say: "Trabaja. / Aprende. / Escribe.",
        },
      },
      {
        eyebrow: "Herramienta 3 · The City",
        headline: "What You Are Standing In",
        situation:
          "You need to be able to say where you are and what you are looking at, because your witness statements are all about place — who is near the stela, who is up on the stairway, who is in the plaza after dark.",
        entries: [
          { spanish: "la estela", english: "the stela (carved standing stone)" },
          { spanish: "el glifo", english: "the glyph" },
          { spanish: "la pirámide", english: "the pyramid" },
          { spanish: "la escalera", english: "the stairway" },
          { spanish: "la plaza", english: "the plaza" },
          { spanish: "la piedra", english: "the stone" },
        ],
      },
      {
        eyebrow: "Herramienta 4 · The People",
        headline: "Everyone Here Has a Craft",
        situation:
          "In Copán, what you do is written on your hands. Scribes have paint on them, carvers have stone dust, traders have sun. That is the thread of this whole case — a person's work shows on their body, and a man who does no work here shows nothing at all.",
        entries: [
          { spanish: "el escriba", english: "the scribe" },
          { spanish: "el sacerdote", english: "the priest" },
          { spanish: "el rey", english: "the king" },
          { spanish: "el forastero", english: "the outsider / stranger" },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "El Prólogo", text: "La Jefa explains the time machine and the three rules." },
        { label: "Briefing", text: "Your destination: Copán, año 750." },
        { label: "Vocabulario", text: "Match the phrases — the city, the crafts, the verbs." },
        { label: "Construye", text: "Build sentences in the present. Describe a city that is alive." },
        { label: "La Bitácora", text: "Read your own field log from inside the city." },
        { label: "Escucha", text: "A night conversation. No subtitles, three replays." },
        { label: "Balam", text: "Interview a young scribe who has been watching the plaza." },
        { label: "La Rueda", text: "Four people in Copán. Three of them work here." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: the Hieroglyphic Stairway was never stolen, and we still cannot read it, because someone put it back together in the wrong order. Is that better or worse than a theft?",
      followups: [
        "Who is responsible when something is damaged by people trying to save it?",
      ],
    },

    closer: "Bienvenido al pasado, agente. El caso está abierto.",

    teacherNote:
      "Run immediately before students open Caso 11 — the first case of the time-travel arc and a hard reset of the premise, so this deck does more setup than the others. Two things to land. First, the historical present: students stand in 750 and narrate in the present tense, which is the device that lets the whole second semester review present-tense grammar without feeling like review. Say the rule out loud; it recurs in every remaining case. Second, the stakes slide, which is the best real fact in the arc — the Hieroglyphic Stairway survived complete and is still unreadable because the blocks were reassembled out of order. That single fact makes 'one stolen glyph' feel catastrophic instead of trivial, and it teaches something true about archaeology: context is the data. It also sets up a discussion prompt with no clean answer, about damage done by people trying to help. Watch the ESTO ES REAL stamps: El Cronista, the stolen glyph, and the suspects are invented, while Maya logosyllabic writing, the zero, the 63 steps and ~2.200 blocks, the scrambled reassembly, and Copán's 1980 UNESCO listing are real. Be accurate that Maya writing is READ today — students often assume it is a mystery script. Use NÚCLEO to drop the country slide if short.",
  },

  12: {
    hook: "He is pretending to be an astronomer. He picked the one disguise that cannot be faked.",

    crime: {
      eyebrow: "El Crimen",
      headline: "Tikal, Año 700",
      body: [
        "Your second jump. Tikal is one of the largest cities in the Maya world, built into the Petén rainforest, and its temple-pyramids come up through the canopy. Templo IV is about seventy metres tall — for centuries one of the tallest structures anywhere in the Americas.",
        "El Cronista is here for an astronomer's jade mask, which sits near the altar at the top of the temple. To get near it he is claiming to be an astronomer himself.",
        "That was a mistake. He is tall and dark-haired, and so is a real astronomer here; he is near Templo IV at night, and so is the real astronomer. On description alone you cannot separate them. On what he KNOWS, you can.",
      ],
      pull: "Two men, same height, same place, same night. Only one of them can name the stars.",
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "La Máscara de Jade",
        body: [
          "A jade mask belonging to an astronomer-priest, kept near the altar high on Templo IV and worn for ceremonies.",
          "It is green, it is heavy, and to the Maya it was worth more than gold — which is the part that usually surprises people.",
        ],
        facts: [
          { label: "Qué", value: "Una máscara de jade" },
          { label: "Dónde", value: "Cerca del altar, en lo alto del Templo IV" },
          { label: "De quién", value: "Un astrónomo maya" },
        ],
        real: false,
      },
      {
        eyebrow: "El Contexto · The Real Thing",
        headline: "Jade Was Worth More Than Gold",
        body: [
          "For the Maya, jade outranked gold, and not arbitrarily. It is green — the colour of new maize coming up, and of the quetzal's tail feathers. It was the colour of life continuing, in a civilisation whose whole calendar was built around knowing when things would happen again.",
          "This is worth sitting with, because it means value is not a property of a material. Gold is not objectively precious. A culture decides what matters, and then that thing becomes worth dying over.",
        ],
        facts: [
          { label: "El jade", value: "Verde — como el maíz nuevo y el quetzal" },
          { label: "El quetzal", value: "Guatemala's national bird AND its currency" },
          { label: "La ceiba", value: "The sacred tree — Guatemala's national tree" },
        ],
        real: true,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "Guatemala",
        body: [
          "More than twenty Maya languages are spoken in Guatemala today, by millions of people — K'iche', Q'eqchi', Kaqchikel and others, alongside Spanish. The Maya are not a civilisation that ended; they are a population that is still here, in the same places, speaking related languages.",
          "The country's money is called the quetzal, after the bird, whose tail feathers were traded across Mesoamerica and reserved for rulers.",
        ],
        facts: [
          { label: "Capital", value: "Ciudad de Guatemala" },
          { label: "Población", value: "~18 million" },
          { label: "Moneda", value: "el quetzal" },
          { label: "Idiomas", value: "Español + más de 20 idiomas mayas" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "El Sitio · The Site",
        headline: "Tikal",
        body: [
          "You are in rainforest so dense that the city was invisible from a short distance away, and you will hear howler monkeys before you see anything at all — a sound that genuinely does not sound like a monkey.",
          "Tikal is a UNESCO World Heritage Site, and it is one of a small number of places listed for BOTH its culture and its nature: the ruins and the rainforest were recognised together, because you cannot sensibly separate them.",
        ],
        facts: [
          { label: "Templo IV", value: "~70 m — one of the tallest in the ancient Americas" },
          { label: "La selva", value: "El Petén" },
          { label: "Patrimonio", value: "UNESCO — cultural AND natural, 1979" },
          { label: "Los monos", value: "Monos aulladores — you will hear them first" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "Some Things Take a Lifetime and Cannot Be Faked",
      body: [
        "Maya astronomers tracked the sun, the moon, and especially Venus, night after night, across generations, and recorded it well enough to predict eclipses. That was not a hobby. It told farmers when to plant and rulers when to hold ceremony, and the person who held that knowledge held real authority.",
        "Knowledge like that takes a lifetime to acquire, which means it also cannot be borrowed for an evening. A thief can copy a costume, a title, and a location. He cannot look at the night sky and produce the names.",
      ],
      pull: "You can steal a mask in a night. You cannot steal thirty years of watching the sky.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · Two Verbs, One Meaning",
        headline: "SER vs. ESTAR — and This Time It Catches Him",
        situation:
          "You met these in Costa Rica. Here they are the entire solution. SER is who or what something IS: tall, ancient, an astronomer. ESTAR is where it is and how it is right now: near the temple, nervous, confused. Your suspect and your innocent astronomer are identical under SER. They come apart under ESTAR.",
        entries: [
          { spanish: "es", english: "is — identity, permanent traits", note: "Es alto. Es antigua." },
          { spanish: "está", english: "is — location, right-now state", note: "Está en el templo. Está nervioso." },
          { spanish: "son", english: "they are (traits)" },
          { spanish: "están", english: "they are (place / state)" },
        ],
        production: {
          instruction: "Thirty seconds, partners. One sentence with each, about yourself.",
          say: "Soy ______. / Estoy ______.",
        },
      },
      {
        eyebrow: "Herramienta 2 · Describing People",
        headline: "SER Words",
        situation:
          "These go with SER, because they are what a person or a thing IS. They will describe both your thief and an innocent man equally well — that is the trap this case is built on.",
        entries: [
          { spanish: "alto / bajo", english: "tall / short" },
          { spanish: "moreno", english: "dark-haired" },
          { spanish: "fuerte", english: "strong" },
          { spanish: "inteligente", english: "intelligent" },
          { spanish: "antiguo", english: "ancient" },
        ],
      },
      {
        eyebrow: "Herramienta 3 · Place and State",
        headline: "ESTAR Words",
        situation:
          "These go with ESTAR, because they are all temporary or positional. This is the half of the case that actually separates your suspects, so listen hardest here.",
        entries: [
          { spanish: "cansado", english: "tired" },
          { spanish: "contento", english: "happy" },
          { spanish: "confundido", english: "confused" },
          { spanish: "aquí / allí", english: "here / there" },
          { spanish: "cerca / lejos", english: "near / far" },
        ],
      },
      {
        eyebrow: "Herramienta 4 · The Sky and the Forest",
        headline: "What an Astronomer Would Know",
        situation:
          "A real astronomer names these without thinking. Your impostor will not. Watch the moment somebody has to describe the sky and produces nothing.",
        entries: [
          { spanish: "la luna", english: "the moon" },
          { spanish: "la noche", english: "the night" },
          { spanish: "el amanecer", english: "dawn" },
          { spanish: "el quetzal", english: "the quetzal" },
          { spanish: "la ceiba", english: "the sacred ceiba tree" },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa sends you to Tikal, año 700." },
        { label: "Vocabulario", text: "Match the phrases — the forest, the sky, ser and estar." },
        { label: "Clasificar", text: "Swipe each card: SER or ESTAR? Speed matters." },
        { label: "Construye", text: "Build sentences with both verbs." },
        { label: "La Bitácora", text: "Read your field log from the top of the temple." },
        { label: "Escucha", text: "A night conversation. No subtitles, three replays." },
        { label: "Itzel", text: "Interview a young astronomer who watches the sky nightly." },
        { label: "La Rueda", text: "Four people. Two of them are tall, dark, and near the temple." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: to the Maya, jade was worth more than gold. What makes something valuable — the thing itself, or what people decide about it?",
      followups: [
        "What is something your generation treats as valuable that adults do not?",
      ],
    },

    closer: "Antes del amanecer, agente. El caso está abierto.",

    teacherNote:
      "Run immediately before students open Caso 12. The spine is the trap: the guilty man and an innocent astronomer are indistinguishable under SER — both tall, dark-haired, at Templo IV at night — and only ESTAR separates them. That is the most elegant grammar-as-plot design in the game, and saying it out loud before students play makes the swipe-sort stage feel like training rather than a drill. If you taught Caso 4, connect back: same two verbs, higher stakes. The jade-over-gold fact drives the discussion prompt and reliably produces good argument, because 14-year-olds have strong intuitions about what is valuable and enjoy defending them. Be precise on one point: say that the Maya ARE, not were. More than twenty Maya languages are spoken in Guatemala today by millions of people, and students who leave thinking Maya means extinct have learned something false. Watch the ESTO ES REAL stamps: El Cronista, the mask, and the suspects are invented, while Templo IV's height, the mixed cultural-and-natural UNESCO listing, jade's value, the quetzal as bird and currency, Venus tracking, and the living Maya languages are real. Use NÚCLEO to drop the country slide if short.",
  },

  13: {
    hook: "No kings, no pyramids, no gold. A village kitchen — and that is exactly why it matters.",

    crime: {
      eyebrow: "El Crimen",
      headline: "Joya de Cerén, Año 600",
      body: [
        "Your third jump, and the strangest destination yet. There is no palace here and no king. Joya de Cerén is a farming village: clay houses with thatched roofs, a kitchen, a sleeping room, a garden of maize and beans and chiles behind each one.",
        "In one of those houses there is a painted vessel — the finest thing anyone here owns. El Cronista wants it before the night is out.",
        "He has the same problem he has in every era: he does not know how to live here. In a village where everyone does the same work at the same hours, a man who does none of it is visible from across the yard.",
      ],
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "La Vasija Pintada",
        body: [
          "A painted clay vessel from an ordinary household — not a royal tomb offering, not temple treasure. A container, decorated, kept on a shelf in a kitchen.",
          "Its whole value comes from where it is sitting. In a palace it would be one object among thousands. In a farmer's kitchen it is evidence of how a normal family lived, which is the rarest thing archaeology ever gets.",
        ],
        facts: [
          { label: "Qué", value: "Una vasija de barro pintada" },
          { label: "Dónde", value: "La cocina de una casa del pueblo" },
          { label: "Cuándo", value: "Año 600 — antes de la erupción" },
        ],
        real: false,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "El Salvador",
        body: [
          "The smallest country in Central America, on the Pacific coast, with more than twenty volcanoes — which is why the soil is so good and why the story of this village goes the way it does.",
          "Joya de Cerén is El Salvador's only cultural World Heritage Site, and Salvadorans are proud of it for a reason that has nothing to do with treasure.",
        ],
        facts: [
          { label: "Capital", value: "San Salvador" },
          { label: "Población", value: "~6.3 million" },
          { label: "Tamaño", value: "The smallest country in Central America" },
          { label: "Patrimonio", value: "Joya de Cerén — UNESCO World Heritage, 1993" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "El Sitio · The Site",
        headline: "La Pompeya de América",
        body: [
          "Around the year 600, a nearby vent called Loma Caldera erupted and buried this village in ash. Archaeologists call it the Pompeii of the Americas — with one enormous difference, and it is the first thing you should know about the place.",
          "No human remains have ever been found here. The villagers saw it coming and got out. What the ash buried was not people; it was an ordinary evening, sealed and kept for fourteen centuries.",
          "So we have the pots still by the fire, maize still on the grinding stone, beans and chiles still in the gardens, painted vessels still on the shelves — and even the fields, with the rows still visible. It is the best picture anyone has of daily Maya life, and it exists because a village evacuated in time.",
        ],
        facts: [
          { label: "Cuándo", value: "~600 d.C." },
          { label: "El volcán", value: "Loma Caldera" },
          { label: "Restos humanos", value: "Ninguno — la gente salió a tiempo" },
          { label: "Lo que se conservó", value: "Cocinas, jardines, milpas, vasijas" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "Almost Everything We Know Is About Kings",
      body: [
        "Think about what survives from the ancient world. Tombs, temples, palaces, monuments with rulers' names on them. Archaeology is heavily weighted toward the powerful, because the powerful built in stone and were buried with their possessions.",
        "Ordinary houses rot. Ordinary meals get eaten. Ordinary evenings leave nothing. Which is why a farming village frozen mid-evening is worth more, scientifically, than another royal tomb — it answers questions that nothing else can answer.",
        "So what a thief takes from a place like this is not treasure. It is the record of one family's normal day — the only thing this site was ever able to give us.",
      ],
      pull: "History remembers kings by default. This village is one of the few places that remembers everyone else.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · The Boot",
        headline: "Verbs That Change in the Middle",
        situation:
          "Some verbs change their stem — the part before the ending — when you conjugate them. querer becomes quiero, poder becomes puedo, dormir becomes duermo, servir becomes sirvo. This is the grammar of the whole case, because every clue you get is one of these verbs.",
        entries: [
          { spanish: "querer → quiero", english: "to want → I want", note: "e → ie" },
          { spanish: "poder → puedo", english: "to be able → I can", note: "o → ue" },
          { spanish: "dormir → duermo", english: "to sleep → I sleep", note: "o → ue" },
          { spanish: "servir → sirvo", english: "to serve → I serve", note: "e → i" },
        ],
      },
      {
        eyebrow: "Herramienta 2 · The Trap",
        headline: "NOSOTROS Does Not Change",
        situation:
          "Here is the mistake almost everyone makes. The stem changes for yo, tú, él and ellos — but NOT for nosotros. It is nosotros dormimos, never 'duermimos'. Teachers draw a boot around the four forms that change; nosotros sits outside it, untouched.",
        entries: [
          { spanish: "yo duermo", english: "I sleep", note: "Changes." },
          { spanish: "nosotros dormimos", english: "we sleep", note: "Does NOT change." },
          { spanish: "yo quiero", english: "I want", note: "Changes." },
          { spanish: "nosotros queremos", english: "we want", note: "Does NOT change." },
        ],
        production: {
          instruction: "Thirty seconds. Say both halves out loud, twice, so the difference is in your mouth.",
          say: "Yo duermo — nosotros dormimos.",
        },
      },
      {
        eyebrow: "Herramienta 3 · The House",
        headline: "You Are Investigating a Kitchen",
        situation:
          "This case has no palace and no temple. Every location in it is domestic, and every witness statement is about ordinary rooms and ordinary objects.",
        entries: [
          { spanish: "la casa", english: "house" },
          { spanish: "la cocina", english: "kitchen" },
          { spanish: "el jardín", english: "garden" },
          { spanish: "la milpa", english: "cornfield" },
          { spanish: "el metate", english: "grinding stone" },
          { spanish: "la vasija", english: "clay vessel" },
        ],
      },
      {
        eyebrow: "Herramienta 4 · What a Village Eats",
        headline: "Food Is the Daily Routine",
        situation:
          "Everyone here grows, grinds, cooks and shares the same things at the same times of day. Knowing the food is knowing the schedule — and the schedule is how you spot someone who is not on it.",
        entries: [
          { spanish: "el maíz", english: "corn" },
          { spanish: "el frijol", english: "bean" },
          { spanish: "la tortilla", english: "tortilla" },
          { spanish: "la calabaza", english: "squash" },
          { spanish: "el chile", english: "chili" },
          { spanish: "el vecino", english: "neighbour" },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa sends you to Joya de Cerén, año 600." },
        { label: "Vocabulario", text: "Match the phrases — the house, the food, the verbs." },
        { label: "Clasificar", text: "Swipe each card: does the stem change, or not?" },
        { label: "Construye", text: "Build sentences with the stem-changing verbs." },
        { label: "La Bitácora", text: "Read your field log from inside the village." },
        { label: "Escucha", text: "A morning conversation. No subtitles, three replays." },
        { label: "Sak Nik", text: "Interview a neighbour who has been watching the stranger." },
        { label: "La Rueda", text: "Four people. Each of the decoys matches exactly one clue." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: if ash buried your home tonight exactly as it is, what would someone in the year 3600 conclude about how you live?",
      followups: [
        "What would they get completely wrong?",
      ],
    },

    closer: "Antes de que empiece la noche, agente. El caso está abierto.",

    teacherNote:
      "Run immediately before students open Caso 13. Lead with the humanity of the site: no human remains have ever been found at Joya de Cerén, which means this is a story about a village that got out in time, not a disaster. That frees students to be curious rather than solemn, and it is the honest framing. The stakes slide carries the idea worth keeping — archaeology is weighted toward kings because the powerful built in stone, so a frozen ordinary evening answers questions no royal tomb can. Students find that genuinely interesting, and the discussion prompt turns it on their own lives, which is the best turn-and-talk in the arc. Grammatically the spine is the boot: the stem changes for yo, tú, él and ellos and NOT for nosotros, which is the single most common error with these verbs. Do the production beat — saying 'yo duermo, nosotros dormimos' out loud twice does more than any explanation. If you taught Caso 6, note students met stem-changers there first; this is the case that makes the nosotros exception explicit. Watch the ESTO ES REAL stamps: El Cronista, the vessel, and the suspects are invented, while the eruption, the absence of human remains, the preserved kitchens and fields, and the 1993 UNESCO listing are real. Use NÚCLEO to drop the country slide if short.",
  },

  14: {
    hook: "A whole city turned out for a poet. One man in the crowd wanted to know what the poem was worth.",

    crime: {
      eyebrow: "El Crimen",
      headline: "The Whole City Is in the Plaza",
      body: [
        "León, Nicaragua, 1907. Rubén Darío has come home after years in Europe, and the country is receiving him the way other countries receive a winning team. There is music in the plaza and young people reading verses out loud in front of the cathedral.",
        "Inside the library there is a page in his own handwriting — a poem, the ink still dark. Tonight it is supposed to stay there.",
        "Your thief is somewhere in that crowd, and for once he is not hiding behind a costume. He is hiding behind an opinion: he is pretending to be an admirer. The problem is that he does not actually like poetry, and in this city that is very hard to fake.",
      ],
      pull: "In León, not liking poetry is a disguise that slips.",
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "El Manuscrito",
        body: [
          "One page, handwritten, in the poet's own ink. Not a printed book — the actual sheet the words first landed on.",
          "That is the whole reason it matters and the whole reason it is stealable: it is small, it is paper, and it is the only copy that was ever touched by the person who made it.",
        ],
        facts: [
          { label: "Qué", value: "Un manuscrito original — un poema escrito a mano" },
          { label: "Dónde", value: "La biblioteca de León" },
          { label: "Cuándo", value: "La noche de la fiesta, 1907" },
        ],
        real: false,
      },
      {
        eyebrow: "El Contexto · The Real Thing",
        headline: "Rubén Darío Turned the Traffic Around",
        body: [
          "For four hundred years, literary movements in Spanish went one direction: out from Spain to the Americas. Darío reversed it. Modernismo began in Latin America and travelled to Spain, and Spanish poets started taking their lead from a Nicaraguan.",
          "He is called el Príncipe de las Letras Castellanas. Spanish speakers still know his opening lines the way English speakers know Shakespeare's — 'La princesa está triste… ¿qué tendrá la princesa?' He died in León in 1916 and is buried inside its cathedral, under a carved lion that looks like it is weeping.",
        ],
        facts: [
          { label: "Nació", value: "1867 — in a village now called Ciudad Darío" },
          { label: "Azul…", value: "1888" },
          { label: "Cantos de vida y esperanza", value: "1905" },
          { label: "Su tumba", value: "Inside León's cathedral, beneath a weeping lion" },
        ],
        real: true,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "Nicaragua",
        body: [
          "You are in the largest country in Central America by area, and one of the emptiest — most of it is lake, forest and volcano. Lake Nicaragua is big enough to have islands with their own volcanoes on them.",
          "Spanish here uses vos rather than tú, the same as Argentina, and on the Caribbean side of the country people speak Miskito and English Creole as well. Your case files use tú, so you will not have to produce vos — just do not be thrown when you hear it.",
        ],
        facts: [
          { label: "Capital", value: "Managua" },
          { label: "Población", value: "~7 million" },
          { label: "Moneda", value: "el córdoba" },
          { label: "Idiomas", value: "Español, miskito, criollo inglés" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "La Ciudad · The City",
        headline: "León",
        body: [
          "You will hear poetry in the street here, and that is not a figure of speech. In León verses get recited out loud — in plazas, at school, at gatherings, at funerals. Memorising a poem and performing it is an ordinary thing to be able to do, not a specialist skill.",
          "The cathedral on the plaza, the Basílica de la Asunción, is the largest cathedral in Central America and a UNESCO World Heritage Site. León was Nicaragua's capital until 1852, and it has been the country's university and argument town ever since.",
        ],
        facts: [
          { label: "La catedral", value: "Largest in Central America · UNESCO World Heritage" },
          { label: "Fue capital", value: "Hasta 1852" },
          { label: "Población", value: "~200.000" },
          { label: "Cerca", value: "Volcán Cerro Negro — people sled down it" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "A Handwritten Page Is Proof of Where the Words Came From",
      body: [
        "A printed poem can be reprinted forever, so a book is never really destroyed. A manuscript is different. It is the single physical object that connects the words to the hand and the place they came from.",
        "For a country whose main claim on world literature is that one of its sons changed the direction the whole language was flowing, that page is not a collectible. It is evidence. Take it into a private collection and the poem survives — but the proof that it started here does not.",
      ],
      pull: "You cannot steal a poem. You can steal the proof of who wrote it, and where.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · The Backwards Verb",
        headline: "You Do Not Like Things. Things Please You.",
        situation:
          "English: 'I like the poem.' Spanish: 'me gusta el poema' — the poem is pleasing TO ME. The person becomes a little pronoun and the THING becomes the subject. You met this exact machine in Santo Domingo with doler: me duele la cabeza. Same engine, new verb.",
        entries: [
          { spanish: "me gusta…", english: "I like…", note: "Literally: it is pleasing to me." },
          { spanish: "te gusta…", english: "you like…" },
          { spanish: "le gusta…", english: "he / she likes… (or: you, formal)" },
          { spanish: "nos gusta…", english: "we like…" },
          { spanish: "les gusta…", english: "they like…" },
        ],
        production: {
          instruction: "Thirty seconds, partners. Answer for real — and notice you never say 'yo gusto'.",
          say: "¿Qué te gusta? — Me gusta ______.",
        },
      },
      {
        eyebrow: "Herramienta 2 · The Trap",
        headline: "The Verb Follows the THING, Not You",
        situation:
          "This is the mistake almost everyone makes. Because the thing is the subject, the ending changes with how many THINGS there are — never with who is doing the liking. One poem, gusta. Several poems, gustan. 'Me gustan' with a single thing is the single most common error in this unit.",
        entries: [
          { spanish: "me gusta el poema", english: "I like the poem", note: "One thing → gusta." },
          { spanish: "me gustan los poemas", english: "I like the poems", note: "Several things → gustan." },
          { spanish: "nos encanta la poesía", english: "we love poetry", note: "One thing, even though 'we' is plural." },
          { spanish: "les importan las palabras", english: "the words matter to them", note: "Several things → importan." },
        ],
        production: {
          instruction: "Thirty seconds. Say both out loud twice so the difference is in your mouth.",
          say: "Me gusta el poema — me gustan los poemas.",
        },
      },
      {
        eyebrow: "Herramienta 3 · The Family",
        headline: "Four More Verbs That Work the Same Way",
        situation:
          "Learn the pattern once and you get five verbs. These are the ones the case actually turns on, because what separates your suspects is not what they DO — it is what they care about.",
        entries: [
          { spanish: "encantar", english: "to love (something)", note: "Stronger than gustar." },
          { spanish: "interesar", english: "to interest" },
          { spanish: "importar", english: "to matter to someone" },
          { spanish: "molestar", english: "to bother" },
        ],
      },
      {
        eyebrow: "Herramienta 4 · The Room",
        headline: "Poetry Words, Because Everyone Here Has Them",
        situation:
          "You are interviewing people at a poetry celebration. These are the nouns they will use — and the difference between a suspect who talks about the words and one who talks about the paper is the case.",
        entries: [
          { spanish: "el poema", english: "poem" },
          { spanish: "el verso", english: "verse, line" },
          { spanish: "la palabra", english: "word" },
          { spanish: "el manuscrito", english: "manuscript" },
          { spanish: "el papel", english: "paper" },
          { spanish: "la tinta", english: "ink" },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa sends you to León, año 1907." },
        { label: "Vocabulario", text: "Match the phrases — poetry words and the backwards verbs." },
        { label: "Clasificar", text: "Swipe each card: ¿GUSTA or GUSTAN? Decide by the thing." },
        { label: "Construye", text: "Build sentences with gustar, encantar and interesar." },
        { label: "La Bitácora", text: "Read your field log from the plaza." },
        { label: "Escucha", text: "An exchange in the plaza. No subtitles, three replays." },
        { label: "Amanda", text: "Interview a young poet who has been watching the stranger." },
        { label: "La Rueda", text: "Four people. Each decoy matches exactly one of the three clues." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: in León, people memorise poems and say them out loud in public. What does your community memorise and perform out loud?",
      followups: [
        "Why is that one worth knowing by heart?",
      ],
    },

    closer: "Antes de la noche de la fiesta, agente. El caso está abierto.",

    teacherNote:
      "Run immediately before students open Caso 14. Two spines. Grammatically: gustar runs backwards, and the verb agrees with the THING and not the person — 'me gustan' with one thing is the error to hunt all week. Say the connection to Caso 9's doler out loud; students who see it as the same machine stop treating it as a new rule. The second production beat ('me gusta el poema — me gustan los poemas') is thirty seconds and does more than any explanation. Thematically: the stakes slide carries the fact that makes the theft matter — modernismo reversed the direction literary influence had flowed for four centuries, so a handwritten page from Darío is evidence of origin, not merchandise. The discussion prompt reliably works because every class memorises something (lyrics, prayers, chants, bits) and nobody has framed that as the same behaviour as reciting poetry in a plaza. Watch the ESTO ES REAL stamps: the manuscript, the stranger and the four suspects are invented, while Darío's dates and books, the reversal of influence, his tomb under the weeping lion, León's cathedral and UNESCO listing, and Nicaraguan voseo are real. The case is set in 1907, the year of his return, so do NOT hand out 'A Margarita Debayle' as the stolen poem — it was written in 1908. Use NÚCLEO to drop the country slide if short.",
  },

  15: {
    hook: "One disc. No copy. If it leaves the room tonight, the song has never existed.",

    crime: {
      eyebrow: "El Crimen",
      headline: "There Is No Second Copy",
      body: [
        "Havana, 1954. A small recording studio, a piano, a trumpet, a double bass, a tres. This morning a band recorded a new mambo and cut it to a single master disc.",
        "That word matters. Master. Before tape was cheap and copying was easy, the master was not the best copy of a song — it was the only physical place the song existed. Lose it and there is nothing to press records from, nothing to broadcast, nothing at all.",
        "A man came in and asked to borrow it. Twice. He was told no. And then, when nobody was looking, he took it anyway.",
      ],
      pull: "This is the only case this year where the object IS the artwork. There is no original left behind.",
      real: false,
    },

    artifact: [
      {
        eyebrow: "Lo Robado · What Was Stolen",
        headline: "El Disco Maestro",
        body: [
          "One lacquer disc, cut this morning, still in its paper sleeve. The band's only recording of a mambo that has never been broadcast.",
          "It was supposed to go out on the radio on Friday. Instead it is in a stranger's coat.",
        ],
        facts: [
          { label: "Qué", value: "El disco maestro — la única grabación" },
          { label: "Dónde", value: "Un estudio de grabación en La Habana" },
          { label: "Cuándo", value: "1954, la noche antes de la radio" },
          { label: "Copias", value: "Ninguna" },
        ],
        real: false,
      },
      {
        eyebrow: "El Contexto · The Real Thing",
        headline: "A Small Island Rebuilt the World's Dance Music",
        body: [
          "Son cubano came first. The mambo grew out of the danzón tradition in the 1930s and 40s. And in the early 1950s — right when you are standing there — Enrique Jorrín invented the cha-cha-chá, and he invented it slower on purpose, so that ordinary people could actually dance it.",
          "It travelled absurdly far for a country this size. Latin jazz runs on Cuban rhythm. When Cuban, Puerto Rican and other Latino musicians built salsa in New York in the 1960s and 70s, they built it on Cuban foundations. A great deal of what the world dances to is sitting on top of what was invented on this island.",
        ],
        facts: [
          { label: "El son", value: "The root form" },
          { label: "El mambo", value: "Out of the danzón, 1930s–40s" },
          { label: "El cha-cha-chá", value: "Enrique Jorrín, early 1950s" },
          { label: "La rumba", value: "UNESCO Intangible Heritage, 2016" },
          { label: "El tres", value: "Guitar with three doubled courses of strings" },
        ],
        real: true,
      },
    ],

    place: [
      {
        eyebrow: "El País · The Country",
        headline: "Cuba",
        body: [
          "You are on the largest island in the Caribbean, and you will notice the Spanish immediately: Cuban speakers drop the s at the end of syllables, so 'los discos' comes out closer to 'lo' disco'. That is not sloppiness, it is the accent, and it is why this case gives you three replays on the listening.",
          "One honest note before you go in. The Havana of 1954 that shows up in films — casinos, big hotels, glamour — was real, but it was not most Cubans' life, and the musicians who invented this music were largely not the people getting rich from it. Keep that in mind while you admire the city.",
        ],
        facts: [
          { label: "Capital", value: "La Habana" },
          { label: "Población", value: "~11 million" },
          { label: "Moneda", value: "el peso cubano" },
          { label: "El acento", value: "Final -s often dropped" },
        ],
        real: true,
        optional: true,
      },
      {
        eyebrow: "La Ciudad · The City",
        headline: "La Habana",
        body: [
          "You will hear this city before you see anything. Music here is not an event you buy a ticket for — it comes out of doorways and open windows, off the radio, and along the Malecón, the seawall where the whole city goes to sit at night.",
          "Habana Vieja, the old city, is a UNESCO World Heritage Site: five centuries of Spanish colonial building, laid out around plazas, with fortresses guarding the harbour mouth.",
        ],
        facts: [
          { label: "Habana Vieja", value: "UNESCO World Heritage, 1982" },
          { label: "El Malecón", value: "The seawall — the city's front porch" },
          { label: "Fundada", value: "1519" },
          { label: "Población", value: "~2.1 million" },
        ],
        real: true,
      },
    ],

    stakes: {
      eyebrow: "Por Qué Importa · Why It Matters",
      headline: "Everybody Here Carries the Clave",
      body: [
        "Underneath nearly all of this music is one pattern: la clave. Five strokes spread across two measures, and every other instrument lines itself up against it.",
        "Here is the part that matters. This is not specialist knowledge. People who have never taken a music lesson hold the clave in their bodies — they tap it on a table without noticing, and they can hear instantly when a band is playing against it. It is shared, physical, unwritten knowledge, held by an entire population.",
        "Which is the thief's problem. He can copy an accent and buy the right jacket. He cannot make his hand find a rhythm that everyone around him has known since they were four.",
      ],
      pull: "You can fake a name. You cannot fake the clave in a room full of people who have it.",
      real: true,
    },

    vocab: [
      {
        eyebrow: "Herramienta 1 · Both Halves at Once",
        headline: "Person First, Thing Second",
        situation:
          "You already own both pieces. Lo/la/los/las stand in for the THING. Me/te/le/nos/les say TO WHOM. Now they appear together, and the order never changes: the person comes first, then the thing. '¿Me lo puede prestar?' — me, then lo. Never 'lo me'.",
        entries: [
          { spanish: "me lo / me la", english: "it to me", note: "¿Me lo prestas?" },
          { spanish: "te lo / te la", english: "it to you" },
          { spanish: "nos lo / nos la", english: "it to us" },
          { spanish: "me los / me las", english: "them to me" },
        ],
        production: {
          instruction: "Thirty seconds. Ask your partner to lend you something on your desk, both pronouns.",
          say: "¿Me lo prestas? / ¿Me la prestas?",
        },
      },
      {
        eyebrow: "Herramienta 2 · The Famous Rule",
        headline: "LE + LO Is Impossible. It Becomes SE.",
        situation:
          "This is the most tested single fact in the unit. Spanish will not allow le lo or les las — the sound is banned. So le and les turn into SE whenever a lo/la/los/las follows. 'Le doy el disco a Rogelio' becomes 'SE lo doy.' There is no exception to hunt for.",
        entries: [
          { spanish: "se lo / se la", english: "it to him / her / them", note: "From le or les — never 'le lo'." },
          { spanish: "se los / se las", english: "them to him / her / them" },
          { spanish: "Se lo guarda.", english: "He keeps it for her." },
          { spanish: "No se lo da a nadie.", english: "He doesn't give it to anyone." },
        ],
        production: {
          instruction: "Thirty seconds. Say the wrong one, then the right one, so your ear learns the difference.",
          say: "✗ le lo doy → ✓ se lo doy",
        },
      },
      {
        eyebrow: "Herramienta 3 · Give, Ask, Lend, Take",
        headline: "The Verbs That Need Two Pronouns",
        situation:
          "Double pronouns cluster around a specific family of verbs: things moving from one person to another. Every witness statement in this case is about who gave, lent, kept or took the disc — and from whom.",
        entries: [
          { spanish: "dar", english: "to give" },
          { spanish: "pedir", english: "to ask for" },
          { spanish: "prestar", english: "to lend" },
          { spanish: "guardar", english: "to keep, to put away" },
          { spanish: "llevar", english: "to take away" },
          { spanish: "devolver", english: "to give back" },
        ],
      },
      {
        eyebrow: "Herramienta 4 · Recognize, Don't Produce",
        headline: "When Both Pronouns Glue Onto the Verb",
        situation:
          "You will hear both pronouns stuck onto the end of an infinitive, as one word with an accent. You do not have to produce these yet — but you must recognise them, because the case's most important line is one of them.",
        entries: [
          { spanish: "escucharlo", english: "to listen to it" },
          { spanish: "llevármelo", english: "to take it with me", note: "llevar + me + lo" },
          { spanish: "llevárselo", english: "to take it away from him", note: "llevar + se + lo" },
          { spanish: "prestármelo", english: "to lend it to me" },
        ],
      },
    ],

    expect: {
      headline: "What Happens When You Open the Case",
      items: [
        { label: "Briefing", text: "La Jefa sends you to La Habana, año 1954." },
        { label: "Vocabulario", text: "Match the phrases — the studio, the instruments, the verbs of giving." },
        { label: "Clasificar", text: "Swipe each card: ¿me LO or me LA? Decide by the thing's gender." },
        { label: "Construye", text: "Build sentences with both pronouns, including le → se." },
        { label: "La Bitácora", text: "Read your field log from inside the studio." },
        { label: "Escucha", text: "An exchange in the studio. Fast Cuban Spanish, three replays." },
        { label: "Rogelio", text: "Interview the engineer who was guarding the disc." },
        { label: "La Rueda", text: "Four people. Each decoy matches exactly one of the three clues." },
      ],
    },

    discuss: {
      prompt:
        "Turn and talk: why would someone want a recording they never intend to listen to?",
      followups: [
        "Is there anything you own that you value but never actually use?",
      ],
    },

    closer: "Antes de que salga de la isla, agente. El caso está abierto.",

    teacherNote:
      "Run immediately before students open Caso 15 — the last case before the midterm boss, so it is also a consolidation week. Grammatically there are two things and the second one is the whole unit: order never changes (person, then thing), and le/les ALWAYS become SE before lo/la/los/las. Do the second production beat exactly as written — saying the wrong form out loud once ('le lo doy') and then the right one trains the ear faster than any rule statement, and students stop producing 'le lo' almost immediately. Before you show the stakes slide, clap the 3-2 son clave and have the class join, then deliberately clap against it so they hear the wrongness; that is the case's second clue made physical, and it takes thirty seconds. The thief's tell is thematic rather than physical: he asks to borrow the record and explicitly does NOT want to hear it, which is the discussion prompt too. Watch the ESTO ES REAL stamps: the studio, the disc and the four suspects are invented, while the son/mambo/cha-cha-chá lineage, Jorrín, rumba's UNESCO listing, the tres, the clave, Habana Vieja's World Heritage status and Cuban s-dropping are real. Two honest guards, both written into the slides: 1950s Havana's film glamour was real but was not most Cubans' life and the musicians largely were not the ones profiting; and salsa is NOT Cuban music renamed — it was built in New York on Cuban foundations by Cuban, Puerto Rican and other Latino musicians. We stay on the music; the politics of the era is a separate and later topic. Use NÚCLEO to drop the country slide if short.",
  },
};

export function getCaseStory(unitNumber: number): CaseStory | null {
  return STORIES[unitNumber] ?? null;
}
