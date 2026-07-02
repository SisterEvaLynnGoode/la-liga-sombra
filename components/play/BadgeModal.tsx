"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CAN_DO, CAN_DO_SCALE } from "@/lib/can-do";
import SpeakPractice from "./SpeakPractice";

// Roman numerals for case numbers I–X
const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X"];

// Canonical unit order — used to derive next-unit country name
const UNIT_COUNTRIES = ["México","Puerto Rico","España","Costa Rica","Argentina","Colombia","Chile","Perú","Rep. Dominicana","Ecuador"];

interface Props {
  caseTitle: string;
  country: string;
  criminalName: string;
  unitNumber: number;
  score: number;
  maxScore: number;
  totalTimeSeconds: number;
  /** 2-3 unit vocab terms for optional pronunciation practice (B3). */
  speakingTerms?: Array<{ spanish: string; english: string }>;
}

export default function BadgeModal({ caseTitle, country, criminalName, unitNumber, score, maxScore, totalTimeSeconds, speakingTerms = [] }: Props) {
  const router = useRouter();
  const mins = Math.floor(totalTimeSeconds / 60);
  const secs = totalTimeSeconds % 60;
  const roman = ROMAN[(unitNumber - 1) % ROMAN.length] ?? String(unitNumber);
  const nextCountry = UNIT_COUNTRIES[unitNumber] ?? null; // unitNumber is 1-based, array is 0-based

  // ── Can-do self-assessment (Workstream B4) ─────────────────────────────────
  const statements = CAN_DO[unitNumber] ?? [];
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [canDoSaved, setCanDoSaved] = useState(false);

  function rate(index: number, rating: number) {
    if (canDoSaved) return;
    const next = { ...ratings, [index]: rating };
    setRatings(next);
    // Auto-submit once every statement has a rating (fire-and-forget)
    if (statements.length && Object.keys(next).length === statements.length) {
      setCanDoSaved(true);
      fetch("/api/game/can-do", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitNumber,
          ratings: Object.entries(next).map(([i, r]) => ({ index: Number(i), rating: r })),
        }),
      }).catch(() => {});
    }
  }

  // ── Informe del detective (Workstream B3, Unit 6+) ─────────────────────────
  const showReport = unitNumber >= 6;
  const [reportText, setReportText] = useState("");
  const [reportState, setReportState] = useState<"idle" | "saving" | "saved">("idle");

  async function submitReport() {
    if (!reportText.trim() || reportState !== "idle") return;
    setReportState("saving");
    try {
      await fetch("/api/game/field-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitNumber, text: reportText.trim() }),
      });
      setReportState("saved");
    } catch {
      setReportState("idle");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-[#0d0b0a]">
      {/* Multiple glow layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(201,147,58,0.2)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_30%_at_50%_40%,rgba(192,57,43,0.15)_0%,transparent_60%)] pointer-events-none" />

      {/* Decorative corner lines */}
      {["top-6 left-6 border-t border-l", "top-6 right-6 border-t border-r", "bottom-6 left-6 border-b border-l", "bottom-6 right-6 border-b border-r"].map((cls) => (
        <div key={cls} className={`absolute w-12 h-12 ${cls} border-[rgba(201,147,58,0.3)]`} />
      ))}

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Badge icon */}
        <div
          className="text-7xl mb-5"
          style={{ animation: "stampIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}
        >
          🏅
        </div>

        {/* CASO RESUELTO stamp */}
        <div
          className="inline-block border-4 border-[#c9933a] px-6 py-2 mb-6"
          style={{ animation: "stampIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.25s both" }}
        >
          <span className="font-display font-black text-3xl tracking-[0.1em] text-[#c9933a]">
            CASO RESUELTO
          </span>
        </div>

        {/* Case name */}
        <div style={{ animation: "fadeUp 0.5s ease 0.45s both" }}>
          <p className="font-typewriter text-[10px] tracking-[0.35em] uppercase text-[#8b7355] mb-1">
            {country} · Caso {roman}
          </p>
          <h2 className="font-display text-xl font-bold text-[#f5e6c8] mb-4">
            {caseTitle}
          </h2>
        </div>

        {/* Criminal caught */}
        <div
          className="border border-[rgba(192,57,43,0.4)] bg-[rgba(192,57,43,0.08)] px-6 py-3 mb-6 inline-block"
          style={{ animation: "fadeUp 0.5s ease 0.55s both" }}
        >
          <p className="font-typewriter text-xs text-[#8b7355] mb-0.5">Criminal capturado:</p>
          <p className="font-display font-bold text-lg text-[#c0392b]">{criminalName}</p>
        </div>

        {/* Stats */}
        <div
          className="flex justify-center gap-8 mb-8"
          style={{ animation: "fadeUp 0.5s ease 0.65s both" }}
        >
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-[#e8b455]">{score}/{maxScore}</p>
            <p className="font-typewriter text-[10px] uppercase tracking-widest text-[#8b7355]">Puntaje</p>
          </div>
          <div className="w-px bg-[rgba(201,147,58,0.2)]" />
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-[#e8b455]">
              {mins}:{secs.toString().padStart(2, "0")}
            </p>
            <p className="font-typewriter text-[10px] uppercase tracking-widest text-[#8b7355]">Tiempo</p>
          </div>
          <div className="w-px bg-[rgba(201,147,58,0.2)]" />
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-[#e8b455]">🏅</p>
            <p className="font-typewriter text-[10px] uppercase tracking-widest text-[#8b7355]">Insignia</p>
          </div>
        </div>

        {/* Can-do self-assessment */}
        {statements.length > 0 && (
          <div
            className="border border-[rgba(201,147,58,0.2)] bg-[rgba(201,147,58,0.04)] px-5 py-4 mb-6 text-left"
            style={{ animation: "fadeUp 0.5s ease 0.7s both" }}
          >
            <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-2">
              Autoevaluación · ¿Qué puedes hacer ahora?
            </p>
            <div className="space-y-2.5">
              {statements.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <p className="font-typewriter text-[11px] text-[#c4a882] leading-snug flex-1">{s}</p>
                  <div className="flex gap-1 shrink-0">
                    {CAN_DO_SCALE.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => rate(i, opt.value)}
                        disabled={canDoSaved}
                        title={opt.labelEs}
                        className={`w-8 h-8 text-base leading-none border transition-colors disabled:cursor-default ${
                          ratings[i] === opt.value
                            ? "border-[#c9933a] bg-[rgba(201,147,58,0.15)]"
                            : "border-[rgba(201,147,58,0.15)] hover:border-[rgba(201,147,58,0.45)] opacity-70 hover:opacity-100"
                        }`}
                      >
                        {opt.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="font-typewriter text-[9px] text-[#4a3a2a] mt-2">
              {canDoSaved ? "✓ Guardado en tu expediente" : "😕 Todavía no · 🙂 Con ayuda · 😎 ¡Sí, puedo!"}
            </p>
          </div>
        )}

        {/* Pronunciation practice (B3, optional, auto-hides if unsupported) */}
        {speakingTerms.length > 0 && (
          <SpeakPractice terms={speakingTerms} unitNumber={unitNumber} />
        )}

        {/* Informe del detective — free writing, Unit 6+ (B3) */}
        {showReport && (
          <div className="border border-[rgba(201,147,58,0.2)] bg-[rgba(201,147,58,0.04)] px-5 py-4 mb-6 text-left">
            <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-1">
              📝 Informe del detective <span className="normal-case tracking-normal">(opcional)</span>
            </p>
            <p className="font-typewriter text-[9px] text-[#4a3a2a] mb-2">
              Escribe 2–3 frases en español: ¿qué pasó en este caso? Tu profe lo leerá.
            </p>
            {reportState === "saved" ? (
              <p className="font-typewriter text-xs text-[#c9933a]">✓ Informe enviado al cuartel general.</p>
            ) : (
              <>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value.slice(0, 600))}
                  rows={3}
                  placeholder="El ladrón robó… Yo investigué… Al final…"
                  className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-2 font-typewriter text-xs text-[#f5e6c8] placeholder-[#3a3028] resize-none"
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    onClick={submitReport}
                    disabled={!reportText.trim() || reportState === "saving"}
                    className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-1.5 border border-[rgba(201,147,58,0.35)] text-[#c9933a] hover:border-[#c9933a] hover:text-[#e8b455] transition-colors disabled:opacity-30"
                  >
                    {reportState === "saving" ? "Enviando…" : "Enviar informe →"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* CTA */}
        <div style={{ animation: "fadeUp 0.5s ease 0.75s both" }}>
          <button
            onClick={() => router.push("/mission-board")}
            className="clip-skew px-10 py-4 font-typewriter text-sm tracking-[0.25em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-all duration-200 hover:shadow-[0_0_25px_rgba(192,57,43,0.4)]"
          >
            Volver al mapa →
          </button>
          {nextCountry && (
            <p className="font-typewriter text-[10px] text-[#8b7355] mt-3">
              Caso {ROMAN[unitNumber] ?? String(unitNumber + 1)} — {nextCountry} — ahora disponible
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
