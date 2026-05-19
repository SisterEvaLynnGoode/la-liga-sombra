"use client";

import { useState } from "react";
import { useClassData, relativeTime, masteryColor, fmtMinutes } from "@/lib/hooks/useClassData";
import { TabHeader, Loading, Empty } from "./OverviewTab";
import StudentDetail from "../StudentDetail";

interface StudentRow {
  id: string;
  displayName: string;
  joinedAt: string;
  unitsCompleted: number;
  totalTimeSeconds: number;
  lastActive: string | null;
  masteryPct: number;
  badgeCount: number;
  academiaRetries?: number;
  academiaSessions?: number;
  stakeoutAttempts?: number;
  stakeoutPassed?: number;
  stakeoutAvgTime?: number | null;
  trainingMinutesWeek?: number;
  trainingDrillsTotal?: number;
  trainingStreak?: number;
  briefingStreak?: number;
  briefingSkips?: number;
  briefingTotal?: number;
}

interface StudentsData { students: StudentRow[] }

type SortKey = keyof StudentRow;

export default function StudentsTab({ classId }: { classId: string }) {
  const { data, loading, lastUpdated, refetch } = useClassData<StudentsData>("/api/teacher/dashboard/students", classId);
  const [sortKey, setSortKey] = useState<SortKey>("unitsCompleted");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!classId) return <Empty />;
  if (loading && !data) return <Loading />;

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sorted = [...(data?.students ?? [])].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = av == null ? -1 : bv == null ? 1 : av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  function SortTh({ k, label }: { k: SortKey; label: string }) {
    const active = sortKey === k;
    return (
      <th className="text-left pb-2 pr-4 cursor-pointer select-none" onClick={() => handleSort(k)}>
        <span className={`font-typewriter text-[10px] tracking-[0.2em] uppercase ${active ? "text-[#e8b455]" : "text-[#8b7355]"} hover:text-[#c9933a] transition-colors`}>
          {label} {active ? (sortDir === "asc" ? "↑" : "↓") : ""}
        </span>
      </th>
    );
  }

  return (
    <div className="space-y-4">
      <TabHeader title={`Estudiantes (${data?.students.length ?? 0})`} lastUpdated={lastUpdated} onRefresh={refetch} />

      <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[rgba(201,147,58,0.15)]">
            <tr className="px-4">
              <th className="text-left pb-2 pl-4 pt-3">
                <span className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">Agente</span>
              </th>
              <SortTh k="unitsCompleted" label="Unidades ✓" />
              <SortTh k="totalTimeSeconds" label="Tiempo" />
              <SortTh k="lastActive" label="Última sesión" />
              <SortTh k="masteryPct" label="Dominio" />
              <SortTh k="badgeCount" label="Insignias" />
              <SortTh k="academiaRetries" label="Academia ↺" />
              <SortTh k="stakeoutAvgTime" label="Vigilancia ⏱" />
              <SortTh k="trainingMinutesWeek" label="Training /sem" />
              <SortTh k="briefingStreak" label="Informe 📋" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr
                key={s.id}
                onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
                className={`border-b border-[rgba(201,147,58,0.06)] cursor-pointer transition-colors ${s.id === selectedId ? "bg-[rgba(201,147,58,0.08)]" : "hover:bg-[rgba(201,147,58,0.03)]"}`}
              >
                <td className="py-2.5 pl-4 pr-4">
                  <p className="font-typewriter text-sm text-[#f5e6c8]">{s.displayName}</p>
                  <p className="font-typewriter text-[10px] text-[#4a3a2a]">Joined {s.joinedAt.slice(0, 10)}</p>
                </td>
                <td className="py-2.5 pr-4 font-typewriter text-sm text-[#c4a882]">{s.unitsCompleted}</td>
                <td className="py-2.5 pr-4 font-typewriter text-sm text-[#c4a882]">{fmtMinutes(s.totalTimeSeconds)}</td>
                <td className="py-2.5 pr-4 font-typewriter text-xs text-[#8b7355]">{relativeTime(s.lastActive)}</td>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[#2c2220] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.masteryPct}%`, background: masteryColor(s.masteryPct) }} />
                    </div>
                    <span className="font-typewriter text-xs" style={{ color: masteryColor(s.masteryPct) }}>{s.masteryPct}%</span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 font-typewriter text-sm text-[#c9933a]">{s.badgeCount}</td>
                <td className="py-2.5 pr-4 font-typewriter text-sm text-[#8b7355]">
                  {s.academiaSessions != null && s.academiaSessions > 0
                    ? (
                      <span title={`${s.academiaSessions} unit(s) trained`}>
                        {s.academiaRetries ?? 0}
                        <span className="text-[10px] text-[#4a3a2a] ml-1">/{s.academiaSessions}</span>
                      </span>
                    )
                    : <span className="text-[#4a3a2a]">—</span>
                  }
                </td>
                <td className="py-2.5 pr-4 font-typewriter text-sm">
                  {s.briefingTotal != null && s.briefingTotal > 0
                    ? (
                      <span
                        title={`${s.briefingTotal} total · ${s.briefingSkips ?? 0} skipped`}
                        className={
                          (s.briefingStreak ?? 0) >= 5 ? "text-[#4a9eff]"
                          : (s.briefingStreak ?? 0) > 0 ? "text-[rgba(74,158,255,0.6)]"
                          : "text-[#4a3a2a]"
                        }>
                        🔵 {s.briefingStreak ?? 0}
                        {(s.briefingSkips ?? 0) > 0 && (
                          <span className="text-[10px] text-[#c0392b] ml-1">↷{s.briefingSkips}</span>
                        )}
                      </span>
                    )
                    : <span className="text-[#4a3a2a]">—</span>
                  }
                </td>
                <td className="py-2.5 pr-4 font-typewriter text-sm">
                  {s.trainingMinutesWeek != null
                    ? (
                      <span title={`${s.trainingDrillsTotal} drills · ${s.trainingStreak} day streak`}
                        className={s.trainingStreak && s.trainingStreak >= 3
                          ? "text-[#c9933a]"
                          : s.trainingMinutesWeek > 0
                          ? "text-[#e8b455]"
                          : "text-[#4a3a2a]"}>
                        {s.trainingMinutesWeek}m
                        {s.trainingStreak ? <span className="text-[10px] text-[#4a3a2a] ml-1">🔥{s.trainingStreak}</span> : null}
                      </span>
                    )
                    : <span className="text-[#4a3a2a]">—</span>
                  }
                </td>
                <td className="py-2.5 pr-4 font-typewriter text-sm">
                  {s.stakeoutAttempts
                    ? (
                      <span title={`${s.stakeoutPassed}/${s.stakeoutAttempts} passed`}
                        className={s.stakeoutAvgTime != null && s.stakeoutAvgTime > 30
                          ? "text-[#c9933a]"
                          : s.stakeoutAvgTime != null && s.stakeoutAvgTime > 0
                          ? "text-[#e8b455]"
                          : "text-[#c0392b]"}>
                        {s.stakeoutPassed}/{s.stakeoutAttempts}
                        {s.stakeoutAvgTime != null && (
                          <span className="text-[#4a3a2a] text-[10px] ml-1">({s.stakeoutAvgTime}s)</span>
                        )}
                      </span>
                    )
                    : <span className="text-[#4a3a2a]">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="font-typewriter text-xs text-[#4a3a2a] p-4">No students in this class yet.</p>
        )}
      </div>

      <StudentDetail studentId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
