-- 036 — teacher roster tools
--
-- Three things the teacher needs to run a class that real students join late
-- and that collects junk accounts along the way:
--
--   • students.archived_at    — a student hidden from the roster, the gradebook
--     and every dashboard, and blocked from logging back in. Reversible: the
--     row and all its work stay, so an archive by mistake is undone by clearing
--     the column. Junk accounts get archived, never silently deleted.
--
--   • unit_progress.credited_at — this caso was granted by the teacher, not
--     played. A student who joins in the second marking period carries credit
--     for the casos their previous class did; they should not replay six of
--     them to catch up. The column records WHEN the credit was given so the
--     gradebook can show a credited caso differently from a solved one, months
--     later, when nobody remembers.
--
-- PINs are deliberately untouched. They stay salted HMACs (lib/auth/pin.ts):
-- the roster's PIN button issues a new one rather than revealing an old one,
-- because a hashed PIN cannot be read back by anyone, including the teacher.
--
-- Non-destructive: both columns are nullable additions, no existing row is
-- touched, and re-running is safe.

alter table students      add column if not exists archived_at timestamptz;
alter table unit_progress add column if not exists credited_at timestamptz;

comment on column students.archived_at is
  'Set when a teacher archives the student: hidden everywhere and login refused. NULL = active. Clearing it restores the student with all work intact.';
comment on column unit_progress.credited_at is
  'Set when a teacher granted this caso to a late-joining student instead of the student playing it. NULL = earned in game.';

-- The dashboards all read "students in this class who are not archived".
create index if not exists students_class_active_idx
  on students (class_id)
  where archived_at is null;
