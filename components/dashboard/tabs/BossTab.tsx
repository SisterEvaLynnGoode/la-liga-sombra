"use client";

import { useClassData, masteryColor } from "@/lib/hooks/useClassData";
import { TabHeader, Loading, Empty } from "./OverviewTab";

interface StudentBoss {
  id: string; displayName: string;
  status: string; difficulty: string | null;
  ending: string | null; score: number | null;
  partnerName: string | null; ethicalChoice: string | null;
}

interface BossData {
  bossId: string;
  total: number; started: number; completed: number; skipped: number;
  completionPct: number; collaborationRate: number;
  difficultyDist: { easy: number; normal: number; hard: number };
  endingDist: Record<string, number>;
  choiceDist: { A: number; B: number; C: number };
  avgCompletionMinutes: number | null;
  students: StudentBoss[];
}

interface BossResponse { bosses: BossData[] }

const BOSS_NAMES: Record<string, string> = {
  "unit-5-eclipse": "Operación Eclipse (Unidad 5)",
};

const ENDING_LABELS: Record<string, { label: string; emoji: string }> = {
  pacto_silencioso:   { label: "El Pacto Silencioso",   emoji: "🕊️" },
  cazador:            { label: "El Cazador",             emoji: "⚖️" },
  maestro_negociador: { label: "El Maestro Negociador",  emoji: "🤝" },
};

const CHOICE_LABELS: Record<string, string> = {
  A: "🕊️ Permitir advertencia",
  B: "⚖️ Continuar presión",
  C: "🤝 Negociar en español",
};

export default function BossTab({ classId }: { classId: string }) {
  const { data, loading, lastUpdated, refetch } = useClassData<BossResponse>("/api/teacher/dashboard/boss", classId);

  if (!classId) return <Empty />;
  if (loading && !data) return <Loading />;

  const bosses = data?.bosses ?? [];

  if (bosses.length === 0) {
    return (
      <div className="space-y-4">
        <TabHeader title="Jefes" lastUpdated={lastUpdated} onRefresh={refetch} />
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-8 text-center">
          <p className="font-typewriter text-sm text-[#4a3a2a]">
            No hay datos de jefes todavía. Los jefes se desbloquean cuando los estudiantes completan unidades específicas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TabHeader title="Jefes" lastUpdated={lastUpdated} onRefresh={refetch} />

      {bosses.map((b) => (
        <div key={b.bossId} className="space-y-4">
          {/* Boss header */}
          <div className="border border-[rgba(192,57,43,0.3)] bg-[#1a0808]">
            <div className="border-b border-[rgba(192,57,43,0.2)] px-5 py-3 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎯</span>
                <h3 className="font-display font-bold text-[#f5a0a0]">{BOSS_NAMES[b.bossId] ?? b.bossId}</h3>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <p className="font-typewriter text-[9px] uppercase text-[#8b4a4a]">Completado</p>
                  <p className="font-typewriter text-sm font-bold text-[#e8b455]">{b.completionPct}%</p>
                </div>
                <div className="text-center">
                  <p className="font-typewriter text-[9px] uppercase text-[#8b4a4a]">Tiempo avg</p>
                  <p className="font-typewriter text-sm text-[#c4a882]">{b.avgCompletionMinutes != null ? `${b.avgCompletionMinutes}m` : "—"}</p>
                </div>
                <div className="text-center">
                  <p className="font-typewriter text-[9px] uppercase text-[#8b4a4a]">Colaboración</p>
                  <p className="font-typewriter text-sm text-[#c4a882]">{b.collaborationRate}%</p>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-[rgba(192,57,43,0.1)]">
              {[
                { label: "Iniciaron",   value: b.started,    sub: `de ${b.total}` },
                { label: "Completaron", value: b.completed,  sub: "" },
                { label: "Saltaron",    value: b.skipped,    sub: "" },
              ].map((s) => (
                <div key={s.label} className="p-4 text-center border-b border-[rgba(192,57,43,0.1)]">
                  <p className="font-typewriter text-[9px] uppercase text-[#8b4a4a]">{s.label}</p>
                  <p className="font-typewriter text-xl font-bold text-[#e8b455]">{s.value}</p>
                  {s.sub && <p className="font-typewriter text-[9px] text-[#4a2a2a]">{s.sub}</p>}
                </div>
              ))}

              {/* Difficulty distribution */}
              <div className="p-4 border-b border-[rgba(192,57,43,0.1)]">
                <p className="font-typewriter text-[9px] uppercase text-[#8b4a4a] mb-2">Dificultad</p>
                {[
                  { label: "Silenciosa", count: b.difficultyDist.easy,   emoji: "🔍" },
                  { label: "Estándar",   count: b.difficultyDist.normal, emoji: "⚡" },
                  { label: "Relámpago",  count: b.difficultyDist.hard,   emoji: "🔥" },
                ].map((d) => (
                  d.count > 0 && (
                    <div key={d.label} className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs">{d.emoji}</span>
                      <span className="font-typewriter text-[10px] text-[#c4a882]">{d.label}: {d.count}</span>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Ethical choice insight */}
            {(b.choiceDist.A + b.choiceDist.B + b.choiceDist.C) > 0 && (
              <div className="px-5 py-3 border-t border-[rgba(192,57,43,0.1)]">
                <p className="font-typewriter text-[9px] uppercase text-[#8b4a4a] mb-2">
                  💡 Decisión ética (Costa Rica) — tema para debate en clase
                </p>
                <div className="flex flex-wrap gap-3">
                  {(["A","B","C"] as const).map((k) => (
                    b.choiceDist[k] > 0 && (
                      <div key={k} className="font-typewriter text-[10px] text-[#c4a882]">
                        {CHOICE_LABELS[k]}: <span className="text-[#e8b455]">{b.choiceDist[k]}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Per-student table */}
          <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[rgba(201,147,58,0.15)]">
                <tr>
                  {["Agente","Estado","Dificultad","Decisión ética","Desenlace","Puntaje","Compañero"].map((h) => (
                    <th key={h} className="text-left py-2 pl-4 pr-3 font-typewriter text-[10px] tracking-[0.15em] uppercase text-[#8b7355]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.students.map((s) => (
                  <tr key={s.id} className="border-b border-[rgba(201,147,58,0.06)] hover:bg-[rgba(201,147,58,0.02)]">
                    <td className="py-2.5 pl-4 pr-3 font-typewriter text-sm text-[#f5e6c8]">{s.displayName}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`font-typewriter text-xs ${
                        s.status === "completed" ? "text-[#4ade80]"
                        : s.status === "in_progress" ? "text-[#e8b455]"
                        : s.status === "skipped" ? "text-[#c0392b]"
                        : "text-[#4a3a2a]"
                      }`}>
                        {s.status === "completed" ? "✓ Completado"
                          : s.status === "in_progress" ? "En progreso"
                          : s.status === "skipped" ? "Saltado"
                          : "—"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 font-typewriter text-xs text-[#8b7355]">
                      {s.difficulty === "easy" ? "🔍 Silenciosa" : s.difficulty === "hard" ? "🔥 Relámpago" : s.difficulty === "normal" ? "⚡ Estándar" : "—"}
                    </td>
                    <td className="py-2.5 pr-3 font-typewriter text-xs text-[#8b7355]">
                      {s.ethicalChoice ? CHOICE_LABELS[s.ethicalChoice]?.slice(3) ?? s.ethicalChoice : "—"}
                    </td>
                    <td className="py-2.5 pr-3 font-typewriter text-xs text-[#8b7355]">
                      {s.ending ? (ENDING_LABELS[s.ending]?.emoji + " " + ENDING_LABELS[s.ending]?.label) : "—"}
                    </td>
                    <td className="py-2.5 pr-3 font-typewriter text-xs" style={{ color: masteryColor(s.score ? Math.min(100, (s.score / 750) * 100) : 0) }}>
                      {s.score ?? "—"}
                    </td>
                    <td className="py-2.5 pr-3 font-typewriter text-xs text-[#8b7355]">
                      {s.partnerName ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
