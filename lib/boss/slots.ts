/**
 * Boss phase plan.
 *
 * A boss is a sequence of slots derived from its own content file, rather than
 * a hardcoded list. BossPlayer used to carry two constants naming Eclipse's
 * five countries in a fixed stage1..stage5 order, plus a render block and a
 * completion handler per stage — which meant a second boss was a fork of the
 * component, not a content file. That is why the pending "Operación Medianoche"
 * never got built: the cost was never writing a boss, it was writing a second
 * player.
 *
 * Lives outside the client component so it stays pure and directly testable —
 * a "use client" module cannot export a plain function to a server component.
 *
 * Slot indices are unchanged for Eclipse (briefing 0, stages 1-4, choice 5,
 * final stage 6, resolution 7), so saved `current_stage` values still resolve
 * to the same place and in-progress attempts are not disturbed.
 */

import type { BossContent } from "@/lib/types/boss";

export type Slot =
  | { kind: "briefing"; label: string }
  | { kind: "stage"; label: string; stageIndex: number }
  | { kind: "ethical"; label: string }
  | { kind: "resolution"; label: string };

export function buildSlots(content: BossContent): Slot[] {
  const stages = content.stages ?? [];
  // Default matches Eclipse: the choice lands before the final stage.
  const afterStage = content.ethicalChoiceAfterStage ?? Math.max(0, stages.length - 2);

  const slots: Slot[] = [{ kind: "briefing", label: "Briefing" }];
  stages.forEach((st, i) => {
    slots.push({ kind: "stage", label: st.country || st.title || `Etapa ${i + 1}`, stageIndex: i });
    if (i === afterStage) slots.push({ kind: "ethical", label: "Decisión" });
  });
  slots.push({ kind: "resolution", label: "Resolución" });
  return slots;
}
