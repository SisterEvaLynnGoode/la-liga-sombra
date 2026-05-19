import type { AudioScript } from "../types.js";

// ─── Unit 1 Cold Case — El Segundo Robo en Guadalajara ────────────────────────
// Cold cases use unitNumber + 100 convention (unitNumber: 101)
// Voice: female1 (different witness from Unit 1 — a male guard, but using female1
//        for the clear delivery style; add voiceKey: "male1" when ready)
// Speed: 0.90 — slightly faster than the original (cold cases are harder)
// Style: 5 — slightly more expressive to convey urgency

export const unit01ColdScripts: AudioScript[] = [
  {
    unitNumber: 101,
    filename: "witness-call-cold.mp3",
    outputPath: "public/audio/unit-01-cold/witness-call.mp3",
    description: "Museum guard Rodolfo Torres reports trumpet theft (México - Unit 1 Cold Case)",
    voiceSettings: {
      stability:       70,
      similarityBoost: 75,
      style:            5,   // slightly more expressive — cold case witness is more agitated
      speed:          0.90,  // slightly faster than original — students should be ready
    },
    lines: [
      {
        voiceKey: "female1",
        text:
          'Buenos días. <break time="0.3s"/> Soy el guardia del museo. <break time="0.3s"/> Me llamo Rodolfo Torres. <break time="0.5s"/> Son las tres y media de la tarde. <break time="0.7s"/> Vi a la mujer que robó la trompeta. <break time="0.5s"/> Tiene cuarenta y cinco años. <break time="0.3s"/> Es alta. <break time="0.3s"/> Tiene pelo negro y largo. <break time="0.5s"/> Lleva ropa negra y formal. <break time="0.5s"/> Tiene un estuche de música muy grande. <break time="0.7s"/> Entró al museo a las dos y cuarenta y cinco. <break time="0.5s"/> Salió a las tres y diez. <break time="0.7s"/> Habló con el conservador. <break time="0.3s"/> Preguntó por la trompeta. <break time="0.7s"/> Después de salir, <break time="0.3s"/> la trompeta no estaba. <break time="0.5s"/> Adiós.',
      },
    ],
  },
];
