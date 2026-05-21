"use client";

import { useState } from "react";

interface Props {
  stageName: string;   // e.g. "Vocab Match", "Chase Map"
  unitId?: string;
  onSkip: () => void;
  className?: string;
}

// Fire-and-forget flag — never blocks the student
async function fireSkipFlag(stageName: string, unitId?: string) {
  try {
    await fetch("/api/game/student-flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flagType: "stage_skipped",
        unitId: unitId ?? null,
        context: { stage: stageName },
      }),
    });
  } catch { /* silent */ }
}

// Skip-forward SVG icon (no external deps)
function SkipIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}

export default function SkipStageButton({ stageName, unitId, onSkip, className = "" }: Props) {
  const [showModal, setShowModal] = useState(false);

  function handleConfirm() {
    setShowModal(false);
    fireSkipFlag(stageName, unitId);
    onSkip();
  }

  return (
    <>
      {/* ── Skip trigger button ──────────────────────────────────────────── */}
      <div className={`flex justify-center ${className}`}>
        <button
          onClick={() => setShowModal(true)}
          title="Saltar a la siguiente etapa. Tu progreso se guarda."
          className="
            group flex items-center gap-2
            px-4 py-2
            font-typewriter text-xs tracking-[0.2em] uppercase
            text-[#c9933a] border border-[rgba(201,147,58,0.35)]
            bg-[rgba(201,147,58,0.06)]
            hover:text-[#e8b455] hover:border-[rgba(201,147,58,0.6)]
            hover:bg-[rgba(201,147,58,0.12)] hover:scale-105
            active:scale-95
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-[#c9933a] focus:ring-offset-1 focus:ring-offset-[#0d0b0a]
          "
        >
          <SkipIcon />
          Saltar esta etapa
        </button>
      </div>

      {/* ── Confirmation modal ───────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.75)] px-6"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-sm bg-[#1a1614] border border-[rgba(201,147,58,0.3)] p-6 space-y-5 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
            <div>
              <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-2">
                ¿Saltar esta etapa?
              </p>
              <p className="font-typewriter text-xs text-[#c4a882] leading-relaxed">
                Si saltas, no ganarás los puntos de esta etapa, pero puedes continuar con tu misión.
                Puedes intentarla otra vez más tarde.
              </p>
            </div>

            <div className="flex gap-3">
              {/* Cancel — primary visual weight */}
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
              >
                Continuar intentando
              </button>

              {/* Confirm skip — secondary visual weight */}
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 font-typewriter text-xs tracking-[0.15em] uppercase border border-[rgba(201,147,58,0.35)] text-[#c9933a] bg-[rgba(201,147,58,0.06)] hover:bg-[rgba(201,147,58,0.12)] hover:text-[#e8b455] transition-colors"
              >
                Sí, saltar →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
