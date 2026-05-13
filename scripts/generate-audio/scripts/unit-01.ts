import type { AudioScript } from "../types.js";

// ─── Unit 1 — México — El Misterio del Mariachi Perdido ──────────────────────
// Voice: female1 (primary narrator, neutral Latin American accent)
// Note: stability/similarityBoost are given in 0-100 scale; the client
//       normalises them to 0-1 before sending to the ElevenLabs API.

export const unit01Scripts: AudioScript[] = [
  {
    unitNumber: 1,
    filename: "witness-call.mp3",
    outputPath: "public/audio/unit-01/witness-call.mp3",
    description: "Carmen Ruiz reports the mariachi guitar theft (México)",
    voiceSettings: {
      stability:        70,   // 0-100 → client normalises to 0.70
      similarityBoost:  75,   // 0-100 → client normalises to 0.75
      style:             0,
      speed:          0.88,   // 0.88× — slightly slower for listening comprehension
    },
    lines: [
      {
        voiceKey: "female1",
        text:
          'Hola, <break time="0.3s"/> buenos días. <break time="0.5s"/> Me llamo Carmen Ruiz. <break time="0.5s"/> Soy de Guadalajara. <break time="0.5s"/> Yo vi al hombre que robó la guitarra. <break time="0.7s"/> Son las tres de la tarde. <break time="0.5s"/> El hombre tiene treinta años. <break time="0.5s"/> Tiene bigote. <break time="0.5s"/> No tiene barba. <break time="0.5s"/> Adiós.',
      },
    ],
  },
];
