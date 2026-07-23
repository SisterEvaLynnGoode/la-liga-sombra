// Teaching "scroll-through world" configs, one per unit. Each section is a scene
// the camera flies through; the copy teaches that unit's vocabulary + grammar.
// Assets: /scroll-worlds/unit-0N/sceneK.jpg (poster) + vid/sceneK.mp4 (camera leg).

export interface WorldSection {
  id: string;
  label: string;      // nav rail label
  accent: string;     // per-section accent hex
  eyebrow: string;
  title: string;
  body: string;
  tags?: string[];    // vocab / grammar pills (0–4)
  scroll?: number;    // optional dwell override
  linger?: number;    // optional mid-scene settle (0–0.6)
}

export interface WorldConfig {
  unitNumber: number;
  country: string;
  city: string;
  focus: string;      // one-line "what this world teaches"
  published?: boolean; // false = config exists but assets not shipped yet (hidden)
  sections: WorldSection[];
}

/** A world is usable only when it exists AND its assets are published. */
export function hasWorld(unitNumber: number): boolean {
  const w = WORLDS[unitNumber];
  return !!w && w.published !== false;
}

const GOLD = "#e8b455";
const RED = "#c0392b";
const BLUE = "#2980b9";

export const WORLDS: Record<number, WorldConfig> = {
  1: {
    unitNumber: 1,
    country: "México",
    city: "Guadalajara",
    focus: "Greetings, introductions & ser vs. tener",
    sections: [
      {
        id: "plaza", label: "La Plaza", accent: GOLD,
        eyebrow: "Unidad 1 · Guadalajara, México",
        title: "Llega a la plaza y saluda.",
        body: "You land in Guadalajara at golden hour. Everyone greets each other — so start here: the words that open every door in Spanish.",
        tags: ["hola", "buenos días", "buenas tardes", "buenas noches"],
        scroll: 1.6, linger: 0.4,
      },
      {
        id: "tienda", label: "La Tienda", accent: GOLD,
        eyebrow: "Presentarse",
        title: "Preséntate con Don Rodrigo.",
        body: "The guitar-shop owner is a witness. Be polite and introduce yourself — courtesy is how a detective gets people to talk.",
        tags: ["me llamo…", "¿cómo te llamas?", "por favor", "gracias", "de nada"],
        linger: 0.35,
      },
      {
        id: "mapa", label: "El Mapa", accent: BLUE,
        eyebrow: "¿De dónde eres?",
        title: "Origen: de dónde es cada quien.",
        body: "Suspects come from all over México. Learn to ask and answer where someone is from — it separates your thief from the crowd.",
        tags: ["¿de dónde eres?", "soy de…", "él/ella es de…"],
        linger: 0.35,
      },
      {
        id: "gramatica", label: "Gramática", accent: RED,
        eyebrow: "Gramática clave · SER vs. TENER",
        title: "Ser dice quién eres. Tener dice la edad.",
        body: "Use SER for identity and origin — soy de Guadalajara. Use TENER for age — tengo 34 años (never “soy 34”). The witness's clue hides in exactly this difference.",
        tags: ["soy / eres / es", "tengo / tienes / tiene", "tener = edad"],
        scroll: 1.7, linger: 0.5,
      },
      {
        id: "museo", label: "El Caso", accent: GOLD,
        eyebrow: "El caso está abierto",
        title: "La Guitarra del Sol ha desaparecido.",
        body: "You have the words. Now use them: talk to witnesses, read the clues, and catch El Camaleón before he slips away.",
        tags: ["El Camaleón", "Museo de la Música"],
        scroll: 1.8, linger: 0.45,
      },
    ],
  },

  2: {
    unitNumber: 2,
    country: "Puerto Rico",
    city: "San Juan",
    focus: "Classroom objects & describing people (ser + adjectives)",
    sections: [
      {
        id: "sanjuan", label: "San Juan", accent: BLUE,
        eyebrow: "Unidad 2 · Viejo San Juan, Puerto Rico",
        title: "Llegas a la escuela.",
        body: "Someone robbed the school computer lab in Old San Juan. The principal saw the thief — you'll need the words for the classroom and for describing a person.",
        tags: ["la escuela", "hola de nuevo"],
        scroll: 1.6, linger: 0.4,
      },
      {
        id: "clase", label: "La Clase", accent: GOLD,
        eyebrow: "Objetos de la clase",
        title: "Nombra todo en el salón.",
        body: "Learn the objects of the classroom and the computer lab — the crime scene is full of them, and one is missing.",
        tags: ["la silla", "la mochila", "el cuaderno", "el teclado", "los auriculares"],
        linger: 0.35,
      },
      {
        id: "descripciones", label: "Descripciones", accent: RED,
        eyebrow: "Gramática clave · SER + adjetivos",
        title: "¿Cómo es el sospechoso?",
        body: "Use SER with adjectives to describe people — es alto, es moreno, es trabajador. Watch agreement: alto/alta, serio/seria. The principal's description is your best clue.",
        tags: ["es alto / baja", "es moreno / rubia", "adjetivos concuerdan"],
        scroll: 1.7, linger: 0.5,
      },
      {
        id: "laboratorio", label: "El Caso", accent: BLUE,
        eyebrow: "El caso está abierto",
        title: "Robaron el laboratorio de computadoras.",
        body: "Describe each suspect with what you've learned and match the principal's account. El Tecladista never takes off his headphones — find him.",
        tags: ["El Tecladista", "los auriculares"],
        scroll: 1.8, linger: 0.45,
      },
    ],
  },

  3: {
    unitNumber: 3,
    country: "España",
    city: "Madrid",
    focus: "Places, transport & the verb ir",
    published: false, // assets rendering — flip to true when unit-03 clips ship
    sections: [
      {
        id: "granvia", label: "Gran Vía", accent: GOLD,
        eyebrow: "Unidad 3 · Madrid, España",
        title: "Persigue a La Sombra por Madrid.",
        body: "An art thief stole a Velázquez from the Prado. To follow her trail across the city, you need places, transport, and one essential verb: ir.",
        tags: ["la Gran Vía", "la Puerta del Sol"],
        scroll: 1.6, linger: 0.4,
      },
      {
        id: "transporte", label: "Transporte", accent: BLUE,
        eyebrow: "Ir + transporte",
        title: "¿Cómo vas? ¿Adónde vas?",
        body: "Use IR to say where you're going — voy, vas, va. Pair it with transport: voy en metro, voy en autobús, voy a pie.",
        tags: ["voy / vas / va", "en metro", "en autobús", "a pie"],
        linger: 0.35,
      },
      {
        id: "lugares", label: "Lugares", accent: RED,
        eyebrow: "Gramática clave · IR A + lugar",
        title: "Sigue sus pasos de lugar en lugar.",
        body: "IR A + a place tracks her route: va al museo, va a la plaza, va a la estación. Remember a + el = al. Each stop is a clue.",
        tags: ["voy al museo", "a la plaza", "a + el = al"],
        scroll: 1.7, linger: 0.5,
      },
      {
        id: "prado", label: "El Caso", accent: GOLD,
        eyebrow: "El caso está abierto",
        title: "Falta un Velázquez en el Prado.",
        body: "Trace La Sombra's path through Madrid and cut her off. Her signature: a small paper origami flower left at the scene.",
        tags: ["La Sombra", "el Museo del Prado"],
        scroll: 1.8, linger: 0.45,
      },
    ],
  },
};

export function worldAsset(unitNumber: number, sceneIndex: number, kind: "still" | "clip"): string {
  const u = String(unitNumber).padStart(2, "0");
  const n = sceneIndex + 1;
  return kind === "still"
    ? `/scroll-worlds/unit-${u}/scene${n}.jpg`
    : `/scroll-worlds/unit-${u}/vid/scene${n}.mp4`;
}
