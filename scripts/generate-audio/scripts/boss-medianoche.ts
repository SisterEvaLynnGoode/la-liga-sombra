import type { AudioScript } from "../types.js";

// ─── Unit 8 Boss — Operación Medianoche ──────────────────────────────────────
// Convention: boss audio uses unitNumber = source unit + 100 → 108.
//
// CAUTION: cold cases use the same +100 convention, so a future Unit 8 cold-case
// clip would also be 108 and `--unit 108` would generate both. Harmless today
// (unit-08-cold.json has no audio script yet) but the two bands should be split
// before that changes — bosses to +200, say.
//
// Voice: male2 — the courier, not the boss. Flat, tired, giving instructions.
// Style: 15 — clipped, someone talking fast in a place they should not be
// Speed: 0.88 — the three hours ARE the puzzle; catchable in two replays

export const bossMedianocheScripts: AudioScript[] = [
  {
    unitNumber: 108,
    filename: "llamada-almacen.mp3",
    outputPath: "public/audio/boss-medianoche/llamada-almacen.mp3",
    description: "Intercepted warehouse call (Unit 8 Boss — Operación Medianoche). Code: 9+10+5=24.",
    voiceSettings: {
      stability:       65,
      similarityBoost: 75,
      style:           15,
      speed:         0.88,
    },
    lines: [
      {
        voiceKey: "male2",
        text:
          'Escúchame. <break time="0.5s"/> Ya guardé todo en la caja del almacén nueve. <break time="0.5s"/> No hablé con nadie, <break time="0.3s"/> no llamé a nadie. <break time="0.6s"/> Anoche los tres llegaron y anoche los tres se fueron, <break time="0.4s"/> y nadie miró dos veces. <break time="0.7s"/> La combinación de la caja son las tres horas de anoche: <break time="0.5s"/> el primero llegó a las nueve, <break time="0.4s"/> el segundo llegó a las diez, <break time="0.4s"/> y el último llegó a las cinco. <break time="0.6s"/> Súmalas y vas a ver la hora que importa. <break time="0.7s"/> A las doce estoy ahí. <break time="0.5s"/> Si no llego a las doce, <break time="0.3s"/> no llegué nunca.',
      },
    ],
  },
];
