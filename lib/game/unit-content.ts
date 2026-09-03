/**
 * Server-side unit content loader.
 *
 * WHY THIS EXISTS
 *
 * Two routes each kept their own hand-written `if (unitNumber === n) require(…)`
 * chain — /play/[unitId] and /play/[unitId]/gate — and they had drifted apart.
 * The play route listed units 1–15; the gate stopped at 10. Since the mission
 * board links to the GATE, Casos 11–15 shipped, validated, seeded into the
 * database, and were still unreachable: every student who clicked them got the
 * "Próximamente" panel.
 *
 * That is the failure mode a duplicated registry always produces eventually, so
 * the registry is now one function. Adding a case means adding a JSON file, and
 * nothing else.
 *
 * The number is validated before it reaches require(): it arrives from the URL,
 * and an unfiltered value could resolve outside content/.
 */

import type { UnitContent } from "@/lib/types/unit-content";

/** Highest case with a content file. Bump when a new caso ships. */
export const MAX_UNIT = 20;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Load one case. `cold` selects the semester-two cold-case variant, which only
 * exists for units 1–10.
 *
 * Returns null for anything not shipped, so callers show their own
 * "coming soon" panel rather than throwing at a student.
 */
export function loadUnitContent(unitNumber: number, cold = false): UnitContent | null {
  if (!Number.isInteger(unitNumber) || unitNumber < 1 || unitNumber > MAX_UNIT) return null;
  const suffix = cold ? "-cold" : "";
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@/content/unit-${pad(unitNumber)}${suffix}.json`) as UnitContent;
  } catch {
    return null;
  }
}

/** Every case number that actually has content on disk, ascending. */
export function shippedUnitNumbers(): number[] {
  const out: number[] = [];
  for (let n = 1; n <= MAX_UNIT; n++) if (loadUnitContent(n)) out.push(n);
  return out;
}
