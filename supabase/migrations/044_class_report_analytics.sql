-- 044 — the aggregates behind the charts on the admin class report
--
-- All four are class-scoped, SECURITY INVOKER, and take an id the API has
-- already checked the teacher owns. They exist in SQL for the same reason as
-- 039: PostgREST caps a select at 1000 rows and a class generates ~30,000
-- events, so anything aggregated in the route sees a sliver of the data.
--
-- All four apply the same exclusions as the skill summary
-- (academia-reconocimiento, the memory-match drill whose non-matching flip is
-- logged as incorrect). dialogueChoice-typed is NOT excluded here: migration
-- 043 restored it once its target was made sayable.

-- ── 1. What KIND of mistake the class makes ──────────────────────────────────
-- error_kind is set by classifyError when a wrong answer can be diagnosed.
-- Across the school it has been overwhelmingly word_order, which is a specific
-- and teachable finding: the words are known, the syntax is not.
create or replace function class_error_kinds(p_class_id uuid)
returns table (
  error_kind text,
  events     integer,
  students   integer
)
language sql
stable
as $$
  select e.error_kind,
         count(*)::int                        as events,
         count(distinct e.student_id)::int    as students
  from item_events e
  join students s on s.id = e.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
    and e.error_kind is not null
    and e.stage_type <> 'academia-reconocimiento'
  group by e.error_kind
  order by count(*) desc;
$$;

comment on function class_error_kinds(uuid) is
  'Diagnosed mistake types for a class — the error-profile chart on the admin report.';

-- ── 2. How long each student takes to answer ─────────────────────────────────
-- Median, not mean: a student who walks away mid-question leaves a 40-minute
-- latency in the data, and one of those moves a mean by minutes.
create or replace function class_latency_by_student(p_class_id uuid)
returns table (
  student_id   uuid,
  median_ms    integer,
  timed_events integer
)
language sql
stable
as $$
  select e.student_id,
         percentile_cont(0.5) within group (order by e.latency_ms)::int as median_ms,
         count(*)::int                                                  as timed_events
  from item_events e
  join students s on s.id = e.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
    and e.latency_ms is not null
    and e.latency_ms between 300 and 120000   -- drop misfires and walk-aways
    and e.stage_type <> 'academia-reconocimiento'
  group by e.student_id
  having count(*) >= 10;
$$;

comment on function class_latency_by_student(uuid) is
  'Median answer time per student (300ms-2min window) — the pace-vs-accuracy chart.';

-- ── 3. Where the class actually is, case by case ─────────────────────────────
-- credited_at marks a case a late joiner was skipped past (migration 036), and
-- it is counted separately so the report never shows a deliberate catch-up as
-- a student who fell behind.
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
         count(*) filter (where p.status = 'completed' and p.credited_at is null)::int as completed,
         count(*) filter (where p.status = 'in_progress')::int                         as in_progress,
         count(*) filter (where p.credited_at is not null)::int                        as credited
  from unit_progress p
  join students s on s.id = p.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
  group by p.unit_id;
$$;

comment on function class_case_coverage(uuid) is
  'Per-case completed / in progress / skipped-for-catch-up counts — the pacing chart.';

-- ── 4. First-try accuracy per student per case ───────────────────────────────
-- The honest growth chart. Plotted against CASE NUMBER rather than date:
-- accuracy by date falls across a term because the material gets harder, which
-- would tell an administrator the opposite of the truth. Every student meets
-- the same material at Caso 4, so case number compares like with like.
create or replace function class_first_try_by_case(p_class_id uuid)
returns table (
  student_id uuid,
  unit_id    uuid,
  items      integer,
  first_try  integer
)
language sql
stable
as $$
  with usable as (
    select e.student_id, e.unit_id, e.skill, e.item_key, e.correct, e.created_at
    from item_events e
    join students s on s.id = e.student_id
    where s.class_id = p_class_id
      and s.archived_at is null
      and e.unit_id is not null
      and e.stage_type <> 'academia-reconocimiento'
  ),
  first_event as (
    select distinct on (u.student_id, u.unit_id, u.skill, u.item_key)
           u.student_id, u.unit_id, u.correct
    from usable u
    order by u.student_id, u.unit_id, u.skill, u.item_key, u.created_at
  )
  select f.student_id,
         f.unit_id,
         count(*)::int                             as items,
         count(*) filter (where f.correct)::int    as first_try
  from first_event f
  group by f.student_id, f.unit_id;
$$;

comment on function class_first_try_by_case(uuid) is
  'First-try accuracy per student per case — the difficulty-controlled growth chart.';
