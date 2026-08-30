-- 029 — Stop new work from retroactively lowering finished grades.
--
-- THE BUG THIS FIXES
--
-- The course grade is 70% quality + 30% completion, where completion was
--   solvedCases / max(solvedCases across the whole class)
-- i.e. the denominator was "the furthest ANY student has got". So the moment
-- the fastest student in the room finished a new case, every other student's
-- denominator grew and every other student's grade dropped — for work that had
-- not been taught yet, let alone assigned. A student who did everything asked
-- of them watched their grade fall on a Monday because somebody else worked
-- ahead on Sunday.
--
-- THE FIX
--
-- The teacher decides when work counts as due, the same way it works in any
-- gradebook. `graded_through` is the highest case number that is currently
-- being counted for completion.
--
--   NULL  → completion is not counted at all; the course grade is pure quality
--           of the work actually done. This is the right default for a class
--           that has not started the game yet (Chromebooks pending), and it can
--           never punish a student for work nobody assigned.
--   N     → completion counts against cases 1..N. Advancing it is a deliberate
--           act by the teacher, so grades only move when they say so.
--
-- Nullable with no default, so existing classes get NULL and stop dropping.

ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS graded_through integer;

ALTER TABLE classes
  DROP CONSTRAINT IF EXISTS classes_graded_through_range;

ALTER TABLE classes
  ADD CONSTRAINT classes_graded_through_range
  CHECK (graded_through IS NULL OR (graded_through >= 0 AND graded_through <= 40));

COMMENT ON COLUMN classes.graded_through IS
  'Highest case number counted for the completion half of the course grade. NULL = do not count completion yet.';
