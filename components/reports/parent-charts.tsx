/**
 * Small charts for the parent report.
 *
 * Different job from the admin figures, so different rules. A parent reads one
 * page once, at a kitchen table, probably without a background in the subject.
 * So each of these is an inch tall at most, carries its own numbers in words
 * beside it, and never asks the reader to hold a legend in their head.
 *
 * Three things they deliberately do NOT do:
 *   • No rank, no percentile, no "below average". Where a comparison helps, the
 *     class MEDIAN appears as a quiet reference mark and nothing more. A parent
 *     handed a rank will read it as a verdict on their child.
 *   • No axis a reader has to decode. Where a scale exists it is labelled at
 *     its ends in plain words.
 *   • No bare percentage. Every number is attached to the thing it counts.
 */

import { HatchDefs, INK } from "./charts";

const FONT = "Georgia, 'Times New Roman', serif";

/* ── 1. The story strip ─────────────────────────────────────────────────── */

export interface CaseSquare { caso: number; state: "done" | "doing" | "credited" | "todo" }

/**
 * The year as 32 squares. A parent has no idea what "Caso 5" means; they do
 * understand five squares filled in out of thirty-two.
 */
export function StoryStrip({ squares, width = 620 }: { squares: CaseSquare[]; width?: number }) {
  const n = squares.length;
  const gap = 2.5;
  const size = Math.min(16, (width - (n - 1) * gap) / n);
  const height = size + 16;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img"
      aria-label={`A strip of ${n} squares, one per case in the year. ${squares.filter((s) => s.state === "done").length} are finished.`}>
      <HatchDefs />
      {squares.map((s, i) => {
        const x = i * (size + gap);
        const fill =
          s.state === "done" ? INK.r900
          : s.state === "doing" ? INK.r500
          : s.state === "credited" ? "url(#hatch45)"
          : INK.surface;
        return (
          <g key={s.caso}>
            <rect x={x} y={0} width={size} height={size} fill={fill}
              stroke={s.state === "todo" ? INK.r150 : INK.r700} strokeWidth="0.8" />
            {(s.caso === 1 || s.caso % 8 === 0 || s.caso === n) && (
              <text x={x + size / 2} y={size + 11} textAnchor="middle" fontSize="7.5" fill={INK.r500} fontFamily={FONT}>
                {s.caso}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── 2. Knew it / learned it ────────────────────────────────────────────── */

export interface KnewLearnedRow { label: string; knew: number; learned: number }

/**
 * The two-number idea as one picture. The hollow dot is what the child got
 * right first time; the solid dot is what they got right eventually; the line
 * between them is how much repetition it took.
 */
export function KnewLearned({ rows, width = 620 }: { rows: KnewLearnedRow[]; width?: number }) {
  const m = { t: 6, r: 42, b: 16, l: 168 };
  const rowH = 17;
  const height = m.t + rows.length * rowH + m.b;
  const w = width - m.l - m.r;
  const px = (v: number) => m.l + (v / 100) * w;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img"
      aria-label="For each topic, how much was right on the first attempt and how much was right eventually.">
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1={px(v)} y1={m.t} x2={px(v)} y2={m.t + rows.length * rowH} stroke={INK.grid} strokeWidth="1" />
          <text x={px(v)} y={height - 4} textAnchor="middle" fontSize="7.5" fill={INK.r500} fontFamily={FONT}>
            {v === 0 ? "none" : v === 100 ? "all of it" : ""}
          </text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = m.t + i * rowH + rowH / 2;
        const a = px(Math.min(r.knew, r.learned));
        const b = px(Math.max(r.knew, r.learned));
        return (
          <g key={r.label}>
            <text x={m.l - 8} y={y + 3} textAnchor="end" fontSize="8.5" fill={INK.r900} fontFamily={FONT}>
              {r.label.length > 34 ? r.label.slice(0, 32) + "…" : r.label}
            </text>
            <line x1={a} y1={y} x2={b} y2={y} stroke={INK.r300} strokeWidth="2" strokeLinecap="round" />
            <circle cx={px(r.knew)} cy={y} r="3" fill={INK.surface} stroke={INK.r700} strokeWidth="1.5" />
            <circle cx={px(r.learned)} cy={y} r="3.8" fill={INK.r900} stroke={INK.surface} strokeWidth="1.2" />
            <text x={px(Math.max(r.knew, r.learned)) + 7} y={y + 3} fontSize="8" fill={INK.r700} fontFamily={FONT}>
              {Math.round(r.learned)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── 4. The mistake mix ─────────────────────────────────────────────────── */

export interface MistakeSlice { label: string; value: number; fill: string }

/** One short bar. Two or three kinds of mistake, labelled on the bar itself. */
export function MistakeMix({ slices, width = 620 }: { slices: MistakeSlice[]; width?: number }) {
  const total = slices.reduce((n, s) => n + s.value, 0) || 1;
  const barH = 26;
  const GAP = 2;
  let x = 0;

  return (
    <svg viewBox={`0 0 ${width} ${barH + 16}`} width="100%" role="img"
      aria-label={`Mistake types: ${slices.map((s) => `${s.label} ${Math.round((s.value / total) * 100)}%`).join(", ")}.`}>
      <HatchDefs />
      {slices.map((s) => {
        const segW = Math.max(0, (s.value / total) * width - GAP);
        const pct = Math.round((s.value / total) * 100);
        const el = (
          <g key={s.label}>
            <rect x={x} y={0} width={segW} height={barH} fill={s.fill} />
            {segW > 92 ? (
              <>
                {/* A label over hatching needs its own ground to stand on,
                    or the stripes run through the letters. */}
                {s.fill.startsWith("url(") && (
                  <rect x={x + segW / 2 - (s.label.length * 2.9 + 16)} y={barH / 2 - 8}
                    width={s.label.length * 5.8 + 32} height={16} rx="2" fill={INK.surface} opacity="0.92" />
                )}
                <text x={x + segW / 2} y={barH / 2 + 4} textAnchor="middle" fontSize="10"
                  fill={s.fill === INK.r900 ? INK.surface : INK.r900} fontFamily={FONT}>
                  {s.label} {pct}%
                </text>
              </>
            ) : segW > 3 ? (
              <text x={x + segW / 2} y={barH + 11} textAnchor="middle" fontSize="8" fill={INK.r700} fontFamily={FONT}>
                {s.label} {pct}%
              </text>
            ) : null}
          </g>
        );
        x += (s.value / total) * width;
        return el;
      })}
    </svg>
  );
}

/* ── 5. The pace marker ─────────────────────────────────────────────────── */

/**
 * Where this child sits on a scale of answer speed, with the class median as
 * a reference tick. Not a rank — a position, with both ends named.
 */
export function PaceMarker({
  seconds,
  classSeconds,
  max,
  name,
  width = 620,
}: {
  seconds: number;
  classSeconds: number;
  max: number;
  name: string;
  width?: number;
}) {
  const m = { l: 8, r: 8 };
  const w = width - m.l - m.r;
  const y = 22;
  const px = (v: number) => m.l + (Math.min(v, max) / max) * w;

  return (
    <svg viewBox={`0 0 ${width} 52`} width="100%" role="img"
      aria-label={`${name} answers in about ${seconds.toFixed(1)} seconds; the class typically takes about ${classSeconds.toFixed(1)} seconds.`}>
      <line x1={m.l} y1={y} x2={m.l + w} y2={y} stroke={INK.r300} strokeWidth="2" strokeLinecap="round" />
      <text x={m.l} y={11} fontSize="8" fill={INK.r500} fontFamily={FONT}>quick</text>
      <text x={m.l + w} y={11} textAnchor="end" fontSize="8" fill={INK.r500} fontFamily={FONT}>takes time</text>

      {/* The class reference: a tick, deliberately quieter than the child */}
      <line x1={px(classSeconds)} y1={y - 7} x2={px(classSeconds)} y2={y + 7} stroke={INK.r500} strokeWidth="1.5" />
      <text x={px(classSeconds)} y={y + 20} textAnchor="middle" fontSize="7.5" fill={INK.r500} fontFamily={FONT}>
        most of the class
      </text>

      <circle cx={px(seconds)} cy={y} r="6" fill={INK.r900} stroke={INK.surface} strokeWidth="2" />
      <text x={px(seconds)} y={y - 11} textAnchor="middle" fontSize="8.5" fill={INK.r900} fontFamily={FONT}>
        {name} · {seconds.toFixed(1)}s
      </text>
    </svg>
  );
}

/* ── 11. Recent growth ──────────────────────────────────────────────────── */

/**
 * Two counts side by side: things learned in the last fortnight and the last
 * month. A count, not a percentage — "learned 23 new words and sentences" is
 * a fact a parent can hold, and unlike an accuracy figure it cannot be pushed
 * down by the material getting harder.
 */
export function GrowthPair({
  learned14,
  learned30,
  days14,
  days30,
}: {
  learned14: number;
  learned30: number;
  days14: number;
  days30: number;
}) {
  const cols: Array<[string, number, number]> = [
    ["In the last 2 weeks", learned14, days14],
    ["In the last month", learned30, days30],
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {cols.map(([label, learned, days]) => (
        <div key={label} className="border border-black px-3 py-2">
          <p className="font-serif text-[9px] uppercase tracking-[0.15em]">{label}</p>
          <p className="font-serif text-[22px] font-bold leading-none mt-1">
            {learned}
            <span className="text-[11px] font-normal"> new things learned</span>
          </p>
          <p className="font-serif text-[9.5px] mt-0.5">
            {days === 0
              ? "No work recorded in this window."
              : `Worked on ${days} ${days === 1 ? "day" : "different days"}.`}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── 10. The at-a-glance strip ──────────────────────────────────────────── */

/** The headline numbers as one band rather than a row of boxes. */
export function GlanceStrip({ items }: { items: Array<[string, string, string]> }) {
  return (
    <div className="border-y-2 border-black divide-x divide-black grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map(([label, value, sub]) => (
        <div key={label} className="px-3 py-1.5">
          <p className="font-serif text-[8.5px] uppercase tracking-[0.12em] leading-tight">{label}</p>
          <p className="font-serif text-[17px] font-bold leading-tight">{value}</p>
          <p className="font-serif text-[8.5px] leading-tight">{sub}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Shared: a figure with its explanation beside it ────────────────────── */

/**
 * The two-column unit the data page is built from: the chart on the left,
 * and on the right what it is, how to read it, and what it means for you.
 * The third line is the one parents actually act on, so it is always there
 * — and when the answer is "nothing", it says so rather than inventing a
 * task.
 */
export function ParentFigure({
  title,
  howToRead,
  meaning,
  children,
  wide,
}: {
  title: string;
  howToRead: string;
  meaning: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="break-inside-avoid mb-3.5">
      <h3 className="font-serif text-[11.5px] font-bold border-b border-black pb-0.5 mb-1.5">{title}</h3>
      <div className={wide ? "" : "grid grid-cols-[1fr_200px] gap-3 items-start"}>
        <div>{children}</div>
        <div className={wide ? "mt-1" : ""}>
          <p className="font-serif text-[9.5px] leading-snug mb-1">{howToRead}</p>
          <p className="font-serif text-[9.5px] leading-snug">
            <b>What it means for you: </b>{meaning}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Shown in place of a chart when a child has not generated enough data yet. */
export function NotEnoughYet({ what }: { what: string }) {
  return (
    <div className="border border-dashed border-black px-3 py-3">
      <p className="font-serif text-[10px] italic">{what}</p>
    </div>
  );
}
