"use client";

import { useClassData, masteryColor } from "@/lib/hooks/useClassData";
import { TabHeader, Loading, Empty } from "./OverviewTab";

interface UnitData {
  number: number;
  country: string;
  titleEs: string;
  completionCount: number;
  inProgressCount: number;
  totalStudents: number;
  avgScore: number;
  avgTimeMinutes: number;
  activityBreakdown: Array<{ type: string; avgScore: number; count: number }>;
  hardestVocab: Array<{ term: string; masteryPct: number; studentsSeen: number }>;
  academia?: {
    total: number;
    readyPct: number | null;
    recommendedPct: number | null;
    requiredPct: number | null;
  };
}

interface UnitsData { units: UnitData[] }

const ACTIVITY_LABELS: Record<string, string> = {
  vocab_match: "Vocabulario",
  dialogue: "Diálogo",
  listening: "Audio",
  grammar: "Gramática",
  lineup: "Identificación",
  cultural: "Cultural",
};

export default function UnitsTab({ classId }: { classId: string }) {
  const { data, loading, lastUpdated, refetch } = useClassData<UnitsData>("/api/teacher/dashboard/units", classId);

  if (!classId) return <Empty />;
  if (loading && !data) return <Loading />;

  return (
    <div className="space-y-4">
      <TabHeader title="Por Unidad" lastUpdated={lastUpdated} onRefresh={refetch} />

      <div className="space-y-4">
        {(data?.units ?? []).map((u) => {
          const completionPct = u.totalStudents > 0 ? Math.round((u.completionCount / u.totalStudents) * 100) : 0;
          return (
            <div key={u.number} className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614]">
              {/* Unit header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(201,147,58,0.1)]">
                <div className="flex items-center gap-3">
                  <span className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355]">Caso {u.number}</span>
                  <span className="font-display font-bold text-[#f5e6c8]">{u.country}</span>
                  <span className="font-typewriter text-xs text-[#8b7355] italic">&ldquo;{u.titleEs}&rdquo;</span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <p className="font-typewriter text-[9px] uppercase text-[#8b7355]">Completado</p>
                    <p className="font-typewriter text-sm font-bold text-[#e8b455]">{completionPct}%</p>
                  </div>
                  <div className="text-center">
                    <p className="font-typewriter text-[9px] uppercase text-[#8b7355]">Puntaje avg</p>
                    <p className="font-typewriter text-sm font-bold" style={{ color: masteryColor(u.avgScore) }}>{u.avgScore}%</p>
                  </div>
                  <div className="text-center">
                    <p className="font-typewriter text-[9px] uppercase text-[#8b7355]">Tiempo avg</p>
                    <p className="font-typewriter text-sm text-[#c4a882]">{u.avgTimeMinutes}m</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-5 pt-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-2 bg-[#2c2220] rounded-full overflow-hidden">
                    <div className="h-full bg-[#c9933a] rounded-full transition-all" style={{ width: `${completionPct}%` }} />
                  </div>
                  <span className="font-typewriter text-xs text-[#8b7355] shrink-0">
                    {u.completionCount}/{u.totalStudents} completados · {u.inProgressCount} en progreso
                  </span>
                </div>
              </div>

              {/* Academia tier breakdown */}
              {u.academia && u.academia.total > 0 && (
                <div className="px-5 pb-3">
                  <p className="font-typewriter text-[9px] tracking-widest uppercase text-[#8b7355] mb-2">
                    La Academia · {u.academia.total} estudiante(s) evaluado(s)
                  </p>
                  <div className="flex gap-4">
                    {[
                      { emoji: "🟢", label: "Listo",       pct: u.academia.readyPct       },
                      { emoji: "🟡", label: "Recomendado", pct: u.academia.recommendedPct },
                      { emoji: "🔴", label: "Obligatorio", pct: u.academia.requiredPct    },
                    ].map((tier) => (
                      <div key={tier.label} className="flex items-center gap-1.5">
                        <span className="text-xs">{tier.emoji}</span>
                        <span className="font-typewriter text-[10px] text-[#8b7355]">{tier.label}</span>
                        <span className="font-typewriter text-xs text-[#e8b455]">
                          {tier.pct != null ? `${tier.pct}%` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Two-column detail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 px-5 pb-4">
                {/* Activity breakdown */}
                {u.activityBreakdown.length > 0 && (
                  <div className="pr-4">
                    <p className="font-typewriter text-[9px] tracking-widest uppercase text-[#8b7355] mb-2">Actividades (por puntaje)</p>
                    <div className="space-y-1.5">
                      {u.activityBreakdown.map((a) => (
                        <div key={a.type} className="flex items-center gap-2">
                          <span className="font-typewriter text-[10px] text-[#8b7355] w-24 shrink-0">{ACTIVITY_LABELS[a.type] ?? a.type}</span>
                          <div className="flex-1 h-1.5 bg-[#2c2220] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${a.avgScore}%`, background: masteryColor(a.avgScore) }} />
                          </div>
                          <span className="font-typewriter text-[10px] shrink-0" style={{ color: masteryColor(a.avgScore) }}>{a.avgScore}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hardest vocab */}
                {u.hardestVocab.length > 0 && (
                  <div>
                    <p className="font-typewriter text-[9px] tracking-widest uppercase text-[#8b7355] mb-2">Vocab más difícil</p>
                    <div className="space-y-1.5">
                      {u.hardestVocab.map((v) => (
                        <div key={v.term} className="flex items-center justify-between">
                          <span className="font-typewriter text-[10px] text-[#c4a882]">&ldquo;{v.term}&rdquo;</span>
                          <span className="font-typewriter text-[10px]" style={{ color: masteryColor(v.masteryPct) }}>{v.masteryPct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
