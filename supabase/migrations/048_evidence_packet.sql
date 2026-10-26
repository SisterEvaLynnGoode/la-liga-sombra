-- 048 — the aggregates behind the Evidence of Learning packet
--
-- Five class-scoped, SECURITY INVOKER functions. They exist in SQL for the
-- reason every aggregate in this project does: PostgREST caps a select at
-- 1,000 rows and a class generates tens of thousands of events, so anything
-- aggregated in the route reads a sliver.
--
-- All of them apply the project's standard exclusions: the memory-match drill,
-- whose non-matching card flips are logged as incorrect by design, and
-- dialogueChoice-typed events from before its target was made sayable (043).

-- ── 1. Does the class's mistake profile change over time? ────────────────────
-- The point of the figure this feeds: if word-order errors fall in the months
-- after word order is taught, that is an instructional response with a
-- measured effect, which is the most persuasive thing a teacher can show.
create or replace function class_error_trend(p_class_id uuid)
returns table (
  month      date,
  error_kind text,
  events     integer,
  students   integer
)
language sql
stable
as $$
  select date_trunc('month', e.created_at)::date as month,
         e.error_kind,
         count(*)::int                           as events,
         count(distinct e.student_id)::int       as students
  from item_events e
  join students s on s.id = e.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
    and e.error_kind is not null
    and e.stage_type <> 'academia-reconocimiento'
    and not (e.stage_type = 'dialogueChoice-typed'
             and e.created_at < typed_dialogue_counted_from())
  group by 1, 2
  order by 1, 3 desc;
$$;

comment on function class_error_trend(uuid) is
  'Diagnosed mistake types by month — the error-trend figure on the evidence packet.';

-- ── 2. Retrieval practice ───────────────────────────────────────────────────
-- daily_briefings is a spaced retrieval drill: a handful of previously-seen
-- terms, re-asked on a later day. Naming the practice matters as much as the
-- numbers, so the report prints both.
create or replace function class_briefings(p_class_id uuid)
returns table (
  student_id      uuid,
  briefings       integer,
  completed       integer,
  skipped         integer,
  terms_shown     integer,
  terms_correct   integer,
  distinct_days   integer,
  first_day       date,
  last_day        date
)
language sql
stable
as $$
  select b.student_id,
         count(*)::int                                            as briefings,
         count(*) filter (where b.completed)::int                 as completed,
         count(*) filter (where b.skipped)::int                   as skipped,
         coalesce(sum(coalesce(array_length(b.terms_shown, 1), 0)), 0)::int as terms_shown,
         coalesce(sum(b.terms_correct), 0)::int                   as terms_correct,
         count(distinct b.briefing_date)::int                     as distinct_days,
         min(b.briefing_date)                                     as first_day,
         max(b.briefing_date)                                     as last_day
  from daily_briefings b
  join students s on s.id = b.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
  group by b.student_id;
$$;

comment on function class_briefings(uuid) is
  'Per-student spaced-retrieval participation — the retrieval-practice page on the evidence packet.';

-- ── 3. Standards: what students say they can do ─────────────────────────────
-- can_do_ratings are ACTFL-style self-assessments. Printed beside measured
-- mastery on the same case they become a calibration figure: where a student
-- rates themselves well above or below what the record shows.
create or replace function class_can_do(p_class_id uuid)
returns table (
  student_id      uuid,
  unit_id         uuid,
  statement_index integer,
  statement       text,
  rating          integer,
  created_at      timestamptz
)
language sql
stable
as $$
  select r.student_id, r.unit_id, r.statement_index, r.statement, r.rating, r.created_at
  from can_do_ratings r
  join students s on s.id = r.student_id
  where s.class_id = p_class_id
    and s.archived_at is null;
$$;

comment on function class_can_do(uuid) is
  'ACTFL Can-Do self-ratings for a class — the standards and calibration page.';

-- ── 4. What the system watches for ──────────────────────────────────────────
-- Deliberately reported as DETECTION, not as a resolved-case log. Across the
-- school 3,804 flags have been raised and one has been resolved in-app:
-- teachers act in the classroom, not in the alert queue, and a report that
-- implied otherwise would be inviting an administrator to count unresolved
-- tickets.
create or replace function class_signals(p_class_id uuid)
returns table (
  flag_type  text,
  month      date,
  n          integer,
  students   integer,
  resolved   integer
)
language sql
stable
as $$
  select f.flag_type,
         date_trunc('month', f.created_at)::date          as month,
         count(*)::int                                    as n,
         count(distinct f.student_id)::int                as students,
         count(*) filter (where f.resolved_at is not null)::int as resolved
  from student_flags f
  join students s on s.id = f.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
  group by 1, 2;
$$;

comment on function class_signals(uuid) is
  'Alerts the system raised, by type and month. Detection evidence, not a resolved-case log.';

-- ── 5. Sentence construction ────────────────────────────────────────────────
-- Every sentence a student actually built that did not match the target,
-- stored verbatim. This is the closest thing the system has to student
-- language production, and the wrong orders are the diagnostic part: the words
-- are supplied, so what varies is syntax alone.
create or replace function class_sentence_attempts(p_class_id uuid)
returns table (
  expected   text,
  chosen     text,
  error_kind text,
  n          integer,
  students   integer
)
language sql
stable
as $$
  select e.expected,
         e.chosen,
         e.error_kind,
         count(*)::int                     as n,
         count(distinct e.student_id)::int as students
  from item_events e
  join students s on s.id = e.student_id
  where s.class_id = p_class_id
    and s.archived_at is null
    and e.stage_type = 'sentenceBuilder'
    and e.correct = false
    and e.chosen is not null
    and e.expected is not null
  group by 1, 2, 3
  having count(*) > 0;
$$;

comment on function class_sentence_attempts(uuid) is
  'Verbatim student-built sentences that missed the target — the syntax-evidence page.';
