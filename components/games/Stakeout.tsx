"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { StakeoutQuestion } from "@/lib/question-generator";
import { normalizeAnswer } from "@/lib/games/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StakeoutResult {
  passed: boolean;
  timeRemaining: number; // seconds left when last question answered (0 if timed out)
  correctCount: number;
  totalCount: number;
}

interface Props {
  questions: StakeoutQuestion[];
  unitNumber: number;
  /** Starting countdown seconds. Default 90; Cold Case uses 70. */
  startTime?: number;
  /** Seconds deducted per wrong answer. Default 10; Cold Case uses 15. */
  wrongCost?: number;
  onComplete: (result: StakeoutResult) => void;
}

type Phase = "briefing" | "challenge" | "result";
type Feedback = "correct" | "wrong" | null;

const CORRECT_GAIN = 5;

// ── Helpers ────────────────────────────────────────────────────────────────────

function TimerBar({ timeLeft, maxTime }: { timeLeft: number; maxTime: number }) {
  const pct = Math.round((timeLeft / maxTime) * 100);
  const color =
    timeLeft > 45 ? "bg-[#c9933a]" : timeLeft > 20 ? "bg-[#e8b455]" : "bg-[#c0392b]";
  return (
    <div className="h-2.5 bg-[#2c2220] rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-1000 ease-linear`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Sub-renderers ─────────────────────────────────────────────────────────────

function VocabQuestion({
  q,
  onAnswer,
  feedback,
}: {
  q: Extract<StakeoutQuestion, { type: "vocab" }>;
  onAnswer: (correct: boolean) => void;
  feedback: Feedback;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] px-6 py-8 text-center">
        <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-3">
          {q.promptLang === "es" ? "Español → Inglés" : "Inglés → Español"}
        </p>
        <p className="font-display font-bold text-3xl text-[#f5e6c8]">{q.prompt}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          let style = "border-[rgba(201,147,58,0.15)] text-[#c4a882] hover:border-[rgba(201,147,58,0.5)] hover:text-[#f5e6c8]";
          if (feedback) {
            if (i === q.correctIndex) style = "border-[#c9933a] bg-[rgba(201,147,58,0.12)] text-[#e8b455]";
            else style = "border-[rgba(201,147,58,0.08)] text-[#4a3a2a]";
          }
          return (
            <button
              key={i}
              disabled={!!feedback}
              onClick={() => onAnswer(i === q.correctIndex)}
              className={`border px-4 py-3 font-typewriter text-sm text-left transition-colors ${style} disabled:cursor-default`}
            >
              <span className="text-[#8b7355] mr-2">{String.fromCharCode(65 + i)})</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SentenceQuestion({
  q,
  onAnswer,
  feedback,
}: {
  q: Extract<StakeoutQuestion, { type: "sentence" }>;
  onAnswer: (correct: boolean) => void;
  feedback: Feedback;
}) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>(q.words);
  const submitted = useRef(false);

  function tapWord(word: string, from: "remaining" | "placed") {
    if (feedback || submitted.current) return;
    if (from === "remaining") {
      const idx = remaining.indexOf(word);
      if (idx === -1) return;
      const newRemaining = [...remaining];
      newRemaining.splice(idx, 1);
      const newPlaced = [...placed, word];
      setRemaining(newRemaining);
      setPlaced(newPlaced);
      // Auto-submit when all words placed
      if (newRemaining.length === 0) {
        submitted.current = true;
        const attempt = newPlaced.join(" ");
        const correct = normalizeAnswer(attempt) === normalizeAnswer(q.correctSentence.replace(/[.!?¿¡]/g, ""));
        onAnswer(correct);
      }
    } else {
      const idx = placed.indexOf(word);
      if (idx === -1) return;
      const newPlaced = [...placed];
      newPlaced.splice(idx, 1);
      setPlaced(newPlaced);
      setRemaining((r) => [...r, word]);
    }
  }

  const built = placed.join(" ");

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] px-5 py-4 min-h-[72px] flex flex-wrap gap-2 items-center">
        {placed.length === 0 && (
          <p className="font-typewriter text-xs text-[#4a3a2a] italic">Toca las palabras en orden →</p>
        )}
        {placed.map((w, i) => (
          <button
            key={i}
            onClick={() => tapWord(w, "placed")}
            disabled={!!feedback}
            className={`px-3 py-1.5 font-typewriter text-sm border transition-colors disabled:cursor-default
              ${feedback === "correct" ? "border-[#c9933a] text-[#e8b455] bg-[rgba(201,147,58,0.1)]"
                : feedback === "wrong" ? "border-[#c0392b] text-[#e8b455]"
                : "border-[rgba(201,147,58,0.4)] text-[#f5e6c8] hover:border-[#c9933a]"}`}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {remaining.map((w, i) => (
          <button
            key={i}
            onClick={() => tapWord(w, "remaining")}
            disabled={!!feedback}
            className="px-3 py-1.5 font-typewriter text-sm border border-[rgba(201,147,58,0.2)] text-[#c4a882] hover:border-[rgba(201,147,58,0.5)] hover:text-[#f5e6c8] transition-colors disabled:opacity-40"
          >
            {w}
          </button>
        ))}
      </div>

      {feedback === "wrong" && (
        <p className="font-typewriter text-xs text-[#8b7355]">
          Correcto: <span className="text-[#e8b455]">{q.correctSentence}</span>
        </p>
      )}
      {feedback === null && built && (
        <p className="font-typewriter text-[10px] text-[#4a3a2a]">Construyendo: {built}…</p>
      )}
    </div>
  );
}

function ListeningQuestion({
  q,
  onAnswer,
  feedback,
}: {
  q: Extract<StakeoutQuestion, { type: "listening" }>;
  onAnswer: (correct: boolean) => void;
  feedback: Feedback;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [played, setPlayed] = useState(false);

  function playClip() {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setPlayed(true);
    }
  }

  useEffect(() => {
    // Auto-play once on mount
    const t = setTimeout(() => playClip(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={q.audioUrl} preload="auto" />

      <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] px-6 py-6 text-center">
        <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-3">
          Escucha · ¿Qué significa?
        </p>
        <button
          onClick={playClip}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-[rgba(201,147,58,0.3)] text-[#c9933a] hover:border-[#c9933a] transition-colors font-typewriter text-sm"
        >
          <span className="text-lg">▶</span>
          {played ? "Repetir" : "Escuchar"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          let style = "border-[rgba(201,147,58,0.15)] text-[#c4a882] hover:border-[rgba(201,147,58,0.5)]";
          if (feedback) {
            if (i === q.correctIndex) style = "border-[#c9933a] bg-[rgba(201,147,58,0.12)] text-[#e8b455]";
            else style = "border-[rgba(201,147,58,0.08)] text-[#4a3a2a]";
          }
          return (
            <button
              key={i}
              disabled={!!feedback}
              onClick={() => onAnswer(i === q.correctIndex)}
              className={`border px-4 py-3 font-typewriter text-sm text-left transition-colors ${style} disabled:cursor-default`}
            >
              <span className="text-[#8b7355] mr-2">{String.fromCharCode(65 + i)})</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Stakeout({ questions, unitNumber, startTime: startTimeProp, wrongCost: wrongCostProp, onComplete }: Props) {
  const START_TIME = startTimeProp ?? 90;
  const WRONG_COST = wrongCostProp ?? 10;

  const [phase, setPhase]           = useState<Phase>("briefing");
  const [qIndex, setQIndex]         = useState(0);
  const [timeLeft, setTimeLeft]     = useState(START_TIME);
  const [correct, setCorrect]       = useState(0);
  const [feedback, setFeedback]     = useState<Feedback>(null);
  const [timedOut, setTimedOut]     = useState(false);

  const completedRef = useRef(false);
  const feedbackRef  = useRef(false); // block timer completion during feedback pause

  // ── Timer ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== "challenge") return;
    const id = setInterval(() => {
      if (feedbackRef.current) return; // pause timer during feedback
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          if (!completedRef.current) {
            completedRef.current = true;
            setTimedOut(true);
            setPhase("result");
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // ── Answer handler ──────────────────────────────────────────────────────────

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (feedbackRef.current || completedRef.current) return;
      feedbackRef.current = true;
      setFeedback(isCorrect ? "correct" : "wrong");

      if (isCorrect) {
        setCorrect((c) => c + 1);
        setTimeLeft((t) => Math.min(t + CORRECT_GAIN, START_TIME + 30));
      } else {
        setTimeLeft((t) => Math.max(0, t - WRONG_COST));
      }

      const delay = isCorrect ? 500 : 1200;
      setTimeout(() => {
        setFeedback(null);
        feedbackRef.current = false;
        const nextIndex = qIndex + 1;
        if (nextIndex >= questions.length) {
          if (!completedRef.current) {
            completedRef.current = true;
            setPhase("result");
          }
        } else {
          setQIndex(nextIndex);
        }
      }, delay);
    },
    [qIndex, questions.length]
  );

  // ── Render: Briefing ─────────────────────────────────────────────────────────

  if (phase === "briefing") {
    return (
      <div className="min-h-screen bg-[#0d0b0a] flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {/* Alert header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#8b1a1a] border border-[#c0392b] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(192,57,43,0.5)]">
              <span className="text-xl">🚨</span>
            </div>
            <div>
              <p className="font-typewriter text-[9px] tracking-[0.4em] uppercase text-[#c0392b]">
                Alerta de Operación · Unidad {unitNumber}
              </p>
              <h2 className="font-display font-black text-2xl text-[#f5e6c8]">Vigilancia</h2>
            </div>
          </div>

          {/* Narrative */}
          <div className="border border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.04)] p-5 mb-6">
            <p className="font-typewriter text-sm text-[#c4a882] leading-relaxed mb-3">
              Recluta, el sospechoso está a punto de huir. Tienes que demostrar tu dominio del
              español antes de que escape.
            </p>
            <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed">
              Responde las preguntas lo más rápido posible. Cada respuesta correcta te da más
              tiempo. Cada error te cuesta tiempo.
            </p>
          </div>

          {/* Rules */}
          <div className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] p-4 mb-6 space-y-2">
            {[
              { icon: "⏱", text: `Tiempo inicial: ${START_TIME} segundos${START_TIME < 90 ? " ⚠️" : ""}` },
              { icon: "✅", text: `Respuesta correcta: +${CORRECT_GAIN} segundos` },
              { icon: "❌", text: `Respuesta incorrecta: −${WRONG_COST} segundos${WRONG_COST > 10 ? " ⚠️" : ""}` },
              { icon: "📋", text: `${questions.length} preguntas en total` },
            ].map((r) => (
              <div key={r.text} className="flex items-center gap-3">
                <span className="text-base w-6 text-center">{r.icon}</span>
                <span className="font-typewriter text-xs text-[#c4a882]">{r.text}</span>
              </div>
            ))}
          </div>

          {/* Reward */}
          <div className="border border-[rgba(201,147,58,0.1)] bg-[rgba(201,147,58,0.03)] px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-base shrink-0">🎯</span>
            <p className="font-typewriter text-[10px] text-[#8b7355] leading-relaxed">
              Completa todas las preguntas a tiempo para ganar una{" "}
              <span className="text-[#e8b455]">pista adicional</span>,{" "}
              100 puntos y la insignia <span className="text-[#e8b455]">Vigilancia Exitosa</span>.
            </p>
          </div>

          <button
            onClick={() => setPhase("challenge")}
            className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            🚨 Comenzar vigilancia →
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Result ────────────────────────────────────────────────────────────

  if (phase === "result") {
    const passed = !timedOut;
    const pct    = Math.round((correct / questions.length) * 100);

    return (
      <div className="min-h-screen bg-[#0d0b0a] flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="flex flex-col items-center mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg mb-4 ${
              passed
                ? "bg-gradient-to-br from-[#c9933a] to-[#8b5e10] shadow-[0_0_40px_rgba(201,147,58,0.4)]"
                : "bg-gradient-to-br from-[#8b1a1a] to-[#5a0f0f] shadow-[0_0_40px_rgba(139,26,26,0.4)]"
            }`}>
              <span className="text-4xl">{passed ? "🎯" : "⏰"}</span>
            </div>
            <h2 className={`font-display font-black text-3xl ${passed ? "text-[#e8b455]" : "text-[#c0392b]"}`}>
              {passed ? "¡Vigilancia Exitosa!" : "Tiempo Agotado"}
            </h2>
          </div>

          <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="font-typewriter text-xs text-[#8b7355]">Preguntas correctas</span>
              <span className="font-typewriter text-sm text-[#e8b455]">{correct}/{questions.length} ({pct}%)</span>
            </div>
            {passed && (
              <div className="flex justify-between">
                <span className="font-typewriter text-xs text-[#8b7355]">Tiempo restante</span>
                <span className="font-typewriter text-sm text-[#c9933a]">{timeLeft}s</span>
              </div>
            )}
            <div className="pt-2 border-t border-[rgba(201,147,58,0.1)]">
              {passed ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎯</span>
                    <span className="font-typewriter text-xs text-[#c4a882]">Pista adicional desbloqueada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">⭐</span>
                    <span className="font-typewriter text-xs text-[#c4a882]">+100 puntos · Insignia Vigilancia Exitosa</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm">⚠️</span>
                  <span className="font-typewriter text-xs text-[#8b7355]">
                    Perdiste la pista más reciente — el caso sigue abierto.
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onComplete({ passed, timeRemaining: timeLeft, correctCount: correct, totalCount: questions.length })}
            className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            Continuar a identificación →
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Challenge ─────────────────────────────────────────────────────────

  const q = questions[qIndex];
  const TYPE_LABEL: Record<StakeoutQuestion["type"], string> = {
    vocab:     "Vocabulario",
    sentence:  "Construye la frase",
    listening: "Escucha",
  };

  return (
    <div className="min-h-screen bg-[#0d0b0a] flex flex-col">
      {/* Header strip */}
      <div className="shrink-0 border-b border-[rgba(201,147,58,0.2)] bg-[#111218] px-5 py-3">
        <div className="max-w-lg mx-auto space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🚨</span>
              <span className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">
                Vigilancia · {qIndex + 1}/{questions.length}
              </span>
            </div>
            <span className={`font-typewriter text-lg font-bold tabular-nums ${
              timeLeft > 45 ? "text-[#c9933a]" : timeLeft > 20 ? "text-[#e8b455]" : "text-[#c0392b]"
            }`}>
              {timeLeft}s
            </span>
          </div>
          <TimerBar timeLeft={timeLeft} maxTime={START_TIME + 30} />
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 overflow-auto flex flex-col justify-center">
        <div className="max-w-lg mx-auto w-full px-5 py-6 space-y-4">
          {/* Question type badge */}
          <div className="flex items-center gap-2">
            <span className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">
              {TYPE_LABEL[q.type]}
            </span>
            {feedback === "correct" && (
              <span className="font-typewriter text-xs text-[#c9933a] font-bold">+{CORRECT_GAIN}s ✓</span>
            )}
            {feedback === "wrong" && (
              <span className="font-typewriter text-xs text-[#c0392b] font-bold">−{WRONG_COST}s ✗</span>
            )}
          </div>

          {/* Question renderer */}
          {q.type === "vocab" && (
            <VocabQuestion key={qIndex} q={q} onAnswer={handleAnswer} feedback={feedback} />
          )}
          {q.type === "sentence" && (
            <SentenceQuestion key={qIndex} q={q} onAnswer={handleAnswer} feedback={feedback} />
          )}
          {q.type === "listening" && (
            <ListeningQuestion key={qIndex} q={q} onAnswer={handleAnswer} feedback={feedback} />
          )}

          {/* Progress dots */}
          <div className="flex gap-1 pt-2 justify-center">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i < qIndex ? "bg-[#c9933a]"
                  : i === qIndex ? "bg-[#e8b455]"
                  : "bg-[#2c2220]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
