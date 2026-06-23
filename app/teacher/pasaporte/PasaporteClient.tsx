"use client";

import { useState } from "react";
import Link from "next/link";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export interface CountryEntry {
  number: number;
  country: string;
  code: string;
  caseTitle: string;
  theme: string | null;
  project: string | null;
}

interface Props {
  countries: CountryEntry[];
}

type Section = "booklet" | "tracker";

export default function PasaporteClient({ countries }: Props) {
  const [show, setShow] = useState<Record<Section, boolean>>({ booklet: true, tracker: true });

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
            <h1 className="font-display font-bold text-lg text-[#e8b455] leading-tight">Pasaporte Cultural</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2">
            {([
              ["booklet", "Passport booklet"],
              ["tracker", "Class tracking grid"],
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
        Print one booklet per student at the start of the semester. They earn a stamp per country on culture day. Everything prints in black &amp; white.
      </p>

      {/* ── Printable sheet ────────────────────────────────────────────────── */}
      <div className="ws-root mx-auto my-6 max-w-[820px] bg-white text-black px-10 py-10 print:my-0 print:max-w-none print:px-0 print:py-0">
        {show.booklet && <Booklet countries={countries} />}
        {show.tracker && <TrackingGrid countries={countries} />}
      </div>
    </div>
  );
}

// ── Shared ──────────────────────────────────────────────────────────────────

function Stamp({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border-[3px] border-black px-3 py-1 font-display font-black tracking-[0.15em] uppercase text-black -rotate-3">
      {children}
    </span>
  );
}

function Line({ label, w = "flex-1" }: { label: string; w?: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-mono text-[11px]">{label}</span>
      <span className={`${w} border-b border-black`}>&nbsp;</span>
    </span>
  );
}

// ── The passport booklet ────────────────────────────────────────────────────

function Booklet({ countries }: { countries: CountryEntry[] }) {
  return (
    <>
      {/* Cover */}
      <section className="ws-page flex flex-col items-center justify-center text-center min-h-[600px]">
        <p className="font-mono text-[11px] tracking-[0.4em] uppercase mb-2">La Liga Sombra</p>
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase mb-8">Agencia Internacional de Detectives</p>
        <div className="border-4 border-black px-10 py-6 mb-8">
          <h1 className="font-display font-black text-5xl tracking-[0.1em] uppercase">Pasaporte</h1>
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase mt-1">Cultural · Spanish 1</p>
        </div>
        <div className="border-2 border-black w-full max-w-md p-4 text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3">Este pasaporte pertenece a / belongs to:</p>
          <div className="border-b border-black h-7 mb-4" />
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Line label="Agente / Agent:" />
            </div>
            <div className="w-24 h-28 border-2 border-black flex items-center justify-center">
              <span className="font-mono text-[9px] text-center leading-tight">Foto del<br />agente</span>
            </div>
          </div>
        </div>
        <p className="font-mono text-[10px] mt-8 tracking-[0.2em] uppercase">▮ ▮ ▮ Confidencial ▮ ▮ ▮</p>
      </section>

      {/* Agent ID page */}
      <section className="ws-page">
        <div className="border-b-2 border-black pb-2 mb-5 flex items-end justify-between">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase">Identificación del Agente</p>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase">Agent ID</p>
        </div>

        <div className="flex gap-6">
          <div className="w-32 h-40 border-2 border-black flex items-center justify-center shrink-0">
            <span className="font-mono text-[10px] text-center leading-tight">Autorretrato<br />Self-portrait</span>
          </div>
          <div className="flex-1 space-y-5 font-serif text-[13px]">
            <Line label="Nombre del agente / Agent name:" />
            <Line label="País de origen / Home country:" />
            <div>
              <span className="font-mono text-[11px]">Idiomas / Languages: </span>
              <span className="font-mono text-[11px]">[ ] español &nbsp; [ ] inglés &nbsp; [ ] otro: </span>
              <span className="inline-block w-28 border-b border-black">&nbsp;</span>
            </div>
            <Line label="Especialidad / Specialty:" />
            <Line label="Firma / Signature:" />
          </div>
        </div>

        <div className="border-2 border-black p-3 mt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Misión / Mission</p>
          <p className="font-serif text-[13px] leading-snug">
            Seguir el rastro de los ladrones por diez países del mundo hispano. En cada país, resuelvo el caso,
            aprendo la cultura, y gano un sello. / Track the thieves across ten countries of the Spanish-speaking
            world. In each country, I solve the case, learn the culture, and earn a stamp.
          </p>
        </div>
      </section>

      {/* Progress map */}
      <section className="ws-page">
        <div className="border-b-2 border-black pb-2 mb-5 flex items-end justify-between">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase">Mapa de la Liga · Progreso</p>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase">My Journey</p>
        </div>
        <p className="font-serif text-[12px] mb-4">
          Color in or check a stamp each time you solve a case and complete its culture page. Goal:
          <strong> 10 / 10 sellos</strong>.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {countries.map((c) => {
            const roman = ROMAN[(c.number - 1) % ROMAN.length] ?? String(c.number);
            return (
              <div key={c.number} className="border-2 border-black p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-black flex items-center justify-center shrink-0">
                  <span className="font-mono text-[11px] font-bold">{c.code}</span>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase">Caso {roman}</p>
                  <p className="font-display font-black text-sm uppercase leading-none">{c.country}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 border-t-2 border-black pt-2 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Casos resueltos:</span>
          <span className="inline-block w-12 border-b border-black">&nbsp;</span>
          <span className="font-mono text-[11px]">/ 10</span>
        </div>
      </section>

      {/* One page per country */}
      {countries.map((c) => {
        const roman = ROMAN[(c.number - 1) % ROMAN.length] ?? String(c.number);
        return (
          <section key={c.number} className="ws-page">
            <div className="border-b-2 border-black pb-2 mb-4 flex items-end justify-between">
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase">Sello / Stamp · Caso {roman}</p>
                <p className="font-display font-black text-2xl uppercase leading-none mt-0.5">{c.country}</p>
              </div>
              <div className="w-14 h-14 border-2 border-black flex items-center justify-center">
                <span className="font-mono text-sm font-bold">{c.code}</span>
              </div>
            </div>

            <div className="border-2 border-black p-2 mb-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px]">
              <span>Caso: <strong className="font-serif">{c.caseTitle}</strong></span>
              {c.theme && <span>Cultura: <strong className="font-serif">{c.theme}</strong></span>}
            </div>

            <div className="space-y-5 font-serif text-[13px]">
              <div>
                <span className="font-mono text-[11px]">Criminal capturado / Suspect caught:</span>
                <span className="block border-b border-black h-6 mt-1" />
              </div>
              <div>
                <span className="font-mono text-[11px]">Un dato cultural, en español / One culture fact, in Spanish:</span>
                <span className="block border-b border-black h-6 mt-1" />
                <span className="block border-b border-black h-6 mt-3" />
              </div>
              <div>
                <span className="font-mono text-[11px]">Mi proyecto cultural fue / My culture project was:{c.project ? ` (${c.project})` : ""}</span>
                <span className="block border-b border-black h-6 mt-1" />
              </div>
              <div>
                <span className="font-mono text-[11px]">Palabra nueva favorita / Favorite new word:</span>
                <span className="inline-block w-48 border-b border-black ml-2">&nbsp;</span>
              </div>
            </div>

            {/* Teacher stamp box */}
            <div className="mt-6 flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] max-w-[55%] leading-snug">
                Products · Practices · Perspectives — ¿qué aprendiste sobre la cultura?
              </p>
              <div className="w-40 h-24 border-2 border-dashed border-black flex flex-col items-center justify-center text-center px-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] mb-1">Sello del profesor</span>
                <span className="font-mono text-[8px]">Profesor: __________</span>
                <span className="font-mono text-[8px] mt-1">Fecha: __________</span>
              </div>
            </div>
          </section>
        );
      })}

      {/* Final reflection */}
      <section className="ws-page">
        <div className="border-b-2 border-black pb-2 mb-5 flex items-end justify-between">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase">Reflexión Final · Mi Viaje</p>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase">Final Reflection</p>
        </div>
        <p className="font-serif text-[12px] mb-4">Complete this page at the end of the semester, after you have collected all your stamps.</p>

        {[
          "Mi país favorito fue ____ porque… / My favorite country was ____ because… (in Spanish):",
          "La habilidad que más mejoré fue… / The skill I improved most was… (reading, listening, speaking, writing):",
          "Una cosa nueva que aprendí sobre el mundo hispano / One new thing I learned about the Spanish-speaking world:",
          "Mi meta para el próximo semestre / My goal for next semester:",
        ].map((p, i) => (
          <div key={i} className="mb-4">
            <p className="font-serif text-[13px] font-semibold mb-1">{i + 1}. {p}</p>
            <div className="border-b border-black h-5 mb-3" />
            <div className="border-b border-black h-5" />
          </div>
        ))}

        <div className="border-4 border-black p-4 mt-4 text-center">
          <Stamp>Agente Graduado</Stamp>
          <p className="font-serif text-[12px] mt-3">
            Este agente completó su viaje por el mundo hispano. / This agent completed their journey through the
            Spanish-speaking world.
          </p>
          <div className="flex justify-around mt-4 font-mono text-[10px]">
            <span>Firma del agente: ____________</span>
            <span>Profesor: ____________</span>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Teacher class tracking grid ─────────────────────────────────────────────

function TrackingGrid({ countries }: { countries: CountryEntry[] }) {
  const rows = Array.from({ length: 24 });
  return (
    <section className="ws-page">
      <div className="border-b-2 border-black pb-2 mb-4 flex items-end justify-between">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase">Registro de Sellos · Stamp Tracker</p>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase">Teacher Use</p>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-1 font-mono text-[11px] mb-3">
        <Line label="Clase / Class:" w="w-40" />
        <Line label="Período / Period:" w="w-28" />
      </div>
      <p className="font-serif text-[11px] mb-3">Check a box each time a student earns a country stamp (case solved + culture page complete).</p>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-black p-1 text-left font-mono text-[9px] uppercase w-[28%]">Agente / Student</th>
            {countries.map((c) => (
              <th key={c.number} className="border border-black p-1 font-mono text-[9px]">{c.code}</th>
            ))}
            <th className="border border-black p-1 font-mono text-[9px]">/10</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, ri) => (
            <tr key={ri}>
              <td className="border border-black h-6" />
              {countries.map((c) => (
                <td key={c.number} className="border border-black w-7" />
              ))}
              <td className="border border-black w-9" />
            </tr>
          ))}
        </tbody>
      </table>
      <p className="font-serif text-[10px] italic mt-3">
        Tip: a student earns a stamp when their physical Pasaporte page is complete and you initial its stamp box.
        Hand this grid back at report time as a culture-participation record.
      </p>
    </section>
  );
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
