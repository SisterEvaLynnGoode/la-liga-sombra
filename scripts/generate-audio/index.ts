import type { AudioScript } from "./types.js";

// ─── Audio script registry ────────────────────────────────────────────────────
// Add unit scripts here as each unit's audio is commissioned.
// Each subsequent prompt will import AudioScript and push entries.
//
// Example shape (do not uncomment — units will add real entries):
//
// {
//   unitNumber: 1,
//   filename: "hola.mp3",
//   outputPath: "public/audio/unit-01/hola.mp3",
//   description: "Vocab: hola → hello",
//   voiceSettings: { stability: 0.5, similarityBoost: 0.75, style: 0.1, speed: 1.0 },
//   lines: [{ voiceKey: "female1", text: "hola" }],
// }

export const scripts: AudioScript[] = [];
