-- 031 — Grade integrity and login lockout.
--
-- Found in an adversarial review before students got the game.
--
-- 1. SCORES COULD EXCEED THEIR OWN MAXIMUM.
--    The stakeout stage recorded "seconds remaining" against a hardcoded max of
--    90, but a correct answer ADDS time (capped at start + 30), so real scores
--    reached 120. 32 rows in the live table sat at up to 133%, and the gradebook
--    divides score by max_score with no clamp, so those rows were inflating real
--    students' course grades. Nothing in the API or the database rejected it,
--    which also meant a crafted POST could set any grade at all.
--
-- 2. A 4-DIGIT PIN WITH UNLIMITED ATTEMPTS.
--    The class code is written on the board and classmates' names are public, so
--    logging in as another student was a short script and a minute of wifi.
--    There was no rate limiting anywhere in the app. The lock is per ACCOUNT,
--    not per IP: a class of Chromebooks shares one school NAT address, so IP
--    throttling would lock out the whole room the first time anyone mistyped.

update attempts set score = max_score where score > max_score;

alter table attempts drop constraint if exists attempts_score_within_max;
alter table attempts
  add constraint attempts_score_within_max check (score <= max_score);

alter table students
  add column if not exists failed_logins integer not null default 0,
  add column if not exists locked_until timestamptz;

comment on column students.failed_logins is
  'Consecutive failed PIN attempts. Reset to 0 on any successful login.';
comment on column students.locked_until is
  'Set when failed_logins crosses the threshold; login refuses until it passes.';
