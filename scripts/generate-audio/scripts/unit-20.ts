import type { AudioScript } from "../types.js";

// ─── Unit 20 — Bolivia — La Clave de la Puerta del Sol ───
// female1 is Nayra the guardian, who speaks in the imperfect; male2 is El Cronista, who recites the preterite. That contrast IS the lesson.
//
// The transcript matches the listeningComp stage in content/unit-20.json
// verbatim. The comprehension questions key off these exact words, so any edit
// here must be mirrored there.

export const unit20Scripts: AudioScript[] = [
  {
    unitNumber: 20,
    filename: "templo-tiwanaku.mp3",
    outputPath: "public/audio/unit-20/templo-tiwanaku.mp3",
    description: "Two-voice exchange at the Sun Gate (Tiwanaku, Bolivia)",
    voiceSettings: {
      stability:       70,
      similarityBoost: 75,
      style:            0,
      speed:          0.9,
    },
    lines: [
      { voiceKey: "female1", text: "Este lugar era enorme, ¿verdad? Había mercados, vivía mucha gente." },
      { voiceKey: "male2", text: "Sí. Y el templo tenía puertas de oro. Mi madre me lo contaba así." },
      { voiceKey: "female1", text: "Tiwanaku fue fundada, creció, dominó la región y cayó. Cuatro fechas." },
      { voiceKey: "male2", text: "Usted lo dice como un libro." },
      { voiceKey: "female1", text: "Es lo que pasó. Dígame una cosa: ¿cuál de estas piedras es la clave?" },
      { voiceKey: "male2", text: "¿Por qué quiere saberlo?" },
      { voiceKey: "female1", text: "Curiosidad. Todas parecen iguales." },
      { voiceKey: "male2", text: "Por eso no se lo digo." },
      { voiceKey: "female1", text: "¿Y a qué hora se queda usted sola aquí?" },
      { voiceKey: "male2", text: "Buenas noches, señor." },
    ],
  },
];
