-- La Liga Sombra — Safe migration (skips existing types)
-- The unit_status / activity_type / badge_type enums already exist — skip them.

-- ─── Add any missing enum values ─────────────────────────────────────────────
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'lineup';
ALTER TYPE badge_type    ADD VALUE IF NOT EXISTS 'unit_completed';
ALTER TYPE badge_type    ADD VALUE IF NOT EXISTS 'speed_demon';
ALTER TYPE badge_type    ADD VALUE IF NOT EXISTS 'vocab_master';
ALTER TYPE badge_type    ADD VALUE IF NOT EXISTS 'streak_3';
ALTER TYPE badge_type    ADD VALUE IF NOT EXISTS 'streak_7';

-- ─── Tables ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id           uuid primary key default gen_random_uuid(),
  display_name text not null,
  class_code   text not null,
  created_at   timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS units (
  id          uuid primary key default gen_random_uuid(),
  number      integer not null unique,
  country     text not null,
  title_es    text not null,
  title_en    text not null,
  description text not null
);

CREATE TABLE IF NOT EXISTS attempts (
  id                 uuid primary key default gen_random_uuid(),
  student_id         uuid not null references students(id) on delete cascade,
  unit_id            uuid not null references units(id) on delete cascade,
  activity_type      activity_type not null,
  score              integer not null check (score >= 0),
  max_score          integer not null check (max_score > 0),
  time_spent_seconds integer not null check (time_spent_seconds >= 0),
  completed_at       timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS mastery (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  vocab_term text not null,
  attempts   integer not null default 0,
  correct    integer not null default 0,
  last_seen  timestamptz not null default now(),
  unique (student_id, vocab_term)
);

CREATE TABLE IF NOT EXISTS badges (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  badge_type badge_type not null,
  unit_id    uuid references units(id) on delete set null,
  earned_at  timestamptz not null default now(),
  unique (student_id, badge_type, unit_id)
);

CREATE TABLE IF NOT EXISTS unit_progress (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references students(id) on delete cascade,
  unit_id         uuid not null references units(id) on delete cascade,
  status          unit_status not null default 'locked',
  case_solved     boolean not null default false,
  criminal_caught boolean not null default false,
  completed_at    timestamptz,
  unique (student_id, unit_id)
);

CREATE TABLE IF NOT EXISTS classes (
  id           uuid primary key default gen_random_uuid(),
  class_code   text not null unique,
  teacher_name text not null,
  period_name  text not null,
  created_at   timestamptz not null default now(),
  constraint class_code_format check (class_code ~ '^[A-Z]{3}[0-9]{3}$')
);

CREATE TABLE IF NOT EXISTS class_alerts (
  id       uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  message  text not null,
  sent_at  timestamptz not null default now()
);

-- ─── Add missing columns ─────────────────────────────────────────────────────
ALTER TABLE students      ADD COLUMN IF NOT EXISTS class_id    uuid references classes(id) on delete set null;
ALTER TABLE students      ADD COLUMN IF NOT EXISTS pin_hash    text;
ALTER TABLE students      ADD COLUMN IF NOT EXISTS pin_salt    text;
ALTER TABLE unit_progress ADD COLUMN IF NOT EXISTS stage_index integer not null default 0;

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_class_code   ON students(class_code);
CREATE INDEX IF NOT EXISTS idx_students_class_id     ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student      ON attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_unit         ON attempts(unit_id);
CREATE INDEX IF NOT EXISTS idx_mastery_student       ON mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_badges_student        ON badges(student_id);
CREATE INDEX IF NOT EXISTS idx_unit_progress_student ON unit_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_class_alerts_class_id ON class_alerts(class_id);

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE units         ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery       ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_alerts  ENABLE ROW LEVEL SECURITY;

-- Drop policies before recreating (avoids "already exists" errors)
DROP POLICY IF EXISTS "units_public_read"        ON units;
DROP POLICY IF EXISTS "students_insert_anon"     ON students;
DROP POLICY IF EXISTS "students_select_own"      ON students;
DROP POLICY IF EXISTS "attempts_insert_anon"     ON attempts;
DROP POLICY IF EXISTS "attempts_select_own"      ON attempts;
DROP POLICY IF EXISTS "mastery_all_anon"         ON mastery;
DROP POLICY IF EXISTS "badges_all_anon"          ON badges;
DROP POLICY IF EXISTS "unit_progress_all_anon"   ON unit_progress;
DROP POLICY IF EXISTS "classes_select_anon"      ON classes;
DROP POLICY IF EXISTS "classes_insert_anon"      ON classes;
DROP POLICY IF EXISTS "class_alerts_read"        ON class_alerts;
DROP POLICY IF EXISTS "class_alerts_insert"      ON class_alerts;

CREATE POLICY "units_public_read"        ON units         FOR SELECT USING (true);
CREATE POLICY "students_insert_anon"     ON students      FOR INSERT WITH CHECK (true);
CREATE POLICY "students_select_own"      ON students      FOR SELECT USING (true);
CREATE POLICY "attempts_insert_anon"     ON attempts      FOR INSERT WITH CHECK (true);
CREATE POLICY "attempts_select_own"      ON attempts      FOR SELECT USING (true);
CREATE POLICY "mastery_all_anon"         ON mastery       FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "badges_all_anon"          ON badges        FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "unit_progress_all_anon"   ON unit_progress FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "classes_select_anon"      ON classes       FOR SELECT USING (true);
CREATE POLICY "classes_insert_anon"      ON classes       FOR INSERT WITH CHECK (true);
CREATE POLICY "class_alerts_read"        ON class_alerts  FOR SELECT USING (true);
CREATE POLICY "class_alerts_insert"      ON class_alerts  FOR INSERT WITH CHECK (true);

-- ─── Realtime ────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE class_alerts;

-- ─── Seed 10 units (upsert — safe to run multiple times) ─────────────────────
INSERT INTO units (number, country, title_es, title_en, description) VALUES
  (1,  'México',               '¿Quién soy yo?',    'Who Am I?',       'Greetings, introductions, and numbers'),
  (2,  'España',               'La escuela',         'School Life',     'School subjects, schedules, and classroom language'),
  (3,  'Puerto Rico',          'La familia',         'Family',          'Family members, descriptions, and relationships'),
  (4,  'Costa Rica',           'La casa',            'Home',            'Home, rooms, furniture, and chores'),
  (5,  'Argentina',            'La comida',          'Food',            'Food, restaurants, ordering, and flavors'),
  (6,  'Chile',                'El tiempo libre',    'Free Time',       'Hobbies, sports, and weekend activities'),
  (7,  'Colombia',             'La ropa',            'Clothing',        'Clothing, shopping, colors, and prices'),
  (8,  'República Dominicana', 'El cuerpo',          'Body & Health',   'Body parts, health, and at the doctor'),
  (9,  'Perú',                 'El medio ambiente',  'The Environment', 'Nature, weather, and environmental awareness'),
  (10, 'Ecuador',              'El futuro',          'The Future',      'Future plans, technology, and careers')
ON CONFLICT (number) DO UPDATE SET
  country     = EXCLUDED.country,
  title_es    = EXCLUDED.title_es,
  title_en    = EXCLUDED.title_en,
  description = EXCLUDED.description;
