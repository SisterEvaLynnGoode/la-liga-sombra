"use client";

import { useCallback } from "react";
import type { ActivityType } from "@/lib/types/database";

export function useAttemptTracker(activityType: ActivityType, unitId?: string) {
  const recordAttempt = useCallback(
    async (score: number, maxScore: number, timeSpentSeconds: number) => {
      if (!unitId) return; // showcase / no-auth mode — silent no-op
      try {
        await fetch("/api/game/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unitId, activityType, score, maxScore, timeSpentSeconds }),
        });
      } catch {
        // Never crash the game over a tracking failure
      }
    },
    [activityType, unitId]
  );

  const updateMastery = useCallback(
    async (vocabTerm: string, wasCorrect: boolean) => {
      if (!unitId) return;
      try {
        await fetch("/api/game/mastery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vocabTerm, wasCorrect }),
        });
      } catch {
        // Silent
      }
    },
    [unitId]
  );

  return { recordAttempt, updateMastery };
}
