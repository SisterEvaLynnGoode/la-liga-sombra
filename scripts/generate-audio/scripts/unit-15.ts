import type { AudioScript } from "../types.js";

// ─── Unit 15 — Cuba — El Disco Maestro ─────────────────────────────────────────
// Two-voice exchange in a Havana recording studio, 1954: female1 (Celia, the
// singer) and male2 (El Cronista). The transcript matches the listeningComp
// stage in content/unit-15.json verbatim — the comprehension questions key off
// these exact double-pronoun forms (me lo, se lo, llevármelo, llevárselo), so
// any edit here must be mirrored there.
//
// The pedagogical hinge is in line 4: "No quiero escucharlo. Quiero llevármelo."
// He wants the object and not the song, which is the whole case in one sentence.
// Keep those two verbs clearly separated in the audio.
//
// ⚠ Multi-line stitching note (same as units 1–14):
//   fluent-ffmpeg is NOT installed on this machine, so lines are raw-concatenated.
//   If seams between speaker turns sound glitchy on playback, install ffmpeg:
//     1. Download from https://ffmpeg.org/download.html and add to PATH
//     2. npm install -D fluent-ffmpeg @types/fluent-ffmpeg
//     3. npm run audio:generate -- --unit 15   (overwrites the file)

export const unit15Scripts: AudioScript[] = [
  {
    unitNumber: 15,
    filename: "conversacion-estudio.mp3",
    outputPath: "public/audio/unit-15/conversacion-estudio.mp3",
    description: "Two-voice exchange in a recording studio (La Habana, Cuba, 1954)",
    voiceSettings: {
      stability:       70,
      similarityBoost: 75,
      style:            0,
      speed:          0.88,
    },
    lines: [
      { voiceKey: "female1", text: '¿Le gusta el mambo? <break time="0.4s"/> Lo grabamos esta mañana.' },
      { voiceKey: "male2",   text: 'Sí. <break time="0.4s"/> ¿Me lo puede prestar?' },
      { voiceKey: "female1", text: 'El disco maestro no. <break time="0.4s"/> Es el único. <break time="0.5s"/> Se lo puedo poner aquí, <break time="0.3s"/> si quiere escucharlo.' },
      { voiceKey: "male2",   text: 'No quiero escucharlo. <break time="0.5s"/> Quiero llevármelo.' },
      { voiceKey: "female1", text: '¿Llevárselo? <break time="0.4s"/> ¿Para qué, <break time="0.3s"/> si no lo va a escuchar?' },
      { voiceKey: "male2",   text: 'Tengo mis razones. <break time="0.5s"/> ¿Quién se lo guarda?' },
      { voiceKey: "female1", text: 'Rogelio se lo guarda. <break time="0.4s"/> Y no se lo da a nadie.' },
      { voiceKey: "male2",   text: 'Ya veo. <break time="0.4s"/> Buenas noches.' },
    ],
  },
];
