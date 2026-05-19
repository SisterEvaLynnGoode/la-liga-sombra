-- ── Migration 011: Academia support flag ─────────────────────────────────────
-- Adds advanced_without_passing to academia_sessions so teachers can see
-- which students chose to skip past the training threshold.

ALTER TABLE academia_sessions
  ADD COLUMN IF NOT EXISTS advanced_without_passing boolean NOT NULL DEFAULT false;
