-- La Liga Sombra — Migration 003
-- Adds stage progress tracking and lineup activity type

-- Add 'lineup' to the activity_type enum
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'lineup';

-- Add current stage index to unit_progress so students can resume mid-unit
ALTER TABLE unit_progress
  ADD COLUMN IF NOT EXISTS stage_index integer NOT NULL DEFAULT 0;
