"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type BossCardStatus = "available" | "in_progress" | "completed" | "skipped";

interface Props {
  bossId: string;
  title: string;
  subtitle: string;
  status: BossCardStatus;
  currentStage?: number;
  totalStages?: number;
  finalEnding?: string | null;
}

const ENDING_LABELS: Record<string, string> = {
  pacto_silencioso:   "El Pacto Silencioso",
  cazador:            "El Cazador",
  maestro_negociador: "El Maestro Negociador",
};

export default function BossCard({ bossId, title, subtitle, status, currentStage, totalStages, finalEnding }: Props) {
  const router = useRouter();
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [skipping, setSkipping] = useState(false);

  async function handleSkip() {
    setSkipping(true);
    await fetch(`/api/boss/${bossId}/skip`, { method: "POST" }).catch(() => {});
    router.refresh();
  }

  const inProgress = status === "in_progress";
  const completed  = status === "completed";
  const skipped    = status === "skipped";

  return (
    <div className="col-span-2 sm:col-span-2 lg:col-span-2">
      <div
        className={`relative border-2 overflow-hidden transition-all ${
          completed ? "border-[rgba(201,147,58,0.6)] shadow-[0_0_30px_rgba(201,147,58,0.2)]"
          : inProgress ? "border-[#c0392b] shadow-[0_0_20px_rgba(192,57,43,0.3)] animate-pulse-subtle"
          : skipped ? "border-[rgba(201,147,58,0.2)] opacity-60"
          : "border-[#c0392b] shadow-[0_0_30px_rgba(192,57,43,0.4)]"
        }`}
        style={{
          background: completed
            ? "linear-gradient(135deg,#1a1614,#1e1810)"
            : "linear-gradient(135deg,#1a0a0a,#200d0d)",
        }}
      >
        {/* Top stripe */}
        <div className="h-1 w-full" style={{
          background: completed ? "#c9933a" : "linear-gradient(90deg,#c0392b,#8b1a1a,#c0392b)",
          backgroundSize: completed ? "auto" : "200% 100%",
        }} />

        <div className="p-5">
          {/* URGENTE seal */}
          {(status === "available" || status === "in_progress") && (
            <div className="flex justify-end mb-2">
              <span className="font-typewriter text-[9px] tracking-[0.35em] uppercase px-2.5 py-1 border border-[#c0392b] text-[#c0392b] bg-[rgba(192,57,43,0.1)]">
                {inProgress ? "EN PROGRESO" : "URGENTE"}
              </span>
            </div>
          )}

          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-14 h-14 shrink-0 flex items-center justify-center border-2 ${
              completed ? "border-[rgba(201,147,58,0.5)] bg-[rgba(201,147,58,0.08)]"
              : "border-[rgba(192,57,43,0.5)] bg-[rgba(192,57,43,0.08)]"
            }`}>
              <span className="text-2xl">{completed ? "✅" : "🎯"}</span>
            </div>
            <div>
              <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-0.5">
                {subtitle}
              </p>
              <h3 className={`font-display font-black text-xl leading-tight ${
                completed ? "text-[#e8b455]" : "text-[#f5e6c8]"
              }`}>
                {title}
              </h3>
            </div>
          </div>

          {/* Description */}
          {!completed && !skipped && (
            <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed mb-4">
              Sigue el rastro de El Tejedor por 5 países. Necesitarás todo lo que aprendiste en las Unidades 1-5.
            </p>
          )}

          {/* Progress bar (in_progress) */}
          {inProgress && currentStage != null && totalStages != null && (
            <div className="mb-4">
              <div className="flex justify-between font-typewriter text-[9px] text-[#8b7355] mb-1">
                <span>Progreso guardado</span>
                <span>Etapa {currentStage}/{totalStages - 1}</span>
              </div>
              <div className="h-1.5 bg-[#2c0a0a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c0392b] rounded-full"
                  style={{ width: `${((currentStage) / (totalStages - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Completed state */}
          {completed && finalEnding && (
            <div className="border border-[rgba(201,147,58,0.2)] bg-[rgba(201,147,58,0.06)] px-4 py-3 mb-4">
              <p className="font-typewriter text-[9px] uppercase text-[#8b7355]">Desenlace</p>
              <p className="font-typewriter text-sm text-[#e8b455] font-bold">{ENDING_LABELS[finalEnding] ?? finalEnding}</p>
            </div>
          )}

          {/* Actions */}
          {status === "available" && (
            <div className="space-y-2">
              <Link
                href={`/boss/${bossId}`}
                className="flex items-center justify-center gap-2 w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
              >
                🎯 Comenzar operación →
              </Link>
              {!showSkipConfirm ? (
                <button
                  onClick={() => setShowSkipConfirm(true)}
                  className="w-full font-typewriter text-[10px] tracking-widest uppercase text-[#4a3a2a] hover:text-[#8b7355] transition-colors py-1"
                >
                  Saltar por ahora →
                </button>
              ) : (
                <div className="border border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)] p-3 space-y-2">
                  <p className="font-typewriter text-[10px] text-[#c0392b]">
                    ¿Saltar Operación Eclipse? Podrás volver más tarde, pero perderás insignias exclusivas.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSkip}
                      disabled={skipping}
                      className="flex-1 py-2 font-typewriter text-[10px] uppercase border border-[rgba(192,57,43,0.4)] text-[#c0392b] hover:bg-[rgba(192,57,43,0.1)] transition-colors disabled:opacity-40"
                    >
                      {skipping ? "Saltando…" : "Sí, saltar"}
                    </button>
                    <button
                      onClick={() => setShowSkipConfirm(false)}
                      className="flex-1 py-2 font-typewriter text-[10px] uppercase border border-[rgba(201,147,58,0.3)] text-[#8b7355] hover:text-[#c9933a] transition-colors"
                    >
                      No, continuar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === "in_progress" && (
            <Link
              href={`/boss/${bossId}`}
              className="flex items-center justify-center gap-2 w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
            >
              ↩ Continuar operación →
            </Link>
          )}

          {completed && (
            <Link
              href={`/boss/${bossId}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 font-typewriter text-[10px] tracking-[0.2em] uppercase border border-[rgba(201,147,58,0.3)] text-[#8b7355] hover:text-[#c9933a] transition-colors"
            >
              Rejugar →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
