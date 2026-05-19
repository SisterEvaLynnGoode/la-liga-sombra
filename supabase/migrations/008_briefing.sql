-- ── Migration 008: Daily Briefing (Informe Diario) ────────────────────────────
-- Adds:
--   • daily_briefing to activity_type enum
--   • informe_completo, estudiante_disciplinado, agente_elite to badge_type enum
--   • daily_briefings table

DO $$ BEGIN ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'daily_briefing';         EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type    ADD VALUE IF NOT EXISTS 'informe_completo';       EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type    ADD VALUE IF NOT EXISTS 'estudiante_disciplinado'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE badge_type    ADD VALUE IF NOT EXISTS 'agente_elite';            EXCEPTION WHEN others THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS daily_briefings (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  briefing_date       date        NOT NULL,
  terms_shown         text[]      NOT NULL DEFAULT '{}',
  terms_correct       integer     NOT NULL DEFAULT 0,
  completed           boolean     NOT NULL DEFAULT false,
  skipped             boolean     NOT NULL DEFAULT false,
  time_spent_seconds  integer     NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),

  -- One briefing per student per calendar day
  UNIQUE (student_id, briefing_date)
);

ALTER TABLE daily_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_insert_own_briefing"
  ON daily_briefings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "student_upsert_own_briefing"
  ON daily_briefings FOR UPDATE
  USING (true);

CREATE POLICY "student_read_own_briefing"
  ON daily_briefings FOR SELECT
  USING (true);

-- Index for teacher dashboard queries (group by date range)
CREATE INDEX IF NOT EXISTS idx_daily_briefings_date
  ON daily_briefings (briefing_date);
