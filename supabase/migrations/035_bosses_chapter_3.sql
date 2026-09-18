-- 035 — Chapter 3 bosses
--
-- Operación Última Crónica (after Caso 26) and Operación La Colección (after
-- Caso 32, the finale). Adds the badge_type values they award:
--   • operacion_cronica_completada   — finishing Última Crónica at all
--   • testigo_de_la_cronica          — its ending A, "La Última Crónica"
--   • operacion_coleccion_completada — finishing La Colección at all
--   • voz_del_barrio                 — its ending C, "De Vuelta al Barrio"
--
-- The other endings reuse badges that already exist and describe the same
-- choice: cazador_implacable (arrest), maestro_negociador_boss (negotiate),
-- diplomatico (the compromise).
--
-- boss_progress.boss_id and final_ending are plain text, so the bosses
-- themselves need no schema change.
--
-- Non-destructive: only adds enum values. ADD VALUE IF NOT EXISTS makes this
-- safe to re-run, and no existing row is touched.

ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'operacion_cronica_completada';
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'testigo_de_la_cronica';
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'operacion_coleccion_completada';
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'voz_del_barrio';
