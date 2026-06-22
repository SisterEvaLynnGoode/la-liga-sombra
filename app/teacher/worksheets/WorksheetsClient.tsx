"use client";

import { useState } from "react";
import Link from "next/link";
import type { WorksheetPacket } from "@/lib/worksheets/generate";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

interface Props {
  packets: WorksheetPacket[];
}

type Section = "lessonPlan" | "vocabulary" | "grammar" | "culture" | "answers";

const SECTION_LABELS: Array<[Section, string]> = [
  ["lessonPlan", "Lesson plan"],
  ["vocabulary", "Vocabulary"],
  ["grammar", "Grammar"],
  ["culture", "Culture"],
  ["answers", "Answer key"],
];

export default function WorksheetsClient({ packets }: Props) {
  const [unitNumber, setUnitNumber] = useState(packets[0]?.unitNumber ?? 1);
  const [show, setShow] = useState<Record<Section, boolean>>({
    lessonPlan: true,
    vocabulary: true,
    grammar: true,
    culture: true,
    answers: true,
  });

  const packet = packets.find((p) => p.unitNumber === unitNumber) ?? packets[0];

  function toggle(s: Section) {
    setShow((prev) => ({ ...prev, [s]: !prev[s] }));
  }

  if (!packet) {
    return (
      <div className="min-h-screen bg-[#0c0e14] flex items-center justify-center p-8">
        <p className="font-typewriter text-sm text-[#8b7355]">No unit content available yet.</p>
      </div>
    );
  }

  const roman = ROMAN[(packet.unitNumber - 1) % ROMAN.length] ?? String(packet.unitNumber);

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
            <h1 className="font-display font-bold text-lg text-[#e8b455] leading-tight">Lesson Plans &amp; Worksheets</h1>
          </div>
          <select
            value={unitNumber}
            onChange={(e) => setUnitNumber(Number(e.target.value))}
            className="bg-[#1a1614] border border-[rgba(201,147,58,0.25)] px-3 py-1.5 font-typewriter text-sm text-[#f5e6c8] focus:outline-none focus:border-[#c9933a]"
          >
            {packets.map((p) => (
              <option key={p.unitNumber} value={p.unitNumber}>
                Unit {p.unitNumber} — {p.country} · {p.caseTitle}
              </option>
            ))}
          </select>
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
        Day 3 (HQ): print Vocabulary + Grammar. Day 4 (Culture): print just Culture. Everything prints in black &amp; white.
      </p>

      {/* ── Printable sheet ────────────────────────────────────────────────── */}
      <div className="ws-root mx-auto my-6 max-w-[820px] bg-white text-black px-10 py-10 print:my-0 print:max-w-none print:px-0 print:py-0">
        {show.lessonPlan && <LessonPlan packet={packet} roman={roman} />}
        {show.vocabulary && <VocabularyFiles packet={packet} roman={roman} />}
        {show.grammar && <GrammarFile packet={packet} roman={roman} />}
        {show.culture && <CultureFile packet={packet} roman={roman} />}
        {show.answers && <AnswerKey packet={packet} roman={roman} />}
      </div>
    </div>
  );
}

// ── Shared printable pieces ─────────────────────────────────────────────────

function Stamp({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border-[3px] border-black px-3 py-1 font-display font-black tracking-[0.15em] uppercase text-black -rotate-3">
      {children}
    </span>
  );
}

function SheetHeader({ roman, country, caseTitle, label }: { roman: string; country: string; caseTitle: string; label: string }) {
  return (
    <div className="flex items-end justify-between border-b-2 border-black pb-2 mb-5">
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase">La Liga Sombra · Confidential</p>
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase">Case {roman} · {country} — &ldquo;{caseTitle}&rdquo;</p>
      </div>
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase">{label}</p>
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

function SectionTitle({ n, es, en }: { n: number; es: string; en: string }) {
  return (
    <h3 className="font-display font-black text-lg uppercase tracking-wide mt-6 mb-2 flex items-center gap-2">
      <span className="inline-flex items-center justify-center w-6 h-6 border-2 border-black text-sm font-mono">{n}</span>
      {es} <span className="font-mono text-[11px] font-normal normal-case tracking-normal">/ {en}</span>
    </h3>
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

// ── Lesson Plan (teacher) ───────────────────────────────────────────────────

function LessonPlan({ packet, roman }: { packet: WorksheetPacket; roman: string }) {
  return (
    <section className="ws-page">
      <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="Teacher Lesson Plan" />

      <div className="flex items-center gap-3 mb-4">
        <Stamp>Classified</Stamp>
        <div>
          <h2 className="font-display font-black text-2xl uppercase leading-none">{packet.caseTitle}</h2>
          <p className="font-mono text-[11px]">{packet.country}{packet.city ? ` · ${packet.city}` : ""} — Suspect: {packet.criminalName}</p>
        </div>
      </div>

      <div className="border-2 border-black p-3 mb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Case Briefing</p>
        <p className="font-serif text-[13px] leading-snug">{packet.caseDescription}</p>
      </div>

      {/* Objectives */}
      <h3 className="font-display font-black text-base uppercase mt-4 mb-1">Learning Objectives</h3>
      <ul className="list-disc ml-5 font-serif text-[13px] leading-snug space-y-0.5">
        <li><strong>Vocabulary:</strong> Students recognize and produce the {packet.vocabCount} key terms of this unit.</li>
        <li><strong>Grammar:</strong> {packet.grammar.title}.</li>
        {packet.culture && <li><strong>Culture:</strong> {packet.culture.theme} — students analyze its products, practices &amp; perspectives and create a cultural product.</li>}
        <li><strong>Communication:</strong> Students describe a suspect and report findings in Spanish, staying in the detective role.</li>
      </ul>

      {/* Weekly rhythm */}
      <h3 className="font-display font-black text-base uppercase mt-4 mb-1">The 4-Day Weekly Engine</h3>
      <table className="w-full border-collapse font-serif text-[12px] mb-3">
        <tbody>
          {[
            ["Day 1 — Field (game)", "Play this unit in La Liga Sombra: Academia + Briefing + first stages. Meet the vocabulary in context."],
            ["Day 2 — Field (game)", "Continue the case to the Identificación stage and solve it. Capture the suspect."],
            ["Day 3 — HQ (worksheet)", "Print the Vocabulary + Grammar files. Reinforce the same words and grammar on paper, away from the screen."],
            ["Day 4 — Culture", "Print the Culture file. Read the three P's, do the comparison, and build the cultural product. Work toward the arc's presentation milestone."],
          ].map(([d, desc]) => (
            <tr key={d} className="border border-black align-top">
              <td className="border border-black p-2 font-mono text-[11px] w-[30%]">{d}</td>
              <td className="border border-black p-2">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="font-serif text-[11px] italic mb-3">
        Across an 18-week semester this engine repeats once per unit, ending each six-week arc with a student presentation.
      </p>

      {/* Lesson flow */}
      <h3 className="font-display font-black text-base uppercase mt-4 mb-1">HQ-Day Flow (≈45 min)</h3>
      <ol className="list-decimal ml-5 font-serif text-[13px] leading-snug space-y-0.5">
        <li><strong>Warm-up (5 min):</strong> Post the suspect&apos;s name. Students brainstorm 5 Spanish words to describe a suspect.</li>
        <li><strong>Vocabulary File (15 min):</strong> Matching, Translate the Evidence, Unscramble the Clues.</li>
        <li><strong>Grammar File (20 min):</strong> Reference table + mini-lesson, the Crack-the-Code drill, the transformation/conjugation drill, then a short production task.</li>
        <li><strong>Exit ticket (5 min):</strong> One Spanish sentence describing the suspect.</li>
      </ol>

      <div className="border-l-4 border-black pl-3 mt-4 font-serif text-[12px]">
        <strong>Materials:</strong> printed files (this document), pencil. No screens required.
        <br /><strong>Differentiation:</strong> struggling agents may use the in-app Academia or the Vocabulary Bank page as a word reference; the Grammar reference table stays beside them while they work.
      </div>
    </section>
  );
}

// ── Vocabulary files (Day 3a) ───────────────────────────────────────────────

function VocabularyFiles({ packet, roman }: { packet: WorksheetPacket; roman: string }) {
  return (
    <>
      {/* Cover / briefing */}
      <section className="ws-page">
        <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="Agent Case File" />
        <NameLine />
        <div className="text-center my-8">
          <p className="font-mono text-[11px] tracking-[0.35em] uppercase mb-3">— Top Secret Assignment —</p>
          <div className="inline-block border-4 border-black px-6 py-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em]">Case {roman}</p>
            <h2 className="font-display font-black text-3xl uppercase leading-tight my-1">{packet.caseTitle}</h2>
            <p className="font-mono text-[12px]">{packet.country}{packet.city ? ` · ${packet.city}` : ""}</p>
          </div>
        </div>
        <div className="border-2 border-black p-3 mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Your Mission</p>
          <p className="font-serif text-[13px] leading-snug">{packet.caseDescription}</p>
        </div>
        <p className="font-serif text-[13px] leading-snug">
          Detective, a thief known as <strong>&ldquo;{packet.criminalName}&rdquo;</strong> is on the loose. Complete the training
          files in this packet to sharpen your Spanish. Each completed file brings you closer to cracking the case.
          ¡Buena suerte, agente!
        </p>
        <p className="font-mono text-[10px] mt-6 text-center tracking-[0.2em] uppercase">▮ ▮ ▮ Begin Training ▮ ▮ ▮</p>
      </section>

      {/* Vocabulary File: Match + Translate + Unscramble */}
      <section className="ws-page">
        <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="Vocabulary File" />
        <NameLine />

        <SectionTitle n={1} es="Archivo de Vocabulario" en="Match the Evidence" />
        <p className="font-serif text-[12px] mb-3">Draw a line from each Spanish word to its English meaning. Write the matching letter in the box.</p>
        <div className="flex gap-8">
          <ol className="flex-1 font-serif text-[13px] space-y-1.5">
            {packet.match.spanish.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="font-mono w-5">{String.fromCharCode(65 + i)}.</span>
                <span className="flex-1 border-b border-dotted border-black pb-0.5">{s}</span>
              </li>
            ))}
          </ol>
          <ol className="flex-1 font-serif text-[13px] space-y-1.5">
            {packet.match.english.map((e, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="inline-block w-6 h-5 border border-black" />
                <span className="font-mono text-[11px] text-gray-700">{i + 1}.</span>
                <span className="flex-1">{e.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <SectionTitle n={2} es="Traduce la Evidencia" en="Translate the Evidence" />
        <p className="font-serif text-[12px] mb-3">Write the translation on the line. ES→EN = write in English. EN→ES = write in Spanish.</p>
        <ol className="grid grid-cols-2 gap-x-8 gap-y-2 font-serif text-[13px]">
          {packet.translate.map((t, i) => (
            <li key={i} className="flex items-baseline gap-2">
              <span className="font-mono text-[11px] w-5">{i + 1}.</span>
              <span className="font-mono text-[10px] border border-black px-1">{t.direction === "es-en" ? "ES→EN" : "EN→ES"}</span>
              <span className="font-semibold">{t.prompt}</span>
              <span className="flex-1 border-b border-black">&nbsp;</span>
            </li>
          ))}
        </ol>

        <SectionTitle n={3} es="Pistas Revueltas" en="Unscramble the Clues" />
        <p className="font-serif text-[12px] mb-3">Each clue is a scrambled Spanish word. Use the English hint to unscramble it.</p>
        <ol className="font-serif text-[13px] space-y-2.5">
          {packet.unscramble.map((u, i) => (
            <li key={i} className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] w-5">{i + 1}.</span>
              <span className="font-mono tracking-[0.25em] border border-black px-2 py-0.5">{u.scrambled}</span>
              <span className="font-serif italic text-[12px]">({u.hint})</span>
              <span className="font-mono">→</span>
              <span className="flex-1 border-b border-black">&nbsp;</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Vocabulary Bank reference */}
      <section className="ws-page">
        <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="Reference · Vocabulary Bank" />
        <h3 className="font-display font-black text-lg uppercase mb-1">Banco de Vocabulario / Vocabulary Bank</h3>
        <p className="font-serif text-[12px] mb-3">Keep this reference handy while you work. Every key term for Case {roman}.</p>
        <table className="w-full border-collapse font-serif text-[12px]">
          <thead>
            <tr>
              <th className="border border-black p-1.5 text-left font-mono text-[10px] uppercase">Español</th>
              <th className="border border-black p-1.5 text-left font-mono text-[10px] uppercase">English</th>
            </tr>
          </thead>
          <tbody>
            {packet.allVocab.map((v, i) => (
              <tr key={i}>
                <td className="border border-black p-1.5 font-semibold">{v.spanish}</td>
                <td className="border border-black p-1.5">{v.english}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

// ── Grammar file (Day 3b) ───────────────────────────────────────────────────

function GrammarFile({ packet, roman }: { packet: WorksheetPacket; roman: string }) {
  const g = packet.grammar;
  return (
    <section className="ws-page">
      <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="Grammar File" />
      <NameLine />

      {/* Mini-lesson */}
      <div className="border-2 border-black p-3 mb-3">
        <p className="font-display font-black text-base uppercase mb-1">{g.title}</p>
        <p className="font-serif text-[13px] leading-snug">{g.briefing}</p>
      </div>

      {/* Reference / conjugation table */}
      {g.referenceTable && (
        <div className="mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">{g.referenceTable.caption}</p>
          <table className="w-full border-collapse font-serif text-[12px]">
            <thead>
              <tr>
                {g.referenceTable.headers.map((h, i) => (
                  <th key={i} className="border border-black p-1.5 text-left font-mono text-[10px] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.referenceTable.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={`border border-black p-1.5 ${ci === 0 ? "font-mono text-[11px]" : "font-semibold"}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Examples */}
      {g.examples.length > 0 && (
        <div className="mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Evidence Examples</p>
          <ul className="font-serif text-[13px] space-y-1">
            {g.examples.map((ex, i) => (
              <li key={i} className="border-l-4 border-black pl-3">
                <span className="font-semibold">{ex.es}</span>
                <span className="block font-mono text-[11px] text-gray-700">{ex.en}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Drill 1: Crack the Code (word bank, recognition) */}
      <SectionTitle n={1} es="Descifra el Código" en="Crack the Code" />
      <p className="font-serif text-[12px] mb-2">Each sentence is missing a word. Decode it using the Word Bank. Each word is used once.</p>
      <div className="border-2 border-black p-2 mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Word Bank / Banco de Palabras</p>
        <p className="font-serif text-[13px] tracking-wide">{packet.wordBank.bank.join("   ·   ")}</p>
      </div>
      <ol className="font-serif text-[13px] space-y-2.5">
        {packet.wordBank.items.map((item, i) => (
          <li key={i} className="flex items-baseline gap-2">
            <span className="font-mono text-[11px] w-5">{i + 1}.</span>
            <span>{renderBlank(item.sentence)}</span>
          </li>
        ))}
      </ol>

      {/* Drill 2: second drill (transform / conjugate / translate, production) */}
      {g.secondDrill && (
        <>
          <SectionTitle n={2} es="Análisis Gramatical" en={g.secondDrill.title} />
          <p className="font-serif text-[12px] mb-3">{g.secondDrill.instructions}</p>
          <ol className="font-serif text-[13px] space-y-2.5">
            {g.secondDrill.items.map((d, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span className="font-mono text-[11px] w-5">{i + 1}.</span>
                <span>{renderBlank(d.prompt)}{d.hint ? <em className="text-[12px]"> ({d.hint})</em> : null}</span>
                {!/____/.test(d.prompt) && <span className="flex-1 border-b border-black">&nbsp;</span>}
              </li>
            ))}
          </ol>
        </>
      )}

      {/* Production: write your own */}
      <SectionTitle n={3} es="Informe de Campo" en="Field Report — Write Your Own" />
      <p className="font-serif text-[12px] mb-2">
        Apply <strong>{g.title}</strong>. Write three original Spanish sentences about the case. Underline the grammar structure in each.
      </p>
      <ol className="font-serif text-[13px] space-y-1">
        {[
          "Describe the suspect or a witness:",
          "Report an action or movement in the case:",
          "Write a question you would ask a suspect:",
        ].map((p, i) => (
          <li key={i}>
            <span className="font-mono text-[11px]">{i + 1}.</span> {p}
            <WriteLines count={2} />
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Culture file (Day 4) ────────────────────────────────────────────────────

function CultureFile({ packet, roman }: { packet: WorksheetPacket; roman: string }) {
  const c = packet.culture;
  if (!c) {
    return (
      <section className="ws-page">
        <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="Culture File" />
        <p className="font-serif text-[13px] italic">Culture content for this unit is coming soon.</p>
      </section>
    );
  }

  return (
    <>
      {/* Reading + the three P's */}
      <section className="ws-page">
        <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="Culture File" />
        <NameLine />

        <div className="flex items-center gap-3 mb-3">
          <Stamp>Cultura</Stamp>
          <h2 className="font-display font-black text-xl uppercase leading-none">{c.theme}</h2>
        </div>
        <p className="font-serif text-[12px] mb-4 italic">
          Read the briefing below. A good agent understands the culture, not just the language.
        </p>

        {[
          ["Products / Productos", c.reading.products],
          ["Practices / Prácticas", c.reading.practices],
          ["Perspectives / Perspectivas", c.reading.perspectives],
        ].map(([label, body]) => (
          <div key={label} className="border-l-4 border-black pl-3 mb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-0.5">{label}</p>
            <p className="font-serif text-[13px] leading-snug">{body}</p>
          </div>
        ))}

        <SectionTitle n={1} es="Comprensión" en="Check the Evidence" />
        <ol className="font-serif text-[13px] space-y-3">
          {c.comprehension.map((q, i) => (
            <li key={i}>
              <span className="font-mono text-[11px]">{i + 1}.</span> {q.question}
              <span className="block border-b border-black h-5 mt-1" />
            </li>
          ))}
        </ol>
      </section>

      {/* Compare + project */}
      <section className="ws-page">
        <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="Culture File · Project" />
        <NameLine />

        <SectionTitle n={2} es="Compara las Culturas" en="Compare Cultures" />
        <p className="font-serif text-[13px] mb-1">{c.compara}</p>
        <WriteLines count={4} />

        <SectionTitle n={3} es="Proyecto Cultural" en={c.project.title} />
        <div className="border-2 border-black p-3 mb-3">
          <p className="font-serif text-[13px] leading-snug">{c.project.brief}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Success Checklist</p>
            <ul className="font-serif text-[12px] space-y-1.5">
              {c.project.checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="inline-block w-4 h-4 border border-black shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Materials</p>
            <p className="font-serif text-[12px]">{c.project.materials}</p>
          </div>
        </div>

        {/* Build space */}
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mt-4 mb-1">Build it here / Constrúyelo aquí</p>
        <div className="border-2 border-black border-dashed h-64" />
        <p className="font-mono text-[10px] mt-4 text-center tracking-[0.2em] uppercase">▮ ▮ ▮ Add this page to your Pasaporte Cultural ▮ ▮ ▮</p>
      </section>
    </>
  );
}

// ── Answer Key (teacher) ────────────────────────────────────────────────────

function AnswerKey({ packet, roman }: { packet: WorksheetPacket; roman: string }) {
  const g = packet.grammar;
  return (
    <section className="ws-page">
      <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="Teacher Answer Key" />
      <div className="flex items-center gap-3 mb-4">
        <Stamp>Answer Key</Stamp>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em]">For teacher use only</p>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {/* Match */}
        <div>
          <p className="font-display font-black text-sm uppercase mb-1">Vocab · Match the Evidence</p>
          <ol className="font-serif text-[12px] space-y-0.5">
            {packet.match.english.map((e, i) => (
              <li key={i} className="font-mono">{i + 1}. {e.text} → {e.answerLetter}</li>
            ))}
          </ol>
        </div>

        {/* Translate */}
        <div>
          <p className="font-display font-black text-sm uppercase mb-1">Vocab · Translate the Evidence</p>
          <ol className="font-serif text-[12px] space-y-0.5">
            {packet.translate.map((t, i) => (
              <li key={i}><span className="font-mono">{i + 1}.</span> {t.prompt} = <strong>{t.answer}</strong></li>
            ))}
          </ol>
        </div>

        {/* Unscramble */}
        <div>
          <p className="font-display font-black text-sm uppercase mb-1">Vocab · Unscramble the Clues</p>
          <ol className="font-serif text-[12px] space-y-0.5">
            {packet.unscramble.map((u, i) => (
              <li key={i}><span className="font-mono">{i + 1}.</span> {u.scrambled} = <strong>{u.answer}</strong></li>
            ))}
          </ol>
        </div>

        {/* Crack the Code */}
        <div>
          <p className="font-display font-black text-sm uppercase mb-1">Grammar · Crack the Code</p>
          <ol className="font-serif text-[12px] space-y-0.5">
            {packet.wordBank.items.map((item, i) => (
              <li key={i}><span className="font-mono">{i + 1}.</span> <strong>{item.answer}</strong></li>
            ))}
          </ol>
        </div>

        {/* Second grammar drill */}
        {g.secondDrill && (
          <div>
            <p className="font-display font-black text-sm uppercase mb-1">Grammar · {g.secondDrill.title}</p>
            <ol className="font-serif text-[12px] space-y-0.5">
              {g.secondDrill.items.map((d, i) => (
                <li key={i}><span className="font-mono">{i + 1}.</span> <strong>{d.answer}</strong></li>
              ))}
            </ol>
          </div>
        )}

        {/* Culture comprehension */}
        {packet.culture && (
          <div>
            <p className="font-display font-black text-sm uppercase mb-1">Culture · Check the Evidence</p>
            <ol className="font-serif text-[12px] space-y-0.5">
              {packet.culture.comprehension.map((q, i) => (
                <li key={i}><span className="font-mono">{i + 1}.</span> <strong>{q.answer}</strong></li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <p className="font-serif text-[11px] italic mt-5 border-t-2 border-black pt-2">
        Open response: the Grammar &ldquo;Field Report&rdquo;, Culture &ldquo;Compare Cultures&rdquo;, and the Culture project are produced work.
        Look for correct use of unit vocabulary and the {g.title} structure; accept reasonable spelling and word order at the Novice level.
      </p>
    </section>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Render a sentence, turning "____" into a printable underline blank. */
function renderBlank(sentence: string) {
  const parts = sentence.split(/____+/);
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && <span className="inline-block border-b border-black w-24 align-baseline">&nbsp;</span>}
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
