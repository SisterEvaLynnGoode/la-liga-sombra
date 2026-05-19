"use client";

import { useState, useRef } from "react";
import type { DefinicionesQuestion } from "@/lib/personalized-drills";

interface Props {
  questions: DefinicionesQuestion[];
  onComplete: (score: number, total: number, timeSeconds: number, unitsUsed: number[]) => void;
}

type Feedback = "correct" | "wrong" | null;

export default function Definiciones({ questions, onComplete }: Props) {
  const [index, setIndex]       = useState(0);
  const [score, setScore]       = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [done, setDone]         = useState(false);
  const startRef = useRef(Date.now());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const q = questions[index];

  function handleAnswer(i: number) {
    if (feedback || done) return;
    const correct = i === q.correctIndex;
    setFeedback(correct ? "correct" : "wrong");

    setTimeout(() => {
      const newScore = correct ? score + 1 : score;
      if (correct) setScore(newScore);
      setFeedback(null);

      const next = index + 1;
      if (next >= questions.length) {
        setDone(true);
        const elapsed = Math.round((Date.now() - startRef.current) / 1000);
        const units = Array.from(new Set(questions.map((q) => q.unitNumber)));
        onComplete(newScore, questions.length, elapsed, units);
      } else {
        setIndex(next);
      }
    }, correct ? 500 : 1200);
  }

  function playAudio() {
    if (q.audio && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }

  if (done) return null; // parent handles done state

  const pct = Math.round((index / questions.length) * 100);

  return (
    <div className="max-w-md mx-auto p-5 space-y-5">
      {/* Progress */}
      <div>
        <div className="flex justify-between font-typewriter text-[10px] text-[#8b7355] mb-1.5">
          <span>{index + 1} / {questions.length}</span>
          <span>✓ {score} correctas</span>
        </div>
        <div className="h-1.5 bg-[#2c2220] rounded-full overflow-hidden">
          <div className="h-full bg-[#c9933a] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Audio */}
      {q.audio && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio ref={audioRef} src={q.audio} preload="auto" />
      )}

      {/* Prompt */}
      <div
        className={`border-2 p-8 text-center transition-all ${
          feedback === "correct" ? "border-[#c9933a] bg-[rgba(201,147,58,0.1)]"
          : feedback === "wrong"  ? "border-[#c0392b] bg-[rgba(192,57,43,0.08)]"
          : "border-[rgba(201,147,58,0.2)] bg-[#1a1614]"
        }`}
      >
        <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-3">
          ¿Qué significa?
        </p>
        <button
          onClick={playAudio}
          className="font-display font-bold text-4xl text-[#f5e6c8] hover:text-[#e8b455] transition-colors"
        >
          {q.spanish}
        </button>
        {q.audio && (
          <p className="font-typewriter text-[9px] text-[#4a3a2a] mt-2">Toca para escuchar ▶</p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          let style = "border-[rgba(201,147,58,0.15)] text-[#c4a882] hover:border-[rgba(201,147,58,0.5)] hover:bg-[rgba(201,147,58,0.04)]";
          if (feedback) {
            if (i === q.correctIndex) style = "border-[#c9933a] bg-[rgba(201,147,58,0.15)] text-[#e8b455]";
            else if (feedback === "wrong") style = "border-[rgba(201,147,58,0.08)] text-[#4a3a2a]";
          }
          return (
            <button
              key={i}
              disabled={!!feedback}
              onClick={() => handleAnswer(i)}
              className={`border px-4 py-3 font-typewriter text-sm text-left transition-all disabled:cursor-default ${style}`}
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
