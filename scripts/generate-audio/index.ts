import type { AudioScript } from "./types.js";
import { unit01Scripts } from "./scripts/unit-01.js";
import { unit02Scripts } from "./scripts/unit-02.js";
import { unit03Scripts } from "./scripts/unit-03.js";
import { unit04Scripts } from "./scripts/unit-04.js";
import { unit05Scripts } from "./scripts/unit-05.js";
import { unit06Scripts } from "./scripts/unit-06.js";
import { unit07Scripts } from "./scripts/unit-07.js";
import { unit08Scripts } from "./scripts/unit-08.js";
import { unit01ColdScripts } from "./scripts/unit-01-cold.js";

// ─── Audio script registry ────────────────────────────────────────────────────
// Import each unit's script array and spread it into `scripts`.
// Cold cases use unitNumber + 100 convention (e.g., Unit 1 Cold = unitNumber 101).
// Run `npm run audio:generate -- --dry-run` to preview before generating.

export const scripts: AudioScript[] = [
  ...unit01Scripts,
  ...unit02Scripts,
  ...unit03Scripts,
  ...unit04Scripts,
  ...unit05Scripts,
  ...unit06Scripts,
  ...unit07Scripts,
  ...unit08Scripts,
  // ── Cold Cases ──────────────────────────────────────────────────────────────
  ...unit01ColdScripts,
];
