"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LeaderboardBoard, { BoardData } from "@/components/dashboard/LeaderboardBoard";

/**
 * The projector view. Same board as the dashboard tab, scaled up, refreshing
 * itself so it can be left on the screen during work time.
 *
 * `privacy=1` blanks the names — for the days the board is up while a visitor,
 * a sub, or another class is in the room.
 */

function Confetti({ on }: { on: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 3,
        color: ["#c9933a", "#e8b455", "#f5e6c8", "#c0392b", "#8b1a1a", "#fbbf24"][Math.floor(Math.random() * 6)],
        size: 5 + Math.random() * 9,
        shape: Math.random() > 0.5 ? "rounded-sm" : "rounded-full",
      })),
    []
  );

  // Confetti is the reward for hitting the class goal, not permanent decoration.
  if (!on) return null;

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

function LeaderboardContent() {
  const params = useSearchParams();
  const classId = params.get("classId") ?? "";
  const privacy = params.get("privacy") === "1";

  const [data, setData] = useState<BoardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!classId) return;
    let alive = true;

    async function fetchData() {
      const res = await fetch(`/api/teacher/dashboard/leaderboard?classId=${encodeURIComponent(classId)}`);
      if (!alive || !res.ok) return;
      setData(await res.json());
      setLastUpdated(new Date());
    }

    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [classId]);

  const goalMet = !!data?.classGoal && data.classGoal.target > 0 && data.classGoal.solved >= data.classGoal.target;

  return (
    <div className="relative min-h-screen bg-[#0c0e14] flex flex-col overflow-hidden">
      <Confetti on={goalMet} />

      <div className="relative z-10 flex-1 flex flex-col p-8">
        <div className="text-center mb-6">
          <p className="font-typewriter text-xs tracking-[0.4em] uppercase text-[#8b7355] mb-2">La Liga Sombra</p>
          <h1 className="font-display font-black text-4xl text-[#e8b455] text-glow-mustard">
            Tablero de Agentes
          </h1>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#c9933a] to-transparent mb-6" />

        <div className="flex-1">
          <LeaderboardBoard data={data} variant="projector" privacy={privacy} />
        </div>

        <p className="font-typewriter text-[10px] text-center text-[#2c2220] mt-6">
          Se actualiza cada 30 segundos
          {lastUpdated ? ` · ${lastUpdated.toLocaleTimeString()}` : ""}
        </p>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c0e14] flex items-center justify-center">
          <p className="font-typewriter text-xs text-[#8b7355]">Cargando…</p>
        </div>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
