"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { StakeoutScene } from "@/lib/types/unit-content";
import type { OnComplete } from "@/lib/games/types";
import SkipStageButton from "./SkipStageButton";

interface Props {
  scenes: StakeoutScene[];
  targetActionDescription: string;
  timeLimit: number;
  unitId?: string;
  onComplete: OnComplete;
}

const VISIBLE = 4;          // cards shown at once
const ROTATION_SEC = 8;     // seconds between rotations
const PROGRESS_TICK = 200;  // ms between progress-bar updates

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Surveillance camera card ─────────────────────────────────────────────────
function SceneCard({
  scene,
  rotationFrac,  // 0→1 how far through current rotation cycle
  onClick,
  flash,         // "correct" | "wrong" | null
  disabled,
}: {
  scene: StakeoutScene;
  rotationFrac: number;
  onClick: () => void;
  flash: "correct" | "wrong" | null;
  disabled: boolean;
}) {
  const barWidth = Math.max(0, 100 - rotationFrac * 100);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden border-2 text-left transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[#c9933a]
        ${disabled ? "cursor-default" : "cursor-pointer"}
        ${flash === "correct"
          ? "border-[#27ae60] shadow-[0_0_20px_rgba(39,174,96,0.5)]"
          : flash === "wrong"
          ? "border-[#c0392b] shadow-[0_0_12px_rgba(192,57,43,0.4)]"
          : "border-[rgba(201,147,58,0.2)] hover:border-[rgba(201,147,58,0.5)]"
        }
      `}
    >
      {/* Camera feed image */}
      <div className="relative bg-[#050403]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={scene.imageUrl}
          alt={scene.description}
          className="w-full object-cover"
          style={{
            height: 150,
            filter: "grayscale(30%) contrast(110%) brightness(0.85)",
          }}
        />

        {/* Surveillance overlay: scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
          }}
        />

        {/* REC indicator */}
        <div className="absolute top-1.5 left-2 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b] animate-pulse" />
          <span className="font-typewriter text-[8px] text-[#c0392b] tracking-wider">REC</span>
        </div>

        {/* Camera label top-right */}
        <div className="absolute top-1.5 right-2">
          <span className="font-typewriter text-[8px] text-[rgba(255,255,255,0.5)] tracking-wider">
            CAM {scene.description.slice(0, 12).toUpperCase()}
          </span>
        </div>

        {/* Flash overlays */}
        {flash === "correct" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(39,174,96,0.25)]">
            <span className="text-5xl drop-shadow-lg">✓</span>
          </div>
        )}
        {flash === "wrong" && (
          <div className="absolute inset-0 bg-[rgba(192,57,43,0.25)] flex items-center justify-center">
            <span className="text-4xl text-[#c0392b]">✗</span>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="px-2 py-2 bg-[#0a0806]">
        <p className="font-typewriter text-[9px] text-[#8b7355] mb-0.5 uppercase tracking-wider truncate">
          {scene.description}
        </p>
        <p className="font-typewriter text-xs text-[#c4a882] leading-snug">
          {scene.currentAction}
        </p>
      </div>

      {/* Rotation countdown bar — drains right→left */}
      <div className="h-0.5 bg-[#1a1614] w-full">
        <div
          className="h-full bg-[#c9933a] transition-none"
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </button>
  );
}

// ── Timer display ─────────────────────────────────────────────────────────────
function CountdownTimer({ seconds, max }: { seconds: number; max: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const frac = seconds / max;
  const isCritical = frac < 0.2;
  const isLow = frac < 0.4;

  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={`font-typewriter text-xl tabular-nums tracking-wider ${
          isCritical ? "text-[#c0392b] animate-pulse" : isLow ? "text-[#e8b455]" : "text-[#c4a882]"
        }`}
      >
        {mins}:{secs.toString().padStart(2, "0")}
      </span>
      {/* Time bar */}
      <div className="w-24 h-1 bg-[#2a2420] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isCritical ? "bg-[#c0392b]" : isLow ? "bg-[#e8b455]" : "bg-[#c9933a]"
          }`}
          style={{ width: `${(seconds / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LiveStakeout({
  scenes,
  targetActionDescription,
  timeLimit,
  unitId,
  onComplete,
}: Props) {
  // Build display queue at mount: non-targets first (shuffled), target at index 3
  // → target is visible in the first rotation window immediately
  const [queue] = useState<StakeoutScene[]>(() => {
    const target = scenes.find((s) => s.isTarget)!;
    const others = shuffle(scenes.filter((s) => !s.isTarget));
    // Guarantee target is in slot 3 of first window (visible from the start)
    return [others[0], others[1], others[2], target, ...others.slice(3)];
  });

  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [windowStart, setWindowStart] = useState(0);
  const [rotationFrac, setRotationFrac] = useState(0); // 0→1 within current 8s window
  const [wrongFlashIdx, setWrongFlashIdx] = useState<number | null>(null);
  const [correctIdx, setCorrectIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<"playing" | "found" | "timeout">("playing");
  const startTime = useRef(Date.now());
  const attempts = useRef(0);
  const rotationOrigin = useRef(Date.now());

  // Visible scenes (VISIBLE-wide window into queue)
  const visibleScenes = Array.from({ length: VISIBLE }, (_, i) =>
    queue[(windowStart + i) % queue.length]
  );

  // ── Countdown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setPhase("timeout");
          onComplete({
            score: 0,
            maxScore: timeLimit,
            timeSpent: Math.round((Date.now() - startTime.current) / 1000),
            attempts: attempts.current,
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, timeLimit, onComplete]);

  // ── Rotation + progress bar ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    rotationOrigin.current = Date.now();
    let step = 0;

    const id = setInterval(() => {
      const elapsed = Date.now() - rotationOrigin.current;
      const frac = (elapsed % (ROTATION_SEC * 1000)) / (ROTATION_SEC * 1000);
      setRotationFrac(frac);

      const newStep = Math.floor(elapsed / (ROTATION_SEC * 1000));
      if (newStep > step) {
        step = newStep;
        setWindowStart((prev) => (prev + 1) % queue.length);
      }
    }, PROGRESS_TICK);

    return () => clearInterval(id);
  }, [phase, queue.length]);

  // Guard: prevent onComplete from firing twice (auto-advance + button click)
  const completedRef = useRef(false);
  const fireComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete({
      score: timeLeft,
      maxScore: timeLimit,
      timeSpent: Math.round((Date.now() - startTime.current) / 1000),
      attempts: attempts.current,
    });
  }, [onComplete, timeLeft, timeLimit]);

  // ── Handle scene click ───────────────────────────────────────────────────────
  const handleClick = useCallback(
    (scene: StakeoutScene, visibleIdx: number) => {
      if (phase !== "playing") return;
      attempts.current += 1;

      if (scene.isTarget) {
        setCorrectIdx(visibleIdx);
        setPhase("found");
        // Auto-advance after 1.4s as a courtesy. The "found" phase render also
        // includes an explicit "Continuar →" button so students are never stuck
        // if the auto-advance fails for any reason.
        setTimeout(fireComplete, 1400);
      } else {
        setWrongFlashIdx(visibleIdx);
        setTimeout(() => setWrongFlashIdx(null), 900);
      }
    },
    [phase, fireComplete]
  );

  // ── Timeout / found screens ──────────────────────────────────────────────────
  if (phase === "timeout") {
    return (
      <div className="min-h-[360px] flex flex-col items-center justify-center gap-5 p-8 bg-[#0d0b0a]">
        <span className="text-5xl">⏱</span>
        <p className="font-display text-2xl font-bold text-[#c0392b]">Tiempo agotado</p>
        <p className="font-typewriter text-sm text-[#8b7355] text-center max-w-xs">
          El sospechoso escapa esta vez. Pero el caso sigue abierto.
        </p>
      </div>
    );
  }

  // Found phase: dedicated success screen so the student is never stuck waiting
  // for the auto-advance. The "Continuar →" button is the primary control;
  // the 1.4s setTimeout from handleClick is a courtesy auto-advance.
  if (phase === "found") {
    return (
      <div className="min-h-[360px] flex flex-col items-center justify-center gap-5 p-8 bg-[#0d0b0a]">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c9933a] to-[#8b5e10] shadow-[0_0_40px_rgba(201,147,58,0.4)] flex items-center justify-center">
          <span className="text-4xl">✓</span>
        </div>
        <p className="font-display text-2xl font-bold text-[#e8b455]">¡Lo encontraste!</p>
        <p className="font-typewriter text-sm text-[#c4a882] text-center max-w-xs">
          Identificaste al sospechoso en la cámara correcta.
        </p>
        <button
          onClick={fireComplete}
          className="clip-skew px-10 py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
        >
          Continuar →
        </button>
      </div>
    );
  }

  // ── Playing ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-[520px] bg-[#0d0b0a] select-none">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-[rgba(201,147,58,0.12)] bg-[#0a0806] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-start justify-between gap-4">
          {/* Target description */}
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div>
              <p className="font-typewriter text-[9px] tracking-[0.35em] uppercase text-[#c0392b] mb-1 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c0392b] animate-pulse" />
                Vigilancia en vivo · Objetivo
              </p>
              <p className="font-typewriter text-sm text-[#e8b455] leading-snug">
                {targetActionDescription}
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="shrink-0">
            <CountdownTimer seconds={timeLeft} max={timeLimit} />
          </div>
        </div>
      </div>

      {/* Skip strip */}
      <div className="shrink-0 border-b border-[rgba(201,147,58,0.08)] bg-[#0f0d0b] py-2 px-4">
        <SkipStageButton
          stageName="Vigilancia en Vivo"
          unitId={unitId}
          onSkip={() => {
            setPhase("timeout");
            onComplete({
              score: 0,
              maxScore: timeLimit,
              timeSpent: Math.round((Date.now() - startTime.current) / 1000),
              attempts: attempts.current,
              isSkipped: true,
            });
          }}
        />
      </div>

      {/* ── Rotation hint ───────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-1.5 bg-[#070605] border-b border-[rgba(201,147,58,0.06)]">
        <p className="font-typewriter text-[9px] text-[#4a3a2a] text-center tracking-wider">
          Las cámaras rotan cada {ROTATION_SEC} segundos — la barra dorada muestra el tiempo restante · Haz clic en la escena correcta
        </p>
      </div>

      {/* ── 2×2 scene grid ──────────────────────────────────────────────────── */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto h-full">
          {visibleScenes.map((scene, i) => (
            <SceneCard
              key={`${windowStart}-${i}`}
              scene={scene}
              rotationFrac={rotationFrac}
              onClick={() => handleClick(scene, i)}
              flash={
                correctIdx === i ? "correct"
                : wrongFlashIdx === i ? "wrong"
                : null
              }
              disabled={phase !== "playing"}
            />
          ))}
        </div>
      </div>

      {/* ── Footer instruction ───────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2 border-t border-[rgba(201,147,58,0.08)]">
        <p className="font-typewriter text-[9px] text-[#3a2a1a] text-center tracking-wide">
          Lee las descripciones en español · Lee el objetivo · Haz clic en la escena que coincide
        </p>
      </div>
    </div>
  );
}
