import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { resolveFaction } from "@/lib/season/factions";
import SeasonEntryClient from "./SeasonEntryClient";

export const metadata = { title: "La Última Estación — La Liga Sombra" };

/**
 * Season entry. Reveals the faction a student's boss ending already put them
 * in, or — for anyone with no ending on record — lets them pick a side once.
 */
export default async function SeasonPage() {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const supabase = createClient();

  const { data: rows } = await supabase
    .from("students").select("faction").eq("id", session.studentId).limit(1);
  const override = (rows as Array<{ faction: string | null }> | null)?.[0]?.faction ?? null;

  const { data: bossRows } = await supabase
    .from("boss_progress")
    .select("final_ending")
    .eq("primary_student_id", session.studentId)
    .eq("boss_id", "unit-15-reloj-arena")
    .limit(1);
  const bossEnding = (bossRows as Array<{ final_ending: string | null }> | null)?.[0]?.final_ending ?? null;

  const faction = resolveFaction({ override, bossEnding });

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#0d0b0a] px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_50%_35%,rgba(201,147,58,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 w-full flex justify-center">
        <SeasonEntryClient
          faction={faction}
          fromBoss={Boolean(bossEnding) && !override}
          displayName={session.displayName}
        />
      </div>
    </main>
  );
}
