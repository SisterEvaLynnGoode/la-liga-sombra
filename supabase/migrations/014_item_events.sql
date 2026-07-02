-- 014_item_events.sql
-- Workstream A (data collection): item-level event log + grammar concept ledger.
--
-- item_events: one row per answered item (which term, which distractor, how fast).
-- concept_mastery: per-grammar-concept counters, mirroring the vocab `mastery` table.
--
-- Additive + idempotent: safe to paste into the Supabase SQL editor more than once.
-- No existing tables are modified.

create table if not exists item_events (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  unit_id       uuid references units(id) on delete cascade,
  stage_type    text not null,
  item_key      text not null,
  skill         text not null check (skill in ('vocab','grammar','listening','reading','culture','speaking')),
  correct       boolean not null,
  chosen        text,
  expected      text,
  error_kind    text check (error_kind in ('word_order','conjugation','agreement','vocab','spelling')),
  latency_ms    integer check (latency_ms is null or latency_ms >= 0),
  created_at    timestamptz not null default now()
);

create index if not exists idx_item_events_student on item_events(student_id, created_at desc);
create index if not exists idx_item_events_item on item_events(item_key);
create index if not exists idx_item_events_skill on item_events(student_id, skill, created_at desc);

create table if not exists concept_mastery (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  concept_id  text not null,
  attempts    integer not null default 0,
  correct     integer not null default 0,
  last_seen   timestamptz not null default now(),
  unique (student_id, concept_id)
);

create index if not exists idx_concept_mastery_student on concept_mastery(student_id);

-- RLS: match the permissive-anon posture of the existing tables (tightened later
-- alongside the rest of the schema — see project notes).
alter table item_events     enable row level security;
alter table concept_mastery enable row level security;

drop policy if exists "item_events_all_anon" on item_events;
create policy "item_events_all_anon" on item_events for all using (true) with check (true);

drop policy if exists "concept_mastery_all_anon" on concept_mastery;
create policy "concept_mastery_all_anon" on concept_mastery for all using (true) with check (true);
