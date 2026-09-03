-- 030_add_units_16_to_20.sql
-- "La Última Estación" — the final five cases of the year.
--
--   16  Uruguay    · Montevideo 1930, the first World Cup   · reflexive verbs
--   17  Panamá     · the Canal opening, 1914                · comparatives & superlatives
--   18  Paraguay   · Itauguá, ñandutí lace and the harp     · affirmative tú commands
--   19  Venezuela  · Angel Falls expedition, 1937           · gentle intro to the preterite
--   20  Bolivia    · Tiwanaku and Lake Titicaca             · the imperfect vs the preterite
--
-- Caso 19 is the season's betrayal case: whichever faction a student joined
-- after Operación Reloj de Arena, their informant feeds them one false lead
-- there (see lib/season/factions.ts, BETRAYAL_UNIT). Caso 20 is the last case
-- before the final boss.
--
-- Follows the 013/019-023 pattern: a non-destructive idempotent upsert keyed on
-- `number` (UNIQUE), so re-running is safe and no unit ids or FK-referencing
-- rows (unit_progress / mastery / attempts) are ever touched.

insert into units (number, country, title_es, title_en, description) values
  (16, 'Uruguay',   'El Balón de la Final',          'The Final''s Ball',
   'Montevideo in 1930 and the first World Cup — reflexive verbs and daily routine'),
  (17, 'Panamá',    'Los Planos del Ingeniero',      'The Engineer''s Blueprints',
   'The Panama Canal opening in 1914 — comparatives, superlatives and demonstratives'),
  (18, 'Paraguay',  'El Patrón de Ñandutí',          'The Ñandutí Pattern',
   'Itauguá, the Paraguayan harp and spiderweb lace — affirmative tú commands'),
  (19, 'Venezuela', 'El Mapa del Explorador',        'The Explorer''s Map',
   'The 1937 Angel Falls expedition — a gentle introduction to the preterite'),
  (20, 'Bolivia',   'La Clave de la Puerta del Sol', 'The Sun Gate Keystone',
   'Tiwanaku and Lake Titicaca — the imperfect (era, había, tenía) against the preterite')
on conflict (number) do update set
  country     = excluded.country,
  title_es    = excluded.title_es,
  title_en    = excluded.title_en,
  description = excluded.description;
