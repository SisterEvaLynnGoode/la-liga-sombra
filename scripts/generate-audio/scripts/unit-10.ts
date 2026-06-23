import type { AudioScript } from "../types.js";

// ─── Unit 10 — Ecuador — La Expo del Futuro ───────────────────────────────────
// Voice: male1 (Expo guard, matter-of-fact witness).
// Text matches the transcript in content/unit-10.json verbatim so the listening
// stage and its transcript fallback stay in sync.

export const unit10Scripts: AudioScript[] = [
  {
    unitNumber: 10,
    filename: "guardia-testimonio.mp3",
    outputPath: "public/audio/unit-10/guardia-testimonio.mp3",
    description: "Expo guard describes the thief and his future-tense plans (Ecuador)",
    voiceSettings: {
      stability:       80,
      similarityBoost: 75,
      style:           10,
      speed:         0.9,
    },
    lines: [
      {
        voiceKey: "male1",
        text:
          'Buenas tardes. <break time="0.5s"/> Soy el guardia de la Expo. <break time="0.6s"/> Vi al ladrón. <break time="0.6s"/> Es un hombre alto <break time="0.3s"/> con un abrigo oscuro. <break time="0.6s"/> Su abrigo tiene un bolsillo interior muy grande. <break time="0.6s"/> No presentó ningún proyecto. <break time="0.6s"/> Le pregunté sobre su invento. <break time="0.5s"/> Me dijo: <break time="0.3s"/> "Pronto voy a hacerme rico." <break time="0.6s"/> No habló de su carrera. <break time="0.6s"/> Se quedó mucho tiempo junto a la vitrina del sombrero. <break time="0.6s"/> Cuando empezaron las presentaciones, <break time="0.3s"/> él salió rápido. <break time="0.6s"/> Después vi la vitrina vacía. <break time="0.6s"/> El año que viene <break time="0.3s"/> voy a poner más cámaras en la Expo.',
      },
    ],
  },
];
