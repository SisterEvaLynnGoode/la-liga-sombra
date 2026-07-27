-- 021_add_unit_13.sql
-- Semester 2, Caso 13: El Salvador / Joya de Cerén — "La Vasija Pintada".
--
-- Third unit of the time-travel arc. Grammar focus: stem-changing verbs
-- (e→ie, o→ue, e→i) and the nosotros exception.
-- See docs/SEMESTER_2_CURRICULUM_MAP.md for the full Units 11–20 plan.
--
-- Follows the migration 013/019/020 pattern: a non-destructive idempotent upsert
-- keyed on `number` (UNIQUE), so re-running is safe and no unit ids or
-- FK-referencing rows (unit_progress / mastery / attempts) are ever touched.

insert into units (number, country, title_es, title_en, description) values
  (13, 'El Salvador', 'La Vasija Pintada', 'The Painted Vessel',
   'Joya de Cerén and Maya village daily life — stem-changing verbs (e→ie, o→ue, e→i)')
on conflict (number) do update set
  country     = excluded.country,
  title_es    = excluded.title_es,
  title_en    = excluded.title_en,
  description = excluded.description;
