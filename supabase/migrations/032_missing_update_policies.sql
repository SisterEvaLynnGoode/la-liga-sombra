-- 032 — Restore UPDATE on students and classes.
--
-- RLS was enabled on both tables with only INSERT and SELECT policies, so every
-- UPDATE the app issued was silently filtered to zero rows. Postgres reports no
-- error for that: the route sees success and the change never happens. Verified
-- with `set role anon` — 0 rows updated.
--
-- Silently broken as a result:
--   students · teacher PIN reset for a student who forgot theirs
--            · La Última Estación faction assignment
--            · SIS / Aeries id entry on the Grades tab
--            · the failed-login lockout added in 031
--   classes  · "Completion counted through" on the Grades tab
--
-- These mirror the permissive SELECT/INSERT policies already on both tables and
-- do not widen access beyond what those allow. Tightening the overall posture
-- (service-role key for writes, or per-row policies) is separate follow-up work.

drop policy if exists "students_update_anon" on students;
create policy "students_update_anon" on students
  for update using (true) with check (true);

drop policy if exists "classes_update_anon" on classes;
create policy "classes_update_anon" on classes
  for update using (true) with check (true);
