-- 020_add_unit_12.sql
-- Semester 2, Caso 12: Guatemala / Tikal — "La Máscara de Jade".
--
-- Second unit of the time-travel arc. Grammar focus: SER vs. ESTAR.
-- See docs/SEMESTER_2_CURRICULUM_MAP.md for the full Units 11–20 plan.
--
-- Follows the migration 013/019 pattern: a non-destructive idempotent upsert
-- keyed on `number` (UNIQUE), so re-running is safe and no unit ids or
-- FK-referencing rows (unit_progress / mastery / attempts) are ever touched.

insert into units (number, country, title_es, title_en, description) values
  (12, 'Guatemala', 'La Máscara de Jade', 'The Jade Mask',
   'Tikal and the Maya astronomers — SER vs. ESTAR (description & identity vs. location & state)')
on conflict (number) do update set
  country     = excluded.country,
  title_es    = excluded.title_es,
  title_en    = excluded.title_en,
  description = excluded.description;
