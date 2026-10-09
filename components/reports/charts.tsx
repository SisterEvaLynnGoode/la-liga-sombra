/**
 * Charts for the printed admin report.
 *
 * These are built against print, not a dashboard, and that changes most of the
 * usual rules:
 *
 *   • No hover, no tooltip. A PDF has no pointer, so nothing may be reachable
 *     only by hovering. Every chart here ships beside a data table that carries
 *     the same numbers, which is also what makes the report readable by a
 *     machine — a language model fed the PDF reads the table, not the shapes.
 *   • No colour as the identity channel. The report will be photocopied. Marks
 *     are steps of ONE validated ink ramp, separated by position, 45°/135°
 *     texture and direct labels, so nothing depends on hue survival.
 *   • Inline SVG, no chart library. Canvas-based libraries print as blank
 *     boxes, and a JS library's text does not survive PDF text extraction.
 *     SVG <text> does, so axis labels and values stay selectable and readable.
 *
 * The ink ramp passed the ordinal checks in the dataviz validator (monotone
 * lightness, >= 0.06 lightness gaps, single hue, light end 2.02:1 on white).
 */

export const INK = {
  /** Validated ordinal ramp, darkest to lightest. */
  r900: "#121212",
  r700: "#4d4d4d",
  r500: "#7a7a7a",
  r300: "#9c9c9c",
  r150: "#b4b4b4",
  /** Chrome, not data: hairline grid and axis rules. */
  grid: "#dcdcdc",
  surface: "#ffffff",
} as const;

const FONT = "Georgia, 'Times New Roman', serif";

/* ══════════════════════════════════════════════════════════════════════════
   Shared pieces
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * One figure: heading, the finding in a sentence, the chart, then the table.
 *
 * The order matters for the machine reader. Text extraction from a PDF is
 * top-to-bottom, so a model meets the heading, then the claim, then the
 * evidence — in the order a person reads them too.
 */
export function Figure({
  number,
  title,
  finding,
  howToRead,
  children,
  table,
}: {
  number: number;
  title: string;
  finding: string;
  howToRead: string;
  children: React.ReactNode;
  table: React.ReactNode;
}) {
  return (
    <figure className="m-0 mb-7 break-inside-avoid">
      <h3 className="font-serif text-[13px] font-bold uppercase tracking-[0.12em] border-b border-black pb-1 mb-2">
        Figure {number}. {title}
      </h3>
      <p className="font-serif text-[11.5px] leading-snug mb-1">
        <b>Finding:</b> {finding}
      </p>
      <p className="font-serif text-[10px] leading-snug italic mb-2">How to read it: {howToRead}</p>
      <div className="mb-2">{children}</div>
      <figcaption className="font-serif text-[9px] uppercase tracking-[0.2em] mb-1">
        Figure {number} — the same data as a table
      </figcaption>
      {table}
    </figure>
  );
}

/** The table twin every chart carries. Plain, so extraction keeps the columns. */
export function DataTable({
  columns,
  rows,
  note,
}: {
  columns: string[];
  rows: Array<Array<string | number>>;
  note?: string;
}) {
  return (
    <>
      <table className="w-full border-collapse font-serif text-[9.5px]">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={c} className={`border border-black px-1.5 py-0.5 ${i === 0 ? "text-left" : "text-center"}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className={`border border-black px-1.5 py-0.5 ${j === 0 ? "text-left" : "text-center tabular-nums"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="font-serif text-[9px] italic mt-1">{note}</p>}
    </>
  );
}

/** 45°/135° hatch fills — the identity channel once colour is gone. */
export function HatchDefs() {
  return (
    <defs>
      <pattern id="hatch45" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill={INK.surface} />
        <line x1="0" y1="0" x2="0" y2="6" stroke={INK.r500} strokeWidth="2.4" />
      </pattern>
      <pattern id="hatch135" width="6" height="6" patternTransform="rotate(135)" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill={INK.surface} />
        <line x1="0" y1="0" x2="0" y2="6" stroke={INK.r300} strokeWidth="2.2" />
      </pattern>
      <pattern id="hatchDot" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill={INK.surface} />
        <circle cx="2.5" cy="2.5" r="1" fill={INK.r300} />
      </pattern>
    </defs>
  );
}

function Legend({ items }: { items: Array<{ label: string; fill: string }> }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-1">
      {items.map((it) => (
        <span key={it.label} className="font-serif text-[9.5px] flex items-center gap-1.5">
          <svg width="12" height="10" aria-hidden="true">
            <HatchDefs />
            <rect width="12" height="10" fill={it.fill} stroke={INK.r700} strokeWidth="0.5" />
          </svg>
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   1. Mastery vs first-try scatter, with named quadrants
   ══════════════════════════════════════════════════════════════════════════ */

export interface ScatterPoint { label: string; x: number; y: number }

export function QuadrantScatter({
  points,
  xLabel,
  yLabel,
  xSplit = 70,
  ySplit = 80,
  xMax = 100,
  xTicks,
  xFmt = (v) => `${v}%`,
  quadrants,
  width = 700,
  height = 420,
}: {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  xSplit?: number;
  ySplit?: number;
  /** The x domain, when it is not a percentage (e.g. seconds). */
  xMax?: number;
  xTicks?: number[];
  xFmt?: (v: number) => string;
  /** Clockwise from top-left: TL, TR, BR, BL. */
  quadrants: [string, string, string, string];
  width?: number;
  height?: number;
}) {
  const m = { t: 16, r: 16, b: 42, l: 50 };
  const w = width - m.l - m.r;
  const h = height - m.t - m.b;
  const px = (v: number) => m.l + (Math.min(v, xMax) / xMax) * w;
  const py = (v: number) => m.t + h - (v / 100) * h;
  const xTickValues = xTicks ?? [0, 20, 40, 60, 80, 100].map((f) => (f / 100) * xMax);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img"
      aria-label={`Scatter plot of ${yLabel} against ${xLabel}, one point per student. The table below carries every value.`}>
      <HatchDefs />
      {/* Grid: solid hairlines, one step off the surface */}
      {[0, 20, 40, 60, 80, 100].map((v) => (
        <g key={`y${v}`}>
          <line x1={m.l} y1={py(v)} x2={m.l + w} y2={py(v)} stroke={INK.grid} strokeWidth="1" />
          <text x={m.l - 6} y={py(v) + 3} textAnchor="end" fontSize="9" fill={INK.r700} fontFamily={FONT}>{v}%</text>
        </g>
      ))}
      {xTickValues.map((v) => (
        <g key={`x${v}`}>
          <line x1={px(v)} y1={m.t} x2={px(v)} y2={m.t + h} stroke={INK.grid} strokeWidth="1" />
          <text x={px(v)} y={m.t + h + 14} textAnchor="middle" fontSize="9" fill={INK.r700} fontFamily={FONT}>{xFmt(v)}</text>
        </g>
      ))}

      {/* The two split lines, drawn heavier than the grid because they carry meaning */}
      <line x1={px(xSplit)} y1={m.t} x2={px(xSplit)} y2={m.t + h} stroke={INK.r700} strokeWidth="1.5" />
      <line x1={m.l} y1={py(ySplit)} x2={m.l + w} y2={py(ySplit)} stroke={INK.r700} strokeWidth="1.5" />

      {/* Quadrant names, set in the corners so they never sit under the points */}
      <text x={m.l + 6} y={m.t + 13} fontSize="9.5" fill={INK.r500} fontFamily={FONT} fontStyle="italic">{quadrants[0]}</text>
      <text x={m.l + w - 6} y={m.t + 13} textAnchor="end" fontSize="9.5" fill={INK.r500} fontFamily={FONT} fontStyle="italic">{quadrants[1]}</text>
      <text x={m.l + w - 6} y={m.t + h - 6} textAnchor="end" fontSize="9.5" fill={INK.r500} fontFamily={FONT} fontStyle="italic">{quadrants[2]}</text>
      <text x={m.l + 6} y={m.t + h - 6} fontSize="9.5" fill={INK.r500} fontFamily={FONT} fontStyle="italic">{quadrants[3]}</text>

      {/* Points. 2px surface ring so overlapping students stay countable.
          A point past the axis is drawn as a hollow triangle at the edge rather
          than clamped to a filled dot, so an outlier is never read as a value
          it does not have. */}
      {points.map((p, i) =>
        p.x > xMax ? (
          <polygon key={i}
            points={`${m.l + w - 1},${py(p.y)} ${m.l + w - 9},${py(p.y) - 4.5} ${m.l + w - 9},${py(p.y) + 4.5}`}
            fill={INK.surface} stroke={INK.r900} strokeWidth="1.5" />
        ) : (
          <circle key={i} cx={px(p.x)} cy={py(p.y)} r="4.5"
            fill={INK.r900} stroke={INK.surface} strokeWidth="2" />
        )
      )}

      <text x={m.l + w / 2} y={height - 6} textAnchor="middle" fontSize="10" fill={INK.r900} fontFamily={FONT}>{xLabel}</text>
      <text x={12} y={m.t + h / 2} textAnchor="middle" fontSize="10" fill={INK.r900} fontFamily={FONT}
        transform={`rotate(-90 12 ${m.t + h / 2})`}>{yLabel}</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   2. Dumbbell — first-try to mastery, per topic
   ══════════════════════════════════════════════════════════════════════════ */

export interface DumbbellRow { label: string; from: number; to: number; sub?: string }

export function Dumbbell({
  rows,
  fromLabel,
  toLabel,
  target,
  width = 700,
}: {
  rows: DumbbellRow[];
  fromLabel: string;
  toLabel: string;
  target?: number;
  width?: number;
}) {
  const m = { t: 10, r: 46, b: 30, l: 252 };
  const rowH = 20;
  const height = m.t + rows.length * rowH + m.b;
  const w = width - m.l - m.r;
  const px = (v: number) => m.l + (v / 100) * w;

  return (
    <>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-1">
        <span className="font-serif text-[9.5px] flex items-center gap-1.5">
          <svg width="12" height="10" aria-hidden="true"><circle cx="6" cy="5" r="3" fill={INK.surface} stroke={INK.r700} strokeWidth="1.5" /></svg>
          {fromLabel}
        </span>
        <span className="font-serif text-[9.5px] flex items-center gap-1.5">
          <svg width="12" height="10" aria-hidden="true"><circle cx="6" cy="5" r="4" fill={INK.r900} /></svg>
          {toLabel}
        </span>
        {target != null && (
          <span className="font-serif text-[9.5px] flex items-center gap-1.5">
            <svg width="12" height="10" aria-hidden="true"><line x1="6" y1="0" x2="6" y2="10" stroke={INK.r700} strokeWidth="1.5" /></svg>
            target {target}%
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img"
        aria-label={`Dumbbell chart: ${fromLabel} to ${toLabel} for each topic, weakest first. The table below carries every value.`}>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={px(v)} y1={m.t} x2={px(v)} y2={m.t + rows.length * rowH} stroke={INK.grid} strokeWidth="1" />
            <text x={px(v)} y={height - m.b + 20} textAnchor="middle" fontSize="9" fill={INK.r700} fontFamily={FONT}>{v}%</text>
          </g>
        ))}
        {target != null && (
          <line x1={px(target)} y1={m.t} x2={px(target)} y2={m.t + rows.length * rowH} stroke={INK.r700} strokeWidth="1.5" />
        )}

        {rows.map((r, i) => {
          const y = m.t + i * rowH + rowH / 2;
          const a = px(Math.min(r.from, r.to));
          const b = px(Math.max(r.from, r.to));
          return (
            <g key={r.label}>
              <text x={m.l - 8} y={y + 3} textAnchor="end" fontSize="9" fill={INK.r900} fontFamily={FONT}>
                {r.label.length > 50 ? r.label.slice(0, 48) + "…" : r.label}
              </text>
              <line x1={a} y1={y} x2={b} y2={y} stroke={INK.r300} strokeWidth="2" strokeLinecap="round" />
              <circle cx={px(r.from)} cy={y} r="3.2" fill={INK.surface} stroke={INK.r700} strokeWidth="1.6" />
              <circle cx={px(r.to)} cy={y} r="4" fill={INK.r900} stroke={INK.surface} strokeWidth="1.5" />
              <text x={px(Math.max(r.from, r.to)) + 8} y={y + 3} fontSize="8.5" fill={INK.r700} fontFamily={FONT}>
                {Math.round(r.to)}%
              </text>
            </g>
          );
        })}
      </svg>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   3 & 6. Horizontal stacked bar — part-to-whole
   ══════════════════════════════════════════════════════════════════════════ */

export interface StackSegment { label: string; value: number; fill: string }

export function StackedBar({
  segments,
  width = 700,
  unit = "",
}: {
  segments: StackSegment[];
  width?: number;
  unit?: string;
}) {
  const total = segments.reduce((n, s) => n + s.value, 0) || 1;
  const barH = 40;
  const height = barH + 26;
  const GAP = 2; // the surface gap does the separating, not a stroke
  let x = 0;

  return (
    <>
      <Legend items={segments.map((s) => ({ label: `${s.label} — ${s.value}${unit} (${Math.round((s.value / total) * 100)}%)`, fill: s.fill }))} />
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img"
        aria-label={`Stacked bar: ${segments.map((s) => `${s.label} ${s.value}`).join(", ")}. The table below carries every value.`}>
        <HatchDefs />
        {segments.map((s) => {
          const segW = Math.max(0, (s.value / total) * width - GAP);
          const el = (
            <g key={s.label}>
              <rect x={x} y={0} width={segW} height={barH} fill={s.fill} />
              {/* Only label inside the segment when the text genuinely fits. */}
              {segW > 64 && (
                <text x={x + segW / 2} y={barH / 2 + 4} textAnchor="middle" fontSize="11"
                  fill={s.fill === INK.r900 || s.fill === INK.r700 ? INK.surface : INK.r900} fontFamily={FONT}>
                  {Math.round((s.value / total) * 100)}%
                </text>
              )}
              {segW <= 64 && segW > 2 && (
                <text x={x + segW / 2} y={barH + 14} textAnchor="middle" fontSize="8.5" fill={INK.r700} fontFamily={FONT}>
                  {Math.round((s.value / total) * 100)}%
                </text>
              )}
            </g>
          );
          x += (s.value / total) * width;
          return el;
        })}
      </svg>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   4. Emphasis line — the class against its own students, by case number
   ══════════════════════════════════════════════════════════════════════════ */

export interface Series { key: string; points: Array<{ x: number; y: number }> }

export function EmphasisLines({
  faint,
  bold,
  boldLabel,
  xLabel,
  yLabel,
  width = 700,
  height = 300,
}: {
  faint: Series[];
  bold: Array<{ x: number; y: number }>;
  boldLabel: string;
  xLabel: string;
  yLabel: string;
  width?: number;
  height?: number;
}) {
  const m = { t: 14, r: 70, b: 40, l: 44 };
  const w = width - m.l - m.r;
  const h = height - m.t - m.b;
  const xs = bold.map((p) => p.x);
  const xMin = Math.min(...xs, 1);
  const xMax = Math.max(...xs, 2);
  const px = (v: number) => m.l + ((v - xMin) / Math.max(1, xMax - xMin)) * w;
  const py = (v: number) => m.t + h - (v / 100) * h;
  const path = (pts: Array<{ x: number; y: number }>) =>
    pts.map((p, i) => `${i ? "L" : "M"}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(" ");

  const last = bold[bold.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img"
      aria-label={`Line chart of ${yLabel} by ${xLabel}. The bold line is ${boldLabel}; faint lines are individual students. The table below carries every value.`}>
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={m.l} y1={py(v)} x2={m.l + w} y2={py(v)} stroke={INK.grid} strokeWidth="1" />
          <text x={m.l - 6} y={py(v) + 3} textAnchor="end" fontSize="9" fill={INK.r700} fontFamily={FONT}>{v}%</text>
        </g>
      ))}
      {Array.from(new Set(xs)).sort((a, b) => a - b).map((v) => (
        <text key={v} x={px(v)} y={m.t + h + 14} textAnchor="middle" fontSize="9" fill={INK.r700} fontFamily={FONT}>{v}</text>
      ))}

      {/* Context first, so the class line sits on top of it */}
      {faint.map((s) => (
        <path key={s.key} d={path(s.points)} fill="none" stroke={INK.r150} strokeWidth="1" strokeLinejoin="round" />
      ))}
      <path d={path(bold)} fill="none" stroke={INK.r900} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {bold.map((p) => (
        <circle key={p.x} cx={px(p.x)} cy={py(p.y)} r="4" fill={INK.r900} stroke={INK.surface} strokeWidth="2" />
      ))}
      {/* One direct label, at the end, as the reference asks */}
      {last && (
        <text x={px(last.x) + 9} y={py(last.y) + 3} fontSize="9.5" fill={INK.r900} fontFamily={FONT}>
          {boldLabel} {Math.round(last.y)}%
        </text>
      )}

      <text x={m.l + w / 2} y={height - 6} textAnchor="middle" fontSize="10" fill={INK.r900} fontFamily={FONT}>{xLabel}</text>
      <text x={11} y={m.t + h / 2} textAnchor="middle" fontSize="10" fill={INK.r900} fontFamily={FONT}
        transform={`rotate(-90 11 ${m.t + h / 2})`}>{yLabel}</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   5. Column stack — one column per case
   ══════════════════════════════════════════════════════════════════════════ */

export interface StackColumn { label: string; parts: number[] }

export function StackedColumns({
  columns,
  seriesLabels,
  fills,
  total,
  xLabel,
  width = 700,
  height = 276,
}: {
  columns: StackColumn[];
  seriesLabels: string[];
  fills: string[];
  total: number;
  xLabel?: string;
  width?: number;
  height?: number;
}) {
  const m = { t: 10, r: 12, b: 50, l: 34 };
  const w = width - m.l - m.r;
  const h = height - m.t - m.b;
  const band = w / Math.max(1, columns.length);
  const barW = Math.min(24, band - 4); // capped; the leftover is air
  const GAP = 2;

  return (
    <>
      <Legend items={seriesLabels.map((l, i) => ({ label: l, fill: fills[i] }))} />
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img"
        aria-label={`Stacked columns, one per case, showing how many of the ${total} students are at each state. The table below carries every value.`}>
        <HatchDefs />
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={m.l} y1={m.t + h - f * h} x2={m.l + w} y2={m.t + h - f * h} stroke={INK.grid} strokeWidth="1" />
            <text x={m.l - 5} y={m.t + h - f * h + 3} textAnchor="end" fontSize="8.5" fill={INK.r700} fontFamily={FONT}>
              {Math.round(f * total)}
            </text>
          </g>
        ))}
        {columns.map((c, ci) => {
          const x = m.l + ci * band + (band - barW) / 2;
          let yTop = m.t + h;
          return (
            <g key={c.label}>
              {c.parts.map((v, si) => {
                const segH = Math.max(0, (v / total) * h - GAP);
                yTop -= (v / total) * h;
                return v > 0 ? (
                  <rect key={si} x={x} y={yTop + GAP} width={barW} height={segH} fill={fills[si]} />
                ) : null;
              })}
              <text x={x + barW / 2} y={m.t + h + 13} textAnchor="middle" fontSize="8.5" fill={INK.r700} fontFamily={FONT}>
                {c.label}
              </text>
            </g>
          );
        })}
        {xLabel && (
          <text x={m.l + w / 2} y={height - 6} textAnchor="middle" fontSize="10" fill={INK.r900} fontFamily={FONT}>
            {xLabel}
          </text>
        )}
      </svg>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   7. Box plot — distribution per group
   ══════════════════════════════════════════════════════════════════════════ */

export interface BoxStats { label: string; n: number; min: number; q1: number; median: number; q3: number; max: number }

export function quartiles(values: number[]): Omit<BoxStats, "label"> | null {
  if (!values.length) return null;
  const v = [...values].sort((a, b) => a - b);
  const at = (p: number) => {
    const i = (v.length - 1) * p;
    const lo = Math.floor(i), hi = Math.ceil(i);
    return lo === hi ? v[lo] : v[lo] + (v[hi] - v[lo]) * (i - lo);
  };
  return { n: v.length, min: v[0], q1: at(0.25), median: at(0.5), q3: at(0.75), max: v[v.length - 1] };
}

export function BoxPlot({ boxes, width = 700, height = 260 }: { boxes: BoxStats[]; width?: number; height?: number }) {
  const m = { t: 12, r: 14, b: 44, l: 44 };
  const w = width - m.l - m.r;
  const h = height - m.t - m.b;
  const band = w / Math.max(1, boxes.length);
  const boxW = Math.min(46, band - 18);
  const py = (v: number) => m.t + h - (v / 100) * h;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img"
      aria-label="Box plot of score distribution per assessment. The table below carries every value.">
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={m.l} y1={py(v)} x2={m.l + w} y2={py(v)} stroke={INK.grid} strokeWidth="1" />
          <text x={m.l - 5} y={py(v) + 3} textAnchor="end" fontSize="9" fill={INK.r700} fontFamily={FONT}>{v}%</text>
        </g>
      ))}
      {boxes.map((b, i) => {
        const cx = m.l + i * band + band / 2;
        return (
          <g key={b.label}>
            <line x1={cx} y1={py(b.max)} x2={cx} y2={py(b.q3)} stroke={INK.r700} strokeWidth="1.2" />
            <line x1={cx} y1={py(b.q1)} x2={cx} y2={py(b.min)} stroke={INK.r700} strokeWidth="1.2" />
            <line x1={cx - 8} y1={py(b.max)} x2={cx + 8} y2={py(b.max)} stroke={INK.r700} strokeWidth="1.2" />
            <line x1={cx - 8} y1={py(b.min)} x2={cx + 8} y2={py(b.min)} stroke={INK.r700} strokeWidth="1.2" />
            <rect x={cx - boxW / 2} y={py(b.q3)} width={boxW} height={Math.max(2, py(b.q1) - py(b.q3))}
              fill="url(#hatch135)" stroke={INK.r700} strokeWidth="1" />
            <line x1={cx - boxW / 2} y1={py(b.median)} x2={cx + boxW / 2} y2={py(b.median)} stroke={INK.r900} strokeWidth="2.5" />
            <text x={cx + boxW / 2 + 5} y={py(b.median) + 3} fontSize="8.5" fill={INK.r900} fontFamily={FONT}>
              {Math.round(b.median)}%
            </text>
            <text x={cx} y={m.t + h + 14} textAnchor="middle" fontSize="8.5" fill={INK.r900} fontFamily={FONT}>
              {b.label}
            </text>
            <text x={cx} y={m.t + h + 25} textAnchor="middle" fontSize="8" fill={INK.r500} fontFamily={FONT}>
              n={b.n}
            </text>
          </g>
        );
      })}
      <HatchDefs />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   9. Heatmap — topics down, students across
   ══════════════════════════════════════════════════════════════════════════ */

/** Five bins, so adjacent classes stay distinguishable in print. */
export function heatFill(pct: number | null): string {
  if (pct == null) return "url(#hatchDot)";
  if (pct >= 90) return INK.r150;
  if (pct >= 75) return INK.r300;
  if (pct >= 50) return INK.r500;
  if (pct >= 25) return INK.r700;
  return INK.r900;
}

export function Heatmap({
  rowLabels,
  colLabels,
  values,
  width = 700,
}: {
  rowLabels: string[];
  colLabels: string[];
  /** values[row][col] — null for "has not met this topic". */
  values: Array<Array<number | null>>;
  width?: number;
}) {
  const m = { t: 86, r: 8, b: 8, l: 196 };
  const cell = Math.max(6, Math.min(16, (width - m.l - m.r) / Math.max(1, colLabels.length)));
  const rowH = 15;
  const height = m.t + rowLabels.length * rowH + m.b;
  const GAP = 1.5;

  return (
    <>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-1">
        {[["Under 25%", INK.r900], ["25–49%", INK.r700], ["50–74%", INK.r500], ["75–89%", INK.r300], ["90%+", INK.r150], ["not met", "url(#hatchDot)"]].map(([label, fill]) => (
          <span key={label} className="font-serif text-[9px] flex items-center gap-1">
            <svg width="11" height="9" aria-hidden="true"><HatchDefs /><rect width="11" height="9" fill={fill} stroke={INK.grid} strokeWidth="0.5" /></svg>
            {label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img"
        aria-label="Heatmap of mastery, one row per topic and one column per student. Darker is weaker. The table below carries the per-topic figures.">
        <HatchDefs />
        {colLabels.map((c, ci) => (
          <text key={c + ci} x={m.l + ci * cell + cell / 2} y={m.t - 6} fontSize="7.5" fill={INK.r700} fontFamily={FONT}
            transform={`rotate(-60 ${m.l + ci * cell + cell / 2} ${m.t - 6})`} textAnchor="start">
            {c.length > 13 ? c.slice(0, 12) + "…" : c}
          </text>
        ))}
        {rowLabels.map((r, ri) => (
          <g key={r}>
            <text x={m.l - 6} y={m.t + ri * rowH + rowH / 2 + 3} textAnchor="end" fontSize="8.5" fill={INK.r900} fontFamily={FONT}>
              {r.length > 38 ? r.slice(0, 36) + "…" : r}
            </text>
            {colLabels.map((_, ci) => (
              <rect key={ci} x={m.l + ci * cell} y={m.t + ri * rowH}
                width={cell - GAP} height={rowH - GAP} fill={heatFill(values[ri]?.[ci] ?? null)} />
            ))}
          </g>
        ))}
      </svg>
    </>
  );
}
