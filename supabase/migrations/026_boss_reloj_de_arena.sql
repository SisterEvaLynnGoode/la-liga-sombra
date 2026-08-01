-- 026 — Operación Reloj de Arena (boss after Unit 15)
--
-- Adds the two badge_type values the new boss awards:
--   • operacion_reloj_completada — finishing the boss at all
--   • guardian_del_tiempo        — ending A, "El Trato del Reloj"
--
-- Endings B and C reuse cazador_implacable and maestro_negociador_boss, which
-- already exist and describe the same two choices.
--
-- Non-destructive: only adds enum values. ADD VALUE IF NOT EXISTS makes this
-- safe to re-run, and no existing row is touched. The new values are not used
-- in this migration, so adding them inside a transaction is fine.

ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'operacion_reloj_completada';
ALTER TYPE badge_type ADD VALUE IF NOT EXISTS 'guardian_del_tiempo';
