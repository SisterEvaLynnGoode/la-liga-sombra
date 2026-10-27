-- 049 — the production ladder behind the presentational-readiness page
--
-- A presentation assessment is not one skill. It asks a student to retrieve
-- words without prompting, pronounce them, assemble them into sentences, and
-- sustain more than one sentence in a row. The program exercises each of those
-- separately and records each separately, which means readiness can be
-- evidenced rung by rung rather than asserted.
--
-- avg_words is measured on the TARGET utterance, not the student's answer, so
-- it describes the size of what the activity asks for. That is the honest
-- reading: utterance length here is set by the material, not chosen by the
-- student, and the figure is used to order the rungs rather than to claim that
-- students are writing longer sentences over time. (They are not — checked:
-- the class average has sat near seven words all term, because the sentences
-- are supplied.)

create or replace function class_production_ladder(p_class_id uuid)
returns table (
  stage_type text,
  skill      text,
  events     integer,
  correct    integer,
  students   integer,
  avg_words  numeric,
  first_at   timestamptz,
  last_at    timestamptz
)
language sql
stable
as $$
  select e.stage_type,
         e.skill,
         count(*)::int                                                             as events,
         count(*) filter (where e.correct)::int                                    as correct,
         count(distinct e.student_id)::int                                         as students,
         round(avg(array_length(string_to_array(trim(e.expected), ' '), 1))::numeric, 1) as avg_words,
         min(e.created_at)                                                         as first_at,
         max(e.created_at)                                                         as last_at
  from item_events e
  join students s on s.id = e.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
    and e.expected is not null
    and e.stage_type in (
      'academia-produccion',   -- retrieve and produce a word from memory
      'speakPractice',         -- say it aloud
      'sentenceBuilder',       -- assemble a whole sentence
      'dialogueChoice-typed',  -- sustain an extended turn
      'timedFlashcards'        -- retrieve under time pressure
    )
    and not (e.stage_type = 'dialogueChoice-typed'
             and e.created_at < typed_dialogue_counted_from())
  group by e.stage_type, e.skill;
$$;

comment on function class_production_ladder(uuid) is
  'Per-activity production volume and target utterance length — the presentational-readiness page of the evidence packet.';
