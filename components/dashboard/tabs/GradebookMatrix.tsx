"use client";

import { useClassData } from "@/lib/hooks/useClassData";
import { Loading } from "./OverviewTab";
import { weekLabel, type CaseCell, type WeekCell } from "@/lib/gradebook/breakdown";

/**
 * The two views a teacher needs at a grading deadline: how each student did on
 * each case, and what each student did each week.
 *
 * Both are matrices — students down, cases or weeks across — because the whole
 * value is scanning a column ("everyone bombed Caso 7") or a row ("this student
 * stopped in October"). A per-student drill-down cannot show either.
 *
 * Cells are deliberately not just a percentage. A blank cell and a 40% mean
 * completely different things (never opened it vs tried and struggled), and a
 * gradebook that renders both as "low" sends the teacher to reteach for the
 * wrong reason. Blank stays visibly blank.
 */

interface BreakdownRow {
  studentId: string;
  displayName: string;
  cases: CaseCell[];
  weeks: WeekCell[];
}
interface CaseLabel { unitNumber: number; country: string; title: string }
interface BreakdownData {
  rows: BreakdownRow[];
  unitNumbers: number[];
  caseLabels: CaseLabel[];
  weeks: string[];
  truncated: boolean;
}

function cellColor(pct: number) {
  return pct >= 78 ? "#5a9e6f" : pct >= 55 ? "#c9933a" : pct >= 30 ? "#e8b455" : "#c0392b";
}

/** Faint background so a column reads as a heat strip without shouting. */
function cellBg(pct: number) {
  const c = cellColor(pct);
  return `${c}1f`;
}

const TH = "font-typewriter text-[9px] tracking-[0.15em] uppercase text-[#8b7355] px-2 py-2 whitespace-nowrap";
const STICKY = "sticky left-0 z-10 bg-[#0d0f15]";

export default function GradebookMatrix({ classId, mode }: { classId: string; mode: "cases" | "weeks" }) {
  const { data, loading } = useClassData<BreakdownData>("/api/teacher/dashboard/breakdown", classId);

  if (loading && !data) return <Loading />;
  const rows = data?.rows ?? [];
  const caseLabels = data?.caseLabels ?? [];
  const weeks = data?.weeks ?? [];

  const empty = mode === "cases" ? caseLabels.length === 0 : weeks.length === 0;
  if (rows.length === 0 || empty) {
    return (
      <div className="h-40 flex items-center justify-center border border-[rgba(201,147,58,0.12)] px-6">
        <p className="font-typewriter text-xs text-[#4a3a2a] text-center">
          {rows.length === 0
            ? "No students yet."
            : "No recorded work yet — this fills in as students finish activities."}
        </p>
      </div>
    );
  }

  // Column averages: the "which lesson landed badly" read, computed only over
  // students who actually attempted it so a case nobody has reached yet does not
  // read as a class-wide failure.
  const colAvg = (i: number): number | null => {
    const vals = rows
      .map((r) => (mode === "cases" ? r.cases[i]?.pct : r.weeks[i]?.pct))
      .filter((v): v is number => typeof v === "number");
    if (!vals.length) return null;
    return Math.round(vals.reduce((t, v) => t + v, 0) / vals.length);
  };

  const colCount = mode === "cases" ? caseLabels.length : weeks.length;

  return (
    <div className="space-y-3">
      <div className="border border-[rgba(201,147,58,0.15)] bg-[rgba(201,147,58,0.04)] px-4 py-3">
        <p className="font-typewriter text-[10px] text-[#8b7355] leading-relaxed">
          {mode === "cases" ? (
            <>
              Each cell is that student&apos;s <span className="text-[#c4a882]">best</span> work on that case —
              best attempt at each activity, averaged. Replaying to improve raises it, which is what students are
              promised. <span className="text-[#c4a882]">✓</span> means the case was solved;
              a number with no ✓ means they worked on it but never closed it.
              Blank means never attempted — which is not the same as a low score.
            </>
          ) : (
            <>
              Each cell is raw accuracy on the work that student completed <span className="text-[#c4a882]">during that week</span>,
              so a finished week never changes afterwards. This is the column to copy into the district gradebook.
              It will differ from the case view, which shows their best work after replays — different question,
              different number. Blank means no work recorded that week.
            </>
          )}
        </p>
      </div>

      {data?.truncated && (
        <p className="font-typewriter text-[10px] text-[#c0392b] px-1">
          Showing the most recent 20,000 attempts — older work is not included in these totals.
        </p>
      )}

      <div className="overflow-x-auto border border-[rgba(201,147,58,0.12)]">
        <table className="border-collapse">
          <thead>
            <tr className="bg-[#0d0f15] text-left">
              <th className={`${TH} ${STICKY} min-w-[9rem]`}>Student</th>
              {mode === "cases"
                ? caseLabels.map((c) => (
                    <th key={c.unitNumber} className={`${TH} text-center`} title={`${c.title} · ${c.country}`}>
                      <div className="text-[#c4a882]">C{c.unitNumber}</div>
                      <div className="text-[8px] text-[#4a3a2a] font-normal normal-case tracking-normal">{c.country}</div>
                    </th>
                  ))
                : weeks.map((w) => (
                    <th key={w} className={`${TH} text-center`} title={`Week of ${w}`}>
                      {weekLabel(w)}
                    </th>
                  ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.studentId} className="border-t border-[rgba(201,147,58,0.08)] hover:bg-[rgba(201,147,58,0.03)]">
                <td className={`px-2 py-2 font-typewriter text-xs text-[#f5e6c8] whitespace-nowrap ${STICKY}`}>
                  {r.displayName}
                </td>

                {Array.from({ length: colCount }).map((_, i) => {
                  const cell = mode === "cases" ? r.cases[i] : r.weeks[i];
                  const pct = cell?.pct ?? null;
                  const key = `${r.studentId}:${i}`;

                  if (pct === null) {
                    return (
                      <td key={key} className="px-2 py-2 text-center">
                        <span className="font-typewriter text-[10px] text-[#332a24]">·</span>
                      </td>
                    );
                  }

                  const isCase = mode === "cases";
                  const c = cell as CaseCell & WeekCell;
                  const tip = isCase
                    ? `${c.attempts} attempt${c.attempts === 1 ? "" : "s"} across ${c.activities} activit${c.activities === 1 ? "y" : "ies"}` +
                      (c.solved ? " · case solved" : " · not solved") +
                      (c.coldSolved ? " · cold case done" : "")
                    : `${c.attempts} activit${c.attempts === 1 ? "y" : "ies"}` +
                      (c.minutes ? ` · ${c.minutes} min` : "") +
                      (c.unitNumbers.length ? ` · cases ${c.unitNumbers.join(", ")}` : "");

                  return (
                    <td
                      key={key}
                      title={tip}
                      className="px-2 py-2 text-center"
                      style={{ background: cellBg(pct) }}
                    >
                      <span className="font-typewriter text-[11px] tabular-nums" style={{ color: cellColor(pct) }}>
                        {pct}
                      </span>
                      {isCase && c.solved && <span className="font-typewriter text-[9px] text-[#5a9e6f] ml-0.5">✓</span>}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Class average per column — the reteach signal. */}
            <tr className="border-t-2 border-[rgba(201,147,58,0.25)] bg-[#0d0f15]">
              <td className={`px-2 py-2 font-typewriter text-[9px] tracking-[0.15em] uppercase text-[#8b7355] ${STICKY}`}>
                Class avg
              </td>
              {Array.from({ length: colCount }).map((_, i) => {
                const avg = colAvg(i);
                return (
                  <td key={i} className="px-2 py-2 text-center">
                    {avg === null ? (
                      <span className="font-typewriter text-[10px] text-[#332a24]">·</span>
                    ) : (
                      <span className="font-typewriter text-[11px] tabular-nums font-bold" style={{ color: cellColor(avg) }}>
                        {avg}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
