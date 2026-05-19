"use client";

import { useState, useCallback, useRef } from "react";
import VocabMatch from "@/components/games/VocabMatch";
import TimedFlashcards from "@/components/games/TimedFlashcards";
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

const PASSING_THRESHOLD = 0.70; // 70% to pass a stage
const MAX_RETRY_CYCLES  = 3;    // after 3 retries, force-pass regardless

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  vocab: VocabPair[];
  sentences?: SentenceItem[];  // optional Aplicación stage
  unitId?: string;
  unitNumber: number;
  onComplete: (opts: { passedFirstTry: boolean; retries: number; advancedWithoutPassing: boolean }) => void;
}

// ── Helper: build initial stage list ─────────────────────────────────────────

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
  const [phase, setPhase] = useState<"intro" | "training" | "summary">("intro");
  const [cycle, setCycle] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stages, setStages] = useState<AcademiaStage[]>(() => buildStages(hasSentences));
  const [allPassed, setAllPassed] = useState(false);
  const [passedFirstTry, setPassedFirstTry] = useState(true); // optimistic; cleared on any failure
  const [retries, setRetries] = useState(0);

  // Guard against double-fire from game components
  const stageCompletedRef = useRef(false);

  // ── Stage completion handler ─────────────────────────────────────────────

  const handleStageComplete = useCallback(
    (result: GameResult) => {
      if (stageCompletedRef.current) return;
      stageCompletedRef.current = true;

      const stagePassed = result.maxScore > 0
        ? result.score / result.maxScore >= PASSING_THRESHOLD
        : true;

      setStages((prev) => {
        const next = prev.map((s, i) => (i === currentIndex ? { ...s, passed: stagePassed } : s));

        // Check if this was the last stage in the cycle
        const isLastInCycle = currentIndex === prev.length - 1;

        if (!isLastInCycle) {
          // Advance to next stage in same cycle
          setTimeout(() => {
            stageCompletedRef.current = false;
            setCurrentIndex((i) => i + 1);
          }, 600);
          return next;
        }

        // End of cycle — evaluate
        const failed = next.filter((s) => !s.passed);
        const allDone = failed.length === 0;
        const forcePassed = cycle >= MAX_RETRY_CYCLES;

        if (allDone || forcePassed) {
          // Training complete — if forced pass or any stage failed, clear first-try flag
          if (!stagePassed || !allDone) setPassedFirstTry(false);
          setAllPassed(allDone);
          setTimeout(() => {
            setPhase("summary");
          }, 600);
          return next;
        }

        // More retries needed — rebuild stage list with only failed stages
        if (!stagePassed) {
          setPassedFirstTry(false);
        }

        const nextCycle = cycle + 1;
        setCycle(nextCycle);
        setRetries(nextCycle);
        const retryStages = failed.map((s) => ({ ...s, passed: false }));

        setTimeout(() => {
          stageCompletedRef.current = false;
          setCurrentIndex(0);
        }, 600);

        return retryStages;
      });
    },
    [currentIndex, cycle, passedFirstTry]
  );

  // ── Summary — tell parent we're done ────────────────────────────────────

  function handleContinue(advancedWithoutPassing: boolean) {
    onComplete({ passedFirstTry, retries, advancedWithoutPassing });
  }

  // ── Retry — reset to beginning ───────────────────────────────────────────

  function handleRetryAll() {
    stageCompletedRef.current = false;
    setCycle(0);
    setRetries(0);
    setCurrentIndex(0);
    setPassedFirstTry(true);
    setAllPassed(false);
    setStages(buildStages(hasSentences));
    setPhase("training");
  }

  // ── Render: Intro ─────────────────────────────────────────────────────────

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-[#0d0b0a] flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {/* Emblem */}
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

          {/* Description */}
          <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5 mb-6 space-y-3">
            <p className="font-typewriter text-sm text-[#c4a882] leading-relaxed">
              Antes de esta misión necesitas demostrar que conoces el vocabulario clave.
            </p>
            <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed">
              Completa los entrenamientos a continuación. Aprueba cada etapa con un{" "}
              <span className="text-[#e8b455]">70%</span> o más para continuar.
            </p>

            {/* Stage list */}
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

          {/* Reward hint */}
          <div className="border border-[rgba(201,147,58,0.15)] bg-[rgba(201,147,58,0.04)] px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-xl shrink-0">⭐</span>
            <p className="font-typewriter text-[10px] text-[#8b7355] leading-relaxed">
              Pasa todo a la primera para ganar la insignia{" "}
              <span className="text-[#e8b455]">Recluta Distinguido</span> y 50 puntos extra.
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

    return (
      <div className="min-h-screen bg-[#0d0b0a] flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="flex flex-col items-center mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg mb-4 ${
              allPassed
                ? "bg-gradient-to-br from-[#c9933a] to-[#8b5e10] shadow-[0_0_40px_rgba(201,147,58,0.4)]"
                : "bg-gradient-to-br from-[#3a2a1a] to-[#2c1a08] border-2 border-[rgba(201,147,58,0.3)]"
            }`}>
              <span className="text-4xl">{allPassed ? "🏅" : "📋"}</span>
            </div>
            <h2 className="font-display font-black text-3xl text-[#e8b455] mt-1 text-center">
              {allPassed ? "¡Entrenamiento completo!" : "Resumen del entrenamiento"}
            </h2>
            <p className="font-typewriter text-xs text-[#8b7355] mt-1">
              {retries === 0 && allPassed
                ? "Aprobaste a la primera"
                : allPassed
                ? `Aprobado en ${retries + 1} intento(s)`
                : "Puedes continuar o intentarlo de nuevo"}
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
                  <span className={`font-typewriter text-xs ${s.passed ? "text-[#c9933a]" : "text-[#c0392b]"}`}>
                    {s.passed ? "✓ Aprobado" : "✗ No aprobado"}
                  </span>
                </div>
              );
            })}

            {passedFirstTry && (
              <div className="pt-2 border-t border-[rgba(201,147,58,0.1)] flex items-center gap-2">
                <span className="text-base">⭐</span>
                <p className="font-typewriter text-[10px] text-[#e8b455]">
                  ¡Insignia Recluta Distinguido desbloqueada!
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            {/* Always available: advance to mission */}
            <button
              onClick={() => handleContinue(hasFailed)}
              className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
            >
              {allPassed ? "Comenzar misión →" : "Continuar a la misión →"}
            </button>

            {/* Retry option when not all passed */}
            {hasFailed && (
              <button
                onClick={handleRetryAll}
                className="w-full py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase border border-[rgba(201,147,58,0.3)] text-[#8b7355] hover:text-[#c9933a] hover:border-[rgba(201,147,58,0.5)] transition-colors"
              >
                🔄 Reintentar entrenamiento
              </button>
            )}

            {/* Soft note when advancing without full pass */}
            {hasFailed && (
              <p className="font-typewriter text-[10px] text-[#4a3a2a] text-center leading-relaxed">
                Tu profesor/a sabrá que puedes necesitar apoyo adicional con este vocabulario.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Training ──────────────────────────────────────────────────────

  const currentStage = stages[currentIndex];
  if (!currentStage) return null;

  const meta = STAGE_META[currentStage.type];
  const totalStages = stages.length;

  // Build props for the current stage component
  const flashcardCards = vocab.map((v) =>
    currentStage.type === "memorization"
      ? { prompt: v.spanish, answer: v.english }
      : { prompt: v.english, answer: v.spanish }
  );

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

        {/* Stage progress pills */}
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
              Intento {cycle + 1}
            </span>
          )}
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 overflow-auto">
        {currentStage.type === "recognition" && (
          <VocabMatch
            title="Reconocimiento — Une las palabras"
            pairs={vocab}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}

        {(currentStage.type === "memorization" || currentStage.type === "production") && (
          <TimedFlashcards
            title={
              currentStage.type === "memorization"
                ? "Memorización — Español → Inglés"
                : "Producción — Inglés → Español"
            }
            cards={flashcardCards}
            timeLimit={60}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}

        {currentStage.type === "application" && hasSentences && (
          <SentenceBuilderStage
            sentences={sentences!}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}
      </div>
    </div>
  );
}
