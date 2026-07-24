"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import GameShell from "./GameShell";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import { shuffle } from "@/lib/games/utils";
import { logItemEvent, flushItemEvents } from "@/lib/events";
import type { SwipeSortItem } from "@/lib/types/unit-content";
import type { OnComplete } from "@/lib/games/types";

interface Props {
  title?: string;
  prompt?: string;
  leftLabel: string;
  leftHint?: string;
  rightLabel: string;
  rightHint?: string;
  items: SwipeSortItem[];
  unitId?: string;
  onComplete: OnComplete;
}

type Feedback = { correct: boolean; explanation?: string } | null;

// Horizontal drag (px) needed to commit a swipe. Below this, the card snaps back.
const COMMIT_PX = 90;

export default function SwipeSort({
  title = "Clasifica las Pistas",
  prompt,
  leftLabel,
  leftHint,
  rightLabel,
  rightHint,
  items,
  unitId,
  onComplete,
}: Props) {
  const { recordAttempt, updateMastery } = useAttemptTracker("grammar", unitId);

  const [deck] = useState(() => shuffle(items));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "complete">("playing");
  const [elapsed, setElapsed] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [locked, setLocked] = useState(false); // true while feedback shows / animating out

  // Drag state (pointer). `dx` state drives the live transform for rendering, but
  // `dxRef` is the source of truth for the commit decision: on a fast flick the
  // pointerup handler runs in the same React batch as the last pointermove, so the
  // `dx` captured in that closure is still stale (0) and the swipe would silently
  // snap back instead of registering.
  const [dx, setDx] = useState(0);
  const dxRef = useRef(0);
  const [flyOut, setFlyOut] = useState<"left" | "right" | null>(null);
  const dragStartX = useRef<number | null>(null);
  const shownAtRef = useRef(Date.now());
  const completedRef = useRef(false);

  // Timer
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => { shownAtRef.current = Date.now(); }, [index]);

  const finish = useCallback(
    (finalScore: number, finalElapsed: number) => {
      if (completedRef.current) return;
      completedRef.current = true;
      setStatus("complete");
      recordAttempt(finalScore, deck.length, finalElapsed);
      flushItemEvents();
      onComplete({ score: finalScore, maxScore: deck.length, timeSpent: finalElapsed, attempts: deck.length });
    },
    [deck.length, recordAttempt, onComplete]
  );

  const answer = useCallback(
    (choice: "left" | "right") => {
      if (locked || status !== "playing") return;
      const card = deck[index];
      const correct = card.category === choice;
      setLocked(true);
      setFlyOut(choice);
      setFeedback({ correct, explanation: card.explanation });

      const newScore = correct ? score + 1 : score;
      if (correct) setScore(newScore);
      updateMastery(card.text, correct);
      logItemEvent({
        unitId,
        stageType: "swipeSort",
        skill: "grammar",
        itemKey: card.text,
        correct,
        chosen: choice === "left" ? leftLabel : rightLabel,
        expected: card.category === "left" ? leftLabel : rightLabel,
        latencyMs: Date.now() - shownAtRef.current,
      });

      // Hold the feedback long enough to read, then advance.
      window.setTimeout(() => {
        const next = index + 1;
        setDx(0);
        dxRef.current = 0;
        setFlyOut(null);
        setFeedback(null);
        setLocked(false);
        if (next >= deck.length) finish(newScore, elapsed);
        else setIndex(next);
      }, correct ? 850 : 1700);
    },
    [locked, status, deck, index, score, elapsed, unitId, leftLabel, rightLabel, updateMastery, finish]
  );

  // ── Pointer drag ────────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (locked) return;
    dragStartX.current = e.clientX;
    dxRef.current = 0;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // Safari/older browsers can reject capture for a stale pointerId — dragging
      // still works without it, so this is non-fatal.
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null || locked) return;
    const d = e.clientX - dragStartX.current;
    dxRef.current = d;
    setDx(d);
  };
  const onPointerUp = () => {
    if (dragStartX.current === null || locked) { dragStartX.current = null; return; }
    const d = dxRef.current;
    dragStartX.current = null;
    dxRef.current = 0;
    if (d <= -COMMIT_PX) answer("left");
    else if (d >= COMMIT_PX) answer("right");
    else setDx(0); // snap back
  };

  // ── Keyboard (Chromebook / no touch) ─────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (status !== "playing" || locked) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); answer("left"); }
      else if (e.key === "ArrowRight") { e.preventDefault(); answer("right"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, locked, answer]);

  const card = deck[index];

  // Card transform: follow the finger, or fly off-screen when committed.
  const translateX = flyOut === "left" ? -600 : flyOut === "right" ? 600 : dx;
  const rotate = translateX / 22;
  // Which side is "armed" (past halfway to commit) — used to highlight the target zone.
  const arming = dx <= -COMMIT_PX / 2 ? "left" : dx >= COMMIT_PX / 2 ? "right" : null;

  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
      unitId={unitId}
      onSkip={() => {
        setStatus("complete");
        const r = { score, maxScore: deck.length, timeSpent: elapsed, attempts: index, isSkipped: true };
        recordAttempt(score, deck.length, elapsed);
        flushItemEvents();
        onComplete(r);
        return r;
      }}
    >
      <div className="p-5 max-w-lg mx-auto flex flex-col gap-4 select-none">
        {/* Progress */}
        <div>
          <div className="flex justify-between font-typewriter text-xs text-[#8b7355] mb-1.5">
            <span>Pista <span className="text-[#e8b455] tabular-nums">{Math.min(index + 1, deck.length)}</span> / {deck.length}</span>
            <span>Correcto: <span className="text-[#e8b455] tabular-nums">{score}</span></span>
          </div>
          <div className="h-2 bg-[#2c2220] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c9933a] rounded-full transition-all duration-300"
              style={{ width: `${(index / deck.length) * 100}%` }}
            />
          </div>
        </div>

        {prompt && (
          <p className="text-center font-display font-bold text-lg text-[#e8b455]">{prompt}</p>
        )}

        {status === "playing" && card && (
          <>
            {/* Category zones + the draggable card between them */}
            <div className="flex items-stretch gap-2">
              {/* LEFT zone */}
              <SortZone
                label={leftLabel}
                hint={leftHint}
                arrow="◀"
                armed={arming === "left"}
                onClick={() => answer("left")}
                disabled={locked}
              />

              {/* Card */}
              <div className="flex-1 flex items-center justify-center min-w-0">
                <div
                  role="group"
                  aria-label="Card — swipe left or right, or use the arrow keys"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  className={`
                    w-full cursor-grab active:cursor-grabbing touch-none
                    border-2 rounded-sm p-6 min-h-[168px] flex flex-col items-center justify-center text-center
                    ${feedback
                      ? feedback.correct
                        ? "border-[#c9933a] bg-[rgba(201,147,58,0.12)]"
                        : "border-[#c0392b] bg-[rgba(192,57,43,0.12)]"
                      : "border-[rgba(201,147,58,0.28)] bg-gradient-to-br from-[#1e1a16] to-[#1a1614]"}
                  `}
                  style={{
                    transform: `translateX(${translateX}px) rotate(${rotate}deg)`,
                    transition: dragStartX.current !== null ? "none" : "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
                    opacity: flyOut ? 0 : 1,
                  }}
                >
                  <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-3">Pista</p>
                  <p className="font-display font-bold text-xl text-[#f5e6c8] leading-snug">{card.text}</p>
                  {feedback && (
                    <p className={`mt-3 font-typewriter text-xs ${feedback.correct ? "text-[#c9933a]" : "text-[#e8b455]"}`}>
                      {feedback.correct ? "✓ ¡Correcto!" : `✗ Es ${card.category === "left" ? leftLabel : rightLabel}`}
                      {feedback.explanation ? ` — ${feedback.explanation}` : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT zone */}
              <SortZone
                label={rightLabel}
                hint={rightHint}
                arrow="▶"
                armed={arming === "right"}
                onClick={() => answer("right")}
                disabled={locked}
              />
            </div>

            <p className="text-center font-typewriter text-[10px] text-[#6b5a48] tracking-wide">
              Desliza la tarjeta ◀ ▶, toca un lado, o usa las flechas del teclado.
            </p>
          </>
        )}
      </div>
    </GameShell>
  );
}

function SortZone({
  label, hint, arrow, armed, onClick, disabled,
}: {
  label: string; hint?: string; arrow: string; armed: boolean;
  onClick: () => void; disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Clasificar como ${label}`}
      className={`
        w-[84px] shrink-0 rounded-sm border-2 flex flex-col items-center justify-center gap-1 px-1 py-3
        transition-colors disabled:opacity-40
        ${armed
          ? "border-[#e8b455] bg-[rgba(232,180,85,0.18)]"
          : "border-[rgba(201,147,58,0.25)] bg-[rgba(201,147,58,0.05)] hover:bg-[rgba(201,147,58,0.12)]"}
      `}
    >
      <span className="font-typewriter text-lg text-[#c9933a]">{arrow}</span>
      <span className="font-display font-bold text-sm text-[#f5e6c8] leading-tight break-words">{label}</span>
      {hint && <span className="font-typewriter text-[9px] text-[#8b7355] leading-tight">{hint}</span>}
    </button>
  );
}
