"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { BriefingTerm } from "@/lib/spaced-repetition";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BriefingResult {
  termsAnswered: Array<{ spanish: string; correct: boolean }>;
  skipped: boolean;
  timeSeconds: number;
}

interface Props {
  terms: BriefingTerm[];
  onComplete: (result: BriefingResult) => void;
}

type Phase = "intro" | "questions" | "outro";
type Feedback = "correct" | "wrong" | null;

// ── Chief config ───────────────────────────────────────────────────────────────

const CHIEF_IMG   = "https://i.pravatar.cc/300?img=60";
const CHIEF_NAME  = "El Jefe Ramírez";
const INTRO_TEXT  = "Recluta, antes de tu misión hoy, repasemos lo esencial.";
const OUTRO_PASS  = "Excelente trabajo. Continúa con tu misión, agente.";
const OUTRO_SKIP  = "Entendido. Recuerda repasar más tarde, agente.";
const OUTRO_FAIL  = "Necesitas más práctica con esos términos. Mañana será mejor.";

// ── Typing hook ───────────────────────────────────────────────────────────────

function useTypingText(text: string, speed = 40) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { displayed, done };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DailyBriefing({ terms, onComplete }: Props) {
  const [phase, setPhase]     = useState<Phase>("intro");
  const [qIndex, setQIndex]   = useState(0);
  const [answers, setAnswers] = useState<Array<{ spanish: string; correct: boolean }>>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [canSkip, setCanSkip] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const startMs  = useRef(Date.now());
  const doneRef  = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const correctCount = answers.filter((a) => a.correct).length;

  // Skip button appears after 10 seconds
  useEffect(() => {
    const t = setTimeout(() => setCanSkip(true), 10_000);
    return () => clearTimeout(t);
  }, []);

  const finish = useCallback((isSkipped: boolean, finalAnswers: typeof answers) => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete({
      termsAnswered: finalAnswers,
      skipped: isSkipped,
      timeSeconds: Math.round((Date.now() - startMs.current) / 1000),
    });
  }, [onComplete]);

  function handleSkip() {
    setSkipped(true);
    // Pad answers with "skipped" entries for unanswered questions
    const remaining = terms.slice(answers.length).map((t) => ({ spanish: t.spanish, correct: false }));
    finish(true, [...answers, ...remaining]);
  }

  function handleIntroContinue() {
    setPhase("questions");
  }

  function handleAnswer(optionIndex: number) {
    if (feedback || doneRef.current) return;
    const q = terms[qIndex];
    const correct = optionIndex === q.correctIndex;

    setFeedback(correct ? "correct" : "wrong");
    const newAnswers = [...answers, { spanish: q.spanish, correct }];

    setTimeout(() => {
      setFeedback(null);
      setAnswers(newAnswers);
      if (qIndex + 1 >= terms.length) {
        setPhase("outro");
      } else {
        setQIndex(qIndex + 1);
        // Auto-play audio for next term if available
      }
    }, correct ? 600 : 1400);
  }

  function playAudio(url?: string) {
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => {});
  }

  // Auto-play audio when a new question appears
  useEffect(() => {
    if (phase === "questions" && terms[qIndex]?.audio) {
      const t = setTimeout(() => playAudio(terms[qIndex].audio), 200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex]);

  // ── Common outer wrapper ───────────────────────────────────────────────────
  // Navy/blue theme — visually distinct from the noir case flow

  const outer = (children: React.ReactNode) => (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-4 py-8"
      style={{
        background: "linear-gradient(160deg, #0a1628 0%, #0d1e3a 50%, #091224 100%)",
      }}
    >
      {/* Scan-line overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(74,158,255,0.5) 2px, rgba(74,158,255,0.5) 3px)",
        }}
      />

      {/* Skip button (appears after 10s) */}
      {canSkip && !skipped && phase !== "outro" && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 font-typewriter text-[10px] tracking-[0.2em] uppercase text-[rgba(74,158,255,0.4)] hover:text-[rgba(74,158,255,0.8)] transition-colors"
        >
          Saltar informe →
        </button>
      )}

      {/* Header badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#4a9eff] animate-pulse" />
        <span className="font-typewriter text-[9px] tracking-[0.35em] uppercase text-[rgba(74,158,255,0.5)]">
          Informe Diario
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );

  // ── Phase: Intro ─────────────────────────────────────────────────────────────

  if (phase === "intro") {
    return <IntroPhase
      chiefImg={CHIEF_IMG}
      chiefName={CHIEF_NAME}
      text={INTRO_TEXT}
      termCount={terms.length}
      outer={outer}
      onContinue={handleIntroContinue}
    />;
  }

  // ── Phase: Outro ──────────────────────────────────────────────────────────────

  if (phase === "outro") {
    const passed = correctCount === terms.length;
    const outroText = skipped ? OUTRO_SKIP : passed ? OUTRO_PASS : OUTRO_FAIL;
    return outer(
      <div className="flex flex-col items-center gap-6">
        {/* Chief */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[rgba(74,158,255,0.4)] shadow-[0_0_30px_rgba(74,158,255,0.3)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CHIEF_IMG} alt={CHIEF_NAME} className="w-full h-full object-cover grayscale" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#4a9eff] rounded-full flex items-center justify-center">
            <span className="text-[10px]">{passed && !skipped ? "✓" : skipped ? "→" : "○"}</span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[rgba(74,158,255,0.5)]">{CHIEF_NAME}</p>
          <p className="font-typewriter text-base text-[#c8d8f0] leading-relaxed">&ldquo;{outroText}&rdquo;</p>
        </div>

        {/* Score */}
        {!skipped && (
          <div className="border border-[rgba(74,158,255,0.25)] bg-[rgba(74,158,255,0.06)] px-6 py-4 text-center w-full">
            <p className="font-display font-bold text-3xl text-[#4a9eff]">{correctCount} / {terms.length}</p>
            <p className="font-typewriter text-xs text-[rgba(74,158,255,0.5)] mt-1">
              +{correctCount * 10} puntos
              {correctCount === terms.length ? " · Informe completo" : ""}
            </p>
          </div>
        )}

        {/* Term results */}
        {!skipped && (
          <div className="w-full space-y-1.5">
            {answers.map((a) => {
              const term = terms.find((t) => t.spanish === a.spanish);
              return (
                <div key={a.spanish} className="flex items-center justify-between px-3 py-2 border border-[rgba(74,158,255,0.12)] bg-[rgba(74,158,255,0.03)]">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${a.correct ? "text-[#4a9eff]" : "text-[rgba(74,158,255,0.3)]"}`}>
                      {a.correct ? "✓" : "✗"}
                    </span>
                    <span className="font-typewriter text-sm text-[#c8d8f0]">{a.spanish}</span>
                  </div>
                  <span className="font-typewriter text-xs text-[rgba(74,158,255,0.4)]">
                    {term?.english} · {term ? Math.round(term.accuracy * 100) : 0}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => finish(skipped, answers)}
          className="w-full py-3 font-typewriter text-sm tracking-[0.2em] uppercase border border-[rgba(74,158,255,0.4)] text-[#4a9eff] hover:bg-[rgba(74,158,255,0.1)] hover:border-[#4a9eff] transition-all"
        >
          Continuar misión →
        </button>
      </div>
    );
  }

  // ── Phase: Questions ──────────────────────────────────────────────────────────

  const q = terms[qIndex];

  return outer(
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[rgba(74,158,255,0.4)]">
          Pregunta {qIndex + 1} / {terms.length}
        </span>
        <div className="flex gap-1.5">
          {terms.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
              i < qIndex ? "bg-[#4a9eff]" : i === qIndex ? "bg-[#4a9eff] shadow-[0_0_6px_rgba(74,158,255,0.8)]" : "bg-[rgba(74,158,255,0.15)]"
            }`} />
          ))}
        </div>
      </div>

      {/* Prompt card */}
      <div className={`border-2 px-6 py-8 text-center transition-all ${
        feedback === "correct" ? "border-[#4a9eff] bg-[rgba(74,158,255,0.1)]"
        : feedback === "wrong"  ? "border-[rgba(74,158,255,0.3)] bg-[rgba(74,158,255,0.03)]"
        : "border-[rgba(74,158,255,0.2)] bg-[rgba(74,158,255,0.04)]"
      }`}>
        <p className="font-typewriter text-[9px] tracking-[0.35em] uppercase text-[rgba(74,158,255,0.4)] mb-3">
          ¿Qué significa?
        </p>
        <button
          onClick={() => playAudio(q.audio)}
          className="font-display font-bold text-4xl text-[#c8d8f0] hover:text-[#4a9eff] transition-colors"
        >
          {q.spanish}
        </button>
        {q.audio && (
          <p className="font-typewriter text-[9px] text-[rgba(74,158,255,0.3)] mt-2">▶ Toca para escuchar</p>
        )}
        {feedback === "wrong" && (
          <p className="font-typewriter text-sm text-[#4a9eff] mt-3 font-bold">{q.english}</p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          let style = "border-[rgba(74,158,255,0.15)] text-[#c8d8f0] hover:border-[rgba(74,158,255,0.5)] hover:bg-[rgba(74,158,255,0.05)]";
          if (feedback) {
            if (i === q.correctIndex) style = "border-[#4a9eff] bg-[rgba(74,158,255,0.15)] text-[#4a9eff]";
            else if (feedback === "wrong") style = "border-[rgba(74,158,255,0.06)] text-[rgba(74,158,255,0.25)]";
          }
          return (
            <button key={i} disabled={!!feedback} onClick={() => handleAnswer(i)}
              className={`border px-4 py-3 font-typewriter text-sm text-left transition-all disabled:cursor-default ${style}`}
            >
              <span className="text-[rgba(74,158,255,0.35)] mr-2">{String.fromCharCode(65 + i)})</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Intro sub-component ────────────────────────────────────────────────────────

function IntroPhase({
  chiefImg, chiefName, text, termCount, outer, onContinue,
}: {
  chiefImg: string; chiefName: string; text: string; termCount: number;
  outer: (c: React.ReactNode) => React.ReactNode;
  onContinue: () => void;
}) {
  const { displayed, done } = useTypingText(text, 35);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // Auto-advance 2s after text finishes typing
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setAutoAdvance(true), 2000);
    return () => clearTimeout(t);
  }, [done]);

  return outer(
    <div className="flex flex-col items-center gap-6">
      {/* Chief portrait */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[rgba(74,158,255,0.4)] shadow-[0_0_40px_rgba(74,158,255,0.3)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={chiefImg} alt={chiefName} className="w-full h-full object-cover grayscale" />
        </div>
        {/* Active indicator */}
        <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#0a1628] rounded-full border border-[rgba(74,158,255,0.4)] flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#4a9eff] animate-pulse" />
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="font-typewriter text-[9px] tracking-[0.4em] uppercase text-[rgba(74,158,255,0.4)]">
          {chiefName} · Comunicación cifrada
        </p>
      </div>

      {/* Speech bubble */}
      <div className="w-full border border-[rgba(74,158,255,0.25)] bg-[rgba(74,158,255,0.04)] px-5 py-5 min-h-[80px] relative">
        <div className="absolute -top-2 left-8 w-3 h-3 border-l border-t border-[rgba(74,158,255,0.25)] bg-[#0d1e3a] rotate-45" />
        <p className="font-typewriter text-sm text-[#c8d8f0] leading-relaxed">
          &ldquo;{displayed}
          {!done && <span className="inline-block w-1 h-3.5 bg-[#4a9eff] ml-0.5 animate-pulse" />}
          &rdquo;
        </p>
      </div>

      {/* Terms preview */}
      {done && (
        <p className="font-typewriter text-[10px] text-[rgba(74,158,255,0.4)]">
          {termCount} término{termCount !== 1 ? "s" : ""} para repasar · ~{termCount * 20}s
        </p>
      )}

      {/* Continue button — appears after text finishes */}
      {(done || autoAdvance) && (
        <button
          onClick={onContinue}
          className="w-full py-3 font-typewriter text-sm tracking-[0.2em] uppercase border border-[rgba(74,158,255,0.4)] text-[#4a9eff] hover:bg-[rgba(74,158,255,0.1)] hover:border-[#4a9eff] transition-all"
        >
          Comenzar informe →
        </button>
      )}
    </div>
  );
}
