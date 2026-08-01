/**
 * Server-side boss content loader.
 *
 * Every boss fact a route needs — which unit it unlocks, which badges it hands
 * out — lives in the boss's own JSON. The complete/skip routes used to keep
 * their own copies of that in module constants, so registering a boss meant
 * editing several files and keeping the numbers in sync by hand.
 *
 * The id is validated before it reaches require(): it arrives from the URL, and
 * an unfiltered `../` would resolve outside content/bosses.
 */

import type { BossContent } from "@/lib/types/boss";

const BOSS_ID = /^[a-z0-9][a-z0-9-]*$/;

export function loadBossContent(bossId: string): BossContent | null {
  if (!BOSS_ID.test(bossId)) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@/content/bosses/${bossId}.json`) as BossContent;
  } catch {
    return null;
  }
}
