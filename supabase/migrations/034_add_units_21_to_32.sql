-- 034_add_units_21_to_32.sql
-- Chapter 3, both arcs. Twelve casos of Spanish 2.
--
-- ARC A — "El Expediente Cronista" (21-26). El Cronista is caught in the
-- opening and the arc is the investigation after the arrest: each caso reopens
-- one of the student's own case files, which makes the pretérito/imperfecto
-- distinction the win condition rather than a drill beside it.
--
--   21  México             · Guadalajara, the first case reopened  · pretérito regular
--   22  España             · the Prado, room fourteen              · pretérito irregular
--   23  Perú               · Cusco, how things were before         · imperfecto
--   24  Chile              · Viña del Mar, the night of the final  · pretérito vs imperfecto I
--   25  Cuba               · Havana 1954, the chain of hands       · pretérito vs imperfecto II + double object pronouns
--   26  Guinea Ecuatorial  · Malabo, the country he never reached  · present perfect + commands
--
-- ARC B — "La Colección" (27-32). A new antagonist, La Curadora, removes US
-- Latino objects into a private collection because she has decided they are not
-- real Spanish culture. Her tell is that her Spanish is flawless and has no
-- region at all, while every genuine witness sounds like somewhere specific.
--
--   27  Estados Unidos · Los Ángeles, Chicano       · futuro simple
--   28  Estados Unidos · Nueva York, Nuyorican      · condicional
--   29  Estados Unidos · San Antonio, Tejano        · por y para + comparativos
--   30  Estados Unidos · Miami, Cubano              · subjuntivo de voluntad y emoción
--   31  Estados Unidos · Nuevo México, Hispano      · subjuntivo de duda
--   32  Estados Unidos · Chicago, Mexicano y Boricua · se impersonal y pasivo
--
-- Casos 27-32 are the first in the game set in the United States, which is the
-- second-largest Spanish-speaking country in the world. The arc's argument is
-- that this culture was invented here, not imported, which is why it ends on
-- the impersonal se: aquí se inventó el jibarito.
--
-- Follows the 013/019-023/030 pattern: a non-destructive idempotent upsert
-- keyed on `number` (UNIQUE), so re-running is safe and no unit ids or
-- FK-referencing rows (unit_progress / mastery / attempts) are ever touched.

insert into units (number, country, title_es, title_en, description) values
  (21, 'México',            'El Primer Expediente',        'The First Case File',
   'Guadalajara reopened — the regular preterite, reconstructing the night of the first theft'),
  (22, 'España',            'La Sala Vacía',               'The Empty Gallery',
   'The Prado, room fourteen — the irregular preterite (fue, hizo, tuvo, dijo, vino, puso)'),
  (23, 'Perú',              'Como Era Antes',              'How It Used to Be',
   'Cusco — the imperfect: describing the routine and the world before he arrived'),
  (24, 'Chile',             'Mientras Cantaba',            'While She Was Singing',
   'Viña del Mar — the preterite cutting into the imperfect, background against interruption'),
  (25, 'Cuba',              'Se Lo Pidió Dos Veces',       'He Asked Twice',
   'Havana 1954 — double object pronouns across the chain of hands that lost the master disc'),
  (26, 'Guinea Ecuatorial', 'El País Número Veintiuno',    'The Twenty-First Country',
   'Malabo, the one country he never reached — the present perfect and commands'),
  (27, 'Estados Unidos',    'La Pared que Faltaba',        'The Missing Wall',
   'Boyle Heights, Los Ángeles — the simple future and what will happen to a block'),
  (28, 'Estados Unidos',    'La Cinta del Café',           'The Tape from the Cafe',
   'El Barrio, New York — the conditional, and a poem that exists only as a recording'),
  (29, 'Estados Unidos',    'Por Amor y Para la Familia',  'Out of Love and For the Family',
   'San Antonio — por and para, and the German accordion that became the most Texan music there is'),
  (30, 'Estados Unidos',    'Ojalá que Vuelva',            'I Hope It Comes Back',
   'Calle Ocho, Miami — the subjunctive of wish and emotion, in a culture built on waiting'),
  (31, 'Estados Unidos',    'El Que Todavía Dice Truje',   'The One Who Still Says Truje',
   'New Mexico — the subjunctive of doubt, and a four-hundred-year-old Spanish still spoken'),
  (32, 'Estados Unidos',    'Aquí Se Inventó',             'It Was Invented Here',
   'Chicago — the impersonal and passive se: this was not copied from anywhere, it was made here')
on conflict (number) do update set
  country     = excluded.country,
  title_es    = excluded.title_es,
  title_en    = excluded.title_en,
  description = excluded.description;
