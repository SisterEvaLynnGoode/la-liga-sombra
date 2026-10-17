-- 047 — one definition of "finished", and it is not `status`
--
-- The parent report said Jaylen had completed 0 cases. The dashboard said 10.
-- Both were reading the same table.
--
-- unit_progress carries two facts about completion. `case_solved` and
-- `completed_at` are written once, when the student solves the case, and never
-- unwritten. `status` is a workflow field that moves around: until the fix in
-- this release, /api/game/stage-complete set it to 'in_progress' every time a
-- student played a stage — including a stage of a case they had already
-- finished. Replaying is encouraged by this whole system, so the students who
-- replayed the most had the most completions erased. 84 rows school-wide were
-- sitting at 'in_progress' with a completed_at timestamp and case_solved =
-- true; all ten of Jaylen's cases were among them.
--
-- The grades path counted case_solved and was right. The report functions
-- counted status and were wrong. Both now count case_solved, so the two can
-- never disagree again, and the figures no longer depend on a workflow field
-- staying tidy.
--
-- The 84 rows were repaired separately; this changes what the reports read.

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
         -- case_solved is the durable fact; status is only consulted for a case
         -- that is genuinely unfinished.
         case when p.case_solved then 'completed' else p.status::text end as status,
         (p.credited_at is not null) as credited
  from unit_progress p
  join students s on s.id = p.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
    and (p.status <> 'locked' or p.case_solved);
$$;

comment on function class_case_status_by_student(uuid) is
  'Per-student, per-case progress for the story strip. Completion comes from case_solved, never from status.';

create or replace function class_case_coverage(p_class_id uuid)
returns table (
  unit_id     uuid,
  completed   integer,
  in_progress integer,
  credited    integer
)
language sql
stable
as $$
  select p.unit_id,
         count(*) filter (where p.case_solved and p.credited_at is null)::int                        as completed,
         count(*) filter (where not p.case_solved and p.status = 'in_progress')::int                 as in_progress,
         count(*) filter (where p.credited_at is not null)::int                                      as credited
  from unit_progress p
  join students s on s.id = p.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
  group by p.unit_id;
$$;

comment on function class_case_coverage(uuid) is
  'Per-case completed / in progress / skipped-for-catch-up counts. Completion comes from case_solved, never from status.';
