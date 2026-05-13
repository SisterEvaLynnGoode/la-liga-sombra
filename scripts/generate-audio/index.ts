import type { AudioScript } from "./types.js";
import { unit01Scripts } from "./scripts/unit-01.js";

// ─── Audio script registry ────────────────────────────────────────────────────
// Import each unit's script array and spread it into `scripts`.
// Run `npm run audio:generate -- --dry-run` to preview before generating.

export const scripts: AudioScript[] = [
  ...unit01Scripts,
];
