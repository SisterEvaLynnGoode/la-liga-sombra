-- 022_add_unit_14.sql
-- Semester 2, Caso 14: Nicaragua / León — "El Manuscrito de Darío".
--
-- Fourth unit of the time-travel arc, set in 1907, the year Rubén Darío
-- returned to Nicaragua. Grammar focus: gustar / encantar / interesar with
-- indirect object pronouns (me, te, le, nos, les).
-- See docs/SEMESTER_2_CURRICULUM_MAP.md for the full Units 11–20 plan.
--
-- Follows the migration 013/019/020/021 pattern: a non-destructive idempotent
-- upsert keyed on `number` (UNIQUE), so re-running is safe and no unit ids or
-- FK-referencing rows (unit_progress / mastery / attempts) are ever touched.

insert into units (number, country, title_es, title_en, description) values
  (14, 'Nicaragua', 'El Manuscrito de Darío', 'Darío''s Manuscript',
   'León in 1907 and the return of Rubén Darío — gustar, encantar and indirect object pronouns')
on conflict (number) do update set
  country     = excluded.country,
  title_es    = excluded.title_es,
  title_en    = excluded.title_en,
  description = excluded.description;
