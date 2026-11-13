import type { createClient } from "@/lib/supabase/server";

type Supabase = ReturnType<typeof createClient>;

/**
 * Open a unit for a student.
 *
 * WHY THIS EXISTS
 *
 * Both unlock paths — finishing a case, and finishing a boss mission — used to
 * do only this:
 *
 *     update unit_progress set status = 'available'
 *      where student_id = ? and unit_id = ? and status = 'locked'
 *
 * which opens the next case only if a row for it is already sitting there
 * locked. Those rows were seeded per class, and the seeding never covered
 * every student: Casos 16-20 had rows for 74 of 385 students and Casos 21-32
 * for 57, so for most students the update matched nothing and returned
 * success. Two students finished Operación Reloj de Arena and the game simply
 * stopped - no error, no next case, nothing to click. The ceiling was this
 * line, not missing content.
 *
 * So the row is now created when it is earned rather than assumed to exist.
 * The two statements are deliberately in this order and neither can move a
 * student backwards:
 *
 *   1. insert, ignoring a conflict - makes the row when it is missing, and
 *      does nothing at all when it already exists, whatever state it is in;
 *   2. update, still gated on 'locked' - promotes a row that was seeded
 *      locked, and leaves in_progress or completed untouched.
 *
 * Doing it the other way round, as a plain upsert, would overwrite a finished
 * case's status with 'available' on any replay. That is the same demotion that
 * once told a parent their child had completed no cases, and it is worth not
 * reintroducing.
 *
 * @returns true when the unit exists and is now open to the student.
 */
export async function unlockUnit(
  supabase: Supabase,
  studentId: string,
  unitNumber: number
): Promise<boolean> {
  if (!Number.isInteger(unitNumber) || unitNumber < 1) return false;

  const { data: unitRows } = await supabase
    .from("units")
    .select("id")
    .eq("number", unitNumber)
    .limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  // Past the last case there is nothing to open, which is not a failure.
  if (!unitId) return false;

  await supabase
    .from("unit_progress")
    .upsert(
      { student_id: studentId, unit_id: unitId, status: "available", stage_index: 0 },
      { onConflict: "student_id,unit_id", ignoreDuplicates: true }
    );

  await supabase
    .from("unit_progress")
    .update({ status: "available" })
    .eq("student_id", studentId)
    .eq("unit_id", unitId)
    .eq("status", "locked");

  return true;
}
