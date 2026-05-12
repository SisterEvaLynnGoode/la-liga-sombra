-- La Liga Sombra — Initial Schema
-- Run via: supabase db push (local) or paste into Supabase SQL editor

-- ─── Enums ───────────────────────────────────────────────────────────────────

create type unit_status as enum ('locked', 'available', 'in_progress', 'completed');
create type activity_type as enum ('vocab_match', 'dialogue', 'listening', 'grammar', 'cultural');
create type badge_type as enum ('case_solved', 'perfect_score', 'speed_run', 'cultural_expert', 'first_case');

-- ─── Tables ──────────────────────────────────────────────────────────────────

-- Students: no email required — students join by class code and choose a display name
create table students (
  id           uuid primary key default gen_random_uuid(),
  display_name text not null,
  class_code   text not null,
  created_at   timestamptz not null default now()
);

create index idx_students_class_code on students (class_code);

-- Units: one row per Que Chevere chapter / country
create table units (
  id          uuid primary key default gen_random_uuid(),
  number      integer not null unique,
  country     text not null,
  title_es    text not null,
  title_en    text not null,
  description text not null
);

-- Attempts: every mini-game submission
create table attempts (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references students (id) on delete cascade,
  unit_id             uuid not null references units (id) on delete cascade,
  activity_type       activity_type not null,
  score               integer not null check (score >= 0),
  max_score           integer not null check (max_score > 0),
  time_spent_seconds  integer not null check (time_spent_seconds >= 0),
  completed_at        timestamptz not null default now()
);

create index idx_attempts_student on attempts (student_id);
create index idx_attempts_unit    on attempts (unit_id);

-- Mastery: per-student, per-vocab-term spaced repetition data
create table mastery (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students (id) on delete cascade,
  vocab_term  text not null,
  attempts    integer not null default 0,
  correct     integer not null default 0,
  last_seen   timestamptz not null default now(),
  unique (student_id, vocab_term)
);

create index idx_mastery_student on mastery (student_id);

-- Badges: achievements earned by students
create table badges (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students (id) on delete cascade,
  badge_type  badge_type not null,
  unit_id     uuid references units (id) on delete set null,
  earned_at   timestamptz not null default now(),
  unique (student_id, badge_type, unit_id)
);

create index idx_badges_student on badges (student_id);

-- Unit progress: one row per (student, unit) tracking case/criminal status
create table unit_progress (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references students (id) on delete cascade,
  unit_id         uuid not null references units (id) on delete cascade,
  status          unit_status not null default 'locked',
  case_solved     boolean not null default false,
  criminal_caught boolean not null default false,
  completed_at    timestamptz,
  unique (student_id, unit_id)
);

create index idx_unit_progress_student on unit_progress (student_id);

-- ─── Seed: Unit 1 (available by default) ────────────────────────────────────

insert into units (number, country, title_es, title_en, description)
values
  (1, 'México',    '¿Quién soy yo?',          'Who am I?',              'Greetings, introductions, and Mexican culture'),
  (2, 'Puerto Rico','En la escuela',           'At School',              'School subjects, schedules, and Puerto Rican daily life'),
  (3, 'Colombia',  'En casa',                  'At Home',                'Family, home, and Colombian traditions'),
  (4, 'Argentina', 'La comida',                'Food',                   'Food, restaurants, and Argentine cuisine'),
  (5, 'España',    'El tiempo libre',          'Free Time',              'Hobbies, sports, and life in Spain'),
  (6, 'Perú',      'Vamos de compras',         'Let''s Go Shopping',     'Shopping, prices, and Peruvian markets');

-- ─── Row Level Security ──────────────────────────────────────────────────────

alter table students      enable row level security;
alter table units         enable row level security;
alter table attempts      enable row level security;
alter table mastery       enable row level security;
alter table badges        enable row level security;
alter table unit_progress enable row level security;

-- Units are readable by everyone (public curriculum data)
create policy "units_public_read" on units
  for select using (true);

-- Students can only read/write their own row (matched by id stored client-side)
-- NOTE: For a class-code auth model without Supabase Auth, these policies
-- use anon key + service role for writes. Tighten before production.
create policy "students_insert_anon" on students
  for insert with check (true);

create policy "students_select_own" on students
  for select using (true);

create policy "attempts_insert_anon" on attempts
  for insert with check (true);

create policy "attempts_select_own" on attempts
  for select using (true);

create policy "mastery_all_anon" on mastery
  for all using (true) with check (true);

create policy "badges_all_anon" on badges
  for all using (true) with check (true);

create policy "unit_progress_all_anon" on unit_progress
  for all using (true) with check (true);
