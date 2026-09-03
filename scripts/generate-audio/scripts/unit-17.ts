import type { AudioScript } from "../types.js";

// ─── Unit 17 — Panamá — Los Planos del Ingeniero ───
// female1 is the chief engineer; male2 is El Cronista. Keep 'veintiseis metros' clear - a comprehension question keys off the number.
//
// The transcript matches the listeningComp stage in content/unit-17.json
// verbatim. The comprehension questions key off these exact words, so any edit
// here must be mirrored there.

export const unit17Scripts: AudioScript[] = [
  {
    unitNumber: 17,
    filename: "oficina-canal.mp3",
    outputPath: "public/audio/unit-17/oficina-canal.mp3",
    description: "Two-voice exchange in the chief engineer's office (Panama Canal, 1914)",
    voiceSettings: {
      stability:       70,
      similarityBoost: 75,
      style:            0,
      speed:          0.9,
    },
    lines: [
      { voiceKey: "female1", text: "Es impresionante, ingeniero. Esta esclusa es más grande que un estadio moderno." },
      { voiceKey: "male2", text: "¿Más grande que qué?" },
      { voiceKey: "female1", text: "Que… un estadio. Da igual. ¿Cuánto sube el barco aquí?" },
      { voiceKey: "male2", text: "Veintiséis metros. Es la pregunta que hace todo el mundo." },
      { voiceKey: "female1", text: "Veintiséis. Sí, claro. Menos de lo que pensaba." },
      { voiceKey: "male2", text: "¿Menos? Es la obra más grande del mundo." },
      { voiceKey: "female1", text: "Perdón. Quería decir más. Ingeniero, ¿esa caja de madera es donde están los planos originales?" },
      { voiceKey: "male2", text: "Esa caja no le importa a usted." },
      { voiceKey: "female1", text: "Solo tengo curiosidad. Es mejor guardarlos en un lugar más seguro. Buenas noches." },
    ],
  },
];
