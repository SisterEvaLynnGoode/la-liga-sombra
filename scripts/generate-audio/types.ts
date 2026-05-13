// ─── Audio generation types ───────────────────────────────────────────────────

export type VoiceKey = "female1" | "male1" | "female2" | "male2";

export type AudioLine = {
  voiceKey: VoiceKey;
  text: string; // may include SSML <break time="Xs"/> tags
};

export type VoiceSettings = {
  stability: number;       // 0–1  (higher = more consistent, less expressive)
  similarityBoost: number; // 0–1  (higher = closer to original voice)
  style: number;           // 0–1  (expressiveness / style exaggeration)
  speed: number;           // 0.7–1.2  (playback speed multiplier)
};

export type AudioScript = {
  unitNumber: number;
  filename: string;    // e.g. "hola.mp3"
  outputPath: string;  // relative to project root, e.g. "public/audio/unit-01/hola.mp3"
  description: string; // human-readable note, shown in --dry-run output
  voiceSettings: VoiceSettings;
  lines: AudioLine[];  // one element for single lines, multiple for multi-voice or stitched audio
};
