"use client";

/**
 * MultipleChoiceProduction
 *
 * Used for the Academia "Producción" stage.
 * Shows an English prompt and 4 Spanish choices (1 correct + 3 distractors
 * pulled from the same vocab set). No free-text input — much more accessible.
 */

import { useState, useEffect, useCallback } from "react";
import GameShell from "./GameShell";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import { shuffle, formatTime } from "@/lib/games/utils";
import type { VocabPair, OnComplete } from "@/lib/games/types";

interface Props {
  title?: string;
  vocab: VocabPair[];        // full vocab set — used to build distractors
  direction?: "en-to-es" | "es-to-en";  // default: en-to-es (production)
  timeLimit?: number;
  unitId?: string;
  onComplete: OnComplete;
}

interface MCCard {
  prompt: string;
  correct: string;
  options: string[];         // 4 options (shuffled), includes correct
}

function buildCards(vocab: VocabPair[], direction: "en-to-es" | "es-to-en"): MCCard[] {
  const allAnswers = direction === "en-to-es"
    ? vocab.map((v) => v.spanish)
    : vocab.map((v) => v.english);

  return shuffle(vocab).map((v) => {
    const prompt   = direction === "en-to-es" ? v.english : v.spanish;
    const correct  = direction === "en-to-es" ? v.spanish : v.english;
    const distractors = shuffle(allAnswers.filter((a) => a !== correct)).slice(0, 3);
    const options  = shuffle([correct, ...distractors]);
    return { prompt, correct, options };
  });
}

type AnswerState = "idle" | "correct" | "wrong";

export default function MultipleChoiceProduction({
  title = "Producción — Elige la traducción",
  vocab,
  direction = "en-to-es",
  timeLimit = 60,
  unitId,
  onComplete,
}: Props) {
  const activityType = direction === "en-to-es" ? "academia_production" : "academia_memorization";
  const { recordAttempt, updateMastery } = useAttemptTracker(activityType, unitId);

  const [cards] = useState(() => buildCards(vocab, direction));
  const [index, setIndex]             = useState(0);
  const [selected, setSelected]       = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [score, setScore]             = useState(0);
  const [attempts, setAttempts]       = useState(0);
  const [timeLeft, setTimeLeft]       = useState(timeLimit);
  const [elapsed, setElapsed]         = useState(0);
  const [status, setStatus]           = useState<"playing" | "complete">("playing");
  const completedRef                  = { current: false };

  const finish = useCallback(
    (finalScore: number, finalAttempts: number, finalElapsed: number) => {
      if (completedRef.current) return;
      completedRef.current = true;
      setStatus("complete");
      recordAttempt(finalScore, cards.length, finalElapsed);
      onComplete({ score: finalScore, maxScore: cards.length, timeSpent: finalElapsed, attempts: finalAttempts });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cards.length, recordAttempt, onComplete]
  );

  // Countdown
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          finish(score, attempts, timeLimit);
          return 0;
        }
        return t - 1;
      });
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [status, score, attempts, timeLimit, finish]);

  function handleChoose(option: string) {
    if (status !== "playing" || answerState !== "idle") return;

    const card = cards[index];
    const correct = option === card.correct;
    const newAttempts = attempts + 1;
    setSelected(option);
    setAttempts(newAttempts);
    setAnswerState(correct ? "correct" : "wrong");

    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    updateMastery(card.prompt, correct);

    // Penalise wrong answers
    if (!correct) setTimeLeft((t) => Math.max(0, t - 5));

    setTimeout(() => {
      setSelected(null);
      setAnswerState("idle");
      const nextIndex = index + 1;
      if (nextIndex >= cards.length) {
        finish(newScore, newAttempts, elapsed + 1);
      } else {
        setIndex(nextIndex);
      }
    }, correct ? 700 : 1600);
  }

  const card = cards[index];
  const pct = Math.round((timeLeft / timeLimit) * 100);
  const timerColor =
    timeLeft > 20 ? "bg-[#c9933a]" : timeLeft > 10 ? "bg-[#e8b455]" : "bg-[#c0392b]";

  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
      unitId={unitId}
      onSkip={() => {
        setStatus("complete");
        const r = { score, maxScore: cards.length, timeSpent: elapsed, attempts, isSkipped: true };
        recordAttempt(score, cards.length, elapsed);
        onComplete(r);
        return r;
      }}
    >
      <div className="p-5 max-w-lg mx-auto flex flex-col gap-5">

        {/* Timer bar */}
        <div>
          <div className="flex justify-between font-typewriter text-xs text-[#8b7355] mb-1.5">
            <span>
              Tiempo:{" "}
              <span className={`${timeLeft <= 10 ? "text-[#c0392b]" : "text-[#e8b455]"} tabular-nums`}>
                {formatTime(timeLeft)}
              </span>
            </span>
            <span>Correcto: <span className="text-[#e8b455]">{score}/{cards.length}</span></span>
          </div>
          <div className="h-2 bg-[#2c2220] rounded-full overflow-hidden">
            <div
              className={`h-full ${timerColor} rounded-full transition-all duration-1000`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Prompt card */}
        {status === "playing" && card && (
          <>
            <div className={`
              border-2 bg-gradient-to-br p-8 text-center rounded-sm min-h-[120px]
              flex flex-col items-center justify-center transition-all duration-200
              ${answerState === "correct"
                ? "border-[#c9933a] from-[rgba(201,147,58,0.15)] to-[rgba(201,147,58,0.05)]"
                : answerState === "wrong"
                ? "border-[#c0392b] from-[rgba(192,57,43,0.12)] to-[rgba(192,57,43,0.04)]"
                : "border-[rgba(201,147,58,0.2)] from-[#1e1a16] to-[#1a1614]"
              }
            `}>
              <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-3">
                {index + 1} / {cards.length} — {direction === "en-to-es" ? "¿Cómo se dice en español?" : "¿Qué significa en inglés?"}
              </p>
              <p className="font-display font-bold text-3xl text-[#f5e6c8]">
                {card.prompt}
              </p>
            </div>

            {/* 4 choices */}
            <div className="grid grid-cols-2 gap-3">
              {card.options.map((opt) => {
                const isSelected = selected === opt;
                const isCorrect  = opt === card.correct;

                let style =
                  "border-[rgba(201,147,58,0.25)] bg-[#1a1614] text-[#c4a882] hover:border-[rgba(201,147,58,0.55)] hover:bg-[rgba(201,147,58,0.06)]";

                if (answerState !== "idle") {
                  if (isCorrect)
                    style = "border-[#c9933a] bg-[rgba(201,147,58,0.12)] text-[#e8b455]";
                  else if (isSelected)
                    style = "border-[#c0392b] bg-[rgba(192,57,43,0.1)] text-[#c0392b]";
                  else
                    style = "border-[rgba(201,147,58,0.1)] bg-[#1a1614] text-[#4a3a2a] opacity-50";
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleChoose(opt)}
                    disabled={answerState !== "idle"}
                    className={`
                      px-4 py-4 border font-typewriter text-sm text-center
                      transition-all duration-150 focus:outline-none
                      focus:ring-2 focus:ring-[#c9933a]
                      disabled:cursor-default
                      ${style}
                    `}
                  >
                    {opt}
                    {answerState !== "idle" && isCorrect && (
                      <span className="block text-[10px] text-[#c9933a] mt-1">✓</span>
                    )}
                    {answerState !== "idle" && isSelected && !isCorrect && (
                      <span className="block text-[10px] text-[#c0392b] mt-1">−5 seg</span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="font-typewriter text-[10px] text-[#8b7355] text-center">
              Elige la traducción correcta · Un error = −5 segundos
            </p>
          </>
        )}

        {/* Complete */}
        {status === "complete" && (
          <div className="border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] p-6 text-center space-y-4">
            <div>
              <p className="font-display text-2xl font-bold text-[#e8b455] mb-2">¡Tiempo!</p>
              <p className="font-typewriter text-sm text-[#c4a882]">
                {score} / {cards.length} correctas
              </p>
              <p className="font-typewriter text-xs text-[#8b7355] mt-1">
                {attempts} respuestas · {formatTime(elapsed)} transcurridos
              </p>
            </div>
            <button
              onClick={() =>
                onComplete({ score, maxScore: cards.length, timeSpent: elapsed, attempts })
              }
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
