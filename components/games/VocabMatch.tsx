"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import GameShell from "./GameShell";
import { useGameTimer } from "@/lib/hooks/useGameTimer";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import { shuffle } from "@/lib/games/utils";
import type { VocabPair, OnComplete } from "@/lib/games/types";

interface Card {
  id: string;
  pairId: number;
  type: "spanish" | "english";
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Props {
  title?: string;
  pairs: VocabPair[];
  unitId?: string;
  onComplete: OnComplete;
}

export default function VocabMatch({ title = "Memoria de Vocabulario", pairs, unitId, onComplete }: Props) {
  const { elapsed, stop } = useGameTimer();
  const { recordAttempt, updateMastery } = useAttemptTracker("vocab_match", unitId);

  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState(0);
  const [flipAttempts, setFlipAttempts] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<"playing" | "complete">("playing");
  const [lastFlipped, setLastFlipped] = useState<string[]>([]);
  const checkingRef = useRef(false);

  useEffect(() => {
    const deck: Card[] = [];
    pairs.forEach((pair, i) => {
      deck.push({ id: `es-${i}`, pairId: i, type: "spanish", content: pair.spanish, isFlipped: false, isMatched: false });
      deck.push({ id: `en-${i}`, pairId: i, type: "english", content: pair.english, isFlipped: false, isMatched: false });
    });
    setCards(shuffle(deck));
  }, [pairs]);

  const finish = useCallback(
    (finalMatched: number, finalAttempts: number, elapsed: number) => {
      stop();
      setStatus("complete");
      recordAttempt(finalMatched, pairs.length, elapsed);
      onComplete({ score: finalMatched, maxScore: pairs.length, timeSpent: elapsed, attempts: finalAttempts });
    },
    [stop, recordAttempt, pairs.length, onComplete]
  );

  function handleFlip(cardId: string) {
    if (checkingRef.current || status !== "playing") return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (selected.includes(cardId)) return;

    if (selected.length === 0) {
      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)));
      setSelected([cardId]);
    } else if (selected.length === 1) {
      const firstCard = cards.find((c) => c.id === selected[0])!;
      const newAttempts = flipAttempts + 1;
      setFlipAttempts(newAttempts);
      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)));
      setSelected([]);

      const isMatch = firstCard.pairId === card.pairId && firstCard.type !== card.type;
      if (isMatch) {
        const newMatched = matched + 1;
        setCards((prev) =>
          prev.map((c) => (c.id === cardId || c.id === selected[0] ? { ...c, isMatched: true } : c))
        );
        setMatched(newMatched);
        updateMastery(pairs[card.pairId].spanish, true);
        if (newMatched === pairs.length) finish(newMatched, newAttempts, elapsed);
      } else {
        checkingRef.current = true;
        setIsChecking(true);
        setLastFlipped([selected[0], cardId]);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === cardId || c.id === selected[0] ? { ...c, isFlipped: false } : c
            )
          );
          setLastFlipped([]);
          setIsChecking(false);
          checkingRef.current = false;
        }, 1100);
      }
    }
  }

  const cols = pairs.length <= 4 ? "grid-cols-4" : pairs.length <= 6 ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-4 sm:grid-cols-6";

  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
      onSkip={() => {
        stop();
        setStatus("complete");
        const result = { score: matched, maxScore: pairs.length, timeSpent: elapsed, attempts: flipAttempts, isSkipped: true };
        recordAttempt(matched, pairs.length, elapsed);
        onComplete(result);
        return result;
      }}
    >
      <div className="p-5 flex flex-col gap-5">
        {/* Stats bar */}
        <div className="flex items-center justify-between font-typewriter text-xs text-[#8b7355]">
          <span>Pares encontrados: <span className="text-[#e8b455]">{matched}/{pairs.length}</span></span>
          <span>Intentos: <span className="text-[#c4a882]">{flipAttempts}</span></span>
        </div>

        {/* Instructions */}
        <p className="font-typewriter text-xs text-[#8b7355] text-center">
          Find matching Spanish / English pairs. Click two cards to reveal them.
        </p>

        {/* Card grid */}
        <div className={`grid ${cols} gap-3 justify-center`}>
          {cards.map((card) => {
            const isWrong = lastFlipped.includes(card.id) && !card.isMatched;
            return (
              <button
                key={card.id}
                onClick={() => handleFlip(card.id)}
                disabled={card.isFlipped || card.isMatched || isChecking}
                aria-label={
                  card.isFlipped
                    ? `${card.type === "spanish" ? "Spanish" : "English"}: ${card.content}`
                    : "Face-down card"
                }
                aria-pressed={card.isFlipped}
                className={`
                  relative aspect-[3/4] min-w-[80px] max-w-[110px] w-full rounded-sm
                  flex items-center justify-center text-center p-2
                  transition-all duration-300 select-none
                  focus:outline-none focus:ring-2 focus:ring-[#c9933a] focus:ring-offset-1 focus:ring-offset-[#0d0b0a]
                  ${card.isMatched
                    ? "opacity-60 border border-[#c9933a] shadow-[0_0_10px_rgba(201,147,58,0.25)] cursor-default"
                    : card.isFlipped
                    ? isWrong
                      ? "border border-[#c0392b] shadow-[0_0_8px_rgba(192,57,43,0.4)]"
                      : "border border-[rgba(201,147,58,0.3)]"
                    : "border border-[rgba(201,147,58,0.15)] hover:border-[rgba(201,147,58,0.4)] cursor-pointer hover:shadow-[0_0_8px_rgba(201,147,58,0.2)]"
                  }
                  ${card.isFlipped || card.isMatched
                    ? card.type === "spanish"
                      ? "bg-gradient-to-br from-[#f8e9cc] to-[#efd9a0]"
                      : "bg-[#1e1a16]"
                    : "bg-[#1a1614]"
                  }
                `}
              >
                {card.isFlipped || card.isMatched ? (
                  <div>
                    <p className={`text-[10px] tracking-widest uppercase mb-1 font-typewriter
                      ${card.type === "spanish" ? "text-[#8b5e10]" : "text-[#8b7355]"}`}>
                      {card.type === "spanish" ? "ES" : "EN"}
                    </p>
                    <p className={`font-display font-bold text-sm leading-snug
                      ${card.type === "spanish" ? "text-[#2c1a08]" : "text-[#e8b455]"}`}>
                      {card.content}
                    </p>
                    {card.isMatched && (
                      <span className="absolute top-1 right-1 text-[#c9933a] text-xs">✓</span>
                    )}
                  </div>
                ) : (
                  <span className="text-2xl opacity-30">?</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Complete state */}
        {status === "complete" && (
          <div className="border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] p-5 text-center rounded-sm">
            <p className="font-display text-xl font-bold text-[#e8b455] mb-1">¡Caso resuelto!</p>
            <p className="font-typewriter text-xs text-[#c4a882]">
              {matched}/{pairs.length} pairs · {flipAttempts} attempts · {formatTime(elapsed)}
            </p>
          </div>
        )}
      </div>
    </GameShell>
  );
}

function formatTime(s: number) { const m = Math.floor(s / 60); return `${m}:${(s % 60).toString().padStart(2, "0")}`; }
