-- 042 — the name that goes on a report a family will read
--
-- display_name is whatever the student typed when they joined: "MopHead",
-- "babyskelly", "nick cage". That is fine inside the game and fine on the
-- teacher's own screens, but a progress report addressed to "MopHead" cannot
-- be sent home, and an administrator cannot match it to a roster.
--
-- report_name is the student's real name, typed once by the teacher. Null means
-- "not set", and every report falls back to display_name so nothing breaks
-- before it is filled in.

alter table students add column if not exists report_name text;

comment on column students.report_name is
  'Real name for parent reports and admin exports. Null falls back to display_name.';
