import type { AudioScript } from "../types.js";

// ─── Unit 15 Boss — Operación Reloj de Arena ─────────────────────────────────
// Convention: boss audio uses unitNumber = source unit + 100.
// Unit 15 boss → unitNumber: 115
// Voice: male1 (LLS Male 1 LatAm — low, conspiratorial)
// Style: 12 — a man on a phone he does not want overheard
// Speed: 0.88 — the three numbers ARE the puzzle; they must be catchable at 2 replays

export const bossRelojArenaScripts: AudioScript[] = [
  {
    unitNumber: 115,
    filename: "llamada-estudio.mp3",
    outputPath: "public/audio/boss-reloj-arena/llamada-estudio.mp3",
    description: "Studio phone call, Havana 1954 (Unit 15 Boss — Operación Reloj de Arena). Code: 12+30+8=50.",
    voiceSettings: {
      stability:       65,
      similarityBoost: 75,
      style:           12,
      speed:         0.88,
    },
    lines: [
      {
        voiceKey: "male1",
        text:
          'Oye, escúchame bien. <break time="0.5s"/> El disco maestro no está en el estudio esta noche. <break time="0.5s"/> Se lo llevo a Celia, en el malecón. <break time="0.6s"/> Ella me lo pide desde el lunes, <break time="0.3s"/> y yo se lo llevo hoy. <break time="0.6s"/> No se lo digas a nadie, ¿me entiendes? <break time="0.4s"/> A nadie. <break time="0.7s"/> La caja de la puerta tiene tres números: <break time="0.4s"/> primero doce, <break time="0.4s"/> después treinta, <break time="0.4s"/> y al final ocho. <break time="0.6s"/> Súmalos. Ese es el código del estudio. <break time="0.6s"/> Si alguien pregunta, <break time="0.3s"/> tú no sabes nada.',
      },
    ],
  },
];
