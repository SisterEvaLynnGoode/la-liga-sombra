"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import GameShell from "./GameShell";
import { useGameTimer } from "@/lib/hooks/useGameTimer";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import type { OnComplete } from "@/lib/games/types";

// ── Local question type (mirrors lib/games/types ListeningQuestion) ───────────
interface LQ {
  question: string;
  options: string[];
  correctIndex: number;
  explanationEs?: string;
  explanationEn?: string;
}

interface Props {
  title?: string;
  audioUrl: string;
  transcript?: string;
  translation?: string;
  retryHint?: string;
  passingScore?: number;
  maxReplays?: number;
  unitId?: string;
  onComplete: OnComplete;
  // Legacy single-question (backward compat — units 2+)
  question?: string;
  options?: string[];
  correctIndex?: number;
  // Multi-question (unit 1+)
  questions?: LQ[];
}

export default function ListeningComprehension({
  title = "Comprensión Auditiva",
  audioUrl,
  transcript,
  translation,
  retryHint,
  passingScore,
  maxReplays = 3,
  unitId,
  onComplete,
  question: legacyQ,
  options: legacyOpts,
  correctIndex: legacyIdx,
  questions: multiQ,
}: Props) {
  const { elapsed, stop } = useGameTimer();
  const { recordAttempt } = useAttemptTracker("listening", unitId);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── Normalize to a single array (legacy = 1 item, multi = N items) ─────────
  const allQ: LQ[] =
    multiQ?.length
      ? multiQ
      : legacyQ && legacyOpts && legacyIdx !== undefined
      ? [{ question: legacyQ, options: legacyOpts, correctIndex: legacyIdx }]
      : [];

  const totalQ = allQ.length;

  // ── State ──────────────────────────────────────────────────────────────────
  const [playCount, setPlayCount]       = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [qIndex, setQIndex]             = useState(0);          // current question
  const [selected, setSelected]         = useState<number | null>(null);
  const [submitted, setSubmitted]       = useState(false);      // current Q answered
  const [correctness, setCorrectness]   = useState<boolean[]>([]); // per-Q result
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [allDone, setAllDone]           = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [status, setStatus]             = useState<"playing" | "complete">("playing");

  const currentQ    = allQ[qIndex];
  const replaysLeft = maxReplays - playCount;
  const correctCount = correctness.filter(Boolean).length;

  // ── Finish ─────────────────────────────────────────────────────────────────
  const finish = useCallback(
    (correct: number, total: number, t: number, att: number) => {
      stop();
      setStatus("complete");
      recordAttempt(correct, total, t);
      onComplete({ score: correct, maxScore: total || 1, timeSpent: t, attempts: att });
    },
    [stop, recordAttempt, onComplete]
  );

  // Auto-complete 2.5 s after all questions answered (gives time to read transcript)
  useEffect(() => {
    if (!allDone) return;
    const id = setTimeout(() => {
      finish(correctCount, totalQ, elapsed, totalAttempts);
    }, 2500);
    return () => clearTimeout(id);
  }, [allDone, correctCount, totalQ, elapsed, totalAttempts, finish]);

  // ── Audio ──────────────────────────────────────────────────────────────────
  function handlePlay() {
    const audio = audioRef.current;
    if (!audio || playCount >= maxReplays || allDone) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setPlayCount((c) => c + 1);
      audio.currentTime = 0;
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }

  // ── Questions ──────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (selected === null || !currentQ) return;
    const isCorrect = selected === currentQ.correctIndex;
    setTotalAttempts((a) => a + 1);
    setSubmitted(true);
    setCorrectness((prev) => {
      const next = [...prev];
      next[qIndex] = isCorrect;
      return next;
    });
  }

  function handleNext() {
    if (qIndex < totalQ - 1) {
      setQIndex((q) => q + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setAllDone(true);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
      onSkip={() => {
        stop();
        setStatus("complete");
        const r = { score: 0, maxScore: totalQ || 1, timeSpent: elapsed, attempts: totalAttempts, isSkipped: true };
        recordAttempt(0, totalQ || 1, elapsed);
        onComplete(r);
        return r;
      }}
    >
      <div className="p-5 max-w-xl mx-auto flex flex-col gap-5">

        {/* ── Audio player ─────────────────────────────────────────────────── */}
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5 rounded-sm">
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center gap-4">
            <button
              onClick={handlePlay}
              disabled={playCount >= maxReplays || allDone}
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center text-2xl
                border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#c9933a]
                ${playCount >= maxReplays || allDone
                  ? "border-[rgba(201,147,58,0.1)] text-[#4a3a2a] cursor-not-allowed"
                  : isPlaying
                  ? "border-[#c9933a] bg-[rgba(201,147,58,0.1)] text-[#e8b455] animate-pulse"
                  : "border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.05)] text-[#c9933a] hover:border-[#c9933a] hover:bg-[rgba(201,147,58,0.1)]"
                }
              `}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <div>
              <p className="font-typewriter text-xs text-[#f5e6c8]">
                {isPlaying
                  ? "Escuchando..."
                  : playCount === 0
                  ? "Presiona para escuchar"
                  : allDone
                  ? "Audio completado"
                  : "¿Listo para responder?"}
              </p>
              <p className={`font-typewriter text-[10px] mt-0.5 ${replaysLeft <= 1 ? "text-[#c0392b]" : "text-[#8b7355]"}`}>
                {replaysLeft > 0
                  ? `${replaysLeft} reproducción${replaysLeft !== 1 ? "es" : ""} restante${replaysLeft !== 1 ? "s" : ""}`
                  : "Sin más reproducciones"}
              </p>
            </div>
          </div>

          {isPlaying && (
            <div className="flex items-center gap-0.5 mt-3 justify-center" aria-hidden>
              {[2, 4, 6, 8, 6, 4, 7, 5, 3, 6, 8, 4, 2].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#c9933a] rounded-full animate-pulse"
                  style={{ height: `${h * 2}px`, animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Questions (shown after first play) ───────────────────────────── */}
        {playCount > 0 && !allDone && currentQ && (
          <>
            {/* Progress indicator — only for multi-question */}
            {totalQ > 1 && (
              <div className="flex items-center gap-3">
                <p className="font-typewriter text-[10px] text-[#8b7355] uppercase tracking-wider shrink-0">
                  Pregunta {qIndex + 1} de {totalQ}
                </p>
                <div className="flex gap-1">
                  {allQ.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-colors ${
                        i < qIndex
                          ? correctness[i] ? "bg-[#c9933a] w-5" : "bg-[#c0392b] w-5"
                          : i === qIndex ? "bg-[#8b1a1a] w-5"
                          : "bg-[#2a2420] w-5"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Question text */}
            <div>
              <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">
                {totalQ > 1 ? `Pregunta ${qIndex + 1}` : "Pregunta"}
              </p>
              <p className="font-display text-base font-bold text-[#f5e6c8]">{currentQ.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((opt, i) => {
                let style =
                  "border-[rgba(201,147,58,0.2)] bg-[#1a1614] text-[#c4a882] hover:border-[rgba(201,147,58,0.5)]";
                if (submitted) {
                  if (i === currentQ.correctIndex)
                    style = "border-[#c9933a] bg-[rgba(201,147,58,0.1)] text-[#e8b455]";
                  else if (i === selected)
                    style = "border-[#c0392b] bg-[rgba(192,57,43,0.08)] text-[#c0392b]";
                  else
                    style = "border-[rgba(201,147,58,0.1)] bg-[#1a1614] text-[#4a3a2a] opacity-60";
                } else if (selected === i) {
                  style = "border-[#c9933a] bg-[rgba(201,147,58,0.08)] text-[#e8b455]";
                }

                return (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelected(i)}
                    disabled={submitted}
                    className={`w-full text-left px-4 py-3 border font-typewriter text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#c9933a] focus:ring-offset-1 focus:ring-offset-[#0d0b0a] ${style}`}
                  >
                    <span className="text-[#8b7355] mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Submit or feedback */}
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={selected === null}
                className="clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Comprobar →
              </button>
            ) : (
              <div className="space-y-3">
                {/* Correct / wrong banner */}
                <div
                  className={`border px-4 py-3 ${
                    selected === currentQ.correctIndex
                      ? "border-[rgba(201,147,58,0.4)] bg-[rgba(201,147,58,0.08)]"
                      : "border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)]"
                  }`}
                >
                  <p
                    className={`font-display font-bold ${
                      selected === currentQ.correctIndex ? "text-[#e8b455]" : "text-[#c0392b]"
                    }`}
                  >
                    {selected === currentQ.correctIndex
                      ? "¡Correcto!"
                      : "Incorrecto — la respuesta correcta está marcada."}
                  </p>
                </div>

                {/* Explanations */}
                {(currentQ.explanationEn || currentQ.explanationEs) && (
                  <div className="border-l-2 border-[rgba(201,147,58,0.3)] pl-3 space-y-1">
                    {currentQ.explanationEn && (
                      <p className="font-typewriter text-xs text-[#c4a882] leading-snug">
                        {currentQ.explanationEn}
                      </p>
                    )}
                    {currentQ.explanationEs && (
                      <p className="font-typewriter text-[10px] text-[#8b7355] leading-snug italic">
                        {currentQ.explanationEs}
                      </p>
                    )}
                  </div>
                )}

                {/* Next / finish button */}
                <button
                  onClick={handleNext}
                  className="w-full clip-skew py-2.5 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#1a1614] text-[#c4a882] border border-[rgba(201,147,58,0.3)] hover:border-[rgba(201,147,58,0.6)] hover:text-[#e8b455] transition-all"
                >
                  {qIndex === totalQ - 1 ? "Ver resultado →" : "Siguiente pregunta →"}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Completion panel ─────────────────────────────────────────────── */}
        {allDone && (
          <div className="space-y-4">
            {/* Score card */}
            <div className="border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] px-5 py-4 text-center">
              <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-1">
                Resultado
              </p>
              <p className="font-display text-3xl font-bold text-[#e8b455]">
                {correctCount}/{totalQ}
              </p>
              <p className="font-typewriter text-xs text-[#c4a882] mt-1">
                {correctCount === totalQ
                  ? "¡Perfecto! Todas correctas."
                  : `${correctCount} correcta${correctCount !== 1 ? "s" : ""} de ${totalQ}`}
              </p>
              {passingScore !== undefined &&
                correctCount / totalQ < passingScore &&
                retryHint && (
                  <p className="font-typewriter text-[10px] text-[#8b7355] mt-2 border-t border-[rgba(201,147,58,0.15)] pt-2">
                    💡 {retryHint}
                  </p>
                )}
            </div>

            {/* Transcript */}
            {transcript && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">
                    Transcripción
                  </p>
                  {translation && (
                    <button
                      onClick={() => setShowTranslation((v) => !v)}
                      className="font-typewriter text-[10px] text-[#c9933a] hover:underline transition-colors"
                    >
                      {showTranslation ? "Ver español" : "Ver traducción"}
                    </button>
                  )}
                </div>
                <div className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] px-4 py-3">
                  <p className="font-typewriter text-xs text-[#c4a882] leading-relaxed">
                    {showTranslation && translation ? translation : transcript}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </GameShell>
  );
}
