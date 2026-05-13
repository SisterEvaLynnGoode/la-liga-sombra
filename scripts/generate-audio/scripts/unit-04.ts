import type { AudioScript } from "../types.js";

// ─── Unit 4 — Costa Rica — La Familia Sospechosa ─────────────────────────────
// Voice: female1 (grandmother Rosa, sad and worried)
// style: 25 — intentionally higher to convey emotion.
// If the output sounds theatrical/melodramatic on playback, regenerate
// with style: 10 (change the value below and run --unit 4 again).

export const unit04Scripts: AudioScript[] = [
  {
    unitNumber: 4,
    filename: "abuela-voicemail.mp3",
    outputPath: "public/audio/unit-04/abuela-voicemail.mp3",
    description: "Grandmother Rosa describes her family (Costa Rica)",
    voiceSettings: {
      stability:       75,
      similarityBoost: 75,
      style:           25,   // ← lower to 10 if output sounds melodramatic
      speed:         0.85,
    },
    lines: [
      {
        voiceKey: "female1",
        text:
          'Hola, <break time="0.5s"/> habla la abuela Rosa. <break time="0.7s"/> Estoy muy triste. <break time="0.5s"/> Mi collar de esmeraldas no está. <break time="0.7s"/> Mi familia es muy importante para mí. <break time="0.5s"/> Mi hijo está contento. <break time="0.3s"/> Está en su trabajo. <break time="0.7s"/> Mi hija está cansada. <break time="0.3s"/> Está en la cocina. <break time="0.7s"/> Mi nieto está nervioso. <break time="0.5s"/> Dice que está en la escuela, <break time="0.3s"/> pero no es verdad. <break time="0.7s"/> Mi nieta está preocupada por mí. <break time="0.3s"/> Es muy buena. <break time="0.7s"/> ¿Quién tiene mi collar? <break time="0.5s"/> Por favor, <break time="0.3s"/> ayuda.',
      },
    ],
  },
];
