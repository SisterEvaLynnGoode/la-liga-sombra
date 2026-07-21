-- 017_mastery_grading.sql — Phase 1: ACTFL mastery gradebook.
-- Additive + idempotent; safe to paste into the Supabase SQL editor twice.

-- Snapshot of each student's current overall ACTFL band, so we can detect a
-- LEVEL-UP (band index rising) and notify the teacher. band_index: 0=Novice Low,
-- 1=Novice Mid, 2=Novice High, 3=Intermediate Low.
create table if not exists student_mastery (
  student_id  uuid primary key references students(id) on delete cascade,
  band_index  smallint not null default 0 check (band_index between 0 and 3),
  band        text not null default 'Novice Low',
  score       real not null default 0,
  updated_at  timestamptz not null default now()
);

-- Optional district Student ID for gradebook/SIS (Aeries) export mapping.
alter table students add column if not exists sis_id text;

alter table student_mastery enable row level security;
drop policy if exists "student_mastery_all_anon" on student_mastery;
create policy "student_mastery_all_anon" on student_mastery for all using (true) with check (true);

-- Level-up notifications reuse the existing student_flags table with
-- flag_type = 'mastery_up' and context { from, to, skill }.
