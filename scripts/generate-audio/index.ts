import type { AudioScript } from "./types.js";
import { unit01Scripts } from "./scripts/unit-01.js";
import { unit02Scripts } from "./scripts/unit-02.js";
import { unit03Scripts } from "./scripts/unit-03.js";
import { unit04Scripts } from "./scripts/unit-04.js";
import { unit05Scripts } from "./scripts/unit-05.js";
import { unit06Scripts } from "./scripts/unit-06.js";
import { unit07Scripts } from "./scripts/unit-07.js";
import { unit08Scripts } from "./scripts/unit-08.js";
import { unit09Scripts } from "./scripts/unit-09.js";
import { unit10Scripts } from "./scripts/unit-10.js";
import { unit11Scripts } from "./scripts/unit-11.js";
import { unit12Scripts } from "./scripts/unit-12.js";
import { unit01ColdScripts } from "./scripts/unit-01-cold.js";
import { bossEclipseScripts } from "./scripts/boss-eclipse.js";

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
  ...unit09Scripts,
  ...unit10Scripts,
  // ── Semester 2 (time-travel arc) ────────────────────────────────────────────
  ...unit11Scripts,
  ...unit12Scripts,
  // ── Cold Cases ──────────────────────────────────────────────────────────────
  ...unit01ColdScripts,
  // ── Boss Fights ─────────────────────────────────────────────────────────────
  ...bossEclipseScripts,
];
