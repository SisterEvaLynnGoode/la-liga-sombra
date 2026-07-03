-- 016_new_badges.sql — Workstream C3: three new badge types.
-- Idempotent; safe to paste into the Supabase SQL editor twice.
DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'racha_30';            EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'primera_produccion';  EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'cold_case_master';    EXCEPTION WHEN others THEN NULL; END $$;
