import type { AudioScript } from "./types.js";
import { unit01Scripts } from "./scripts/unit-01.js";
import { unit02Scripts } from "./scripts/unit-02.js";
import { unit03Scripts } from "./scripts/unit-03.js";
import { unit04Scripts } from "./scripts/unit-04.js";

// ─── Audio script registry ────────────────────────────────────────────────────
// Import each unit's script array and spread it into `scripts`.
// Run `npm run audio:generate -- --dry-run` to preview before generating.

export const scripts: AudioScript[] = [
  ...unit01Scripts,
  ...unit02Scripts,
  ...unit03Scripts,
  ...unit04Scripts,
];
