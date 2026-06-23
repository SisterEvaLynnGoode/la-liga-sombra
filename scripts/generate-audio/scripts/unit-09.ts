import type { AudioScript } from "../types.js";

// ─── Unit 9 — República Dominicana — El Taíno Robado ──────────────────────────
// Voice: female1 (Nurse Yolanda, calm but suspicious witness).
// Text matches the transcript in content/unit-09.json verbatim so the listening
// stage and its transcript fallback stay in sync.

export const unit09Scripts: AudioScript[] = [
  {
    unitNumber: 9,
    filename: "enfermera-testimonio.mp3",
    outputPath: "public/audio/unit-09/enfermera-testimonio.mp3",
    description: "Nurse Yolanda describes the fake-sick thief (Dominican Republic)",
    voiceSettings: {
      stability:       78,
      similarityBoost: 75,
      style:           12,
      speed:         0.9,
    },
    lines: [
      {
        voiceKey: "female1",
        text:
          'Buenos días. <break time="0.5s"/> Soy la enfermera Yolanda. <break time="0.6s"/> Ayer trabajé toda la mañana. <break time="0.6s"/> Vi a la ladrona. <break time="0.6s"/> Es una mujer con el pelo oscuro <break time="0.3s"/> y un pañuelo rojo. <break time="0.6s"/> Me dijo que le dolía el estómago. <break time="0.6s"/> Se sentó cerca de la vitrina del Taíno. <break time="0.6s"/> Comió un sándwich grande. <break time="0.5s"/> Una persona con dolor de estómago no come así. <break time="0.6s"/> Es más alta que yo. <break time="0.6s"/> Cuando salió de la clínica, <break time="0.3s"/> caminó muy rápido. <break time="0.5s"/> No le dolía nada. <break time="0.6s"/> Yo me sentí muy mal <break time="0.3s"/> cuando vi la vitrina vacía.',
      },
    ],
  },
];
