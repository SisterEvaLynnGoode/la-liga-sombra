"use client";

import { useState, useEffect, useRef } from "react";
import type { Deck, DeckSlide } from "@/lib/decks/build";
import type { StoryDeck, StorySlide } from "@/lib/decks/story-build";

interface Props {
  decks: Deck[];
  stories: StoryDeck[];
}

type Mode = "vocab" | "story";

export default function DecksClient({ decks, stories }: Props) {
  const [mode, setMode] = useState<Mode>("vocab");
  const [active, setActive] = useState(decks[decks.length - 1]?.meta.unitNumber ?? 1);
  const [storyActive, setStoryActive] = useState(stories[0]?.meta.unitNumber ?? 1);
  const [coreOnly, setCoreOnly] = useState(false);
  // Present mode. Without it a deck is one long scroll of slides that range from
  // 320px to 1230px tall against a ~700px viewport, so projecting means
  // free-scrolling and guessing where a slide starts. One slide per screen,
  // arrow keys to advance.
  const [present, setPresent] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!present) return;
    document.documentElement.classList.add("deck-presenting");
    const go = (dir: 1 | -1) => {
      const nodes = Array.from(rootRef.current?.querySelectorAll("section") ?? []);
      const top = window.scrollY;
      // The slide whose top is nearest the current scroll position, then step.
      let idx = 0;
      nodes.forEach((n, i) => {
        if (n.getBoundingClientRect().top + top <= top + 8) idx = i;
      });
      const next = nodes[Math.min(nodes.length - 1, Math.max(0, idx + dir))];
      next?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(1); }
      if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(-1); }
      if (e.key === "Escape") setPresent(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("deck-presenting");
    };
  }, [present]);

  const deck = decks.find((d) => d.meta.unitNumber === active) ?? decks[0];
  const story = stories.find((s) => s.meta.unitNumber === storyActive) ?? stories[0];

  if (!deck) {
    return (
      <div className="min-h-screen bg-[#0d0b0a] flex items-center justify-center">
        <p className="font-typewriter text-sm text-[#8b7355]">No units with vocabulary yet.</p>
      </div>
    );
  }

  const showStory = mode === "story" && story;
  const storySlides = showStory
    ? coreOnly
      ? story.slides.filter((s) => !(s.kind === "storyBeat" && s.optional))
      : story.slides
    : [];
  const slides: Array<DeckSlide | StorySlide> = showStory ? storySlides : deck.slides;

  return (
    <div className="min-h-screen bg-[#0d0b0a]">
      <style dangerouslySetInnerHTML={{ __html: printCss + presentCss }} />

      {/* Toolbar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-20 border-b border-[rgba(201,147,58,0.2)] bg-[#110f0d] px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Mode toggle */}
          <div className="flex border border-[rgba(201,147,58,0.3)]">
            {([
              ["vocab", "Vocabulary"],
              ["story", "Story"],
            ] as Array<[Mode, string]>).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                disabled={id === "story" && stories.length === 0}
                className={`px-3 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  mode === id
                    ? "bg-[rgba(201,147,58,0.2)] text-[#e8b455]"
                    : "text-[#8b7355] hover:text-[#c9933a]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {showStory ? (
            <>
              <select
                value={storyActive}
                onChange={(e) => setStoryActive(Number(e.target.value))}
                className="bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] text-[#f5e6c8] font-typewriter text-xs px-3 py-1.5 focus:outline-none focus:border-[#c9933a]"
              >
                {stories.map((s) => (
                  <option key={s.meta.unitNumber} value={s.meta.unitNumber}>
                    {s.meta.label ?? `Caso ${s.meta.unitNumber} — ${s.meta.caseTitle} (${s.meta.country})`}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setPresent((v) => !v)}
                className={`px-3 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase border transition-colors ${
                  present
                    ? "bg-[rgba(201,147,58,0.2)] text-[#e8b455] border-[#c9933a]"
                    : "text-[#8b7355] border-[rgba(201,147,58,0.3)] hover:text-[#c9933a]"
                }`}
                title="One slide per screen. Arrow keys or space to advance, Esc to exit."
              >
                ▶ Present
              </button>
              <button
                onClick={() => setCoreOnly((v) => !v)}
                className={`px-3 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase border transition-colors ${
                  coreOnly
                    ? "bg-[rgba(111,170,92,0.15)] text-[#6faa5c] border-[rgba(111,170,92,0.5)]"
                    : "text-[#8b7355] border-[rgba(201,147,58,0.3)] hover:text-[#c9933a]"
                }`}
                title="Drop the optional slides for a shorter run"
              >
                Core
              </button>
              <span className="font-typewriter text-[10px] text-[#8b7355]">
                {coreOnly
                  ? `${story.meta.coreSlideCount} slides · ~${story.meta.coreMinutes} min`
                  : `${story.meta.slideCount} slides · ~${story.meta.estimatedMinutes} min`}
              </span>
            </>
          ) : (
            <>
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
                {deck.meta.vocabCount} words · {deck.meta.slideCount} slides
              </span>
            </>
          )}
        </div>
        <button
          onClick={() => window.print()}
          className="clip-skew px-4 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.12)] text-[#e8b455] border border-[rgba(201,147,58,0.35)] hover:bg-[rgba(201,147,58,0.22)] transition-colors"
        >
          Print / Save PDF
        </button>
      </div>

      <p className="print:hidden text-center font-typewriter text-[10px] text-[#4a3a2a] py-2 px-4 max-w-[70rem] mx-auto">
        {showStory
          ? "Project this before the case — or, in the paper weeks, on its own. The ESTO ES REAL stamp marks verifiable facts; everything else is invented for the case."
          : "Project this page in class, or use “Print / Save PDF” (landscape, one slide per page). Everything is generated from the case file — nothing to edit by hand."}
      </p>

      {showStory && (
        <div className="print:hidden mx-auto max-w-[70rem] px-6 pb-4">
          <details className="border border-[rgba(201,147,58,0.2)] bg-[#110f0d] px-4 py-2">
            <summary className="cursor-pointer font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#c9933a]">
              Teacher note
            </summary>
            <p className="mt-3 font-typewriter text-[11px] leading-relaxed text-[#c4a882]">
              {story.teacherNote}
            </p>
          </details>
        </div>
      )}

      <div
        ref={rootRef}
        className={`deck-root mx-auto max-w-[1100px] px-4 pb-16 print:px-0 print:pb-0 print:max-w-none ${present ? "deck-present" : ""}`}
      >
        {slides.map((slide, i) => (
          <Slide key={`${mode}-${i}`} slide={slide} number={i + 1} total={slides.length} />
        ))}
      </div>
    </div>
  );
}

function Slide({
  slide,
  number,
  total,
}: {
  slide: DeckSlide | StorySlide;
  number: number;
  total: number;
}) {
  const isStory = slide.kind.startsWith("story");
  return (
    <section className="deck-slide relative bg-gradient-to-br from-[#16130f] to-[#0d0b0a] border border-[rgba(201,147,58,0.22)] my-6 px-12 py-10 flex flex-col justify-center print:my-0 print:border-0">
      {isStory ? <StorySlideBody slide={slide as StorySlide} /> : <SlideBody slide={slide as DeckSlide} />}
      <span className="absolute bottom-4 right-6 font-typewriter text-[9px] tracking-[0.2em] text-[#4a3a2a]">
        {number} / {total}
      </span>
    </section>
  );
}

/** The ESTO ES REAL / FICCIÓN stamp. The whole point is that students can see,
 *  at a glance and without being told, which claims survive a Google search. */
function RealStamp({ real }: { real: boolean }) {
  return real ? (
    <span className="absolute top-6 right-8 -rotate-[8deg] border-2 border-[#4a7c3f] px-3 py-1 font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#6faa5c]">
      Esto es real
    </span>
  ) : (
    <span className="absolute top-6 right-8 -rotate-[8deg] border-2 border-[rgba(139,26,26,0.7)] px-3 py-1 font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#a33]">
      Ficción del caso
    </span>
  );
}

function StorySlideBody({ slide }: { slide: StorySlide }) {
  switch (slide.kind) {
    case "storyCover":
      return (
        <div className="text-center">
          <p className="font-typewriter text-[11px] tracking-[0.35em] uppercase text-[#8b7355]">
            La Liga Sombra — Antes de Empezar
          </p>
          {/* The orientation decks are not cases — a cover reading "Caso 0" on
              the first day of school is just wrong. They carry their own title. */}
          {slide.unitNumber >= 1 && (
            <h1 className="font-display font-bold text-5xl text-[#e8b455] mt-4">Caso {slide.unitNumber}</h1>
          )}
          <p className="font-display font-bold text-3xl text-[#f5e6c8] mt-2">{slide.caseTitle}</p>
          <p className="font-typewriter text-sm text-[#c4a882] mt-4">
            {slide.unitNumber >= 1 ? `${slide.city}, ${slide.country}` : slide.city}
          </p>
          <p className="font-typewriter text-[12px] text-[#8b7355] mt-8 max-w-[38rem] mx-auto leading-relaxed">
            {slide.hook}
          </p>
        </div>
      );

    case "storyBeat":
      return (
        <div className="relative">
          <RealStamp real={slide.real} />
          <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355]">
            {slide.eyebrow}
            {slide.optional && (
              <span className="print:hidden ml-3 normal-case tracking-normal text-[9px] text-[#4a3a2a]">
                (optional — removed by “Core”)
              </span>
            )}
          </p>
          <h2 className="font-display font-bold text-4xl text-[#e8b455] mt-3 pr-40">{slide.headline}</h2>

          <div className={slide.facts?.length ? "mt-6 grid grid-cols-[1.6fr_1fr] gap-10" : "mt-6"}>
            <div className="space-y-3">
              {slide.body.map((p, i) => (
                <p key={i} className="font-typewriter text-[13px] leading-relaxed text-[#c4a882]">
                  {p}
                </p>
              ))}
              {slide.pull && (
                <p className="font-display text-2xl italic text-[#e8b455] leading-snug border-l-2 border-[rgba(201,147,58,0.4)] pl-5 mt-5">
                  {slide.pull}
                </p>
              )}
            </div>

            {slide.facts?.length ? (
              <div className="border border-[rgba(201,147,58,0.2)] p-4 self-start">
                {slide.facts.map((f) => (
                  <div key={f.label} className="py-1.5 border-b border-[rgba(201,147,58,0.12)] last:border-0">
                    <p className="font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#6b5a48]">
                      {f.label}
                    </p>
                    <p className="font-display text-[15px] text-[#f5e6c8] leading-snug">{f.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      );

    case "storyVocab":
      return (
        <div>
          <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#c9933a]">
            {slide.eyebrow}
          </p>
          <h2 className="font-display font-bold text-3xl text-[#e8b455] mt-2">{slide.headline}</h2>
          <p className="font-typewriter text-[13px] leading-relaxed text-[#c4a882] mt-4 max-w-[52rem]">
            {slide.situation}
          </p>

          <div className="mt-6 space-y-2">
            {slide.entries.map((e) => (
              <div
                key={e.spanish}
                className="grid grid-cols-[14rem_12rem_1fr] gap-4 items-baseline border-b border-[rgba(201,147,58,0.15)] pb-2"
              >
                <span className="font-display font-bold text-2xl text-[#f5e6c8]">{e.spanish}</span>
                <span className="font-typewriter text-[13px] text-[#c9933a]">{e.english}</span>
                <span className="font-typewriter text-[11px] text-[#6b5a48]">{e.note ?? ""}</span>
              </div>
            ))}
          </div>

          {slide.production && (
            <div className="mt-6 border-l-2 border-[#6faa5c] bg-[rgba(111,170,92,0.06)] pl-5 py-3">
              <p className="font-typewriter text-[9px] tracking-[0.25em] uppercase text-[#6faa5c]">
                Dilo en voz alta · 30 segundos
              </p>
              <p className="font-typewriter text-[12px] text-[#c4a882] mt-1.5">
                {slide.production.instruction}
              </p>
              <p className="font-display text-xl text-[#f5e6c8] mt-2">{slide.production.say}</p>
            </div>
          )}
        </div>
      );

    case "storyExpect":
      return (
        <div>
          <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355]">
            {slide.eyebrow ?? "La Misión"}
          </p>
          <h2 className="font-display font-bold text-4xl text-[#e8b455] mt-2">{slide.headline}</h2>
          <ol className="mt-7 space-y-3">
            {slide.items.map((it, i) => (
              <li key={it.label} className="grid grid-cols-[2.5rem_11rem_1fr] gap-4 items-baseline">
                <span className="font-display text-2xl text-[rgba(201,147,58,0.45)]">{i + 1}</span>
                <span className="font-typewriter text-[11px] tracking-[0.15em] uppercase text-[#c9933a]">
                  {it.label}
                </span>
                <span className="font-typewriter text-[13px] text-[#c4a882] leading-relaxed">{it.text}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "storyDiscuss":
      return (
        <div className="text-center">
          <p className="font-typewriter text-[11px] tracking-[0.35em] uppercase text-[#6faa5c]">
            Hablen · Turn and Talk
          </p>
          <p className="font-display text-3xl text-[#f5e6c8] mt-7 leading-snug mx-auto max-w-[50rem]">
            {slide.prompt}
          </p>
          {slide.followups.length > 0 && (
            <div className="mt-10 mx-auto max-w-[46rem] border-t border-[rgba(201,147,58,0.25)] pt-6 space-y-3">
              {slide.followups.map((f, i) => (
                <p key={i} className="font-typewriter text-[13px] text-[#c4a882] leading-relaxed">
                  {f}
                </p>
              ))}
            </div>
          )}
        </div>
      );

    case "storyCloser":
      return (
        <div className="text-center">
          <p className="font-typewriter text-[11px] tracking-[0.35em] uppercase text-[#8b7355]">
            {slide.caseTitle}
          </p>
          <p className="font-display font-bold text-5xl text-[#e8b455] mt-8 leading-tight">{slide.text}</p>
        </div>
      );
  }
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
const presentCss = `
  /* One slide per screen, snapped, so advancing is a keypress and never a guess.
     The snap container must be the element that actually scrolls. .deck-root has
     overflow: visible and never scrolls — the document does — so putting
     scroll-snap-type on the inner div silently does nothing. */
  html.deck-presenting { scroll-snap-type: y mandatory; }
  .deck-present > section {
    min-height: 100vh;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0;
  }
  /* A slide taller than the screen still scrolls rather than clipping — better a
     scroll than a headline cut in half in front of a class. */
  .deck-present > section { overflow-y: auto; }
`;

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
