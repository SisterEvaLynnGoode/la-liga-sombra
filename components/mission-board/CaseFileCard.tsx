"use client";

import Link from "next/link";
import type { UnitMeta } from "@/lib/game/units";
import { ROMAN } from "@/lib/game/units";
import type { UnitStatus } from "@/lib/types/database";

interface Props {
  unit: UnitMeta;
  status: UnitStatus;
  caseSolved: boolean;
}

export default function CaseFileCard({ unit, status, caseSolved }: Props) {
  const romanNumeral = ROMAN[unit.number - 1];
  const isLocked = status === "locked";
  const isAvailable = status === "available";
  const isInProgress = status === "in_progress";
  const isSolved = status === "completed" || caseSolved;

  const cardContent = (
    <div
      className="relative w-full"
      style={{ transform: `rotate(${unit.rotation}deg)` }}
    >
      {/* Thumbtack */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
        <div
          className={`w-5 h-5 rounded-full shadow-lg border-2 transition-all duration-300 ${
            isLocked
              ? "bg-[#4a3a2a] border-[#3a2a1a]"
              : isAvailable
              ? "bg-gradient-to-br from-[#ef4444] to-[#991b1b] border-[#7f1d1d] shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse"
              : isSolved
              ? "bg-gradient-to-br from-[#c9933a] to-[#8b5e10] border-[#6b4a0a]"
              : "bg-gradient-to-br from-[#f59e0b] to-[#b45309] border-[#92400e]"
          }`}
        />
        {/* Pin stem */}
        <div className="w-px h-2 bg-[rgba(0,0,0,0.4)] mx-auto" />
      </div>

      {/* Card body */}
      <div
        className={`relative overflow-hidden transition-all duration-200 shadow-[2px_4px_16px_rgba(0,0,0,0.5)] ${
          isLocked
            ? "bg-[#1e1a16]"
            : "bg-gradient-to-br from-[#f8e9cc] via-[#f2ddb0] to-[#e8cc94]"
        } ${!isLocked ? "hover:shadow-[3px_6px_24px_rgba(0,0,0,0.7)] hover:-translate-y-0.5" : ""}`}
        style={{ minHeight: 220 }}
      >
        {/* Top color stripe */}
        <div
          className="h-1.5 w-full"
          style={{
            background: isLocked
              ? "#2c2220"
              : `linear-gradient(90deg, ${unit.themeColor ?? "#8b1a1a"}, transparent)`,
          }}
        />

        <div className="p-4 pt-3">
          {/* Case label */}
          <div className="flex items-center justify-between mb-2">
            <span
              className={`font-typewriter text-[9px] tracking-[0.3em] uppercase ${
                isLocked ? "text-[#4a3a2a]" : "text-[#8b5e10]"
              }`}
            >
              CASO {romanNumeral}
            </span>
            {isLocked && (
              <span className="text-sm opacity-60">🔒</span>
            )}
          </div>

          {/* Flag + country */}
          <div className={`text-center my-2 ${isLocked ? "opacity-30 grayscale" : ""}`}>
            <span className="text-4xl leading-none">{unit.flag}</span>
            <p
              className={`font-display font-bold text-sm mt-1 leading-tight ${
                isLocked ? "text-[#4a3a2a]" : "text-[#2c1a08]"
              }`}
            >
              {unit.country}
            </p>
          </div>

          {/* Title */}
          <div className={`text-center mt-2 ${isLocked ? "opacity-30" : ""}`}>
            <p
              className={`font-typewriter text-[10px] italic leading-snug ${
                isLocked ? "text-[#4a3a2a]" : "text-[#6b4a1a]"
              }`}
            >
              &ldquo;{unit.titleEs}&rdquo;
            </p>
          </div>

          {/* Status overlays */}

          {/* LOCKED */}
          {isLocked && (
            <div className="mt-3 text-center">
              <span className="font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#4a3a2a]">
                Bloqueado
              </span>
            </div>
          )}

          {/* AVAILABLE — pulsing ACTIVO badge */}
          {isAvailable && (
            <div className="mt-3 flex justify-center">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#8b1a1a] border border-[#c0392b] font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#f5e6c8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c0392b] animate-pulse" />
                ACTIVO
              </span>
            </div>
          )}

          {/* IN PROGRESS — caution tape */}
          {isInProgress && (
            <div className="mt-3 overflow-hidden">
              <div
                className="h-4 w-full font-typewriter text-[8px] text-[#1a1a1a] flex items-center overflow-hidden"
                style={{
                  background: "repeating-linear-gradient(-45deg, #f59e0b, #f59e0b 8px, #1a1a1a 8px, #1a1a1a 16px)",
                }}
              >
                <span className="px-2 font-bold tracking-widest uppercase text-[#1a1a1a] mix-blend-multiply">
                  EN PROGRESO
                </span>
              </div>
            </div>
          )}

          {/* SOLVED — red stamp */}
          {isSolved && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="border-4 border-[#8b1a1a] rounded px-3 py-1 opacity-85"
                style={{ transform: "rotate(-12deg)" }}
              >
                <span className="font-display font-black text-[#8b1a1a] text-lg tracking-[0.15em] uppercase">
                  RESUELTO
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Locked cards are not clickable
  if (isLocked) {
    return (
      <div className="pt-4 cursor-not-allowed select-none opacity-70" title="Complete the previous case to unlock">
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={`/play/${unit.number}`} className="block pt-4 group">
      {cardContent}
    </Link>
  );
}
