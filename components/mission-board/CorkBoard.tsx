import Link from "next/link";
import CaseFileCard from "./CaseFileCard";
import ColdCaseCard, { type ColdCaseStatus } from "./ColdCaseCard";
import type { UnitMeta } from "@/lib/game/units";
import type { UnitStatus } from "@/lib/types/database";
import type { ReadinessTier } from "@/lib/mastery";

export interface CaseFile {
  unit: UnitMeta;
  status: UnitStatus;
  caseSolved: boolean;
  readinessLevel?: ReadinessTier; // only set for "available" units
  coldCaseStatus?: ColdCaseStatus; // only set for units with cold case content
  coldCaseUnlocksAt?: string | null; // ISO timestamp for locked cold cases
}

interface Props {
  caseFiles: CaseFile[];
}

export default function CorkBoard({ caseFiles }: Props) {
  return (
    <div
      className="relative flex-1 w-full overflow-auto"
      style={{
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(180,130,50,0.25) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 70%, rgba(90,50,15,0.3) 0%, transparent 55%),
          radial-gradient(ellipse at 50% 50%, rgba(140,90,30,0.1) 0%, transparent 80%),
          repeating-linear-gradient(
            0deg, transparent, transparent 40px,
            rgba(0,0,0,0.03) 40px, rgba(0,0,0,0.03) 41px
          ),
          repeating-linear-gradient(
            90deg, transparent, transparent 40px,
            rgba(0,0,0,0.02) 40px, rgba(0,0,0,0.02) 41px
          ),
          #7a5c28
        `,
      }}
    >
      {/* Board title card */}
      <div className="flex justify-center pt-8 pb-2 px-6">
        <div
          className="inline-flex flex-col items-center px-8 py-3 shadow-lg"
          style={{
            background: "linear-gradient(145deg,#f5e6c8,#e8d0a0)",
            transform: "rotate(-0.5deg)",
            boxShadow: "2px 3px 12px rgba(0,0,0,0.5)",
          }}
        >
          <p className="font-typewriter text-[9px] tracking-[0.4em] uppercase text-[#8b5e10]">
            Operaciones Activas
          </p>
          <p className="font-display font-black text-xl text-[#2c1a08] tracking-wide">
            SALA DE INVESTIGACIÓN
          </p>
          <div className="w-full h-px bg-[#c9933a] mt-1 opacity-40" />
          <p className="font-typewriter text-[9px] tracking-[0.2em] text-[#8b5e10] mt-1">
            La Liga Sombra · 10 países · 10 casos
          </p>
        </div>
      </div>

      {/* Training Room access button */}
      <div className="flex justify-center px-6 pb-2">
        <Link
          href="/training"
          className="inline-flex items-center gap-2.5 px-5 py-2.5 border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] hover:border-[rgba(201,147,58,0.6)] hover:bg-[rgba(201,147,58,0.12)] transition-all group"
        >
          <span className="text-lg">🥊</span>
          <div className="text-left">
            <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#c9933a] group-hover:text-[#e8b455] transition-colors leading-none">
              La Sala de Entrenamiento
            </p>
            <p className="font-typewriter text-[9px] text-[#4a3a2a] mt-0.5">
              Practica vocabulario y gramática
            </p>
          </div>
          <span className="font-typewriter text-[10px] text-[#4a3a2a] group-hover:text-[#c9933a] transition-colors ml-1">→</span>
        </Link>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-5 px-6 pb-4">
        {[
          { color: "bg-[#4a3a2a]", label: "Bloqueado" },
          { color: "bg-[#c0392b]", label: "Activo", pulse: true },
          { color: "bg-[#f59e0b]", label: "En progreso" },
          { color: "bg-[#c9933a]", label: "Resuelto" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${item.color} ${item.pulse ? "animate-pulse" : ""}`} />
            <span className="font-typewriter text-[9px] tracking-[0.15em] uppercase text-[rgba(245,230,200,0.6)]">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Case file grid — cold case cards inserted after their matching original */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 px-8 pb-10 max-w-6xl mx-auto">
        {caseFiles.flatMap(({ unit, status, caseSolved, readinessLevel, coldCaseStatus, coldCaseUnlocksAt }) => {
          const cards = [
            <CaseFileCard
              key={`case-${unit.number}`}
              unit={unit}
              status={status}
              caseSolved={caseSolved}
              readinessLevel={readinessLevel}
            />
          ];
          if (coldCaseStatus) {
            cards.push(
              <ColdCaseCard
                key={`cold-${unit.number}`}
                unit={unit}
                status={coldCaseStatus}
                unlocksAt={coldCaseUnlocksAt}
              />
            );
          }
          return cards;
        })}
      </div>

      {/* Board border trim */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-[rgba(60,35,10,0.4)] rounded-sm" />
      <div className="absolute inset-3 pointer-events-none border border-[rgba(200,150,60,0.1)] rounded-sm" />
    </div>
  );
}
