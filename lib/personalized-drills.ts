/**
 * Training Room — personalized drill generators
 *
 * Pure utility file: no server dependencies.
 * Import freely from client components and API routes.
 */

import { shuffle } from "@/lib/games/utils";
import type { VocabPair, FlashcardItem } from "@/lib/games/types";

// ── Vocab item with mastery context ───────────────────────────────────────────

export interface VocabDrillItem extends VocabPair {
  audio?: string;
  unitNumber: number;
  accuracy: number;  // 0–1 (correct / attempts); -1 if never seen
  attempts: number;
}

// ── Vocab drill generator ─────────────────────────────────────────────────────

/** Priority tiers for vocab review, lowest priority first. */
function tier(item: VocabDrillItem): number {
  if (item.attempts === 0 || item.accuracy === -1) return 2; // unseen — medium priority
  if (item.accuracy < 0.6 && item.attempts >= 3) return 4;  // struggling — top priority
  if (item.attempts < 3) return 3;                          // barely seen
  if (item.accuracy < 0.85) return 1;                       // developing
  return 0;                                                  // mastered — low priority review
}

/** Return vocab items sorted by priority (struggling first). */
export function prioritizeVocab(items: VocabDrillItem[]): VocabDrillItem[] {
  return [...items].sort((a, b) => tier(b) - tier(a) || Math.random() - 0.5);
}

/** Build VocabPair[] and FlashcardItem[] slices from prioritized vocab. */
export function buildVocabDrillSets(items: VocabDrillItem[], count: number) {
  const top = prioritizeVocab(items).slice(0, count);
  const pairs: VocabPair[] = top.map((i) => ({ spanish: i.spanish, english: i.english }));
  const flashcards: FlashcardItem[] = top.map((i) => ({ prompt: i.spanish, answer: i.english }));
  return { pairs, flashcards, items: top };
}

// ── Definiciones question builder ─────────────────────────────────────────────

export interface DefinicionesQuestion {
  spanish: string;
  audio?: string;
  answer: string;
  options: string[];  // 4 choices
  correctIndex: number;
  unitNumber: number;
}

export function buildDefinicionesQuestions(
  items: VocabDrillItem[],
  count = 12
): DefinicionesQuestion[] {
  const pool   = prioritizeVocab(items).slice(0, count * 2);
  const allEng = items.map((i) => i.english);
  const out: DefinicionesQuestion[] = [];

  for (const item of pool) {
    if (out.length >= count) break;
    const distractors = shuffle(allEng.filter((e) => e !== item.english)).slice(0, 3);
    if (distractors.length < 3) continue;
    const opts = shuffle([item.english, ...distractors]);
    out.push({
      spanish: item.spanish,
      audio: item.audio,
      answer: item.english,
      options: opts,
      correctIndex: opts.indexOf(item.english),
      unitNumber: item.unitNumber,
    });
  }
  return out;
}

// ── Grammar concepts ──────────────────────────────────────────────────────────

export interface GrammarQuestion {
  prompt: string;      // sentence with ___ gap or translation cue
  answer: string;      // correct fill-in
  options: string[];   // 4 MC options (correct included)
  correctIndex: number;
  hint?: string;
}

export interface GrammarConcept {
  id: string;
  labelEs: string;
  labelEn: string;
  unitNumbers: number[];  // which units teach this concept
  questions: GrammarQuestion[];
}

export const GRAMMAR_CONCEPTS: GrammarConcept[] = [
  // ── Unit 1 ────────────────────────────────────────────────────────────────
  {
    id: "greetings",
    labelEs: "Saludos y presentaciones",
    labelEn: "Greetings & introductions",
    unitNumbers: [1],
    questions: [
      { prompt: "¿Cómo ___ llamas?",      answer: "te",       options: ["te","me","le","se"],         correctIndex: 0, hint: "Refers to 'tú'" },
      { prompt: "___ llamo Ana.",          answer: "Me",       options: ["Me","Te","Le","Se"],         correctIndex: 0 },
      { prompt: "Buenos días = ___",       answer: "good morning", options: ["good morning","good night","goodbye","please"], correctIndex: 0 },
      { prompt: "Soy ___ España.",         answer: "de",       options: ["de","a","en","para"],        correctIndex: 0, hint: "origin" },
      { prompt: "Por favor = ___",         answer: "please",   options: ["please","thank you","you're welcome","goodbye"], correctIndex: 0 },
      { prompt: "De ___. (you're welcome)", answer: "nada",   options: ["nada","noche","favor","gracias"], correctIndex: 0 },
      { prompt: "¿___ dónde eres?",        answer: "De",       options: ["De","A","En","Para"],        correctIndex: 0 },
      { prompt: "Buenas ___ (good night).", answer: "noches", options: ["noches","tardes","días","mañanas"], correctIndex: 0 },
    ],
  },
  // ── Unit 2 ────────────────────────────────────────────────────────────────
  {
    id: "ser_adjectives",
    labelEs: "Ser + adjetivos",
    labelEn: "Ser + adjectives (descriptions)",
    unitNumbers: [2],
    questions: [
      { prompt: "Él ___ alto y serio.",        answer: "es",    options: ["es","está","son","están"],     correctIndex: 0 },
      { prompt: "Ellas ___ inteligentes.",      answer: "son",   options: ["son","es","están","está"],     correctIndex: 0 },
      { prompt: "Yo ___ estudiante.",           answer: "soy",   options: ["soy","estoy","es","está"],     correctIndex: 0 },
      { prompt: "Nosotros ___ de Puerto Rico.", answer: "somos", options: ["somos","estamos","son","están"], correctIndex: 0 },
      { prompt: "¿Tú ___ alto o bajo?",        answer: "eres",  options: ["eres","estás","es","son"],     correctIndex: 0 },
      { prompt: "La chica ___ amable.",         answer: "es",    options: ["es","está","son","están"],     correctIndex: 0 },
      { prompt: "¿Cómo ___ el sospechoso?",    answer: "es",    options: ["es","está","son","están"],     correctIndex: 0, hint: "asking for a description" },
      { prompt: "Ustedes ___ trabajadores.",    answer: "son",   options: ["son","es","están","está"],     correctIndex: 0 },
    ],
  },
  // ── Unit 3 ────────────────────────────────────────────────────────────────
  {
    id: "ir_places",
    labelEs: "Ir + lugares y transportes",
    labelEn: "Ir + places & transportation",
    unitNumbers: [3],
    questions: [
      { prompt: "Ella ___ al museo en metro.",      answer: "va",     options: ["va","voy","van","vamos"],    correctIndex: 0 },
      { prompt: "Yo ___ a la plaza a pie.",         answer: "voy",    options: ["voy","va","vamos","van"],    correctIndex: 0 },
      { prompt: "Nosotros ___ al parque en autobús.", answer: "vamos", options: ["vamos","van","voy","va"],  correctIndex: 0 },
      { prompt: "¿Cómo ___ tú a la escuela?",      answer: "vas",    options: ["vas","va","voy","van"],      correctIndex: 0 },
      { prompt: "Ellos ___ al centro en taxi.",     answer: "van",    options: ["van","va","voy","vamos"],    correctIndex: 0 },
      { prompt: "Voy ___ la tienda.",               answer: "a",      options: ["a","en","de","para"],        correctIndex: 0, hint: "destination" },
      { prompt: "Ella va a la plaza ___ pie.",      answer: "a",      options: ["a","en","por","de"],         correctIndex: 0, hint: "a pie = on foot" },
      { prompt: "Van ___ autobús.",                 answer: "en",     options: ["en","a","de","por"],         correctIndex: 0, hint: "by vehicle" },
    ],
  },
  // ── Unit 4 ────────────────────────────────────────────────────────────────
  {
    id: "ser_vs_estar",
    labelEs: "Ser vs. estar",
    labelEn: "Ser vs. estar",
    unitNumbers: [4],
    questions: [
      { prompt: "El collar ___ en la habitación.",   answer: "está", options: ["está","es","están","son"],  correctIndex: 0, hint: "location" },
      { prompt: "La abuela ___ una persona generosa.", answer: "es", options: ["es","está","son","están"],  correctIndex: 0, hint: "identity/characteristic" },
      { prompt: "El nieto ___ nervioso ahora.",      answer: "está", options: ["está","es","son","están"],  correctIndex: 0, hint: "temporary state" },
      { prompt: "La familia ___ de Costa Rica.",     answer: "es",   options: ["es","está","son","están"],  correctIndex: 0, hint: "origin" },
      { prompt: "Ella ___ contenta hoy.",            answer: "está", options: ["está","es","son","están"],  correctIndex: 0, hint: "how someone feels right now" },
      { prompt: "La finca ___ en las montañas.",     answer: "está", options: ["está","es","son","están"],  correctIndex: 0, hint: "physical location" },
      { prompt: "El collar ___ de esmeraldas.",      answer: "es",   options: ["es","está","son","están"],  correctIndex: 0, hint: "material/composition" },
      { prompt: "Marco ___ el nieto de la abuela.", answer: "es",    options: ["es","está","son","están"],  correctIndex: 0, hint: "relationship/identity" },
    ],
  },
  // ── Unit 5 ────────────────────────────────────────────────────────────────
  {
    id: "tener_pronouns",
    labelEs: "Tener + pronombres de objeto directo",
    labelEn: "Tener + direct object pronouns (lo/la/los/las)",
    unitNumbers: [5],
    questions: [
      { prompt: "Yo ___ una computadora portátil.",  answer: "tengo",  options: ["tengo","tiene","tienes","tienen"],  correctIndex: 0 },
      { prompt: "¿Tú ___ el disco duro?",            answer: "tienes", options: ["tienes","tengo","tiene","tienen"],  correctIndex: 0 },
      { prompt: "Ella compró el disco duro. Ella ___ compró.", answer: "lo", options: ["lo","la","los","las"], correctIndex: 0, hint: "el disco duro = masculine singular" },
      { prompt: "Tomaron las contraseñas. ___ tomaron.", answer: "Las", options: ["Las","Los","Lo","La"],    correctIndex: 0, hint: "las contraseñas = feminine plural" },
      { prompt: "Vi la mochila. ___ vi en el edificio.", answer: "La",  options: ["La","Lo","Los","Las"],    correctIndex: 0, hint: "la mochila = feminine singular" },
      { prompt: "Él tiene 28 años. ___ 28 años.",    answer: "Tiene",  options: ["Tiene","Tengo","Tienes","Tienen"],  correctIndex: 0 },
      { prompt: "Nosotros ___ que encontrar al hacker.", answer: "tenemos", options: ["tenemos","tienen","tengo","tienes"], correctIndex: 0 },
      { prompt: "Vi los archivos. ___ encontré en la computadora.", answer: "Los", options: ["Los","Las","Lo","La"], correctIndex: 0, hint: "los archivos = masculine plural" },
    ],
  },
  // ── Unit 6 ────────────────────────────────────────────────────────────────
  {
    id: "tener_que",
    labelEs: "Tener que + infinitivo y verbos de cambio radical",
    labelEn: "Tener que + infinitive & stem-changing verbs",
    unitNumbers: [6],
    questions: [
      { prompt: "Yo ___ que preparar la sopa.",        answer: "tengo",   options: ["tengo","tiene","tienes","tienen"],    correctIndex: 0 },
      { prompt: "El cocinero ___ que limpiar las verduras.", answer: "tiene", options: ["tiene","tengo","tienes","tienen"], correctIndex: 0 },
      { prompt: "Quiero usar ___ cuchillo. (this one, near me)", answer: "este", options: ["este","ese","aquel","el"],      correctIndex: 0, hint: "near the speaker" },
      { prompt: "¿___ (do you want) salir pronto?",    answer: "Quieres", options: ["Quieres","Quiero","Quiere","Queremos"], correctIndex: 0 },
      { prompt: "Yo ___ (can) ayudarte.",               answer: "puedo",   options: ["puedo","puede","puedes","podemos"],  correctIndex: 0 },
      { prompt: "___ (she prefers) la receta original.", answer: "Prefiere", options: ["Prefiere","Prefiero","Prefieres","Prefieren"], correctIndex: 0 },
      { prompt: "Él necesita salir. Él tiene que ___.", answer: "salir",   options: ["salir","sale","salgo","saliendo"],   correctIndex: 0, hint: "tener que + infinitive" },
      { prompt: "Nosotros ___ que encontrar la receta.", answer: "tenemos", options: ["tenemos","tienen","tengo","tienes"], correctIndex: 0 },
    ],
  },
  // ── Unit 7 ────────────────────────────────────────────────────────────────
  {
    id: "present_progressive",
    labelEs: "Presente progresivo (estar + gerundio)",
    labelEn: "Present progressive (estar + -ndo)",
    unitNumbers: [7],
    questions: [
      { prompt: "El técnico está ___ por la puerta. (salir)", answer: "saliendo",   options: ["saliendo","salendo","saliando","salir"],       correctIndex: 0 },
      { prompt: "La cantante está ___ en el escenario. (cantar)", answer: "cantando", options: ["cantando","cantendo","cantundo","cantar"],   correctIndex: 0 },
      { prompt: "Nosotros estamos ___ al saboteador. (buscar)", answer: "buscando",  options: ["buscando","buscendo","buscindo","buscar"],  correctIndex: 0 },
      { prompt: "Él está ___ mensajes. (escribir)",            answer: "escribiendo", options: ["escribiendo","escribando","escribeando","escribir"], correctIndex: 0 },
      { prompt: "Hablar → gerundio: ___",                       answer: "hablando",  options: ["hablando","hablendo","hablindo","hablar"],  correctIndex: 0 },
      { prompt: "Comer → gerundio: ___",                        answer: "comiendo",  options: ["comiendo","comanda","comundo","comer"],      correctIndex: 0 },
      { prompt: "Ella está ___ un mensaje. (leer)",             answer: "leyendo",   options: ["leyendo","leendo","leiendo","leer"],          correctIndex: 0, hint: "stem-changing: e→y" },
      { prompt: "¿Qué está haciendo él? → He ___ something.",   answer: "is doing",  options: ["is doing","does","did","will do"],             correctIndex: 0 },
    ],
  },
  // ── Unit 8 ────────────────────────────────────────────────────────────────
  {
    id: "preterite_ar",
    labelEs: "Pretérito — verbos -AR",
    labelEn: "Preterite tense (-AR verbs)",
    unitNumbers: [8],
    questions: [
      { prompt: "El ladrón ___ temprano al mercado. (llegar)",   answer: "llegó",       options: ["llegó","llega","llegaba","llegará"],        correctIndex: 0 },
      { prompt: "Doña Rosa ___ al hombre. (mirar)",              answer: "miró",        options: ["miró","mira","miraba","mirará"],            correctIndex: 0 },
      { prompt: "Ella ___ la figura. (comprar)",                  answer: "compró",      options: ["compró","compra","compraba","comprará"],    correctIndex: 0 },
      { prompt: "Yo ___ al sospechoso. (mirar)",                  answer: "miré",        options: ["miré","miro","miraba","miraré"],            correctIndex: 0 },
      { prompt: "Tú ___ la figura ayer. (comprar)",               answer: "compraste",   options: ["compraste","compras","compraba","compró"],  correctIndex: 0 },
      { prompt: "Ellos ___ en el mercado. (caminar)",             answer: "caminaron",   options: ["caminaron","caminan","caminaban","caminarán"], correctIndex: 0 },
      { prompt: "Él ___ con el vendedor. (hablar)",               answer: "habló",       options: ["habló","habla","hablaba","hablará"],        correctIndex: 0 },
      { prompt: "El agente ___ la pista. (encontrar)",            answer: "encontró",    options: ["encontró","encuentra","encontraba","encontrará"], correctIndex: 0 },
    ],
  },
];

/** Look up a concept by id. */
export function getGrammarConcept(id: string): GrammarConcept | undefined {
  return GRAMMAR_CONCEPTS.find((c) => c.id === id);
}

/** Return shuffled questions for a concept (up to `count`). */
export function getGrammarDrillQuestions(conceptId: string, count = 8): GrammarQuestion[] {
  const concept = getGrammarConcept(conceptId);
  if (!concept) return [];
  return shuffle(concept.questions).slice(0, count);
}
