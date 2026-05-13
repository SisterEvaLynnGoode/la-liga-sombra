"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/games/utils";
import type { GameResult } from "@/lib/games/types";

interface Props {
  title: string;
  elapsed: number;
  status?: "playing" | "complete";
  skipAfter?: number;           // seconds before skip appears (default 60)
  onSkip: () => GameResult;    // called with a partial result
  children: React.ReactNode;
}

export default function GameShell({
  title,
  elapsed,
  status = "playing",
  skipAfter = 60,
  onSkip,
  children,
}: Props) {
  const [skipVisible, setSkipVisible] = useState(false);

  useEffect(() => {
    if (elapsed >= skipAfter && status === "playing") setSkipVisible(true);
  }, [elapsed, skipAfter, status]);

  return (
    <div className="flex flex-col min-h-0 h-full bg-[#0d0b0a]">
      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-[rgba(201,147,58,0.2)] bg-[#110f0d] shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355]">
            Misión
          </span>
          <div className="w-px h-3 bg-[rgba(201,147,58,0.2)]" />
          <h2 className="font-display font-bold text-base text-[#f5e6c8] leading-none">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs">⏱</span>
            <span className="font-typewriter text-sm text-[#c9933a] tabular-nums">
              {formatTime(elapsed)}
            </span>
          </div>

          {/* Skip button — appears after skipAfter seconds */}
          {skipVisible && status === "playing" && (
            <button
              onClick={onSkip}
              className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] hover:text-[#c0392b] transition-colors border border-[rgba(201,147,58,0.15)] hover:border-[rgba(192,57,43,0.4)] px-2.5 py-1"
            >
              Saltar →
            </button>
          )}
        </div>
      </div>

      {/* ── Game content ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
