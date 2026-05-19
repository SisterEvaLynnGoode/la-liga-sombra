"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import VocabGym from "@/components/training/VocabGym";
import GrammarDojo from "@/components/training/GrammarDojo";
import Locker from "@/components/training/Locker";
import BadgeEarned from "@/components/games/BadgeEarned";
import type { BadgeType } from "@/lib/types/database";
import type { VocabDrillItem } from "@/lib/personalized-drills";

export interface TrainingData {
  drillItems: VocabDrillItem[];
  masteredTerms: VocabDrillItem[];
  strugglingTerms: VocabDrillItem[];
  termToUnit: Record<string, number>;
  unlockedUnitNumbers: number[];
  grammarConcepts: Array<{
    id: string; labelEs: string; labelEn: string;
    unitNumbers: number[]; unlocked: boolean; accuracy: number | null;
  }>;
  stakeoutBests: Array<{ unitNumber: number; timeRemaining: number }>;
  badges: Array<{ badge_type: string; unit_id: string | null; earned_at: string }>;
  todayTrainingMinutes: number;
  trainingStreak: number;
  todayDrills: number;
  totalMastered: number;
}

type TabId = "gym" | "dojo" | "locker";

const TABS: Array<{ id: TabId; emoji: string; labelEs: string; labelEn: string }> = [
  { id: "gym",    emoji: "🥊", labelEs: "Gimnasio de Vocabulario", labelEn: "Vocab Gym"    },
  { id: "dojo",   emoji: "🥋", labelEs: "Dojo de Gramática",       labelEn: "Grammar Dojo" },
  { id: "locker", emoji: "🔐", labelEs: "El Casillero",            labelEn: "Locker"       },
];

const CAP_MINUTES = 30;

interface Props { displayName: string }

export default function TrainingClient({ displayName }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("gym");
  const [data, setData] = useState<TrainingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBadges, setNewBadges] = useState<BadgeType[]>([]);
  const [showBadgeEarned, setShowBadgeEarned] = useState(false);

  function loadData() {
    setLoading(true);
    fetch("/api/training/data")
      .then((r) => r.json())
      .then((d: TrainingData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  const handleActivityComplete = useCallback(async (opts: {
    subtype: "vocab" | "grammar" | "drill";
    score: number;
    maxScore: number;
    timeSeconds: number;
    termsFromUnits?: number[];
  }) => {
    const res = await fetch("/api/training/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    }).catch(() => null);

    if (res?.ok) {
      const json = await res.json() as { newBadges?: BadgeType[] };
      if (json.newBadges?.length) {
        setNewBadges(json.newBadges);
        setShowBadgeEarned(true);
      }
    }
    // Refresh data after activity
    loadData();
  }, []);

  const capsExceeded = (data?.todayTrainingMinutes ?? 0) >= CAP_MINUTES;

  return (
    <div className="min-h-screen bg-[#0d0b0a] flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-[rgba(201,147,58,0.15)] bg-[#111218] px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1a1614] border border-[rgba(201,147,58,0.2)] flex items-center justify-center">
            <span className="text-xl">🥊</span>
          </div>
          <div>
            <p className="font-typewriter text-[9px] tracking-[0.35em] uppercase text-[#8b7355]">
              Sala de Entrenamiento · {displayName}
            </p>
            <h1 className="font-display font-bold text-lg text-[#e8b455] leading-tight">
              La Sala de Entrenamiento
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Today's stats */}
          {data && (
            <div className="hidden sm:flex items-center gap-4 font-typewriter text-[10px] text-[#8b7355]">
              <span>🔥 {data.trainingStreak} días</span>
              <span>⏱ {data.todayTrainingMinutes}/{CAP_MINUTES} min hoy</span>
              <span>⭐ {data.totalMastered} términos</span>
            </div>
          )}
          <button
            onClick={() => router.push("/mission-board")}
            className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors"
          >
            ← Volver al tablero
          </button>
        </div>
      </header>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-[rgba(201,147,58,0.1)] bg-[#111218] px-5 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 font-typewriter text-[10px] tracking-[0.2em] uppercase transition-all border-b-2 ${
                activeTab === t.id
                  ? "border-[#c9933a] text-[#e8b455]"
                  : "border-transparent text-[#8b7355] hover:text-[#c4a882]"
              }`}
            >
              <span className="text-base">{t.emoji}</span>
              <span className="hidden sm:inline">{t.labelEs}</span>
              <span className="sm:hidden">{t.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Cap warning ──────────────────────────────────────────────────── */}
      {capsExceeded && (
        <div className="shrink-0 px-5 py-2 bg-[rgba(201,147,58,0.08)] border-b border-[rgba(201,147,58,0.15)] flex items-center gap-2">
          <span className="text-sm">🏆</span>
          <p className="font-typewriter text-xs text-[#c9933a]">
            ¡Excelente práctica hoy! Ya llevas {data?.todayTrainingMinutes} minutos.
            Puedes seguir, pero recuerda descansar. Mañana hay más.
          </p>
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <p className="font-typewriter text-xs text-[#4a3a2a] animate-pulse">Cargando datos de entrenamiento…</p>
          </div>
        )}

        {!loading && data && activeTab === "gym" && (
          <VocabGym
            drillItems={data.drillItems}
            termToUnit={data.termToUnit}
            todayMinutes={data.todayTrainingMinutes}
            todayDrills={data.todayDrills}
            onActivityComplete={handleActivityComplete}
          />
        )}

        {!loading && data && activeTab === "dojo" && (
          <GrammarDojo
            concepts={data.grammarConcepts}
            onActivityComplete={handleActivityComplete}
          />
        )}

        {!loading && data && activeTab === "locker" && (
          <Locker
            masteredTerms={data.masteredTerms}
            strugglingTerms={data.strugglingTerms}
            badges={data.badges}
            stakeoutBests={data.stakeoutBests}
            trainingStreak={data.trainingStreak}
            totalMastered={data.totalMastered}
            drillItems={data.drillItems}
            termToUnit={data.termToUnit}
            onActivityComplete={handleActivityComplete}
          />
        )}
      </main>

      {/* ── Badge animation ──────────────────────────────────────────────── */}
      {showBadgeEarned && newBadges.length > 0 && (
        <BadgeEarned
          badges={newBadges}
          onDismiss={() => { setShowBadgeEarned(false); setNewBadges([]); }}
        />
      )}
    </div>
  );
}
