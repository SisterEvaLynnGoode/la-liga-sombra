"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import GameShell from "./GameShell";
import { useGameTimer } from "@/lib/hooks/useGameTimer";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import { shuffle } from "@/lib/games/utils";
import type { VocabPair, OnComplete } from "@/lib/games/types";
import { logItemEvent, flushItemEvents } from "@/lib/events";

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

  /**
   * A memory board has to fit on one screen, or it is not a memory game.
   *
   * This used to deal every pair in the unit at once: Caso 10 has 32 vocab
   * items, so the Academy dealt 64 cards in a grid 1,969px tall — three
   * screens on a Chromebook. A student cannot hold a board they cannot see,
   * so they flip blind. School-wide that produced 104,000 flips at 12%
   * "accuracy", and one student spent two days on a single board, 82 attempts
   * for 11 matches, never reaching past the first section of the deck.
   *
   * So the deck is dealt in rounds of at most ROUND_MAX pairs, split evenly so
   * no round is a stub: 32 pairs become four rounds of 8, and 12 pairs become
   * two of 6. The score is still out of every pair in the unit.
   */
  const ROUND_MAX = 8;
  const roundCount = Math.max(1, Math.ceil(pairs.length / ROUND_MAX));
  const perRound = Math.ceil(pairs.length / roundCount);
  const [round, setRound] = useState(0);
  const roundPairs = pairs.slice(round * perRound, (round + 1) * perRound);
  /** Offset into `pairs`, so logging and mastery still name the real item. */
  const roundOffset = round * perRound;

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
    roundPairs.forEach((pair, i) => {
      const id = roundOffset + i;
      deck.push({ id: `es-${id}`, pairId: id, type: "spanish", content: pair.spanish, isFlipped: false, isMatched: false });
      deck.push({ id: `en-${id}`, pairId: id, type: "english", content: pair.english, isFlipped: false, isMatched: false });
    });
    setCards(shuffle(deck));
    setSelected([]);
    setLastFlipped([]);
    setIsChecking(false);
    checkingRef.current = false;
    // roundPairs is derived from these two, and a new array identity each
    // render would re-deal the board mid-game.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs, round]);

  const finish = useCallback(
    (finalMatched: number, finalAttempts: number, elapsed: number) => {
      stop();
      setStatus("complete");
      recordAttempt(finalMatched, pairs.length, elapsed);
      flushItemEvents();
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
        logItemEvent({
          unitId,
          stageType: "academia-reconocimiento",
          skill: "vocab",
          itemKey: pairs[card.pairId].spanish,
          correct: true,
          chosen: card.content,
          expected: pairs[card.pairId].english,
        });
        // A round is done when every pair dealt so far has been matched.
        const dealtThroughThisRound = Math.min(pairs.length, (round + 1) * perRound);
        if (newMatched === dealtThroughThisRound) {
          if (round + 1 >= roundCount) {
            finish(newMatched, newAttempts, elapsed);
          } else {
            // Let the student see the last match land before the next board.
            checkingRef.current = true;
            setIsChecking(true);
            setTimeout(() => {
              setRound((r) => r + 1);
              setIsChecking(false);
              checkingRef.current = false;
            }, 900);
          }
        }
      } else {
        logItemEvent({
          unitId,
          stageType: "academia-reconocimiento",
          skill: "vocab",
          itemKey: pairs[firstCard.pairId].spanish,
          correct: false,
          chosen: card.content,
          expected: firstCard.type === "spanish" ? pairs[firstCard.pairId].english : pairs[firstCard.pairId].spanish,
        });
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

  // Four columns, always. A round is at most 8 pairs, so this is at most four
  // rows — a board a student can see without scrolling, which is the point.
  const cols = "grid-cols-4";

  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
      unitId={unitId}
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
          {roundCount > 1 && (
            <span className="text-[#c9933a]">Tablero {round + 1} de {roundCount}</span>
          )}
          <span>Intentos: <span className="text-[#c4a882]">{flipAttempts}</span></span>
        </div>

        {/* Instructions */}
        <p className="font-typewriter text-xs text-[#8b7355] text-center">
          Encuentra los pares de español e inglés. Haz clic en dos cartas para revelarlas.
        </p>

        {/* Card grid */}
        <div className={`grid ${cols} gap-3 justify-items-center mx-auto w-full max-w-[660px]`}>
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
                  relative aspect-[4/3] min-w-[80px] max-w-[150px] w-full rounded-sm
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
