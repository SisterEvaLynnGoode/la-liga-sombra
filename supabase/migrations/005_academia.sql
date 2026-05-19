-- ── Migration 005: La Academia ────────────────────────────────────────────────
-- Adds:
--   • distinguished_recruit to badge_type enum
--   • 4 academia_* activity types to activity_type enum
--   • academia_sessions table to track pre-case routing and retry data

-- Extend enums (ALTER TYPE … ADD VALUE is safe to re-run on Postgres 12+)
DO $$ BEGIN
  ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'distinguished_recruit';
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'academia_recognition';
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'academia_memorization';
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'academia_production';
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'academia_application';
EXCEPTION WHEN others THEN NULL;
END $$;

-- Academia sessions — one row per student per unit per training attempt
CREATE TABLE IF NOT EXISTS academia_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  unit_id          uuid NOT NULL REFERENCES units(id)    ON DELETE CASCADE,
  routing_tier     text NOT NULL CHECK (routing_tier IN ('ready','recommended','required')),
  retry_count      integer NOT NULL DEFAULT 0,
  passed_first_try boolean NOT NULL DEFAULT false,
  completed_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE academia_sessions ENABLE ROW LEVEL SECURITY;

-- Students may only insert rows for themselves
CREATE POLICY "student_insert_own_academia"
  ON academia_sessions FOR INSERT
  WITH CHECK (student_id = auth.uid()::uuid);

-- Teachers (service role used by API routes) bypass RLS
-- Students may read their own rows
CREATE POLICY "student_read_own_academia"
  ON academia_sessions FOR SELECT
  USING (student_id = auth.uid()::uuid);
