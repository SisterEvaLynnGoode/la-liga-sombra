"use client";

import { useState, useCallback, useId } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import GameShell from "./GameShell";
import { useGameTimer } from "@/lib/hooks/useGameTimer";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import { shuffle, normalizeAnswer } from "@/lib/games/utils";
import type { ConjugationSet, OnComplete } from "@/lib/games/types";
import { PRONOUNS } from "@/lib/games/types";

interface Props {
  title?: string;
  verb: string;
  tense: string;
  conjugations: ConjugationSet;
  unitId?: string;
  onComplete: OnComplete;
}

type SlotKey = keyof ConjugationSet;
type Slots = Record<SlotKey, string | null>;

function DraggableForm({ id, form, isUsed }: { id: string; form: string; isUsed: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = { transform: CSS.Translate.toString(transform ?? { x: 0, y: 0, scaleX: 1, scaleY: 1 }) };

  if (isUsed) {
    return (
      <div className="px-4 py-2 border border-[rgba(201,147,58,0.1)] bg-[#0d0b0a] font-typewriter text-sm text-[#3a3028] rounded-sm opacity-40 cursor-not-allowed select-none">
        {form}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`px-4 py-2 border font-typewriter text-sm rounded-sm cursor-grab active:cursor-grabbing select-none touch-none transition-all focus:outline-none focus:ring-2 focus:ring-[#c9933a] focus:ring-offset-1 focus:ring-offset-[#0d0b0a]
        ${isDragging
          ? "border-[#c9933a] bg-[rgba(201,147,58,0.1)] text-[#e8b455] opacity-50"
          : "border-[rgba(201,147,58,0.3)] bg-[#1a1614] text-[#c4a882] hover:border-[rgba(201,147,58,0.6)] hover:bg-[rgba(201,147,58,0.05)]"
        }
      `}
    >
      {form}
    </div>
  );
}

function ConjugationSlot({
  slotKey,
  displayPronoun,
  form,
  correct,
  submitted,
}: {
  slotKey: SlotKey;
  displayPronoun: string;
  form: string | null;
  correct?: boolean;
  submitted: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotKey });

  return (
    <div className="flex items-center gap-3 border-b border-[rgba(201,147,58,0.08)] py-2 last:border-0">
      <span className="font-typewriter text-sm text-[#8b7355] w-20 shrink-0 text-right">{displayPronoun}</span>
      <div
        ref={setNodeRef}
        className={`
          flex-1 h-10 border rounded-sm flex items-center px-3 transition-all
          ${submitted
            ? correct
              ? "border-[#c9933a] bg-[rgba(201,147,58,0.1)]"
              : "border-[#c0392b] bg-[rgba(192,57,43,0.1)]"
            : isOver
            ? "border-[#c9933a] bg-[rgba(201,147,58,0.1)]"
            : form
            ? "border-[rgba(201,147,58,0.3)] bg-[#1a1614]"
            : "border-dashed border-[rgba(201,147,58,0.15)] bg-[rgba(201,147,58,0.02)]"
          }
        `}
      >
        {form ? (
          <span className="font-typewriter text-sm text-[#f5e6c8]">{form}</span>
        ) : (
          <span className="font-typewriter text-xs text-[#3a3028]">drag here…</span>
        )}
        {submitted && (
          <span className={`ml-auto text-sm ${correct ? "text-[#c9933a]" : "text-[#c0392b]"}`}>
            {correct ? "✓" : "✗"}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ConjugationDragDrop({
  title = "Conjugación",
  verb,
  tense,
  conjugations,
  unitId,
  onComplete,
}: Props) {
  const { elapsed, stop } = useGameTimer();
  const { recordAttempt, updateMastery } = useAttemptTracker("grammar", unitId);
  const dndId = useId();

  const formList = PRONOUNS.map((p) => conjugations[p.key]);
  const [bankForms] = useState(() => shuffle(formList.map((f, i) => ({ id: `form-${i}`, form: f }))));
  const [slots, setSlots] = useState<Slots>({ yo: null, tu: null, el: null, nosotros: null, vosotros: null, ellos: null });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [slotFeedback, setSlotFeedback] = useState<Record<SlotKey, boolean>>({} as Record<SlotKey, boolean>);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<"playing" | "complete">("playing");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const usedFormIds = new Set(
    Object.values(slots)
      .filter(Boolean)
      .map((form) => bankForms.find((b) => b.form === form)?.id)
      .filter(Boolean) as string[]
  );

  function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id as string); }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const formId = active.id as string;
    const slotKey = over.id as SlotKey;
    const tile = bankForms.find((b) => b.id === formId);
    if (!tile || !PRONOUNS.find((p) => p.key === slotKey)) return;

    setSlots((prev) => {
      const updated = { ...prev };
      // If slot already occupied, return old form to bank (just clear it)
      updated[slotKey] = tile.form;
      return updated;
    });
  }

  const finish = useCallback(
    (score: number, t: number, att: number) => {
      stop();
      setStatus("complete");
      recordAttempt(score, PRONOUNS.length, t);
      onComplete({ score, maxScore: PRONOUNS.length, timeSpent: t, attempts: att });
    },
    [stop, recordAttempt, onComplete]
  );

  function handleCheck() {
    const feedback: Record<SlotKey, boolean> = {} as Record<SlotKey, boolean>;
    let correct = 0;
    PRONOUNS.forEach(({ key }) => {
      const isCorrect = slots[key] !== null && normalizeAnswer(slots[key]!) === normalizeAnswer(conjugations[key]);
      feedback[key] = isCorrect;
      if (isCorrect) correct++;
      updateMastery(`${verb}-${key}`, isCorrect);
    });
    setSlotFeedback(feedback);
    setSubmitted(true);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (correct === PRONOUNS.length) {
      setTimeout(() => finish(correct, elapsed, newAttempts), 800);
    }
  }

  function handleReset() {
    setSlots({ yo: null, tu: null, el: null, nosotros: null, vosotros: null, ellos: null });
    setSubmitted(false);
    setSlotFeedback({} as Record<SlotKey, boolean>);
  }

  const activeForm = activeId ? bankForms.find((b) => b.id === activeId)?.form : null;

  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
      onSkip={() => {
        stop();
        setStatus("complete");
        const r = { score: 0, maxScore: PRONOUNS.length, timeSpent: elapsed, attempts, isSkipped: true };
        recordAttempt(0, PRONOUNS.length, elapsed);
        onComplete(r);
        return r;
      }}
    >
      <DndContext
        id={dndId}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="p-5 max-w-2xl mx-auto">
          {/* Verb header */}
          <div className="text-center mb-5">
            <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355]">{tense}</p>
            <p className="font-display text-3xl font-bold text-[#f5e6c8]">{verb}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            {/* Conjugation table */}
            <div className="flex-1 border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-4 rounded-sm">
              <p className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] mb-3">Tabla de conjugación</p>
              {PRONOUNS.map(({ key, display }) => (
                <ConjugationSlot
                  key={key}
                  slotKey={key}
                  displayPronoun={display}
                  form={slots[key]}
                  correct={slotFeedback[key]}
                  submitted={submitted}
                />
              ))}
            </div>

            {/* Word bank */}
            <div className="sm:w-44">
              <p className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] mb-3">Formas verbales</p>
              <div className="flex flex-col gap-2">
                {bankForms.map(({ id, form }) => (
                  <DraggableForm key={id} id={id} form={form} isUsed={usedFormIds.has(id)} />
                ))}
              </div>
            </div>
          </div>

          {/* Feedback row */}
          {submitted && !status.startsWith("complete") && (
            <div className="mt-4 border border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.05)] px-4 py-3">
              <p className="font-typewriter text-xs text-[#c0392b]">
                Some forms are wrong — check the red slots and try again.
              </p>
              <div className="mt-2 space-y-0.5">
                {PRONOUNS.filter(({ key }) => submitted && !slotFeedback[key]).map(({ key, display }) => (
                  <p key={key} className="font-typewriter text-xs text-[#8b7355]">
                    <span className="text-[#c4a882]">{display}</span> → {conjugations[key]}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {status === "playing" && (
            <div className="flex gap-3 mt-4">
              <button onClick={handleReset} className="px-4 py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase border border-[rgba(201,147,58,0.2)] text-[#8b7355] hover:border-[rgba(201,147,58,0.4)] transition-colors">
                ↺ Reset
              </button>
              <button
                onClick={handleCheck}
                disabled={Object.values(slots).some((v) => v === null)}
                className="flex-1 clip-skew py-2.5 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40"
              >
                Comprobar →
              </button>
            </div>
          )}

          {status === "complete" && (
            <div className="mt-4 border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] p-5 text-center">
              <p className="font-display text-xl font-bold text-[#e8b455]">¡Conjugación correcta!</p>
              <p className="font-typewriter text-xs text-[#c4a882] mt-1">{elapsed}s · {attempts} check{attempts !== 1 ? "s" : ""}</p>
            </div>
          )}
        </div>

        <DragOverlay>
          {activeForm ? (
            <div className="px-4 py-2 border border-[#c9933a] bg-[rgba(201,147,58,0.15)] font-typewriter text-sm text-[#e8b455] rounded-sm shadow-xl rotate-2 cursor-grabbing">
              {activeForm}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </GameShell>
  );
}
