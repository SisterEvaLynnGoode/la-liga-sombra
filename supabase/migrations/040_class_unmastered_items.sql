-- 040 — the unmastered items for a whole class in one query
--
-- 039 gave us one student's misses, which is what a single parent report needs.
-- Printing a set of report cards for a class needed 57 calls of it, each one
-- re-running the class aggregate: minutes of waiting for one PDF. This returns
-- every student's misses at once, capped per student because a report prints a
-- handful, not a list of 300.
--
-- SECURITY: SECURITY INVOKER (default), and the API checks the teacher owns the
-- class before calling it.

create or replace function class_unmastered_items(p_class_id uuid, p_per_student integer default 40)
returns table (
  student_id uuid,
  unit_id    uuid,
  skill      text,
  item_key   text
)
language sql
stable
as $$
  with roster as (
    select id from students where class_id = p_class_id and archived_at is null
  ),
  agg as (
    select e.student_id, e.unit_id, e.skill, e.item_key, count(*) as attempts
    from item_events e
    join roster r on r.id = e.student_id
    where e.stage_type <> 'academia-reconocimiento'
    group by 1, 2, 3, 4
    having bool_or(e.correct) = false
  ),
  ranked as (
    select agg.*, row_number() over (partition by agg.student_id order by agg.attempts desc) as rn
    from agg
  )
  select ranked.student_id, ranked.unit_id, ranked.skill, ranked.item_key
  from ranked
  where ranked.rn <= p_per_student;
$$;

comment on function class_unmastered_items(uuid, integer) is
  'Every student in a class and the items they have never answered correctly, capped per student — the practice lists for a set of parent reports.';
