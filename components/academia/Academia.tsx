"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import VocabMatch from "@/components/games/VocabMatch";
import MultipleChoiceProduction from "@/components/games/MultipleChoiceProduction";
import SentenceBuilderStage from "@/components/games/SentenceBuilderStage";
import type { VocabPair, GameResult } from "@/lib/games/types";
import type { SentenceItem } from "@/lib/types/unit-content";

// ── Types ─────────────────────────────────────────────────────────────────────
type StageType = "recognition" | "memorization" | "production" | "application";

interface AcademiaStage {
  type: StageType;
  passed: boolean;
}

const STAGE_META: Record<
  StageType,
  { labelEs: string; labelEn: string; emoji: string; activityType: string }
> = {
  recognition:  { labelEs: "Reconocimiento",  labelEn: "Recognition",  emoji: "👁️", activityType: "academia_recognition"  },
  memorization: { labelEs: "Memorización",    labelEn: "Memorization", emoji: "🧠", activityType: "academia_memorization" },
  production:   { labelEs: "Producción",      labelEn: "Production",   emoji: "✍️", activityType: "academia_production"   },
  application:  { labelEs: "Aplicación",      labelEn: "Application",  emoji: "🔗", activityType: "academia_application"  },
};

const PASSING_THRESHOLD = 0.70;
const MAX_RETRY_CYCLES  = 3;

interface Props {
  vocab: VocabPair[];
  sentences?: SentenceItem[];
  unitId?: string;
  unitNumber: number;
  onComplete: (opts: { passedFirstTry: boolean; retries: number; advancedWithoutPassing: boolean }) => void;
}

// ── Flag helper ───────────────────────────────────────────────────────────────
async function fireFlag(flagType: string, unitId?: string, context: Record<string, unknown> = {}) {
  try {
    await fetch("/api/game/student-flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagType, unitId, context }),
    });
  } catch { /* never crash the game */ }
}

// ── Confetti component (pure CSS, no deps) ────────────────────────────────────
function Confetti() {
  const colors = ["#c9933a", "#e8b455", "#c0392b", "#f5e6c8", "#8b7355", "#e8b455"];
  const pieces = Array.from({ length: 36 }, (_, i) => i);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50" aria-hidden>
      {pieces.map((i) => {
        const color = colors[i % colors.length];
        const left  = `${(i / 36) * 100 + Math.sin(i) * 5}%`;
        const delay = `${(i * 0.08) % 1.5}s`;
        const dur   = `${1.2 + (i % 5) * 0.2}s`;
        const size  = `${6 + (i % 4) * 3}px`;
        const rot   = `${(i * 37) % 360}deg`;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top: "-20px",
              width: size,
              height: size,
              background: color,
              borderRadius: i % 3 === 0 ? "50%" : "2px",
              transform: `rotate(${rot})`,
              animation: `confetti-fall ${dur} ${delay} ease-in forwards`,
              opacity: 0.9,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildStages(hasSentences: boolean): AcademiaStage[] {
  const types: StageType[] = ["recognition", "memorization", "production"];
  if (hasSentences) types.push("application");
  return types.map((t) => ({ type: t, passed: false }));
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Academia({
  vocab,
  sentences,
  unitId,
  unitNumber,
  onComplete,
}: Props) {
  const hasSentences = (sentences?.length ?? 0) > 0;

  const [phase, setPhase]               = useState<"intro" | "training" | "summary">("intro");
  const [cycle, setCycle]               = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stages, setStages]             = useState<AcademiaStage[]>(() => buildStages(hasSentences));
  const [allPassed, setAllPassed]       = useState(false);
  const [passedFirstTry, setPassedFirstTry] = useState(true);
  const [retries, setRetries]           = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Help-request sub-state (within summary phase)
  const [helpPhase, setHelpPhase]       = useState<"idle" | "composing" | "sending" | "sent">("idle");
  const [helpMessage, setHelpMessage]   = useState("");

  const stageCompletedRef = useRef(false);

  // ── Stage completion ─────────────────────────────────────────────────────
  const handleStageComplete = useCallback(
    (result: GameResult) => {
      if (stageCompletedRef.current) return;
      stageCompletedRef.current = true;

      const stagePassed = result.maxScore > 0
        ? result.score / result.maxScore >= PASSING_THRESHOLD
        : true;

      setStages((prev) => {
        const next = prev.map((s, i) => (i === currentIndex ? { ...s, passed: stagePassed } : s));
        const isLastInCycle = currentIndex === prev.length - 1;

        if (!isLastInCycle) {
          setTimeout(() => { stageCompletedRef.current = false; setCurrentIndex((i) => i + 1); }, 600);
          return next;
        }

        const failed     = next.filter((s) => !s.passed);
        const allDone    = failed.length === 0;
        const forcePassed = cycle >= MAX_RETRY_CYCLES;

        if (allDone || forcePassed) {
          if (!stagePassed || !allDone) setPassedFirstTry(false);
          setAllPassed(allDone);
          setTimeout(() => setPhase("summary"), 600);
          return next;
        }

        if (!stagePassed) setPassedFirstTry(false);
        const nextCycle = cycle + 1;
        setCycle(nextCycle);
        setRetries(nextCycle);
        const retryStages = failed.map((s) => ({ ...s, passed: false }));
        setTimeout(() => { stageCompletedRef.current = false; setCurrentIndex(0); }, 600);
        return retryStages;
      });
    },
    [currentIndex, cycle]
  );

  // Show confetti for first-try pass
  useEffect(() => {
    if (phase === "summary" && allPassed && passedFirstTry) {
      setShowConfetti(true);
      const id = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(id);
    }
  }, [phase, allPassed, passedFirstTry]);

  // ── Actions ──────────────────────────────────────────────────────────────
  function handleContinue(advancedWithoutPassing: boolean) {
    if (advancedWithoutPassing) {
      fireFlag("academia_skipped_after_failure", unitId, { retries, cycle });
    }
    onComplete({ passedFirstTry, retries, advancedWithoutPassing });
  }

  function handleRetryAll() {
    stageCompletedRef.current = false;
    setCycle(0);
    setRetries(0);
    setCurrentIndex(0);
    setPassedFirstTry(true);
    setAllPassed(false);
    setHelpPhase("idle");
    setHelpMessage("");
    setStages(buildStages(hasSentences));
    setPhase("training");
  }

  async function handleSendHelp() {
    setHelpPhase("sending");
    await fireFlag("help_requested", unitId, {
      message: helpMessage.trim() || null,
      retries,
      stageResults: stages.map((s) => ({ type: s.type, passed: s.passed })),
    });
    setHelpPhase("sent");
  }

  // ── Render: Intro ─────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-[#0d0b0a] flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c9933a] to-[#8b5e10] flex items-center justify-center shadow-[0_0_40px_rgba(201,147,58,0.4)] mb-4">
              <span className="text-3xl">🎓</span>
            </div>
            <p className="font-typewriter text-[9px] tracking-[0.4em] uppercase text-[#8b7355]">Unidad {unitNumber} · Preparación</p>
            <h1 className="font-display font-black text-4xl text-[#e8b455] mt-1 tracking-wide text-center">
              La Academia
            </h1>
            <p className="font-typewriter text-xs text-[#8b7355] mt-1 tracking-[0.15em]">de Campo</p>
          </div>

          <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5 mb-6 space-y-3">
            <p className="font-typewriter text-sm text-[#c4a882] leading-relaxed">
              Antes de esta misión necesitas demostrar que conoces el vocabulario clave.
            </p>
            <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed">
              Completa los entrenamientos a continuación. Alcanza un{" "}
              <span className="text-[#e8b455]">70%</span> o más en cada etapa para continuar.
            </p>
            <div className="pt-2 space-y-2">
              {buildStages(hasSentences).map((s) => {
                const m = STAGE_META[s.type];
                return (
                  <div key={s.type} className="flex items-center gap-3">
                    <span className="text-base w-6 text-center">{m.emoji}</span>
                    <div>
                      <p className="font-typewriter text-xs text-[#f5e6c8]">{m.labelEs}</p>
                      <p className="font-typewriter text-[10px] text-[#8b7355]">{m.labelEn}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-[rgba(201,147,58,0.15)] bg-[rgba(201,147,58,0.04)] px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-xl shrink-0">⭐</span>
            <p className="font-typewriter text-[10px] text-[#8b7355] leading-relaxed">
              ¡Completa todo a la primera para ganar la insignia{" "}
              <span className="text-[#e8b455]">Recluta Distinguido</span> y 50 puntos extra!
            </p>
          </div>

          <button
            onClick={() => setPhase("training")}
            className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            Comenzar entrenamiento →
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Summary ───────────────────────────────────────────────────────
  if (phase === "summary") {
    const hasFailed = stages.some((s) => !s.passed);

    // ── Pass state ────────────────────────────────────────────────────────
    if (!hasFailed) {
      return (
        <div className="min-h-screen bg-[#0d0b0a] flex flex-col items-center justify-center px-6 py-12">
          {showConfetti && <Confetti />}
          <div className="max-w-md w-full">
            <div className="flex flex-col items-center mb-8">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
                passedFirstTry
                  ? "bg-gradient-to-br from-[#c9933a] to-[#8b5e10] shadow-[0_0_60px_rgba(201,147,58,0.6)]"
                  : "bg-gradient-to-br from-[#c9933a] to-[#8b5e10] shadow-[0_0_40px_rgba(201,147,58,0.4)]"
              }`}>
                <span className="text-5xl">{passedFirstTry ? "🏅" : "✅"}</span>
              </div>
              {passedFirstTry ? (
                <>
                  <h2 className="font-display font-black text-4xl text-[#e8b455] text-center animate-pulse">
                    ¡Recluta Distinguido!
                  </h2>
                  <p className="font-typewriter text-sm text-[#c9933a] mt-2 tracking-[0.15em]">
                    ¡Perfecto a la primera! Insignia desbloqueada ⭐
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-display font-black text-3xl text-[#e8b455] text-center">
                    ¡Entrenamiento completo!
                  </h2>
                  <p className="font-typewriter text-xs text-[#8b7355] mt-1">
                    Aprobado en {retries + 1} intento{retries !== 0 ? "s" : ""}
                  </p>
                </>
              )}
            </div>

            <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5 mb-6 space-y-3">
              {stages.map((s) => {
                const m = STAGE_META[s.type];
                return (
                  <div key={s.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base w-6 text-center">{m.emoji}</span>
                      <span className="font-typewriter text-xs text-[#c4a882]">{m.labelEs}</span>
                    </div>
                    <span className="font-typewriter text-xs text-[#c9933a]">✓ Completado</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => handleContinue(false)}
              className="w-full clip-skew py-4 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors text-lg"
            >
              🎯 Comenzar misión →
            </button>
          </div>
        </div>
      );
    }

    // ── Fail state ────────────────────────────────────────────────────────
    return (
      <div className="min-h-screen bg-[#0d0b0a] flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">

          {/* Header — shame-free framing */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3a2a1a] to-[#2c1a08] border-2 border-[rgba(201,147,58,0.3)] flex items-center justify-center mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h2 className="font-display font-black text-3xl text-[#e8b455] text-center">
              Casi listo, recluta
            </h2>
            <p className="font-typewriter text-xs text-[#8b7355] mt-1 text-center">
              Sigue practicando — lo tienes
            </p>
          </div>

          {/* Stage results */}
          <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5 mb-4 space-y-3">
            {stages.map((s) => {
              const m = STAGE_META[s.type];
              return (
                <div key={s.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base w-6 text-center">{m.emoji}</span>
                    <span className="font-typewriter text-xs text-[#c4a882]">{m.labelEs}</span>
                  </div>
                  <span className={`font-typewriter text-xs ${s.passed ? "text-[#c9933a]" : "text-[#8b7355]"}`}>
                    {s.passed ? "✓ Aprobado" : "↺ Una vez más"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Help request flow */}
          {helpPhase === "idle" && (
            <div className="space-y-3">
              {/* Primary: retry */}
              <button
                onClick={handleRetryAll}
                className="w-full clip-skew py-3.5 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
              >
                🔄 Intentar de nuevo
              </button>

              {/* Secondary: continue anyway */}
              <button
                onClick={() => handleContinue(true)}
                className="w-full py-3 font-typewriter text-sm tracking-[0.15em] uppercase border border-[rgba(201,147,58,0.35)] text-[#c9933a] bg-[rgba(201,147,58,0.05)] hover:bg-[rgba(201,147,58,0.1)] transition-colors"
              >
                Continuar al caso →
              </button>

              {/* Tertiary: ask for help */}
              <button
                onClick={() => setHelpPhase("composing")}
                className="w-full py-2 font-typewriter text-xs tracking-[0.15em] uppercase border border-[rgba(201,147,58,0.15)] text-[#8b7355] hover:text-[#c4a882] hover:border-[rgba(201,147,58,0.3)] transition-colors"
              >
                🙋 Pedir ayuda al profesor
              </button>

              <p className="font-typewriter text-[10px] text-[#4a3a2a] text-center leading-relaxed">
                Está bien, recluta. Puedes intentar de nuevo más tarde.
                <br />Tu progreso se registra automáticamente.
              </p>
            </div>
          )}

          {/* Composing help message */}
          {helpPhase === "composing" && (
            <div className="space-y-3">
              <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-4">
                <p className="font-typewriter text-xs text-[#c4a882] mb-2">
                  ¿En qué parte necesitas ayuda? <span className="text-[#8b7355]">(opcional)</span>
                </p>
                <textarea
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  placeholder="Escribe aquí... (en español o inglés)"
                  maxLength={300}
                  rows={3}
                  className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.15)] text-[#c4a882] font-typewriter text-xs px-3 py-2 resize-none focus:outline-none focus:border-[rgba(201,147,58,0.4)] placeholder:text-[#4a3a2a]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSendHelp}
                  className="flex-1 clip-skew py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
                >
                  Enviar →
                </button>
                <button
                  onClick={() => setHelpPhase("idle")}
                  className="px-4 py-2.5 font-typewriter text-xs text-[#8b7355] border border-[rgba(201,147,58,0.15)] hover:text-[#c4a882] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Sending */}
          {helpPhase === "sending" && (
            <div className="text-center py-4">
              <p className="font-typewriter text-xs text-[#8b7355] animate-pulse">Enviando…</p>
            </div>
          )}

          {/* Help sent confirmation */}
          {helpPhase === "sent" && (
            <div className="space-y-3">
              <div className="border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] px-4 py-3">
                <p className="font-typewriter text-xs text-[#e8b455] font-bold mb-1">
                  ✓ Mensaje enviado
                </p>
                <p className="font-typewriter text-xs text-[#c4a882] leading-relaxed">
                  Tu profesor verá tu pregunta. Mientras tanto, puedes continuar al caso.
                </p>
              </div>

              <button
                onClick={handleRetryAll}
                className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
              >
                🔄 Intentar de nuevo
              </button>
              <button
                onClick={() => handleContinue(true)}
                className="w-full py-2.5 font-typewriter text-sm tracking-[0.15em] uppercase border border-[rgba(201,147,58,0.35)] text-[#c9933a] bg-[rgba(201,147,58,0.05)] hover:bg-[rgba(201,147,58,0.1)] transition-colors"
              >
                Continuar al caso →
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ── Render: Training ──────────────────────────────────────────────────────
  const currentStage = stages[currentIndex];
  if (!currentStage) return null;

  const meta = STAGE_META[currentStage.type];
  const totalStages = stages.length;


  return (
    <div className="min-h-screen bg-[#0d0b0a] flex flex-col">
      {/* Academia header strip */}
      <div className="shrink-0 border-b border-[rgba(201,147,58,0.2)] bg-[#111218] px-5 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">🎓</span>
          <div>
            <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">La Academia · Unidad {unitNumber}</p>
            <p className="font-display font-bold text-sm text-[#e8b455]">
              {meta.emoji} {meta.labelEs}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {stages.map((s, i) => (
            <div
              key={i}
              title={STAGE_META[s.type].labelEs}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < currentIndex
                  ? "bg-[#c9933a]"
                  : i === currentIndex
                  ? "bg-[#e8b455] shadow-[0_0_8px_rgba(232,180,85,0.6)] scale-110"
                  : "bg-[#2c2220]"
              }`}
            />
          ))}
          <span className="font-typewriter text-[9px] text-[#8b7355] ml-1">
            {currentIndex + 1}/{totalStages}
          </span>
          {cycle > 0 && (
            <span className="font-typewriter text-[9px] text-[#c0392b] ml-2">
              Una vez más {cycle + 1}
            </span>
          )}
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 overflow-auto">
        {/* key={cycle-currentIndex} forces a full remount on every retry cycle
            so internal state (status, timer, score) always starts fresh */}
        {currentStage.type === "recognition" && (
          <VocabMatch
            key={`recognition-${cycle}-${currentIndex}`}
            title="Reconocimiento — Une las palabras"
            pairs={vocab}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}

        {currentStage.type === "memorization" && (
          <MultipleChoiceProduction
            key={`memorization-${cycle}-${currentIndex}`}
            title="Memorización — ¿Qué significa?"
            vocab={vocab}
            direction="es-to-en"
            timeLimit={60}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}

        {currentStage.type === "production" && (
          <MultipleChoiceProduction
            key={`production-${cycle}-${currentIndex}`}
            title="Producción — ¿Cómo se dice?"
            vocab={vocab}
            direction="en-to-es"
            timeLimit={60}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}

        {currentStage.type === "application" && hasSentences && (
          <SentenceBuilderStage
            key={`application-${cycle}-${currentIndex}`}
            sentences={sentences!}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}
      </div>
    </div>
  );
}
