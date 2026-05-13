"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error("App error:", error); }, [error]);

  return (
    <html lang="es">
      <body className="bg-[#0d0b0a] min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-5">
          <span className="text-5xl block" role="img" aria-label="Warning">⚠️</span>
          <div>
            <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-1">
              Error del sistema
            </p>
            <h1 className="font-display font-bold text-2xl text-[#f5e6c8]">
              Algo salió mal
            </h1>
          </div>
          <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed">
            There was an unexpected error. Your progress has been saved — you can
            try again or return to the mission board.
          </p>
          {error.digest && (
            <p className="font-typewriter text-[10px] text-[#4a3a2a]">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="clip-skew px-6 py-3 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
            >
              Intentar de nuevo
            </button>
            <Link
              href="/mission-board"
              className="clip-skew px-6 py-3 font-typewriter text-xs tracking-[0.2em] uppercase border border-[rgba(201,147,58,0.3)] text-[#c9933a] hover:bg-[rgba(201,147,58,0.08)] transition-colors text-center"
            >
              ← Volver al mapa
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
