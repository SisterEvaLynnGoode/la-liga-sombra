-- 019_add_unit_11.sql
-- Semester 2, Caso 11: Honduras / Copán — "El Misterio de la Estela".
--
-- First unit of the time-travel arc ("La Liga Sombra a través del Tiempo").
-- See docs/SEMESTER_2_CURRICULUM_MAP.md for the full Units 11–20 plan.
--
-- Follows the migration 013 pattern: a non-destructive idempotent upsert keyed
-- on `number` (UNIQUE), so re-running is safe and no unit ids or FK-referencing
-- rows (unit_progress / mastery / attempts) are ever touched.

insert into units (number, country, title_es, title_en, description) values
  (11, 'Honduras', 'El Misterio de la Estela', 'The Mystery of the Stela',
   'Copán and the Maya Classic era — present-tense -AR/-ER/-IR review and the historical present')
on conflict (number) do update set
  country     = excluded.country,
  title_es    = excluded.title_es,
  title_en    = excluded.title_en,
  description = excluded.description;
