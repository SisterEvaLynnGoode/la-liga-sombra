import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/game/academia-complete
 *
 * Called when a student finishes La Academia training (or skips it as Ready).
 * Records an academia_sessions row for teacher analytics and awards the
 * "distinguished_recruit" badge + 50-point bonus attempt if passedFirstTry.
 *
 * Body: {
 *   unitNumber: number;
 *   routingTier: "ready" | "recommended" | "required";
 *   retryCount: number;
 *   passedFirstTry: boolean;
 * }
 */
export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    unitNumber: number;
    routingTier: "ready" | "recommended" | "required";
    retryCount: number;
    passedFirstTry: boolean;
    advancedWithoutPassing?: boolean;
  };

  const { unitNumber, routingTier, retryCount, passedFirstTry, advancedWithoutPassing } = body;
  if (!unitNumber || !routingTier) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createClient();

  // Resolve unit DB id
  const { data: unitRows } = await supabase
    .from("units").select("id").eq("number", unitNumber).limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!unitId) return NextResponse.json({ error: "Unit not found" }, { status: 404 });

  // Record academia session for teacher analytics
  await supabase.from("academia_sessions").insert({
    student_id: session.studentId,
    unit_id: unitId,
    routing_tier: routingTier,
    retry_count: retryCount ?? 0,
    passed_first_try: passedFirstTry ?? false,
    advanced_without_passing: advancedWithoutPassing ?? false,
  });

  const newBadges: string[] = [];

  if (passedFirstTry) {
    // Award distinguished_recruit badge (deduplicated — only one per unit)
    const { data: existing } = await supabase
      .from("badges")
      .select("id")
      .eq("student_id", session.studentId)
      .eq("badge_type", "distinguished_recruit")
      .eq("unit_id", unitId)
      .limit(1);

    if (!existing?.length) {
      await supabase.from("badges").insert({
        student_id: session.studentId,
        badge_type: "distinguished_recruit",
        unit_id: unitId,
      });
      newBadges.push("distinguished_recruit");
    }

    // Award 50-point bonus attempt (shows in teacher dashboard activity breakdown)
    await supabase.from("attempts").insert({
      student_id: session.studentId,
      unit_id: unitId,
      activity_type: "academia_recognition",
      score: 50,
      max_score: 50,
      time_spent_seconds: 0,
    });
  }

  return NextResponse.json({ ok: true, newBadges });
}
