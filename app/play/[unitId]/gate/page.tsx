import { redirect } from "next/navigation";
import Link from "next/link";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getVocabReadinessScore } from "@/lib/mastery";
import { UNITS, ROMAN } from "@/lib/game/units";
import { WORLDS } from "@/lib/scroll-world/worlds";
import GateClient from "./GateClient";

// Friendly "coming soon" panel rendered for any unit whose content hasn't shipped yet.
// Replaces the previous silent redirect-to-mission-board, which made missing units
// look like a routing bug (QA v10).
function ComingSoonPanel({ unitNumber }: { unitNumber: number }) {
  const unit = UNITS.find((u) => u.number === unitNumber);
  const roman = ROMAN[(unitNumber - 1) % ROMAN.length] ?? String(unitNumber);
  return (
    <main className="min-h-screen bg-[#0d0b0a] flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">🚧</div>
        <div>
          <p className="font-typewriter text-[10px] tracking-[0.4em] uppercase text-[#8b7355] mb-2">
            Caso {roman}{unit?.country ? ` · ${unit.country}` : ""}
          </p>
          <h1 className="font-display font-black text-3xl text-[#e8b455]">
            Próximamente
          </h1>
          {unit?.titleEs && (
            <p className="font-typewriter text-sm text-[#c4a882] mt-2 italic">
              &ldquo;{unit.titleEs}&rdquo;
            </p>
          )}
        </div>
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] px-5 py-4">
          <p className="font-typewriter text-xs text-[#c4a882] leading-relaxed">
            Este caso aún no está disponible. Tu progreso está seguro — vuelve pronto.
          </p>
        </div>
        <Link
          href="/mission-board"
          className="inline-block clip-skew px-8 py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
        >
          ← Volver al mapa
        </Link>
      </div>
    </main>
  );
}

// Unit content registry — mirrors the one in /play/[unitId]/page.tsx
function getUnitContent(unitNumber: number) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 1) return require("@/content/unit-01.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 2) return require("@/content/unit-02.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 3) return require("@/content/unit-03.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 4) return require("@/content/unit-04.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 5) return require("@/content/unit-05.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 6) return require("@/content/unit-06.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 7) return require("@/content/unit-07.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 8) return require("@/content/unit-08.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 9) return require("@/content/unit-09.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (unitNumber === 10) return require("@/content/unit-10.json");
  return null;
}

interface PageProps {
  params: { unitId: string };
}

export default async function GatePage({ params }: PageProps) {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const unitNumber = parseInt(params.unitId, 10);
  if (isNaN(unitNumber) || unitNumber < 1) redirect("/mission-board");

  const content = getUnitContent(unitNumber);
  if (!content) return <ComingSoonPanel unitNumber={unitNumber} />;

  const supabase = createClient();

  // Verify unit is accessible to this student
  const { data: unitRows } = await supabase
    .from("units").select("id").eq("number", unitNumber).limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!unitId) redirect("/mission-board");

  const { data: progressRows } = await supabase
    .from("unit_progress")
    .select("status")
    .eq("student_id", session.studentId)
    .eq("unit_id", unitId)
    .limit(1);

  const status = (progressRows as Array<{ status: string }> | null)?.[0]?.status;
  if (!status || status === "locked") redirect("/mission-board");

  // If already completed, skip gate and go straight to play (replay mode)
  if (status === "completed") redirect(`/play/${unitNumber}`);

  // Compute readiness score from mastery data
  const vocabTerms = (content.vocab as Array<{ spanish: string }>).map((v) => v.spanish);
  const readiness = await getVocabReadinessScore(session.studentId, vocabTerms);

  // Find country name for display
  const unit = UNITS.find((u) => u.number === unitNumber);

  return (
    <GateClient
      unitNumber={unitNumber}
      country={unit?.country ?? content.country}
      tier={readiness.tier}
      scorePercent={Math.round(readiness.score * 100)}
      hasWorld={unitNumber in WORLDS}
    />
  );
}
