-- 041 — exclude the typed dialogue turn from the skill aggregates
--
-- dialogueChoice-typed asks a Spanish 1 student to type the detective's own
-- closing line from scratch and accepts it at 75% word overlap. The target is
-- fifteen words ("Muchas gracias, señor García. Esta información es muy
-- valiosa. ¿Tiene usted algo más que decirme?"). Across the whole school it has
-- been answered correctly ONCE in 63 attempts; one item alone is 0 for 51
-- across 27 students.
--
-- That is not 27 students failing a grammar skill, it is a stage whose target
-- is set wrong, and it sits in the `grammar` skill where it would pull a child
-- onto the "needs more practice" list of a parent report for something they
-- never had a fair chance at. So it joins academia-reconocimiento (the memory
-- match game, where a card flip that does not pair is logged as incorrect) in
-- being left out of the aggregates.
--
-- The stage itself is unchanged and still scores inside the case; this only
-- governs what the reports count. When its target is fixed, drop it from the
-- array here and the history becomes usable again.

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
    where e.stage_type <> all (array['academia-reconocimiento', 'dialogueChoice-typed'])
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
    and e.stage_type <> all (array['academia-reconocimiento', 'dialogueChoice-typed'])
  group by e.unit_id, e.skill, e.item_key
  having bool_or(e.correct) = false
  order by count(*) desc
  limit p_limit;
$$;

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
    where e.stage_type <> all (array['academia-reconocimiento', 'dialogueChoice-typed'])
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
