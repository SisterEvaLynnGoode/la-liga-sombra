"use client";

import { useState, useCallback } from "react";
import GameShell from "./GameShell";
import { useGameTimer } from "@/lib/hooks/useGameTimer";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import type { DialogueNode, OnComplete } from "@/lib/games/types";

interface Props {
  title?: string;
  npcName: string;
  npcAvatar?: string;
  nodes: DialogueNode[];
  startNodeId: string;
  unitId?: string;
  onComplete: OnComplete;
}

interface HistoryEntry {
  npcLine: string;
  chosen?: string;
  wasCorrect?: boolean;
}

export default function DialogueChoice({
  title = "Conversación",
  npcName,
  npcAvatar = "🕵️",
  nodes,
  startNodeId,
  unitId,
  onComplete,
}: Props) {
  const { elapsed, stop } = useGameTimer();
  const { recordAttempt } = useAttemptTracker("dialogue", unitId);

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const [currentNodeId, setCurrentNodeId] = useState(startNodeId);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [wrongOptionId, setWrongOptionId] = useState<number | null>(null);
  const [status, setStatus] = useState<"playing" | "complete">("playing");
  const [correctChoices, setCorrectChoices] = useState(0);
  const [totalChoices, setTotalChoices] = useState(0);

  const currentNode = nodeMap[currentNodeId];

  const finish = useCallback(
    (correct: number, total: number, t: number) => {
      stop();
      setStatus("complete");
      recordAttempt(correct, total, t);
      onComplete({ score: correct, maxScore: total, timeSpent: t, attempts: total });
    },
    [stop, recordAttempt, onComplete]
  );

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
      setHistory((h) => [...h, { npcLine: currentNode.npcLine, chosen: option.text, wasCorrect: true }]);

      if (option.nextNodeId && nodeMap[option.nextNodeId]) {
        setCurrentNodeId(option.nextNodeId);
      } else {
        finish(newCorrect, newTotal, elapsed);
      }
    } else {
      setWrongOptionId(optionIndex);
      setFeedback(option.feedback ?? "Not quite — try again.");
    }
  }

  // Count total correct nodes for maxScore
  const totalNodes = nodes.filter((n) => n.options && n.options.length > 0).length;

  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
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
                  &ldquo;{currentNode.npcLine}&rdquo;
                </p>
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className="border border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)] px-4 py-2 rounded-sm">
                <p className="font-typewriter text-xs text-[#c0392b]">✗ {feedback}</p>
              </div>
            )}

            {/* Response options */}
            <div className="space-y-2">
              <p className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355]">
                Choose your response:
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
                  {opt.text}
                </button>
              ))}
            </div>
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
