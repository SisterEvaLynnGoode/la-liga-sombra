import type { AudioScript } from "../types.js";

// ─── Unit 5 Boss — Operación Eclipse ─────────────────────────────────────────
// Convention: boss audio uses unitNumber = source unit + 100.
// Unit 5 boss → unitNumber: 105
// Voice: male1 (LLS Male 1 LatAm — conspiratorial, low energy)
// Style: 10 — slightly expressive for a tense intercepted call
// Speed: 0.88 — slow enough to catch the numbers, which are the puzzle key

export const bossEclipseScripts: AudioScript[] = [
  {
    unitNumber: 105,
    filename: "tejedor-call.mp3",
    outputPath: "public/audio/boss-eclipse/tejedor-call.mp3",
    description: "Intercepted call from El Tejedor (Unit 5 Boss — Operación Eclipse). Code: 25+30+19=74.",
    voiceSettings: {
      stability:       65,
      similarityBoost: 75,
      style:           10,   // slightly tense/conspiratorial
      speed:         0.88,   // slow enough to catch the numbers
    },
    lines: [
      {
        voiceKey: "male1",
        text:
          'El Coleccionista quiere los datos antes del veinte de abril. <break time="0.7s"/> Tenemos las computadoras portátiles, <break time="0.3s"/> los celulares, <break time="0.3s"/> y las tabletas. <break time="0.5s"/> Mi hermana viene a Buenos Aires el quince. <break time="0.7s"/> El código es la suma de los años de mis tres víctimas. <break time="0.5s"/> Veinticinco <break time="0.3s"/> más treinta <break time="0.3s"/> más diecinueve. <break time="0.7s"/> Nadie debe saber. <break time="0.5s"/> Adiós.',
      },
    ],
  },
];
