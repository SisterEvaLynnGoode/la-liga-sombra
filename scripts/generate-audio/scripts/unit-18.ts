import type { AudioScript } from "../types.js";

// ─── Unit 18 — Paraguay — El Patrón de Ñandutí ───
// female1 is dona Ramona; male2 is El Cronista. The tu commands (toma, pon, haz) must land crisply - they are the grammar point.
//
// The transcript matches the listeningComp stage in content/unit-18.json
// verbatim. The comprehension questions key off these exact words, so any edit
// here must be mirrored there.

export const unit18Scripts: AudioScript[] = [
  {
    unitNumber: 18,
    filename: "taller-nanduti.mp3",
    outputPath: "public/audio/unit-18/taller-nanduti.mp3",
    description: "Two-voice exchange in a nanduti lace workshop (Itaugua, Paraguay)",
    voiceSettings: {
      stability:       70,
      similarityBoost: 75,
      style:            0,
      speed:          0.9,
    },
    lines: [
      { voiceKey: "female1", text: "Toma la aguja. Pon el hilo en el centro." },
      { voiceKey: "male2", text: "Perdón, repítamelo, por favor." },
      { voiceKey: "female1", text: "Toma la aguja. Pon el hilo en el centro. Haz un nudo pequeño." },
      { voiceKey: "male2", text: "Muy bien. ¿Y luego?" },
      { voiceKey: "female1", text: "Luego los rayos, y al final el borde. Pero tú no estás tejiendo. Tienes la aguja en la mesa." },
      { voiceKey: "male2", text: "Aprendo mirando. Doña Ramona, ¿el patrón de su abuela está en esa caja?" },
      { voiceKey: "female1", text: "Ese patrón no se toca." },
      { voiceKey: "male2", text: "Claro. ¿Y si alguien lo copiara, tejería igual que usted?" },
      { voiceKey: "female1", text: "No. Tejería el dibujo. Esto se aprende con las manos, no con los ojos." },
      { voiceKey: "male2", text: "Qué lástima. Buenas tardes." },
    ],
  },
];
