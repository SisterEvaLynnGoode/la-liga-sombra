"use client";

import { useState, useEffect, useCallback } from "react";
import { TabHeader, Empty } from "./OverviewTab";
import { ARCS, SEMESTER, ALL_TASK_IDS, type WeekType } from "@/lib/pacing/plan";

const TYPE_META: Record<WeekType, { label: string; color: string }> = {
  unit:      { label: "Unit",      color: "#c9933a" },
  review:    { label: "Review",    color: "#8b7355" },
  milestone: { label: "Milestone", color: "#5a9e6f" },
  boss:      { label: "Boss",      color: "#c0392b" },
  capstone:  { label: "Capstone",  color: "#4a9eff" },
};

function storageKey(classId: string) {
  return `lls-pacing-${classId}`;
}

export default function PacingTab({ classId }: { classId: string }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  // Load this class's progress from localStorage
  useEffect(() => {
    if (!classId) return;
    try {
      const raw = localStorage.getItem(storageKey(classId));
      setDone(raw ? (JSON.parse(raw) as Record<string, boolean>) : {});
    } catch {
      setDone({});
    }
    setLoaded(true);
  }, [classId]);

  const persist = useCallback(
    (next: Record<string, boolean>) => {
      setDone(next);
      try {
        localStorage.setItem(storageKey(classId), JSON.stringify(next));
      } catch { /* ignore quota/availability errors */ }
    },
    [classId]
  );

  function toggleTask(id: string) {
    persist({ ...done, [id]: !done[id] });
  }

  function toggleWeek(weekTaskIds: string[], complete: boolean) {
    const next = { ...done };
    for (const id of weekTaskIds) next[id] = complete;
    persist(next);
  }

  function resetAll() {
    if (typeof window !== "undefined" && !window.confirm("Reset all pacing progress for this class?")) return;
    persist({});
  }

  if (!classId) return <Empty />;

  const totalDone = ALL_TASK_IDS.filter((id) => done[id]).length;
  const pct = Math.round((totalDone / ALL_TASK_IDS.length) * 100);

  // Which week is "current" = first week not fully complete
  const currentWeek = SEMESTER.find((w) => !w.tasks.every((t) => done[t.id]))?.week ?? null;

  return (
    <div className="space-y-5">
      <TabHeader title="18-Week Pacing Plan" lastUpdated={null} onRefresh={resetAll} />

      {/* Progress summary */}
      <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">
            Semester progress
          </p>
          <p className="font-typewriter text-xs text-[#8b7355]">
            {currentWeek != null ? `Now on Week ${currentWeek}` : "Semester complete 🎉"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-[#2c2220] rounded-full overflow-hidden">
            <div className="h-full bg-[#c9933a] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-typewriter text-sm font-bold text-[#e8b455] shrink-0">{pct}%</span>
        </div>
        <p className="font-typewriter text-[10px] text-[#4a3a2a] mt-1">
          {totalDone} / {ALL_TASK_IDS.length} tasks · check items off as you teach. Progress is saved in this browser, per class.
        </p>
      </div>

      {/* Arcs + weeks */}
      {ARCS.map((arc) => {
        const weeks = SEMESTER.filter((w) => w.arc === arc.n);
        return (
          <div key={arc.n} className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-[rgba(201,147,58,0.12)] pb-1">
              <h3 className="font-display font-bold text-[#f5e6c8]">
                Arc {arc.n} · {arc.title}
              </h3>
              <span className="font-typewriter text-[10px] text-[#8b7355]">{arc.weeks} · {arc.band}</span>
            </div>

            {weeks.map((w) => {
              const ids = w.tasks.map((t) => t.id);
              const weekDone = ids.filter((id) => done[id]).length;
              const allDone = weekDone === ids.length;
              const isCurrent = w.week === currentWeek;
              const meta = TYPE_META[w.type];

              return (
                <div
                  key={w.week}
                  className={`border bg-[#1a1614] transition-opacity ${
                    allDone ? "border-[rgba(201,147,58,0.12)] opacity-60"
                    : isCurrent ? "border-[#c9933a]"
                    : "border-[rgba(201,147,58,0.2)]"
                  }`}
                >
                  {/* Week header */}
                  <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[rgba(201,147,58,0.08)]">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="text-center shrink-0">
                        <p className="font-typewriter text-[8px] uppercase tracking-widest text-[#8b7355]">Wk</p>
                        <p className="font-display font-black text-lg text-[#e8b455] leading-none">{w.week}</p>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-typewriter text-sm text-[#f5e6c8]">{w.title}</p>
                          <span
                            className="font-typewriter text-[9px] px-1.5 py-0.5 uppercase tracking-wider border"
                            style={{ color: meta.color, borderColor: `${meta.color}55` }}
                          >
                            {meta.label}
                          </span>
                          {isCurrent && (
                            <span className="font-typewriter text-[9px] px-1.5 py-0.5 uppercase tracking-wider bg-[rgba(201,147,58,0.15)] text-[#e8b455] border border-[rgba(201,147,58,0.3)]">
                              Now
                            </span>
                          )}
                        </div>
                        <p className="font-typewriter text-[11px] text-[#8b7355] leading-snug mt-1">{w.summary}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-typewriter text-[10px] text-[#8b7355]">{weekDone}/{ids.length}</span>
                      <button
                        onClick={() => toggleWeek(ids, !allDone)}
                        className="font-typewriter text-[9px] tracking-wider uppercase px-2 py-1 border border-[rgba(201,147,58,0.25)] text-[#8b7355] hover:text-[#c9933a] transition-colors"
                      >
                        {allDone ? "Uncheck" : "Mark all"}
                      </button>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="px-4 py-2.5 space-y-1.5">
                    {w.tasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => toggleTask(t.id)}
                        className="flex items-start gap-2 w-full text-left group"
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 shrink-0 border flex items-center justify-center text-[10px] transition-colors ${
                            done[t.id]
                              ? "bg-[#c9933a] border-[#c9933a] text-[#1a1614]"
                              : "border-[rgba(201,147,58,0.3)] text-transparent group-hover:border-[#c9933a]"
                          }`}
                        >
                          ✓
                        </span>
                        <span className={`font-typewriter text-[11px] leading-snug ${done[t.id] ? "text-[#4a3a2a] line-through" : "text-[#c4a882]"}`}>
                          {t.label}
                        </span>
                      </button>
                    ))}
                    {w.link && (
                      <a
                        href={w.link.href}
                        className="inline-flex items-center gap-1 mt-1 font-typewriter text-[10px] tracking-wider uppercase text-[#c9933a] hover:text-[#e8b455] transition-colors"
                      >
                        ↳ {w.link.label}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {!loaded && (
        <p className="font-typewriter text-[10px] text-[#4a3a2a] text-center">Loading saved progress…</p>
      )}
    </div>
  );
}
