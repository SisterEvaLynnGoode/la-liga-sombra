-- La Liga Sombra — Migration 002
-- Adds: classes table, class_id + PIN columns to students, re-seeds 10 units

-- ─── Classes ─────────────────────────────────────────────────────────────────

create table classes (
  id           uuid primary key default gen_random_uuid(),
  class_code   text not null unique,
  teacher_name text not null,
  period_name  text not null,
  created_at   timestamptz not null default now(),
  constraint class_code_format check (class_code ~ '^[A-Z]{3}[0-9]{3}$')
);

alter table classes enable row level security;

create policy "classes_select_anon" on classes for select using (true);
create policy "classes_insert_anon" on classes for insert with check (true);

-- ─── Update students ─────────────────────────────────────────────────────────

alter table students
  add column class_id  uuid references classes(id) on delete set null,
  add column pin_hash  text,
  add column pin_salt  text;

create index idx_students_class_id on students (class_id);

-- ─── Re-seed units with all 10 countries ─────────────────────────────────────
-- NOTE: This wipes all unit-linked data. Safe for development; run before
-- any student data exists.

delete from unit_progress;
delete from badges;
delete from attempts;
delete from mastery;
delete from units;

insert into units (number, country, title_es, title_en, description) values
  (1,  'México',               '¿Quién soy yo?',       'Who Am I?',          'Greetings, introductions, and numbers'),
  (2,  'España',               'La escuela',            'School Life',        'School subjects, schedules, and classroom language'),
  (3,  'Puerto Rico',          'La familia',            'Family',             'Family members, descriptions, and relationships'),
  (4,  'Costa Rica',           'La casa',               'Home',               'Home, rooms, furniture, and chores'),
  (5,  'Argentina',            'La comida',             'Food',               'Food, restaurants, ordering, and flavors'),
  (6,  'Chile',                'El tiempo libre',       'Free Time',          'Hobbies, sports, and weekend activities'),
  (7,  'Colombia',             'La ropa',               'Clothing',           'Clothing, shopping, colors, and prices'),
  (8,  'República Dominicana', 'El cuerpo',             'Body & Health',      'Body parts, health, and at the doctor'),
  (9,  'Perú',                 'El medio ambiente',     'The Environment',    'Nature, weather, and environmental awareness'),
  (10, 'Ecuador',              'El futuro',             'The Future',         'Future plans, technology, and careers');
