"use client";

import { useState } from "react";
import { useClassData, masteryColor } from "@/lib/hooks/useClassData";
import { TabHeader, Loading, Empty } from "./OverviewTab";

interface VocabTerm {
  term: string;
  studentsSeen: number;
  studentsWhoMastered: number;
  classMasteryPct: number;
  avgAttempts: number;
}

interface VocabData { terms: VocabTerm[]; totalStudents: number }

export default function VocabTab({ classId }: { classId: string }) {
  const { data, loading, lastUpdated, refetch } = useClassData<VocabData>("/api/teacher/dashboard/vocab", classId);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"mastery" | "seen" | "term">("mastery");

  if (!classId) return <Empty />;
  if (loading && !data) return <Loading />;

  const terms = (data?.terms ?? [])
    .filter((t) => !search || t.term.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortBy === "mastery" ? a.classMasteryPct - b.classMasteryPct
      : sortBy === "seen" ? b.studentsSeen - a.studentsSeen
      : a.term.localeCompare(b.term)
    );

  const masteredCount = terms.filter((t) => t.classMasteryPct >= 80).length;

  return (
    <div className="space-y-4">
      <TabHeader title="Vocabulario" lastUpdated={lastUpdated} onRefresh={refetch} />

      {/* Summary + search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-4">
          <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] px-4 py-2 text-center">
            <p className="font-typewriter text-[9px] uppercase text-[#8b7355]">Términos</p>
            <p className="font-typewriter text-lg font-bold text-[#e8b455]">{data?.terms.length ?? 0}</p>
          </div>
          <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] px-4 py-2 text-center">
            <p className="font-typewriter text-[9px] uppercase text-[#8b7355]">Dominados</p>
            <p className="font-typewriter text-lg font-bold text-[#4ade80]">{masteredCount}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar término…"
            className="flex-1 max-w-xs bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-1.5 font-typewriter text-xs text-[#f5e6c8] placeholder-[#3a3028] transition-colors"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "mastery" | "seen" | "term")}
            className="bg-[#1a1614] border border-[rgba(201,147,58,0.2)] px-3 py-1.5 font-typewriter text-xs text-[#8b7355] focus:outline-none"
          >
            <option value="mastery">Ordenar: Dominio ↑</option>
            <option value="seen">Ordenar: Visto por ↓</option>
            <option value="term">Ordenar: Alfabético</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[rgba(201,147,58,0.15)]">
            <tr>
              {["Término", "Dominio clase", "Visto por", "Dominado por", "Intentos avg"].map((h) => (
                <th key={h} className="text-left py-2.5 px-4">
                  <span className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {terms.map((t) => (
              <tr key={t.term} className="border-b border-[rgba(201,147,58,0.06)] hover:bg-[rgba(201,147,58,0.03)]">
                <td className="py-2.5 px-4 font-display font-bold text-sm text-[#f5e6c8]">{t.term}</td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[#2c2220] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${t.classMasteryPct}%`, background: masteryColor(t.classMasteryPct) }} />
                    </div>
                    <span className="font-typewriter text-xs" style={{ color: masteryColor(t.classMasteryPct) }}>
                      {t.classMasteryPct}%
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-4 font-typewriter text-xs text-[#c4a882]">
                  {t.studentsSeen}/{data?.totalStudents ?? 0}
                </td>
                <td className="py-2.5 px-4 font-typewriter text-xs text-[#4ade80]">{t.studentsWhoMastered}</td>
                <td className="py-2.5 px-4 font-typewriter text-xs text-[#8b7355]">{t.avgAttempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {terms.length === 0 && (
          <p className="font-typewriter text-xs text-[#4a3a2a] p-4">
            {search ? "No terms match your search." : "No vocab data yet."}
          </p>
        )}
      </div>
    </div>
  );
}
