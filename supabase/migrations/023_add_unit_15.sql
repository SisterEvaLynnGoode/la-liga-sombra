-- 023_add_unit_15.sql
-- Semester 2, Caso 15: Cuba / La Habana — "El Disco Maestro".
--
-- Fifth unit of the time-travel arc, set in 1954, when Cuban music was
-- conquering the world. Grammar focus: direct AND indirect object pronouns
-- together (me lo, te la, se los) and the le + lo -> se lo rule.
-- Last case before the midterm boss. See docs/SEMESTER_2_CURRICULUM_MAP.md.
--
-- Follows the migration 013/019-022 pattern: a non-destructive idempotent
-- upsert keyed on `number` (UNIQUE), so re-running is safe and no unit ids or
-- FK-referencing rows (unit_progress / mastery / attempts) are ever touched.

insert into units (number, country, title_es, title_en, description) values
  (15, 'Cuba', 'El Disco Maestro', 'The Master Record',
   'Havana in 1954 and the mambo — direct and indirect object pronouns together (me lo, se la)')
on conflict (number) do update set
  country     = excluded.country,
  title_es    = excluded.title_es,
  title_en    = excluded.title_en,
  description = excluded.description;
