-- ── Migration 010: Boss Fight System ─────────────────────────────────────────
-- Adds boss_progress table + new badge types + alters unit_progress
-- for boss-gated unit unlock.

-- New badge types
DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'operacion_eclipse_completada'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'diplomatico';                   EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'cazador_implacable';            EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'maestro_negociador_boss';       EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'agente_elite_boss';             EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'agente_estandar';               EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'agente_cuidadoso';              EXCEPTION WHEN others THEN NULL; END $$;

-- Boss progress table
CREATE TABLE IF NOT EXISTS boss_progress (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_student_id   uuid        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  partner_student_id   uuid        REFERENCES students(id) ON DELETE SET NULL,
  boss_id              text        NOT NULL,
  difficulty           text        CHECK (difficulty IN ('easy','normal','hard')),
  current_stage        integer     NOT NULL DEFAULT 0,
  stage_data           jsonb       NOT NULL DEFAULT '{}',
  ethical_choices      jsonb       NOT NULL DEFAULT '[]',
  partner_name         text,
  started_at           timestamptz NOT NULL DEFAULT now(),
  last_saved_at        timestamptz NOT NULL DEFAULT now(),
  completed_at         timestamptz,
  skipped_at           timestamptz,
  final_score          integer,
  final_ending         text,
  UNIQUE (primary_student_id, boss_id)
);

ALTER TABLE boss_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boss_student_all" ON boss_progress
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_boss_progress_boss_id
  ON boss_progress (boss_id);
