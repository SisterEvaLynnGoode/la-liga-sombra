/**
 * Per-unit grammar mini-lessons + drills for the printable worksheet packets.
 *
 * Each unit's grammar focus is authored as a detective-framed teaching block:
 *  - title:         the grammar point
 *  - briefing:      a short detective-voiced explanation (student-facing, English)
 *  - examples:      Spanish models with English glosses
 *  - referenceTable:a conjugation / paradigm table students keep beside them
 *  - drills:        fill-in items (recognition) with answers
 *  - secondDrill:   a deeper production task (transform / translate / conjugate)
 *
 * Everything is plain text so it prints clean in black and white.
 */

export interface GrammarExample {
  es: string;
  en: string;
}

export interface GrammarDrill {
  /** The prompt with a blank shown as "____" */
  prompt: string;
  /** The correct fill-in */
  answer: string;
  /** Optional English hint shown in parentheses on the student sheet */
  hint?: string;
}

export interface GrammarTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface GrammarSecondDrill {
  title: string;
  instructions: string;
  items: GrammarDrill[];
}

export interface GrammarLesson {
  title: string;
  briefing: string;
  examples: GrammarExample[];
  referenceTable?: GrammarTable;
  drills: GrammarDrill[];
  secondDrill?: GrammarSecondDrill;
}

export const GRAMMAR: Record<number, GrammarLesson> = {
  1: {
    title: "Greetings, Introductions & Numbers 0–30",
    briefing:
      "Every agent opens a case the same way: introduce yourself and find out who you're talking to. Use 'Me llamo…' to give your name, '¿Cómo te llamas?' to ask for a name, and '¿De dónde eres?' to find out where a suspect is from. Match the greeting to the time of day — buenos días (morning), buenas tardes (afternoon), buenas noches (night).",
    examples: [
      { es: "Buenos días. Me llamo Ana. ¿Cómo te llamas?", en: "Good morning. My name is Ana. What's your name?" },
      { es: "Soy de México. ¿De dónde eres tú?", en: "I'm from Mexico. Where are you from?" },
      { es: "Gracias. — De nada.", en: "Thank you. — You're welcome." },
    ],
    referenceTable: {
      caption: "Detective phrases — keep these beside you",
      headers: ["Español", "English"],
      rows: [
        ["Buenos días", "Good morning"],
        ["Buenas tardes", "Good afternoon"],
        ["Buenas noches", "Good night"],
        ["Me llamo…", "My name is…"],
        ["¿Cómo te llamas?", "What's your name?"],
        ["¿De dónde eres?", "Where are you from?"],
        ["Soy de…", "I'm from…"],
      ],
    },
    drills: [
      { prompt: "____ días, detective. (morning greeting)", answer: "Buenos" },
      { prompt: "¿Cómo te ____? (you ask the suspect's name)", answer: "llamas" },
      { prompt: "Me ____ Carmen. (give your own name)", answer: "llamo" },
      { prompt: "¿De ____ eres? (ask where they are from)", answer: "dónde" },
      { prompt: "Soy ____ Guadalajara. (say where you're from)", answer: "de" },
      { prompt: "— Gracias. — De ____.", answer: "nada" },
    ],
    secondDrill: {
      title: "Guided Translation — Say it in Spanish",
      instructions: "Write each line in Spanish. Stay in character as the detective.",
      items: [
        { prompt: "'My name is Sofía.' →", answer: "Me llamo Sofía" },
        { prompt: "'What's your name?' →", answer: "¿Cómo te llamas?" },
        { prompt: "'Where are you from?' →", answer: "¿De dónde eres?" },
        { prompt: "'I'm from Mexico.' →", answer: "Soy de México" },
        { prompt: "'Good night, ma'am.' →", answer: "Buenas noches, señora" },
      ],
    },
  },
  2: {
    title: "Ser + Adjectives & Regular -AR Verbs",
    briefing:
      "To describe a suspect, use the verb SER plus an adjective: 'El sospechoso es alto.' Adjectives must agree — a male suspect is 'serio', a female suspect is 'seria'. Regular -AR verbs (estudiar, hablar, trabajar) drop the -ar and add: yo -o, tú -as, él/ella -a, nosotros -amos, ellos -an.",
    examples: [
      { es: "La testigo es inteligente y trabajadora.", en: "The witness is intelligent and hardworking." },
      { es: "Yo estudio español. Tú hablas inglés.", en: "I study Spanish. You speak English." },
      { es: "El ladrón usa una computadora.", en: "The thief uses a computer." },
    ],
    referenceTable: {
      caption: "Regular -AR verbs (hablar) & the verb SER",
      headers: ["Pronombre", "hablar", "ser"],
      rows: [
        ["yo", "hablo", "soy"],
        ["tú", "hablas", "eres"],
        ["él / ella", "habla", "es"],
        ["nosotros", "hablamos", "somos"],
        ["ellos / ellas", "hablan", "son"],
      ],
    },
    drills: [
      { prompt: "El sospechoso ____ alto y moreno. (ser)", answer: "es" },
      { prompt: "Yo ____ español todos los días. (estudiar)", answer: "estudio" },
      { prompt: "La maestra es muy trabajador____. (agree: female)", answer: "a" },
      { prompt: "Nosotros ____ con el testigo. (hablar)", answer: "hablamos" },
      { prompt: "Tú ____ la computadora. (usar)", answer: "usas" },
      { prompt: "Ellos ____ en la escuela. (trabajar)", answer: "trabajan" },
    ],
    secondDrill: {
      title: "Transformation — Make the adjective agree",
      instructions: "Rewrite the adjective so it agrees with the new subject.",
      items: [
        { prompt: "El detective es serio. → La detective es ____.", answer: "seria" },
        { prompt: "Carlos es trabajador. → María es ____.", answer: "trabajadora" },
        { prompt: "El chico es alto. → Los chicos son ____.", answer: "altos" },
        { prompt: "La maestra es simpática. → Las maestras son ____.", answer: "simpáticas" },
        { prompt: "El estudiante es tímido. → La estudiante es ____.", answer: "tímida" },
      ],
    },
  },
  3: {
    title: "The Verb IR + A, Question Words & -ER Verbs",
    briefing:
      "To chase a suspect across the city, you need IR (to go): voy, vas, va, vamos, van — always followed by 'a': 'Voy a la estación.' Question words crack the case: ¿adónde? (where to), ¿cuándo? (when), ¿por qué? (why), ¿quién? (who). Regular -ER verbs (comer, correr, ver) take: -o, -es, -e, -emos, -en.",
    examples: [
      { es: "¿Adónde va el ladrón? Va al aeropuerto.", en: "Where is the thief going? He's going to the airport." },
      { es: "Yo corro a la plaza. Tú ves el taxi.", en: "I run to the plaza. You see the taxi." },
      { es: "¿Por qué vamos a la comisaría?", en: "Why are we going to the police station?" },
    ],
    referenceTable: {
      caption: "IR (to go) & regular -ER verbs (comer)",
      headers: ["Pronombre", "ir", "comer"],
      rows: [
        ["yo", "voy", "como"],
        ["tú", "vas", "comes"],
        ["él / ella", "va", "come"],
        ["nosotros", "vamos", "comemos"],
        ["ellos / ellas", "van", "comen"],
      ],
    },
    drills: [
      { prompt: "El sospechoso ____ a la estación de Atocha. (ir)", answer: "va" },
      { prompt: "Voy ____ el Museo del Prado. (ir + preposition)", answer: "a" },
      { prompt: "¿____ va el ladrón? (which question word: where to)", answer: "Adónde" },
      { prompt: "Nosotros ____ por la Gran Vía. (correr)", answer: "corremos" },
      { prompt: "Yo ____ el taxi en la calle. (ver)", answer: "veo" },
      { prompt: "¿____ es el culpable? (which question word: who)", answer: "Quién" },
    ],
    secondDrill: {
      title: "Transformation & Translation — the verb IR",
      instructions: "Change the subject of IR, or translate the line into Spanish.",
      items: [
        { prompt: "Yo voy al museo. → Nosotros ____ al museo.", answer: "vamos" },
        { prompt: "Tú vas a la plaza. → Ella ____ a la plaza.", answer: "va" },
        { prompt: "Él va al aeropuerto. → Ellos ____ al aeropuerto.", answer: "van" },
        { prompt: "'I go to the market.' →", answer: "Voy al mercado" },
        { prompt: "'Where are you going?' →", answer: "¿Adónde vas?" },
      ],
    },
  },
  4: {
    title: "Ser vs. Estar, -IR Verbs & Possessive Adjectives",
    briefing:
      "Two verbs mean 'to be'. SER describes permanent traits (es alta, es seria). ESTAR describes feelings and location (está nerviosa, está en la cocina). When a suspect is lying, watch their emotions — that's ESTAR. Possessives show whose: mi/mis (my), tu/tus (your), su/sus (his/her). Regular -IR verbs (vivir, escribir, abrir) take: -o, -es, -e, -imos, -en.",
    examples: [
      { es: "La tía es simpática, pero hoy está nerviosa.", en: "The aunt is nice, but today she is nervous." },
      { es: "Mi hermano vive en Costa Rica.", en: "My brother lives in Costa Rica." },
      { es: "Su collar no está en la habitación.", en: "Her necklace is not in the room." },
    ],
    referenceTable: {
      caption: "SER vs ESTAR & regular -IR verbs (vivir)",
      headers: ["Pronombre", "ser", "estar", "vivir"],
      rows: [
        ["yo", "soy", "estoy", "vivo"],
        ["tú", "eres", "estás", "vives"],
        ["él / ella", "es", "está", "vive"],
        ["nosotros", "somos", "estamos", "vivimos"],
        ["ellos / ellas", "son", "están", "viven"],
      ],
    },
    drills: [
      { prompt: "El nieto ____ nervioso hoy. (ser/estar — feeling)", answer: "está" },
      { prompt: "La abuela ____ muy generosa. (ser/estar — trait)", answer: "es" },
      { prompt: "Yo ____ en la finca con mi familia. (vivir)", answer: "vivo" },
      { prompt: "____ collar es de esmeraldas. (my)", answer: "Mi" },
      { prompt: "El sospechoso ____ la carta. (escribir)", answer: "escribe" },
      { prompt: "¿Dónde ____ tu hermana ahora? (ser/estar — location)", answer: "está" },
    ],
    secondDrill: {
      title: "Choose the verb — SER or ESTAR",
      instructions: "Write the correct form of SER or ESTAR. The hint tells you why.",
      items: [
        { prompt: "La abuela ____ generosa.", answer: "es", hint: "trait" },
        { prompt: "El nieto ____ nervioso hoy.", answer: "está", hint: "feeling" },
        { prompt: "Nosotros ____ en la finca.", answer: "estamos", hint: "location" },
        { prompt: "Yo ____ detective de la agencia.", answer: "soy", hint: "identity" },
        { prompt: "Los primos ____ cansados.", answer: "están", hint: "feeling" },
      ],
    },
  },
  5: {
    title: "Tener Expressions, Numbers to a Million & Venir",
    briefing:
      "TENER means 'to have', but Spanish uses it for states English expresses with 'to be': tener hambre (to be hungry), tener miedo (to be afraid), tener prisa (to be in a hurry), tener X años (to be X years old). Big numbers crack codes: cien (100), quinientos (500), mil (1,000), un millón. VENIR (to come): vengo, vienes, viene.",
    examples: [
      { es: "El hacker tiene veinticinco años.", en: "The hacker is twenty-five years old." },
      { es: "Tengo prisa — el ladrón viene a las tres.", en: "I'm in a hurry — the thief is coming at three." },
      { es: "La contraseña es dos mil quinientos.", en: "The password is two thousand five hundred." },
    ],
    referenceTable: {
      caption: "TENER & VENIR (both irregular)",
      headers: ["Pronombre", "tener", "venir"],
      rows: [
        ["yo", "tengo", "vengo"],
        ["tú", "tienes", "vienes"],
        ["él / ella", "tiene", "viene"],
        ["nosotros", "tenemos", "venimos"],
        ["ellos / ellas", "tienen", "vienen"],
      ],
    },
    drills: [
      { prompt: "El sospechoso ____ treinta años. (tener)", answer: "tiene" },
      { prompt: "Yo ____ miedo de la red oscura. (tener)", answer: "tengo" },
      { prompt: "El testigo ____ a Buenos Aires el quince. (venir)", answer: "viene" },
      { prompt: "La suma es quinientos + mil = ____. (number in words)", answer: "mil quinientos" },
      { prompt: "Nosotros ____ prisa, ¡rápido! (tener)", answer: "tenemos" },
      { prompt: "¿Cuántos años ____ tú? (tener)", answer: "tienes" },
    ],
    secondDrill: {
      title: "Translation — tener & venir",
      instructions: "Write each line in Spanish using tener or venir.",
      items: [
        { prompt: "'I am hungry.' →", answer: "Tengo hambre" },
        { prompt: "'She is twenty years old.' →", answer: "Tiene veinte años" },
        { prompt: "'We are in a hurry.' →", answer: "Tenemos prisa" },
        { prompt: "'Are you afraid?' →", answer: "¿Tienes miedo?" },
        { prompt: "'The thief is coming.' →", answer: "El ladrón viene" },
      ],
    },
  },
  6: {
    title: "Stem-Changing Verbs & Demonstratives (este/ese/aquel)",
    briefing:
      "Some verbs change their stem vowel when you conjugate them. e→ie: querer (quiero), preferir (prefiero), pensar (pienso). o→ue: poder (puedo), dormir (duermo), volver (vuelvo). The 'nosotros' form does NOT change. Demonstratives point to evidence: este/esta (this, near me), ese/esa (that, near you), aquel/aquella (that one over there).",
    examples: [
      { es: "El chef quiere esta receta, no esa.", en: "The chef wants this recipe, not that one." },
      { es: "No puedo dormir — pienso en el caso.", en: "I can't sleep — I'm thinking about the case." },
      { es: "Aquel cocinero vuelve a la cocina.", en: "That cook over there returns to the kitchen." },
    ],
    referenceTable: {
      caption: "Stem-changers (querer e→ie, poder o→ue) — nosotros doesn't change",
      headers: ["Pronombre", "querer (e→ie)", "poder (o→ue)"],
      rows: [
        ["yo", "quiero", "puedo"],
        ["tú", "quieres", "puedes"],
        ["él / ella", "quiere", "puede"],
        ["nosotros", "queremos", "podemos"],
        ["ellos / ellas", "quieren", "pueden"],
      ],
    },
    drills: [
      { prompt: "El cocinero ____ usar este cuchillo. (querer, e→ie)", answer: "quiere" },
      { prompt: "Yo no ____ encontrar la receta. (poder, o→ue)", answer: "puedo" },
      { prompt: "Ella ____ el pollo, no el pescado. (preferir, e→ie)", answer: "prefiere" },
      { prompt: "Toma ____ maíz de aquí, no ese. (this, masc.)", answer: "este" },
      { prompt: "El sospechoso ____ a la cocina a las ocho. (volver, o→ue)", answer: "vuelve" },
      { prompt: "¿Quién prepara ____ plato de allá? (that over there, masc.)", answer: "aquel" },
    ],
    secondDrill: {
      title: "Conjugate — stem-changing verbs",
      instructions: "Write the correct stem-changing form for each subject.",
      items: [
        { prompt: "Yo ____ la receta. (querer)", answer: "quiero" },
        { prompt: "Ella ____ cocinar. (poder)", answer: "puede" },
        { prompt: "Nosotros ____ el pollo. (preferir)", answer: "preferimos" },
        { prompt: "El chef ____ a la cocina. (volver)", answer: "vuelve" },
        { prompt: "¿Tú ____ que es culpable? (pensar)", answer: "piensas" },
      ],
    },
  },
  7: {
    title: "Stem-Changing Verbs (u→ue, o→ue) & Ordinal Numbers",
    briefing:
      "More stem-changers. u→ue is rare and special: jugar (juego, juegas, juega). o→ue continues: encontrar (encuentro), almorzar (almuerzo), poder (puedo). Use ordinals to track the order of suspects and clues: primero (1st), segundo (2nd), tercero (3rd), cuarto (4th), quinto (5th). They agree in gender: primer/primera.",
    examples: [
      { es: "El jugador juega en el estadio del festival.", en: "The player plays at the festival stadium." },
      { es: "Encuentro la primera pista cerca del escenario.", en: "I find the first clue near the stage." },
      { es: "El técnico almuerza a las dos.", en: "The technician eats lunch at two." },
    ],
    referenceTable: {
      caption: "Stem-changers (jugar u→ue, poder o→ue) & ordinals 1–5",
      headers: ["Pronombre", "jugar (u→ue)", "poder (o→ue)"],
      rows: [
        ["yo", "juego", "puedo"],
        ["tú", "juegas", "puedes"],
        ["él / ella", "juega", "puede"],
        ["nosotros", "jugamos", "podemos"],
        ["ellos / ellas", "juegan", "pueden"],
        ["Ordinales:", "1º primero · 2º segundo · 3º tercero", "4º cuarto · 5º quinto"],
      ],
    },
    drills: [
      { prompt: "El bailarín ____ en el festival. (jugar, u→ue)", answer: "juega" },
      { prompt: "Yo ____ la pista detrás del escenario. (encontrar, o→ue)", answer: "encuentro" },
      { prompt: "La ____ pista es la más importante. (1st, feminine)", answer: "primera" },
      { prompt: "El sospechoso ____ a las dos de la tarde. (almorzar, o→ue)", answer: "almuerza" },
      { prompt: "Nosotros ____ resolver el caso. (poder, o→ue)", answer: "podemos" },
      { prompt: "El ____ testigo no dice la verdad. (3rd, masculine short form)", answer: "tercer" },
    ],
    secondDrill: {
      title: "Conjugate & order — stem-changers and ordinals",
      instructions: "Conjugate the verb or write the correct ordinal number.",
      items: [
        { prompt: "Yo ____ en el estadio. (jugar)", answer: "juego" },
        { prompt: "Ella ____ la pista. (encontrar)", answer: "encuentra" },
        { prompt: "La ____ pista. (1st, fem.)", answer: "primera" },
        { prompt: "El ____ sospechoso. (3rd, masc. short form)", answer: "tercer" },
        { prompt: "Nosotros ____ a las dos. (almorzar)", answer: "almorzamos" },
      ],
    },
  },
  8: {
    title: "The Preterite (Past Tense), Comparatives & Object Pronouns",
    briefing:
      "To report what already happened, use the preterite. Regular -AR verbs: -é, -aste, -ó, -amos, -aron (yo limpié = I cleaned). Compare suspects: más…que (more…than), menos…que (less…than), tan…como (as…as); irregulars mejor (better), peor (worse). Indirect object pronouns say to whom: me, te, le, les ('Don Aurelio no LE vendió las figurillas').",
    examples: [
      { es: "Ayer yo limpié el puesto del mercado.", en: "Yesterday I cleaned the market stall." },
      { es: "El ladrón es más alto que el testigo.", en: "The thief is taller than the witness." },
      { es: "Don Aurelio no le vendió las figurillas.", en: "Don Aurelio didn't sell him the figurines." },
    ],
    referenceTable: {
      caption: "Preterite -AR endings (hablar) & comparatives",
      headers: ["Pronombre", "Preterite -AR (hablar)"],
      rows: [
        ["yo", "hablé"],
        ["tú", "hablaste"],
        ["él / ella", "habló"],
        ["nosotros", "hablamos"],
        ["ellos / ellas", "hablaron"],
        ["Comparativos:", "más…que · menos…que · tan…como · mejor · peor"],
      ],
    },
    drills: [
      { prompt: "Ayer Doña Rosa ____ el mercado. (limpiar, preterite yo→ella)", answer: "limpió" },
      { prompt: "El ladrón ____ temprano. (llegar, preterite él)", answer: "llegó" },
      { prompt: "El sospechoso es ____ alto ____ el testigo. (more…than)", answer: "más…que" },
      { prompt: "Yo ____ las figurillas en la caja. (buscar, preterite yo)", answer: "busqué" },
      { prompt: "Don Aurelio no ____ vendió el collar. (to him — pronoun)", answer: "le" },
      { prompt: "Esta pista es ____ que la otra. (better — irregular)", answer: "mejor" },
    ],
    secondDrill: {
      title: "Transform — present to preterite & comparatives",
      instructions: "Change the verb from present to preterite, or complete the comparison.",
      items: [
        { prompt: "Yo limpio. → Ayer yo ____.", answer: "limpié" },
        { prompt: "Ella llega. → Ayer ella ____.", answer: "llegó" },
        { prompt: "Ellos compran. → Ayer ellos ____.", answer: "compraron" },
        { prompt: "El ladrón es ____ alto ____ el testigo. (more…than)", answer: "más…que" },
        { prompt: "Esta pista es ____ que la otra. (better)", answer: "mejor" },
      ],
    },
  },
  9: {
    title: "Doler (me duele / me duelen) & Body Vocabulary",
    briefing:
      "To say something hurts, Spanish uses DOLER like the verb gustar — the body part is the subject. Use 'me duele' for ONE thing (me duele la cabeza = my head hurts) and 'me duelen' for MORE than one (me duelen los pies = my feet hurt). You can also say 'tener dolor de' + body part (tengo dolor de estómago). Watch suspects who lie about their pain!",
    examples: [
      { es: "Me duele la cabeza y me duelen los ojos.", en: "My head hurts and my eyes hurt." },
      { es: "El paciente tiene dolor de espalda.", en: "The patient has a backache." },
      { es: "La ladrona dijo que le dolía el estómago, pero mintió.", en: "The thief said her stomach hurt, but she lied." },
    ],
    referenceTable: {
      caption: "DOLER — the body part is the subject (like gustar)",
      headers: ["A quién", "Una cosa", "Varias cosas"],
      rows: [
        ["a mí", "me duele…", "me duelen…"],
        ["a ti", "te duele…", "te duelen…"],
        ["a él / ella", "le duele…", "le duelen…"],
        ["a nosotros", "nos duele…", "nos duelen…"],
        ["a ellos / ellas", "les duele…", "les duelen…"],
        ["Otra forma:", "tener dolor de + parte del cuerpo", "(tengo dolor de cabeza)"],
      ],
    },
    drills: [
      { prompt: "Me ____ la cabeza. (one thing: head)", answer: "duele" },
      { prompt: "Me ____ los pies. (plural: feet)", answer: "duelen" },
      { prompt: "El señor Reyes tiene ____ de espalda. (ache)", answer: "dolor" },
      { prompt: "A Pablo le ____ los dientes. (plural: teeth)", answer: "duelen" },
      { prompt: "¿Qué te ____? (what's wrong / what hurts you — one thing)", answer: "duele" },
      { prompt: "La ladrona no estaba enferma: no le ____ nada. (one/none)", answer: "dolía" },
    ],
    secondDrill: {
      title: "Choose duele or duelen",
      instructions: "Write 'duele' (one body part) or 'duelen' (more than one).",
      items: [
        { prompt: "Me ____ la mano.", answer: "duele", hint: "one" },
        { prompt: "Me ____ las piernas.", answer: "duelen", hint: "plural" },
        { prompt: "Le ____ el estómago.", answer: "duele", hint: "one" },
        { prompt: "Me ____ los dientes.", answer: "duelen", hint: "plural" },
        { prompt: "Nos ____ la espalda.", answer: "duele", hint: "one" },
      ],
    },
  },
  10: {
    title: "The Future: ir a + infinitive & the Simple Future",
    briefing:
      "Two ways to talk about the future. The easy one is 'ir a + infinitive': voy a estudiar (I'm going to study), ella va a presentar (she's going to present). The simple future adds endings to the whole verb: -é, -ás, -á, -emos, -án — seré (I will be), tendré (I will have), estudiaré (I will study). Each suspect describes their future plans — one of them is hiding their real plan.",
    examples: [
      { es: "Voy a estudiar ingeniería el año que viene.", en: "I'm going to study engineering next year." },
      { es: "Sofía va a presentar una aplicación.", en: "Sofía is going to present an app." },
      { es: "Seré ingeniero y tendré mi propia empresa.", en: "I will be an engineer and I will have my own company." },
    ],
    referenceTable: {
      caption: "Two futures — ir a + infinitive, and the simple future (hablar)",
      headers: ["Pronombre", "ir a + inf.", "futuro simple (hablar)"],
      rows: [
        ["yo", "voy a hablar", "hablaré"],
        ["tú", "vas a hablar", "hablarás"],
        ["él / ella", "va a hablar", "hablará"],
        ["nosotros", "vamos a hablar", "hablaremos"],
        ["ellos / ellas", "van a hablar", "hablarán"],
        ["Irregulares:", "seré (ser)", "tendré (tener)"],
      ],
    },
    drills: [
      { prompt: "Voy ____ estudiar en la universidad. (ir a + infinitive)", answer: "a" },
      { prompt: "Sofía ____ a presentar una aplicación. (ir)", answer: "va" },
      { prompt: "El año que viene ____ ingeniero. (I will be — ser)", answer: "seré" },
      { prompt: "Daniel ____ su propia empresa algún día. (he will have — tener)", answer: "tendrá" },
      { prompt: "Nosotros ____ a encontrar el sombrero. (ir)", answer: "vamos" },
      { prompt: "El ladrón dijo que pronto ____ a hacerse rico. (ir)", answer: "iba" },
    ],
    secondDrill: {
      title: "Translate the future",
      instructions: "Write each line in Spanish using ir a + infinitive or the simple future.",
      items: [
        { prompt: "'I'm going to study.' →", answer: "Voy a estudiar" },
        { prompt: "'She is going to present a robot.' →", answer: "Ella va a presentar un robot" },
        { prompt: "'Next year I will be a programmer.' →", answer: "El año que viene seré programador" },
        { prompt: "'We are going to find the hat.' →", answer: "Vamos a encontrar el sombrero" },
        { prompt: "'He will have his own company.' →", answer: "Tendrá su propia empresa" },
      ],
    },
  },
};

/** Fallback for units without an authored grammar lesson yet. */
export function getGrammarLesson(unitNumber: number, description: string): GrammarLesson {
  return (
    GRAMMAR[unitNumber] ?? {
      title: "Grammar Focus",
      briefing: description || "Review the vocabulary and grammar structures from this unit.",
      examples: [],
      drills: [],
    }
  );
}
