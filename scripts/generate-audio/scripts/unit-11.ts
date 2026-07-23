import type { AudioScript } from "../types.js";

// ─── Unit 11 — Honduras — El Misterio de la Estela ────────────────────────────
// Two-voice night conversation overheard in Copán: male1 (a local) questioning
// male2 (El Cronista, the outsider). The transcript matches the listeningComp
// stage in content/unit-11.json verbatim — the comprehension questions key off
// these exact lines, so any edit here must be mirrored there.
//
// Why two MALE voices: the case's elimination logic hinges on the thief being
// a man ("el forastero"), and the witness Balam describes "un hombre extraño".
// male2 maps to the same voice ID as male1 on the free plan, so if the speakers
// end up indistinguishable, swap male2 → female2 here for contrast (the Spanish
// stays valid — the suspect's gender is never stated in this clip itself).
//
// ⚠ Multi-line stitching note (same as units 1–10):
//   fluent-ffmpeg is NOT installed on this machine, so lines are raw-concatenated.
//   If seams between speaker turns sound glitchy on playback, install ffmpeg:
//     1. Download from https://ffmpeg.org/download.html and add to PATH
//     2. npm install -D fluent-ffmpeg @types/fluent-ffmpeg
//     3. npm run audio:generate -- --unit 11   (overwrites the file)

export const unit11Scripts: AudioScript[] = [
  {
    unitNumber: 11,
    filename: "conversacion-nocturna.mp3",
    outputPath: "public/audio/unit-11/conversacion-nocturna.mp3",
    description: "Two-voice night conversation near the king's stela (Copán, Honduras)",
    voiceSettings: {
      stability:       70,
      similarityBoost: 75,
      style:            0,
      speed:          0.88,
    },
    lines: [
      { voiceKey: "male1", text: '¿Ves la estela del rey? <break time="0.5s"/> El glifo más importante está ahí.' },
      { voiceKey: "male2", text: 'Sí, <break time="0.3s"/> lo veo bien. <break time="0.5s"/> Esta noche subo a la plaza y lo tomo.' },
      { voiceKey: "male1", text: '¿No trabajas mañana en el mercado?' },
      { voiceKey: "male2", text: 'No. <break time="0.4s"/> Yo no vendo jade como los otros. <break time="0.5s"/> Yo solo observo y espero. <break time="0.5s"/> Mis sandalias son diferentes; <break time="0.3s"/> camino sin ruido.' },
      { voiceKey: "male1", text: '¿Y tus manos?' },
      { voiceKey: "male2", text: 'Mis manos están limpias. <break time="0.4s"/> Nunca tallo piedra, <break time="0.3s"/> nunca escribo glifos. <break time="0.5s"/> Adiós.' },
    ],
  },
];
