-- La Liga Sombra — Migration 004
-- Adds new badge types and class_alerts table for Realtime broadcasting

-- ─── New badge types ──────────────────────────────────────────────────────────
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'unit_completed';
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'speed_demon';
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'vocab_master';
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'streak_3';
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'streak_7';

-- ─── Class alerts (teacher → students, Supabase Realtime) ────────────────────
CREATE TABLE class_alerts (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references classes(id) on delete cascade,
  message    text not null,
  sent_at    timestamptz not null default now()
);

ALTER TABLE class_alerts ENABLE ROW LEVEL SECURITY;

-- Alerts are not sensitive — students can read their class's alerts
CREATE POLICY "class_alerts_read" ON class_alerts FOR SELECT USING (true);
CREATE POLICY "class_alerts_insert" ON class_alerts FOR INSERT WITH CHECK (true);

-- Enable Supabase Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE class_alerts;

CREATE INDEX idx_class_alerts_class_id ON class_alerts (class_id);
