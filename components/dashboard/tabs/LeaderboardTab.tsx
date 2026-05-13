"use client";

import { useState } from "react";
import { useClassData, masteryColor } from "@/lib/hooks/useClassData";
import { TabHeader, Loading, Empty } from "./OverviewTab";

interface LeaderEntry { id: string; displayName: string; count?: number; masteryPct?: number }
interface LeaderboardData {
  byCasesSolved: LeaderEntry[];
  byBadges: LeaderEntry[];
  byMastery: LeaderEntry[];
}

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

function anonymize(name: string) { return name[0]?.toUpperCase() + "***"; }

function LeaderColumn<T extends { id: string; displayName: string }>({
  title, emoji, entries, valueKey, valueSuffix, valueColor, anon,
}: {
  title: string; emoji: string; entries: T[]; valueKey: keyof T;
  valueSuffix?: string; valueColor?: (v: number) => string; anon: boolean;
}) {
  return (
    <div className="flex-1 border border-[rgba(201,147,58,0.2)] bg-[#1a1614]">
      <div className="border-b border-[rgba(201,147,58,0.15)] px-4 py-3 flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">{title}</p>
      </div>
      <div className="p-3 space-y-1.5">
        {entries.length === 0 && (
          <p className="font-typewriter text-xs text-[#4a3a2a] py-2 text-center">No data yet</p>
        )}
        {entries.map((e, i) => {
          const val = e[valueKey] as number;
          const color = valueColor ? valueColor(val) : "#e8b455";
          return (
            <div
              key={e.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${i < 3 ? "border border-[rgba(201,147,58,0.15)] bg-[rgba(201,147,58,0.04)]" : ""}`}
            >
              <span className="text-base w-6 shrink-0 text-center" style={{ color: i < 3 ? MEDAL_COLORS[i] : "#4a3a2a" }}>
                {i < 3 ? MEDALS[i] : `${i + 1}`}
              </span>
              <span className="font-typewriter text-sm text-[#c4a882] flex-1 truncate">
                {anon ? anonymize(e.displayName) : e.displayName}
              </span>
              <span className="font-typewriter text-sm font-bold shrink-0" style={{ color }}>
                {val}{valueSuffix}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LeaderboardTab({ classId }: { classId: string }) {
  const [period, setPeriod] = useState<"all" | "week">("all");
  const [anon, setAnon] = useState(false);
  const { data, loading, lastUpdated, refetch } = useClassData<LeaderboardData>(
    "/api/teacher/dashboard/leaderboard", classId, `&period=${period}`
  );

  if (!classId) return <Empty />;
  if (loading && !data) return <Loading />;

  function openProjector() {
    window.open(`/teacher/leaderboard?classId=${encodeURIComponent(classId)}&period=${period}`, "_blank", "width=1366,height=768,menubar=no,toolbar=no");
  }

  return (
    <div className="space-y-4">
      <TabHeader title="Tablero de Campeones" lastUpdated={lastUpdated} onRefresh={refetch} />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex border border-[rgba(201,147,58,0.2)] overflow-hidden">
          {(["all", "week"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-2 transition-colors ${period === p ? "bg-[rgba(201,147,58,0.15)] text-[#e8b455]" : "text-[#8b7355] hover:text-[#c9933a]"}`}>
              {p === "all" ? "Todo el tiempo" : "Esta semana"}
            </button>
          ))}
        </div>
        <button onClick={() => setAnon((v) => !v)}
          className={`font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-2 border transition-colors ${anon ? "border-[rgba(201,147,58,0.4)] bg-[rgba(201,147,58,0.1)] text-[#e8b455]" : "border-[rgba(201,147,58,0.2)] text-[#8b7355] hover:text-[#c9933a]"}`}>
          👁 {anon ? "Mostrando anónimo" : "Anonimizar"}
        </button>
        <button onClick={openProjector}
          className="ml-auto clip-skew px-5 py-2 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors">
          🖥 Proyector →
        </button>
      </div>

      {/* Three leaderboard columns */}
      <div className="flex flex-col sm:flex-row gap-4">
        <LeaderColumn title="Casos resueltos" emoji="🔎" entries={data?.byCasesSolved ?? []} valueKey="count" anon={anon} />
        <LeaderColumn title="Insignias" emoji="🏅" entries={data?.byBadges ?? []} valueKey="count" anon={anon} />
        <LeaderColumn title="Dominio de vocab" emoji="📚" entries={data?.byMastery ?? []} valueKey="masteryPct" valueSuffix="%" valueColor={masteryColor} anon={anon} />
      </div>
    </div>
  );
}
