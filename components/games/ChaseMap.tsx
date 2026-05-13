"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ChaseLocation } from "@/lib/types/unit-content";
import type { OnComplete } from "@/lib/games/types";

interface Props {
  locations: ChaseLocation[];
  correctRoute: string[];   // location IDs in order the suspect visits
  clues: string[];          // one clue per step (in Spanish, using ir+a structure)
  wrongPenalty?: number;    // seconds deducted per wrong click (default 15)
  onComplete: OnComplete;
}

const TRANSPORT_OPTIONS = [
  { id: "pie",    label: "a pie",       emoji: "🚶" },
  { id: "metro",  label: "en metro",    emoji: "🚇" },
  { id: "taxi",   label: "en taxi",     emoji: "🚕" },
  { id: "bus",    label: "en autobús",  emoji: "🚌" },
] as const;

const MAX_TIME = 300; // 5 minutes

// ── Madrid street map SVG background ─────────────────────────────────────────
function MadridMapSVG() {
  return (
    <svg
      viewBox="0 0 400 280"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base fill */}
      <rect width="400" height="280" fill="#100e0c" />

      {/* City blocks */}
      <rect x="20" y="20" width="60" height="40" rx="2" fill="#161210" />
      <rect x="90" y="20" width="50" height="30" rx="2" fill="#161210" />
      <rect x="155" y="10" width="70" height="35" rx="2" fill="#161210" />
      <rect x="240" y="15" width="55" height="40" rx="2" fill="#161210" />
      <rect x="310" y="20" width="70" height="35" rx="2" fill="#161210" />
      <rect x="20" y="80" width="45" height="50" rx="2" fill="#161210" />
      <rect x="20" y="145" width="60" height="45" rx="2" fill="#161210" />
      <rect x="95" y="90" width="55" height="40" rx="2" fill="#161210" />
      <rect x="165" y="85" width="45" height="35" rx="2" fill="#161210" />
      <rect x="225" y="85" width="40" height="30" rx="2" fill="#161210" />
      <rect x="280" y="80" width="50" height="45" rx="2" fill="#161210" />
      <rect x="345" y="80" width="45" height="50" rx="2" fill="#161210" />
      <rect x="95" y="145" width="45" height="40" rx="2" fill="#161210" />
      <rect x="155" y="150" width="55" height="40" rx="2" fill="#161210" />
      <rect x="225" y="145" width="45" height="45" rx="2" fill="#161210" />
      <rect x="285" y="145" width="50" height="40" rx="2" fill="#161210" />
      <rect x="350" y="145" width="40" height="40" rx="2" fill="#161210" />
      <rect x="20" y="210" width="70" height="50" rx="2" fill="#161210" />
      <rect x="105" y="205" width="45" height="55" rx="2" fill="#161210" />
      <rect x="165" y="210" width="55" height="45" rx="2" fill="#161210" />
      <rect x="235" y="205" width="45" height="50" rx="2" fill="#161210" />
      <rect x="295" y="210" width="55" height="45" rx="2" fill="#161210" />
      <rect x="360" y="205" width="30" height="55" rx="2" fill="#161210" />

      {/* Retiro Park — special green tint */}
      <ellipse cx="310" cy="148" rx="38" ry="30" fill="#0d1a0d" opacity="0.8" />
      <ellipse cx="310" cy="148" rx="38" ry="30" fill="none" stroke="#1a3a1a" strokeWidth="1" />

      {/* Major streets */}
      {/* Gran Vía — horizontal, upper center */}
      <line x1="0" y1="65" x2="400" y2="65" stroke="#2a2420" strokeWidth="8" />
      <line x1="0" y1="65" x2="400" y2="65" stroke="#1e1a17" strokeWidth="4" />

      {/* Paseo del Prado — vertical, east side */}
      <line x1="255" y1="0" x2="255" y2="280" stroke="#2a2420" strokeWidth="7" />
      <line x1="255" y1="0" x2="255" y2="280" stroke="#1e1a17" strokeWidth="3" />

      {/* Calle Alcalá — diagonal through center */}
      <line x1="0" y1="130" x2="280" y2="55" stroke="#232018" strokeWidth="5" />
      <line x1="0" y1="130" x2="280" y2="55" stroke="#1a1714" strokeWidth="2" />

      {/* Castellana — vertical center */}
      <line x1="195" y1="0" x2="195" y2="140" stroke="#232018" strokeWidth="5" />

      {/* Secondary streets */}
      <line x1="80" y1="0" x2="80" y2="280" stroke="#1a1714" strokeWidth="3" />
      <line x1="155" y1="0" x2="155" y2="280" stroke="#1a1714" strokeWidth="3" />
      <line x1="335" y1="0" x2="335" y2="280" stroke="#1a1714" strokeWidth="3" />
      <line x1="0" y1="130" x2="400" y2="130" stroke="#1a1714" strokeWidth="3" />
      <line x1="0" y1="195" x2="400" y2="195" stroke="#1a1714" strokeWidth="3" />

      {/* Manzanares river suggestion — far west */}
      <path d="M0,100 Q15,130 5,160 Q-5,190 10,220 Q20,250 5,280" stroke="#0d1520" strokeWidth="12" fill="none" />
      <path d="M0,100 Q15,130 5,160 Q-5,190 10,220 Q20,250 5,280" stroke="#111b28" strokeWidth="6" fill="none" />

      {/* Street labels */}
      <text x="120" y="61" fontFamily="monospace" fontSize="6" fill="#3a3028" letterSpacing="1">GRAN VÍA</text>
      <text x="260" y="120" fontFamily="monospace" fontSize="5" fill="#3a3028" letterSpacing="0.5" transform="rotate(90,260,120)">PASEO DEL PRADO</text>

      {/* Subtle grid overlay */}
      <line x1="0" y1="0" x2="400" y2="280" stroke="#1a1714" strokeWidth="0.5" opacity="0.3" />
      <line x1="400" y1="0" x2="0" y2="280" stroke="#1a1714" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

// ── Timer display ─────────────────────────────────────────────────────────────
function Timer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds < 60;
  const isCritical = seconds < 30;

  return (
    <div className={`flex items-center gap-2 font-typewriter tabular-nums ${isCritical ? "text-[#c0392b]" : isLow ? "text-[#e8b455]" : "text-[#c4a882]"}`}>
      <span className="text-lg tracking-wider">
        {mins}:{secs.toString().padStart(2, "0")}
      </span>
      {isCritical && <span className="text-xs animate-pulse">⚠</span>}
    </div>
  );
}

// ── Location pin ──────────────────────────────────────────────────────────────
function LocationPin({
  location,
  state,
  onClick,
}: {
  location: ChaseLocation;
  state: "idle" | "target" | "visited" | "wrong";
  onClick: () => void;
}) {
  const colors = {
    idle:    "border-[rgba(201,147,58,0.3)] bg-[rgba(13,11,10,0.85)] text-[#8b7355] hover:border-[rgba(201,147,58,0.6)] hover:text-[#c4a882]",
    target:  "border-[#c9933a] bg-[rgba(201,147,58,0.15)] text-[#e8b455] shadow-[0_0_12px_rgba(201,147,58,0.4)] animate-pulse",
    visited: "border-[rgba(201,147,58,0.5)] bg-[rgba(201,147,58,0.1)] text-[#c9933a]",
    wrong:   "border-[#c0392b] bg-[rgba(192,57,43,0.15)] text-[#c0392b] shadow-[0_0_8px_rgba(192,57,43,0.3)]",
  };

  return (
    <button
      onClick={onClick}
      disabled={state === "visited"}
      style={{
        position: "absolute",
        left: `${location.coordinates.x}%`,
        top: `${location.coordinates.y}%`,
        transform: "translate(-50%, -100%)",
      }}
      className={`
        group flex flex-col items-center gap-0.5 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[#c9933a] rounded-sm
        ${state === "visited" ? "cursor-default" : "cursor-pointer"}
      `}
    >
      {/* Pin label */}
      <div
        className={`
          px-2 py-1 border text-[9px] font-typewriter tracking-wide whitespace-nowrap
          backdrop-blur-sm transition-all duration-200 ${colors[state]}
        `}
      >
        {location.name}
      </div>
      {/* Pin needle */}
      <div
        className={`w-0.5 h-2 transition-colors ${
          state === "visited" ? "bg-[#c9933a]"
          : state === "wrong" ? "bg-[#c0392b]"
          : state === "target" ? "bg-[#e8b455]"
          : "bg-[#8b7355]"
        }`}
      />
      {/* Pin dot */}
      <div
        className={`w-2 h-2 rounded-full border transition-colors ${
          state === "visited" ? "bg-[#c9933a] border-[#c9933a]"
          : state === "wrong" ? "bg-[#c0392b] border-[#c0392b]"
          : state === "target" ? "bg-[#e8b455] border-[#e8b455]"
          : "bg-[#2a2420] border-[#8b7355]"
        }`}
      />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChaseMap({
  locations,
  correctRoute,
  clues,
  wrongPenalty = 15,
  onComplete,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [routeStep, setRouteStep] = useState(0);       // which step we're on
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [phase, setPhase] = useState<"chase" | "transport" | "done">("chase");
  const [wrongFlashId, setWrongFlashId] = useState<string | null>(null);
  const [penalty, setPenalty] = useState<number | null>(null); // show penalty flash
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isFinished = phase === "done";
  const currentTargetId = correctRoute[routeStep];
  const currentClue = clues[routeStep] ?? clues[clues.length - 1];

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isFinished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [isFinished]);

  // ── Time ran out ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === 0 && !isFinished) {
      setPhase("done");
      onComplete({
        score: 0,
        maxScore: MAX_TIME,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        attempts,
      });
    }
  }, [timeLeft, isFinished, onComplete, startTime, attempts]);

  // ── Finish chase ──────────────────────────────────────────────────────────
  const finishChase = useCallback(() => {
    clearInterval(timerRef.current!);
    setPhase("done");
    onComplete({
      score: timeLeft,
      maxScore: MAX_TIME,
      timeSpent: Math.round((Date.now() - startTime) / 1000),
      attempts,
    });
  }, [timeLeft, startTime, attempts, onComplete]);

  // ── Click a location pin ──────────────────────────────────────────────────
  function handlePinClick(locId: string) {
    if (phase !== "chase" || isFinished) return;
    setAttempts((a) => a + 1);

    if (locId === currentTargetId) {
      // Correct!
      setVisitedIds((prev) => [...prev, locId]);
      setPhase("transport");
    } else {
      // Wrong — flash red and deduct time
      setWrongFlashId(locId);
      const deduct = Math.min(wrongPenalty, timeLeft - 1);
      setPenalty(deduct);
      setTimeLeft((t) => Math.max(1, t - wrongPenalty));
      setTimeout(() => { setWrongFlashId(null); setPenalty(null); }, 1200);
    }
  }

  // ── Pick transport (any choice is fine — it's practice) ──────────────────
  function handleTransportChoice() {
    const nextStep = routeStep + 1;
    if (nextStep >= correctRoute.length) {
      // Chase complete!
      setPhase("done");
      finishChase();
    } else {
      setRouteStep(nextStep);
      setPhase("chase");
    }
  }

  // ── Pin state helper ──────────────────────────────────────────────────────
  function getPinState(locId: string): "idle" | "target" | "visited" | "wrong" {
    if (visitedIds.includes(locId)) return "visited";
    if (locId === wrongFlashId) return "wrong";
    if (phase === "chase" && locId === currentTargetId) return "idle"; // don't highlight target — make them read the clue
    return "idle";
  }

  // ── Phase: transport choice ───────────────────────────────────────────────
  if (phase === "transport") {
    const justVisited = locations.find((l) => l.id === correctRoute[routeStep - 1 < 0 ? 0 : routeStep]);
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center p-6 bg-[#0d0b0a]">
        <div className="max-w-md w-full space-y-6 text-center">
          <div>
            <p className="font-typewriter text-[10px] tracking-[0.35em] uppercase text-[#c9933a] mb-1">
              ¡Correcto! · Siguiente paso
            </p>
            <p className="font-display text-2xl font-bold text-[#e8b455] mb-1">
              {justVisited?.name ?? "Ubicación encontrada"}
            </p>
            <p className="font-typewriter text-xs text-[#8b7355]">
              Paso {routeStep}/{correctRoute.length}
            </p>
          </div>

          <div className="border border-[rgba(201,147,58,0.25)] bg-[rgba(201,147,58,0.04)] px-5 py-4">
            <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-3">
              ¿Cómo vas tú?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {TRANSPORT_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={handleTransportChoice}
                  className="flex items-center gap-2 px-4 py-3 border border-[rgba(201,147,58,0.2)] bg-[#1a1614] text-[#c4a882] font-typewriter text-sm hover:border-[rgba(201,147,58,0.5)] hover:bg-[rgba(201,147,58,0.06)] transition-all"
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Timer seconds={timeLeft} />
            <span className="font-typewriter text-[9px] text-[#4a3a2a] uppercase tracking-wider">restante</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: chase (map) ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-[480px] bg-[#0d0b0a]">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-[rgba(201,147,58,0.12)] bg-[#110f0d] flex items-center justify-between">
        <div>
          <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355]">
            Persecución · Madrid
          </p>
          <p className="font-typewriter text-xs text-[#c4a882] mt-0.5">
            Paso {routeStep + 1} de {correctRoute.length}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Timer seconds={timeLeft} />
          {/* Progress pips */}
          <div className="flex gap-1">
            {correctRoute.map((id, i) => (
              <div
                key={id}
                className={`w-2 h-2 rounded-full ${i < routeStep ? "bg-[#c9933a]" : i === routeStep ? "bg-[#8b1a1a] shadow-[0_0_4px_rgba(192,57,43,0.6)]" : "bg-[#2a2420]"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Clue panel */}
      <div className="shrink-0 px-4 py-3 border-b border-[rgba(201,147,58,0.12)] bg-[rgba(201,147,58,0.04)]">
        <div className="flex items-start gap-3 max-w-3xl mx-auto">
          <span className="text-[#c9933a] shrink-0 text-sm">📡</span>
          <div>
            <p className="font-typewriter text-[9px] tracking-[0.25em] uppercase text-[#8b7355] mb-1">
              Pista de inteligencia:
            </p>
            <p className="font-typewriter text-sm text-[#e8b455] leading-relaxed">
              &ldquo;{currentClue}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Penalty flash */}
      {penalty !== null && (
        <div className="shrink-0 px-4 py-2 bg-[rgba(192,57,43,0.12)] border-b border-[rgba(192,57,43,0.2)] text-center">
          <p className="font-typewriter text-xs text-[#c0392b] animate-pulse">
            ⚠ Ubicación incorrecta — −{penalty} segundos
          </p>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative overflow-hidden min-h-[280px]">
        <MadridMapSVG />

        {/* Pins */}
        {locations.map((loc) => (
          <LocationPin
            key={loc.id}
            location={loc}
            state={getPinState(loc.id)}
            onClick={() => handlePinClick(loc.id)}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="shrink-0 px-4 py-2 border-t border-[rgba(201,147,58,0.1)] bg-[#0d0b0a]">
        <p className="font-typewriter text-[9px] text-[#4a3a2a] text-center tracking-wide">
          Lee la pista · Haz clic en la ubicación correcta del mapa · −{wrongPenalty}s por error
        </p>
      </div>
    </div>
  );
}
