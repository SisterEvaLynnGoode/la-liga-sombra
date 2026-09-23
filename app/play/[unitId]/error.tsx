"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

/**
 * The crash screen a student sees when an activity throws.
 *
 * It used to only `console.error`, which lives and dies in that student's
 * browser. A class hit this repeatedly on Caso 4 and there was nothing to look
 * at afterwards: no server error (the throw is in the browser), and Vercel's
 * runtime logs are gone within a day. So the same crash now files a
 * `client_crash` flag with the message, the digest and the caso, which lands in
 * the teacher inbox beside the other student flags and survives for later.
 *
 * Reporting is fire-and-forget and wrapped in a catch: a failure to report must
 * never replace the crash screen with a second crash.
 */
export default function PlayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ unitId: string }>();
  // One report per crash: React runs effects twice in development, and a
  // student mashing Reintentar should not spam the inbox either.
  const reported = useRef(false);

  useEffect(() => {
    console.error("Play error:", error);
    if (reported.current) return;
    reported.current = true;
    try {
      const body = JSON.stringify({
        flagType: "client_crash",
        context: {
          caso: params?.unitId ?? null,
          message: String(error?.message ?? "").slice(0, 300),
          name: error?.name ?? null,
          digest: error?.digest ?? null,
          // First few frames only — enough to name the component, short enough
          // to read in the inbox.
          stack: String(error?.stack ?? "").split("\n").slice(0, 4).join(" | ").slice(0, 600),
          url: typeof window !== "undefined" ? window.location.pathname : null,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : null,
        },
      });
      // keepalive: the student often reloads or navigates away immediately.
      void fetch("/api/game/student-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* never crash the crash screen */
    }
  }, [error, params]);

  return (
    <div className="min-h-screen bg-[#0d0b0a] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-5" role="alert">
        <span className="text-5xl block" role="img" aria-label="Warning">⚠️</span>
        <div>
          <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-1">
            Actividad interrumpida
          </p>
          <h2 className="font-display font-bold text-2xl text-[#f5e6c8]">
            Error en el juego
          </h2>
        </div>
        <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed">
          Esta actividad falló, pero tu progreso del caso está guardado.
          Al reintentar solo se reinicia esta actividad.
          <br />
          <span className="text-[#6b5a48]">
            This activity crashed — your case progress is safe. Retrying restarts only this activity.
          </span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="clip-skew px-6 py-3 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            ↺ Reintentar actividad
          </button>
          <Link
            href="/mission-board"
            className="clip-skew px-6 py-3 font-typewriter text-xs tracking-[0.2em] uppercase border border-[rgba(201,147,58,0.3)] text-[#c9933a] hover:bg-[rgba(201,147,58,0.08)] transition-colors text-center"
          >
            ← Volver al mapa
          </Link>
        </div>
      </div>
    </div>
  );
}
