"use client";

import { useState } from "react";
import type { Deck, DeckSlide } from "@/lib/decks/build";

interface Props {
  decks: Deck[];
}

export default function DecksClient({ decks }: Props) {
  const [active, setActive] = useState(decks[decks.length - 1]?.meta.unitNumber ?? 1);
  const deck = decks.find((d) => d.meta.unitNumber === active) ?? decks[0];

  if (!deck) {
    return (
      <div className="min-h-screen bg-[#0d0b0a] flex items-center justify-center">
        <p className="font-typewriter text-sm text-[#8b7355]">No hay unidades con vocabulario todavía.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0b0a]">
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      {/* Toolbar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-20 border-b border-[rgba(201,147,58,0.2)] bg-[#110f0d] px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#c9933a]">
            Barajas de Vocabulario
          </span>
          <select
            value={active}
            onChange={(e) => setActive(Number(e.target.value))}
            className="bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] text-[#f5e6c8] font-typewriter text-xs px-3 py-1.5 focus:outline-none focus:border-[#c9933a]"
          >
            {decks.map((d) => (
              <option key={d.meta.unitNumber} value={d.meta.unitNumber}>
                Caso {d.meta.unitNumber} — {d.meta.caseTitle} ({d.meta.country})
              </option>
            ))}
          </select>
          <span className="font-typewriter text-[10px] text-[#8b7355]">
            {deck.meta.vocabCount} palabras · {deck.meta.slideCount} diapositivas
          </span>
        </div>
        <button
          onClick={() => window.print()}
          className="clip-skew px-4 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.12)] text-[#e8b455] border border-[rgba(201,147,58,0.35)] hover:bg-[rgba(201,147,58,0.22)] transition-colors"
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <p className="print:hidden text-center font-typewriter text-[10px] text-[#4a3a2a] py-2 px-4">
        Proyecta esta página en clase, o usa “Imprimir / Guardar PDF” (horizontal, una diapositiva por página).
        Todo el contenido viene del archivo del caso — no hay que editar nada a mano.
      </p>

      <div className="deck-root mx-auto max-w-[1100px] px-4 pb-16 print:px-0 print:pb-0 print:max-w-none">
        {deck.slides.map((slide, i) => (
          <Slide key={i} slide={slide} number={i + 1} total={deck.slides.length} />
        ))}
      </div>
    </div>
  );
}

function Slide({ slide, number, total }: { slide: DeckSlide; number: number; total: number }) {
  return (
    <section className="deck-slide relative bg-gradient-to-br from-[#16130f] to-[#0d0b0a] border border-[rgba(201,147,58,0.22)] my-6 px-12 py-10 flex flex-col justify-center print:my-0 print:border-0">
      <SlideBody slide={slide} />
      <span className="absolute bottom-4 right-6 font-typewriter text-[9px] tracking-[0.2em] text-[#4a3a2a]">
        {number} / {total}
      </span>
    </section>
  );
}

function SlideBody({ slide }: { slide: DeckSlide }) {
  switch (slide.kind) {
    case "title":
      return (
        <div className="text-center">
          <p className="font-typewriter text-[11px] tracking-[0.35em] uppercase text-[#8b7355]">
            La Liga Sombra — Detective de Español
          </p>
          <h1 className="font-display font-bold text-5xl text-[#e8b455] mt-4">
            Caso {slide.unitNumber}
          </h1>
          <p className="font-display font-bold text-2xl text-[#f5e6c8] mt-2">{slide.caseTitle}</p>
          <p className="font-typewriter text-sm text-[#c4a882] mt-4">
            {slide.city}, {slide.country}
          </p>
          <p className="font-typewriter text-[11px] tracking-[0.2em] uppercase text-[#8b1a1a] mt-6">
            Sospechoso: {slide.criminalName}
          </p>
        </div>
      );

    case "divider":
      return (
        <div className="text-center">
          <p className="font-typewriter text-[10px] tracking-[0.35em] uppercase text-[#8b7355]">
            Sección {slide.index} de {slide.total}
          </p>
          <h2 className="font-display font-bold text-4xl text-[#e8b455] mt-4">{slide.label}</h2>
        </div>
      );

    case "vocab":
      return (
        <div className="text-center">
          {slide.section && (
            <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355]">
              {slide.section}
            </p>
          )}
          <p className="font-display font-bold text-6xl text-[#f5e6c8] mt-5 leading-tight">
            {slide.spanish}
          </p>
          <p className="font-typewriter text-lg text-[#c9933a] mt-4">{slide.english}</p>
          {slide.example && (
            <div className="mt-8 mx-auto max-w-[46rem] border-t border-[rgba(201,147,58,0.25)] pt-5">
              <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#6b5a48] mb-2">
                Ejemplo
              </p>
              <p className="font-display text-xl text-[#e8b455] italic leading-snug">{slide.example}</p>
            </div>
          )}
        </div>
      );

    case "grammar":
      return (
        <div>
          <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355]">
            Gramática Clave
          </p>
          <h2 className="font-display font-bold text-3xl text-[#e8b455] mt-2">{slide.title}</h2>
          <p className="font-typewriter text-[13px] text-[#c4a882] mt-4 leading-relaxed">
            {slide.briefing}
          </p>

          {slide.table && (
            <table className="mt-6 w-full border-collapse">
              <thead>
                <tr>
                  {slide.table.headers.map((h) => (
                    <th
                      key={h}
                      className="border border-[rgba(201,147,58,0.25)] px-3 py-1.5 text-left font-typewriter text-[10px] tracking-[0.15em] uppercase text-[#c9933a]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slide.table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="border border-[rgba(201,147,58,0.18)] px-3 py-1.5 font-display text-[15px] text-[#f5e6c8]"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {slide.examples.length > 0 && (
            <ul className="mt-5 space-y-1.5">
              {slide.examples.map((ex, i) => (
                <li key={i} className="font-display text-[15px] text-[#e8b455]">
                  {ex.es}
                  <span className="font-typewriter text-[11px] text-[#8b7355]"> — {ex.en}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    case "clue":
      return (
        <div className="text-center">
          <p className="font-typewriter text-[11px] tracking-[0.35em] uppercase text-[#8b1a1a]">
            {slide.title}
          </p>
          <p className="font-display text-2xl text-[#f5e6c8] mt-6 leading-snug mx-auto max-w-[52rem]">
            {slide.text}
          </p>
        </div>
      );

    case "glossary":
      return (
        <div>
          <h2 className="font-display font-bold text-3xl text-[#e8b455] text-center">{slide.title}</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-3">
            {slide.entries.map((e) => (
              <div key={e.word} className="flex justify-between gap-4 border-b border-[rgba(201,147,58,0.15)] pb-1.5">
                <span className="font-display text-[17px] text-[#f5e6c8]">{e.word}</span>
                <span className="font-typewriter text-[12px] text-[#c9933a] text-right">{e.translation}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "repaso":
      return (
        <div>
          <h2 className="font-display font-bold text-3xl text-[#e8b455] text-center">{slide.title}</h2>
          <div className="mt-6 space-y-3">
            {slide.groups.map((g) => (
              <div key={g.label}>
                <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">
                  {g.label}
                </p>
                <p className="font-display text-[15px] text-[#f5e6c8] leading-snug">
                  {g.words.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
  }
}

// Landscape, one slide per page, colours preserved (this deck is projected//
// printed in colour, unlike the black-and-white worksheet packets).
const printCss = `
  @media print {
    @page { size: landscape; margin: 0; }
    html, body {
      background: #0d0b0a !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .deck-slide {
      break-after: page;
      page-break-after: always;
      height: 100vh;
      width: 100%;
      margin: 0 !important;
    }
    .deck-slide:last-child { break-after: auto; page-break-after: auto; }
  }
`;
