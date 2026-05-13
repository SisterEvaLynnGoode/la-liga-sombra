"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import StudentsTab from "@/components/dashboard/tabs/StudentsTab";
import UnitsTab from "@/components/dashboard/tabs/UnitsTab";
import VocabTab from "@/components/dashboard/tabs/VocabTab";
import LeaderboardTab from "@/components/dashboard/tabs/LeaderboardTab";
import ExportTab from "@/components/dashboard/tabs/ExportTab";

interface ClassRow { id: string; class_code: string; teacher_name: string; period_name: string; student_count: number }

type TabId = "overview" | "students" | "units" | "vocab" | "leaderboard" | "export";

const TABS: Array<{ id: TabId; label: string; emoji: string }> = [
  { id: "overview",    label: "Resumen",      emoji: "📊" },
  { id: "students",    label: "Estudiantes",  emoji: "👤" },
  { id: "units",       label: "Unidades",     emoji: "🗺️" },
  { id: "vocab",       label: "Vocabulario",  emoji: "📖" },
  { id: "leaderboard", label: "Tablero",      emoji: "🏆" },
  { id: "export",      label: "Exportar",     emoji: "↓" },
];

export default function DashboardClient() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/classes")
      .then((r) => r.json())
      .then((d: { classes: ClassRow[] }) => {
        setClasses(d.classes ?? []);
        if (d.classes?.length) setSelectedClassId(d.classes[0].id);
        setLoadingClasses(false);
      })
      .catch(() => setLoadingClasses(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/teacher/auth", { method: "DELETE" });
    router.push("/");
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="min-h-screen bg-[#0c0e14] flex flex-col">
      {/* ── Top nav ─────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-[rgba(201,147,58,0.15)] bg-[#111218] px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">Panel del Maestro</p>
            <h1 className="font-display font-bold text-lg text-[#e8b455] leading-tight">Cuartel General</h1>
          </div>
          <div className="w-px h-8 bg-[rgba(201,147,58,0.15)]" />
          {/* Class selector */}
          {loadingClasses ? (
            <span className="font-typewriter text-xs text-[#4a3a2a]">Loading classes…</span>
          ) : classes.length === 0 ? (
            <span className="font-typewriter text-xs text-[#4a3a2a]">No classes yet — create one in Setup</span>
          ) : (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-[#1a1614] border border-[rgba(201,147,58,0.25)] px-3 py-1.5 font-typewriter text-sm text-[#f5e6c8] focus:outline-none focus:border-[#c9933a] transition-colors"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_code} — {c.period_name} ({c.student_count} est.)
                </option>
              ))}
            </select>
          )}
          {selectedClass && (
            <span className="font-typewriter text-[10px] text-[#8b7355]">
              {selectedClass.teacher_name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <a href="/teacher/setup" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors">
            ⚙ Setup
          </a>
          <button onClick={handleLogout} className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c0392b] transition-colors">
            Salir →
          </button>
        </div>
      </header>

      {/* ── Tab nav ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-[rgba(201,147,58,0.1)] bg-[#111218] px-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-5 py-3 font-typewriter text-[10px] tracking-[0.2em] uppercase transition-all border-b-2 ${
                activeTab === t.id
                  ? "border-[#c9933a] text-[#e8b455]"
                  : "border-transparent text-[#8b7355] hover:text-[#c4a882]"
              }`}
            >
              <span className="text-sm">{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-6">
        {activeTab === "overview"    && <OverviewTab    classId={selectedClassId} />}
        {activeTab === "students"    && <StudentsTab    classId={selectedClassId} />}
        {activeTab === "units"       && <UnitsTab       classId={selectedClassId} />}
        {activeTab === "vocab"       && <VocabTab       classId={selectedClassId} />}
        {activeTab === "leaderboard" && <LeaderboardTab classId={selectedClassId} />}
        {activeTab === "export"      && <ExportTab      classId={selectedClassId} />}
      </main>
    </div>
  );
}
