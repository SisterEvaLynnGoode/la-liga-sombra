-- ── 012: student_flags table ──────────────────────────────────────────────────
-- Unified flags table for all student support signals.
-- Supersedes the attempts-based listening flags from the previous implementation.
-- Run in Supabase dashboard: SQL Editor → paste → Run.

create table if not exists student_flags (
  id               uuid        primary key default gen_random_uuid(),
  student_id       uuid        not null references students(id) on delete cascade,
  flag_type        text        not null,
  unit_id          uuid        references units(id) on delete set null,
  context          jsonb       not null default '{}',
  created_at       timestamptz not null default now(),
  acknowledged_at  timestamptz,
  resolved_at      timestamptz,
  teacher_note     text
);

-- Fast lookups
create index if not exists student_flags_student_id_idx  on student_flags(student_id);
create index if not exists student_flags_flag_type_idx   on student_flags(flag_type);
create index if not exists student_flags_unit_id_idx     on student_flags(unit_id);
create index if not exists student_flags_unacked_idx     on student_flags(created_at desc)
  where acknowledged_at is null;

-- RLS: teachers (service role) can read all; students can insert their own flags
alter table student_flags enable row level security;

create policy "students can insert own flags"
  on student_flags for insert
  with check (student_id = (
    select id from students where id = student_id limit 1
  ));

create policy "service role full access"
  on student_flags for all
  using (true);

-- Valid flag_type values (informational — not enforced at DB level to allow future values):
-- academia_skipped_after_failure
-- help_requested
-- needs_listening_support
-- transcript_revealed
-- listening_skipped
-- repeated_failure
-- image_mismatch_reported
