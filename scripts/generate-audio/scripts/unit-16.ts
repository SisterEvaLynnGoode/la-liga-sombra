import type { AudioScript } from "../types.js";

// ─── Unit 16 — Uruguay — El Balón de la Final ───
// male1 is Anibal the kit man; male2 is El Cronista. The tell is that he recites the players' reflexive routine and then asks which ball is 'the good one'.
//
// The transcript matches the listeningComp stage in content/unit-16.json
// verbatim. The comprehension questions key off these exact words, so any edit
// here must be mirrored there.

export const unit16Scripts: AudioScript[] = [
  {
    unitNumber: 16,
    filename: "vestuario-final.mp3",
    outputPath: "public/audio/unit-16/vestuario-final.mp3",
    description: "Two-voice exchange in the changing room before the 1930 World Cup final (Montevideo, Uruguay)",
    voiceSettings: {
      stability:       70,
      similarityBoost: 75,
      style:            0,
      speed:          0.9,
    },
    lines: [
      { voiceKey: "male1", text: "Perdone, señor. Aquí solo entran los jugadores." },
      { voiceKey: "male2", text: "Solo miro. Ellos se levantan a las seis, ¿verdad? Se entrenan, se duchan, y el capitán se peina siempre delante de ese espejo." },
      { voiceKey: "male1", text: "¿Cómo sabe usted eso?" },
      { voiceKey: "male2", text: "Leo mucho. Dígame una cosa: en el descanso, ¿quién guarda el balón?" },
      { voiceKey: "male1", text: "Yo me quedo con el balón. Soy el utilero." },
      { voiceKey: "male2", text: "¿Y cuál de los dos es el bueno?" },
      { voiceKey: "male1", text: "Los dos son buenos. Uno es argentino y otro es uruguayo. ¿Usted no ve fútbol?" },
      { voiceKey: "male2", text: "Yo estudio a las personas. Gracias." },
    ],
  },
];
