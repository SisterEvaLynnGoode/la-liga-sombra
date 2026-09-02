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
  /** Per-city art. Another case ships its own plate and needs no code change. */
  background?: string;
  suspectSprite?: string;
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
const GOLD_HI = "#e8b455";
const CREAM = "#f5e6c8";
const RED = "#c0392b";
const GREEN = "#5a9e6f";

const W = 900;   // logical canvas size; CSS scales it to the container
const H = 420;
const PLAYER_Y = H - 92;   // the line where a junction resolves

export default function ChaseScene({
  title = "La Persecución",
  suspectName,
  city,
  junctions,
  approachSeconds = 5,
  background = "/images/chase/street-madrid.webp",
  suspectSprite = "/images/chase/suspect.webp",
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

  /**
   * The street plate and the suspect sprite.
   *
   * Held in refs and drawn only once `complete` — a half-decoded image draws as
   * nothing, and the loop must not care whether they ever arrive. `assetTick`
   * exists purely to force one repaint per image so the first frame is not
   * stuck on the geometric fallback after the art lands.
   */
  const bgRef = useRef<HTMLImageElement | null>(null);
  const spriteRef = useRef<HTMLImageElement | null>(null);
  const [assetTick, setAssetTick] = useState(0);

  useEffect(() => {
    const bump = () => setAssetTick((n) => n + 1);
    const bg = new Image();
    bg.onload = bump;
    bg.src = background;
    bgRef.current = bg;

    const sp = new Image();
    sp.onload = bump;
    sp.src = suspectSprite;
    spriteRef.current = sp;
  }, [background, suspectSprite]);

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
        bg: bgRef.current,
        sprite: spriteRef.current,
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
  }, [junction, laneCount, approachSeconds, resolveJunction, gap, phase, assetTick]);

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
/**
 * An inked Madrid street plate with the suspect composited over it, and the
 * junction signs flying out of the vanishing point toward the camera.
 *
 * The art is deliberately doing the heavy lifting: teenagers read "cheap" in
 * about a second, and a lane runner drawn as bare rectangles announces it. The
 * background and the sprite are generated once, shipped as WebP totalling under
 * 180 KB, and everything else — the perspective, the sign motion, the lane
 * highlight — is computed here, so no extra art is needed for another city.
 *
 * DEPTH WITHOUT A 3D ENGINE
 *
 * Signs start small and tight around the plate's vanishing point and widen and
 * grow as they approach, so a row of flat rectangles reads as a junction rushing
 * up the street. The suspect scales with the distance gap: close the gap and he
 * looms larger, lose ground and he shrinks toward the horizon. It is a cheap
 * trick and it is the entire reason the scene feels like a chase.
 *
 * FALLS BACK TO GEOMETRY
 *
 * If either asset fails to load — a bad deploy, a filtered CDN, a Chromebook
 * that refuses the decode — the scene draws its original flat-colour version
 * instead of a broken frame. A stage that still plays without its art is worth
 * more than one that looks right only when everything is perfect.
 */

interface DrawState {
  scroll: number;
  laneCount: number;
  lane: number;
  progress: number;
  exits: string[];
  gap: number;
  bg: HTMLImageElement | null;
  sprite: HTMLImageElement | null;
}

/** Where the street art converges, as a fraction of the canvas. */
const VP_X = 0.36;
const VP_Y = 0.34;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function draw(ctx: CanvasRenderingContext2D, s: DrawState) {
  const { laneCount, lane, progress, exits, gap, bg, sprite, scroll } = s;

  ctx.clearRect(0, 0, W, H);

  // ── Street plate ──────────────────────────────────────────────────────
  if (bg && bg.complete && bg.naturalWidth) {
    // cover-fit so the plate never letterboxes at any canvas size
    const r = Math.max(W / bg.naturalWidth, H / bg.naturalHeight);
    const dw = bg.naturalWidth * r;
    const dh = bg.naturalHeight * r;
    ctx.drawImage(bg, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#141110";
    ctx.fillRect(90, 0, W - 180, H);
  }

  // Vignette: pushes the eye down the street and keeps sign text legible.
  const vg = ctx.createRadialGradient(W * VP_X, H * VP_Y, H * 0.1, W * VP_X, H * VP_Y, H * 1.15);
  vg.addColorStop(0, "rgba(13,11,10,0)");
  vg.addColorStop(1, "rgba(13,11,10,0.72)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  const vpx = W * VP_X;
  const vpy = H * VP_Y;

  // ── The suspect, ahead up the street ──────────────────────────────────
  // Nearer when the gap is small. The bob is what sells "running".
  const near = 1 - Math.min(1, gap / 200);            // 0 far … 1 caught
  const sy = lerp(vpy + 4, H * 0.58, near);
  const sx = lerp(vpx, W * 0.5, near * 0.55);
  const bob = Math.sin(scroll * 0.45) * (2 + near * 4);

  if (sprite && sprite.complete && sprite.naturalWidth) {
    const sh = lerp(H * 0.09, H * 0.31, near);
    const sw = sh * (sprite.naturalWidth / sprite.naturalHeight);
    // Soft contact shadow so he sits on the road instead of floating.
    ctx.save();
    ctx.globalAlpha = 0.38;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(sx, sy + bob, sw * 0.34, sh * 0.055, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(sprite, sx - sw / 2, sy + bob - sh, sw, sh);
  } else {
    ctx.fillStyle = RED;
    const rr = lerp(5, 16, near);
    ctx.beginPath();
    ctx.arc(sx, sy + bob - rr * 2, rr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(sx - rr * 0.5, sy + bob - rr, rr, rr * 2);
  }

  // ── Junction signs, rushing out of the distance ───────────────────────
  const p = progress;
  const ease = p * p;                                  // accelerate toward the camera
  const rowY = lerp(vpy + 10, PLAYER_Y - 6, ease);
  const rowW = lerp(W * 0.10, W * 0.94, ease);
  const rowCx = lerp(vpx, W / 2, ease);
  const scale = lerp(0.22, 1, ease);
  const cellW = rowW / laneCount;
  const cellH = 52 * scale;

  for (let i = 0; i < laneCount; i++) {
    const cx = rowCx - rowW / 2 + cellW * (i + 0.5);
    const x = cx - cellW / 2 + 3 * scale;
    const w = cellW - 6 * scale;
    const on = i === lane;

    ctx.save();
    ctx.globalAlpha = Math.min(1, 0.25 + ease * 1.4);
    // Both states keep an opaque dark plate. A translucent gold fill looked
    // better in isolation and turned to mush the moment a sign crossed the
    // pool of lamplight on the road — the selection reads from the border and
    // the text colour instead, which survives any background art.
    ctx.fillStyle = on ? "rgba(24,18,12,0.88)" : "rgba(13,11,10,0.80)";
    ctx.strokeStyle = on ? GOLD_HI : "rgba(245,230,200,0.55)";
    ctx.lineWidth = Math.max(1, (on ? 3 : 1.6) * scale);
    roundRect(ctx, x, rowY, w, cellH, 4 * scale);
    ctx.fill();
    ctx.stroke();

    if (scale > 0.42) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 4 * scale;
      ctx.fillStyle = on ? GOLD_HI : CREAM;
      fitText(ctx, exits[i] ?? "", cx, rowY + cellH / 2, w - 10, 16 * scale);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  // ── Your lane, at the bottom edge ─────────────────────────────────────
  const laneW = (W * 0.94) / laneCount;
  const px = W / 2 - (W * 0.94) / 2 + laneW * (lane + 0.5);
  ctx.fillStyle = GOLD_HI;
  ctx.beginPath();
  ctx.moveTo(px, H - 12);
  ctx.lineTo(px - 13, H - 2);
  ctx.lineTo(px + 13, H - 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(232,180,85,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px - laneW / 2 + 6, H - 3);
  ctx.lineTo(px + laneW / 2 - 6, H - 3);
  ctx.stroke();

  // ── Distance readout ──────────────────────────────────────────────────
  ctx.fillStyle = "rgba(13,11,10,0.6)";
  ctx.fillRect(8, 8, 128, 20);
  ctx.fillStyle = gap <= 20 ? GREEN : gap >= 150 ? RED : GOLD_HI;
  ctx.font = "600 12px ui-monospace, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`DISTANCIA ${Math.round(gap)} m`, 14, 18);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Shrink a label until it fits its sign rather than letting it overflow. */
function fitText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, maxW: number, start = 15) {
  let size = start;
  const set = () => { ctx.font = `600 ${size}px ui-sans-serif, system-ui, sans-serif`; };
  set();
  while (ctx.measureText(text).width > maxW && size > 7) { size -= 1; set(); }
  ctx.fillText(text, cx, cy);
}
