-- 028 — La Última Estación: faction assignment for Casos 16–20
--
-- One nullable column. A student's faction is normally DERIVED from what they
-- did to El Cronista at the end of Operación Reloj de Arena
-- (boss_progress.final_ending), so this column is only the override:
--
--   • students who never played the boss — absent, transferred in, skipped it —
--     pick a side on entry, and the pick lands here
--   • teachers moving students between factions to balance team sizes
--
-- Derived-first on purpose: storing every student's faction would duplicate a
-- fact the boss table already owns, and the two copies would drift the first
-- time anyone replayed the boss.
--
-- Season standings are NOT stored. They are computed from unit_progress and
-- attempts, which already hold everything the scoring needs — a second copy of
-- the score is a second thing that can be wrong.
--
-- Non-destructive: adds one nullable column, touches no existing row.

ALTER TABLE students ADD COLUMN IF NOT EXISTS faction text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_faction_check'
  ) THEN
    ALTER TABLE students
      ADD CONSTRAINT students_faction_check
      CHECK (faction IS NULL OR faction IN ('viajeros', 'cazadores', 'socios'));
  END IF;
END $$;

COMMENT ON COLUMN students.faction IS
  'La Última Estación override. NULL = derive from boss_progress.final_ending, or show the picker.';
