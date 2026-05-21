"use client";

import { formatTime } from "@/lib/games/utils";
import type { GameResult } from "@/lib/games/types";
import SkipStageButton from "./SkipStageButton";

interface Props {
  title: string;
  elapsed: number;
  status?: "playing" | "complete";
  /** @deprecated No longer used — skip is always visible from t=0 */
  skipAfter?: number;
  unitId?: string;
  onSkip: () => GameResult;    // called with a partial result
  children: React.ReactNode;
}

export default function GameShell({
  title,
  elapsed,
  status = "playing",
  // skipAfter intentionally unused — kept in interface for backward compat
  unitId,
  onSkip,
  children,
}: Props) {
  return (
    <div className="flex flex-col min-h-0 h-full bg-[#0d0b0a]">

      {/* ── Header bar — title + timer ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-[rgba(201,147,58,0.1)] bg-[#110f0d] shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355]">
            Misión
          </span>
          <div className="w-px h-3 bg-[rgba(201,147,58,0.2)]" />
          <h2 className="font-display font-bold text-base text-[#f5e6c8] leading-none">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs">⏱</span>
          <span className="font-typewriter text-sm text-[#c9933a] tabular-nums">
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* ── Skip strip — always visible while playing ─────────────────── */}
      {status === "playing" && (
        <div className="shrink-0 border-b border-[rgba(201,147,58,0.08)] bg-[#0f0d0b] py-2 px-4">
          <SkipStageButton stageName={title} unitId={unitId} onSkip={onSkip} />
        </div>
      )}

      {/* ── Game content ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
