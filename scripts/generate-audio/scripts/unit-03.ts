import type { AudioScript } from "../types.js";

// ─── Unit 3 — España — Persecución por Madrid ─────────────────────────────────
// Voice: male1 (urgent police radio dispatcher)

export const unit03Scripts: AudioScript[] = [
  {
    unitNumber: 3,
    filename: "police-radio.mp3",
    outputPath: "public/audio/unit-03/police-radio.mp3",
    description: "Police radio dispatch during the Madrid chase (España)",
    voiceSettings: {
      stability:       65,
      similarityBoost: 75,
      style:            0,
      speed:          0.85,
    },
    lines: [
      {
        voiceKey: "male1",
        text:
          '¡Atención! <break time="0.5s"/> ¡Atención! <break time="0.5s"/> Tenemos información del sospechoso. <break time="0.7s"/> Está en el Museo Reina Sofía. <break time="0.5s"/> Va a salir muy pronto. <break time="0.7s"/> Primero, <break time="0.3s"/> va a tomar el metro. <break time="0.5s"/> Va a ir al hospital. <break time="0.7s"/> Después, <break time="0.3s"/> va a comer en un restaurante. <break time="0.5s"/> Luego, <break time="0.3s"/> va a beber café en un café cerca del Parque del Retiro. <break time="0.7s"/> Finalmente, <break time="0.3s"/> va a correr a la Estación de Atocha. <break time="0.5s"/> ¿Comprenden? <break time="0.5s"/> ¡Rápido!',
      },
    ],
  },
];
