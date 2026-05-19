import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { BadgeType } from "@/lib/types/database";
import type { BossEnding, BossDifficulty, EthicalChoiceKey } from "@/lib/types/boss";

const BOSS_UNLOCKS_UNIT: Record<string, number> = {
  "unit-5-eclipse": 6,
};

const DIFFICULTY_BADGE: Record<BossDifficulty, BadgeType> = {
  easy:   "agente_cuidadoso",
  normal: "agente_estandar",
  hard:   "agente_elite_boss",
};

const ENDING_BADGE: Record<EthicalChoiceKey, BadgeType> = {
  A: "diplomatico",
  B: "cazador_implacable",
  C: "maestro_negociador_boss",
};

interface Params { params: { bossId: string } }

export async function POST(request: NextRequest, { params }: Params) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    difficulty: BossDifficulty;
    ethicalChoice: EthicalChoiceKey;
    finalEnding: BossEnding;
    baseScore: number;
    partnerName?: string;
    hadPartner: boolean;
  };

  const { difficulty, ethicalChoice, finalEnding, baseScore, hadPartner } = body;
  const nextUnit = BOSS_UNLOCKS_UNIT[params.bossId];
  const supabase = createClient();

  const pointsMultiplier = difficulty === "hard" ? 2.0 : difficulty === "normal" ? 1.5 : 1.0;
  const partnerBonus      = hadPartner ? 100 : 0;
  const finalScore        = Math.round(baseScore * pointsMultiplier) + partnerBonus;

  // Update boss_progress with completion
  await supabase.from("boss_progress").upsert({
    primary_student_id: session.studentId,
    boss_id: params.bossId,
    completed_at: new Date().toISOString(),
    last_saved_at: new Date().toISOString(),
    final_score:   finalScore,
    final_ending:  finalEnding,
  }, { onConflict: "primary_student_id,boss_id" });

  // Unlock next unit
  if (nextUnit) {
    const { data: unitRows } = await supabase.from("units").select("id").eq("number", nextUnit).limit(1);
    const nextUnitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
    if (nextUnitId) {
      await supabase.from("unit_progress")
        .update({ status: "available" })
        .eq("student_id", session.studentId)
        .eq("unit_id", nextUnitId)
        .eq("status", "locked");
    }
  }

  // Award badges
  const newBadges: BadgeType[] = [];
  const { data: firstUnit } = await supabase
    .from("unit_progress").select("unit_id").eq("student_id", session.studentId).neq("status", "locked").limit(1);
  const proxyUnitId = (firstUnit as Array<{ unit_id: string }> | null)?.[0]?.unit_id;

  async function award(type: BadgeType) {
    const { data: ex } = await supabase.from("badges").select("id").eq("student_id", session!.studentId).eq("badge_type", type).limit(1);
    if (!(ex as unknown[])?.length && proxyUnitId) {
      await supabase.from("badges").insert({ student_id: session!.studentId, badge_type: type, unit_id: proxyUnitId });
      newBadges.push(type);
    }
  }

  await award("operacion_eclipse_completada");
  await award(DIFFICULTY_BADGE[difficulty]);
  await award(ENDING_BADGE[ethicalChoice]);

  // Record points as an attempt
  if (proxyUnitId) {
    await supabase.from("attempts").insert({
      student_id: session.studentId,
      unit_id: proxyUnitId,
      activity_type: "lineup",
      score: finalScore,
      max_score: body.baseScore * 2,
      time_spent_seconds: 0,
    });
  }

  return NextResponse.json({ ok: true, finalScore, newBadges });
}
