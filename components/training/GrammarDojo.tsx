"use client";

import { useState } from "react";
import { getGrammarDrillQuestions, type GrammarQuestion } from "@/lib/personalized-drills";
import { logItemEvent, flushItemEvents } from "@/lib/events";

interface ConceptSummary {
  id: string; labelEs: string; labelEn: string;
  unitNumbers: number[]; unlocked: boolean; accuracy: number | null;
}

interface Props {
  concepts: ConceptSummary[];
  onActivityComplete: (opts: {
    subtype: "grammar";
    score: number;
    maxScore: number;
    timeSeconds: number;
  }) => void;
}

type Feedback = "correct" | "wrong" | null;

function accuracyColor(n: number | null) {
  if (n === null) return "text-[#4a3a2a]";
  if (n >= 80) return "text-[#4ade80]";
  if (n >= 60) return "text-[#e8b455]";
  return "text-[#c0392b]";
}

function accuracyLabel(n: number | null) {
  if (n === null) return "Sin datos";
  if (n >= 80) return `${n}% ✓`;
  if (n >= 60) return `${n}% ◑`;
  return `${n}% ✗`;
}

// ── Drill component ────────────────────────────────────────────────────────────

function GrammarDrill({
  conceptId,
  labelEs,
  onDone,
}: {
  conceptId: string;
  labelEs: string;
  onDone: (score: number, total: number, time: number) => void;
}) {
  const questions: GrammarQuestion[] = getGrammarDrillQuestions(conceptId, 8);
  const [index, setIndex]       = useState(0);
  const [score, setScore]       = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [done, setDone]         = useState(false);
  const [startMs]               = useState(Date.now());

  const q = questions[index];

  function handleAnswer(i: number) {
    if (feedback || done) return;
    const correct = i === q.correctIndex;
    setFeedback(correct ? "correct" : "wrong");
    // Grammar event — item_key is the Dojo concept id, which also feeds the
    // concept_mastery ledger server-side (Workstream A3).
    logItemEvent({
      stageType: "dojo",
      skill: "grammar",
      itemKey: conceptId,
      correct,
      chosen: q.options[i] ?? null,
      expected: q.options[q.correctIndex] ?? null,
    });
    setTimeout(() => {
      const ns = correct ? score + 1 : score;
      setFeedback(null);
      const next = index + 1;
      if (next >= questions.length) {
        setDone(true);
        flushItemEvents();
        onDone(ns, questions.length, Math.round((Date.now() - startMs) / 1000));
      } else {
        if (correct) setScore(ns);
        setIndex(next);
      }
      if (correct) setScore(ns);
    }, correct ? 500 : 1400);
  }

  if (done) return null;

  const pct = Math.round((index / questions.length) * 100);

  return (
    <div className="max-w-lg mx-auto p-5 space-y-5">
      <div className="flex items-center justify-between">
        <span className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355]">{labelEs}</span>
        <span className="font-typewriter text-xs text-[#8b7355]">{index + 1}/{questions.length}</span>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-[#2c2220] rounded-full overflow-hidden">
        <div className="h-full bg-[#c9933a] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      {/* Prompt */}
      <div className={`border-2 p-6 text-center transition-all min-h-[100px] flex flex-col items-center justify-center ${
        feedback === "correct" ? "border-[#c9933a] bg-[rgba(201,147,58,0.1)]"
        : feedback === "wrong"  ? "border-[#c0392b] bg-[rgba(192,57,43,0.06)]"
        : "border-[rgba(201,147,58,0.2)] bg-[#1a1614]"
      }`}>
        <p className="font-display font-bold text-2xl text-[#f5e6c8]">{q.prompt}</p>
        {q.hint && feedback === null && (
          <p className="font-typewriter text-[10px] text-[#8b7355] italic mt-2">{q.hint}</p>
        )}
        {feedback === "wrong" && (
          <p className="font-typewriter text-xs text-[#e8b455] mt-2">
            Correcto: <span className="font-bold">{q.answer}</span>
          </p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          let style = "border-[rgba(201,147,58,0.15)] text-[#c4a882] hover:border-[rgba(201,147,58,0.5)]";
          if (feedback) {
            if (i === q.correctIndex) style = "border-[#c9933a] bg-[rgba(201,147,58,0.1)] text-[#e8b455]";
            else if (feedback === "wrong") style = "border-[rgba(201,147,58,0.06)] text-[#4a3a2a]";
          }
          return (
            <button key={i} disabled={!!feedback} onClick={() => handleAnswer(i)}
              className={`border px-4 py-3 font-typewriter text-sm text-left transition-all disabled:cursor-default ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <p className="font-typewriter text-[10px] text-center text-[#4a3a2a]">
        ✓ {score} correcta(s) hasta ahora
      </p>
    </div>
  );
}

// ── Drill result ────────────────────────────────────────────────────────────────

function DrillResult({ score, total, onAgain, onBack }: {
  score: number; total: number; onAgain: () => void; onBack: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 90 ? "🌟" : pct >= 70 ? "⭐" : "💪";
  return (
    <div className="max-w-md mx-auto p-6 text-center space-y-5">
      <div className="py-6">
        <div className="text-5xl mb-3">{emoji}</div>
        <p className="font-display font-bold text-3xl text-[#e8b455]">{score} / {total}</p>
        <p className="font-typewriter text-sm text-[#8b7355] mt-1">{pct}% correcto</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onAgain}
          className="flex-1 py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase border border-[rgba(201,147,58,0.3)] text-[#8b7355] hover:text-[#c9933a] hover:border-[rgba(201,147,58,0.5)] transition-colors">
          Repetir
        </button>
        <button onClick={onBack}
          className="flex-1 clip-skew py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors">
          Otro concepto →
        </button>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────────

export default function GrammarDojo({ concepts, onActivityComplete }: Props) {
  const [selected, setSelected] = useState<ConceptSummary | null>(null);
  const [drillKey, setDrillKey] = useState(0);
  const [drillResult, setDrillResult] = useState<{ score: number; total: number } | null>(null);

  function handleDrillDone(score: number, total: number, time: number) {
    setDrillResult({ score, total });
    onActivityComplete({ subtype: "grammar", score, maxScore: total, timeSeconds: time });
  }

  function startDrill(c: ConceptSummary) {
    setSelected(c);
    setDrillResult(null);
    setDrillKey((k) => k + 1);
  }

  const unlockedConcepts  = concepts.filter((c) => c.unlocked);
  const lockedConcepts    = concepts.filter((c) => !c.unlocked);

  // Drill view
  if (selected && !drillResult) {
    return (
      <div>
        <div className="flex items-center justify-between px-5 py-2 border-b border-[rgba(201,147,58,0.1)] bg-[#0d0b0a]">
          <span className="font-typewriter text-[10px] uppercase text-[#8b7355]">Dojo de Gramática</span>
          <button onClick={() => setSelected(null)}
            className="font-typewriter text-[10px] text-[#4a3a2a] hover:text-[#8b7355]">
            ✕ Cancelar
          </button>
        </div>
        <GrammarDrill key={drillKey} conceptId={selected.id} labelEs={selected.labelEs} onDone={handleDrillDone} />
      </div>
    );
  }

  if (selected && drillResult) {
    return (
      <DrillResult
        score={drillResult.score}
        total={drillResult.total}
        onAgain={() => startDrill(selected)}
        onBack={() => { setSelected(null); setDrillResult(null); }}
      />
    );
  }

  // Concept grid
  return (
    <div className="max-w-2xl mx-auto p-5 space-y-6">
      <div className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] p-4 flex items-start gap-3">
        <span className="text-xl shrink-0">🥋</span>
        <div>
          <p className="font-display font-bold text-[#e8b455] text-sm">Dojo de Gramática</p>
          <p className="font-typewriter text-xs text-[#8b7355] mt-0.5">
            Selecciona un concepto para practicarlo. Cada ejercicio tiene 8 preguntas.
          </p>
        </div>
      </div>

      {unlockedConcepts.length === 0 && (
        <div className="text-center py-12">
          <p className="font-typewriter text-sm text-[#4a3a2a]">Completa misiones para desbloquear conceptos.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {unlockedConcepts.map((c) => (
          <button
            key={c.id}
            onClick={() => startDrill(c)}
            className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] hover:border-[rgba(201,147,58,0.5)] hover:bg-[rgba(201,147,58,0.04)] transition-all p-4 text-left group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-typewriter text-xs text-[#f5e6c8] group-hover:text-[#e8b455] transition-colors">
                  {c.labelEs}
                </p>
                <p className="font-typewriter text-[10px] text-[#4a3a2a] mt-0.5">{c.labelEn}</p>
              </div>
              <span className={`font-typewriter text-xs shrink-0 ${accuracyColor(c.accuracy)}`}>
                {accuracyLabel(c.accuracy)}
              </span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {c.unitNumbers.map((n) => (
                <span key={n} className="font-typewriter text-[9px] px-1.5 py-0.5 border border-[rgba(201,147,58,0.15)] text-[#4a3a2a]">
                  U{n}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {lockedConcepts.length > 0 && (
        <div>
          <p className="font-typewriter text-[9px] tracking-widest uppercase text-[#4a3a2a] mb-3">
            Próximos conceptos — completa más misiones
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lockedConcepts.map((c) => (
              <div key={c.id}
                className="border border-[rgba(201,147,58,0.08)] bg-[#111] opacity-50 p-4 cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔒</span>
                  <p className="font-typewriter text-xs text-[#4a3a2a]">{c.labelEs}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
