-- 037 — character edits that survive production
--
-- The teacher Characters page saved a character sheet by writing
-- content/characters/unit-0N.json, and read portrait approval state by reading
-- public/images/characters/manifest.json. Both are repo files: fine on a laptop,
-- impossible on Vercel, where the filesystem is read-only and /public is not
-- even visible to the server. In production the gallery came up empty and every
-- save failed.
--
-- Character sheets and approvals now live here as overrides on top of the files
-- in the repo. The files stay the source of truth for image generation (those
-- scripts run locally); a row here is "the teacher changed this afterwards".
--
-- Non-destructive: a new table only.

create table if not exists character_overrides (
  character_id text primary key,
  -- The whole edited sheet, as the teacher saved it. NULL = only the status
  -- was changed.
  sheet        jsonb,
  -- Portrait review state, mirroring the manifest's own vocabulary:
  -- 'generated' | 'approved' | 'needs-regen'. NULL = leave the manifest's.
  status       text,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references teachers(id) on delete set null
);

comment on table character_overrides is
  'Teacher edits to character sheets and portrait approvals, layered over the repo files so they persist in production.';
