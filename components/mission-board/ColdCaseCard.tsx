"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { UnitMeta } from "@/lib/game/units";
import { ROMAN } from "@/lib/game/units";

export type ColdCaseStatus = "available" | "completed" | "locked";

interface Props {
  unit: UnitMeta;
  status: ColdCaseStatus;
  unlocksAt?: string | null; // ISO timestamp — when it becomes available (if locked)
}

function msUntil(iso: string): number {
  return new Date(iso).getTime() - Date.now();
}

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "ahora";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export default function ColdCaseCard({ unit, status, unlocksAt }: Props) {
  const romanNumeral = ROMAN[unit.number - 1];
  const [remaining, setRemaining] = useState(unlocksAt ? msUntil(unlocksAt) : 0);

  // Tick countdown every minute if locked
  useEffect(() => {
    if (status !== "locked" || !unlocksAt) return;
    const id = setInterval(() => setRemaining(msUntil(unlocksAt)), 60_000);
    return () => clearInterval(id);
  }, [status, unlocksAt]);

  const cardContent = (
    <div
      className="relative w-full"
      style={{ transform: `rotate(${(unit.rotation ?? 0) * -0.6}deg)` }}
    >
      {/* Thumbtack — icy blue */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
        <div className={`w-5 h-5 rounded-full shadow-lg border-2 transition-all ${
          status === "completed"
            ? "bg-gradient-to-br from-[#4a9eff] to-[#1a6bcc] border-[#1a6bcc]"
            : status === "available"
            ? "bg-gradient-to-br from-[#93c5fd] to-[#3b82f6] border-[#2563eb] shadow-[0_0_12px_rgba(147,197,253,0.6)] animate-pulse"
            : "bg-[#1e2a3a] border-[#2a3a4a]"
        }`} />
        <div className="w-px h-2 bg-[rgba(0,0,0,0.4)] mx-auto" />
      </div>

      {/* Card body — dark sepia */}
      <div
        className={`relative overflow-hidden shadow-[2px_4px_16px_rgba(0,0,0,0.6)] transition-all duration-200 ${
          status === "locked"
            ? "bg-[#141c24]"
            : "bg-gradient-to-br from-[#1e2a3a] via-[#1a2535] to-[#131d2b] hover:shadow-[3px_6px_24px_rgba(74,158,255,0.25)] hover:-translate-y-0.5"
        }`}
        style={{ minHeight: 220 }}
      >
        {/* Top color stripe — icy blue */}
        <div
          className="h-1.5 w-full"
          style={{
            background: status === "locked"
              ? "#1e2a3a"
              : "linear-gradient(90deg, #3b82f6, rgba(59,130,246,0.1))",
          }}
        />

        <div className="p-4 pt-3">
          {/* Case label */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#4a6a8a]">
              CASO {romanNumeral} ❄
            </span>
            {status === "locked" && <span className="text-sm opacity-50">🔒</span>}
          </div>

          {/* EXPEDIENTE FRÍO tag */}
          <div className={`text-center mb-2 ${status === "locked" ? "opacity-30" : ""}`}>
            <span className="font-typewriter text-[9px] tracking-[0.25em] uppercase text-[#4a9eff] border border-[rgba(74,158,255,0.3)] px-2 py-0.5">
              EXPEDIENTE FRÍO
            </span>
          </div>

          {/* Flag + country */}
          <div className={`text-center my-2 ${status === "locked" ? "opacity-25 grayscale" : ""}`}>
            <span className="text-3xl leading-none">{unit.flag}</span>
            <p className="font-display font-bold text-sm mt-1 leading-tight text-[#7aafd4]">
              {unit.country}
            </p>
          </div>

          {/* Snowflake decoration */}
          <div className={`text-center ${status === "locked" ? "opacity-20" : "opacity-60"}`}>
            <span className="font-typewriter text-[10px] text-[#4a9eff]">❄ ❄ ❄</span>
          </div>

          {/* Status */}
          {status === "locked" && unlocksAt && (
            <div className="mt-3 text-center">
              <p className="font-typewriter text-[9px] text-[#2a4a6a]">Disponible en</p>
              <p className="font-typewriter text-xs text-[#4a7a9a] font-bold">{fmtCountdown(remaining)}</p>
            </div>
          )}

          {status === "available" && (
            <div className="mt-3 flex justify-center">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1a3a6a] border border-[#3b82f6] font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#93c5fd]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                ACTIVO
              </span>
            </div>
          )}

          {status === "completed" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="border-4 border-[#3b82f6] rounded px-3 py-1 opacity-85"
                style={{ transform: "rotate(-12deg)" }}
              >
                <span className="font-display font-black text-[#3b82f6] text-sm tracking-[0.1em] uppercase">
                  RESUELTO ❄
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (status === "locked") {
    return (
      <div className="pt-4 cursor-not-allowed select-none opacity-60" title="Complete the case first, then wait 24 hours">
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={`/play/${unit.number}/cold`} className="block pt-4 group">
      {cardContent}
    </Link>
  );
}
