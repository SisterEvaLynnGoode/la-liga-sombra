"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import StudentsTab from "@/components/dashboard/tabs/StudentsTab";
import UnitsTab from "@/components/dashboard/tabs/UnitsTab";
import VocabTab from "@/components/dashboard/tabs/VocabTab";
import LeaderboardTab from "@/components/dashboard/tabs/LeaderboardTab";
import ExportTab from "@/components/dashboard/tabs/ExportTab";
import BossTab from "@/components/dashboard/tabs/BossTab";
import BandejaTab from "@/components/dashboard/tabs/BandejaTab";
import PacingTab from "@/components/dashboard/tabs/PacingTab";
import GradesTab from "@/components/dashboard/tabs/GradesTab";
import HoyTab from "@/components/dashboard/tabs/HoyTab";
import MundosTab from "@/components/dashboard/tabs/MundosTab";

interface ClassRow { id: string; class_code: string; teacher_name: string; period_name: string; student_count: number }

// Quick-send class messages shown in Spanish to STUDENTS — these stay in
// Spanish on purpose because students see them in-app.
const PRESET_MESSAGES = [
  "⏰ 5 minutos restantes",
  "⏰ 2 minutos restantes",
  "⏸ Pausa ahora, por favor",
  "🎉 ¡Excelente trabajo a todos!",
  "👀 Miren su pantalla",
];

type TabId = "hoy" | "overview" | "students" | "units" | "vocab" | "leaderboard" | "export" | "boss" | "bandeja" | "pacing" | "grades" | "mundos";

/**
 * Four tabs you use, and everything else behind "Más".
 *
 * There were eleven tabs in one row, in no order, mixing four different jobs:
 * act now, assess, plan, and admin. Nothing answered "who needs me today"
 * without visiting three of them.
 *
 * PRIMARY is the daily loop — arrive and see who is stuck and whether the class
 * is on pace, then grade, then look something up about a student, then project
 * the scoreboard. SECONDARY is real and one click away, but it is reference
 * material and a year plan, not something read before first period.
 */
const PRIMARY: Array<{ id: TabId; label: string; emoji: string }> = [
  { id: "hoy",         label: "Hoy",      emoji: "☀️" },
  { id: "grades",      label: "Notas",    emoji: "🎓" },
  { id: "students",    label: "Agentes",  emoji: "👤" },
  { id: "leaderboard", label: "Marcador", emoji: "🏆" },
];

const SECONDARY: Array<{ id: TabId; label: string; emoji: string }> = [
  { id: "bandeja",  label: "Inbox (todas las alertas)",  emoji: "📥" },
  { id: "overview", label: "Overview (cifras de clase)", emoji: "📊" },
  { id: "vocab",    label: "Vocabulario",                emoji: "📖" },
  { id: "units",    label: "Estándares ACTFL",           emoji: "🗺️" },
  { id: "pacing",   label: "Plan de 36 semanas",         emoji: "📅" },
  { id: "mundos",   label: "Mundos",                     emoji: "🌎" },
  { id: "boss",     label: "Bosses",                     emoji: "🎯" },
  { id: "export",   label: "Exportar CSV",               emoji: "↓" },
];

const TABS = PRIMARY;

export default function DashboardClient({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("hoy");
  const [moreOpen, setMoreOpen] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertSending, setAlertSending] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [inboxCount, setInboxCount] = useState(0);

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

  // Fetch unacknowledged inbox count whenever class changes
  useEffect(() => {
    if (!selectedClassId) return;
    fetch(`/api/teacher/dashboard/inbox?classId=${selectedClassId}`)
      .then((r) => r.json())
      .then((d: { unacknowledgedCount?: number }) => setInboxCount(d.unacknowledgedCount ?? 0))
      .catch(() => {});
  }, [selectedClassId]);

  async function handleLogout() {
    await fetch("/api/teacher/auth", { method: "DELETE" });
    router.push("/");
  }

  async function sendAlert() {
    if (!alertMsg.trim() || !selectedClassId) return;
    setAlertSending(true);
    await fetch("/api/teacher/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: selectedClassId, message: alertMsg.trim() }),
    }).catch(() => {});
    setAlertSent(true);
    setAlertSending(false);
    setTimeout(() => { setAlertSent(false); setAlertOpen(false); setAlertMsg(""); }, 2000);
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="min-h-screen bg-[#0c0e14] flex flex-col">
      {/* ── Top nav ─────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-[rgba(201,147,58,0.15)] bg-[#111218] px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">Teacher Panel</p>
            <h1 className="font-display font-bold text-lg text-[#e8b455] leading-tight">Headquarters</h1>
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
                  {c.class_code} — {c.period_name} ({c.student_count} students)
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
          {/* Send class alert */}
          <div className="relative">
            <button
              onClick={() => { setAlertOpen((v) => !v); setAlertSent(false); }}
              disabled={!selectedClassId}
              className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border border-[rgba(201,147,58,0.25)] text-[#8b7355] hover:text-[#e8b455] hover:border-[rgba(201,147,58,0.5)] transition-colors disabled:opacity-40"
            >
              📢 Alert
            </button>
            {alertOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-72 border border-[rgba(201,147,58,0.3)] bg-[#1a1614] shadow-xl p-4 space-y-3">
                <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">Send class alert (shown in Spanish to students)</p>
                <div className="flex flex-col gap-1.5">
                  {PRESET_MESSAGES.map((m) => (
                    <button key={m} onClick={() => setAlertMsg(m)}
                      className={`text-left font-typewriter text-xs px-2 py-1.5 border transition-colors ${alertMsg === m ? "border-[rgba(201,147,58,0.4)] text-[#e8b455] bg-[rgba(201,147,58,0.08)]" : "border-[rgba(201,147,58,0.1)] text-[#8b7355] hover:text-[#c4a882]"}`}>
                      {m}
                    </button>
                  ))}
                </div>
                <textarea
                  value={alertMsg}
                  onChange={(e) => setAlertMsg(e.target.value)}
                  placeholder="Custom message…"
                  rows={2}
                  className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-2 font-typewriter text-xs text-[#f5e6c8] placeholder-[#3a3028] resize-none"
                />
                <button
                  onClick={sendAlert}
                  disabled={!alertMsg.trim() || alertSending}
                  className="w-full clip-skew py-2 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40"
                >
                  {alertSent ? "✓ Sent!" : alertSending ? "Sending…" : "Send to all →"}
                </button>
              </div>
            )}
          </div>
          <a href="/teacher/lessons" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors">
            📋 Lesson Plans
          </a>
          <a href="/teacher/worksheets" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors">
            🖨 Worksheets
          </a>
          <a href="/teacher/decks" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors">
            🃏 Decks
          </a>
          <a href="/teacher/pasaporte" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors">
            📕 Passport
          </a>
          <a href="/teacher/presentations" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors">
            🎤 Presentations
          </a>
          <a href="/teacher/characters" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors">
            🎭 Characters
          </a>
          <a href="/teacher/author" className="font-typewriter text-[10px] tracking-widests uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors">
            ✏ Create unit
          </a>
          <a href="/teacher/setup" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors">
            ⚙ Setup
          </a>
          {isAdmin && (
            <a href="/teacher/admin" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors" title="Owner only">
              🎫 Codes
            </a>
          )}
          <button onClick={handleLogout} className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c0392b] transition-colors">
            Log out →
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
              className={`relative flex items-center gap-1.5 px-5 py-3 font-typewriter text-[10px] tracking-[0.2em] uppercase transition-all border-b-2 ${
                activeTab === t.id
                  ? "border-[#c9933a] text-[#e8b455]"
                  : "border-transparent text-[#8b7355] hover:text-[#c4a882]"
              }`}
            >
              <span className="text-sm">{t.emoji}</span>
              <span>{t.label}</span>
              {t.id === "bandeja" && inboxCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#c0392b] text-white font-typewriter text-[9px] flex items-center justify-center leading-none">
                  {inboxCount > 99 ? "99+" : inboxCount}
                </span>
              )}
            </button>
          ))}

          {/* Everything outside the daily loop. */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-5 py-3 font-typewriter text-[10px] tracking-[0.2em] uppercase transition-all border-b-2 ${
                SECONDARY.some((t) => t.id === activeTab)
                  ? "border-[#c9933a] text-[#e8b455]"
                  : "border-transparent text-[#8b7355] hover:text-[#c4a882]"
              }`}
            >
              <span>Más</span>
              <span className="text-[8px]">{moreOpen ? "▲" : "▼"}</span>
            </button>

            {moreOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMoreOpen(false)} />
                <div className="absolute left-0 top-full z-40 min-w-[16rem] border border-[rgba(201,147,58,0.25)] bg-[#14151b] shadow-xl">
                  {SECONDARY.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setActiveTab(t.id); setMoreOpen(false); }}
                      className={`w-full text-left flex items-center gap-2 px-4 py-2.5 font-typewriter text-[11px] transition-colors ${
                        activeTab === t.id
                          ? "text-[#e8b455] bg-[rgba(201,147,58,0.1)]"
                          : "text-[#c4a882] hover:bg-[rgba(201,147,58,0.06)]"
                      }`}
                    >
                      <span>{t.emoji}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-6">
        {activeTab === "hoy"         && <HoyTab         classId={selectedClassId} />}
        {activeTab === "bandeja"     && <BandejaTab     classId={selectedClassId} />}
        {activeTab === "overview"    && <OverviewTab    classId={selectedClassId} />}
        {activeTab === "mundos"      && <MundosTab />}
        {activeTab === "pacing"      && <PacingTab      classId={selectedClassId} />}
        {activeTab === "grades"      && <GradesTab      classId={selectedClassId} />}
        {activeTab === "students"    && <StudentsTab    classId={selectedClassId} />}
        {activeTab === "units"       && <UnitsTab       classId={selectedClassId} />}
        {activeTab === "vocab"       && <VocabTab       classId={selectedClassId} />}
        {activeTab === "leaderboard" && <LeaderboardTab classId={selectedClassId} />}
        {activeTab === "export"      && <ExportTab      classId={selectedClassId} />}
        {activeTab === "boss"        && <BossTab        classId={selectedClassId} />}
      </main>
    </div>
  );
}
