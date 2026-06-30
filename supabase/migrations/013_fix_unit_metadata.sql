-- 013_fix_unit_metadata.sql
-- Re-align the `units` table with the canonical game content in lib/game/units.ts.
--
-- Migration 002 seeded an OLD unit ordering (e.g. #2 España/"La escuela",
-- #8 Rep. Dominicana/"El cuerpo", #9 Perú) that no longer matches the shipped
-- cases (#2 Puerto Rico, #8 Perú, #9 Rep. Dominicana, …). The UI reads country
-- and titles from lib/game/units.ts, but the teacher dashboard reads them from
-- this table — so admins saw the wrong country/title per unit, and #9 in
-- particular drifted (QA v11 "Caso IX" confusion).
--
-- Unlike migration 002, this does NOT delete any rows — real student data now
-- references units.id via FKs. It upserts metadata by `number` (which is UNIQUE),
-- preserving every unit id and all unit_progress / mastery / attempts rows.

insert into units (number, country, title_es, title_en, description) values
  (1,  'México',               '¿Quién soy yo?',          'Who Am I?',           'Greetings, introductions, and numbers'),
  (2,  'Puerto Rico',          'El robo en la escuela',   'The School Heist',    'Classroom vocabulary, ser + adjectives, -AR verbs'),
  (3,  'España',               'Persecución por Madrid',  'Madrid Chase',        'Places, transportation, and the verb ''ir'' across Madrid landmarks'),
  (4,  'Costa Rica',           'La Familia Sospechosa',   'The Suspect Family',  'Family vocabulary, ser vs estar, emotions, possessives'),
  (5,  'Argentina',            'Hackeo en Buenos Aires',  'The Buenos Aires Hack','Tech, numbers, dates, tener-expressions'),
  (6,  'Colombia',             'El Chef Misterioso',      'The Mystery Chef',    'Colombian cuisine, stem-changing verbs, demonstratives'),
  (7,  'Chile',                'Sabotaje en el Festival', 'Festival Sabotage',   'Music, performing arts, and the verb ''ir'' in context'),
  (8,  'Perú',                 'El Mercado Robado',       'The Stolen Market',   'Markets, shopping, bargaining, and Andean culture'),
  (9,  'República Dominicana', 'El Taíno Robado',         'The Stolen Taíno',    'Body parts, health vocabulary, and the verb doler (me duele/duelen)'),
  (10, 'Ecuador',              'La Expo del Futuro',      'The Future Expo',     'Careers, technology, and the future (ir a + infinitivo, simple future)')
on conflict (number) do update set
  country     = excluded.country,
  title_es    = excluded.title_es,
  title_en    = excluded.title_en,
  description = excluded.description;
