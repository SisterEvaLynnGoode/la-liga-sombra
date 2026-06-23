"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RUBRIC_LEVELS,
  RUBRIC_ROWS,
  MILESTONES,
  CAPSTONE,
  AUDIENCE_PROMPTS,
  AUDIENCE_FEEDBACK,
  type Milestone,
} from "@/lib/presentations/content";

type Section = "overview" | "rubric" | "milestone1" | "milestone2" | "capstone" | "audience";

const SECTION_LABELS: Array<[Section, string]> = [
  ["overview", "Overview"],
  ["rubric", "Rubric"],
  ["milestone1", "Milestone 1"],
  ["milestone2", "Milestone 2"],
  ["capstone", "Capstone"],
  ["audience", "Audience sheet"],
];

export default function PresentationsClient() {
  const [show, setShow] = useState<Record<Section, boolean>>({
    overview: true,
    rubric: true,
    milestone1: true,
    milestone2: true,
    capstone: true,
    audience: true,
  });

  function toggle(s: Section) {
    setShow((prev) => ({ ...prev, [s]: !prev[s] }));
  }

  return (
    <div className="min-h-screen bg-[#0c0e14]">
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      {/* ── Control bar (screen only) ──────────────────────────────────────── */}
      <div className="print:hidden sticky top-0 z-20 border-b border-[rgba(201,147,58,0.2)] bg-[#111218] px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/teacher/dashboard" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a]">
            ← Dashboard
          </Link>
          <div className="w-px h-8 bg-[rgba(201,147,58,0.15)]" />
          <div>
            <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">Detective Academy</p>
            <h1 className="font-display font-bold text-lg text-[#e8b455] leading-tight">Presentations &amp; Capstone</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {SECTION_LABELS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`font-typewriter text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors ${
                  show[key]
                    ? "border-[#c9933a] bg-[rgba(201,147,58,0.1)] text-[#e8b455]"
                    : "border-[rgba(201,147,58,0.2)] text-[#8b7355] hover:text-[#c9933a]"
                }`}
              >
                {show[key] ? "✓ " : ""}{label}
              </button>
            ))}
          </div>
          <button
            onClick={() => window.print()}
            className="clip-skew px-5 py-2 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      <p className="print:hidden text-center font-typewriter text-[10px] text-[#4a3a2a] py-2">
        Three speaking milestones across the semester. Print a milestone sheet + the rubric before each one. Everything prints in black &amp; white.
      </p>

      {/* ── Printable sheet ────────────────────────────────────────────────── */}
      <div className="ws-root mx-auto my-6 max-w-[820px] bg-white text-black px-10 py-10 print:my-0 print:max-w-none print:px-0 print:py-0">
        {show.overview && <Overview />}
        {show.rubric && <Rubric />}
        {show.milestone1 && <MilestoneSheet milestone={MILESTONES[0]} />}
        {show.milestone2 && <MilestoneSheet milestone={MILESTONES[1]} />}
        {show.capstone && <Capstone />}
        {show.audience && <AudienceSheet />}
      </div>
    </div>
  );
}

// ── Shared ──────────────────────────────────────────────────────────────────

function SheetHeader({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex items-end justify-between border-b-2 border-black pb-2 mb-5">
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase">La Liga Sombra · Detective Academy</p>
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase">{label}</p>
      </div>
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase">{sub}</p>
    </div>
  );
}

function NameLine() {
  return (
    <div className="flex justify-between font-mono text-[11px] mb-4">
      <span>AGENTE / AGENT: ______________________________</span>
      <span>FECHA / DATE: ______________</span>
    </div>
  );
}

function Stamp({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border-[3px] border-black px-3 py-1 font-display font-black tracking-[0.15em] uppercase text-black -rotate-3">
      {children}
    </span>
  );
}

function Checkbox({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="inline-block w-4 h-4 border border-black shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

function WriteLines({ count }: { count: number }) {
  return (
    <div className="space-y-4 mt-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="border-b border-black h-0" />
      ))}
    </div>
  );
}

// ── Overview (teacher) ──────────────────────────────────────────────────────

function Overview() {
  return (
    <section className="ws-page">
      <SheetHeader label="The Presentation Ladder" sub="Teacher Overview" />
      <div className="flex items-center gap-3 mb-4">
        <Stamp>Briefing</Stamp>
        <p className="font-serif text-[13px]">
          Three speaking milestones, one per six-week arc, that move students up the ACTFL presentational scale.
        </p>
      </div>

      <table className="w-full border-collapse font-serif text-[12px] mb-4">
        <thead>
          <tr>
            {["Milestone", "When", "Task", "Length", "Target"].map((h) => (
              <th key={h} className="border border-black p-1.5 text-left font-mono text-[10px] uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MILESTONES.map((m) => (
            <tr key={m.number} className="align-top">
              <td className="border border-black p-1.5"><strong>{m.number}. {m.titleEs}</strong><br /><span className="font-mono text-[10px]">{m.titleEn}</span></td>
              <td className="border border-black p-1.5">{m.week}</td>
              <td className="border border-black p-1.5">{m.blurb.split(".")[0]}.</td>
              <td className="border border-black p-1.5 font-mono text-[11px]">{m.durationSec}s</td>
              <td className="border border-black p-1.5">{m.targetBand}</td>
            </tr>
          ))}
          <tr className="align-top">
            <td className="border border-black p-1.5"><strong>Capstone · {CAPSTONE.titleEs}</strong><br /><span className="font-mono text-[10px]">{CAPSTONE.titleEn}</span></td>
            <td className="border border-black p-1.5">{CAPSTONE.week}</td>
            <td className="border border-black p-1.5">{CAPSTONE.blurb.split(".")[0]}.</td>
            <td className="border border-black p-1.5 font-mono text-[11px]">3–4 min</td>
            <td className="border border-black p-1.5">{CAPSTONE.targetBand}</td>
          </tr>
        </tbody>
      </table>

      <h3 className="font-display font-black text-base uppercase mt-4 mb-1">How the ladder works</h3>
      <ul className="list-disc ml-5 font-serif text-[13px] leading-snug space-y-1">
        <li><strong>Each milestone is scaffolded a little less:</strong> Milestone 1 is mostly memorized with full sentence frames; Milestone 2 allows note cards; the Capstone is student-built from research.</li>
        <li><strong>One rubric grades all three.</strong> The criteria stay the same — only the target band rises (Novice Mid → Novice High → Intermediate Low). Students see the same expectations growing.</li>
        <li><strong>The Pasaporte Cultural is the source material.</strong> Students present from the country pages they have already completed.</li>
        <li><strong>The Capstone doubles as a final assessment</strong> and a class activity — the audience tries to solve each presented case using the Audience Sheet.</li>
      </ul>
    </section>
  );
}

// ── Rubric ──────────────────────────────────────────────────────────────────

function Rubric() {
  return (
    <section className="ws-page">
      <SheetHeader label="Presentational Rubric" sub="ACTFL Novice" />
      <p className="font-serif text-[12px] mb-3">
        Use for all three milestones. Circle one box per row. The target band rises each milestone (Novice Mid → Novice High → Intermediate Low), but the criteria stay the same.
      </p>

      <table className="w-full border-collapse font-serif text-[11px]">
        <thead>
          <tr>
            <th className="border border-black p-1.5 text-left font-mono text-[9px] uppercase w-[16%]">Criterio</th>
            {RUBRIC_LEVELS.map((lv) => (
              <th key={lv.points} className="border border-black p-1.5 text-left font-mono text-[9px] uppercase">
                {lv.points} · {lv.label}<br /><span className="text-[8px]">({lv.band})</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RUBRIC_ROWS.map((row) => (
            <tr key={row.criterion} className="align-top">
              <td className="border border-black p-1.5">
                <strong>{row.criterion}</strong><br /><span className="font-mono text-[9px]">{row.en}</span>
              </td>
              {row.cells.map((cell, i) => (
                <td key={i} className="border border-black p-1.5 leading-snug">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-4 font-mono text-[12px]">
        <span>Total: ______ / 20</span>
        <span>Target this milestone: ______________</span>
        <span>Banda ACTFL: ______________</span>
      </div>

      <div className="border-l-4 border-black pl-3 mt-4 font-serif text-[12px]">
        <strong>Comentarios / Feedback:</strong>
        <WriteLines count={2} />
      </div>
    </section>
  );
}

// ── Milestone planning sheet (student) ──────────────────────────────────────

function MilestoneSheet({ milestone: m }: { milestone: Milestone }) {
  return (
    <section className="ws-page">
      <SheetHeader label={`Milestone ${m.number} · ${m.titleEs}`} sub={m.titleEn} />
      <NameLine />

      <div className="flex flex-wrap gap-x-6 gap-y-1 border-2 border-black p-2 mb-4 font-mono text-[11px]">
        <span>{m.arc}</span>
        <span>· {m.week}</span>
        <span>· ~{m.durationSec}s</span>
        <span>· Target: {m.targetBand}</span>
      </div>
      <p className="font-serif text-[13px] leading-snug mb-4">{m.blurb}</p>

      <h3 className="font-display font-black text-base uppercase mb-1">Required Parts / Partes Obligatorias</h3>
      <ul className="font-serif text-[13px] space-y-1.5 mb-4">
        {m.requiredParts.map((p, i) => <Checkbox key={i}>{p}</Checkbox>)}
      </ul>

      <h3 className="font-display font-black text-base uppercase mb-1">Sentence Frames / Marcos de Oraciones</h3>
      <p className="font-serif text-[12px] mb-2">Fill in the blanks to build your script, then practice saying it.</p>
      <ol className="font-serif text-[13px] space-y-3 mb-4">
        {m.frames.map((f, i) => (
          <li key={i}>
            <span className="font-semibold">{renderFrame(f.es)}</span>
            <span className="block font-mono text-[10px] text-gray-700">{f.en}</span>
          </li>
        ))}
      </ol>

      <h3 className="font-display font-black text-base uppercase mb-1">Practice Checklist / Lista de Práctica</h3>
      <p className="font-mono text-[10px] mb-1">{m.mode}</p>
      <ul className="font-serif text-[12px] space-y-1.5">
        {m.checklist.map((c, i) => <Checkbox key={i}>{c}</Checkbox>)}
      </ul>
    </section>
  );
}

// ── Capstone scaffold (student, multi-page) ─────────────────────────────────

function Capstone() {
  return (
    <>
      {/* Cover + steps 1–2 */}
      <section className="ws-page">
        <SheetHeader label={`Capstone · ${CAPSTONE.titleEs}`} sub={CAPSTONE.titleEn} />
        <NameLine />
        <div className="flex items-center gap-3 mb-3">
          <Stamp>Misión Final</Stamp>
          <div className="font-mono text-[11px]">
            <p>{CAPSTONE.arc} · {CAPSTONE.week}</p>
            <p>Target: {CAPSTONE.targetBand}</p>
          </div>
        </div>
        <p className="font-serif text-[13px] leading-snug mb-4">{CAPSTONE.blurb}</p>

        {CAPSTONE.steps.slice(0, 2).map((step) => (
          <div key={step.titleEs} className="mb-5">
            <h3 className="font-display font-black text-base uppercase mb-1">{step.titleEs} <span className="font-mono text-[11px] font-normal normal-case">/ {step.titleEn}</span></h3>
            <p className="font-serif text-[12px] mb-2">{step.instructions}</p>
            {step.fields.map((field, i) => (
              <div key={i} className="mb-2.5">
                <span className="font-mono text-[11px]">{field}</span>
                <div className="border-b border-black h-5 mt-1" />
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* Step 3: script + frames + self-check */}
      <section className="ws-page">
        <SheetHeader label={`Capstone · ${CAPSTONE.titleEs}`} sub="Script & Practice" />
        <NameLine />

        {CAPSTONE.steps.slice(2).map((step) => (
          <div key={step.titleEs} className="mb-4">
            <h3 className="font-display font-black text-base uppercase mb-1">{step.titleEs} <span className="font-mono text-[11px] font-normal normal-case">/ {step.titleEn}</span></h3>
            <p className="font-serif text-[12px] mb-2">{step.instructions}</p>
            {step.fields.map((field, i) => (
              <div key={i} className="mb-2.5">
                <span className="font-mono text-[11px]">{field}</span>
                <div className="border-b border-black h-5 mt-1" />
              </div>
            ))}
          </div>
        ))}

        <h3 className="font-display font-black text-base uppercase mb-1">Sentence Frames / Marcos</h3>
        <ol className="font-serif text-[13px] space-y-2 mb-4">
          {CAPSTONE.scriptFrames.map((f, i) => (
            <li key={i}>
              <span className="font-semibold">{renderFrame(f.es)}</span>
              <span className="block font-mono text-[10px] text-gray-700">{f.en}</span>
            </li>
          ))}
        </ol>

        <h3 className="font-display font-black text-base uppercase mb-1">Self-Check / Autoevaluación</h3>
        <ul className="font-serif text-[12px] space-y-1.5">
          {CAPSTONE.selfCheck.map((c, i) => <Checkbox key={i}>{c}</Checkbox>)}
        </ul>
      </section>
    </>
  );
}

// ── Audience sheet (capstone day) ───────────────────────────────────────────

function AudienceSheet() {
  return (
    <section className="ws-page">
      <SheetHeader label="Audience Sheet · Resuelve el Caso" sub="Capstone Day" />
      <NameLine />
      <p className="font-serif text-[12px] mb-4">
        As a classmate presents their case, listen carefully and fill this in. Try to solve the case in Spanish!
      </p>

      <div className="border-2 border-black p-2 mb-4 font-mono text-[11px]">
        Presentador / Presenter: ______________________________
      </div>

      <ol className="font-serif text-[13px] space-y-3 mb-5">
        {AUDIENCE_PROMPTS.map((p, i) => (
          <li key={i}>
            <span className="font-mono text-[11px]">{i + 1}.</span> {p}
            <div className="border-b border-black h-5 mt-1" />
          </li>
        ))}
      </ol>

      <h3 className="font-display font-black text-base uppercase mb-1">Comentarios / Feedback for the presenter</h3>
      <p className="font-serif text-[12px] mb-2">Write at least one in Spanish, using a frame.</p>
      <ol className="font-serif text-[13px] space-y-3">
        {AUDIENCE_FEEDBACK.map((f, i) => (
          <li key={i}>
            <span className="font-semibold">{f.es}</span>
            <div className="border-b border-black h-5 mt-1" />
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Render a sentence frame, turning "____" into an inline blank line. */
function renderFrame(text: string) {
  const parts = text.split(/____+/);
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && <span className="inline-block border-b border-black w-28 align-baseline">&nbsp;</span>}
    </span>
  ));
}

const printCss = `
  @media print {
    @page { size: letter; margin: 0.6in; }
    html, body { background: #fff !important; }
    .ws-root { box-shadow: none !important; }
    .ws-page { break-after: page; }
    .ws-page:last-child { break-after: auto; }
    .ws-root, .ws-root * {
      color: #000 !important;
      background: transparent !important;
      border-color: #000 !important;
      box-shadow: none !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
  .ws-page { padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
`;
