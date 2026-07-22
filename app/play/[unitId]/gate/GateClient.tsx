"use client";

import { useRouter } from "next/navigation";
import type { ReadinessTier } from "@/lib/mastery";

interface Props {
  unitNumber: number;
  country: string;
  tier: ReadinessTier;
  scorePercent: number; // 0-100
  hasWorld?: boolean;   // a scroll-through teaching world exists for this unit
}

const TIER_CONFIG = {
  ready: {
    emoji: "🟢",
    label: "Listo",
    headline: "¡Estás listo para la misión!",
    body: "Tu nivel de vocabulario es excelente. Puedes comenzar la misión directamente.",
    color: "text-[#4ade80]",
    borderColor: "border-[rgba(74,222,128,0.3)]",
    bgColor: "bg-[rgba(74,222,128,0.04)]",
    dotColor: "bg-[#4ade80]",
  },
  recommended: {
    emoji: "🟡",
    label: "Recomendado",
    headline: "Entrenamiento recomendado",
    body: "Tu vocabulario necesita un poco de práctica. Te recomendamos completar La Academia antes de la misión.",
    color: "text-[#e8b455]",
    borderColor: "border-[rgba(232,180,85,0.3)]",
    bgColor: "bg-[rgba(232,180,85,0.04)]",
    dotColor: "bg-[#e8b455]",
  },
  required: {
    emoji: "🔴",
    label: "Obligatorio",
    headline: "Entrenamiento requerido",
    body: "Necesitas practicar el vocabulario antes de comenzar. Completa La Academia para desbloquear la misión.",
    color: "text-[#c0392b]",
    borderColor: "border-[rgba(192,57,43,0.3)]",
    bgColor: "bg-[rgba(192,57,43,0.04)]",
    dotColor: "bg-[#c0392b]",
  },
};

export default function GateClient({ unitNumber, country, tier, scorePercent, hasWorld = false }: Props) {
  const router = useRouter();
  const cfg = TIER_CONFIG[tier];

  return (
    <div className="min-h-screen bg-[#0d0b0a] flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#1a1614] border border-[rgba(201,147,58,0.2)] flex items-center justify-center mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <p className="font-typewriter text-[9px] tracking-[0.4em] uppercase text-[#8b7355]">
            Unidad {unitNumber} · {country}
          </p>
          <h1 className="font-display font-black text-3xl text-[#e8b455] mt-1 text-center">
            Verificación de acceso
          </h1>
        </div>

        {/* Readiness card */}
        <div className={`border ${cfg.borderColor} ${cfg.bgColor} p-5 mb-5`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${cfg.dotColor}`} />
              <span className={`font-typewriter text-xs tracking-[0.2em] uppercase ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
            <span className={`font-typewriter text-lg font-bold ${cfg.color}`}>
              {scorePercent}%
            </span>
          </div>

          {/* Score bar */}
          <div className="h-2 bg-[#2c2220] rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-700 ${cfg.dotColor}`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>

          <div className="flex justify-between font-typewriter text-[9px] text-[#8b7355] mb-4">
            <span>0%</span>
            <span className="text-[#c0392b]">50% — Obligatorio</span>
            <span className="text-[#e8b455]">80% — Listo</span>
            <span>100%</span>
          </div>

          <p className={`font-typewriter text-sm ${cfg.color} font-bold mb-1`}>{cfg.headline}</p>
          <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed">{cfg.body}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {hasWorld && (
            <button
              onClick={() => router.push(`/play/${unitNumber}/mundo`)}
              className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.12)] text-[#e8b455] border border-[rgba(201,147,58,0.4)] hover:bg-[rgba(201,147,58,0.22)] transition-colors"
            >
              🌎 Explora el mundo primero
            </button>
          )}

          {tier === "ready" && (
            <button
              onClick={() => router.push(`/play/${unitNumber}`)}
              className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
            >
              Comenzar misión →
            </button>
          )}

          {tier === "recommended" && (
            <>
              <button
                onClick={() => router.push(`/play/${unitNumber}/academia`)}
                className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
              >
                🎓 Entrenar primero (recomendado)
              </button>
              <button
                onClick={() => router.push(`/play/${unitNumber}`)}
                className="w-full py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase border border-[rgba(201,147,58,0.2)] text-[#8b7355] hover:text-[#c4a882] hover:border-[rgba(201,147,58,0.4)] transition-colors"
              >
                Continuar de todas formas →
              </button>
            </>
          )}

          {tier === "required" && (
            <button
              onClick={() => router.push(`/play/${unitNumber}/academia`)}
              className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
            >
              🎓 Comenzar entrenamiento →
            </button>
          )}

          <button
            onClick={() => router.push("/mission-board")}
            className="w-full py-2 font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#4a3a2a] hover:text-[#8b7355] transition-colors"
          >
            ← Volver al tablero
          </button>
        </div>

        {/* Reward note for training tiers */}
        {tier !== "ready" && (
          <div className="mt-5 border border-[rgba(201,147,58,0.1)] bg-[rgba(201,147,58,0.03)] px-4 py-3 flex items-center gap-3">
            <span className="text-base shrink-0">⭐</span>
            <p className="font-typewriter text-[10px] text-[#8b7355] leading-relaxed">
              Completa La Academia a la primera para ganar la insignia{" "}
              <span className="text-[#e8b455]">Recluta Distinguido</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
