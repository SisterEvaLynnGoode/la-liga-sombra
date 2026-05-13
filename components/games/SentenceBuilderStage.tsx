"use client";

import { useState, useCallback } from "react";
import SentenceBuilder from "./SentenceBuilder";
import type { SentenceItem } from "@/lib/types/unit-content";
import type { OnComplete, GameResult } from "@/lib/games/types";

interface Props {
  sentences: SentenceItem[];
  unitId?: string;
  onComplete: OnComplete;
}

export default function SentenceBuilderStage({ sentences, unitId, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [results, setResults] = useState<GameResult[]>([]);

  const current = sentences[index];
  const isLast = index === sentences.length - 1;

  const handleSentenceComplete = useCallback(
    (result: GameResult) => {
      const newScore = totalScore + result.score;
      const newTime = totalTime + result.timeSpent;
      const newAttempts = totalAttempts + result.attempts;
      const newResults = [...results, result];

      setTotalScore(newScore);
      setTotalTime(newTime);
      setTotalAttempts(newAttempts);
      setResults(newResults);

      if (isLast) {
        onComplete({
          score: newScore,
          maxScore: sentences.length,
          timeSpent: newTime,
          attempts: newAttempts,
          isSkipped: newResults.some((r) => r.isSkipped),
        });
      } else {
        setIndex((i) => i + 1);
      }
    },
    [totalScore, totalTime, totalAttempts, results, isLast, onComplete, sentences.length]
  );

  if (!current) return null;

  return (
    <div>
      {/* Progress header */}
      {sentences.length > 1 && (
        <div className="px-5 pt-4 pb-0 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">
              Oración {index + 1} de {sentences.length}
            </p>
            <div className="flex gap-1">
              {sentences.map((_, i) => (
                <div
                  key={i}
                  className={`w-5 h-1 rounded-full transition-colors ${
                    i < index ? "bg-[#c9933a]" : i === index ? "bg-[#8b1a1a]" : "bg-[#2a2420]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* The sentence builder game */}
      <SentenceBuilder
        key={`sentence-${index}`}
        title={`Construcción · ${index + 1}/${sentences.length}`}
        sentence={current.sentence}
        translation={current.translation}
        unitId={unitId}
        onComplete={handleSentenceComplete}
      />
    </div>
  );
}
