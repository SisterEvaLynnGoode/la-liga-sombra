-- 045 — recent growth, and a predicate 044 should have carried
--
-- PART ONE: growth over trailing windows.
--
-- A parent report can say what a child knows. It could not say whether that
-- was going anywhere, which is the thing a parent actually wants. This answers
-- it without storing snapshots: everything is recomputed from the event
-- timestamps, so the first report ever printed already has it.
--
-- The headline number is a COUNT, not a percentage: items whose first correct
-- answer falls inside the window. "Learned 23 new words and sentences in the
-- last two weeks" is unambiguous and cannot be distorted by the material
-- getting harder.
--
-- Accuracy over the same window is returned too, but it is secondary and the
-- report labels it so: a child who spent the fortnight on past tenses will
-- score lower than one who spent it on colours, and that is the material, not
-- the child. The count does not have that problem.
--
-- PART TWO: the three functions in 044 read the raw event stream but never
-- carried the dialogueChoice-typed cutoff that 041 and 043 established, so
-- events from the broken typed turn were still landing in the growth-by-case
-- figure and the pace figure. They carry the same predicate as
-- class_skill_summary now, spelled the same way. class_error_kinds is
-- unaffected in practice — only the sentence builder and the stakeout classify
-- errors — but it carries the predicate too, so there is one rule and not two.

create or replace function class_growth_windows(p_class_id uuid)
returns table (
  student_id      uuid,
  learned_14d     integer,
  learned_30d     integer,
  met_14d         integer,
  met_30d         integer,
  first_try_14d   integer,
  first_try_30d   integer,
  active_days_14d integer,
  active_days_30d integer
)
language sql
stable
as $$
  with roster as (
    select id from students where class_id = p_class_id and archived_at is null
  ),
  usable as (
    select e.student_id, e.unit_id, e.skill, e.item_key, e.correct, e.created_at
    from item_events e
    join roster r on r.id = e.student_id
    where e.stage_type <> 'academia-reconocimiento'
      and not (e.stage_type = 'dialogueChoice-typed'
               and e.created_at < typed_dialogue_counted_from())
  ),
  per_item as (
    select u.student_id,
           u.unit_id,
           u.skill,
           u.item_key,
           min(u.created_at)                               as first_seen,
           min(u.created_at) filter (where u.correct)      as first_correct,
           (array_agg(u.correct order by u.created_at))[1] as first_was_correct
    from usable u
    group by 1, 2, 3, 4
  ),
  days as (
    select u.student_id,
           count(distinct u.created_at::date) filter (where u.created_at >= now() - interval '14 days')::int as d14,
           count(distinct u.created_at::date) filter (where u.created_at >= now() - interval '30 days')::int as d30
    from usable u
    group by 1
  )
  select p.student_id,
         count(*) filter (where p.first_correct >= now() - interval '14 days')::int as learned_14d,
         count(*) filter (where p.first_correct >= now() - interval '30 days')::int as learned_30d,
         count(*) filter (where p.first_seen    >= now() - interval '14 days')::int as met_14d,
         count(*) filter (where p.first_seen    >= now() - interval '30 days')::int as met_30d,
         count(*) filter (where p.first_seen    >= now() - interval '14 days'
                            and p.first_was_correct)::int                           as first_try_14d,
         count(*) filter (where p.first_seen    >= now() - interval '30 days'
                            and p.first_was_correct)::int                           as first_try_30d,
         coalesce(max(d.d14), 0)                                                    as active_days_14d,
         coalesce(max(d.d30), 0)                                                    as active_days_30d
  from per_item p
  left join days d on d.student_id = p.student_id
  group by p.student_id;
$$;

comment on function class_growth_windows(uuid) is
  'Items newly learned, newly met, and days active over trailing 14- and 30-day windows. The recent-growth block on the parent report.';

-- ── Part two: the cutoff 044 missed ──────────────────────────────────────────

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
    and e.latency_ms between 300 and 120000
    and e.stage_type <> 'academia-reconocimiento'
    and not (e.stage_type = 'dialogueChoice-typed'
             and e.created_at < typed_dialogue_counted_from())
  group by e.student_id
  having count(*) >= 10;
$$;

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
      and not (e.stage_type = 'dialogueChoice-typed'
               and e.created_at < typed_dialogue_counted_from())
  ),
  first_event as (
    select distinct on (u.student_id, u.unit_id, u.skill, u.item_key)
           u.student_id, u.unit_id, u.correct
    from usable u
    order by u.student_id, u.unit_id, u.skill, u.item_key, u.created_at
  )
  select f.student_id,
         f.unit_id,
         count(*)::int                          as items,
         count(*) filter (where f.correct)::int as first_try
  from first_event f
  group by f.student_id, f.unit_id;
$$;

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
         count(*)::int                     as events,
         count(distinct e.student_id)::int as students
  from item_events e
  join students s on s.id = e.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
    and e.error_kind is not null
    and e.stage_type <> 'academia-reconocimiento'
    and not (e.stage_type = 'dialogueChoice-typed'
             and e.created_at < typed_dialogue_counted_from())
  group by e.error_kind
  order by count(*) desc;
$$;

-- Per-student mistake mix, for the parent report. Same shape as the class
-- version; the report prints it only when a child has enough classified
-- mistakes for the split to mean anything, and says so plainly when not.
create or replace function class_error_kinds_by_student(p_class_id uuid)
returns table (
  student_id uuid,
  error_kind text,
  events     integer
)
language sql
stable
as $$
  select e.student_id,
         e.error_kind,
         count(*)::int as events
  from item_events e
  join students s on s.id = e.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
    and e.error_kind is not null
    and e.stage_type <> 'academia-reconocimiento'
    and not (e.stage_type = 'dialogueChoice-typed'
             and e.created_at < typed_dialogue_counted_from())
  group by e.student_id, e.error_kind;
$$;

comment on function class_error_kinds_by_student(uuid) is
  'Diagnosed mistake types per student. The mistake-mix strip on the parent report.';
