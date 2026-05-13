"use client";

import { useState } from "react";
import type { BadgeType } from "@/lib/types/database";
import { BADGE_META } from "@/lib/games/badges";
import { UNITS } from "@/lib/game/units";

interface EarnedBadge { badge_type: string; unit_id: string | null; earned_at: string }

interface Props { earned: EarnedBadge[] }

// Achievement badges (not unit-specific)
const ACHIEVEMENT_BADGES: BadgeType[] = ["perfect_score", "speed_demon", "vocab_master", "streak_3", "streak_7", "first_case"];

function PassportStamp({ unitNumber, country, flag, earnedAt }: { unitNumber: number; country: string; flag: string; earnedAt?: string }) {
  const [tip, setTip] = useState(false);
  const earned = !!earnedAt;

  return (
    <div className="relative" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
      <div
        className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 border-dashed transition-all cursor-default select-none ${
          earned
            ? "border-[#c9933a] bg-[rgba(201,147,58,0.08)] shadow-[0_0_12px_rgba(201,147,58,0.2)]"
            : "border-[#2c2220] bg-[#1a1614] opacity-40 grayscale"
        }`}
        style={earned ? { animation: undefined } : undefined}
      >
        <span className={`text-3xl leading-none ${earned ? "" : "opacity-30"}`}>{flag}</span>
        <span className={`font-typewriter text-[8px] tracking-wider mt-0.5 ${earned ? "text-[#8b5e10]" : "text-[#3a3028]"}`}>
          Caso {unitNumber}
        </span>
        {earned && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#c9933a] flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">✓</span>
          </div>
        )}
      </div>
      {tip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 px-2 py-1.5 bg-[#1a1614] border border-[rgba(201,147,58,0.3)] whitespace-nowrap shadow-lg">
          <p className="font-typewriter text-[10px] text-[#c4a882]">{country}</p>
          {earnedAt && <p className="font-typewriter text-[9px] text-[#8b7355]">{earnedAt.slice(0, 10)}</p>}
          {!earned && <p className="font-typewriter text-[9px] text-[#4a3a2a]">Not yet earned</p>}
        </div>
      )}
    </div>
  );
}

function AchievementBadge({ type, earnedAt }: { type: BadgeType; earnedAt?: string }) {
  const [tip, setTip] = useState(false);
  const meta = BADGE_META[type];
  const earned = !!earnedAt;

  return (
    <div className="relative" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
      <div
        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all cursor-default select-none ${
          earned
            ? "border-opacity-60 bg-[rgba(201,147,58,0.05)] shadow-md"
            : "border-[#2c2220] bg-[#1a1614] opacity-30 grayscale"
        }`}
        style={earned ? { borderColor: meta?.color ?? "#c9933a", boxShadow: earned ? `0 0 10px ${meta?.color ?? "#c9933a"}30` : undefined } : undefined}
      >
        <span className={`text-2xl leading-none ${earned ? "" : "opacity-30"}`}>{meta?.emoji ?? "🏅"}</span>
      </div>
      <p className={`font-typewriter text-[8px] text-center mt-1 leading-tight max-w-[64px] ${earned ? "text-[#8b7355]" : "text-[#2c2220]"}`}>
        {meta?.label ?? type}
      </p>
      {tip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 px-2 py-1.5 bg-[#1a1614] border border-[rgba(201,147,58,0.3)] shadow-lg max-w-[160px]">
          <p className="font-typewriter text-[10px] text-[#e8b455]">{meta?.label}</p>
          <p className="font-typewriter text-[9px] text-[#8b7355] leading-snug">{meta?.description}</p>
          {earnedAt && <p className="font-typewriter text-[9px] text-[#4a3a2a] mt-0.5">{earnedAt.slice(0, 10)}</p>}
        </div>
      )}
    </div>
  );
}

export default function BadgeGrid({ earned }: Props) {
  const earnedMap = new Map(earned.map((b) => [`${b.badge_type}:${b.unit_id ?? ""}`, b.earned_at]));
  const earnedCount = earned.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-[#f5e6c8]">Mis Insignias</h2>
        <span className="font-typewriter text-xs text-[#c9933a]">{earnedCount} earned</span>
      </div>

      {/* Passport stamps — one per unit */}
      <div>
        <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-3">
          Sellos de pasaporte — Países visitados
        </p>
        <div className="flex flex-wrap gap-4">
          {UNITS.map((u) => {
            // unit_completed badges are ordered by earned_at — map positionally to units
            const earnedAt = earned
              .filter((b) => b.badge_type === "unit_completed")
              .find((_, i) => i === u.number - 1)?.earned_at;
            return (
              <PassportStamp
                key={u.number}
                unitNumber={u.number}
                country={u.country}
                flag={u.flag}
                earnedAt={earnedAt}
              />
            );
          })}
        </div>
      </div>

      {/* Achievement badges */}
      <div>
        <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-3">
          Logros especiales
        </p>
        <div className="flex flex-wrap gap-4">
          {ACHIEVEMENT_BADGES.map((type) => (
            <AchievementBadge
              key={type}
              type={type}
              earnedAt={earnedMap.get(`${type}:`) ?? earnedMap.get(`${type}:null`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
