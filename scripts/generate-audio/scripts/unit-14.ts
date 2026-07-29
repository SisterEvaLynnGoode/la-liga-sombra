import type { AudioScript } from "../types.js";

// ─── Unit 14 — Nicaragua — El Manuscrito de Darío ──────────────────────────────
// Two-voice exchange in the plaza at León, 1907: female1 (Amanda, the young poet)
// questioning male2 (El Cronista). The transcript matches the listeningComp stage
// in content/unit-14.json verbatim — the comprehension questions key off these
// exact gustar/encantar/interesar forms (le gusta / me gustan / nos encanta /
// me interesa), so any edit here must be mirrored there.
//
// Note the register: Amanda uses USTED with a stranger, which is the same
// distinction the Caso 1 story deck teaches. It is worth pointing at.
//
// ⚠ Multi-line stitching note (same as units 1–13):
//   fluent-ffmpeg is NOT installed on this machine, so lines are raw-concatenated.
//   If seams between speaker turns sound glitchy on playback, install ffmpeg:
//     1. Download from https://ffmpeg.org/download.html and add to PATH
//     2. npm install -D fluent-ffmpeg @types/fluent-ffmpeg
//     3. npm run audio:generate -- --unit 14   (overwrites the file)

export const unit14Scripts: AudioScript[] = [
  {
    unitNumber: 14,
    filename: "conversacion-plaza.mp3",
    outputPath: "public/audio/unit-14/conversacion-plaza.mp3",
    description: "Two-voice exchange in the plaza (León, Nicaragua, 1907)",
    voiceSettings: {
      stability:       70,
      similarityBoost: 75,
      style:            0,
      speed:          0.88,
    },
    lines: [
      { voiceKey: "female1", text: 'Buenas tardes. <break time="0.3s"/> ¿Le gusta la poesía de Rubén Darío?' },
      { voiceKey: "male2",   text: 'No mucho. <break time="0.4s"/> A mí no me gustan los poemas.' },
      { voiceKey: "female1", text: '¿No? <break time="0.3s"/> A todos aquí nos encanta. <break time="0.4s"/> ¿Qué le interesa entonces?' },
      { voiceKey: "male2",   text: 'Me interesa el papel. <break time="0.4s"/> El papel viejo y la tinta.' },
      { voiceKey: "female1", text: '¿El papel? <break time="0.4s"/> Pero las palabras son lo importante.' },
      { voiceKey: "male2",   text: 'Para usted. <break time="0.5s"/> Dígame una cosa: <break time="0.3s"/> ¿cuánto vale ese manuscrito?' },
      { voiceKey: "female1", text: 'No sé. <break time="0.4s"/> Nadie pregunta eso aquí.' },
      { voiceKey: "male2",   text: 'Yo sí. <break time="0.4s"/> Buenas noches.' },
    ],
  },
];
