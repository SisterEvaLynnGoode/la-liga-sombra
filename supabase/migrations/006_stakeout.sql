-- ── Migration 006: Vigilancia Stakeout ───────────────────────────────────────
-- Adds:
--   • stakeout to activity_type enum
--   • vigilancia_exitosa to badge_type enum

DO $$ BEGIN
  ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'stakeout';
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'vigilancia_exitosa';
EXCEPTION WHEN others THEN NULL;
END $$;
