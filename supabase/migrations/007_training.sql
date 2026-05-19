-- ── Migration 007: La Sala de Entrenamiento ──────────────────────────────────
-- Adds:
--   • training_vocab, training_grammar, training_drill to activity_type enum
--   • entrenamiento_diario, maestro_vocabulario, poliglota to badge_type enum

DO $$ BEGIN ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'training_vocab';    EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'training_grammar';  EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'training_drill';    EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'entrenamiento_diario'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'maestro_vocabulario';  EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'poliglota';            EXCEPTION WHEN others THEN NULL; END $$;
