import type { AudioScript } from "../types.js";

// ─── Unit 13 — El Salvador — La Vasija Pintada ────────────────────────────────
// Two-voice morning conversation in the village at Joya de Cerén: female1 (Sak
// Nik, a neighbor offering food) questioning male2 (El Cronista, the stranger).
// The transcript matches the listeningComp stage in content/unit-13.json
// verbatim — the comprehension questions key off these exact stem-changing verb
// forms (quieres / prefiero / puedes / puedo / duermes / duermo / sirve /
// quiero), so any edit here must be mirrored there.
//
// Two distinct voices (female1 asks, male2 answers) keep the back-and-forth clear.
//
// ⚠ Multi-line stitching note (same as units 1–12):
//   fluent-ffmpeg is NOT installed on this machine, so lines are raw-concatenated.
//   If seams between speaker turns sound glitchy on playback, install ffmpeg:
//     1. Download from https://ffmpeg.org/download.html and add to PATH
//     2. npm install -D fluent-ffmpeg @types/fluent-ffmpeg
//     3. npm run audio:generate -- --unit 13   (overwrites the file)

export const unit13Scripts: AudioScript[] = [
  {
    unitNumber: 13,
    filename: "conversacion-pueblo.mp3",
    outputPath: "public/audio/unit-13/conversacion-pueblo.mp3",
    description: "Two-voice morning conversation in the village (Joya de Cerén, El Salvador)",
    voiceSettings: {
      stability:       70,
      similarityBoost: 75,
      style:            0,
      speed:          0.88,
    },
    lines: [
      { voiceKey: "female1", text: 'Buenos días. <break time="0.3s"/> ¿Quieres tortillas? <break time="0.4s"/> Mi familia sirve comida a todos los vecinos.' },
      { voiceKey: "male2",   text: 'No, gracias. <break time="0.3s"/> Yo prefiero comer solo.' },
      { voiceKey: "female1", text: '¿Puedes moler el maíz? <break time="0.4s"/> Necesitamos ayuda en el metate.' },
      { voiceKey: "male2",   text: 'No puedo. <break time="0.4s"/> Mis manos no conocen ese trabajo.' },
      { voiceKey: "female1", text: '¿Duermes bien? <break time="0.3s"/> Te veo cansado por la mañana.' },
      { voiceKey: "male2",   text: 'Duermo de día. <break time="0.4s"/> Trabajo de noche. <break time="0.4s"/> Ahora quiero descansar.' },
      { voiceKey: "female1", text: '¿Qué buscas aquí?' },
      { voiceKey: "male2",   text: 'Quiero la vasija pintada. <break time="0.4s"/> Adiós.' },
    ],
  },
];
