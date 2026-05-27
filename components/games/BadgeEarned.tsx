"use client";

import { useEffect } from "react";
import type { BadgeType } from "@/lib/types/database";
import { BADGE_META } from "@/lib/games/badges";

interface Props {
  badges: BadgeType[];
  onDismiss: () => void;
  autoDismissMs?: number;
}

export default function BadgeEarned({ badges, onDismiss, autoDismissMs = 4000 }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(t);
  }, [onDismiss, autoDismissMs]);

  if (!badges.length) return null;

  // Show only first badge prominently; rest listed below
  const primary = BADGE_META[badges[0]] ?? BADGE_META.unit_completed;
  const rest = badges.slice(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="pointer-events-auto max-w-sm w-full text-center"
        style={{ animation: "stampIn 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {/* Badge icon */}
        <div className="text-8xl mb-3" style={{ filter: `drop-shadow(0 0 20px ${primary.color}60)` }}>
          {primary.emoji}
        </div>

        {/* Badge name */}
        <div
          className="inline-block border-2 px-5 py-2 mb-4"
          style={{ borderColor: primary.color }}
        >
          <p className="font-typewriter text-[9px] tracking-[0.35em] uppercase mb-0.5" style={{ color: primary.color }}>
            ¡Nueva Insignia!
          </p>
          <p className="font-display font-black text-xl text-[#f5e6c8]">{primary.label}</p>
        </div>

        <p className="font-typewriter text-xs text-[#8b7355] mb-4">{primary.description}</p>

        {rest.length > 0 && (
          <p className="font-typewriter text-xs text-[#c9933a]">
            +{rest.length} más: {rest.map((b) => BADGE_META[b]?.emoji ?? "🏅").join(" ")}
          </p>
        )}

        <button
          onClick={onDismiss}
          className="mt-4 font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors"
        >
          (toca para cerrar)
        </button>
      </div>
    </div>
  );
}
