"use client";

import { useState } from "react";
import Link from "next/link";
import type { WorksheetPacket } from "@/lib/worksheets/generate";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

interface Props {
  packets: WorksheetPacket[];
}

type Section = "lesson" | "worksheets" | "answers";

export default function WorksheetsClient({ packets }: Props) {
  const [unitNumber, setUnitNumber] = useState(packets[0]?.unitNumber ?? 1);
  const [show, setShow] = useState<Record<Section, boolean>>({
    lesson: true,
    worksheets: true,
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
      {/* Print styles — black and white, page breaks.
          dangerouslySetInnerHTML avoids React escaping characters in the CSS
          (e.g. "&") differently on server vs client, which caused a hydration mismatch. */}
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
          <div className="flex gap-2">
            {([
              ["lesson", "Lesson plan"],
              ["worksheets", "Worksheets"],
              ["answers", "Answer key"],
            ] as Array<[Section, string]>).map(([key, label]) => (
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
        Tip: in the print dialog, choose “Save as PDF” to keep a copy. Everything below prints in black &amp; white.
      </p>

      {/* ── Printable sheet ────────────────────────────────────────────────── */}
      <div className="ws-root mx-auto my-6 max-w-[820px] bg-white text-black px-10 py-10 print:my-0 print:max-w-none print:px-0 print:py-0">

        {show.lesson && <LessonPlan packet={packet} roman={roman} />}
        {show.worksheets && <StudentWorksheets packet={packet} roman={roman} />}
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
        <li><strong>Communication:</strong> Students describe a suspect and report findings in Spanish, staying in the detective role.</li>
      </ul>

      {/* Weekly rhythm */}
      <h3 className="font-display font-black text-base uppercase mt-4 mb-1">Suggested Weekly Rhythm</h3>
      <table className="w-full border-collapse font-serif text-[12px] mb-3">
        <tbody>
          {[
            ["Day 1 — In the field (game)", "Students play this unit in La Liga Sombra: Academia + Briefing + first stages. They meet the vocabulary in context."],
            ["Day 2 — In the field (game)", "Students continue the case to the Identificación stage and solve it. Capture the suspect."],
            ["Day 3 — At HQ (worksheet)", "Vocabulary File + Crack the Code. Reinforce the same words on paper, away from the screen."],
            ["Day 4 — At HQ (worksheet)", "Grammar Analysis + Final Report. Students produce written Spanish using the unit's grammar focus."],
          ].map(([d, desc]) => (
            <tr key={d} className="border border-black align-top">
              <td className="border border-black p-2 font-mono text-[11px] w-[34%]">{d}</td>
              <td className="border border-black p-2">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="font-serif text-[11px] italic mb-3">
        Target rhythm: 1–2 game days to move the case forward, then 1–2 worksheet days on the same vocabulary &amp; grammar.
      </p>

      {/* Lesson flow */}
      <h3 className="font-display font-black text-base uppercase mt-4 mb-1">Worksheet-Day Flow (≈45 min)</h3>
      <ol className="list-decimal ml-5 font-serif text-[13px] leading-snug space-y-0.5">
        <li><strong>Warm-up (5 min):</strong> Post the suspect&apos;s name. Students brainstorm 5 Spanish words they&apos;d use to describe a suspect.</li>
        <li><strong>Vocabulary File (10 min):</strong> Matching + Translate the Evidence.</li>
        <li><strong>Crack the Code (10 min):</strong> Word-bank grammar drill — &ldquo;decode&rdquo; each sentence.</li>
        <li><strong>Grammar Analysis (10 min):</strong> Mini-lesson, then the fill-in evidence drill. Review as a class.</li>
        <li><strong>Final Report / Exit ticket (10 min):</strong> Students write their case report using new vocabulary.</li>
      </ol>

      <div className="border-l-4 border-black pl-3 mt-4 font-serif text-[12px]">
        <strong>Materials:</strong> printed worksheet packet (this document), pencil. No screens required.
        <br /><strong>Differentiation:</strong> struggling agents may use the in-app Academia or the Vocabulary Bank (last page) as a word reference.
      </div>
    </section>
  );
}

// ── Student Worksheets ──────────────────────────────────────────────────────

function StudentWorksheets({ packet, roman }: { packet: WorksheetPacket; roman: string }) {
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

      {/* File 1: Vocabulary — Match + Translate */}
      <section className="ws-page">
        <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="File 1 · Vocabulary" />
        <NameLine />

        <SectionTitle n={1} es="Archivo de Vocabulario" en="Match the Evidence" />
        <p className="font-serif text-[12px] mb-3">Draw a line from each Spanish word to its English meaning. Write the matching letter in the blank.</p>
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
      </section>

      {/* File 2: Crack the Code (word bank) */}
      <section className="ws-page">
        <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="File 2 · Decode" />
        <NameLine />

        <SectionTitle n={3} es="Descifra el Código" en="Crack the Code" />
        <p className="font-serif text-[12px] mb-2">Each sentence is missing a word. Decode it using the Word Bank. Each word is used once.</p>
        <div className="border-2 border-black p-2 mb-4">
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

        <SectionTitle n={4} es="Pistas Revueltas" en="Unscramble the Clues" />
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

      {/* File 3: Grammar */}
      <section className="ws-page">
        <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="File 3 · Grammar" />
        <NameLine />

        <SectionTitle n={5} es="Análisis Gramatical" en="Grammar Analysis" />
        <div className="border-2 border-black p-3 mb-3">
          <p className="font-display font-black text-base uppercase mb-1">{packet.grammar.title}</p>
          <p className="font-serif text-[13px] leading-snug">{packet.grammar.briefing}</p>
        </div>

        {packet.grammar.examples.length > 0 && (
          <div className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Evidence Examples</p>
            <ul className="font-serif text-[13px] space-y-1">
              {packet.grammar.examples.map((ex, i) => (
                <li key={i} className="border-l-4 border-black pl-3">
                  <span className="font-semibold">{ex.es}</span>
                  <span className="block font-mono text-[11px] text-gray-700">{ex.en}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Production task — different from File 2's fill-in (recognition).
            Here the agent PRODUCES Spanish, applying the grammar point. */}
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Field Report — Write Your Own</p>
        <p className="font-serif text-[12px] mb-3">
          Apply <strong>{packet.grammar.title}</strong>. Write three original Spanish sentences about the case.
          Underline the grammar structure you used in each one.
        </p>
        <ol className="font-serif text-[13px] space-y-1">
          {[
            "Describe the suspect or a witness:",
            "Report an action or movement in the case:",
            "Write a question you would ask a suspect:",
          ].map((p, i) => (
            <li key={i}>
              <span className="font-mono text-[11px]">{i + 1}.</span> {p}
              <div className="border-b border-black h-5" />
              <div className="border-b border-black h-5" />
            </li>
          ))}
        </ol>
      </section>

      {/* File 4: Final Report */}
      <section className="ws-page">
        <SheetHeader roman={roman} country={packet.country} caseTitle={packet.caseTitle} label="File 4 · Report" />
        <NameLine />

        <SectionTitle n={6} es="Informe Final" en="Final Report" />
        <p className="font-serif text-[12px] mb-4">Complete your case report. Write in Spanish using the new vocabulary and grammar.</p>
        {packet.writingPrompts.map((p, i) => (
          <div key={i} className="mb-5">
            <p className="font-serif text-[13px] font-semibold mb-1">{i + 1}. {p}</p>
            <div className="space-y-4 mt-2">
              {[0, 1, 2].map((line) => (
                <div key={line} className="border-b border-black h-0" />
              ))}
            </div>
          </div>
        ))}
        <p className="font-mono text-[10px] mt-6 text-center tracking-[0.2em] uppercase">▮ ▮ ▮ Case File Complete ▮ ▮ ▮</p>
      </section>

      {/* Reference: Vocabulary Bank */}
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

// ── Answer Key (teacher) ────────────────────────────────────────────────────

function AnswerKey({ packet, roman }: { packet: WorksheetPacket; roman: string }) {
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
          <p className="font-display font-black text-sm uppercase mb-1">1 · Match the Evidence</p>
          <ol className="font-serif text-[12px] space-y-0.5">
            {packet.match.english.map((e, i) => (
              <li key={i} className="font-mono">{i + 1}. {e.text} → {e.answerLetter}</li>
            ))}
          </ol>
        </div>

        {/* Translate */}
        <div>
          <p className="font-display font-black text-sm uppercase mb-1">2 · Translate the Evidence</p>
          <ol className="font-serif text-[12px] space-y-0.5">
            {packet.translate.map((t, i) => (
              <li key={i}><span className="font-mono">{i + 1}.</span> {t.prompt} = <strong>{t.answer}</strong></li>
            ))}
          </ol>
        </div>

        {/* Crack the Code (word bank = grammar drill sentences) */}
        <div>
          <p className="font-display font-black text-sm uppercase mb-1">3 · Crack the Code</p>
          <ol className="font-serif text-[12px] space-y-0.5">
            {packet.wordBank.items.map((item, i) => (
              <li key={i}><span className="font-mono">{i + 1}.</span> <strong>{item.answer}</strong></li>
            ))}
          </ol>
        </div>

        {/* Unscramble */}
        <div>
          <p className="font-display font-black text-sm uppercase mb-1">4 · Unscramble the Clues</p>
          <ol className="font-serif text-[12px] space-y-0.5">
            {packet.unscramble.map((u, i) => (
              <li key={i}><span className="font-mono">{i + 1}.</span> {u.scrambled} = <strong>{u.answer}</strong></li>
            ))}
          </ol>
        </div>
      </div>

      <p className="font-serif text-[11px] italic mt-5 border-t-2 border-black pt-2">
        5 · Field Report (Grammar) &amp; 6 · Final Report — open response. Look for correct use of unit vocabulary
        and the {packet.grammar.title} structure; accept reasonable spelling and word order at the Novice level.
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
    /* Force pure black and white — no color ink */
    .ws-root, .ws-root * {
      color: #000 !important;
      background: transparent !important;
      border-color: #000 !important;
      box-shadow: none !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
  /* On-screen: render the sheet as a white page for an accurate print preview */
  .ws-page { padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
`;
