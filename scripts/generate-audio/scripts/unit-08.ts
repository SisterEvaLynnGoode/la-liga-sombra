import type { AudioScript } from "../types.js";

// ─── Unit 8 — Perú — El Mercado Robado ───────────────────────────────────────
// Voice: female1 (vendor María, clear and calm, recounting yesterday)
// FIRST preterite-heavy audio in the game — pedagogical priority is
// comprehensibility over expressiveness, hence style: 0 and speed: 0.85.
// The explanations in each question call out the preterite form + infinitive.

export const unit08Scripts: AudioScript[] = [
  {
    unitNumber: 8,
    filename: "vendor-testimony.mp3",
    outputPath: "public/audio/unit-08/vendor-testimony.mp3",
    description: "Market vendor María describes yesterday's theft at San Pedro market (Perú)",
    voiceSettings: {
      stability:       75,
      similarityBoost: 75,
      style:            0,   // clear delivery — no extra expressiveness needed
      speed:          0.85,  // slightly slower for preterite comprehension
    },
    lines: [
      {
        voiceKey: "female1",
        text:
          'Buenos días. <break time="0.5s"/> Me llamo María. <break time="0.3s"/> Trabajo en el mercado. <break time="0.7s"/> Ayer vi al ladrón. <break time="0.5s"/> Él entró al mercado a las diez. <break time="0.7s"/> Compró frutas y verduras. <break time="0.5s"/> Habló con otro hombre. <break time="0.7s"/> Le dio una bolsa grande al otro hombre. <break time="0.5s"/> Después, <break time="0.3s"/> caminó al puesto de artesanías. <break time="0.7s"/> Estuvo allí treinta minutos. <break time="0.5s"/> Es más alto que yo. <break time="0.3s"/> Es menos joven que mi hijo. <break time="0.7s"/> Acabo de hablar con la policía. <break time="0.5s"/> Oí su voz claramente. <break time="0.3s"/> Traje todo lo que recuerdo. <break time="0.7s"/> Necesitan encontrarlo rápido.',
      },
    ],
  },
];
