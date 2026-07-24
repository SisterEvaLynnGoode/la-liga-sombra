import type { AudioScript } from "../types.js";

// ─── Unit 12 — Guatemala — La Máscara de Jade ─────────────────────────────────
// Two-voice night conversation overheard at Tikal: female1 (an accomplice on the
// line) questioning male2 (El Cronista, posing as an astronomer). The transcript
// matches the listeningComp stage in content/unit-12.json verbatim — the
// comprehension questions key off these exact SER/ESTAR lines, so any edit here
// must be mirrored there.
//
// Two distinct voices (female1 asks, male2 answers) keep the back-and-forth clear.
//
// ⚠ Multi-line stitching note (same as units 1–11):
//   fluent-ffmpeg is NOT installed on this machine, so lines are raw-concatenated.
//   If seams between speaker turns sound glitchy on playback, install ffmpeg:
//     1. Download from https://ffmpeg.org/download.html and add to PATH
//     2. npm install -D fluent-ffmpeg @types/fluent-ffmpeg
//     3. npm run audio:generate -- --unit 12   (overwrites the file)

export const unit12Scripts: AudioScript[] = [
  {
    unitNumber: 12,
    filename: "conversacion-nocturna.mp3",
    outputPath: "public/audio/unit-12/conversacion-nocturna.mp3",
    description: "Two-voice night conversation near Temple IV (Tikal, Guatemala)",
    voiceSettings: {
      stability:       70,
      similarityBoost: 75,
      style:            0,
      speed:          0.88,
    },
    lines: [
      { voiceKey: "female1", text: '¿Dónde estás?' },
      { voiceKey: "male2",   text: 'Estoy cerca del Templo IV. <break time="0.4s"/> La máscara de jade está en el altar.' },
      { voiceKey: "female1", text: '¿Eres astrónomo? <break time="0.3s"/> ¿Conoces las estrellas?' },
      { voiceKey: "male2",   text: 'No. <break time="0.3s"/> Yo soy forastero. <break time="0.4s"/> No conozco los nombres de las estrellas. <break time="0.4s"/> Estoy muy nervioso cuando miro el cielo.' },
      { voiceKey: "female1", text: '¿Cómo eres? <break time="0.3s"/> Para reconocerte.' },
      { voiceKey: "male2",   text: 'Soy alto y moreno. <break time="0.4s"/> Ahora estoy cansado, <break time="0.3s"/> pero esta noche tomo la máscara. <break time="0.4s"/> Adiós.' },
    ],
  },
];
