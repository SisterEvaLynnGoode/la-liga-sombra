"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import GameShell from "./GameShell";
import { useGameTimer } from "@/lib/hooks/useGameTimer";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import type { OnComplete } from "@/lib/games/types";

// ── Local question type ───────────────────────────────────────────────────────
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
  // Legacy single-question
  question?: string;
  options?: string[];
  correctIndex?: number;
  // Multi-question
  questions?: LQ[];
}

// Phase tracks where we are in the experience
type Phase =
  | "loading"      // audio metadata loading
  | "loadError"    // audio failed to load
  | "ready"        // loaded, waiting for first play
  | "answering"    // first play done, answering questions
  | "resultFail"   // all answered, below passingScore
  | "resultPass";  // all answered, passed (or no passingScore)

// ── Flag helper (fire-and-forget, never crashes game) ─────────────────────────
async function fireListeningFlag(
  unitId: string | undefined,
  flag: "needs_support" | "transcript_revealed" | "listening_skipped"
) {
  if (!unitId) return;
  try {
    await fetch("/api/game/listening-flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitId, flag }),
    });
  } catch { /* never crash the game */ }
}

const SPEED_OPTIONS = [
  { label: "0.5×", value: 0.5 },
  { label: "0.75×", value: 0.75 },
  { label: "1×", value: 1.0 },
];

export default function ListeningComprehension({
  title = "Comprensión Auditiva",
  audioUrl,
  transcript,
  translation,
  retryHint,
  passingScore,
  maxReplays = 5,
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

  // ── Normalize to a single question array ─────────────────────────────────
  const allQ: LQ[] =
    multiQ?.length
      ? multiQ
      : legacyQ && legacyOpts && legacyIdx !== undefined
      ? [{ question: legacyQ, options: legacyOpts, correctIndex: legacyIdx }]
      : [];
  const totalQ = allQ.length;

  // ── Core state ────────────────────────────────────────────────────────────
  const [phase, setPhase]               = useState<Phase>("loading");
  const [isPlaying, setIsPlaying]       = useState(false);
  const [playCount, setPlayCount]       = useState(0);           // how many full plays started
  const [maxReplaysEff, setMaxReplaysEff] = useState(maxReplays);  // can be extended
  const [speed, setSpeed]               = useState(1.0);
  const [qIndex, setQIndex]             = useState(0);
  const [selected, setSelected]         = useState<number | null>(null);
  const [submitted, setSubmitted]       = useState(false);
  const [correctness, setCorrectness]   = useState<boolean[]>([]);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [showTranscriptEarly, setShowTranscriptEarly] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [status, setStatus]             = useState<"playing" | "complete">("playing");
  const [loadErrorTimer, setLoadErrorTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const currentQ      = allQ[qIndex];
  const replaysLeft   = maxReplaysEff - playCount;
  const correctCount  = correctness.filter(Boolean).length;
  const exhausted     = replaysLeft <= 0;

  // ── Audio event wiring ────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 5-second load timeout — if canplaythrough hasn't fired, show error
    const timer = setTimeout(() => {
      if (phase === "loading") setPhase("loadError");
    }, 5000);
    setLoadErrorTimer(timer);

    const onCanPlay = () => {
      clearTimeout(timer);
      // Only transition to "ready" if we're still in "loading" —
      // don't override "answering" or later phases if the user already clicked play.
      setPhase((current) => (current === "loading" ? "ready" : current));
    };
    const onError = () => {
      clearTimeout(timer);
      setPhase("loadError");
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("canplaythrough", onCanPlay);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      clearTimeout(timer);
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  // Apply playback rate when speed changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // ── Finish (called when student completes or skips) ───────────────────────
  const finish = useCallback(
    (correct: number, total: number, t: number, att: number) => {
      stop();
      setStatus("complete");
      recordAttempt(correct, total, t);
      onComplete({ score: correct, maxScore: total || 1, timeSpent: t, attempts: att });
    },
    [stop, recordAttempt, onComplete]
  );

  // ── Audio play handler ─────────────────────────────────────────────────────
  // KEY FIX: We don't count pausing/resuming as new replays.
  // playCount only increments when starting a fresh play from the beginning.
  function handlePlay() {
    const audio = audioRef.current;
    if (!audio || phase === "loadError") return;

    if (isPlaying) {
      // Pausing mid-play — don't increment playCount
      audio.pause();
      setIsPlaying(false);
    } else {
      if (exhausted) return;
      // Starting/resuming from beginning — increment count
      audio.currentTime = 0;
      audio.playbackRate = speed;
      audio.play().catch(() => setPhase("loadError"));
      setPlayCount((c) => c + 1);
      setIsPlaying(true);
      // Unlock questions after first play.
      // Also handles the case where user clicked play before canplaythrough fired
      // (phase is still "loading") — both "ready" and "loading" should advance to "answering".
      if (phase === "ready" || phase === "loading") setPhase("answering");
    }
  }

  // ── Request more replays ──────────────────────────────────────────────────
  function handleRequestMore() {
    setMaxReplaysEff((m) => m + 2);
    fireListeningFlag(unitId, "needs_support");
  }

  // ── Speed change ──────────────────────────────────────────────────────────
  function handleSpeedChange(v: number) {
    setSpeed(v);
    // If currently playing, update rate immediately
    if (audioRef.current) audioRef.current.playbackRate = v;
  }

  // ── Transcript early reveal ───────────────────────────────────────────────
  function handleRevealTranscript() {
    setShowTranscriptEarly(true);
    fireListeningFlag(unitId, "transcript_revealed");
  }

  // ── Answer question ───────────────────────────────────────────────────────
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
    // Track consecutive wrong for transcript reveal
    setConsecutiveWrong((n) => (isCorrect ? 0 : n + 1));
  }

  function handleNext() {
    if (qIndex < totalQ - 1) {
      setQIndex((q) => q + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      // All questions answered — determine pass/fail
      const newCorrectCount = correctness.filter(Boolean).length + (selected === currentQ?.correctIndex ? 1 : 0);
      const passed = passingScore === undefined || newCorrectCount / totalQ >= passingScore;
      setPhase(passed ? "resultPass" : "resultFail");
    }
  }

  // Snapshot final score/time when we first enter resultPass so the auto-advance
  // timer is not sensitive to elapsed ticking every second (which previously caused
  // the 1.5 s timeout to reset each second and never fire — the "Continuando…" hang).
  const resultSnapRef = useRef<{ correct: number; total: number; time: number; att: number } | null>(null);
  useEffect(() => {
    if (phase === "resultPass" && !resultSnapRef.current) {
      resultSnapRef.current = { correct: correctCount, total: totalQ, time: elapsed, att: totalAttempts };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]); // intentionally only on phase change

  // Auto-complete 2 s after pass. Only depends on phase — not on the ticking timer.
  const finishRef = useRef(finish);
  useEffect(() => { finishRef.current = finish; }, [finish]);

  useEffect(() => {
    if (phase !== "resultPass") return;
    const id = setTimeout(() => {
      const snap = resultSnapRef.current;
      if (snap) finishRef.current(snap.correct, snap.total, snap.time, snap.att);
    }, 2000);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]); // stable — does not include elapsed/totalAttempts

  // ── Retry ─────────────────────────────────────────────────────────────────
  function handleRetry() {
    setQIndex(0);
    setSelected(null);
    setSubmitted(false);
    setCorrectness([]);
    setConsecutiveWrong(0);
    setPlayCount(0);         // reset replay count on retry
    setPhase("ready");
  }

  // ── Skip (continue without solving) ──────────────────────────────────────
  function handleSkip() {
    fireListeningFlag(unitId, "listening_skipped");
    finish(0, totalQ || 1, elapsed, totalAttempts);
  }

  // ── Retry audio load ──────────────────────────────────────────────────────
  function handleRetryLoad() {
    const audio = audioRef.current;
    if (!audio) return;
    setPhase("loading");
    audio.load();
    // Reset the 5s timer
    if (loadErrorTimer) clearTimeout(loadErrorTimer);
    const timer = setTimeout(() => setPhase("loadError"), 5000);
    setLoadErrorTimer(timer);
  }

  // ── Derived flags ─────────────────────────────────────────────────────────
  const showEarlyTranscriptButton =
    transcript &&
    !showTranscriptEarly &&
    consecutiveWrong >= 2 &&
    phase === "answering";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
      unitId={unitId}
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

        {/* ── Load error ────────────────────────────────────────────────── */}
        {phase === "loadError" && (
          <div className="border border-[rgba(192,57,43,0.4)] bg-[rgba(192,57,43,0.06)] p-5 text-center space-y-3">
            <p className="font-display font-bold text-[#c0392b]">El audio no se cargó</p>
            <p className="font-typewriter text-xs text-[#c4a882]">
              Recarga la página o avisa a tu profesor.
            </p>
            <button
              onClick={handleRetryLoad}
              className="font-typewriter text-xs px-4 py-2 border border-[rgba(192,57,43,0.4)] text-[#c0392b] hover:bg-[rgba(192,57,43,0.1)] transition-colors"
            >
              ↺ Reintentar
            </button>
          </div>
        )}

        {/* ── Audio player ──────────────────────────────────────────────── */}
        {phase !== "loadError" && phase !== "resultFail" && phase !== "resultPass" && (
          <div className="border border-[rgba(201,147,58,0.3)] bg-[#1a1614] p-5 rounded-sm space-y-4">
            <audio ref={audioRef} src={audioUrl} className="hidden" preload="auto" />

            {/* Volume hint */}
            <div className="flex items-center gap-2 text-[#8b7355]">
              <span className="text-base">🔊</span>
              <p className="font-typewriter text-[10px]">
                ¿No oyes nada? Revisa el volumen de tu computadora.
              </p>
            </div>

            {/* Main play button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlay}
                disabled={exhausted && !isPlaying}
                aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center text-3xl
                  border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#c9933a]
                  ${exhausted && !isPlaying
                    ? "border-[rgba(201,147,58,0.1)] text-[#4a3a2a] cursor-not-allowed opacity-50"
                    : isPlaying
                    ? "border-[#c9933a] bg-[rgba(201,147,58,0.15)] text-[#e8b455] animate-pulse"
                    : "border-[#c9933a] bg-[rgba(201,147,58,0.1)] text-[#c9933a] hover:bg-[rgba(201,147,58,0.2)] shadow-[0_0_12px_rgba(201,147,58,0.2)]"
                  }
                `}
              >
                {phase === "loading" ? "⏳" : isPlaying ? "⏸" : "▶"}
              </button>

              <div className="flex-1">
                <p className="font-typewriter text-sm font-bold text-[#f5e6c8]">
                  {isPlaying
                    ? "Escuchando…"
                    : phase === "loading"
                    ? "▶ Presiona para escuchar el audio"
                    : playCount === 0
                    ? "▶ Presiona para escuchar el audio"
                    : exhausted
                    ? "Sin más reproducciones"
                    : "¿Listo para responder?"}
                </p>

                {/* Replay counter */}
                {phase !== "loading" && (
                  <p className={`font-typewriter text-xs mt-1 ${
                    replaysLeft <= 1 && !exhausted ? "text-[#c0392b] font-bold" : "text-[#8b7355]"
                  }`}>
                    {exhausted
                      ? "Sin más reproducciones"
                      : replaysLeft === 1
                      ? "⚠ Última oportunidad — pero puedes pedir más abajo"
                      : replaysLeft === 1 ? "Te queda 1 reproducción" : `Te quedan ${replaysLeft} reproducciones`}
                  </p>
                )}
              </div>
            </div>

            {/* Waveform animation while playing */}
            {isPlaying && (
              <div className="flex items-center gap-0.5 justify-center" aria-hidden>
                {[2, 4, 6, 8, 6, 4, 7, 5, 3, 6, 8, 4, 2].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#c9933a] rounded-full animate-pulse"
                    style={{ height: `${h * 2}px`, animationDelay: `${i * 60}ms` }}
                  />
                ))}
              </div>
            )}

            {/* Speed control */}
            {phase !== "loading" && (
              <div className="flex items-center gap-3 pt-1 border-t border-[rgba(201,147,58,0.1)]">
                <p className="font-typewriter text-[10px] text-[#8b7355] uppercase tracking-wider shrink-0">
                  Velocidad
                </p>
                <div className="flex gap-1">
                  {SPEED_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSpeedChange(opt.value)}
                      className={`font-typewriter text-[10px] px-2 py-1 border transition-colors ${
                        speed === opt.value
                          ? "border-[#c9933a] bg-[rgba(201,147,58,0.1)] text-[#e8b455]"
                          : "border-[rgba(201,147,58,0.15)] text-[#8b7355] hover:border-[rgba(201,147,58,0.4)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {speed < 1 && (
                  <p className="font-typewriter text-[10px] text-[#8b7355] italic">
                    Más lento para escuchar con más claridad
                  </p>
                )}
              </div>
            )}

            {/* "Request more audio" button — shown when exhausted */}
            {exhausted && (
              <button
                onClick={handleRequestMore}
                className="w-full py-3 font-typewriter text-sm tracking-[0.2em] uppercase border border-[rgba(201,147,58,0.4)] text-[#c9933a] bg-[rgba(201,147,58,0.06)] hover:bg-[rgba(201,147,58,0.12)] transition-colors"
              >
                🔄 Solicitar más audio (+2 reproducciones)
              </button>
            )}
          </div>
        )}

        {/* ── Early transcript reveal ────────────────────────────────────── */}
        {showEarlyTranscriptButton && (
          <button
            onClick={handleRevealTranscript}
            className="font-typewriter text-xs px-4 py-2 border border-[rgba(201,147,58,0.25)] text-[#8b7355] hover:text-[#c9933a] hover:border-[rgba(201,147,58,0.5)] transition-colors text-left"
          >
            📄 Ver transcripción mientras escuchas
          </button>
        )}
        {showTranscriptEarly && transcript && phase === "answering" && (
          <div className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] px-4 py-3">
            <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">
              Transcripción (español)
            </p>
            <p className="font-typewriter text-xs text-[#c4a882] leading-relaxed">{transcript}</p>
          </div>
        )}

        {/* ── Questions (shown after first play) ────────────────────────── */}
        {phase === "answering" && currentQ && (
          <>
            {totalQ > 1 && (
              <div className="flex items-center gap-3">
                <p className="font-typewriter text-[10px] text-[#8b7355] uppercase tracking-wider shrink-0">
                  Pregunta {qIndex + 1} de {totalQ}
                </p>
                <div className="flex gap-1">
                  {allQ.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-colors w-5 ${
                        i < qIndex
                          ? correctness[i] ? "bg-[#c9933a]" : "bg-[#c0392b]"
                          : i === qIndex ? "bg-[#8b1a1a]"
                          : "bg-[#2a2420]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">
                {totalQ > 1 ? `Pregunta ${qIndex + 1}` : "Pregunta"}
              </p>
              <p className="font-display text-base font-bold text-[#f5e6c8]">{currentQ.question}</p>
            </div>

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
                    className={`w-full text-left px-4 py-3 border font-typewriter text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#c9933a] ${style}`}
                  >
                    <span className="text-[#8b7355] mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

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
                <div className={`border px-4 py-3 ${
                  selected === currentQ.correctIndex
                    ? "border-[rgba(201,147,58,0.4)] bg-[rgba(201,147,58,0.08)]"
                    : "border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)]"
                }`}>
                  <p className={`font-display font-bold ${
                    selected === currentQ.correctIndex ? "text-[#e8b455]" : "text-[#c0392b]"
                  }`}>
                    {selected === currentQ.correctIndex
                      ? "¡Correcto!"
                      : "Incorrecto — la respuesta correcta está marcada."}
                  </p>
                </div>
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

        {/* ── Failure panel ──────────────────────────────────────────────── */}
        {phase === "resultFail" && (
          <div className="space-y-4">
            {/* Score */}
            <div className="border border-[rgba(192,57,43,0.4)] bg-[rgba(192,57,43,0.06)] px-5 py-4 text-center">
              <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-1">
                Resultado
              </p>
              <p className="font-display text-3xl font-bold text-[#c0392b]">
                {correctCount}/{totalQ}
              </p>
              <p className="font-typewriter text-xs text-[#c4a882] mt-1">
                Se necesita {Math.round((passingScore ?? 0.75) * totalQ)}/{totalQ} para obtener la pista.
              </p>
              {retryHint && (
                <p className="font-typewriter text-[10px] text-[#8b7355] mt-2 border-t border-[rgba(192,57,43,0.2)] pt-2">
                  💡 {retryHint}
                </p>
              )}
            </div>

            {/* Show which questions were wrong */}
            <div className="space-y-2">
              {allQ.map((q, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 border font-typewriter text-xs ${
                    correctness[i]
                      ? "border-[rgba(201,147,58,0.2)] bg-[rgba(201,147,58,0.04)] text-[#8b7355]"
                      : "border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={correctness[i] ? "text-[#c9933a]" : "text-[#c0392b]"}>
                      {correctness[i] ? "✓" : "✗"}
                    </span>
                    <div>
                      <p className={correctness[i] ? "text-[#8b7355]" : "text-[#f5e6c8]"}>
                        {q.question}
                      </p>
                      {!correctness[i] && (
                        <p className="text-[#c9933a] mt-1">
                          Correcta: {q.options[q.correctIndex]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Transcript on failure */}
            {transcript && (
              <div className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">
                    Transcripción
                  </p>
                  {translation && (
                    <button
                      onClick={() => setShowTranslation((v) => !v)}
                      className="font-typewriter text-[10px] text-[#c9933a] hover:underline"
                    >
                      {showTranslation ? "Ver español" : "Ver traducción"}
                    </button>
                  )}
                </div>
                <p className="font-typewriter text-xs text-[#c4a882] leading-relaxed">
                  {showTranslation && translation ? translation : transcript}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
              >
                ↺ Intentar de nuevo
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#1a1614] text-[#8b7355] border border-[rgba(201,147,58,0.2)] hover:text-[#c4a882] hover:border-[rgba(201,147,58,0.4)] transition-colors"
              >
                Continuar de todos modos →
              </button>
            </div>
            <p className="font-typewriter text-[10px] text-[#4a3a2a] text-center">
              Continuar sin resolver esta pista — podrás usar las demás pistas para el caso.
            </p>
          </div>
        )}

        {/* ── Pass / completion panel ────────────────────────────────────── */}
        {phase === "resultPass" && (
          <div className="space-y-4">
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
            </div>

            {transcript && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">
                    Transcripción
                  </p>
                  {translation && (
                    <button
                      onClick={() => setShowTranslation((v) => !v)}
                      className="font-typewriter text-[10px] text-[#c9933a] hover:underline"
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

            <p className="font-typewriter text-[10px] text-[#8b7355] text-center animate-pulse mb-3">
              Continuando…
            </p>
            {/* Explicit fallback button — fires immediately if auto-advance is slow */}
            <button
              onClick={() => {
                const snap = resultSnapRef.current;
                if (snap) finishRef.current(snap.correct, snap.total, snap.time, snap.att);
              }}
              className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
            >
              Continuar →
            </button>
          </div>
        )}

      </div>
    </GameShell>
  );
}
