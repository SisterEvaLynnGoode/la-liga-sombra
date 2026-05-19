import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

interface Params { params: { bossId: string } }

/** GET — load existing boss_progress for this student */
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from("boss_progress")
    .select("*")
    .eq("primary_student_id", session.studentId)
    .eq("boss_id", params.bossId)
    .limit(1)
    .single();

  if (error || !data) return NextResponse.json({ progress: null });
  return NextResponse.json({ progress: data });
}

/**
 * POST — upsert boss_progress (auto-save after each stage).
 * Body: partial BossState fields to update.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const supabase = createClient();

  const update = {
    primary_student_id: session.studentId,
    boss_id: params.bossId,
    last_saved_at: new Date().toISOString(),
    ...body,
  };

  const { data, error } = await supabase
    .from("boss_progress")
    .upsert(update, { onConflict: "primary_student_id,boss_id" })
    .select("id, current_stage, last_saved_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, saved: data });
}
