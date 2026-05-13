"use client";

import { useState, useCallback } from "react";
import GameShell from "./GameShell";
import { useGameTimer } from "@/lib/hooks/useGameTimer";
import { useAttemptTracker } from "@/lib/hooks/useAttemptTracker";
import { checkAnswer } from "@/lib/games/utils";
import type { GlossaryEntry, ReadingQuestion, OnComplete } from "@/lib/games/types";

interface Props {
  title?: string;
  passage: string;
  glossary?: GlossaryEntry[];
  questions: ReadingQuestion[];
  unitId?: string;
  onComplete: OnComplete;
}

// Render passage text with clickable glossary words
function GlossaryPassage({ passage, glossary = [] }: { passage: string; glossary: GlossaryEntry[] }) {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const glossaryMap = new Map(glossary.map((g) => [g.word.toLowerCase(), g.translation]));

  // Tokenize: split on spaces but keep punctuation attached to words
  const tokens = passage.split(/(\s+)/);

  return (
    <p className="font-typewriter text-sm text-[#c4a882] leading-relaxed">
      {tokens.map((token, i) => {
        const bare = token.replace(/[¿?¡!.,;:"""''()]/g, "").toLowerCase();
        const translation = glossaryMap.get(bare);
        if (!translation) return <span key={i}>{token}</span>;

        const isActive = activeWord === bare;
        return (
          <span key={i} className="relative inline-block">
            <button
              onClick={() => setActiveWord(isActive ? null : bare)}
              className="font-bold text-[#e8b455] border-b border-dashed border-[#c9933a] hover:text-[#f5e6c8] transition-colors focus:outline-none focus:ring-1 focus:ring-[#c9933a] rounded-sm"
              aria-label={`${token}: ${translation}`}
            >
              {token}
            </button>
            {isActive && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 px-2 py-1 bg-[#2c2220] border border-[rgba(201,147,58,0.4)] font-typewriter text-[11px] text-[#f5e6c8] whitespace-nowrap shadow-lg">
                {translation}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#2c2220]" />
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
}

// Single question component
function QuestionItem({
  question,
  index,
  submitted,
  onAnswer,
}: {
  question: ReadingQuestion;
  index: number;
  submitted: boolean;
  onAnswer: (qId: string, value: string | number, isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [shortInput, setShortInput] = useState("");
  const [result, setResult] = useState<boolean | null>(null);

  function handleMCSelect(i: number) {
    if (submitted) return;
    setSelected(i);
    if (question.type === "multiple_choice") {
      const isCorrect = i === question.correctIndex;
      setResult(isCorrect);
      onAnswer(question.id, i, isCorrect);
    }
  }

  function handleShortAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (question.type !== "short_answer" || submitted) return;
    const isCorrect = checkAnswer(shortInput, question.acceptableAnswers);
    setResult(isCorrect);
    onAnswer(question.id, shortInput, isCorrect);
  }

  return (
    <div className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] p-4 rounded-sm">
      <p className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] mb-1">
        Pregunta {index + 1}
      </p>
      <p className="font-display text-base text-[#f5e6c8] mb-3">{question.text}</p>

      {question.type === "multiple_choice" && (
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            let style = "border-[rgba(201,147,58,0.2)] bg-[#110f0d] text-[#c4a882] hover:border-[rgba(201,147,58,0.4)]";
            if (selected !== null) {
              if (i === question.correctIndex) style = "border-[#c9933a] bg-[rgba(201,147,58,0.1)] text-[#e8b455]";
              else if (i === selected && i !== question.correctIndex) style = "border-[#c0392b] bg-[rgba(192,57,43,0.08)] text-[#c0392b] opacity-80";
              else style = "border-[rgba(201,147,58,0.1)] bg-[#110f0d] text-[#4a3a2a] opacity-50";
            }
            return (
              <button
                key={i}
                onClick={() => handleMCSelect(i)}
                disabled={selected !== null}
                className={`w-full text-left px-3 py-2 border font-typewriter text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c9933a] focus:ring-offset-1 focus:ring-offset-[#0d0b0a] ${style}`}
              >
                <span className="text-[#8b7355] mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {question.type === "short_answer" && (
        <form onSubmit={handleShortAnswer} className="flex gap-2">
          <input
            type="text"
            value={shortInput}
            onChange={(e) => setShortInput(e.target.value)}
            disabled={result !== null}
            placeholder="Write your answer…"
            className="flex-1 bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-3 py-2 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!shortInput.trim() || result !== null}
            className="px-4 py-2 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40"
          >
            OK
          </button>
        </form>
      )}

      {result !== null && (
        <p className={`font-typewriter text-xs mt-2 ${result ? "text-[#c9933a]" : "text-[#c0392b]"}`}>
          {result
            ? "✓ Correct!"
            : question.type === "short_answer"
            ? `✗ Acceptable: ${question.acceptableAnswers[0]}`
            : "✗ Incorrect"}
        </p>
      )}
    </div>
  );
}

export default function ReadingComprehension({
  title = "Comprensión Lectora",
  passage,
  glossary = [],
  questions,
  unitId,
  onComplete,
}: Props) {
  const { elapsed, stop } = useGameTimer();
  const { recordAttempt, updateMastery } = useAttemptTracker("dialogue", unitId);

  const [answers, setAnswers] = useState<Record<string, { value: string | number; isCorrect: boolean }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<"playing" | "complete">("playing");

  const finish = useCallback(
    (correct: number, t: number) => {
      stop();
      setStatus("complete");
      recordAttempt(correct, questions.length, t);
      onComplete({ score: correct, maxScore: questions.length, timeSpent: t, attempts: 1 });
    },
    [stop, recordAttempt, questions.length, onComplete]
  );

  function handleAnswer(qId: string, value: string | number, isCorrect: boolean) {
    setAnswers((prev) => ({ ...prev, [qId]: { value, isCorrect } }));
    // Track glossary word mastery for short answers
    if (typeof value === "string") updateMastery(value, isCorrect);
  }

  function handleSubmitAll() {
    const correct = Object.values(answers).filter((a) => a.isCorrect).length;
    setSubmitted(true);
    finish(correct, elapsed);
  }

  const answeredCount = Object.keys(answers).length;
  const correct = Object.values(answers).filter((a) => a.isCorrect).length;

  return (
    <GameShell
      title={title}
      elapsed={elapsed}
      status={status}
      onSkip={() => {
        stop();
        setStatus("complete");
        const c = Object.values(answers).filter((a) => a.isCorrect).length;
        const r = { score: c, maxScore: questions.length, timeSpent: elapsed, attempts: 1, isSkipped: true };
        recordAttempt(c, questions.length, elapsed);
        onComplete(r);
        return r;
      }}
    >
      <div className="p-5 max-w-2xl mx-auto flex flex-col gap-5">
        {/* Passage */}
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5 rounded-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">Lectura</p>
            {glossary.length > 0 && (
              <p className="font-typewriter text-[9px] text-[#8b7355]">
                Tap <span className="text-[#e8b455] border-b border-dashed border-[#c9933a]">highlighted words</span> for definitions
              </p>
            )}
          </div>
          <GlossaryPassage passage={passage} glossary={glossary} />
        </div>

        {/* Questions */}
        <div className="space-y-3">
          <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">
            Preguntas — {answeredCount}/{questions.length} answered
          </p>
          {questions.map((q, i) => (
            <QuestionItem
              key={q.id}
              question={q}
              index={i}
              submitted={submitted}
              onAnswer={handleAnswer}
            />
          ))}
        </div>

        {/* Submit */}
        {!submitted && answeredCount === questions.length && status === "playing" && (
          <button
            onClick={handleSubmitAll}
            className="clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            Ver resultados →
          </button>
        )}

        {/* Result */}
        {submitted && (
          <div className="border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] p-5 text-center">
            <p className="font-display text-xl font-bold text-[#e8b455]">
              {correct}/{questions.length} correcto{correct !== 1 ? "s" : ""}
            </p>
            <p className="font-typewriter text-xs text-[#8b7355] mt-1">{elapsed}s</p>
          </div>
        )}
      </div>
    </GameShell>
  );
}
