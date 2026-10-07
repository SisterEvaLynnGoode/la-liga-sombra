"use client";

import { useState, useCallback, useMemo } from "react";
import GameShell from "./GameShell";
import { useGameTimer } from "@/lib/hooks/useGameTimer";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import { answerShape, pickTypedTargetNodeId, typedTurnGrade } from "@/lib/games/utils";
import { logItemEvent, flushItemEvents } from "@/lib/events";
import type { DialogueNode, OnComplete } from "@/lib/games/types";

interface Props {
  title?: string;
  npcName: string;
  npcAvatar?: string;
  nodes: DialogueNode[];
  startNodeId: string;
  agentName?: string;   // substituted for [nombre] in dialogue text
  unitId?: string;
  /**
   * Production ramp (Workstream B3): when true, one question in the dialogue
   * must be TYPED instead of chosen — the student produces the Spanish rather
   * than recognizing it. Which question is decided by what is sayable (see
   * pickTypedTargetNodeId), not by which one ends the conversation: aiming it
   * at the closing line made this the one stage in the game nobody passed.
   * After 2 misses it gracefully falls back to multiple choice.
   */
  productionMode?: boolean;
  onComplete: OnComplete;
}

interface HistoryEntry {
  npcLine: string;
  chosen?: string;
  wasCorrect?: boolean;
}

/**
 * The model shown under a typed turn: the first words in full, the rest as
 * word shapes (first letter + underscores). A student can read the shape of the
 * whole sentence and knows exactly what to say. Each miss reveals more, so the
 * second attempt is easier than the first rather than the same wall of text.
 */
function typedModel(target: string, misses: number): string {
  const words = target.trim().split(/\s+/);
  const revealed = Math.min(words.length, Math.max(3, Math.ceil(words.length * (misses === 0 ? 0.35 : 0.7))));
  return words.map((w, i) => (i < revealed ? w : answerShape(w))).join(" ");
}

export default function DialogueChoice({
  title = "Conversación",
  npcName,
  npcAvatar = "🕵️",
  nodes,
  startNodeId,
  agentName = "",
  unitId,
  productionMode = false,
  onComplete,
}: Props) {
  const { elapsed, stop } = useGameTimer();
  const { recordAttempt } = useAttemptTracker("dialogue", unitId);

  // Substitute [nombre] placeholder with the student's display name
  function sub(text: string): string {
    if (!agentName) return text;
    return text.replace(/\[nombre\]/gi, agentName);
  }

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const [currentNodeId, setCurrentNodeId] = useState(startNodeId);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [wrongOptionId, setWrongOptionId] = useState<number | null>(null);
  const [status, setStatus] = useState<"playing" | "complete">("playing");
  const [correctChoices, setCorrectChoices] = useState(0);
  const [totalChoices, setTotalChoices] = useState(0);

  const currentNode = nodeMap[currentNodeId];

  // ── Typed production turn (B3) ──────────────────────────────────────────────
  // One node of the dialogue is typed when productionMode is on. Falls back to
  // MC after 2 misses, and to MC entirely when nothing in the dialogue is
  // short enough to ask for.
  const [typedInput, setTypedInput] = useState("");
  const [typedMisses, setTypedMisses] = useState(0);
  const correctOption = currentNode?.options?.find((o) => o.isCorrect);
  // Decided once from the whole dialogue rather than from wherever the student
  // is standing, so the target cannot change under them mid-conversation.
  // Null means this dialogue has no sayable target and stays multiple choice.
  const typedTargetNodeId = useMemo(
    () => (productionMode ? pickTypedTargetNodeId(nodes) : null),
    [productionMode, nodes]
  );
  const useTypedTurn = !!typedTargetNodeId && typedTargetNodeId === currentNodeId &&
    typedMisses < 2 && !!correctOption && status === "playing";

  const finish = useCallback(
    (correct: number, total: number, t: number) => {
      stop();
      setStatus("complete");
      recordAttempt(correct, total, t);
      flushItemEvents();
      onComplete({ score: correct, maxScore: total, timeSpent: t, attempts: total });
    },
    [stop, recordAttempt, onComplete]
  );

  function logTypedTurn(target: string, correct: boolean, chosen: string) {
    logItemEvent({
      unitId,
      stageType: "dialogueChoice-typed",
      skill: "grammar",
      itemKey: target,
      correct,
      chosen: chosen.trim(),
      expected: target,
    });
  }

  function handleTypedSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!useTypedTurn || !correctOption || !typedInput.trim()) return;
    const target = sub(correctOption.text);
    const grade = typedTurnGrade(typedInput, target);
    // A near miss on the second attempt is banked as production rather than
    // spent on a third try. The student has said the sentence; the missing
    // accent is not what this stage is measuring.
    const passed = grade === "pass" || (grade === "close" && typedMisses >= 1);
    const newTotal = totalChoices + 1;
    setTotalChoices(newTotal);
    if (passed) {
      // One event per item, logged where the turn resolves. Logging every
      // submit meant a single node produced two or three rows under the same
      // item_key, all but the last of them a zero.
      logTypedTurn(target, true, typedInput);
      const newCorrect = correctChoices + 1;
      setCorrectChoices(newCorrect);
      setFeedback(null);
      setHistory((h) => [...h, { npcLine: sub(currentNode.npcLine), chosen: typedInput.trim(), wasCorrect: true }]);
      if (correctOption.nextNodeId && nodeMap[correctOption.nextNodeId]) {
        setCurrentNodeId(correctOption.nextNodeId);
      } else {
        finish(newCorrect, newTotal, elapsed);
      }
      return;
    }
    const misses = typedMisses + 1;
    setTypedMisses(misses);
    // The second miss hands the node to multiple choice, so that is where the
    // typed turn ends and where its one event belongs.
    if (misses >= 2) logTypedTurn(target, false, typedInput);
    // Leave the text in the box: retyping the whole line from zero is what
    // made this the hardest thing in the game.
    setFeedback(
      misses >= 2
        ? "Está bien, recluta — elige la respuesta correcta."
        : grade === "close"
          ? "Casi — te falta una palabra. Compárala con el modelo de abajo."
          : "Casi — mira el modelo de abajo y corrige lo que falta."
    );
  }

  function handleChoice(optionIndex: number) {
    if (status !== "playing" || !currentNode.options) return;
    const option = currentNode.options[optionIndex];
    const newTotal = totalChoices + 1;
    setTotalChoices(newTotal);

    if (option.isCorrect) {
      const newCorrect = correctChoices + 1;
      setCorrectChoices(newCorrect);
      setFeedback(null);
      setWrongOptionId(null);
      setHistory((h) => [...h, { npcLine: sub(currentNode.npcLine), chosen: sub(option.text), wasCorrect: true }]);

      if (option.nextNodeId && nodeMap[option.nextNodeId]) {
        setCurrentNodeId(option.nextNodeId);
      } else {
        finish(newCorrect, newTotal, elapsed);
      }
    } else {
      setWrongOptionId(optionIndex);
      setFeedback(option.feedback ?? "No exactamente — intenta de nuevo.");
    }
  }

  // Count total correct nodes for maxScore
  const totalNodes = nodes.filter((n) => n.options && n.options.length > 0).length;

  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
      unitId={unitId}
      onSkip={() => {
        stop();
        setStatus("complete");
        const result = { score: correctChoices, maxScore: totalNodes, timeSpent: elapsed, attempts: totalChoices, isSkipped: true };
        recordAttempt(correctChoices, totalNodes, elapsed);
        onComplete(result);
        return result;
      }}
    >
      <div className="p-5 max-w-2xl mx-auto flex flex-col gap-4">
        {/* Progress */}
        <div className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] text-center">
          Respuestas correctas: <span className="text-[#e8b455]">{correctChoices}</span>
          {" "}/ {totalNodes}
        </div>

        {/* Conversation history */}
        {history.length > 0 && (
          <div className="space-y-2 border-b border-[rgba(201,147,58,0.1)] pb-3 max-h-48 overflow-y-auto">
            {history.map((entry, i) => (
              <div key={i} className="space-y-1">
                <div className="flex gap-2">
                  <span className="text-lg shrink-0">{npcAvatar}</span>
                  <p className="font-typewriter text-xs text-[#8b7355] italic leading-snug">
                    &ldquo;{entry.npcLine}&rdquo;
                  </p>
                </div>
                {entry.chosen && (
                  <div className="flex justify-end">
                    <span className="inline-block px-3 py-1 bg-[rgba(201,147,58,0.1)] border border-[rgba(201,147,58,0.2)] font-typewriter text-xs text-[#c4a882]">
                      {entry.chosen} ✓
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Current NPC line */}
        {!currentNode.isEnd && status === "playing" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#2c2220] border border-[rgba(201,147,58,0.2)] flex items-center justify-center text-xl">
                  {npcAvatar}
                </div>
                <p className="font-typewriter text-[9px] tracking-widest text-[#8b7355] text-center mt-0.5">
                  {npcName}
                </p>
              </div>
              <div className="flex-1 bg-[#1a1614] border border-[rgba(201,147,58,0.2)] rounded-sm p-3">
                <p className="font-display text-base text-[#f5e6c8] leading-snug">
                  &ldquo;{sub(currentNode.npcLine)}&rdquo;
                </p>
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className="border border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)] px-4 py-2 rounded-sm">
                <p className="font-typewriter text-xs text-[#c0392b]">✗ {feedback}</p>
              </div>
            )}

            {/* Typed production turn (B3) — final question in production mode */}
            {useTypedTurn ? (
              <form onSubmit={handleTypedSubmit} className="space-y-2">
                <p className="font-typewriter text-[10px] tracking-widest uppercase text-[#c9933a]">
                  ✍ Escribe tu respuesta en español:
                </p>
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder="Escribe aquí…"
                  autoFocus
                  className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-4 py-3 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] transition-colors"
                />
                {/* The model answer. After a miss, more of it is filled in. */}
                {correctOption && (
                  <div className="border-l-2 border-[#c9933a] bg-[rgba(201,147,58,0.06)] px-3 py-2 space-y-1">
                    <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#c9933a]">
                      💡 Pista — di algo así
                    </p>
                    <p className="font-typewriter text-xs text-[#e8b455] leading-snug">
                      {typedModel(sub(correctOption.text), typedMisses)}
                    </p>
                    <p className="font-typewriter text-[10px] text-[#8b7355]">
                      {sub(correctOption.text).trim().split(/\s+/).length} palabras · copia el modelo y complétalo
                      <span className="text-[#6b5a48]"> / copy the model and fill in the gaps</span>
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="font-typewriter text-[9px] text-[#4a3a2a]" />
                  <button
                    type="submit"
                    disabled={!typedInput.trim()}
                    className="clip-skew px-6 py-2 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-30"
                  >
                    Comprobar →
                  </button>
                </div>
              </form>
            ) : (
            <div className="space-y-2">
              <p className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355]">
                Elige tu respuesta:
              </p>
              {currentNode.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleChoice(i)}
                  className={`
                    w-full text-left px-4 py-3 border font-typewriter text-sm
                    transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-[#c9933a] focus:ring-offset-1 focus:ring-offset-[#0d0b0a]
                    ${wrongOptionId === i
                      ? "border-[#c0392b] bg-[rgba(192,57,43,0.1)] text-[#c0392b]"
                      : "border-[rgba(201,147,58,0.2)] bg-[#1a1614] text-[#c4a882] hover:border-[rgba(201,147,58,0.5)] hover:bg-[rgba(201,147,58,0.05)]"
                    }
                  `}
                >
                  <span className="text-[#8b7355] mr-2">{String.fromCharCode(65 + i)}.</span>
                  {sub(opt.text)}
                </button>
              ))}
            </div>
            )}
          </div>
        )}

        {/* End node reached — show message + continue button */}
        {currentNode.isEnd && status !== "complete" && (
          <div className="border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] p-5 text-center rounded-sm space-y-4">
            <p className="font-display text-xl font-bold text-[#e8b455]">
              {currentNode.endMessage ?? "¡Conversación completada!"}
            </p>
            <button
              onClick={() => finish(correctChoices, totalNodes, elapsed)}
              className="clip-skew px-8 py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
            >
              Continuar →
            </button>
          </div>
        )}

        {/* Stage finished (onComplete already called) */}
        {status === "complete" && (
          <div className="border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] p-5 text-center rounded-sm">
            <p className="font-display text-xl font-bold text-[#e8b455] mb-1">
              ¡Conversación completada!
            </p>
            <p className="font-typewriter text-xs text-[#c4a882]">
              {correctChoices}/{totalNodes} correct choices · {elapsed}s
            </p>
          </div>
        )}
      </div>
    </GameShell>
  );
}
