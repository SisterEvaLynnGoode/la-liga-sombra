"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SkillBucket } from "@/lib/reports/skills";
import ClassReport from "./ClassReport";
import ParentReport from "./ParentReport";
import { Letterhead, Pct } from "./shared";
import {
  fmtDate, nameFor, statusWord,
  type GradeRow, type Payload, type Student,
} from "./types";

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

type Mode = "class" | "students" | "parent";

const MODES: Array<{ id: Mode; label: string; blurb: string }> = [
  { id: "class",    label: "Class summary",      blurb: "For your administrator — nine figures, the roster, and a data appendix." },
  { id: "students", label: "Student summaries",  blurb: "One page per student, every topic and every boss fight." },
  { id: "parent",   label: "Parent report cards", blurb: "Two to four pages per child, in English, with practice to do at home." },
];

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
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) return;
    let live = true;
    setData(null);
    setError(null);
    // unmastered=all brings every child's missed items in one query — the
    // practice activities on the parent report are built from them.
    // analytics=1 adds the class-wide aggregates the charts are drawn from.
    fetch(`/api/teacher/dashboard/mastery?classId=${encodeURIComponent(classId)}&unmastered=all&analytics=1`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => { if (live) setData(json as Payload); })
      .catch((e) => { if (live) setError(e instanceof Error ? e.message : "Could not load"); });

    // The ACTFL band is already computed by the gradebook. Read it from there
    // rather than reimplementing the thresholds and letting the two drift.
    fetch(`/api/teacher/dashboard/grades?classId=${encodeURIComponent(classId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("grades"))))
      .then((json) => { if (live) setGrades((json?.rows ?? []) as GradeRow[]); })
      .catch(() => { /* the band column simply prints a dash */ });
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
          {mode === "class" && <ClassReport data={data} students={students} grades={grades} />}
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
