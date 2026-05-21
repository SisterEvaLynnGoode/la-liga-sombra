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
  closestCenter,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import GameShell from "./GameShell";
import { useGameTimer } from "@/lib/hooks/useGameTimer";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import { shuffle, normalizeAnswer } from "@/lib/games/utils";
import type { OnComplete } from "@/lib/games/types";

interface Props {
  title?: string;
  sentence: string;       // correct sentence
  translation: string;
  unitId?: string;
  onComplete: OnComplete;
}

// A word tile with a unique id even if words repeat
interface WordTile { id: string; word: string; }

function makeTiles(sentence: string): WordTile[] {
  return sentence.split(/\s+/).map((word, i) => ({ id: `w-${i}`, word }));
}

// Registers a div as a droppable zone so dnd-kit can detect drops on empty containers
function DroppableZone({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className: string;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} id={id} className={className}>
      {children}
    </div>
  );
}

function SortableWord({
  id,
  word,
  container,
  onTap,
}: {
  id: string;
  word: string;
  container: "bank" | "sentence";
  onTap: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onTap}
      className={`
        px-3 py-2 border font-typewriter text-sm cursor-pointer active:cursor-grabbing
        select-none touch-none rounded-sm transition-colors
        focus:outline-none focus:ring-2 focus:ring-[#c9933a] focus:ring-offset-1 focus:ring-offset-[#0d0b0a]
        ${container === "bank"
          ? "bg-[#1a1614] border-[rgba(201,147,58,0.25)] text-[#c4a882] hover:border-[rgba(201,147,58,0.5)] active:bg-[rgba(201,147,58,0.1)]"
          : "bg-gradient-to-br from-[#f8e9cc] to-[#efd9a0] border-[rgba(139,94,16,0.4)] text-[#2c1a08] shadow-sm active:opacity-70"
        }
      `}
    >
      {word}
    </div>
  );
}

function WordOverlay({ word }: { word: string }) {
  return (
    <div className="px-3 py-2 border font-typewriter text-sm bg-gradient-to-br from-[#f8e9cc] to-[#efd9a0] border-[#c9933a] text-[#2c1a08] shadow-lg rounded-sm rotate-2 cursor-grabbing">
      {word}
    </div>
  );
}

export default function SentenceBuilder({
  title = "Construcción de Oraciones",
  sentence,
  translation,
  unitId,
  onComplete,
}: Props) {
  const { elapsed, stop } = useGameTimer();
  const { recordAttempt } = useAttemptTracker("grammar", unitId);
  const dndId = useId();

  const correctTiles = makeTiles(sentence);
  const [containers, setContainers] = useState<{ bank: string[]; sentence: string[] }>({
    bank: shuffle(correctTiles).map((t) => t.id),
    sentence: [],
  });
  const tileMap = Object.fromEntries(correctTiles.map((t) => [t.id, t.word]));

  const [activeId, setActiveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<"playing" | "complete">("playing");
  const [showHint, setShowHint] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function findContainer(id: string): "bank" | "sentence" | null {
    if (containers.bank.includes(id)) return "bank";
    if (containers.sentence.includes(id)) return "sentence";
    if (id === "bank" || id === "sentence") return id as "bank" | "sentence";
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setContainers((prev) => {
      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];
      const activeIndex = activeItems.indexOf(activeId);
      activeItems.splice(activeIndex, 1);
      // If dragging onto the empty container itself (overId is the container id),
      // append to end rather than trying to find an item index
      const overIndex = overItems.indexOf(overId);
      const insertAt = overIndex < 0 ? overItems.length : overIndex + 1;
      overItems.splice(insertAt, 0, activeId);
      return { ...prev, [activeContainer]: activeItems, [overContainer]: overItems };
    });
  }

  // Tap-to-move: tapping a word moves it to the other container (reliable on mobile/touch)
  function handleWordTap(id: string) {
    const from = findContainer(id);
    if (!from) return;
    setFeedback(null);
    if (from === "bank") {
      setContainers((prev) => ({
        bank: prev.bank.filter((i) => i !== id),
        sentence: [...prev.sentence, id],
      }));
    } else {
      setContainers((prev) => ({
        sentence: prev.sentence.filter((i) => i !== id),
        bank: [...prev.bank, id],
      }));
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      const items = [...containers[activeContainer]];
      const oldIndex = items.indexOf(activeId);
      const newIndex = items.indexOf(overId);
      if (oldIndex !== newIndex) {
        setContainers((prev) => ({ ...prev, [activeContainer]: arrayMove(items, oldIndex, newIndex) }));
      }
    }
  }

  const finish = useCallback(
    (score: number, t: number, att: number) => {
      stop();
      setStatus("complete");
      recordAttempt(score, 1, t);
      onComplete({ score, maxScore: 1, timeSpent: t, attempts: att });
    },
    [stop, recordAttempt, onComplete]
  );

  function handleCheck() {
    const built = containers.sentence.map((id) => tileMap[id]).join(" ");
    const isCorrect = normalizeAnswer(built) === normalizeAnswer(sentence);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setTimeout(() => finish(1, elapsed, newAttempts), 700);
  }

  function handleReset() {
    setContainers({ bank: shuffle(correctTiles).map((t) => t.id), sentence: [] });
    setFeedback(null);
  }

  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
      unitId={unitId}
      onSkip={() => {
        stop();
        setStatus("complete");
        const r = { score: 0, maxScore: 1, timeSpent: elapsed, attempts, isSkipped: true };
        recordAttempt(0, 1, elapsed);
        onComplete(r);
        return r;
      }}
    >
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="p-5 max-w-2xl mx-auto flex flex-col gap-5">
          {/* Instructions */}
          <div>
            <p className="font-typewriter text-xs text-[#8b7355]">
              <span className="text-[#c4a882]">Toca</span> una palabra para moverla — o <span className="text-[#c4a882]">arrástrala</span> a la posición exacta. Toca las palabras colocadas para devolverlas.
            </p>
            <button
              onClick={() => setShowHint((v) => !v)}
              className="font-typewriter text-[10px] text-[#c9933a] hover:underline mt-1"
            >
              {showHint ? "▲ Ocultar traducción" : "▼ Ver traducción (pista)"}
            </button>
            {showHint && (
              <p className="font-typewriter text-xs text-[#8b7355] italic mt-1 border-l-2 border-[rgba(201,147,58,0.3)] pl-3">
                &ldquo;{translation}&rdquo;
              </p>
            )}
          </div>

          {/* Sentence drop zone */}
          <div>
            <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">
              Tu oración:
            </p>
            <SortableContext id="sentence" items={containers.sentence} strategy={horizontalListSortingStrategy}>
              <DroppableZone
                id="sentence"
                className={`
                  min-h-[56px] border-2 border-dashed p-3 flex flex-wrap gap-2 rounded-sm transition-colors
                  ${feedback === "correct" ? "border-[#c9933a] bg-[rgba(201,147,58,0.05)]"
                    : feedback === "wrong" ? "border-[#c0392b] bg-[rgba(192,57,43,0.05)]"
                    : "border-[rgba(201,147,58,0.2)] bg-[#0d0b0a]"}
                `}
              >
                {containers.sentence.length === 0 && (
                  <span className="font-typewriter text-xs text-[#4a3a2a] self-center">
                    Toca o arrastra palabras aquí…
                  </span>
                )}
                {containers.sentence.map((id) => (
                  <SortableWord key={id} id={id} word={tileMap[id]} container="sentence" onTap={() => handleWordTap(id)} />
                ))}
              </DroppableZone>
            </SortableContext>
          </div>

          {/* Word bank */}
          <div>
            <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">
              Palabras disponibles:
            </p>
            <SortableContext id="bank" items={containers.bank} strategy={horizontalListSortingStrategy}>
              <DroppableZone
                id="bank"
                className="min-h-[56px] border border-[rgba(201,147,58,0.1)] bg-[#110f0d] p-3 flex flex-wrap gap-2 rounded-sm"
              >
                {containers.bank.length === 0 && (
                  <span className="font-typewriter text-xs text-[#4a3a2a] self-center">
                    All words placed ✓
                  </span>
                )}
                {containers.bank.map((id) => (
                  <SortableWord key={id} id={id} word={tileMap[id]} container="bank" onTap={() => handleWordTap(id)} />
                ))}
              </DroppableZone>
            </SortableContext>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`border px-4 py-3 text-center rounded-sm ${feedback === "correct" ? "border-[rgba(201,147,58,0.4)] bg-[rgba(201,147,58,0.08)]" : "border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)]"}`}>
              <p className={`font-display font-bold ${feedback === "correct" ? "text-[#e8b455]" : "text-[#c0392b]"}`}>
                {feedback === "correct" ? "¡Perfecto!" : "Not quite — try rearranging the words."}
              </p>
            </div>
          )}

          {/* Actions */}
          {status === "playing" && (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase border border-[rgba(201,147,58,0.2)] text-[#8b7355] hover:border-[rgba(201,147,58,0.4)] transition-colors"
              >
                ↺ Reiniciar
              </button>
              <button
                onClick={handleCheck}
                disabled={containers.sentence.length === 0 || feedback === "correct"}
                className="flex-1 clip-skew py-2.5 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40"
              >
                Comprobar →
              </button>
            </div>
          )}
        </div>

        <DragOverlay>
          {activeId ? <WordOverlay word={tileMap[activeId] ?? ""} /> : null}
        </DragOverlay>
      </DndContext>
    </GameShell>
  );
}
