"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Academia from "@/components/academia/Academia";
import type { VocabPair } from "@/lib/games/types";
import type { SentenceItem } from "@/lib/types/unit-content";

interface Props {
  unitNumber: number;
  vocab: VocabPair[];
  sentences?: SentenceItem[];
  unitId: string;
  routingTier: "ready" | "recommended" | "required";
}

export default function AcademiaWrapper({
  unitNumber,
  vocab,
  sentences,
  unitId,
  routingTier,
}: Props) {
  const router = useRouter();

  const handleComplete = useCallback(
    async (opts: { passedFirstTry: boolean; retries: number }) => {
      // Record the session for teacher analytics + award badge if first-try pass
      await fetch("/api/game/academia-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitNumber,
          routingTier,
          retryCount: opts.retries,
          passedFirstTry: opts.passedFirstTry,
        }),
      }).catch(() => {});

      // Route to the actual mission
      router.push(`/play/${unitNumber}`);
    },
    [unitNumber, routingTier, router]
  );

  return (
    <Academia
      vocab={vocab}
      sentences={sentences}
      unitId={unitId}
      unitNumber={unitNumber}
      onComplete={handleComplete}
    />
  );
}
