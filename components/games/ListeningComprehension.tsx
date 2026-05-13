"use client";

import { useState, useRef, useCallback } from "react";
import GameShell from "./GameShell";
import { useGameTimer } from "@/lib/hooks/useGameTimer";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import type { ListeningData, OnComplete } from "@/lib/games/types";

interface Props extends ListeningData {
  title?: string;
  unitId?: string;
  onComplete: OnComplete;
}

export default function ListeningComprehension({
  title = "Comprensión Auditiva",
  audioUrl,
  transcript,
  question,
  options,
  correctIndex,
  maxReplays = 3,
  unitId,
  onComplete,
}: Props) {
  const { elapsed, stop } = useGameTimer();
  const { recordAttempt } = useAttemptTracker("listening", unitId);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [status, setStatus] = useState<"playing" | "complete">("playing");
  const [attempts, setAttempts] = useState(0);

  const isCorrect = submitted && selected === correctIndex;

  const finish = useCallback(
    (score: number, t: number, att: number) => {
      stop();
      setStatus("complete");
      recordAttempt(score, 1, t);
      onComplete({ score, maxScore: 1, timeSpent: t, attempts: att });
    },
    [stop, recordAttempt, onComplete]
  );

  function handlePlay() {
    const audio = audioRef.current;
    if (!audio || playCount >= maxReplays) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setPlayCount((c) => c + 1);
      audio.currentTime = 0;
      audio.play();
      setIsPlaying(true);
    }
  }

  function handleSubmit() {
    if (selected === null) return;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setSubmitted(true);
    if (selected === correctIndex) {
      setTimeout(() => finish(1, elapsed, newAttempts), 800);
    }
  }

  function handleRetry() {
    setSubmitted(false);
    setSelected(null);
  }

  const replaysLeft = maxReplays - playCount;

  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
      onSkip={() => {
        stop();
        setStatus("complete");
        const r = { score: 0, maxScore: 1, timeSpent: elapsed, attempts, isSkipped: true };
        recordAttempt(0, 1, elapsed);
        onComplete(r);
        return r;
      }}
    >
      <div className="p-5 max-w-xl mx-auto flex flex-col gap-5">
        {/* Audio player */}
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
              disabled={playCount >= maxReplays}
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center text-2xl
                border-2 transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-[#c9933a]
                ${playCount >= maxReplays
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
                {isPlaying ? "Escuchando..." : playCount === 0 ? "Presiona para escuchar" : "¿Listo para responder?"}
              </p>
              <p className={`font-typewriter text-[10px] mt-0.5 ${replaysLeft <= 1 ? "text-[#c0392b]" : "text-[#8b7355]"}`}>
                {replaysLeft > 0 ? `${replaysLeft} replay${replaysLeft !== 1 ? "s" : ""} remaining` : "No replays left"}
              </p>
            </div>
          </div>

          {/* Sound wave decoration */}
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

        {/* Question */}
        {playCount > 0 && (
          <>
            <div>
              <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">
                Pregunta
              </p>
              <p className="font-display text-base font-bold text-[#f5e6c8]">{question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {options.map((opt, i) => {
                let style = "border-[rgba(201,147,58,0.2)] bg-[#1a1614] text-[#c4a882] hover:border-[rgba(201,147,58,0.5)]";
                if (submitted) {
                  if (i === correctIndex) style = "border-[#c9933a] bg-[rgba(201,147,58,0.1)] text-[#e8b455]";
                  else if (i === selected) style = "border-[#c0392b] bg-[rgba(192,57,43,0.08)] text-[#c0392b]";
                  else style = "border-[rgba(201,147,58,0.1)] bg-[#1a1614] text-[#4a3a2a] opacity-60";
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

            {/* Submit / feedback */}
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={selected === null}
                className="clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Comprobar respuesta
              </button>
            ) : (
              <div className={`border px-4 py-3 text-center ${isCorrect ? "border-[rgba(201,147,58,0.4)] bg-[rgba(201,147,58,0.08)]" : "border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)]"}`}>
                <p className={`font-display font-bold ${isCorrect ? "text-[#e8b455]" : "text-[#c0392b]"}`}>
                  {isCorrect ? "¡Correcto!" : "Incorrecto — the right answer is highlighted."}
                </p>
                {!isCorrect && (
                  <button onClick={handleRetry} className="mt-2 font-typewriter text-xs text-[#c9933a] hover:underline">
                    Try again →
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Transcript reveal */}
        {transcript && submitted && isCorrect && (
          <div>
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="font-typewriter text-xs text-[#8b7355] hover:text-[#c9933a] transition-colors"
            >
              {showTranscript ? "▲ Hide transcript" : "▼ Show transcript"}
            </button>
            {showTranscript && (
              <div className="mt-2 border border-[rgba(201,147,58,0.15)] bg-[#1a1614] px-4 py-3">
                <p className="font-typewriter text-xs text-[#c4a882] leading-relaxed">{transcript}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
