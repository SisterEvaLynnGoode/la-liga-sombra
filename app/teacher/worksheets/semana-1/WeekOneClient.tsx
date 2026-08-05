"use client";

import { useState } from "react";
import Link from "next/link";
import type { WeekOnePage, WeekOneBlock, KeySection } from "@/lib/worksheets/week-one";

interface Props {
  pages: WeekOnePage[];
  key_: KeySection[];
}

export default function WeekOneClient({ pages, key_ }: Props) {
  const [includeKey, setIncludeKey] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0b0a]">
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      <div className="print:hidden sticky top-0 z-20 border-b border-[rgba(201,147,58,0.2)] bg-[#110f0d] px-6 py-3 flex items-center gap-4 flex-wrap">
        <Link href="/teacher/worksheets" className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] hover:text-[#c9933a]">
          ← Worksheets
        </Link>
        <h1 className="font-display text-lg font-bold text-[#f5e6c8]">Semana 1 — paper packet</h1>
        <span className="font-typewriter text-[10px] text-[#8b7355]">
          {pages.length} student pages · no devices required
        </span>
        <label className="flex items-center gap-2 font-typewriter text-[10px] tracking-[0.15em] uppercase text-[#8b7355] cursor-pointer">
          <input
            type="checkbox"
            checked={includeKey}
            onChange={(e) => setIncludeKey(e.target.checked)}
            className="accent-[#c9933a]"
          />
          Include answer key
        </label>
        <button
          onClick={() => window.print()}
          className="ml-auto clip-skew px-4 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.12)] text-[#e8b455] border border-[rgba(201,147,58,0.35)] hover:bg-[rgba(201,147,58,0.22)]"
        >
          Print / Save PDF
        </button>
      </div>

      <p className="print:hidden text-center font-typewriter text-[10px] text-[#4a3a2a] py-2 px-4 max-w-[52rem] mx-auto leading-relaxed">
        Five student pages, one per day, for a week with no computers. Print single-sided so the drawing
        pages have a clean back. The answer key is off by default so you don&apos;t hand it out by accident.
      </p>

      <div className="ws-root mx-auto my-6 max-w-[820px] bg-white text-black px-10 py-10 print:my-0 print:max-w-none print:px-0 print:py-0">
        {pages.map((p) => (
          <PageBlock key={p.id} page={p} />
        ))}
        {includeKey && <AnswerKey sections={key_} />}
      </div>
    </div>
  );
}

function PageBlock({ page }: { page: WeekOnePage }) {
  return (
    <section className="ws-page">
      <header className="border-b-2 border-black pb-1.5 mb-3 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase">La Liga Sombra · {page.day}</p>
          <h2 className="text-2xl font-bold leading-tight">{page.title}</h2>
          <p className="text-[11px] italic">{page.subtitle}</p>
        </div>
        <div className="text-[10px] text-right shrink-0">
          <p>Nombre: ______________________</p>
          <p className="mt-1.5">Fecha: ____________</p>
        </div>
      </header>

      {page.blocks.map((b, i) => <Block key={i} b={b} />)}

      {page.footer && (
        <p className="mt-5 pt-2 border-t border-black text-[10px] italic">{page.footer}</p>
      )}
    </section>
  );
}

function Block({ b }: { b: WeekOneBlock }) {
  switch (b.kind) {
    case "instructions":
      return <p className="text-[12px] leading-snug mb-3">{b.text}</p>;

    case "refBox":
      return (
        <div className="border-2 border-black p-2 mb-3">
          <p className="text-[10px] tracking-[0.25em] uppercase mb-2">{b.title}</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {b.pairs.map((p) => (
              <p key={p.spanish} className="text-[12px]">
                <span className="font-bold">{p.spanish}</span> — {p.english}
              </p>
            ))}
          </div>
        </div>
      );

    case "match":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          <div className="grid grid-cols-2 gap-8">
            <div>
              {b.pairs.map((p, i) => (
                <p key={p.spanish} className="text-[13px] mb-2">{i + 1}. {p.spanish}</p>
              ))}
            </div>
            <div>
              {/* Shuffled deterministically so the printed sheet is stable run to run. */}
              {shuffleStable(b.pairs).map((p, i) => (
                <p key={p.english} className="text-[13px] mb-2">{letter(i)}. {p.english}</p>
              ))}
            </div>
          </div>
        </div>
      );

    case "scenarios":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          {b.items.map((it, i) => (
            <div key={i} className="mb-1.5">
              <p className="text-[12px]">{i + 1}. {it.situation}</p>
              <div className="border-b border-black h-5 mt-0.5 ml-4" />
            </div>
          ))}
        </div>
      );

    case "writeLines":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          {b.prompts.map((pr, i) => (
            <div key={i} className="mb-2">
              <p className="text-[12px]">{pr}</p>
              {Array.from({ length: b.lines }).map((_, j) => (
                <div key={j} className="border-b border-black h-5 mt-1" />
              ))}
            </div>
          ))}
        </div>
      );

    case "drawGrid":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          <div className="grid grid-cols-5 gap-2">
            {b.items.map((it) => (
              <div key={it.spanish}>
                <div className="border-2 border-black aspect-square" />
                <p className="text-[11px] font-bold text-center mt-1 leading-tight">{it.spanish}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "badge":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          <div className="border-4 border-black p-4 flex gap-5">
            <div className="shrink-0">
              <div className="border-2 border-black w-[132px] h-[168px] flex items-end justify-center">
                <span className="text-[9px] tracking-[0.2em] uppercase mb-1">Foto del agente</span>
              </div>
              <p className="text-[9px] text-center mt-1 tracking-[0.2em] uppercase">La Liga Sombra</p>
            </div>
            <div className="flex-1 grid grid-cols-1 gap-2 content-start pt-1">
              {b.fields.map((f) => (
                <div key={f}>
                  <p className="text-[9px] tracking-[0.15em] uppercase">{f}</p>
                  <div className="border-b border-black h-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "persona":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          <div className="flex gap-5">
            <div className="border-2 border-black flex-1 h-[250px] flex items-end justify-center">
              <span className="text-[9px] tracking-[0.2em] uppercase mb-1">Dibuja aquí</span>
            </div>
            <div className="w-[46%] shrink-0">
              {b.frame.map((line) => (
                <p key={line} className="text-[13px] mb-2 leading-relaxed">{line}</p>
              ))}
              <div className="border border-black p-2 mt-2">
                <p className="text-[9px] tracking-[0.2em] uppercase mb-1">Especialidades</p>
                <div className="grid grid-cols-2 gap-x-3">
                  {b.options.map((o) => (
                    <p key={o.spanish} className="text-[10px]">{o.spanish} — {o.english}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }
}

function SectionHead({ title, instructions }: { title: string; instructions: string }) {
  return (
    <>
      <h3 className="text-[13px] font-bold tracking-wide mb-0.5">{title}</h3>
      <p className="text-[11px] italic mb-1.5 leading-snug">{instructions}</p>
    </>
  );
}

function AnswerKey({ sections }: { sections: KeySection[] }) {
  return (
    <section className="ws-page">
      <header className="border-b-2 border-black pb-1.5 mb-3">
        <p className="text-[10px] tracking-[0.3em] uppercase">Solo para el profesor</p>
        <h2 className="text-2xl font-bold">Clave — Semana 1</h2>
        <p className="text-[11px] italic">Do not photocopy this page for students.</p>
      </header>
      {sections.map((s, i) => (
        <div key={i} className="mb-4">
          <p className="text-[11px] tracking-[0.2em] uppercase">{s.page}</p>
          <p className="text-[12px] font-bold">{s.title}</p>
          <div className="grid grid-cols-2 gap-x-6">
            {s.answers.map((a) => <p key={a} className="text-[12px]">{a}</p>)}
          </div>
        </div>
      ))}
    </section>
  );
}

const letter = (i: number) => String.fromCharCode(97 + i);

/** Deterministic shuffle — a worksheet must print identically every time. */
function shuffleStable<T>(items: T[]): T[] {
  const out = [...items];
  let seed = 7;
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
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
  .ws-page { padding-bottom: 0.25rem; margin-bottom: 2rem; }
`;
