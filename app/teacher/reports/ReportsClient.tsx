"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { practiceFor } from "@/lib/reports/practice";
import type { SkillBucket } from "@/lib/reports/skills";

/**
 * Three printable reports off one dataset.
 *
 *   class   — one or two pages an administrator can read without knowing the
 *             game: every student, and the class's own strong and weak topics.
 *   students — one page per student, same numbers in detail.
 *   parent   — a two-to-four page report card per child, in English, where
 *             every weak area comes with something to do about it at home.
 *
 * Print → "Save as PDF" is the export. A server-rendered PDF would need a
 * headless browser in a serverless function; the browser's own print engine
 * does the same job, and the teacher can see exactly what the parent will get
 * before it is sent.
 */

interface BossScore {
  bossId: string;
  label: string;
  afterCaso: number;
  status: "completed" | "in_progress" | "skipped" | "not_started";
  scorePct: number | null;
  points: number | null;
  ending: string | null;
  completedAt: string | null;
  stages: Array<{ label: string; skill: string; score: number; maxScore: number; pct: number | null; skipped: boolean }>;
}
interface Profile {
  vocabByTopic: SkillBucket[];
  grammarBySkill: SkillBucket[];
  listening: SkillBucket | null;
  speaking: SkillBucket | null;
  overallPct: number | null;
  totalItems: number;
  totalMastered: number;
  strengths: SkillBucket[];
  needsWork: SkillBucket[];
}
interface Student {
  studentId: string;
  displayName: string;
  /** The real name, when the teacher has set one. Null falls back to the game handle. */
  reportName: string | null;
  sisId: string | null;
  bosses: BossScore[];
  bossAveragePct: number | null;
  bossesGraded: number;
  profile: Profile;
}
interface Payload {
  students: Student[];
  className: string | null;
  teacherName: string | null;
  generatedAt: string;
}

type Mode = "class" | "students" | "parent";

const MODES: Array<{ id: Mode; label: string; blurb: string }> = [
  { id: "class",    label: "Class summary",      blurb: "For your administrator — the whole class on one or two pages." },
  { id: "students", label: "Student summaries",  blurb: "One page per student, every topic and every boss fight." },
  { id: "parent",   label: "Parent report cards", blurb: "Two to four pages per child, in English, with practice to do at home." },
];

/**
 * The name to print. display_name is whatever the student typed when they
 * joined — "MopHead", "babyskelly" — which is fine in the game and useless on
 * a report a family reads, so the teacher's report_name wins when it is set.
 */
function nameFor(s: Student): string {
  return s.reportName?.trim() || s.displayName;
}

function statusWord(status: BossScore["status"]): string {
  return status === "in_progress" ? "in progress"
    : status === "not_started" ? "not started"
    : status;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** The practice engine needs to know what sort of skill a weak area is. */
function kindOf(bucket: SkillBucket, p: Profile): "vocab" | "grammar" | "listening" | "speaking" {
  if (p.listening && bucket.label === p.listening.label) return "listening";
  if (p.speaking && bucket.label === p.speaking.label) return "speaking";
  if (p.grammarBySkill.some((b) => b.label === bucket.label)) return "grammar";
  return "vocab";
}

/** Plain English for a number, because "72%" alone tells a parent nothing. */
function masteryWords(b: SkillBucket): string {
  const m = b.masteredPct ?? 0;
  const f = b.firstTryPct ?? 0;
  if (m >= 95 && f >= 85) return "Solid. They knew almost all of this the first time they saw it.";
  if (m >= 90 && f >= 75) return "Strong. They worked out nearly everything here, most of it straight away.";
  if (m >= 90) return "They got there on all of it, but needed more than one try on much of it — the knowledge is new rather than secure.";
  if (m >= 75) return "Mostly there. A few items are still missing, and first attempts are often wrong.";
  if (m >= 50) return "About half of this is not yet learned. This is where practice pays off fastest.";
  return "Most of this has not been learned yet. Short, frequent practice will move it quickly.";
}

export default function ReportsClient({
  classId,
  initialMode,
  initialStudentId,
}: {
  classId: string;
  initialMode: Mode;
  initialStudentId: string | null;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [only, setOnly] = useState<string | null>(initialStudentId);
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) return;
    let live = true;
    setData(null);
    setError(null);
    // unmastered=all brings every child's missed items in one query — the
    // practice activities on the parent report are built from them.
    fetch(`/api/teacher/dashboard/mastery?classId=${encodeURIComponent(classId)}&unmastered=all`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => { if (live) setData(json as Payload); })
      .catch((e) => { if (live) setError(e instanceof Error ? e.message : "Could not load"); });
    return () => { live = false; };
  }, [classId]);

  const students = useMemo(() => {
    const all = (data?.students ?? []).filter(
      (s) => s.profile.totalItems > 0 || s.bosses.some((b) => b.status !== "not_started")
    );
    return only ? all.filter((s) => s.studentId === only) : all;
  }, [data, only]);

  if (!classId) {
    return (
      <Shell>
        <p className="font-typewriter text-sm text-[#c4a882]">
          No class chosen. Open <Link href="/teacher/dashboard" className="text-[#e8b455] underline">Notas → Bosses &amp; skills</Link> and
          use one of the print buttons there.
        </p>
      </Shell>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0e14]">
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      {/* ── Toolbar (screen only) ─────────────────────────────────────────── */}
      <div className="print:hidden sticky top-0 z-20 border-b border-[rgba(201,147,58,0.2)] bg-[#111218] px-6 py-3 space-y-3">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/teacher/dashboard" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a]">
            ← Dashboard
          </Link>
          <div className="w-px h-8 bg-[rgba(201,147,58,0.15)]" />
          <div>
            <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">
              {data?.className ?? "Loading…"}
            </p>
            <h1 className="font-display font-bold text-lg text-[#e8b455] leading-tight">Reports</h1>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => window.print()}
            disabled={!data}
            className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-[#c9933a] bg-[rgba(201,147,58,0.12)] text-[#e8b455] hover:bg-[rgba(201,147,58,0.22)] disabled:opacity-40 transition-colors"
          >
            🖨 Print / Save as PDF
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              title={m.blurb}
              className={`font-typewriter text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors ${
                mode === m.id
                  ? "border-[#c9933a] bg-[rgba(201,147,58,0.1)] text-[#e8b455]"
                  : "border-[rgba(201,147,58,0.2)] text-[#8b7355] hover:text-[#c9933a]"
              }`}
            >
              {m.label}
            </button>
          ))}
          <div className="w-px h-7 bg-[rgba(201,147,58,0.15)]" />
          <select
            value={only ?? ""}
            onChange={(e) => setOnly(e.target.value || null)}
            className="bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-2 py-1.5 font-typewriter text-[11px] text-[#f5e6c8]"
          >
            <option value="">Everyone ({data?.students.length ?? 0})</option>
            {(data?.students ?? []).map((s) => (
              <option key={s.studentId} value={s.studentId}>{nameFor(s)}</option>
            ))}
          </select>
          <p className="font-typewriter text-[10px] text-[#4a3a2a] self-center">
            {MODES.find((m) => m.id === mode)?.blurb}
          </p>
        </div>

        {data && <NameEditor data={data} onSaved={setData} />}
      </div>

      {error && (
        <p className="font-typewriter text-sm text-[#c0392b] p-6">Could not load the class data ({error}).</p>
      )}
      {!data && !error && (
        <p className="font-typewriter text-sm text-[#8b7355] p-6 animate-pulse">Reading the class…</p>
      )}

      {data && (
        <div className="ws-root mx-auto my-6 max-w-[820px] bg-white text-black px-10 py-10 print:my-0 print:max-w-none print:px-0 print:py-0">
          {mode === "class" && <ClassSummary data={data} students={students} />}
          {mode === "students" && students.map((s) => <StudentSummary key={s.studentId} s={s} data={data} />)}
          {mode === "parent" && students.map((s) => <ParentReport key={s.studentId} s={s} data={data} />)}
          {students.length === 0 && (
            <p className="font-serif text-sm">No student in this class has recorded work yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Real names for the reports, typed once.
 *
 * Students sign up with a handle — "MopHead", "babyskelly", "nick cage" — and
 * a progress report addressed to a handle cannot be sent to a family or handed
 * to an administrator. This saves straight to the student record, so it is
 * typed once and every later report has it.
 */
function NameEditor({ data, onSaved }: { data: Payload; onSaved: (p: Payload) => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const missing = data.students.filter((s) => !s.reportName?.trim()).length;

  async function save(studentId: string, value: string) {
    const student = data.students.find((s) => s.studentId === studentId);
    const next = value.trim();
    if (!student || next === (student.reportName ?? "")) return;
    setSaving(studentId);
    const res = await fetch("/api/teacher/dashboard/grades", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, reportName: next }),
    }).catch(() => null);
    setSaving(null);
    if (!res?.ok) return;
    onSaved({
      ...data,
      students: data.students.map((s) =>
        s.studentId === studentId ? { ...s, reportName: next || null } : s
      ),
    });
  }

  return (
    <div className="border-t border-[rgba(201,147,58,0.12)] pt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="font-typewriter text-[10px] tracking-[0.15em] uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors"
      >
        {open ? "▾" : "▸"} Names for families
        {missing > 0 && (
          <span className="text-[#c0392b] ml-2 normal-case tracking-normal">
            {missing} student{missing === 1 ? "" : "s"} would be named by their game handle
          </span>
        )}
      </button>

      {open && (
        <div className="mt-2 max-h-56 overflow-y-auto grid md:grid-cols-3 gap-x-5 gap-y-1 pr-2">
          {data.students.map((s) => (
            <label key={s.studentId} className="flex items-center gap-2">
              <span className="font-typewriter text-[10px] text-[#8b7355] w-28 truncate shrink-0" title={s.displayName}>
                {s.displayName}
              </span>
              <input
                defaultValue={s.reportName ?? ""}
                placeholder="real name"
                maxLength={80}
                onBlur={(e) => save(s.studentId, e.target.value)}
                className={`flex-1 min-w-0 bg-[#0d0b0a] border px-2 py-1 font-typewriter text-[11px] text-[#f5e6c8] focus:outline-none focus:border-[#c9933a] ${
                  saving === s.studentId ? "border-[#5a9e6f]" : "border-[rgba(201,147,58,0.2)]"
                }`}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0c0e14] px-6 py-10">
      <Link href="/teacher/dashboard" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a]">
        ← Dashboard
      </Link>
      <div className="mt-6">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Letterhead shared by all three reports
   ══════════════════════════════════════════════════════════════════════════ */

function Letterhead({ data, title, subtitle }: { data: Payload; title: string; subtitle?: string }) {
  return (
    <header className="border-b-2 border-black pb-3 mb-5">
      <div className="flex justify-between items-end gap-4">
        <div>
          <p className="font-serif text-[10px] uppercase tracking-[0.3em]">La Liga Sombra · Spanish 1</p>
          <h1 className="font-serif text-2xl font-bold leading-tight">{title}</h1>
          {subtitle && <p className="font-serif text-sm italic">{subtitle}</p>}
        </div>
        <div className="font-serif text-[10px] text-right leading-snug shrink-0">
          {data.className && <p>{data.className}</p>}
          {data.teacherName && <p>{data.teacherName}</p>}
          <p>{fmtDate(data.generatedAt)}</p>
        </div>
      </div>
    </header>
  );
}

/** A table row's percentage, printed so it survives a black-and-white printer. */
function Pct({ value }: { value: number | null }) {
  if (value == null) return <span className="text-[#777]">—</span>;
  return <span className={value < 60 ? "font-bold" : ""}>{value}%</span>;
}

/* ══════════════════════════════════════════════════════════════════════════
   1. Class summary — the administrator's page
   ══════════════════════════════════════════════════════════════════════════ */

function ClassSummary({ data, students }: { data: Payload; students: Student[] }) {
  const bossMeta = students[0]?.bosses ?? [];

  const graded = students.filter((s) => s.bossAveragePct != null);
  const classBossAvg = graded.length
    ? Math.round(graded.reduce((n, s) => n + (s.bossAveragePct ?? 0), 0) / graded.length)
    : null;
  const withSkills = students.filter((s) => s.profile.overallPct != null);
  const classMastery = withSkills.length
    ? Math.round(withSkills.reduce((n, s) => n + (s.profile.overallPct ?? 0), 0) / withSkills.length)
    : null;

  // Class-level topic picture: the same topic averaged across every student who
  // has met it. This is the part an administrator actually acts on — it names
  // what the class as a whole has and has not learned.
  const topicAgg = new Map<string, { kind: "Vocabulary" | "Grammar"; items: number; mastered: number; firstTry: number; students: number }>();
  for (const s of students) {
    for (const [kind, list] of [["Vocabulary", s.profile.vocabByTopic], ["Grammar", s.profile.grammarBySkill]] as const) {
      for (const b of list) {
        const cur = topicAgg.get(b.label) ?? { kind: kind as "Vocabulary" | "Grammar", items: 0, mastered: 0, firstTry: 0, students: 0 };
        cur.items += b.items;
        cur.mastered += b.mastered;
        cur.firstTry += b.firstTry;
        cur.students += 1;
        topicAgg.set(b.label, cur);
      }
    }
  }
  const topics = Array.from(topicAgg.entries())
    .map(([label, t]) => ({
      label,
      kind: t.kind,
      students: t.students,
      masteredPct: t.items ? Math.round((t.mastered / t.items) * 100) : null,
      firstTryPct: t.items ? Math.round((t.firstTry / t.items) * 100) : null,
    }))
    .filter((t) => t.students >= 3)
    .sort((a, b) => (a.firstTryPct ?? 100) - (b.firstTryPct ?? 100));

  return (
    <>
      <section className="ws-page">
        <Letterhead data={data} title="Class Progress Summary" subtitle="Boss assessments and skill mastery" />

        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            ["Students with recorded work", String(students.length)],
            ["Average boss assessment", classBossAvg != null ? `${classBossAvg}%` : "—"],
            ["Average skill mastery", classMastery != null ? `${classMastery}%` : "—"],
            ["Boss assessments graded", String(students.reduce((n, s) => n + s.bossesGraded, 0))],
          ].map(([label, value]) => (
            <div key={label} className="border border-black px-3 py-2">
              <p className="font-serif text-[9px] uppercase tracking-[0.15em] leading-tight">{label}</p>
              <p className="font-serif text-xl font-bold leading-none mt-1">{value}</p>
            </div>
          ))}
        </div>

        <p className="font-serif text-[11px] leading-relaxed mb-4">
          <b>How to read this.</b> A <i>boss assessment</i> is a cumulative five-part test the student takes after a
          block of cases; it is scored out of the points available and is the single number that goes in the gradebook.
          <i> Skill mastery</i> is the share of individual items — words, sentences, questions — the student has answered
          correctly at least once. <i>First try</i> is the share they answered correctly the first time they met it, and
          is the better measure of secure knowledge: mastery rises because the program re-asks an item until the student
          gets it, which is deliberate, but it means mastery alone reads generously.
        </p>

        <table className="w-full border-collapse font-serif text-[10px]">
          <thead>
            <tr>
              <th className="border border-black px-1.5 py-1 text-left">Student</th>
              {bossMeta.map((b) => (
                <th key={b.bossId} className="border border-black px-1.5 py-1 text-center">
                  {b.label.replace("Operación ", "")}
                  <span className="block font-normal text-[8px]">after case {b.afterCaso}</span>
                </th>
              ))}
              <th className="border border-black px-1.5 py-1 text-center">Boss avg.</th>
              <th className="border border-black px-1.5 py-1 text-center">Mastery</th>
              <th className="border border-black px-1.5 py-1 text-center">First try</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const ft = s.profile.totalItems
                ? Math.round(
                    ([...s.profile.vocabByTopic, ...s.profile.grammarBySkill,
                      ...(s.profile.listening ? [s.profile.listening] : []),
                      ...(s.profile.speaking ? [s.profile.speaking] : [])]
                      .reduce((n, b) => n + b.firstTry, 0) / s.profile.totalItems) * 100
                  )
                : null;
              return (
                <tr key={s.studentId}>
                  <td className="border border-black px-1.5 py-1">
                    {nameFor(s)}
                    {s.reportName && <span className="block text-[8px]">in game: {s.displayName}</span>}
                  </td>
                  {s.bosses.map((b) => (
                    <td key={b.bossId} className="border border-black px-1.5 py-1 text-center">
                      {b.scorePct != null ? `${b.scorePct}%`
                        : b.status === "completed" ? "passed"
                        : b.status === "not_started" ? "—"
                        : statusWord(b.status)}
                    </td>
                  ))}
                  <td className="border border-black px-1.5 py-1 text-center"><Pct value={s.bossAveragePct} /></td>
                  <td className="border border-black px-1.5 py-1 text-center"><Pct value={s.profile.overallPct} /></td>
                  <td className="border border-black px-1.5 py-1 text-center"><Pct value={ft} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="font-serif text-[9px] italic mt-2">
          “passed” marks a boss assessment finished before per-part scores were recorded: the student completed it, but
          no percentage can honestly be reconstructed. Bold type marks a figure below 60%.
        </p>
      </section>

      {topics.length > 0 && (
        <section className="ws-page">
          <Letterhead data={data} title="What the Class Has Learned" subtitle="By topic, weakest first" />

          <p className="font-serif text-[11px] leading-relaxed mb-4">
            Each row is one topic of the course, averaged across every student who has reached it. Topics reached by
            fewer than three students are left out. Ordered by first-try accuracy, so the rows at the top are where
            re-teaching would do the most good.
          </p>

          <table className="w-full border-collapse font-serif text-[10px]">
            <thead>
              <tr>
                <th className="border border-black px-2 py-1 text-left">Topic</th>
                <th className="border border-black px-2 py-1 text-left">Area</th>
                <th className="border border-black px-2 py-1 text-center">Students</th>
                <th className="border border-black px-2 py-1 text-center">Mastery</th>
                <th className="border border-black px-2 py-1 text-center">First try</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={`${t.kind}-${t.label}`}>
                  <td className="border border-black px-2 py-1">{t.label}</td>
                  <td className="border border-black px-2 py-1">{t.kind}</td>
                  <td className="border border-black px-2 py-1 text-center">{t.students}</td>
                  <td className="border border-black px-2 py-1 text-center"><Pct value={t.masteredPct} /></td>
                  <td className="border border-black px-2 py-1 text-center"><Pct value={t.firstTryPct} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   2. Student summary — one page per student, for the teacher's file
   ══════════════════════════════════════════════════════════════════════════ */

function StudentSummary({ s, data }: { s: Student; data: Payload }) {
  const started = s.bosses.filter((b) => b.status !== "not_started");

  return (
    <section className="ws-page">
      <Letterhead
        data={data}
        title={nameFor(s)}
        subtitle={[s.reportName ? `in game: ${s.displayName}` : null, s.sisId ? `Student ID ${s.sisId}` : null]
          .filter(Boolean).join(" · ") || undefined}
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          ["Boss assessment average", s.bossAveragePct != null ? `${s.bossAveragePct}%` : "—"],
          ["Skill mastery", s.profile.overallPct != null ? `${s.profile.overallPct}%` : "—"],
          ["Items practised", `${s.profile.totalMastered} / ${s.profile.totalItems}`],
        ].map(([label, value]) => (
          <div key={label} className="border border-black px-3 py-2">
            <p className="font-serif text-[9px] uppercase tracking-[0.15em]">{label}</p>
            <p className="font-serif text-xl font-bold leading-none mt-1">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-serif text-sm font-bold uppercase tracking-[0.2em] border-b border-black mb-2">
        Boss assessments
      </h2>
      {started.length === 0 ? (
        <p className="font-serif text-[11px] italic mb-5">No boss assessment attempted yet.</p>
      ) : (
        <table className="w-full border-collapse font-serif text-[10px] mb-5">
          <thead>
            <tr>
              <th className="border border-black px-2 py-1 text-left">Assessment</th>
              <th className="border border-black px-2 py-1 text-center">Score</th>
              <th className="border border-black px-2 py-1 text-left">Parts</th>
            </tr>
          </thead>
          <tbody>
            {started.map((b) => (
              <tr key={b.bossId}>
                <td className="border border-black px-2 py-1">
                  {b.label}
                  <span className="block text-[8px]">after case {b.afterCaso}{b.completedAt ? ` · ${fmtDate(b.completedAt)}` : ""}</span>
                </td>
                <td className="border border-black px-2 py-1 text-center">
                  {b.scorePct != null ? `${b.scorePct}%` : b.status === "completed" ? "passed" : statusWord(b.status)}
                </td>
                <td className="border border-black px-2 py-1">
                  {b.stages.length
                    ? b.stages.map((st) => `${st.label} ${st.score}/${st.maxScore}`).join(" · ")
                    : "not recorded"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="grid grid-cols-2 gap-6">
        <BucketTable title="Vocabulary by topic" buckets={s.profile.vocabByTopic} />
        <BucketTable
          title="Grammar, listening & speaking"
          buckets={[
            ...s.profile.grammarBySkill,
            ...(s.profile.listening ? [s.profile.listening] : []),
            ...(s.profile.speaking ? [s.profile.speaking] : []),
          ]}
        />
      </div>
    </section>
  );
}

function BucketTable({ title, buckets }: { title: string; buckets: SkillBucket[] }) {
  return (
    <div>
      <h2 className="font-serif text-sm font-bold uppercase tracking-[0.2em] border-b border-black mb-2">{title}</h2>
      {buckets.length === 0 ? (
        <p className="font-serif text-[11px] italic">Nothing recorded yet.</p>
      ) : (
        <table className="w-full border-collapse font-serif text-[9.5px]">
          <thead>
            <tr>
              <th className="border border-black px-1.5 py-0.5 text-left">Topic</th>
              <th className="border border-black px-1.5 py-0.5 text-center">Items</th>
              <th className="border border-black px-1.5 py-0.5 text-center">Mastered</th>
              <th className="border border-black px-1.5 py-0.5 text-center">1st try</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((b) => (
              <tr key={b.label}>
                <td className="border border-black px-1.5 py-0.5">{b.label}</td>
                <td className="border border-black px-1.5 py-0.5 text-center">{b.items}</td>
                <td className="border border-black px-1.5 py-0.5 text-center"><Pct value={b.masteredPct} /></td>
                <td className="border border-black px-1.5 py-0.5 text-center"><Pct value={b.firstTryPct} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   3. Parent report card — English, 2–4 pages, with practice to do at home
   ══════════════════════════════════════════════════════════════════════════ */

function ParentReport({ s, data }: { s: Student; data: Payload }) {
  const p = s.profile;
  const gaps = p.needsWork;
  const bossesTaken = s.bosses.filter((b) => b.status === "completed").length;
  const casesCovered = Math.max(
    0,
    ...p.vocabByTopic.map((b) => b.caso ?? 0),
    ...p.grammarBySkill.map((b) => b.caso ?? 0)
  );

  return (
    <>
      {/* ── Page 1 — what this is, and how they are doing ──────────────── */}
      <section className="ws-page">
        <Letterhead data={data} title={`Spanish Progress Report: ${nameFor(s)}`} />

        <p className="font-serif text-[11.5px] leading-relaxed mb-3">
          This report covers your child&rsquo;s work in Spanish 1. The class learns through a detective story:
          students take on cases set in a different Spanish-speaking country each time, and to solve a case they
          have to understand and use real Spanish — reading a witness statement, listening to a recording,
          building sentences, choosing the right verb form. The program records every one of those small moments,
          which is where the numbers below come from.
        </p>

        <div className="border-2 border-black px-4 py-3 mb-4">
          <h2 className="font-serif text-sm font-bold uppercase tracking-[0.2em] mb-2">The short version</h2>
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div>
              <p className="font-serif text-[9px] uppercase tracking-[0.15em]">Skills learned</p>
              <p className="font-serif text-2xl font-bold leading-none">
                {p.overallPct != null ? `${p.overallPct}%` : "—"}
              </p>
              <p className="font-serif text-[9px]">{p.totalMastered} of {p.totalItems} items</p>
            </div>
            <div>
              <p className="font-serif text-[9px] uppercase tracking-[0.15em]">Unit tests</p>
              <p className="font-serif text-2xl font-bold leading-none">
                {s.bossAveragePct != null ? `${s.bossAveragePct}%` : "—"}
              </p>
              <p className="font-serif text-[9px]">
                {s.bossAveragePct != null
                  ? `${bossesTaken} completed`
                  : bossesTaken > 0 ? `${bossesTaken} completed, not scored` : "none taken yet"}
              </p>
            </div>
            <div>
              <p className="font-serif text-[9px] uppercase tracking-[0.15em]">Cases reached</p>
              <p className="font-serif text-2xl font-bold leading-none">{casesCovered || "—"}</p>
              <p className="font-serif text-[9px]">of 32 in the year</p>
            </div>
          </div>
          <p className="font-serif text-[10px] leading-relaxed">
            <b>Skills learned</b> is the share of individual Spanish items — words, phrases, sentences — your child
            has answered correctly. <b>Unit tests</b> are the cumulative assessments at the end of each block of
            cases. Neither of these is the report-card grade, which also takes homework and class participation into
            account; they describe what your child can do in Spanish right now.
          </p>
        </div>

        {p.strengths.length > 0 && (
          <>
            <h2 className="font-serif text-sm font-bold uppercase tracking-[0.2em] border-b border-black mb-2">
              What {nameFor(s).split(" ")[0]} does well
            </h2>
            <div className="space-y-2 mb-4">
              {p.strengths.map((b) => (
                <div key={b.label}>
                  <p className="font-serif text-[11.5px] font-bold">{b.label}</p>
                  <p className="font-serif text-[11px] leading-snug">
                    {masteryWords(b)}{" "}
                    <span className="text-[10px]">
                      ({b.mastered} of {b.items} items
                      {b.firstTryPct != null && <>, right first time {b.firstTryPct}% of the time</>})
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {gaps.length === 0 && (
          <p className="font-serif text-[11.5px] leading-relaxed">
            Nothing in the record stands out as a weak area right now — your child is keeping up across every topic
            they have reached. The best thing you can do is keep the habit going: a few minutes of Spanish out loud,
            a few times a week.
          </p>
        )}
      </section>

      {/* ── Page 2 — growth areas, named plainly ──────────────────────── */}
      {gaps.length > 0 && (
        <section className="ws-page">
          <h2 className="font-serif text-lg font-bold border-b-2 border-black pb-1 mb-3">
            Where {nameFor(s).split(" ")[0]} needs more practice
          </h2>
          <p className="font-serif text-[11px] leading-relaxed mb-4">
            These are the topics where the record shows the most gaps. A topic appears here either because some of it
            has not been learned yet, or because first attempts are usually wrong even when your child gets there in
            the end. Each one has an activity on the next page.
          </p>

          <div className="space-y-3">
            {gaps.map((b, i) => (
              <div key={b.label} className="border border-black px-4 py-3">
                <p className="font-serif text-[12px] font-bold">{i + 1}. {b.label}</p>
                <p className="font-serif text-[11px] leading-snug mt-0.5">{masteryWords(b)}</p>
                <p className="font-serif text-[10px] mt-1">
                  Learned {b.mastered} of {b.items} items
                  {b.firstTryPct != null && <> · correct on the first try {b.firstTryPct}% of the time</>}
                </p>
              </div>
            ))}
          </div>

          <p className="font-serif text-[11px] leading-relaxed mt-4">
            One note on how to read this: being on this list is normal and expected. Spanish 1 moves quickly, and
            every student has topics that are still settling. What matters is that the gaps are specific — which is
            what makes the practice on the next page worth five minutes.
          </p>
        </section>
      )}

      {/* ── Pages 3–4 — the practice ───────────────────────────────────── */}
      {gaps.length > 0 && (
        <section className="ws-page">
          <h2 className="font-serif text-lg font-bold border-b-2 border-black pb-1 mb-3">
            Five minutes at the kitchen table
          </h2>
          <p className="font-serif text-[11px] leading-relaxed mb-4">
            One activity for each topic above. <b>You do not need to speak Spanish.</b> Each one tells you what to say,
            what your child should answer, and what counts as right. Nothing here needs a computer, a printer or a
            login. Twice a week beats one long session.
          </p>

          <div className="space-y-4">
            {gaps.map((b, i) => {
              const act = practiceFor(b, kindOf(b, p));
              return (
                <div key={b.label} className="border border-black px-4 py-3 break-inside-avoid">
                  <p className="font-serif text-[9px] uppercase tracking-[0.2em]">
                    For: {b.label} · about {act.minutes} minutes
                  </p>
                  <p className="font-serif text-[12.5px] font-bold mb-1.5">{i + 1}. {act.title}</p>
                  <ol className="font-serif text-[11px] leading-relaxed list-decimal pl-5 space-y-0.5">
                    {act.steps.map((step, j) => <li key={j}>{step}</li>)}
                  </ol>
                  {act.items.length > 0 && (
                    <div className="mt-2 border-t border-black pt-1.5">
                      <p className="font-serif text-[9px] uppercase tracking-[0.2em]">
                        Use these — the ones your child has been missing
                      </p>
                      <p className="font-serif text-[11px]">{act.items.join(" · ")}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t-2 border-black mt-5 pt-3">
            <h3 className="font-serif text-[12px] font-bold uppercase tracking-[0.15em] mb-1">Questions?</h3>
            <p className="font-serif text-[11px] leading-relaxed">
              Your child can also replay any case in the program to raise these numbers — replaying is encouraged, and
              the record always reflects their current best rather than their first attempt. If you would like to talk
              through this report, please contact {data.teacherName ?? "your child's Spanish teacher"}.
            </p>
          </div>
        </section>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Print rules. Deliberately NOT the blanket "everything black" override the
   worksheets use — these pages are already black on white, and the override
   would flatten the table rules it is meant to protect.
   ══════════════════════════════════════════════════════════════════════════ */

const printCss = `
  @media print {
    @page { size: letter; margin: 0.6in; }
    html, body { background: #fff !important; }
    .ws-root { box-shadow: none !important; }
    .ws-page { break-after: page; }
    .ws-page:last-child { break-after: auto; }
    table { break-inside: auto; }
    tr, th, td { break-inside: avoid; }
    thead { display: table-header-group; }
    .break-inside-avoid { break-inside: avoid; }
  }
  .ws-page { padding-bottom: 2rem; margin-bottom: 2rem; border-bottom: 1px dashed #bbb; }
  .ws-page:last-child { border-bottom: none; }
`;
