/**
 * Character sheet library — all La Liga Sombra characters in one array.
 *
 * Import this anywhere you need the full character set.
 * Character data lives in the sibling JSON files; this module assembles them
 * into a single typed array for the prompt builder, review page, and image pipeline.
 */

import { CharacterSheet } from "@/lib/character-schema";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const recurringRaw  = require("./recurring.json")  as unknown[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const unit01Raw     = require("./unit-01.json")     as unknown[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const unit02Raw     = require("./unit-02.json")     as unknown[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const unit03Raw     = require("./unit-03.json")     as unknown[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const unit04Raw     = require("./unit-04.json")     as unknown[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const unit05Raw     = require("./unit-05.json")     as unknown[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const unit06Raw     = require("./unit-06.json")     as unknown[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const unit07Raw     = require("./unit-07.json")     as unknown[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const unit08Raw     = require("./unit-08.json")     as unknown[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const unit01ColdRaw = require("./unit-01-cold.json") as unknown[];

const allRaw = [
  ...recurringRaw,
  ...unit01Raw,
  ...unit02Raw,
  ...unit03Raw,
  ...unit04Raw,
  ...unit05Raw,
  ...unit06Raw,
  ...unit07Raw,
  ...unit08Raw,
  ...unit01ColdRaw,
];

// Validate all sheets at load time so bad data is caught at build
export const characters: CharacterSheet[] = allRaw.map((raw, i) => {
  const result = CharacterSheet.safeParse(raw);
  if (!result.success) {
    console.warn(`[character-library] Invalid character at index ${i}:`, result.error.flatten());
    // Return the raw data anyway so the review page can still show it
    return raw as CharacterSheet;
  }
  return result.data;
});

/** Look up a single character by id */
export function getCharacter(id: string): CharacterSheet | undefined {
  return characters.find((c) => c.id === id);
}

/** Get all characters for a specific unit number */
export function getUnitCharacters(unitNumber: number): CharacterSheet[] {
  return characters.filter((c) => c.unitNumber === unitNumber);
}

/** Get all recurring/villain characters (no unit number) */
export function getRecurringCharacters(): CharacterSheet[] {
  return characters.filter((c) => !c.unitNumber);
}

export default characters;
