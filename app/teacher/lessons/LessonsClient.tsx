"use client";

import { useState } from "react";
import Link from "next/link";
import type { LessonPlan } from "@/lib/lessons/build";

interface Props {
  plans: LessonPlan[];
}

export default function LessonsClient({ plans }: Props) {
  const [active, setActive] = useState<number>(plans[0]?.meta.unitNumber ?? 1);
  const [showAll, setShowAll] = useState(false);

  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-[#111218] flex items-center justify-center">
        <p className="font-typewriter text-sm text-[#8b7355]">No units are ready yet.</p>
      </div>
    );
  }

  const visible = showAll ? plans : plans.filter((p) => p.meta.unitNumber === active);

  return (
    <div className="min-h-screen bg-[#111218]">
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      {/* Toolbar */}
      <div className="print:hidden sticky top-0 z-20 border-b border-[rgba(201,147,58,0.2)] bg-[#111218] px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href="/teacher/dashboard"
            className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a]"
          >
            ← Dashboard
          </Link>
          <div className="w-px h-8 bg-[rgba(201,147,58,0.15)]" />
          <div>
            <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">
              Teacher Panel
            </p>
            <h1 className="font-display font-bold text-lg text-[#e8b455] leading-tight">Lesson Plans</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={active}
            onChange={(e) => {
              setActive(Number(e.target.value));
              setShowAll(false);
            }}
            disabled={showAll}
            className="bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] text-[#f5e6c8] font-typewriter text-xs px-3 py-1.5 focus:outline-none focus:border-[#c9933a] disabled:opacity-40"
          >
            {plans.map((p) => (
              <option key={p.meta.unitNumber} value={p.meta.unitNumber}>
                Case {p.meta.unitNumber} — {p.meta.caseTitle} ({p.meta.country})
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAll((v) => !v)}
            className={`px-3 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase border transition-colors ${
              showAll
                ? "bg-[rgba(111,170,92,0.15)] text-[#6faa5c] border-[rgba(111,170,92,0.5)]"
                : "text-[#8b7355] border-[rgba(201,147,58,0.3)] hover:text-[#c9933a]"
            }`}
            title="Show every case, for printing the whole semester at once"
          >
            {showAll ? `All ${plans.length} cases` : "Whole semester"}
          </button>
          <button
            onClick={() => window.print()}
            className="clip-skew px-4 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.12)] text-[#e8b455] border border-[rgba(201,147,58,0.35)] hover:bg-[rgba(201,147,58,0.22)] transition-colors"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      <p className="print:hidden text-center font-typewriter text-[10px] text-[#4a3a2a] py-2 px-4 max-w-[60rem] mx-auto">
        Everything below is generated from the case files, worksheets and decks that actually exist. If a
        material is missing, this page says so instead of planning around it.
      </p>

      <div className="mx-auto max-w-[60rem] px-4 pb-16 print:px-0 print:pb-0 print:max-w-none">
        {visible.map((p) => (
          <Plan key={p.meta.unitNumber} plan={p} />
        ))}
      </div>
    </div>
  );
}

function Plan({ plan }: { plan: LessonPlan }) {
  const m = plan.meta;
  return (
    <article className="lesson-sheet bg-white text-black my-6 p-10 print:my-0 print:p-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b-4 border-black pb-3 mb-4">
        <div className="flex justify-between items-start gap-6 flex-wrap">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase">
              La Liga Sombra · Spanish 1 · Case {m.unitNumber}
            </p>
            <h2 className="font-display font-black text-3xl uppercase leading-none mt-1">{m.caseTitle}</h2>
            <p className="font-serif text-[13px] mt-1">
              {m.city}, {m.country} · Suspect: {m.criminal} · Stolen: {m.stolenItem}
            </p>
          </div>
          <div className="font-mono text-[10px] text-right leading-relaxed">
            <div>ACTFL: {m.band}</div>
            <div>{m.vocabCount} terms · {m.stageLabels.length} stages</div>
            <div>5 days · ~{m.totalMinutes} min</div>
          </div>
        </div>
      </header>

      {/* ── Gaps ───────────────────────────────────────────────────────── */}
      {plan.gaps.length > 0 && (
        <section className="border-2 border-black bg-[#f3f3f3] p-3 mb-4">
          <h3 className="font-display font-black text-sm uppercase mb-1">⚠ Before you teach this week</h3>
          <ul className="list-disc ml-5 font-serif text-[12px] leading-snug space-y-0.5">
            {plan.gaps.map((g) => <li key={g}>{g}</li>)}
          </ul>
        </section>
      )}

      {/* ── FORMAL BLOCK ───────────────────────────────────────────────── */}
      <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#666] mb-2">
        Part A · For an administrator, observer or substitute
      </p>

      <div className="grid grid-cols-2 gap-6 mb-4">
        <section>
          <H>Objectives — students will be able to</H>
          <ul className="list-disc ml-5 font-serif text-[12px] leading-snug space-y-0.5">
            {plan.objectives.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </section>
        <section>
          <H>ACTFL modes exercised</H>
          <ul className="list-disc ml-5 font-serif text-[12px] leading-snug space-y-0.5">
            {plan.standards.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>
      </div>

      <section className="mb-4">
        <H>Materials</H>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {plan.materials.map((mat) => (
            <div key={mat.label} className="font-serif text-[12px] flex gap-2">
              <span className="font-mono">{mat.ready ? "☑" : "☐"}</span>
              <span className={mat.ready ? "" : "italic text-[#666]"}>
                {mat.label}
                {!mat.ready && " — not ready"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-6 mb-5">
        <section>
          <H>Assessment</H>
          <ul className="list-disc ml-5 font-serif text-[12px] leading-snug space-y-0.5">
            {plan.assessment.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </section>
        <section>
          <H>Differentiation</H>
          <ul className="list-disc ml-5 font-serif text-[12px] leading-snug space-y-0.5">
            {plan.differentiation.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </section>
      </div>

      {/* ── DAY BY DAY ─────────────────────────────────────────────────── */}
      <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#666] mb-2 border-t-2 border-black pt-3">
        Part B · Day by day
      </p>

      {plan.days.map((d) => (
        <section key={d.n} className="border border-black mb-2">
          <div className="flex justify-between items-baseline gap-4 bg-black text-white px-3 py-1.5">
            <h3 className="font-display font-black text-sm uppercase">
              Day {d.n} — {d.title}
            </h3>
            <span className="font-mono text-[10px]">{d.minutes} min</span>
          </div>
          <div className="px-3 py-2">
            <p className="font-serif italic text-[12px] mb-1.5">{d.subtitle}</p>
            {(d.project.length > 0 || d.print.length > 0) && (
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] mb-2">
                {d.project.length > 0 && (
                  <>Project: {d.project.filter((v, i, a) => a.indexOf(v) === i).join(" · ")}</>
                )}
                {d.project.length > 0 && d.print.length > 0 && "   |   "}
                {d.print.length > 0 && <>Print: {d.print.join(" · ")}</>}
              </p>
            )}
            <ol className="font-serif text-[12px] leading-snug space-y-1">
              {d.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-[11px] w-12 shrink-0">{s.mins} min</span>
                  <span>{s.what}</span>
                </li>
              ))}
            </ol>
            <p className="font-serif text-[12px] mt-2 border-t border-[#ccc] pt-1.5">
              <strong>Exit ticket:</strong> {d.exitTicket}
            </p>
          </div>
        </section>
      ))}

      {/* ── Watch for ──────────────────────────────────────────────────── */}
      {plan.watchFor.length > 0 && (
        <section className="border-l-4 border-black pl-3 mt-4">
          <H>What to say out loud in this case</H>
          <ul className="list-disc ml-5 font-serif text-[12px] leading-snug space-y-1">
            {plan.watchFor.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </section>
      )}
    </article>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display font-black text-sm uppercase mb-1">{children}</h3>;
}

const printCss = `
  @media print {
    @page { size: portrait; margin: 0.5in; }
    html, body { background: #fff !important; }
    .lesson-sheet {
      break-after: page;
      page-break-after: always;
      box-shadow: none !important;
    }
    .lesson-sheet:last-child { break-after: auto; page-break-after: auto; }
  }
`;
