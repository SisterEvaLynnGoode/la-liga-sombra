import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ActivityType, BadgeType } from "@/lib/types/database";

/**
 * POST /api/training/activity
 *
 * Records a training session and checks for new badges.
 *
 * Body:
 *  subtype: "vocab" | "grammar" | "drill"
 *  score: number
 *  maxScore: number
 *  timeSeconds: number
 *  grammarConceptId?: string   (for grammar subtype)
 *  termsFromUnits?: number[]   (unit numbers practiced — for Políglota check)
 */
export async function POST(request: NextRequest) {
  const sessionResult = await getStudentSession();
  if (!sessionResult) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = sessionResult;

  const body = await request.json() as {
    subtype: "vocab" | "grammar" | "drill";
    score: number;
    maxScore: number;
    timeSeconds: number;
    termsFromUnits?: number[];
  };

  const activityType: ActivityType =
    body.subtype === "vocab"   ? "training_vocab" :
    body.subtype === "grammar" ? "training_grammar" :
    "training_drill";

  const supabase = createClient();

  // Record the attempt (no unit_id for training — use a placeholder unit or leave null)
  // We need a unit_id for the FK. Use the student's first unlocked unit as a proxy.
  const { data: firstUnit } = await supabase
    .from("unit_progress")
    .select("unit_id")
    .eq("student_id", session.studentId)
    .neq("status", "locked")
    .limit(1)
    .order("unit_id");

  const unitId = (firstUnit as Array<{ unit_id: string }> | null)?.[0]?.unit_id;
  if (!unitId) return NextResponse.json({ error: "No units unlocked" }, { status: 400 });

  await supabase.from("attempts").insert({
    student_id: session.studentId,
    unit_id: unitId,
    activity_type: activityType,
    score: body.score ?? 0,
    max_score: body.maxScore ?? 1,
    time_spent_seconds: body.timeSeconds ?? 0,
  });

  // ── Badge checks ──────────────────────────────────────────────────────────────

  const newBadges: BadgeType[] = [];
  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: existingBadges } = await supabase
    .from("badges")
    .select("badge_type, earned_at")
    .eq("student_id", session.studentId);
  const earned = (existingBadges ?? []) as Array<{ badge_type: string; earned_at: string }>;
  const hasBadge = (type: string) => earned.some((b) => b.badge_type === type);
  const hasBadgeToday = (type: string) => earned.some(
    (b) => b.badge_type === type && b.earned_at.startsWith(todayStr)
  );

  async function awardBadge(type: BadgeType) {
    await supabase.from("badges").insert({
      student_id: session.studentId,
      badge_type: type,
      unit_id: unitId,
    });
    newBadges.push(type);
  }

  // 1. Entrenamiento Diario — 5 consecutive training days
  if (!hasBadge("entrenamiento_diario")) {
    const { data: trainingDays } = await supabase
      .from("attempts")
      .select("completed_at")
      .eq("student_id", session.studentId)
      .in("activity_type", ["training_vocab", "training_grammar", "training_drill"])
      .order("completed_at", { ascending: false })
      .limit(50);

    const datesSet = new Set(
      (trainingDays ?? []).map((r: { completed_at: string }) => r.completed_at.slice(0, 10))
    );
    const dates = Array.from(datesSet).sort().reverse() as string[];

    let streak = 0;
    let check = todayStr;
    for (const d of dates) {
      if (d === check) {
        streak++;
        if (streak >= 5) break;
        const dt = new Date(check);
        dt.setUTCDate(dt.getUTCDate() - 1);
        check = dt.toISOString().slice(0, 10);
      } else if (d < check) break;
    }
    if (streak >= 5) await awardBadge("entrenamiento_diario");
  }

  // 2. Maestro de Vocabulario — 50 terms mastered (≥85% accuracy, ≥5 attempts)
  if (!hasBadge("maestro_vocabulario")) {
    const { data: masteryRows } = await supabase
      .from("mastery")
      .select("attempts, correct")
      .eq("student_id", session.studentId);
    const mastered = (masteryRows ?? []).filter(
      (r: { attempts: number; correct: number }) =>
        r.attempts >= 5 && r.correct / r.attempts >= 0.85
    ).length;
    if (mastered >= 50) await awardBadge("maestro_vocabulario");
  }

  // 3. Políglota — practiced terms from 5+ different units in one session
  if (!hasBadgeToday("poliglota") && body.termsFromUnits) {
    const uniqueUnits = new Set(body.termsFromUnits).size;
    if (uniqueUnits >= 5) await awardBadge("poliglota");
  }

  return NextResponse.json({ ok: true, newBadges });
}
