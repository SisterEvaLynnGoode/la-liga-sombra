-- 027 — Operación Medianoche (boss after Unit 8)
--
-- Adds the two badge_type values the new boss awards:
--   • operacion_medianoche_completada — finishing the boss at all
--   • protector_de_fuentes            — ending B, "La Fuente Protegida"
--
-- Endings A and C reuse cazador_implacable and maestro_negociador_boss, which
-- already describe those two choices (take the conviction; negotiate in Spanish).
--
-- Non-destructive: only adds enum values. ADD VALUE IF NOT EXISTS makes this
-- safe to re-run, and no existing row is touched. The new values are not used
-- in this migration, so adding them inside a transaction is fine.

ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'operacion_medianoche_completada';
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'protector_de_fuentes';
