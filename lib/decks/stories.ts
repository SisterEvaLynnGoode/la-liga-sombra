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
};

export function getCaseStory(unitNumber: number): CaseStory | null {
  return STORIES[unitNumber] ?? null;
}
