"use client";

import { useState } from "react";
import { useClassData } from "@/lib/hooks/useClassData";
import { TabHeader, Loading } from "./OverviewTab";

/**
 * Hoy — the five-minutes-before-class view.
 *
 * WHY THIS REPLACED THE LANDING TAB
 *
 * The dashboard opened on Overview: participation percentage, average
 * completion, time per activity. All true, none of it answering the question
 * the teacher actually arrives with. "Who needs me today" lived in Inbox,
 * "is the class on pace" lived nowhere at all, and assembling either meant
 * moving between four tabs before first period.
 *
 * So this page answers exactly two things, side by side, because both were
 * asked for and picking one would have meant opening a second tab anyway:
 *
 *   left   — WHO NEEDS ME: named students, one line of evidence, one action
 *   right  — ARE WE ON PACE: the class against the 36-week plan
 *
 * ONE STUDENT, ONE ROW
 *
 * The list names a student at most once, for their most urgent reason. A list
 * that reports the same child four times for four overlapping reasons is a
 * list that gets skimmed and then ignored.
 *
 * PROJECTOR MODE IS NOT DECORATION
 *
 * This screen is sometimes on the projector, and its whole point is naming
 * students who are struggling. Those two facts are in direct conflict, so the
 * privacy toggle is a first-class control in the header rather than a setting:
 * one click blanks every name and every number that could embarrass somebody,
 * and the layout does not move when it does.
 */

interface HelpRow {
  studentId: string;
  name: string;
  reason: string;
  detail: string;
  action: string;
  severity: "urgent" | "watch";
}

interface TodayData {
  termStart: string | null;
  week: number | null;
  expectedUnit: number | null;
  vitals: { students: number; activeToday: number; activeThisWeek: number; medianCases: number; onPace: number };
  pace: { ahead: number; onTrack: number; behind: number; notStarted: number };
  needHelp: HelpRow[];
  flags: number;
}

const GOLD = "#e8b455";
const RED = "#c0392b";
const GREEN = "#5a9e6f";

export default function HoyTab({ classId }: { classId: string }) {
  const { data, loading, lastUpdated, refetch } = useClassData<TodayData>("/api/teacher/dashboard/today", classId);
  const [privacy, setPrivacy] = useState(false);
  const [editingTerm, setEditingTerm] = useState(false);
  const [termDraft, setTermDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveTermStart() {
    setSaving(true);
    await fetch("/api/teacher/dashboard/today", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, termStart: termDraft || null }),
    }).catch(() => {});
    setSaving(false);
    setEditingTerm(false);
    refetch();
  }

  if (loading && !data) return <Loading />;

  const v = data?.vitals;
  const pace = data?.pace;
  const help = data?.needHelp ?? [];
  const urgent = help.filter((h) => h.severity === "urgent");
  const watch = help.filter((h) => h.severity === "watch");

  /** Names and per-student detail vanish together, so nothing identifies anyone. */
  const hide = (s: string) => (privacy ? "•".repeat(Math.min(9, Math.max(4, s.length))) : s);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <TabHeader title="Hoy" lastUpdated={lastUpdated} onRefresh={refetch} />
        <button
          onClick={() => setPrivacy((p) => !p)}
          title="Oculta nombres y datos personales para proyectar"
          className={`ml-auto px-3 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase border transition-colors ${
            privacy
              ? "border-[#5a9e6f] text-[#5a9e6f] bg-[rgba(90,158,111,0.12)]"
              : "border-[rgba(201,147,58,0.35)] text-[#c9933a] hover:text-[#e8b455]"
          }`}
        >
          {privacy ? "🔒 Modo proyector ACTIVO" : "🔓 Modo proyector"}
        </button>
      </div>

      {/* ── Vitals strip ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Vital label="Jugaron hoy" value={`${v?.activeToday ?? 0}`} sub={`de ${v?.students ?? 0} agentes`} />
        <Vital label="Esta semana" value={`${v?.activeThisWeek ?? 0}`} sub={`de ${v?.students ?? 0} agentes`} />
        <Vital
          label="Caso típico"
          value={`${v?.medianCases ?? 0}`}
          sub={data?.expectedUnit ? `el plan dice ${data.expectedUnit}` : "sin plan fijado"}
          tone={data?.expectedUnit && (v?.medianCases ?? 0) < data.expectedUnit - 1 ? "bad" : "good"}
        />
        <Vital
          label="Necesitan ayuda"
          value={`${help.length}`}
          sub={urgent.length ? `${urgent.length} urgente(s)` : "nada urgente"}
          tone={urgent.length ? "bad" : "good"}
        />
      </div>

      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-4 items-start">
        {/* ── WHO NEEDS ME ─────────────────────────────────────────────── */}
        <section className="border border-[rgba(201,147,58,0.15)]">
          <header className="px-4 py-2.5 border-b border-[rgba(201,147,58,0.15)] bg-[rgba(201,147,58,0.05)]">
            <h3 className="font-display font-bold text-[#f5e6c8]">¿Quién necesita ayuda?</h3>
            <p className="font-typewriter text-[10px] text-[#8b7355] mt-0.5">
              Cada agente aparece una sola vez, por su motivo más urgente. Lo de arriba primero.
            </p>
          </header>

          {help.length === 0 && (
            <p className="px-4 py-8 text-center font-typewriter text-xs text-[#5a9e6f]">
              Nadie marcado. Toda la clase está al día.
            </p>
          )}

          <ul>
            {help.slice(0, 12).map((h) => (
              <li
                key={h.studentId}
                className="px-4 py-2.5 border-b border-[rgba(201,147,58,0.08)] last:border-0 grid grid-cols-[auto_1fr] gap-3"
              >
                <span
                  className="mt-1 w-2 h-2 rounded-full shrink-0"
                  style={{ background: h.severity === "urgent" ? RED : GOLD }}
                />
                <div className="min-w-0">
                  <p className="font-typewriter text-[13px] text-[#f5e6c8]">
                    <span className={privacy ? "blur-[5px] select-none" : ""}>{hide(h.name)}</span>
                    <span className="text-[#8b7355]"> · {h.reason}</span>
                  </p>
                  <p className={`font-typewriter text-[11px] text-[#c4a882] leading-snug ${privacy ? "blur-[4px] select-none" : ""}`}>
                    {h.detail}
                  </p>
                  <p className="font-typewriter text-[11px] text-[#8b7355] leading-snug mt-0.5">→ {h.action}</p>
                </div>
              </li>
            ))}
          </ul>

          {help.length > 12 && (
            <p className="px-4 py-2 font-typewriter text-[10px] text-[#8b7355] border-t border-[rgba(201,147,58,0.1)]">
              …y {help.length - 12} más. Empieza por estos doce.
            </p>
          )}
        </section>

        {/* ── ARE WE ON PACE ───────────────────────────────────────────── */}
        <section className="border border-[rgba(201,147,58,0.15)]">
          <header className="px-4 py-2.5 border-b border-[rgba(201,147,58,0.15)] bg-[rgba(201,147,58,0.05)]">
            <h3 className="font-display font-bold text-[#f5e6c8]">¿Vamos a tiempo?</h3>
            <p className="font-typewriter text-[10px] text-[#8b7355] mt-0.5">
              {data?.week
                ? `Semana ${data.week} de 36 · el plan va por el Caso ${data.expectedUnit ?? "—"}`
                : "Falta la fecha de inicio del curso."}
            </p>
          </header>

          <div className="p-4 space-y-3">
            {!data?.termStart && !editingTerm && (
              <div className="border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] px-3 py-2.5">
                <p className="font-typewriter text-[11px] text-[#c4a882] leading-snug mb-2">
                  Sin fecha de inicio no puedo decirte si vais a tiempo — y prefiero no inventarme
                  una semana a partir del primer caso jugado, porque empezasteis en papel.
                </p>
                <button
                  onClick={() => { setEditingTerm(true); setTermDraft(""); }}
                  className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border border-[rgba(201,147,58,0.4)] text-[#e8b455] hover:bg-[rgba(201,147,58,0.15)]"
                >
                  Fijar el primer día de clase
                </button>
              </div>
            )}

            {editingTerm && (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  value={termDraft}
                  onChange={(e) => setTermDraft(e.target.value)}
                  className="bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-2 py-1 font-typewriter text-[11px] text-[#f5e6c8]"
                />
                <button
                  disabled={saving}
                  onClick={saveTermStart}
                  className="font-typewriter text-[10px] text-[#5a9e6f] px-2 disabled:opacity-40"
                >
                  ✓ guardar
                </button>
                <button onClick={() => setEditingTerm(false)} className="font-typewriter text-[10px] text-[#8b7355] px-1">
                  ✕
                </button>
              </div>
            )}

            {pace && (
              <>
                <PaceBar pace={pace} total={v?.students ?? 0} />
                <div className="space-y-1.5">
                  <PaceRow label="Adelantados" n={pace.ahead} color={GREEN} />
                  <PaceRow label="A tiempo" n={pace.onTrack} color={GOLD} />
                  <PaceRow label="Atrasados" n={pace.behind} color={RED} />
                  <PaceRow label="Sin empezar" n={pace.notStarted} color="#6b5847" />
                </div>
              </>
            )}

            {data?.termStart && (
              <button
                onClick={() => { setEditingTerm(true); setTermDraft(data.termStart ?? ""); }}
                className="font-typewriter text-[10px] text-[#8b7355] hover:text-[#c9933a] underline decoration-dotted"
              >
                Curso empezó el {data.termStart} · cambiar
              </button>
            )}
          </div>
        </section>
      </div>

      {watch.length > 0 && urgent.length > 0 && (
        <p className="font-typewriter text-[10px] text-[#4a3a2a] px-1">
          {urgent.length} urgente(s) y {watch.length} para vigilar. Si solo tienes tiempo para una cosa hoy, son los puntos rojos.
        </p>
      )}
    </div>
  );
}

function Vital({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "good" | "bad" }) {
  return (
    <div className="border border-[rgba(201,147,58,0.15)] bg-[rgba(201,147,58,0.03)] px-3 py-2.5">
      <p className="font-typewriter text-[9px] tracking-[0.25em] uppercase text-[#8b7355]">{label}</p>
      <p
        className="font-display text-2xl font-bold leading-tight"
        style={{ color: tone === "bad" ? RED : tone === "good" ? GREEN : GOLD }}
      >
        {value}
      </p>
      <p className="font-typewriter text-[10px] text-[#8b7355]">{sub}</p>
    </div>
  );
}

function PaceBar({ pace, total }: { pace: TodayData["pace"]; total: number }) {
  const n = Math.max(1, total);
  const seg = [
    { v: pace.ahead, c: GREEN },
    { v: pace.onTrack, c: GOLD },
    { v: pace.behind, c: RED },
    { v: pace.notStarted, c: "#6b5847" },
  ];
  return (
    <div className="flex h-3 w-full overflow-hidden border border-[rgba(201,147,58,0.2)]">
      {seg.map((s, i) => (
        <div key={i} style={{ width: `${(s.v / n) * 100}%`, background: s.c }} />
      ))}
    </div>
  );
}

function PaceRow({ label, n, color }: { label: string; n: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 shrink-0" style={{ background: color }} />
      <span className="font-typewriter text-[11px] text-[#c4a882] flex-1">{label}</span>
      <span className="font-typewriter text-sm tabular-nums" style={{ color }}>{n}</span>
    </div>
  );
}
