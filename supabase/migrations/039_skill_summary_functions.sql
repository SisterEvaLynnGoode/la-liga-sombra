-- 039 — per-item skill aggregates for the reports
--
-- The reports count ITEMS, not rows. A student who presses Comprobar four times
-- before building a sentence correctly has learned one sentence, not failed
-- three times, and the memory-match game logs a card flip that does not pair as
-- "incorrect" 104,000 times across the school. Counting rows would put a 12% in
-- front of a parent. These functions fold the event stream down to one row per
-- item first:
--
--   mastered  — got it right at least once (the number a parent reads)
--   first_try — got it right the first time they met it (the teacher's number)
--
-- They also exist because the app cannot page through the raw events: PostgREST
-- caps a select at 1000 rows, so reading 30,000 events per class returned a
-- sliver and most students came back with no profile at all. The aggregate for
-- a whole class is ~255 rows.
--
-- SECURITY: both are SECURITY INVOKER (the default) and take ids the API has
-- already checked the teacher owns.

create or replace function class_skill_summary(p_class_id uuid)
returns table (
  student_id uuid,
  unit_id    uuid,
  skill      text,
  items      integer,
  mastered   integer,
  first_try  integer
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
  ),
  per_item as (
    select u.student_id, u.unit_id, u.skill, u.item_key,
           bool_or(u.correct) as mastered
    from usable u
    group by 1, 2, 3, 4
  ),
  first_event as (
    select distinct on (u.student_id, u.unit_id, u.skill, u.item_key)
           u.student_id, u.unit_id, u.skill, u.item_key, u.correct as first_correct
    from usable u
    order by u.student_id, u.unit_id, u.skill, u.item_key, u.created_at
  )
  select p.student_id,
         p.unit_id,
         p.skill,
         count(*)::int                                            as items,
         count(*) filter (where p.mastered)::int                  as mastered,
         count(*) filter (where f.first_correct)::int             as first_try
  from per_item p
  left join first_event f
    on  f.student_id = p.student_id
    and f.unit_id is not distinct from p.unit_id
    and f.skill = p.skill
    and f.item_key = p.item_key
  group by p.student_id, p.unit_id, p.skill;
$$;

comment on function class_skill_summary(uuid) is
  'Per-student, per-caso, per-skill item counts for the Notas reports. Counts items, never raw events.';

-- The items a student has never got right: what the parent report turns into
-- practice. Capped, because a report prints a handful, not a list of 300.
create or replace function student_unmastered_items(p_student_id uuid, p_limit integer default 200)
returns table (
  unit_id  uuid,
  skill    text,
  item_key text
)
language sql
stable
as $$
  select e.unit_id, e.skill, e.item_key
  from item_events e
  where e.student_id = p_student_id
    and e.stage_type <> 'academia-reconocimiento'
  group by e.unit_id, e.skill, e.item_key
  having bool_or(e.correct) = false
  order by count(*) desc
  limit p_limit;
$$;

comment on function student_unmastered_items(uuid, integer) is
  'Items this student has never answered correctly, most-attempted first — the practice list on the parent report.';
