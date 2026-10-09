-- 046 — each student's own position in the story
--
-- The parent report opens with a strip of 32 squares, one per case, so a
-- parent can see where their child is in the year at a glance. That needs
-- per-student case status, which the class-level coverage function (044)
-- aggregates away.
--
-- It is an RPC and not a plain select for the usual reason, and this one was
-- very nearly missed: unit_progress holds 1,023 rows for a single class of 58.
-- PostgREST caps a select at 1,000, so reading it from the route would have
-- silently dropped the last three students' progress and printed them an empty
-- strip. Only 'locked' rows are filtered out, since a locked case is simply
-- one the student has not reached.

create or replace function class_case_status_by_student(p_class_id uuid)
returns table (
  student_id uuid,
  unit_id    uuid,
  status     text,
  credited   boolean
)
language sql
stable
as $$
  select p.student_id,
         p.unit_id,
         p.status::text,
         (p.credited_at is not null) as credited
  from unit_progress p
  join students s on s.id = p.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
    and p.status <> 'locked';
$$;

comment on function class_case_status_by_student(uuid) is
  'Per-student, per-case progress status for the story strip on the parent report. Locked cases omitted.';
