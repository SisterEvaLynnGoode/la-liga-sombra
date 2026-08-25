import { redirect } from "next/navigation";
import Link from "next/link";
import { getTeacherSession } from "@/lib/auth/session";
import { buildSyllabusDeck, FAMILY_CLASS_CODE } from "@/lib/decks/syllabus";
import type { StorySlide } from "@/lib/decks/story-build";

export const metadata = { title: "Syllabus para familias — La Liga Sombra" };

/**
 * The same syllabus as the projected deck, laid out as a two-page take-home.
 *
 * Printing the deck gives eleven landscape slides — right for a wall, wrong for
 * thirty families to carry out of a gym. Same source data, so the handout and
 * the projection can never say different things.
 */
export default async function SyllabusHandoutPage() {
  if (!(await getTeacherSession())) redirect("/teacher/login");

  const deck = buildSyllabusDeck();
  const beats = deck.slides.filter((s): s is Extract<StorySlide, { kind: "storyBeat" }> => s.kind === "storyBeat");
  const norms = deck.slides.find((s) => s.kind === "storyExpect") as Extract<StorySlide, { kind: "storyExpect" }> | undefined;
  const codeBeat = beats.find((b) => b.eyebrow.startsWith("En Casa"));

  return (
    <div className="min-h-screen bg-[#0d0b0a]">
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      <div className="print:hidden sticky top-0 z-20 border-b border-[rgba(201,147,58,0.2)] bg-[#110f0d] px-6 py-3 flex items-center gap-4 flex-wrap">
        <Link href="/teacher/decks" className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] hover:text-[#c9933a]">
          ← Decks
        </Link>
        <h1 className="font-display text-lg font-bold text-[#f5e6c8]">Syllabus — family handout</h1>
        <span className="font-typewriter text-[10px] text-[#8b7355]">
          Two pages, portrait · same content as the projected deck
        </span>
      </div>

      <p className="print:hidden text-center font-typewriter text-[10px] text-[#4a3a2a] py-2 px-4 max-w-[46rem] mx-auto leading-relaxed">
        Ctrl/⌘ + P to print. Give this out at the door; project the deck (Decks → Story → Familias) from the front.
      </p>

      <div className="ws-root mx-auto my-6 max-w-[820px] bg-white text-black px-10 py-10 print:my-0 print:max-w-none print:px-0 print:py-0">
        {/* ── Page 1 ─────────────────────────────────────────────────────── */}
        <section className="ws-page">
          <header className="border-b-2 border-black pb-1.5 mb-2">
            <p className="text-[10px] tracking-[0.3em] uppercase">La Liga Sombra · Noche de Regreso a Clases</p>
            <h2 className="text-3xl font-bold leading-tight">Español 1 — Syllabus para Familias</h2>
            <p className="text-[11px] italic mt-0.5">{deck.slides[0].kind === "storyCover" ? deck.slides[0].hook : ""}</p>
          </header>

          {beats
            .filter((b) => !b.eyebrow.startsWith("En Casa") && !b.eyebrow.startsWith("Cómo Ayudar") && !b.eyebrow.startsWith("Ahora Mismo"))
            .map((b) => (
              <div key={b.eyebrow} className="mb-1.5">
                <p className="text-[9px] tracking-[0.25em] uppercase">{b.eyebrow}</p>
                <h3 className="text-[15px] font-bold leading-tight mb-1">{b.headline}</h3>
                {b.body.map((p) => (
                  <p key={p.slice(0, 24)} className="text-[11px] leading-snug mb-1">{p}</p>
                ))}
                {b.facts && (
                  <div className="grid grid-cols-2 gap-x-5 border-l-2 border-black pl-2 mt-1">
                    {b.facts.map((f) => (
                      <p key={f.label} className="text-[10px]">
                        <span className="font-bold">{f.label}:</span> {f.value}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </section>

        {/* ── Page 2 ─────────────────────────────────────────────────────── */}
        <section className="ws-page">
          <header className="border-b-2 border-black pb-1.5 mb-3">
            <h2 className="text-2xl font-bold leading-tight">Las Normas · How This Room Works</h2>
          </header>

          {norms && (
            <ol className="mb-4">
              {norms.items.map((it, i) => (
                <li key={it.label} className="grid grid-cols-[1.2rem_7rem_1fr] gap-2 items-baseline mb-1.5">
                  <span className="text-[11px]">{i + 1}.</span>
                  <span className="text-[10px] tracking-[0.1em] uppercase font-bold">{it.label}</span>
                  <span className="text-[11px] leading-snug">{it.text}</span>
                </li>
              ))}
            </ol>
          )}

          {/* The reason a family keeps this page. */}
          {codeBeat && (
            <div className="border-4 border-black p-3 mb-4">
              <p className="text-[9px] tracking-[0.25em] uppercase">{codeBeat.eyebrow}</p>
              <h3 className="text-2xl font-bold leading-tight">Class code: {FAMILY_CLASS_CODE}</h3>
              {codeBeat.body.map((p) => (
                <p key={p.slice(0, 24)} className="text-[11px] leading-snug mt-1">{p}</p>
              ))}
              {codeBeat.facts && (
                <div className="grid grid-cols-2 gap-x-5 mt-2 pt-2 border-t border-black">
                  {codeBeat.facts.map((f) => (
                    <p key={f.label} className="text-[11px]">
                      <span className="font-bold">{f.label}:</span> {f.value}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {beats
            .filter((b) => b.eyebrow.startsWith("Cómo Ayudar") || b.eyebrow.startsWith("Ahora Mismo"))
            .map((b) => (
              <div key={b.eyebrow} className="mb-1.5">
                <p className="text-[9px] tracking-[0.25em] uppercase">{b.eyebrow}</p>
                <h3 className="text-[15px] font-bold leading-tight mb-1">{b.headline}</h3>
                {b.body.map((p) => (
                  <p key={p.slice(0, 24)} className="text-[11px] leading-snug mb-1">{p}</p>
                ))}
              </div>
            ))}


          <p className="mt-3 pt-2 border-t border-black text-[10px] italic">
            {deck.slides[deck.slides.length - 1].kind === "storyCloser"
              ? (deck.slides[deck.slides.length - 1] as Extract<StorySlide, { kind: "storyCloser" }>).text
              : ""}
          </p>
        </section>
      </div>
    </div>
  );
}

const printCss = `
  @media print {
    @page { size: letter portrait; margin: 0.55in; }
    html, body { background: #fff !important; }
    .ws-page { break-after: page; }
    .ws-page:last-child { break-after: auto; }
    .ws-root, .ws-root * {
      color: #000 !important; background: transparent !important;
      border-color: #000 !important; box-shadow: none !important;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
  }
  .ws-page { padding-bottom: 0.5rem; margin-bottom: 2rem; }
`;
