"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import GameShell from "./GameShell";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import { shuffle, flexibleMatch, formatTime } from "@/lib/games/utils";
import type { FlashcardItem, OnComplete } from "@/lib/games/types";

interface Props {
  title?: string;
  cards: FlashcardItem[];
  timeLimit?: number;
  unitId?: string;
  onComplete: OnComplete;
}

type CardStatus = "idle" | "correct" | "wrong";

export default function TimedFlashcards({
  title = "Fichas Rápidas",
  cards,
  timeLimit = 60,
  unitId,
  onComplete,
}: Props) {
  const { recordAttempt, updateMastery } = useAttemptTracker("vocab_match", unitId);

  const [deck] = useState(() => shuffle(cards));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [cardStatus, setCardStatus] = useState<CardStatus>("idle");
  const [status, setStatus] = useState<"playing" | "complete">("playing");
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const completedRef = useRef(false);

  const finish = useCallback(
    (finalScore: number, finalAttempts: number, finalElapsed: number) => {
      if (completedRef.current) return;
      completedRef.current = true;
      setStatus("complete");
      recordAttempt(finalScore, deck.length, finalElapsed);
      onComplete({ score: finalScore, maxScore: deck.length, timeSpent: finalElapsed, attempts: finalAttempts });
    },
    [deck.length, recordAttempt, onComplete]
  );

  // Countdown timer
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

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (status !== "playing" || cardStatus !== "idle" || index >= deck.length) return;

    const card = deck[index];
    const correct = flexibleMatch(input, card.answer);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setCardStatus(correct ? "correct" : "wrong");

    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    updateMastery(card.prompt, correct);

    if (!correct) {
      setTimeLeft((t) => Math.max(0, t - 5));
    }

    setTimeout(() => {
      setInput("");
      setCardStatus("idle");
      const nextIndex = index + 1;
      if (nextIndex >= deck.length) {
        finish(newScore, newAttempts, elapsed + 1);
      } else {
        setIndex(nextIndex);
        inputRef.current?.focus();
      }
    }, correct ? 600 : 1400);
  }

  const pct = Math.round((timeLeft / timeLimit) * 100);
  const card = deck[index];
  const timerColor = timeLeft > 20 ? "bg-[#c9933a]" : timeLeft > 10 ? "bg-[#e8b455]" : "bg-[#c0392b]";

  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
      unitId={unitId}
      onSkip={() => {
        setStatus("complete");
        const r = { score, maxScore: deck.length, timeSpent: elapsed, attempts, isSkipped: true };
        recordAttempt(score, deck.length, elapsed);
        onComplete(r);
        return r;
      }}
    >
      <div className="p-5 max-w-lg mx-auto flex flex-col gap-5">
        {/* Timer bar */}
        <div>
          <div className="flex justify-between font-typewriter text-xs text-[#8b7355] mb-1.5">
            <span>Tiempo: <span className={`${timeLeft <= 10 ? "text-[#c0392b]" : "text-[#e8b455]"} tabular-nums`}>{formatTime(timeLeft)}</span></span>
            <span>Correcto: <span className="text-[#e8b455]">{score}/{deck.length}</span></span>
          </div>
          <div className="h-2 bg-[#2c2220] rounded-full overflow-hidden">
            <div
              className={`h-full ${timerColor} rounded-full transition-all duration-1000`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        {status === "playing" && card && (
          <>
            <div className={`
              border-2 bg-gradient-to-br p-8 text-center rounded-sm min-h-[140px] flex flex-col items-center justify-center transition-all duration-200
              ${cardStatus === "correct"
                ? "border-[#c9933a] from-[rgba(201,147,58,0.15)] to-[rgba(201,147,58,0.05)]"
                : cardStatus === "wrong"
                ? "border-[#c0392b] from-[rgba(192,57,43,0.12)] to-[rgba(192,57,43,0.04)]"
                : "border-[rgba(201,147,58,0.2)] from-[#1e1a16] to-[#1a1614]"
              }
            `}>
              <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-3">
                {index + 1} / {deck.length}
              </p>
              <p className="font-display font-bold text-3xl text-[#f5e6c8]">{card.prompt}</p>
              {card.hint && cardStatus === "idle" && (
                <p className="font-typewriter text-xs text-[#8b7355] mt-2 italic">{card.hint}</p>
              )}
              {cardStatus === "correct" && (
                <p className="font-typewriter text-sm text-[#c9933a] mt-2">✓ {card.answer}</p>
              )}
              {cardStatus === "wrong" && (
                <div className="mt-2">
                  <p className="font-typewriter text-xs text-[#c0392b]">✗ Respuesta correcta:</p>
                  <p className="font-display font-bold text-base text-[#e8b455]">{card.answer}</p>
                  <p className="font-typewriter text-[10px] text-[#c0392b] mt-1">−5 segundos</p>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type the translation..."
                disabled={cardStatus !== "idle"}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-4 py-3 font-typewriter text-base text-[#f5e6c8] placeholder-[#3a3028] transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || cardStatus !== "idle"}
                className="clip-skew px-5 py-3 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40"
              >
                →
              </button>
            </form>
            <p className="font-typewriter text-[10px] text-[#8b7355] text-center">
              Press Enter to submit · Accents optional · Wrong answer costs 5 seconds
            </p>
          </>
        )}

        {/* Complete */}
        {status === "complete" && (
          <div className="border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] p-6 text-center">
            <p className="font-display text-2xl font-bold text-[#e8b455] mb-2">¡Tiempo!</p>
            <p className="font-typewriter text-sm text-[#c4a882]">
              {score} / {deck.length} cards correct
            </p>
            <p className="font-typewriter text-xs text-[#8b7355] mt-1">
              {attempts} attempts · {formatTime(elapsed)} elapsed
            </p>
          </div>
        )}
      </div>
    </GameShell>
  );
}
