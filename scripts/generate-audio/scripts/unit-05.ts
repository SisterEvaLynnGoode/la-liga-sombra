import type { AudioScript } from "../types.js";

// ─── Unit 5 — Argentina — Hackeo en Buenos Aires ──────────────────────────────
// Two-voice dialogue: male1 (hacker contact) + female2 (Valentina, the suspect).
// female2 maps to the same voice ID as female1 on the free plan — but because
// male1 is a different (male) voice, the two speakers will still sound distinct.
//
// ⚠ Multi-line stitching note:
//   fluent-ffmpeg is NOT installed on this machine, so lines are raw-concatenated.
//   If seams between speaker turns sound glitchy on playback, install ffmpeg:
//     1. Download from https://ffmpeg.org/download.html and add to PATH
//     2. npm install -D fluent-ffmpeg @types/fluent-ffmpeg
//     3. npm run audio:generate -- --unit 5   (overwrites the file)

export const unit05Scripts: AudioScript[] = [
  {
    unitNumber: 5,
    filename: "intercepted-call.mp3",
    outputPath: "public/audio/unit-05/intercepted-call.mp3",
    description: "Two-voice intercepted hacker call (Argentina)",
    voiceSettings: {
      stability:       70,
      similarityBoost: 75,
      style:            0,
      speed:          0.88,
    },
    lines: [
      { voiceKey: "male1",   text: 'Hola. <break time="0.5s"/> ¿Tienes la computadora portátil?' },
      { voiceKey: "female2", text: 'Sí, <break time="0.3s"/> la tengo. <break time="0.5s"/> Y también tengo el celular y la tableta.' },
      { voiceKey: "male1",   text: 'Excelente. <break time="0.5s"/> ¿Cuándo vienes a Buenos Aires?' },
      { voiceKey: "female2", text: 'Vengo el quince de marzo. <break time="0.5s"/> Tengo prisa.' },
      { voiceKey: "male1",   text: 'Tenemos los datos de mil personas. <break time="0.5s"/> Necesitamos los datos de dos mil más.' },
      { voiceKey: "female2", text: 'Los tengo aquí. <break time="0.5s"/> Tengo veinticinco años, <break time="0.3s"/> no soy nueva en esto. <break time="0.5s"/> Adiós.' },
    ],
  },
];
