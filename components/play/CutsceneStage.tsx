"use client";

import { useState } from "react";
import type { CutsceneStageData } from "@/lib/types/unit-content";
import type { GameResult } from "@/lib/games/types";

interface Props extends CutsceneStageData {
  onComplete: (result: GameResult) => void;
}

export default function CutsceneStage({ chiefName, chiefImageSeed, briefingLines, onComplete }: Props) {
  const [lineIndex, setLineIndex] = useState(0);
  const [started, setStarted] = useState(false);

  function handleNext() {
    if (!started) { setStarted(true); return; }
    if (lineIndex < briefingLines.length - 1) {
      setLineIndex((i) => i + 1);
    } else {
      onComplete({ score: 1, maxScore: 1, timeSpent: 0, attempts: 1 });
    }
  }

  const isLast = lineIndex === briefingLines.length - 1;

  return (
    <div className="relative min-h-[calc(100vh-48px)] bg-[#0d0b0a] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(139,26,26,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />

      {/* Briefing document */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* CLASSIFIED stamp + header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-typewriter text-[10px] tracking-[0.4em] uppercase text-[#8b7355]">
              La Liga Sombra · Archivo Confidencial
            </p>
            <h1 className="font-display font-black text-2xl text-[#f5e6c8]">Briefing del Jefe</h1>
          </div>
          <div
            className="border-4 border-[#c0392b] px-3 py-1 opacity-90"
            style={{ transform: "rotate(-4deg)" }}
          >
            <span className="font-display font-black text-[#c0392b] text-sm tracking-[0.3em] uppercase">
              Clasificado
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#c9933a] to-transparent mb-6" />

        {/* Chief card */}
        <div className="flex gap-5 mb-6">
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.pravatar.cc/80?img=${chiefImageSeed}`}
              alt={chiefName}
              width={80}
              height={80}
              className="rounded-sm border-2 border-[rgba(201,147,58,0.3)] grayscale contrast-125"
            />
            <p className="font-typewriter text-[9px] tracking-widest uppercase text-[#8b7355] text-center mt-1">
              {chiefName}
            </p>
          </div>

          {/* Briefing text box */}
          <div className="flex-1 border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5 min-h-[120px] flex flex-col justify-between">
            {!started ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <span className="text-4xl">📁</span>
                <p className="font-typewriter text-sm text-[#8b7355]">
                  Incoming classified briefing from {chiefName}
                </p>
              </div>
            ) : (
              <>
                <p className="font-typewriter text-sm text-[#c4a882] leading-relaxed">
                  &ldquo;{briefingLines[lineIndex]}&rdquo;
                </p>
                <p className="font-typewriter text-[10px] text-[#8b7355] mt-3 text-right">
                  {lineIndex + 1} / {briefingLines.length}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Progress dots */}
        {started && (
          <div className="flex justify-center gap-2 mb-5">
            {briefingLines.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i <= lineIndex ? "bg-[#c9933a]" : "bg-[#2c2220]"
                }`}
              />
            ))}
          </div>
        )}

        {/* CTA button */}
        <button
          onClick={handleNext}
          className="w-full clip-skew py-4 font-typewriter text-sm tracking-[0.25em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-all duration-200 hover:shadow-[0_0_20px_rgba(192,57,43,0.4)]"
        >
          {!started
            ? "Recibir Briefing →"
            : isLast
            ? "¡Comenzar Misión! →"
            : "Continuar →"}
        </button>

        {!started && (
          <p className="font-typewriter text-[10px] text-center text-[#4a3a2a] mt-3">
            Press to receive your classified mission briefing
          </p>
        )}
      </div>
    </div>
  );
}
