-- 033: when the class actually started.
--
-- The dashboard reports "week 3 of 36" and "the class should be on Caso 3".
-- Both need a term start date, and there is no honest way to derive one from
-- the data: this class ran its first weeks on paper with no Chromebooks, so
-- the earliest attempt is weeks after the term began. Guessing from it would
-- report a confidently wrong week number on every page load.
--
-- Nullable on purpose. Unset means the dashboard asks for the date instead of
-- inventing one.

alter table public.classes
  add column if not exists term_start date;

comment on column public.classes.term_start is
  'First day of the term. Set by the teacher; drives week number and expected unit on the Hoy dashboard. Null = not yet set.';
