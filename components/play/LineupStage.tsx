"use client";

import { useState } from "react";
import type { Suspect } from "@/lib/types/unit-content";
import type { GameResult } from "@/lib/games/types";

interface Props {
  suspects: Suspect[];
  correctSuspectId: string;
  hint: string;
  earnedClues: string[];
  onComplete: (result: GameResult, score: number) => void;
}

export default function LineupStage({ suspects, correctSuspectId, hint, earnedClues, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());

  function handleConfirm() {
    if (!selected || confirmed) return;
    const correct = selected === correctSuspectId;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setConfirmed(true);
    setIsCorrect(correct);

    if (correct) {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      setTimeout(() => {
        onComplete(
          { score: 1, maxScore: 1, timeSpent, attempts: newAttempts },
          1
        );
      }, 1200);
    } else {
      // After wrong answer, allow retry
      setTimeout(() => {
        setConfirmed(false);
        setSelected(null);
        if (newAttempts >= 1) setShowHint(true);
      }, 1500);
    }
  }

  return (
    <div className="p-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-5">
        <p className="font-typewriter text-[10px] tracking-[0.35em] uppercase text-[#8b7355]">
          Etapa Final · Identificación
        </p>
        <h2 className="font-display text-2xl font-bold text-[#f5e6c8]">
          Rueda de Reconocimiento
        </h2>
        <p className="font-typewriter text-xs text-[#8b7355] mt-1">
          Read each suspect&apos;s description carefully. Use your clues to identify the criminal.
        </p>
      </div>

      {/* Earned clues */}
      {earnedClues.length > 0 && (
        <div className="mb-5">
          <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">
            Tus pistas ({earnedClues.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {earnedClues.map((clue, i) => (
              <div
                key={i}
                className="flex items-start gap-2 px-3 py-2 border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] max-w-xs"
              >
                <span className="text-[#c9933a] shrink-0 text-xs mt-0.5">#{i + 1}</span>
                <p className="font-typewriter text-xs text-[#c4a882] leading-snug">{clue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hint */}
      {showHint && (
        <div className="mb-4 border border-[rgba(201,147,58,0.25)] bg-[rgba(201,147,58,0.05)] px-4 py-3 flex items-start gap-2">
          <span className="text-[#c9933a] shrink-0">💡</span>
          <p className="font-typewriter text-xs text-[#c4a882] leading-snug">{hint}</p>
        </div>
      )}

      {/* Suspect grid — 2×2 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {suspects.map((suspect) => {
          const isSelected = selected === suspect.id;
          let borderStyle = "border-[rgba(201,147,58,0.15)] hover:border-[rgba(201,147,58,0.4)]";
          if (confirmed) {
            if (isSelected && isCorrect) borderStyle = "border-[#c9933a] shadow-[0_0_20px_rgba(201,147,58,0.3)]";
            else if (isSelected && !isCorrect) borderStyle = "border-[#c0392b] shadow-[0_0_12px_rgba(192,57,43,0.3)]";
          } else if (isSelected) {
            borderStyle = "border-[#c9933a]";
          }

          return (
            <button
              key={suspect.id}
              onClick={() => !confirmed && setSelected(suspect.id)}
              disabled={confirmed}
              className={`
                relative border-2 bg-[#1a1614] text-left transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-[#c9933a] focus:ring-offset-1 focus:ring-offset-[#0d0b0a]
                ${borderStyle}
                ${!confirmed ? "cursor-pointer" : "cursor-default"}
              `}
            >
              {/* Photo */}
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.pravatar.cc/300?img=${suspect.imageSeed}`}
                  alt={`Suspect: ${suspect.name}`}
                  width={300}
                  height={200}
                  className="w-full object-cover grayscale contrast-110"
                  style={{ height: 140 }}
                />
                {/* Overlay on selection */}
                {isSelected && !confirmed && (
                  <div className="absolute inset-0 bg-[rgba(201,147,58,0.15)]" />
                )}
                {confirmed && isSelected && isCorrect && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(201,147,58,0.2)]">
                    <span className="text-4xl">✓</span>
                  </div>
                )}
                {confirmed && isSelected && !isCorrect && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(192,57,43,0.2)]">
                    <span className="text-4xl">✗</span>
                  </div>
                )}
                {/* Number badge */}
                <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-[rgba(0,0,0,0.8)] border border-[rgba(201,147,58,0.3)] flex items-center justify-center">
                  <span className="font-typewriter text-[10px] text-[#8b7355]">
                    {suspects.indexOf(suspect) + 1}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-display font-bold text-sm text-[#e8b455] leading-none mb-0.5">
                  {suspect.name}
                </p>
                <p className="font-typewriter text-[9px] text-[#8b7355] mb-2">
                  {suspect.realName} · {suspect.age} años
                </p>
                <p className="font-typewriter text-[10px] text-[#c4a882] leading-snug">
                  {suspect.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm button */}
      {!confirmed && (
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {selected ? `Acusar a "${suspects.find(s => s.id === selected)?.name}" →` : "Select a suspect first"}
        </button>
      )}

      {/* Feedback */}
      {confirmed && !isCorrect && (
        <div className="border border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)] px-4 py-3 text-center">
          <p className="font-typewriter text-xs text-[#c0392b]">
            Incorrect — that suspect doesn&apos;t match all the clues. Study them again and try once more.
          </p>
        </div>
      )}
      {confirmed && isCorrect && (
        <div className="border border-[rgba(201,147,58,0.4)] bg-[rgba(201,147,58,0.08)] px-4 py-3 text-center">
          <p className="font-display font-bold text-[#e8b455]">¡Lo identificaste! Caso resuelto.</p>
        </div>
      )}
    </div>
  );
}
