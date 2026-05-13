"use client";

interface Props {
  clue: string;
  clueNumber: number;
  onDismiss: () => void;
}

export default function ClueReveal({ clue, clueNumber, onDismiss }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.92)" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(201,147,58,0.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Top label */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[rgba(201,147,58,0.3)] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c0392b] animate-pulse" />
          <span className="font-typewriter text-[10px] tracking-[0.35em] uppercase text-[#c9933a]">
            Pista #{clueNumber} Encontrada
          </span>
        </div>

        {/* Clue card — styled as an evidence envelope */}
        <div
          className="relative border-2 border-[rgba(201,147,58,0.5)] bg-gradient-to-br from-[#f8e9cc] to-[#efd9a0] p-8 shadow-[0_0_60px_rgba(201,147,58,0.2)]"
          style={{ animation: "stampIn 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          {/* Corner tape marks */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-3 bg-[rgba(201,147,58,0.4)] rotate-1" />

          <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b5e10] mb-3">
            Evidencia — Caso 01
          </p>

          <div className="border-t border-[rgba(139,94,16,0.3)] pt-4 mb-4">
            <p className="font-display text-xl font-bold text-[#2c1a08] leading-snug">
              &ldquo;{clue}&rdquo;
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-typewriter text-[9px] text-[#8b5e10] uppercase tracking-widest">
              Clasificado · La Liga Sombra
            </p>
            <span className="text-xl">🔍</span>
          </div>
        </div>

        {/* Subtext */}
        <p className="font-typewriter text-xs text-[#8b7355] mt-5 mb-6">
          This clue has been added to your case file.
        </p>

        <button
          onClick={onDismiss}
          className="clip-skew px-10 py-3 font-typewriter text-sm tracking-[0.25em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
        >
          Guardar pista →
        </button>
      </div>
    </div>
  );
}
