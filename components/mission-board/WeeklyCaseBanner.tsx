import Link from "next/link";
import type { UnitMeta } from "@/lib/game/units";
import { ROMAN } from "@/lib/game/units";

/**
 * "Caso de la Semana" banner (Workstream C5) — pins the student's current
 * active case at the top of the mission board as a weekly ritual, matching
 * the teacher's pacing plan and the @laligasombra Instagram series.
 */
export default function WeeklyCaseBanner({
  unit,
  inProgress,
}: {
  unit: UnitMeta;
  inProgress: boolean;
}) {
  const roman = ROMAN[(unit.number - 1) % ROMAN.length] ?? String(unit.number);
  return (
    <div className="flex justify-center px-6 pt-4">
      <Link
        href={`/play/${unit.number}/gate`}
        className="group flex items-center gap-4 max-w-2xl w-full border border-[rgba(192,57,43,0.45)] bg-[rgba(20,14,12,0.92)] px-5 py-3 shadow-[0_0_24px_rgba(192,57,43,0.15)] hover:border-[#c0392b] hover:shadow-[0_0_28px_rgba(192,57,43,0.3)] transition-all"
      >
        <span className="text-2xl shrink-0">📌</span>
        <div className="flex-1 min-w-0">
          <p className="font-typewriter text-[9px] tracking-[0.35em] uppercase text-[#c0392b]">
            Caso de la Semana
          </p>
          <p className="font-display font-bold text-base text-[#f5e6c8] leading-tight truncate">
            Caso {roman} · {unit.flag} {unit.country} — “{unit.titleEs}”
          </p>
          <p className="font-typewriter text-[10px] text-[#8b7355] truncate">
            {unit.criminal} robó {unit.stolenItem}. La Liga Sombra te espera.
          </p>
        </div>
        <span className="shrink-0 font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-[#c0392b] bg-[#8b1a1a] text-[#f5e6c8] group-hover:bg-[#c0392b] transition-colors">
          {inProgress ? "Continuar →" : "Abrir caso →"}
        </span>
      </Link>
    </div>
  );
}
