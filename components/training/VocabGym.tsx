"use client";

import { useState } from "react";
import VocabMatch from "@/components/games/VocabMatch";
import TimedFlashcards from "@/components/games/TimedFlashcards";
import Definiciones from "./Definiciones";
import { buildVocabDrillSets, buildDefinicionesQuestions, type VocabDrillItem } from "@/lib/personalized-drills";
import type { GameResult } from "@/lib/games/types";

interface Props {
  drillItems: VocabDrillItem[];
  termToUnit: Record<string, number>;
  todayMinutes: number;
  todayDrills: number;
  onActivityComplete: (opts: {
    subtype: "vocab";
    score: number;
    maxScore: number;
    timeSeconds: number;
    termsFromUnits: number[];
  }) => void;
}

type Mode = "vocabMatch" | "flashcards" | "definiciones";
type Phase = "home" | "playing" | "done";

const MODES: Array<{ id: Mode; emoji: string; label: string; desc: string; count: number }> = [
  { id: "vocabMatch",   emoji: "🃏", label: "Memoria",     desc: "Une las tarjetas — español con inglés", count: 16 },
  { id: "flashcards",  emoji: "⚡", label: "Flash Rápido", desc: "60 segundos, tantas como puedas",       count: 20 },
  { id: "definiciones", emoji: "💬", label: "Definiciones", desc: "Ve la palabra en español, elige el inglés", count: 12 },
];

export default function VocabGym({ drillItems, termToUnit, todayMinutes, todayDrills, onActivityComplete }: Props) {
  const [phase, setPhase]         = useState<Phase>("home");
  const [mode, setMode]           = useState<Mode | null>(null);
  const [result, setResult]       = useState<{ score: number; max: number } | null>(null);
  const [sessionUnits, setSessionUnits] = useState<number[]>([]);

  const weakFirst = drillItems.length > 0;

  function startMode(m: Mode) {
    const count = MODES.find((mo) => mo.id === m)?.count ?? 16;
    const { items } = buildVocabDrillSets(drillItems, count);
    const units = Array.from(new Set(items.map((i) => termToUnit[i.spanish] ?? i.unitNumber)));
    setSessionUnits(units);
    setMode(m);
    setPhase("playing");
    setResult(null);
  }

  function handleGameComplete(r: GameResult) {
    setResult({ score: r.score, max: r.maxScore });
    setPhase("done");
    onActivityComplete({
      subtype: "vocab",
      score: r.score,
      maxScore: r.maxScore,
      timeSeconds: r.timeSpent,
      termsFromUnits: sessionUnits,
    });
  }

  function handleDefinicionesComplete(score: number, total: number, time: number, units: number[]) {
    setResult({ score, max: total });
    setPhase("done");
    onActivityComplete({ subtype: "vocab", score, maxScore: total, timeSeconds: time, termsFromUnits: units });
  }

  if (drillItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
        <span className="text-4xl mb-4">🔒</span>
        <p className="font-display font-bold text-lg text-[#e8b455]">Sin datos todavía</p>
        <p className="font-typewriter text-xs text-[#8b7355] mt-2">
          Completa al menos una misión para desbloquear el vocabulario del gym.
        </p>
      </div>
    );
  }

  // ── Done screen ────────────────────────────────────────────────────────────

  if (phase === "done" && result) {
    const pct = Math.round((result.score / result.max) * 100);
    const star = pct >= 90 ? "🌟" : pct >= 70 ? "⭐" : "💪";
    return (
      <div className="max-w-md mx-auto p-6 space-y-5 text-center">
        <div className="py-8">
          <div className="text-6xl mb-3">{star}</div>
          <p className="font-display font-bold text-3xl text-[#e8b455]">
            {result.score} / {result.max}
          </p>
          <p className="font-typewriter text-sm text-[#8b7355] mt-1">{pct}% correcto</p>
          {todayDrills > 0 && (
            <p className="font-typewriter text-xs text-[#c9933a] mt-3">
              🔥 {todayDrills + 1} ejercicio(s) hoy · {todayMinutes} min practicados
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPhase("home")}
            className="flex-1 clip-skew py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            Otro ejercicio →
          </button>
        </div>
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────

  if (phase === "playing" && mode) {
    const { pairs, flashcards } = buildVocabDrillSets(drillItems, MODES.find((m) => m.id === mode)?.count ?? 16);
    const defQs = buildDefinicionesQuestions(drillItems, 12);

    return (
      <div>
        <div className="flex items-center justify-between px-5 py-2 border-b border-[rgba(201,147,58,0.1)] bg-[#0d0b0a]">
          <span className="font-typewriter text-[10px] uppercase text-[#8b7355]">
            {MODES.find((m) => m.id === mode)?.label}
          </span>
          <button
            onClick={() => setPhase("home")}
            className="font-typewriter text-[10px] text-[#4a3a2a] hover:text-[#8b7355] transition-colors"
          >
            ✕ Cancelar
          </button>
        </div>

        {mode === "vocabMatch" && (
          <VocabMatch key="gym-match" title="Memoria de Vocabulario" pairs={pairs} onComplete={handleGameComplete} />
        )}
        {mode === "flashcards" && (
          <TimedFlashcards key="gym-flash" title="Flash Rápido" cards={flashcards} timeLimit={60} onComplete={handleGameComplete} />
        )}
        {mode === "definiciones" && (
          <Definiciones key="gym-def" questions={defQs} onComplete={handleDefinicionesComplete} />
        )}
      </div>
    );
  }

  // ── Home ────────────────────────────────────────────────────────────────────

  const struggling = drillItems.filter((d) => d.accuracy < 0.6 && d.attempts >= 3);
  const unseen     = drillItems.filter((d) => d.attempts === 0);

  return (
    <div className="max-w-2xl mx-auto p-5 space-y-6">
      {/* Context card */}
      <div className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] p-4 flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">🥊</span>
        <div>
          <p className="font-display font-bold text-[#e8b455] text-sm">Gimnasio de Vocabulario</p>
          <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed mt-0.5">
            {weakFirst
              ? `${struggling.length} términos difíciles · ${unseen.length} términos nuevos · ${drillItems.length} total`
              : "Practica todo el vocabulario desbloqueado."
            }
          </p>
          {todayDrills > 0 && (
            <p className="font-typewriter text-[10px] text-[#c9933a] mt-1">
              ✓ {todayDrills} ejercicio(s) completado(s) hoy · {todayMinutes} minutos
            </p>
          )}
        </div>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => startMode(m.id)}
            className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] hover:border-[rgba(201,147,58,0.5)] hover:bg-[rgba(201,147,58,0.06)] transition-all p-5 text-left group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{m.emoji}</span>
              <span className="font-typewriter text-xs tracking-[0.2em] uppercase text-[#8b7355] group-hover:text-[#c9933a] transition-colors">
                {m.label}
              </span>
            </div>
            <p className="font-typewriter text-xs text-[#c4a882] leading-snug">{m.desc}</p>
            <p className="font-typewriter text-[10px] text-[#4a3a2a] mt-2">
              {m.count} {m.id === "flashcards" ? "tarjetas · 60 segundos" : "preguntas"}
            </p>
          </button>
        ))}
      </div>

      {/* Struggling terms preview */}
      {struggling.length > 0 && (
        <div className="border border-[rgba(192,57,43,0.2)] bg-[rgba(192,57,43,0.03)] p-4">
          <p className="font-typewriter text-[9px] tracking-[0.25em] uppercase text-[#c0392b] mb-3">
            ⚠ Términos difíciles — prioritarios en el ejercicio
          </p>
          <div className="flex flex-wrap gap-2">
            {struggling.slice(0, 8).map((d) => (
              <span key={d.spanish} className="font-typewriter text-xs px-2 py-1 border border-[rgba(192,57,43,0.25)] text-[#c4a882]">
                {d.spanish} <span className="text-[#c0392b]">{Math.round(d.accuracy * 100)}%</span>
              </span>
            ))}
            {struggling.length > 8 && (
              <span className="font-typewriter text-xs text-[#4a3a2a]">+{struggling.length - 8} más</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
