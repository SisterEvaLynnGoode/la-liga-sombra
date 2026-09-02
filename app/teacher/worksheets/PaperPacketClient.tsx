"use client";

import { useState } from "react";
import Link from "next/link";
import type { WeekOnePage, WeekOneBlock, KeySection } from "@/lib/worksheets/paper";
import { buildWordSearch } from "@/lib/worksheets/wordsearch";
import { VocabIcon, hasIcon } from "@/lib/worksheets/icons";

interface Props {
  pages: WeekOnePage[];
  key_: KeySection[];
  /** Shown in the toolbar, e.g. "Semana 1". */
  title: string;
  /** One line under the toolbar explaining how to print it. */
  blurb: string;
}

export default function PaperPacketClient({ pages, key_, title, blurb }: Props) {
  const [includeKey, setIncludeKey] = useState(false);
  // One sheet per day is right when you hand out a page each morning. Flowing
  // is right when you staple the fortnight into one packet: with every day now
  // carrying a survey or a game, most days run ~110% of a sheet, so a forced
  // break per day spends a second sheet to hold about an inch of content.
  const [flow, setFlow] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0b0a]">
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      <div className="print:hidden sticky top-0 z-20 border-b border-[rgba(201,147,58,0.2)] bg-[#110f0d] px-6 py-3 flex items-center gap-4 flex-wrap">
        <Link href="/teacher/worksheets" className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] hover:text-[#c9933a]">
          ← Worksheets
        </Link>
        <h1 className="font-display text-lg font-bold text-[#f5e6c8]">{title} — paper packet</h1>
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
        <label
          className="flex items-center gap-2 font-typewriter text-[10px] tracking-[0.15em] uppercase text-[#8b7355] cursor-pointer"
          title="Off: every day starts a new sheet. On: pages flow together and use noticeably less paper."
        >
          <input type="checkbox" checked={flow} onChange={(e) => setFlow(e.target.checked)} className="accent-[#c9933a]" />
          Flow pages (less paper)
        </label>
        <button
          onClick={() => window.print()}
          className="ml-auto clip-skew px-4 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.12)] text-[#e8b455] border border-[rgba(201,147,58,0.35)] hover:bg-[rgba(201,147,58,0.22)]"
        >
          Print / Save PDF
        </button>
      </div>

      <p className="print:hidden text-center font-typewriter text-[10px] text-[#4a3a2a] py-2 px-4 max-w-[52rem] mx-auto leading-relaxed">
        {blurb}
      </p>

      <div className={`ws-root ${flow ? "ws-flow" : ""} mx-auto my-6 max-w-[820px] bg-white text-black px-10 py-10 print:my-0 print:max-w-none print:px-0 print:py-0`}>
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

    case "wordSearch": {
      // Deterministic, so server and client render the same grid (no hydration
      // mismatch) and a re-print for an absent student matches the originals.
      const ws = buildWordSearch(b.words, b.size ?? 12, b.seed ?? 42);
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          <div className="flex gap-4">
            <table className="border-collapse">
              <tbody>
                {ws.grid.map((row, r) => (
                  <tr key={r}>
                    {row.map((ch, c) => (
                      <td key={c} className="border border-black w-[19px] h-[19px] text-center text-[11px] leading-none align-middle">
                        {ch}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex-1">
              <p className="text-[9px] tracking-[0.2em] uppercase mb-1">Encuentra / Find</p>
              <div className="grid grid-cols-2 gap-x-3">
                {ws.words.map((w) => (
                  <p key={w} className="text-[11px]">☐ {w}</p>
                ))}
              </div>
              <p className="text-[9px] italic mt-2">Los acentos no aparecen en la cuadrícula.</p>
            </div>
          </div>
        </div>
      );
    }

    case "survey":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          <p className="text-[13px] font-bold mb-1.5">«{b.question}»</p>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                {b.columns.map((c) => (
                  <th key={c} className="border border-black text-[10px] tracking-[0.15em] uppercase py-0.5 px-1 text-left">
                    {c}
                  </th>
                ))}
              </tr>
              {Array.from({ length: b.rows }).map((_, r) => (
                <tr key={r}>
                  {b.columns.map((c) => (
                    <td key={c} className="border border-black h-[26px]" />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "gameBox":
      return (
        <div className="border-2 border-black p-2.5 mb-3">
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <p className="text-[12px] font-bold">{b.title} · <span className="italic">{b.spanishName}</span></p>
            <span className="text-[9px] tracking-[0.2em] uppercase shrink-0">{b.minutes} min</span>
          </div>
          <ol className="list-decimal ml-4">
            {b.steps.map((st) => (
              <p key={st} className="text-[11px] leading-snug mb-0.5 list-item">{st}</p>
            ))}
          </ol>
        </div>
      );

    case "blankGrid":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${b.cols}, minmax(0,1fr))`, maxWidth: b.cols * 74 }}>
            {Array.from({ length: b.rows * b.cols }).map((_, i) => (
              <div key={i} className="border-2 border-black h-[46px]" />
            ))}
          </div>
        </div>
      );

    case "partnerTalk":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          <div className="border-2 border-black p-2 mb-2">
            <p className="text-[9px] tracking-[0.25em] uppercase mb-1">El guion / The script</p>
            {b.frames.map((f, i) => (
              <p key={f} className="text-[12px] leading-snug mb-0.5">
                <span className="font-bold">{i % 2 === 0 ? "A" : "B"}:</span> {f}
              </p>
            ))}
          </div>
          <p className="text-[10px] italic mb-1">{b.evidencePrompt}</p>
          {Array.from({ length: b.rounds }).map((_, i) => (
            <div key={i} className="grid grid-cols-[6.5rem_1fr] gap-2 items-end mb-1.5">
              <span className="text-[10px] tracking-[0.1em] uppercase">Compañero/a {i + 1}</span>
              <span className="border-b border-black h-5" />
            </div>
          ))}
        </div>
      );

    case "citeEvidence":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          <div className="border-2 border-black p-2 mb-2">
            {b.passage.map((line, i) => (
              <p key={line} className="text-[12px] leading-snug">
                <span className="text-[9px] mr-1.5">{i + 1}</span>{line}
              </p>
            ))}
          </div>
          {b.questions.map((q, i) => (
            <div key={q.q} className="mb-2">
              <p className="text-[12px]">{i + 1}. {q.q}</p>
              <div className="grid grid-cols-[3.6rem_1fr] gap-2 items-end mt-0.5">
                <span className="text-[9px] tracking-[0.1em] uppercase">Respuesta</span>
                <span className="border-b border-black h-4" />
              </div>
              <div className="grid grid-cols-[3.6rem_1fr] gap-2 items-end mt-1">
                <span className="text-[9px] tracking-[0.1em] uppercase">Prueba</span>
                <span className="border-b border-black h-4" />
              </div>
            </div>
          ))}
          <p className="text-[9px] italic">«Prueba» = copy the exact words from the text that prove your answer.</p>
        </div>
      );

    /**
     * Illustrated vocabulary. The icon is the definition; the English sits under
     * it in small type and disappears entirely when the page is being used as a
     * self-quiz. Words with no icon get a bordered blank instead so the student
     * can draw their own reminder — an empty box invites that, a missing cell
     * just looks like the page failed to print.
     */
    case "iconGrid":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions ?? ""} />
          <div
            className="grid gap-x-2 gap-y-2"
            style={{ gridTemplateColumns: `repeat(${b.columns}, minmax(0,1fr))` }}
          >
            {b.items.map((it) => (
              <div key={it.spanish} className="border border-black p-1 flex flex-col items-center text-center">
                <div className="h-[38px] flex items-center justify-center">
                  {hasIcon(it.spanish) ? <VocabIcon spanish={it.spanish} /> : <span className="text-[8px] italic">dibuja tú</span>}
                </div>
                <p className="text-[10px] font-bold leading-tight mt-0.5">{it.spanish}</p>
                {!b.hideEnglish && <p className="text-[8px] leading-tight">{it.english}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    /** Boxes to fill from clues — never a pre-labelled diagram. */
    case "familyTree":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          {b.wordBank && (
            <p className="text-[10px] border border-black px-2 py-1 mb-2">
              <span className="tracking-[0.2em] uppercase">Nombres:</span> {b.wordBank.join(" · ")}
            </p>
          )}
          <div className="space-y-2">
            {b.rows.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-3">
                {row.slots.map((slot, si) => (
                  <div key={si} className="border-2 border-black w-[7.5rem] h-[3.2rem] flex flex-col justify-end p-1">
                    <span className="text-[8px] italic leading-none">{slot}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );

    /** Draw the emotion. The drawing IS the definition. */
    case "faceGrid":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          <div
            className="grid gap-x-2 gap-y-2"
            style={{ gridTemplateColumns: `repeat(${b.columns}, minmax(0,1fr))` }}
          >
            {b.words.map((w) => (
              <div key={w.spanish} className="border border-black">
                <div className="h-[6.2rem] border-b border-black" />
                <p className="text-[10px] font-bold leading-tight px-1 pt-0.5 text-center">{w.spanish}</p>
                <p className="text-[8px] leading-tight px-1 pb-0.5 text-center">{w.english}</p>
              </div>
            ))}
          </div>
        </div>
      );

    /** Clues in Spanish, answers deduced. Detective work, not a vocabulary drill. */
    case "deduction":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          <div className="border-2 border-black p-2 mb-2">
            {b.clues.map((c) => (
              <p key={c} className="text-[11px] leading-snug mb-0.5">{c}</p>
            ))}
          </div>
          {b.wordBank && (
            <p className="text-[10px] border border-black px-2 py-1 mb-2">
              <span className="tracking-[0.2em] uppercase">Banco:</span> {b.wordBank.join(" · ")}
            </p>
          )}
          <ol className="space-y-1.5">
            {b.questions.map((q, i) => (
              <li key={i} className="text-[11px] leading-snug">
                {i + 1}. {q.q}
                <span className="inline-block border-b border-black min-w-[9rem] ml-1 align-bottom">&nbsp;</span>
              </li>
            ))}
          </ol>
        </div>
      );

    /** One line of the journey per row: where to, and how. */
    case "routePlan":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          <p className="text-[11px] border border-black px-2 py-1 mb-2">
            <span className="tracking-[0.2em] uppercase text-[9px]">Frase:</span> <span className="font-bold">{b.frame}</span>
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["#", "Desde · from", "Hasta · to", "Escribe la frase completa"].map((h) => (
                  <th key={h} className="border border-black text-[9px] tracking-[0.15em] uppercase px-1 py-0.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.legs.map((leg, i) => (
                <tr key={i}>
                  <td className="border border-black text-[10px] px-1 py-2 w-[1.4rem]">{i + 1}</td>
                  <td className="border border-black text-[10px] px-1 py-2 w-[8rem]">{leg.from}</td>
                  <td className="border border-black text-[10px] px-1 py-2 w-[8rem]">
                    {leg.to}
                    {leg.hint && <span className="block text-[8px] italic">{leg.hint}</span>}
                  </td>
                  <td className="border border-black px-1 py-2" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "grid":
      return (
        <div className="border-2 border-black p-2 mb-3">
          <p className="text-[10px] tracking-[0.25em] uppercase mb-2">{b.title}</p>
          <div className="grid gap-x-4 gap-y-1" style={{ gridTemplateColumns: `repeat(${b.columns}, minmax(0,1fr))` }}>
            {b.pairs.map((p) => (
              <p key={p.spanish} className="text-[11px]">
                <span className="font-bold">{p.spanish}</span> {p.english}
              </p>
            ))}
          </div>
        </div>
      );

    case "labelScene":
      return (
        <div className="mb-3">
          <SectionHead title={b.title} instructions={b.instructions} />
          {b.wordBank && (
            <div className="border border-black px-2 py-1 mb-2">
              <span className="text-[9px] tracking-[0.2em] uppercase mr-2">Banco de palabras</span>
              <span className="text-[11px]">{b.wordBank.join(" · ")}</span>
            </div>
          )}
          <div className="flex gap-4">
            <div className="border-2 border-black flex-1 h-[200px] flex items-end justify-center">
              <span className="text-[9px] tracking-[0.2em] uppercase mb-1">{b.sceneHint}</span>
            </div>
            <div className="w-[38%] shrink-0 pt-1">
              {Array.from({ length: b.labels }).map((_, i) => (
                <div key={i} className="flex items-end gap-1 mb-2">
                  <span className="text-[11px] w-4">{i + 1}.</span>
                  <span className="border-b border-black flex-1 h-4" />
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
        <h2 className="text-2xl font-bold">Clave</h2>
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
    /* Flow mode: no forced break per day. Days still cannot be split across a
       sheet mid-exercise — break-inside on the blocks keeps activities whole. */
    .ws-flow .ws-page { break-after: auto; }
    .ws-flow .ws-page > * { break-inside: avoid; }
    .ws-flow .ws-page > header { break-after: avoid; }
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
