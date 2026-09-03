"use client";

import { useState } from "react";
import { useClassData } from "@/lib/hooks/useClassData";
import { TabHeader, Loading, Empty } from "./OverviewTab";
import LeaderboardBoard, { BoardData } from "@/components/dashboard/LeaderboardBoard";

/**
 * The in-dashboard view of the scoreboard. Everything it draws lives in
 * LeaderboardBoard, so what you see here is exactly what the room sees when you
 * hit Proyector — no more checking one and showing the other.
 */
export default function LeaderboardTab({ classId }: { classId: string }) {
  const [privacy, setPrivacy] = useState(false);
  const { data, loading, lastUpdated, refetch } = useClassData<BoardData>(
    "/api/teacher/dashboard/leaderboard",
    classId
  );

  if (!classId) return <Empty />;
  if (loading && !data) return <Loading />;

  function openProjector() {
    window.open(
      `/teacher/leaderboard?classId=${encodeURIComponent(classId)}`,
      "_blank",
      "width=1366,height=768,menubar=no,toolbar=no"
    );
  }

  return (
    <div className="space-y-4">
      <TabHeader title="Marcador" lastUpdated={lastUpdated} onRefresh={refetch} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setPrivacy((v) => !v)}
          className={`font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-2 border transition-colors ${
            privacy
              ? "border-[rgba(201,147,58,0.4)] bg-[rgba(201,147,58,0.1)] text-[#e8b455]"
              : "border-[rgba(201,147,58,0.2)] text-[#8b7355] hover:text-[#c9933a]"
          }`}
        >
          {privacy ? "Nombres ocultos" : "Ocultar nombres"}
        </button>
        <button
          onClick={openProjector}
          className="ml-auto clip-skew px-5 py-2 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
        >
          Proyector →
        </button>
      </div>

      <LeaderboardBoard data={data ?? null} variant="panel" privacy={privacy} />
    </div>
  );
}
