import type { AudioScript } from "../types.js";

// ─── Unit 2 — Puerto Rico — El Robo en la Escuela ────────────────────────────
// Voice: male1 (school principal, authoritative tone)

export const unit02Scripts: AudioScript[] = [
  {
    unitNumber: 2,
    filename: "principal-voicemail.mp3",
    outputPath: "public/audio/unit-02/principal-voicemail.mp3",
    description: "School principal describes the suspect (Puerto Rico)",
    voiceSettings: {
      stability:       72,
      similarityBoost: 75,
      style:            0,
      speed:          0.88,
    },
    lines: [
      {
        voiceKey: "male1",
        text:
          'Buenos días, <break time="0.3s"/> habla el director de la escuela. <break time="0.5s"/> Tengo información sobre el sospechoso. <break time="0.7s"/> Es un estudiante alto. <break time="0.5s"/> Tiene pelo moreno. <break time="0.5s"/> No es rubio. <break time="0.7s"/> Es muy inteligente. <break time="0.5s"/> Estudia mucho en la biblioteca. <break time="0.5s"/> Usa la computadora todos los días. <break time="0.7s"/> Es de la República Dominicana. <break time="0.5s"/> No es de Puerto Rico. <break time="0.7s"/> Por favor, <break time="0.3s"/> necesito ayuda. <break time="0.3s"/> Gracias.',
      },
    ],
  },
];
