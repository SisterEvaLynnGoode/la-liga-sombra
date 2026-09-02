"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import GameShell from "./GameShell";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import { playSpanishAudio } from "@/lib/games/speak";
import { logItemEvent, flushItemEvents } from "@/lib/events";
import type { OnComplete, ChaseJunction } from "@/lib/games/types";

/**
 * La Persecución — a real-time pursuit where the Spanish is the steering wheel.
 *
 * WHY THIS EXISTS
 *
 * Across 25 units the game runs the same shape: every case opens
 * cutscene → vocabMatch and ends → lineup, readingComp appears in all 25, and
 * Casos 12-15 are structurally identical to each other. Three genuinely
 * different mechanics were built and then used exactly once each. Students
 * notice, and a mystery that feels like a worksheet stops being a mystery.
 *
 * WHAT MAKES IT A LANGUAGE GAME AND NOT A GAME WITH SPANISH ON IT
 *
 * The instruction exists ONLY in Spanish, spoken and written, and it is the
 * only thing that tells you which lane to be in. Ignore it and you are guessing
 * between two and four lanes; the suspect gains on every miss. That is the
 * difference between practice and decoration — a student who tunes out the
 * language loses the round, immediately and visibly.
 *
 * WHY HAND-ROLLED CANVAS AND NOT A GAME ENGINE
 *
 * The project has no sprite assets and a noir line-art style, so an engine
 * would mostly be drawing rectangles I have to specify anyway — while adding
 * a few hundred KB to every Chromebook on a shared access point, plus an
 * SSR-unsafe global. One canvas, one rAF loop, no dependency.
 *
 * FAIRNESS ON PURPOSE
 *
 * A timed game quietly grades reflexes as if they were Spanish. Countermeasures
 * are deliberate: the sign is readable for the whole approach (default 5s), the
 * instruction can be replayed as often as you like, lanes can be chosen by
 * arrow key, click or on-screen button, and a lane locks in on arrival rather
 * than requiring a twitch. Speed is set in content per case, so it can be eased
 * for a class that needs it without touching this file.
 */

interface Props {
  title?: string;
  suspectName: string;
  city: string;
  junctions: ChaseJunction[];
  approachSeconds?: number;
  unitId?: string;
  onComplete: OnComplete;
}

type Phase = "briefing" | "running" | "done";

/** Feedback for the junction that just resolved. */
interface Resolved {
  ok: boolean;
  chosen: string;
  correct: string;
  instruction: string;
  instructionEn?: string;
}

// Noir palette, matched to the rest of the game.
const INK = "#0d0b0a";
const GOLD = "#c9933a";
const GOLD_HI = "#e8b455";
const CREAM = "#f5e6c8";
const RED = "#c0392b";
const GREEN = "#5a9e6f";
const DIM = "#4a3a2a";

const W = 900;   // logical canvas size; CSS scales it to the container
const H = 420;
const PLAYER_Y = H - 92;   // the line where a junction resolves

export default function ChaseScene({
  title = "La Persecución",
  suspectName,
  city,
  junctions,
  approachSeconds = 5,
  unitId,
  onComplete,
}: Props) {
  const { recordAttempt } = useAttemptTracker("listening", unitId);

  const [phase, setPhase] = useState<Phase>("briefing");
  const [index, setIndex] = useState(0);
  const [lane, setLane] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [resolved, setResolved] = useState<Resolved | null>(null);
  /** Suspect's lead in metres — pure feedback, never a fail state. */
  const [gap, setGap] = useState(60);
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.round((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  /** The result shape used by both the skip path and the finish button. */
  const resultNow = useCallback(
    (isSkipped = false) => ({
      score: correctCount,
      maxScore: junctions.length,
      timeSpent: Math.round((Date.now() - startedAt) / 1000),
      attempts: isSkipped ? index : junctions.length,
      ...(isSkipped ? { isSkipped: true } : {}),
    }),
    [correctCount, junctions.length, startedAt, index]
  );

  const junction = junctions[index];
  const laneCount = junction?.exits.length ?? 2;

  // Refs the animation loop reads without re-subscribing every frame.
  const laneRef = useRef(0);
  const phaseRef = useRef<Phase>("briefing");
  const progressRef = useRef(0);          // 0 → 1 across one approach
  const resolvingRef = useRef(false);
  useEffect(() => { laneRef.current = lane; }, [lane]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const speak = useCallback(() => {
    if (junction) void playSpanishAudio(junction.audio, junction.instruction);
  }, [junction]);

  // ── Resolve one junction ────────────────────────────────────────────────
  const resolveJunction = useCallback(() => {
    if (resolvingRef.current || !junction) return;
    resolvingRef.current = true;

    const chosenExit = junction.exits[laneRef.current];
    const correctExit = junction.exits.find((e) => e.correct) ?? junction.exits[0];
    const ok = !!chosenExit?.correct;

    logItemEvent({
      stageType: "chaseScene",
      skill: "listening",
      itemKey: junction.instruction,
      correct: ok,
      unitId,
      chosen: chosenExit?.label ?? null,
      expected: correctExit.label,
    });

    setCorrectCount((c) => c + (ok ? 1 : 0));
    setGap((g) => Math.max(0, Math.min(200, g + (ok ? -12 : 18))));
    setResolved({
      ok,
      chosen: chosenExit?.label ?? "—",
      correct: correctExit.label,
      instruction: junction.instruction,
      instructionEn: junction.instructionEn,
    });
  }, [junction, unitId]);

  // ── Advance past the feedback card ──────────────────────────────────────
  function next() {
    setResolved(null);
    resolvingRef.current = false;
    progressRef.current = 0;
    setLane(0);

    if (index + 1 >= junctions.length) {
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      setPhase("done");
      void flushItemEvents();
      recordAttempt(correctCount, junctions.length, elapsed);
      return;
    }
    setIndex((i) => i + 1);
  }

  // Speak each new instruction as it appears.
  useEffect(() => {
    if (phase === "running" && !resolved) speak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase]);

  // ── Input ───────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phaseRef.current !== "running" || resolvingRef.current) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); setLane((l) => Math.max(0, l - 1)); }
      if (e.key === "ArrowRight") { e.preventDefault(); setLane((l) => Math.min(laneCount - 1, l + 1)); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [laneCount]);

  // ── The loop ────────────────────────────────────────────────────────────
  /**
   * Driven by setInterval, not requestAnimationFrame, and it paints one frame
   * synchronously before the timer starts.
   *
   * rAF only fires when the browser is actually compositing. A tab that is
   * backgrounded, occluded, or rendered in a host that does not composite gets
   * NO callbacks at all — and because the junction used to resolve inside the
   * rAF callback, the whole stage froze on a black rectangle with no way
   * forward. Verified: rAF was requested once and the callback never fired.
   *
   * A 30 fps interval is more than enough for a scrolling sign and a marker,
   * costs nothing on a low-end GPU, and keeps the game advancing wherever
   * timers run. The immediate first paint means the canvas is never blank even
   * for the first 33 ms.
   */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let last = performance.now();
    let scroll = 0;

    const paint = () => {
      draw(ctx, {
        scroll,
        laneCount,
        lane: laneRef.current,
        progress: progressRef.current,
        exits: junction?.exits.map((e) => e.label) ?? [],
        gap,
      });
    };

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.25, (now - last) / 1000);  // clamp so a throttled
      last = now;                                       // tab cannot teleport
      scroll = (scroll + dt * 140) % 40;

      if (phaseRef.current === "running" && !resolvingRef.current) {
        progressRef.current += dt / approachSeconds;
        if (progressRef.current >= 1) {
          progressRef.current = 1;
          resolveJunction();
        }
      }
      paint();
    };

    paint();                                   // never show an empty canvas
    const id = setInterval(tick, 33);          // ~30 fps
    return () => clearInterval(id);
  }, [junction, laneCount, approachSeconds, resolveJunction, gap, phase]);

  // ── Briefing ────────────────────────────────────────────────────────────
  if (phase === "briefing") {
    return (
      <GameShell title={`${title} · ${city}`} elapsed={elapsed} unitId={unitId} onSkip={() => { recordAttempt(correctCount, junctions.length, elapsed); return resultNow(true); }}>
        <div className="max-w-xl mx-auto text-center space-y-5 py-4">
          <div className="text-6xl">🏃</div>
          <p className="font-typewriter text-sm text-[#c4a882] leading-relaxed">
            {suspectName} va a pie por {city}. El cuartel general te da instrucciones{" "}
            <span className="text-[#e8b455]">solo en español</span>.
          </p>
          <div className="border border-[rgba(201,147,58,0.25)] bg-[rgba(201,147,58,0.05)] px-5 py-4 text-left space-y-1.5">
            <p className="font-typewriter text-[11px] text-[#c4a882]">
              → Escucha (o lee) la instrucción.
            </p>
            <p className="font-typewriter text-[11px] text-[#c4a882]">
              → Muévete al carril correcto: <b>← →</b>, o toca el botón.
            </p>
            <p className="font-typewriter text-[11px] text-[#c4a882]">
              → Puedes repetir la instrucción todas las veces que quieras.
            </p>
            <p className="font-typewriter text-[11px] text-[#8b7355] pt-1">
              {junctions.length} cruces. Si aciertas, te acercas. Si fallas, escapa.
            </p>
          </div>
          <button
            onClick={() => { setPhase("running"); progressRef.current = 0; }}
            className="clip-skew px-10 py-3.5 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            Empezar la persecución →
          </button>
        </div>
      </GameShell>
    );
  }

  // ── Result ──────────────────────────────────────────────────────────────
  if (phase === "done") {
    const pct = Math.round((correctCount / junctions.length) * 100);
    const caught = gap <= 20;
    return (
      <GameShell title={`${title} · ${city}`} elapsed={elapsed} status="complete" unitId={unitId} onSkip={() => resultNow(true)}>
        <div className="max-w-xl mx-auto text-center space-y-5 py-6">
          <div className="text-6xl">{caught ? "🎯" : "💨"}</div>
          <h3 className="font-display text-2xl font-bold text-[#f5e6c8]">
            {caught ? `¡Atrapaste a ${suspectName}!` : `${suspectName} escapó… por ahora.`}
          </h3>
          <p className="font-display text-3xl font-bold" style={{ color: pct >= 70 ? GREEN : GOLD_HI }}>
            {correctCount} / {junctions.length}
          </p>
          <p className="font-typewriter text-xs text-[#8b7355]">
            {pct}% de los cruces correctos · distancia final {Math.round(gap)} m
          </p>
          <button
            onClick={() => onComplete(resultNow())}
            className="clip-skew px-10 py-3.5 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            Continuar →
          </button>
        </div>
      </GameShell>
    );
  }

  // ── Running ─────────────────────────────────────────────────────────────
  return (
    <GameShell
      title={`${title} · cruce ${index + 1}/${junctions.length}`}
      elapsed={elapsed}
      unitId={unitId}
      onSkip={() => { recordAttempt(correctCount, junctions.length, elapsed); return resultNow(true); }}
    >
      <div className="max-w-3xl mx-auto space-y-3">
        {/* The instruction. Spanish only until the junction resolves. */}
        <div className="border-2 border-[rgba(201,147,58,0.35)] bg-[rgba(201,147,58,0.06)] px-4 py-3 flex items-center gap-3">
          <button
            onClick={speak}
            title="Repetir la instrucción"
            className="shrink-0 w-10 h-10 border border-[rgba(201,147,58,0.4)] text-[#e8b455] hover:bg-[rgba(201,147,58,0.15)] transition-colors text-lg"
          >
            ▶
          </button>
          <div className="min-w-0">
            <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">
              Cuartel general
            </p>
            <p className="font-display text-lg font-bold text-[#f5e6c8] leading-tight">
              «{junction?.instruction}»
            </p>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-auto border border-[rgba(201,147,58,0.2)] bg-[#0d0b0a]"
          aria-label={`Persecución por ${city}. Instrucción: ${junction?.instruction}`}
        />

        {/* Lane buttons — the touch and mouse path to the same control. */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${laneCount}, minmax(0,1fr))` }}>
          {junction?.exits.map((ex, i) => (
            <button
              key={i}
              disabled={!!resolved}
              onClick={() => setLane(i)}
              className={`px-2 py-2.5 font-typewriter text-xs border transition-colors disabled:opacity-60 ${
                lane === i
                  ? "border-[#c9933a] bg-[rgba(201,147,58,0.18)] text-[#e8b455]"
                  : "border-[rgba(201,147,58,0.2)] text-[#c4a882] hover:border-[rgba(201,147,58,0.5)]"
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Feedback — the only place English is allowed to appear. */}
        {resolved && (
          <div
            className="border-2 px-4 py-3"
            style={{
              borderColor: resolved.ok ? GREEN : RED,
              background: resolved.ok ? "rgba(90,158,111,0.08)" : "rgba(192,57,43,0.08)",
            }}
          >
            <p className="font-display font-bold text-sm" style={{ color: resolved.ok ? GREEN : RED }}>
              {resolved.ok ? "✓ ¡Bien! Te acercas." : `✗ Era «${resolved.correct}». ${suspectName} gana distancia.`}
            </p>
            {resolved.instructionEn && (
              <p className="font-typewriter text-[11px] text-[#8b7355] mt-1">
                «{resolved.instruction}» — {resolved.instructionEn}
              </p>
            )}
            <button
              onClick={next}
              className="mt-2 clip-skew px-6 py-2 font-typewriter text-[11px] tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.15)] text-[#e8b455] border border-[rgba(201,147,58,0.4)] hover:bg-[rgba(201,147,58,0.25)] transition-colors"
            >
              {index + 1 >= junctions.length ? "Ver resultado →" : "Siguiente cruce →"}
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}

// ── Drawing ────────────────────────────────────────────────────────────────
// Deliberately geometric: lanes, a sign row and two markers. It reads instantly
// at any size and costs nothing to render on a low-end Chromebook GPU.

interface DrawState {
  scroll: number;
  laneCount: number;
  lane: number;
  progress: number;
  exits: string[];
  gap: number;
}

function draw(ctx: CanvasRenderingContext2D, s: DrawState) {
  const { scroll, laneCount, lane, progress, exits, gap } = s;

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  const roadX = 90;
  const roadW = W - roadX * 2;
  const laneW = roadW / laneCount;

  // Road bed
  ctx.fillStyle = "#141110";
  ctx.fillRect(roadX, 0, roadW, H);

  // Lane divider dashes, scrolling toward the player to sell forward motion
  ctx.strokeStyle = "rgba(201,147,58,0.18)";
  ctx.lineWidth = 2;
  for (let i = 1; i < laneCount; i++) {
    const x = roadX + laneW * i;
    for (let y = -40 + scroll; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 20);
      ctx.stroke();
    }
  }

  // Kerbs
  ctx.strokeStyle = "rgba(201,147,58,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(roadX, 0); ctx.lineTo(roadX, H);
  ctx.moveTo(roadX + roadW, 0); ctx.lineTo(roadX + roadW, H);
  ctx.stroke();

  // Suspect, running ahead — closer to the top when the gap is small
  const suspectY = 34 + (gap / 200) * 40;
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.arc(roadX + roadW / 2, suspectY, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(roadX + roadW / 2 - 4, suspectY + 9, 8, 16);

  // The junction sign row, descending toward the player line
  const signY = -70 + progress * (PLAYER_Y - 20 + 70);
  for (let i = 0; i < laneCount; i++) {
    const x = roadX + laneW * i + 6;
    const w = laneW - 12;
    const isTarget = i === lane;
    ctx.fillStyle = isTarget ? "rgba(201,147,58,0.16)" : "rgba(20,17,16,0.9)";
    ctx.strokeStyle = isTarget ? GOLD_HI : "rgba(201,147,58,0.4)";
    ctx.lineWidth = isTarget ? 2.5 : 1.5;
    ctx.fillRect(x, signY, w, 46);
    ctx.strokeRect(x, signY, w, 46);

    ctx.fillStyle = isTarget ? GOLD_HI : CREAM;
    ctx.font = "600 15px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    fitText(ctx, exits[i] ?? "", x + w / 2, signY + 23, w - 12);
  }

  // Player marker
  const px = roadX + laneW * lane + laneW / 2;
  ctx.fillStyle = GOLD_HI;
  ctx.beginPath();
  ctx.arc(px, PLAYER_Y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = GOLD;
  ctx.fillRect(px - 5, PLAYER_Y + 10, 10, 18);

  // The resolve line
  ctx.strokeStyle = "rgba(201,147,58,0.5)";
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(roadX, PLAYER_Y - 20);
  ctx.lineTo(roadX + roadW, PLAYER_Y - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  // Distance readout
  ctx.fillStyle = DIM;
  ctx.font = "500 12px ui-monospace, monospace";
  ctx.textAlign = "left";
  ctx.fillText(`DISTANCIA  ${Math.round(gap)} m`, 12, 22);

  // Gap bar — shorter is better, so it drains toward the top as you close in
  ctx.fillStyle = "rgba(201,147,58,0.15)";
  ctx.fillRect(12, 34, 14, H - 60);
  ctx.fillStyle = gap <= 20 ? GREEN : gap >= 150 ? RED : GOLD;
  const barH = (gap / 200) * (H - 60);
  ctx.fillRect(12, 34, 14, barH);
}

/** Shrink a label until it fits its sign rather than letting it overflow. */
function fitText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, maxW: number) {
  let size = 15;
  ctx.font = `600 ${size}px ui-sans-serif, system-ui, sans-serif`;
  while (ctx.measureText(text).width > maxW && size > 9) {
    size -= 1;
    ctx.font = `600 ${size}px ui-sans-serif, system-ui, sans-serif`;
  }
  ctx.fillText(text, cx, cy);
}
