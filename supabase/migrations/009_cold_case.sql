-- ── Migration 009: Casos Fríos (Cold Cases) ──────────────────────────────────
-- Adds:
--   • detective_frio to badge_type enum
--   • cold_case_completed_at and cold_case_score columns to unit_progress

DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'detective_frio'; EXCEPTION WHEN others THEN NULL; END $$;

ALTER TABLE unit_progress
  ADD COLUMN IF NOT EXISTS cold_case_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cold_case_score integer;
