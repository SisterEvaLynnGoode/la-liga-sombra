"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BadgeGrid from "@/components/expediente/BadgeGrid";
import { fmtMinutes } from "@/lib/hooks/useClassData";

interface LeaderEntry { id: string; displayName: string; isMe: boolean; casesSolved: number; masteryPct: number }

interface Props {
  displayName: string;
  classCode: string;
  periodName: string;
  stats: { casesSolved: number; totalTimeSeconds: number; masteryTermsMastered: number; currentStreak: number };
  badges: Array<{ badge_type: string; unit_id: string | null; earned_at: string }>;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] px-5 py-4 text-center">
      <p className="font-typewriter text-[9px] tracking-[0.25em] uppercase text-[#8b7355] mb-1">{label}</p>
      <p className="font-display text-2xl font-bold text-[#e8b455]">{value}</p>
      {sub && <p className="font-typewriter text-[10px] text-[#8b7355] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function ExpedienteClient({ displayName, classCode, periodName, stats, badges }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [anon, setAnon] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("expediente_anon") === "true";
    return false;
  });

  useEffect(() => {
    fetch("/api/student/leaderboard")
      .then((r) => r.json())
      .then((d: { entries: LeaderEntry[] }) => setLeaderboard(d.entries ?? []));
  }, []);

  function toggleAnon() {
    const next = !anon;
    setAnon(next);
    localStorage.setItem("expediente_anon", String(next));
  }

  const myRank = leaderboard.findIndex((e) => e.isMe) + 1;

  return (
    <div className="min-h-screen bg-[#0d0b0a] pb-12">
      {/* Header */}
      <div className="border-b border-[rgba(201,147,58,0.15)] bg-[#110f0d] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Link href="/mission-board" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors">
              ← Mapa
            </Link>
            <div>
              <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">Mi Expediente</p>
              <h1 className="font-display font-bold text-xl text-[#f5e6c8] leading-none">{displayName}</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="font-typewriter text-xs text-[#8b7355]">{classCode}</p>
            <p className="font-typewriter text-[10px] text-[#4a3a2a]">{periodName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Casos resueltos" value={`${stats.casesSolved}/10`} />
          <StatCard label="Vocab dominado" value={stats.masteryTermsMastered} sub="términos ≥80%" />
          <StatCard label="Tiempo total" value={fmtMinutes(stats.totalTimeSeconds)} />
          <StatCard label="Racha actual" value={`🔥 ${stats.currentStreak}`} sub="días seguidos" />
        </div>

        {/* My rank callout */}
        {myRank > 0 && (
          <div className="border border-[rgba(201,147,58,0.25)] bg-[rgba(201,147,58,0.05)] px-5 py-3 flex items-center gap-3">
            <span className="font-display font-black text-2xl text-[#c9933a]">#{myRank}</span>
            <p className="font-typewriter text-sm text-[#c4a882]">en tu clase de {leaderboard.length} agentes</p>
          </div>
        )}

        {/* Badge collection */}
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-6">
          <BadgeGrid earned={badges} />
        </div>

        {/* Class leaderboard */}
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-[#f5e6c8]">Tablero de la Clase</h2>
            <button
              onClick={toggleAnon}
              className={`font-typewriter text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border transition-colors ${anon ? "border-[rgba(201,147,58,0.3)] text-[#e8b455] bg-[rgba(201,147,58,0.08)]" : "border-[rgba(201,147,58,0.15)] text-[#8b7355] hover:text-[#c9933a]"}`}
            >
              {anon ? "👁 Anónimo activo" : "👁 Aparecer anónimo"}
            </button>
          </div>
          <p className="font-typewriter text-[10px] text-[#4a3a2a] mb-4">
            {anon ? "Your name appears as anonymous to others." : "Your name is visible to classmates."}
          </p>

          <table className="w-full">
            <thead className="border-b border-[rgba(201,147,58,0.1)]">
              <tr>
                {["#", "Agente", "Casos ✓", "Dominio"].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#8b7355]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => {
                const isMe = entry.isMe;
                const showName = isMe && anon ? `${entry.displayName[0]}***` : entry.displayName;
                return (
                  <tr key={entry.id} className={`border-b border-[rgba(201,147,58,0.06)] ${isMe ? "bg-[rgba(201,147,58,0.05)]" : ""}`}>
                    <td className="py-2 pr-4 font-typewriter text-sm text-[#8b7355]">{i + 1}</td>
                    <td className="py-2 pr-4">
                      <span className={`font-typewriter text-sm ${isMe ? "text-[#e8b455]" : "text-[#c4a882]"}`}>{showName}</span>
                      {isMe && <span className="font-typewriter text-[9px] text-[#c9933a] ml-2">← tú</span>}
                    </td>
                    <td className="py-2 pr-4 font-typewriter text-sm text-[#c4a882]">{entry.casesSolved}</td>
                    <td className="py-2 font-typewriter text-sm text-[#c4a882]">{entry.masteryPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
