/**
 * POST /api/teacher/catch-up  { studentId, throughCaso }
 *
 * Credits Casos 1…throughCaso to a student who joined the class late, and
 * unlocks the next one, so they start where the class actually is.
 *
 * A student who transfers in during the second marking period already earned
 * credit for the casos their previous class did. Without this they either
 * replay six casos to reach the one everybody else is on, or they play the
 * current caso while the gradebook counts six as missing.
 *
 * Two rules the implementation keeps:
 *
 *  • A caso the student genuinely played is never touched. Only casos that are
 *    not solved get credited, so re-running this (or running it with too high a
 *    number and then a lower one) can't overwrite real work or real scores.
 *  • Credited casos are stamped with `credited_at`, so months later the
 *    gradebook can still tell "granted when they joined" from "played".
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { guardClass, isResponse } from "@/lib/auth/teacher";

export async function POST(request: NextRequest) {
  const { studentId, throughCaso } = (await request.json().catch(() => ({}))) as {
    studentId?: string;
    throughCaso?: number;
  };

  const through = Number(throughCaso);
  if (!studentId || !Number.isInteger(through) || through < 1 || through > 32) {
    return NextResponse.json({ error: "Need a studentId and a caso between 1 and 32." }, { status: 400 });
  }

  const supabase = createClient();

  const { data: rows } = await supabase
    .from("students")
    .select("id, display_name, class_id")
    .eq("id", studentId)
    .limit(1);
  const student = (rows as Array<{ id: string; display_name: string; class_id: string | null }> | null)?.[0];
  if (!student?.class_id) return NextResponse.json({ error: "Student not found." }, { status: 404 });

  const guard = await guardClass(student.class_id);
  if (isResponse(guard)) return guard;

  // Units 1…through, plus the next one to unlock.
  const { data: unitRows } = await supabase
    .from("units")
    .select("id, number")
    .lte("number", through + 1)
    .order("number");
  const units = (unitRows ?? []) as Array<{ id: string; number: number }>;
  if (!units.length) return NextResponse.json({ error: "No units found." }, { status: 500 });

  const { data: progRows } = await supabase
    .from("unit_progress")
    .select("unit_id, status, case_solved, credited_at")
    .eq("student_id", studentId);
  const existing = new Map(
    ((progRows ?? []) as Array<{ unit_id: string; status: string; case_solved: boolean; credited_at: string | null }>)
      .map((p) => [p.unit_id, p])
  );

  const now = new Date().toISOString();
  const toCredit = units.filter((u) => u.number <= through && !existing.get(u.id)?.case_solved);
  const alreadyPlayed = units.filter((u) => u.number <= through && existing.get(u.id)?.case_solved).length;

  if (toCredit.length) {
    const { error } = await supabase.from("unit_progress").upsert(
      toCredit.map((u) => ({
        student_id: studentId,
        unit_id: u.id,
        status: "completed" as const,
        case_solved: true,
        criminal_caught: true,
        completed_at: now,
        credited_at: now,
      })),
      { onConflict: "student_id,unit_id" }
    );
    if (error) return NextResponse.json({ error: "Could not credit those casos." }, { status: 500 });
  }

  // Unlock the caso the class is actually on.
  const next = units.find((u) => u.number === through + 1);
  let unlocked: number | null = null;
  if (next) {
    const cur = existing.get(next.id);
    if (!cur || cur.status === "locked") {
      const { error } = await supabase.from("unit_progress").upsert(
        { student_id: studentId, unit_id: next.id, status: "available" as const },
        { onConflict: "student_id,unit_id" }
      );
      if (!error) unlocked = next.number;
    } else {
      unlocked = next.number; // already open to them
    }
  }

  return NextResponse.json({
    ok: true,
    displayName: student.display_name,
    credited: toCredit.length,
    alreadyPlayed,
    unlocked,
  });
}
