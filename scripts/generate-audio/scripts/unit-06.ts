import type { AudioScript } from "../types.js";

// ─── Unit 6 — Colombia — El Chef Misterioso ──────────────────────────────────
// Voice: male2 (Diego the prep cook, conspiratorial tone)
// male2 maps to the same ID as male1 on the free plan — same voice.
// style: 15 adds slight expressiveness to convey his secretive manner.

export const unit06Scripts: AudioScript[] = [
  {
    unitNumber: 6,
    filename: "kitchen-mic.mp3",
    outputPath: "public/audio/unit-06/kitchen-mic.mp3",
    description: "Hidden mic captures chef preparing stolen dish (Colombia)",
    voiceSettings: {
      stability:       72,
      similarityBoost: 75,
      style:           15,
      speed:         0.88,
    },
    lines: [
      {
        voiceKey: "male2",
        text:
          'Tengo que preparar este plato muy rápido. <break time="0.7s"/> Quiero usar estas verduras frescas. <break time="0.5s"/> No quiero esa carne vieja. <break time="0.7s"/> Mi jefe dice que necesito más ingredientes. <break time="0.5s"/> Yo digo que tengo todo aquí. <break time="0.7s"/> Pienso preparar la bandeja paisa. <break time="0.5s"/> Tengo que cocinar el arroz, <break time="0.3s"/> los frijoles, <break time="0.3s"/> y la carne. <break time="0.7s"/> Aquellos platos en la mesa son para los clientes. <break time="0.5s"/> Este plato especial es para mí. <break time="0.7s"/> Puedo hacerlo en treinta minutos.',
      },
    ],
  },
];
