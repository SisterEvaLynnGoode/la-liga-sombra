/**
 * Per-unit grammar mini-lessons + drills for the printable worksheet packets.
 *
 * Each unit's grammar focus is authored as a detective-framed teaching block:
 *  - title:       the grammar point
 *  - briefing:    a short detective-voiced explanation (student-facing, English)
 *  - examples:    Spanish models with English glosses
 *  - drills:      fill-in items with answers (answer hidden on the student sheet,
 *                 shown on the teacher answer key)
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

export interface GrammarLesson {
  title: string;
  briefing: string;
  examples: GrammarExample[];
  drills: GrammarDrill[];
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
    drills: [
      { prompt: "____ días, detective. (morning greeting)", answer: "Buenos" },
      { prompt: "¿Cómo te ____? (you ask the suspect's name)", answer: "llamas" },
      { prompt: "Me ____ Carmen. (give your own name)", answer: "llamo" },
      { prompt: "¿De ____ eres? (ask where they are from)", answer: "dónde" },
      { prompt: "Soy ____ Guadalajara. (say where you're from)", answer: "de" },
      { prompt: "— Gracias. — De ____.", answer: "nada" },
    ],
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
    drills: [
      { prompt: "El sospechoso ____ alto y moreno. (ser)", answer: "es" },
      { prompt: "Yo ____ español todos los días. (estudiar)", answer: "estudio" },
      { prompt: "La maestra es muy trabajador____. (agree: female)", answer: "a" },
      { prompt: "Nosotros ____ con el testigo. (hablar)", answer: "hablamos" },
      { prompt: "Tú ____ la computadora. (usar)", answer: "usas" },
      { prompt: "Ellos ____ en la escuela. (trabajar)", answer: "trabajan" },
    ],
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
    drills: [
      { prompt: "El sospechoso ____ a la estación de Atocha. (ir)", answer: "va" },
      { prompt: "Voy ____ el Museo del Prado. (ir + preposition)", answer: "a" },
      { prompt: "¿____ va el ladrón? (which question word: where to)", answer: "Adónde" },
      { prompt: "Nosotros ____ por la Gran Vía. (correr)", answer: "corremos" },
      { prompt: "Yo ____ el taxi en la calle. (ver)", answer: "veo" },
      { prompt: "¿____ es el culpable? (which question word: who)", answer: "Quién" },
    ],
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
    drills: [
      { prompt: "El nieto ____ nervioso hoy. (ser/estar — feeling)", answer: "está" },
      { prompt: "La abuela ____ muy generosa. (ser/estar — trait)", answer: "es" },
      { prompt: "Yo ____ en la finca con mi familia. (vivir)", answer: "vivo" },
      { prompt: "____ collar es de esmeraldas. (my)", answer: "Mi" },
      { prompt: "El sospechoso ____ la carta. (escribir)", answer: "escribe" },
      { prompt: "¿Dónde ____ tu hermana ahora? (ser/estar — location)", answer: "está" },
    ],
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
    drills: [
      { prompt: "El sospechoso ____ treinta años. (tener)", answer: "tiene" },
      { prompt: "Yo ____ miedo de la red oscura. (tener)", answer: "tengo" },
      { prompt: "El testigo ____ a Buenos Aires el quince. (venir)", answer: "viene" },
      { prompt: "La suma es quinientos + mil = ____. (number in words)", answer: "mil quinientos" },
      { prompt: "Nosotros ____ prisa, ¡rápido! (tener)", answer: "tenemos" },
      { prompt: "¿Cuántos años ____ tú? (tener)", answer: "tienes" },
    ],
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
    drills: [
      { prompt: "El cocinero ____ usar este cuchillo. (querer, e→ie)", answer: "quiere" },
      { prompt: "Yo no ____ encontrar la receta. (poder, o→ue)", answer: "puedo" },
      { prompt: "Ella ____ el pollo, no el pescado. (preferir, e→ie)", answer: "prefiere" },
      { prompt: "Toma ____ maíz de aquí, no ese. (this, masc.)", answer: "este" },
      { prompt: "El sospechoso ____ a la cocina a las ocho. (volver, o→ue)", answer: "vuelve" },
      { prompt: "¿Quién prepara ____ plato de allá? (that over there, masc.)", answer: "aquel" },
    ],
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
    drills: [
      { prompt: "El bailarín ____ en el festival. (jugar, u→ue → 'performs/plays')", answer: "juega" },
      { prompt: "Yo ____ la pista detrás del escenario. (encontrar, o→ue)", answer: "encuentro" },
      { prompt: "La ____ pista es la más importante. (1st, feminine)", answer: "primera" },
      { prompt: "El sospechoso ____ a las dos de la tarde. (almorzar, o→ue)", answer: "almuerza" },
      { prompt: "Nosotros ____ resolver el caso. (poder, o→ue)", answer: "podemos" },
      { prompt: "El ____ testigo no dice la verdad. (3rd, masculine short form)", answer: "tercer" },
    ],
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
    drills: [
      { prompt: "Ayer Doña Rosa ____ el mercado. (limpiar, preterite yo→ella)", answer: "limpió" },
      { prompt: "El ladrón ____ temprano. (llegar, preterite él)", answer: "llegó" },
      { prompt: "El sospechoso es ____ alto ____ el testigo. (more…than)", answer: "más…que" },
      { prompt: "Yo ____ las figurillas en la caja. (buscar, preterite yo)", answer: "busqué" },
      { prompt: "Don Aurelio no ____ vendió el collar. (to him — pronoun)", answer: "le" },
      { prompt: "Esta pista es ____ que la otra. (better — irregular)", answer: "mejor" },
    ],
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
