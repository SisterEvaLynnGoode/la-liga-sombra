import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { vocabTerm, wasCorrect } = await request.json();
  if (!vocabTerm || wasCorrect == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createClient();

  // Read existing row (if any) then increment — upsert doesn't support increments
  const { data: existing } = await supabase
    .from("mastery")
    .select("id, attempts, correct")
    .eq("student_id", session.studentId)
    .eq("vocab_term", vocabTerm)
    .limit(1);

  const row = (existing as Array<{ id: string; attempts: number; correct: number }> | null)?.[0];

  if (row) {
    await supabase
      .from("mastery")
      .update({
        attempts: row.attempts + 1,
        correct: row.correct + (wasCorrect ? 1 : 0),
        last_seen: new Date().toISOString(),
      })
      .eq("id", row.id);
  } else {
    await supabase.from("mastery").insert({
      student_id: session.studentId,
      vocab_term: vocabTerm,
      attempts: 1,
      correct: wasCorrect ? 1 : 0,
      last_seen: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
