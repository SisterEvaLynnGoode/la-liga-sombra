"use client";

import { useEffect, useState } from "react";
import { masteryColor, fmtMinutes, relativeTime } from "@/lib/hooks/useClassData";

interface UnitProgress {
  number: number; country: string; titleEs: string;
  status: string; caseSolved: boolean;
  avgScore: number; totalTimeSeconds: number; attemptCount: number;
}

interface MasteryEntry { term: string; attempts: number; correct: number; masteryPct: number; lastSeen: string }

interface Attempt {
  activity_type: string; score: number; max_score: number;
  time_spent_seconds: number; completed_at: string;
  unitNumber: number; unitCountry: string;
}

interface StudentData {
  student: { id: string; displayName: string; createdAt: string };
  unitProgress: UnitProgress[];
  mastery: MasteryEntry[];
  recentAttempts: Attempt[];
  canDo?: Array<{ unitNumber: number; statement: string; rating: number }>;
}

const CAN_DO_EMOJI: Record<number, string> = { 1: "😕", 2: "🙂", 3: "😎" };

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  completed:  { label: "✓ Completado",  color: "#4ade80" },
  in_progress:{ label: "↻ En progreso", color: "#fbbf24" },
  available:  { label: "▶ Disponible",  color: "#c9933a" },
  locked:     { label: "🔒 Bloqueado",  color: "#4a3a2a" },
};

const ACT_LABEL: Record<string, string> = {
  vocab_match: "Vocab", dialogue: "Diálogo", listening: "Audio",
  grammar: "Gramática", lineup: "Lineup", cultural: "Cultural",
};

type InnerTab = "progress" | "mastery" | "history";

export default function StudentDetail({ studentId, onClose }: { studentId: string | null; onClose: () => void }) {
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<InnerTab>("progress");

  useEffect(() => {
    if (!studentId) { setData(null); return; }
    setLoading(true);
    fetch(`/api/teacher/dashboard/student?studentId=${studentId}`)
      .then((r) => r.json())
      .then((d) => { setData(d as StudentData); setLoading(false); })
      .catch(() => setLoading(false));
  }, [studentId]);

  const open = !!studentId;

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 bg-black/40 z-30" onClick={onClose} />}

      {/* Slide-in panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-xl bg-[#111218] border-l border-[rgba(201,147,58,0.2)] shadow-2xl z-40 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(201,147,58,0.15)] shrink-0">
          <div>
            <p className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355]">Perfil del agente</p>
            <h3 className="font-display font-bold text-xl text-[#f5e6c8]">{data?.student.displayName ?? "…"}</h3>
            {data?.student.createdAt && (
              <p className="font-typewriter text-[10px] text-[#4a3a2a]">Joined {data.student.createdAt.slice(0, 10)}</p>
            )}
          </div>
          <button onClick={onClose} className="font-typewriter text-sm text-[#8b7355] hover:text-[#c9933a] transition-colors px-2 py-1">✕</button>
        </div>

        {/* Inner tabs */}
        <div className="flex border-b border-[rgba(201,147,58,0.15)] shrink-0">
          {(["progress", "mastery", "history"] as InnerTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 font-typewriter text-[10px] tracking-[0.2em] uppercase transition-colors ${tab === t ? "text-[#e8b455] border-b-2 border-[#c9933a]" : "text-[#8b7355] hover:text-[#c9933a]"}`}>
              {t === "progress" ? "Progreso" : t === "mastery" ? "Dominio" : "Historial"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && <p className="font-typewriter text-xs text-[#8b7355] animate-pulse">Loading…</p>}

          {/* Progress tab */}
          {!loading && tab === "progress" && data && (
            <div className="space-y-2">
              {data.unitProgress.map((u) => {
                const st = STATUS_STYLES[u.status] ?? STATUS_STYLES.locked;
                return (
                  <div key={u.number} className="border border-[rgba(201,147,58,0.12)] bg-[#1a1614] p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="font-typewriter text-[9px] uppercase text-[#8b7355] mr-2">Caso {u.number}</span>
                        <span className="font-display text-sm font-bold text-[#f5e6c8]">{u.country}</span>
                      </div>
                      <span className="font-typewriter text-[10px]" style={{ color: st.color }}>{st.label}</span>
                    </div>
                    {u.attemptCount > 0 && (
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1 bg-[#2c2220] rounded-full overflow-hidden">
                            <div className="h-full" style={{ width: `${u.avgScore}%`, background: masteryColor(u.avgScore) }} />
                          </div>
                          <span className="font-typewriter text-[10px]" style={{ color: masteryColor(u.avgScore) }}>{u.avgScore}%</span>
                        </div>
                        <span className="font-typewriter text-[10px] text-[#8b7355]">{fmtMinutes(u.totalTimeSeconds)}</span>
                        <span className="font-typewriter text-[10px] text-[#8b7355]">{u.attemptCount} activities</span>
                      </div>
                    )}
                    {/* Can-do self-ratings for this unit (B4) — compare with avgScore above */}
                    {(data.canDo?.some((c) => c.unitNumber === u.number)) && (
                      <div className="mt-2 pt-2 border-t border-[rgba(201,147,58,0.08)] space-y-0.5">
                        <p className="font-typewriter text-[8px] tracking-[0.25em] uppercase text-[#8b7355]">Self-assessment</p>
                        {data.canDo!.filter((c) => c.unitNumber === u.number).map((c, i) => (
                          <p key={i} className="font-typewriter text-[10px] text-[#c4a882]">
                            {CAN_DO_EMOJI[c.rating] ?? "·"} {c.statement}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Mastery tab */}
          {!loading && tab === "mastery" && data && (
            <div className="space-y-1.5">
              <p className="font-typewriter text-[10px] text-[#8b7355] mb-3">
                {data.mastery.length} terms practiced · sorted hardest first
              </p>
              {data.mastery.length === 0 && <p className="font-typewriter text-xs text-[#4a3a2a]">No vocab practice yet.</p>}
              {data.mastery.map((m) => (
                <div key={m.term} className="flex items-center gap-3 py-1.5 border-b border-[rgba(201,147,58,0.06)]">
                  <span className="font-typewriter text-xs text-[#c4a882] flex-1">{m.term}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 h-1.5 bg-[#2c2220] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.masteryPct}%`, background: masteryColor(m.masteryPct) }} />
                    </div>
                    <span className="font-typewriter text-[10px] w-8 text-right" style={{ color: masteryColor(m.masteryPct) }}>{m.masteryPct}%</span>
                    <span className="font-typewriter text-[10px] text-[#4a3a2a]">{m.correct}/{m.attempts}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* History tab */}
          {!loading && tab === "history" && data && (
            <div className="space-y-1.5">
              {data.recentAttempts.length === 0 && <p className="font-typewriter text-xs text-[#4a3a2a]">No attempts yet.</p>}
              {data.recentAttempts.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-[rgba(201,147,58,0.06)]">
                  <span className="font-typewriter text-[10px] text-[#8b7355] shrink-0 w-16">{ACT_LABEL[a.activity_type] ?? a.activity_type}</span>
                  <span className="font-typewriter text-[10px] text-[#4a3a2a] shrink-0">Caso {a.unitNumber}</span>
                  <div className="flex-1 flex justify-end gap-3 items-center">
                    <span className="font-typewriter text-xs" style={{ color: masteryColor(a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0) }}>
                      {a.score}/{a.max_score}
                    </span>
                    <span className="font-typewriter text-[10px] text-[#8b7355]">{Math.round(a.time_spent_seconds / 60)}m</span>
                    <span className="font-typewriter text-[10px] text-[#4a3a2a]">{relativeTime(a.completed_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
