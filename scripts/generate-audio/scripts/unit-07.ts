import type { AudioScript } from "../types.js";

// ─── Unit 7 — Chile — Sabotaje en el Festival ────────────────────────────────
// Voice: female2 (excited live witness at Festival de Viña del Mar)
// female2 → same voice ID as female1 on the free plan (both bOOZjzcdtbUH2pLKbsbr).
//
// stability: 60, style: 30 — intentionally high emotion for witness urgency.
// ⚠ If playback sounds cartoonish or melodramatic, tune and regenerate:
//   stability: 68, style: 15, speed: 0.92
//   → change below, then: npm run audio:generate -- --unit 7

export const unit07Scripts: AudioScript[] = [
  {
    unitNumber: 7,
    filename: "festival-witness.mp3",
    outputPath: "public/audio/unit-07/festival-witness.mp3",
    description: "Excited witness reports live at Festival de Viña del Mar (Chile)",
    voiceSettings: {
      stability:       60,   // ← raise to 68 if output sounds cartoonish
      similarityBoost: 75,
      style:           30,   // ← lower to 15 if too melodramatic
      speed:         0.92,
    },
    lines: [
      {
        voiceKey: "female2",
        text:
          '¡Lo veo! <break time="0.5s"/> ¡Está aquí! <break time="0.7s"/> El sospechoso está corriendo por el festival. <break time="0.5s"/> Está poniendo algo en el escenario. <break time="0.7s"/> Es un hombre joven. <break time="0.3s"/> Es bailarín. <break time="0.5s"/> No es cantante. <break time="0.7s"/> Está jugando con los cables. <break time="0.5s"/> Ahora está volviendo al escenario principal. <break time="0.7s"/> Está dando algo a otra persona. <break time="0.5s"/> Es la tercera persona desde la izquierda. <break time="0.7s"/> Hace mucho calor aquí. <break time="0.3s"/> Estamos en verano. <break time="0.5s"/> ¡Atrápenlo!',
      },
    ],
  },
];
