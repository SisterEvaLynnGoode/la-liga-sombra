-- 043 — count the typed dialogue turn again, from the day its target was fixed
--
-- Migration 041 left dialogueChoice-typed out of the skill aggregates because
-- the stage was unfair: it asked a Spanish 1 student to type the detective's
-- own closing line, up to twenty-four words of it, and graded at 75% word
-- overlap. One correct answer in sixty-three attempts school-wide; one item
-- alone went 0 for 51 across 27 students. 041 says to drop it from the
-- exclusion arrays once the target is fixed. It is fixed:
--
--   • DialogueChoice now picks the typed target for being sayable — at most
--     eight words, at most one question — instead of picking whichever
--     question ends the conversation. Dialogues with no sayable line stay
--     multiple choice, and scripts/validate-questions.mjs reports which.
--   • Grading has a middle: a near miss asks again with more of the model
--     revealed, and a second near miss is banked as a pass.
--   • The turn logs ONE event per item, where it resolves. It used to log
--     every press of Comprobar, so a single node left two or three zero rows
--     under the same item_key.
--
-- WHY A CUTOFF RATHER THAN A PLAIN UN-EXCLUSION
--
-- The events already in the table were produced by the broken stage, and five
-- of their six item_keys are lines no student can now be shown — the targets
-- changed with the selection rule, so those items can never be answered
-- correctly and would sit in every affected child's "needs more work" list
-- for good. The rows stay in item_events as the record of what happened, and
-- the aggregates simply start counting this stage from the date of the fix.
--
-- The cutoff lives in one function so there is one line to change. BUMP IT if
-- the deploy slips past this date: anything logged by the old build after the
-- cutoff would be counted as if it were fair.

create or replace function typed_dialogue_counted_from()
returns timestamptz
language sql
immutable
as $$ select timestamptz '2026-10-07 00:00:00+00' $$;

comment on function typed_dialogue_counted_from() is
  'The date dialogueChoice-typed became a fair stage (see migration 043). Events before it were produced by a version whose typed target was the detective''s closing line, and are not counted in the skill aggregates.';

-- One predicate, spelled the same way in all three functions below:
--   a row counts unless it is a dialogueChoice-typed event from before the fix.

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
      and not (e.stage_type = 'dialogueChoice-typed'
               and e.created_at < typed_dialogue_counted_from())
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
    and e.stage_type <> 'academia-reconocimiento'
    and not (e.stage_type = 'dialogueChoice-typed'
             and e.created_at < typed_dialogue_counted_from())
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
    where e.stage_type <> 'academia-reconocimiento'
      and not (e.stage_type = 'dialogueChoice-typed'
               and e.created_at < typed_dialogue_counted_from())
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
