"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface LeaderEntry { id: string; displayName: string; count?: number; masteryPct?: number }
interface LeaderboardData {
  byCasesSolved: LeaderEntry[];
  byBadges: LeaderEntry[];
  byMastery: LeaderEntry[];
}

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_BG = [
  "border-[#FFD700] bg-[rgba(255,215,0,0.08)] shadow-[0_0_20px_rgba(255,215,0,0.2)]",
  "border-[#C0C0C0] bg-[rgba(192,192,192,0.06)]",
  "border-[#CD7F32] bg-[rgba(205,127,50,0.06)]",
];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 3,
        color: ["#c9933a","#e8b455","#f5e6c8","#c0392b","#8b1a1a","#fbbf24"][Math.floor(Math.random() * 6)],
        size: 5 + Math.random() * 9,
        shape: Math.random() > 0.5 ? "rounded-sm" : "rounded-full",
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {pieces.map((p) => (
        <div
          key={p.id}
          className={`absolute ${p.shape}`}
          style={{
            left: `${p.x}%`,
            top: "-12px",
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `confettiFall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function LeaderColumn({
  title, emoji, entries,
}: {
  title: string; emoji: string;
  entries: Array<{ id: string; displayName: string; value: number; suffix: string }>;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Column header */}
      <div className="text-center mb-4">
        <span className="text-5xl">{emoji}</span>
        <p className="font-typewriter text-sm tracking-[0.3em] uppercase text-[#8b7355] mt-2">{title}</p>
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {entries.slice(0, 10).map((e, i) => (
          <div
            key={e.id}
            className={`flex items-center gap-3 px-4 py-3 border rounded-sm transition-all ${
              i < 3 ? MEDAL_BG[i] + " border-2" : "border-[rgba(201,147,58,0.1)] bg-[rgba(201,147,58,0.02)]"
            }`}
          >
            <span
              className={`font-display font-black shrink-0 ${i < 3 ? "text-2xl" : "text-base text-[#4a3a2a] w-6 text-center"}`}
            >
              {i < 3 ? MEDALS[i] : `${i + 1}`}
            </span>
            <span className={`font-display font-bold flex-1 truncate ${i === 0 ? "text-2xl text-[#f5e6c8]" : i < 3 ? "text-xl text-[#f5e6c8]" : "text-base text-[#c4a882]"}`}>
              {e.displayName}
            </span>
            <span className={`font-display font-black shrink-0 ${i === 0 ? "text-3xl text-[#e8b455]" : i < 3 ? "text-xl text-[#c9933a]" : "text-base text-[#8b7355]"}`}>
              {e.value}{e.suffix}
            </span>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="font-typewriter text-xs text-[#4a3a2a] text-center py-4">No data yet</p>
        )}
      </div>
    </div>
  );
}

function LeaderboardContent() {
  const params = useSearchParams();
  const classId = params.get("classId") ?? "";
  const period = params.get("period") ?? "all";

  const [data, setData] = useState<LeaderboardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchData() {
    if (!classId) return;
    const res = await fetch(`/api/teacher/dashboard/leaderboard?classId=${encodeURIComponent(classId)}&period=${period}`);
    if (res.ok) { setData(await res.json()); setLastUpdated(new Date()); }
  }

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, period]);

  const caseEntries = (data?.byCasesSolved ?? []).map((e) => ({ ...e, value: e.count ?? 0, suffix: "" }));
  const badgeEntries = (data?.byBadges ?? []).map((e) => ({ ...e, value: e.count ?? 0, suffix: "" }));
  const masteryEntries = (data?.byMastery ?? []).map((e) => ({ ...e, value: e.masteryPct ?? 0, suffix: "%" }));

  return (
    <div className="relative min-h-screen bg-[#0c0e14] flex flex-col overflow-hidden">
      <Confetti />

      <div className="relative z-10 flex-1 flex flex-col p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-typewriter text-xs tracking-[0.4em] uppercase text-[#8b7355] mb-2">
            La Liga Sombra · {period === "week" ? "Esta Semana" : "Tabla General"}
          </p>
          <h1 className="font-display font-black text-4xl text-[#e8b455] text-glow-mustard">
            🏆 Tablero de Campeones 🏆
          </h1>
          {lastUpdated && (
            <p className="font-typewriter text-[10px] text-[#4a3a2a] mt-2">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#c9933a] to-transparent mb-8" />

        {/* Three columns */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          <LeaderColumn title="Casos Resueltos" emoji="🔎" entries={caseEntries} />
          <div className="w-px bg-[rgba(201,147,58,0.1)] hidden lg:block" />
          <LeaderColumn title="Insignias" emoji="🏅" entries={badgeEntries} />
          <div className="w-px bg-[rgba(201,147,58,0.1)] hidden lg:block" />
          <LeaderColumn title="Dominio" emoji="📚" entries={masteryEntries} />
        </div>

        {/* Footer */}
        <p className="font-typewriter text-[10px] text-center text-[#2c2220] mt-6">
          Auto-actualización cada 30 segundos · La Liga Sombra
        </p>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0c0e14] flex items-center justify-center"><p className="font-typewriter text-xs text-[#8b7355]">Loading…</p></div>}>
      <LeaderboardContent />
    </Suspense>
  );
}
