"use client";

import { useState } from "react";
import DailyBriefing, { type BriefingResult } from "./DailyBriefing";
import BadgeEarned from "@/components/games/BadgeEarned";
import type { BriefingTerm } from "@/lib/spaced-repetition";
import type { BadgeType } from "@/lib/types/database";

interface Props {
  terms: BriefingTerm[];
}

export default function DailyBriefingTrigger({ terms }: Props) {
  const [visible, setVisible]       = useState(true);
  const [newBadges, setNewBadges]   = useState<BadgeType[]>([]);
  const [showBadge, setShowBadge]   = useState(false);

  if (!visible) return null;

  async function handleComplete(result: BriefingResult) {
    // Fire-and-forget — dismiss immediately so the student isn't blocked
    setVisible(false);

    const res = await fetch("/api/briefing/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    }).catch(() => null);

    if (res?.ok) {
      const data = await res.json() as { newBadges?: BadgeType[] };
      if (data.newBadges?.length) {
        setNewBadges(data.newBadges);
        setShowBadge(true);
      }
    }
  }

  return (
    <>
      {visible && <DailyBriefing terms={terms} onComplete={handleComplete} />}
      {showBadge && newBadges.length > 0 && (
        <BadgeEarned
          badges={newBadges}
          onDismiss={() => { setShowBadge(false); setNewBadges([]); }}
        />
      )}
    </>
  );
}
