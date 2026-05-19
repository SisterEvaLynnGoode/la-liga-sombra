"use client";

import type { BossDifficulty } from "@/lib/types/boss";

interface Props {
  selected: BossDifficulty | null;
  onChange: (d: BossDifficulty) => void;
}

const OPTIONS: Array<{
  id: BossDifficulty;
  emoji: string;
  title: string;
  frame: string;
  effect: string;
  badge: string;
  multiplier: string;
}> = [
  {
    id: "easy",
    emoji: "🔍",
    title: "Operación Silenciosa",
    frame: "Tómate el tiempo. Reúne inteligencia con cuidado.",
    effect: "Pistas extra, tiempos más largos, reintentos sin penalización.",
    badge: "Agente Cuidadoso",
    multiplier: "1× puntos",
  },
  {
    id: "normal",
    emoji: "⚡",
    title: "Operación Estándar",
    frame: "Protocolos estándar. La agencia confía en ti.",
    effect: "Configuración estándar del jefe.",
    badge: "Agente Estándar",
    multiplier: "1.5× puntos",
  },
  {
    id: "hard",
    emoji: "🔥",
    title: "Operación Relámpago",
    frame: "Rápido, sin margen de error. Solo para agentes de élite.",
    effect: "Tiempos estrictos, sin pistas, un solo intento.",
    badge: "Agente Élite",
    multiplier: "2× puntos",
  },
];

export default function DifficultySelect({ selected, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="font-typewriter text-[9px] tracking-[0.35em] uppercase text-[#8b7355] mb-4">
        ¿Cómo prefieres atacarla?
      </p>
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`w-full text-left border px-5 py-4 transition-all ${
            selected === opt.id
              ? "border-[#c0392b] bg-[rgba(192,57,43,0.1)]"
              : "border-[rgba(201,147,58,0.15)] bg-[#1a1614] hover:border-[rgba(201,147,58,0.4)]"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">{opt.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className={`font-display font-bold text-base ${selected === opt.id ? "text-[#f5e6c8]" : "text-[#c4a882]"}`}>
                  {opt.title}
                </p>
                <span className="font-typewriter text-[10px] text-[#c9933a] shrink-0">{opt.multiplier}</span>
              </div>
              <p className="font-typewriter text-xs text-[#8b7355] italic mb-1">&ldquo;{opt.frame}&rdquo;</p>
              <p className="font-typewriter text-[10px] text-[#4a3a2a]">{opt.effect}</p>
              <p className="font-typewriter text-[10px] text-[#c9933a] mt-1">🏅 Insignia: {opt.badge}</p>
            </div>
            {selected === opt.id && (
              <span className="text-[#c0392b] text-lg mt-0.5">✓</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
