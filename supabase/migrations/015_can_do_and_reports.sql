-- 015_can_do_and_reports.sql
-- Workstream B: can-do self-assessments (B4) + detective field reports (B3).
-- Additive + idempotent; safe to paste into the Supabase SQL editor twice.

create table if not exists can_do_ratings (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references students(id) on delete cascade,
  unit_id         uuid not null references units(id) on delete cascade,
  statement_index integer not null check (statement_index >= 0),
  statement       text not null,
  rating          integer not null check (rating between 1 and 3),
  created_at      timestamptz not null default now(),
  unique (student_id, unit_id, statement_index)
);

create index if not exists idx_can_do_student on can_do_ratings(student_id);

create table if not exists field_reports (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  unit_id     uuid not null references units(id) on delete cascade,
  report_text text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_field_reports_student on field_reports(student_id);
create index if not exists idx_field_reports_unit on field_reports(unit_id);

alter table can_do_ratings enable row level security;
alter table field_reports  enable row level security;

drop policy if exists "can_do_ratings_all_anon" on can_do_ratings;
create policy "can_do_ratings_all_anon" on can_do_ratings for all using (true) with check (true);

drop policy if exists "field_reports_all_anon" on field_reports;
create policy "field_reports_all_anon" on field_reports for all using (true) with check (true);
