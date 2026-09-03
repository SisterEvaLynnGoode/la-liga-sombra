import type { AudioScript } from "../types.js";

// ─── Unit 19 — Venezuela — El Mapa del Explorador ───
// male1 is a camp witness; male2 is El Cronista. Preterite forms (llovio, subio, vio) carry the questions.
//
// The transcript matches the listeningComp stage in content/unit-19.json
// verbatim. The comprehension questions key off these exact words, so any edit
// here must be mirrored there.

export const unit19Scripts: AudioScript[] = [
  {
    unitNumber: 19,
    filename: "campamento-canaima.mp3",
    outputPath: "public/audio/unit-19/campamento-canaima.mp3",
    description: "Two-voice exchange at a jungle camp (Canaima, Venezuela, 1937)",
    voiceSettings: {
      stability:       70,
      similarityBoost: 75,
      style:            0,
      speed:          0.9,
    },
    lines: [
      { voiceKey: "male1", text: "Buenos días. ¿Usted llegó con la expedición?" },
      { voiceKey: "male2", text: "No. Llegué esta mañana." },
      { voiceKey: "male1", text: "Entonces no vio lo de anoche." },
      { voiceKey: "male2", text: "Sé lo que pasó. Llovió sin parar, el río subió, y nadie subió al tepuy. El explorador vio la cascada solo un minuto: había mucha niebla." },
      { voiceKey: "male1", text: "¿Y cómo sabe usted todo eso?" },
      { voiceKey: "male2", text: "Hablé con gente." },
      { voiceKey: "male1", text: "Con nadie de aquí. Yo estuve despierto toda la noche. Y otra cosa: usted salió al camino hace un rato y volvió con los zapatos secos. Ahí fuera hay barro hasta las rodillas." },
      { voiceKey: "male2", text: "Caminé por las piedras. Dígame, ¿el mapa del explorador está en aquella carpa?" },
      { voiceKey: "male1", text: "¿Por qué le interesa tanto esa carpa?" },
    ],
  },
];
