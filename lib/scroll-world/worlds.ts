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
  sections: WorldSection[];
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
};

export function worldAsset(unitNumber: number, sceneIndex: number, kind: "still" | "clip"): string {
  const u = String(unitNumber).padStart(2, "0");
  const n = sceneIndex + 1;
  return kind === "still"
    ? `/scroll-worlds/unit-${u}/scene${n}.jpg`
    : `/scroll-worlds/unit-${u}/vid/scene${n}.mp4`;
}
