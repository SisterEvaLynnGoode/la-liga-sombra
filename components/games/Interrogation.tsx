"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { QuestionItem, InterrogationCharacter } from "@/lib/types/unit-content";
import type { OnComplete } from "@/lib/games/types";
import SkipStageButton from "./SkipStageButton";
import CharacterPortrait from "@/components/CharacterPortrait";

interface Props {
  character: InterrogationCharacter;
  questionBank: QuestionItem[];
  requiredInfo: string[];
  maxQuestions: number;
  unitId?: string;
  onComplete: OnComplete;
}

// ── Notepad component ─────────────────────────────────────────────────────────
function Notepad({
  revealedInfo,
  requiredInfo,
  justRevealedId,
}: {
  revealedInfo: string[];
  requiredInfo: string[];
  justRevealedId: string | null;
}) {
  const foundRequired = requiredInfo.filter((r) => revealedInfo.includes(r));
  const extraInfo = revealedInfo.filter((r) => !requiredInfo.includes(r));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355]">
          📋 Mis notas
        </p>
        <span className="font-typewriter text-[10px] text-[#c9933a]">
          {foundRequired.length}/{requiredInfo.length} pistas clave
        </span>
      </div>

      {/* Required info slots */}
      <div className="space-y-2 mb-3">
        {requiredInfo.map((info) => {
          const found = revealedInfo.includes(info);
          const isNew = found && info === justRevealedId;
          return (
            <div
              key={info}
              className={`flex items-start gap-2 px-3 py-2 border transition-all duration-500 ${
                found
                  ? isNew
                    ? "border-[#c9933a] bg-[rgba(201,147,58,0.12)] shadow-[0_0_8px_rgba(201,147,58,0.2)]"
                    : "border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)]"
                  : "border-[rgba(201,147,58,0.1)] bg-[#0d0b0a]"
              }`}
            >
              <span
                className={`shrink-0 font-typewriter text-xs mt-0.5 ${
                  found ? "text-[#c9933a]" : "text-[#3a2a1a]"
                }`}
              >
                {found ? "✓" : "?"}
              </span>
              <p
                className={`font-typewriter text-[10px] leading-snug ${
                  found ? "text-[#c4a882]" : "text-[#3a2a1a] italic"
                }`}
              >
                {found ? info : "Pista sin descubrir..."}
              </p>
            </div>
          );
        })}
      </div>

      {/* Extra (non-required) info */}
      {extraInfo.length > 0 && (
        <div className="border-t border-[rgba(201,147,58,0.1)] pt-2 space-y-1.5">
          {extraInfo.map((info) => (
            <div key={info} className="flex items-start gap-2">
              <span className="text-[#8b7355] text-xs shrink-0">•</span>
              <p className="font-typewriter text-[10px] text-[#8b7355] leading-snug">{info}</p>
            </div>
          ))}
        </div>
      )}

      {revealedInfo.length === 0 && (
        <p className="font-typewriter text-[10px] text-[#3a2a1a] italic">
          Haz preguntas para llenar el cuaderno de notas...
        </p>
      )}
    </div>
  );
}

// ── Response bubble ───────────────────────────────────────────────────────────
function ResponseBubble({
  question,
  showTranslation,
  onToggleTranslation,
  isUseful,
}: {
  question: QuestionItem;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  isUseful: boolean;
}) {
  return (
    <div className="space-y-2">
      {/* Asked question (in gold) */}
      <div className="flex items-start gap-2">
        <span className="font-typewriter text-[9px] text-[#8b7355] shrink-0 mt-0.5">TÚ:</span>
        <p className="font-typewriter text-[10px] text-[#8b7355] italic leading-snug">
          {question.spanish}
        </p>
      </div>

      {/* Character response bubble */}
      <div
        className={`relative border px-3 py-2.5 ${
          isUseful
            ? "border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.04)]"
            : "border-[rgba(139,115,85,0.2)] bg-[#0d0b0a]"
        }`}
      >
        {/* Speech tail */}
        <div className="absolute -top-1.5 left-4 w-3 h-3 border-l border-t border-[rgba(201,147,58,0.3)] bg-[#110f0d] rotate-45" />

        <p className="font-typewriter text-xs text-[#c4a882] leading-relaxed">
          {showTranslation ? question.responseEnglish : question.response}
        </p>

        <div className="flex items-center justify-between mt-2">
          <button
            onClick={onToggleTranslation}
            className="flex items-center gap-1 font-typewriter text-[9px] text-[#8b7355] hover:text-[#c9933a] transition-colors"
            title={showTranslation ? "Ver en español" : "Ver traducción"}
          >
            <span>🌐</span>
            <span>{showTranslation ? "Español" : "Traducir"}</span>
          </button>
          {isUseful && (
            <span className="font-typewriter text-[9px] text-[#c9933a]">
              📋 Anotado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Interrogation({
  character,
  questionBank,
  requiredInfo,
  maxQuestions,
  unitId,
  onComplete,
}: Props) {
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [revealedInfo, setRevealedInfo] = useState<string[]>([]);
  const [lastQuestion, setLastQuestion] = useState<QuestionItem | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [justRevealedId, setJustRevealedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"playing" | "wrapping" | "complete">("playing");
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const startTime = useRef(Date.now());

  const questionsUsed = askedIds.length;
  const questionsRemaining = maxQuestions - questionsUsed;
  const foundRequired = revealedInfo.filter((r) => requiredInfo.includes(r));
  const allRequiredFound = foundRequired.length >= requiredInfo.length;

  // ── Finish the interrogation ──────────────────────────────────────────────
  const finishInterrogation = useCallback(
    (msg?: string) => {
      if (status !== "playing") return;
      setStatus("wrapping");
      setEndMessage(msg ?? null);
      setTimeout(() => {
        setStatus("complete");
        onComplete({
          score: foundRequired.length,
          maxScore: requiredInfo.length,
          timeSpent: Math.round((Date.now() - startTime.current) / 1000),
          attempts: questionsUsed,
        });
      }, 1800);
    },
    [status, foundRequired.length, requiredInfo.length, questionsUsed, onComplete]
  );

  // ── Auto-complete when all required info gathered ────────────────────────
  useEffect(() => {
    if (allRequiredFound && status === "playing" && lastQuestion !== null) {
      finishInterrogation("¡Excelente! Tienes toda la información necesaria.");
    }
  }, [allRequiredFound, status, lastQuestion, finishInterrogation]);

  // ── Auto-complete when out of questions ──────────────────────────────────
  useEffect(() => {
    if (questionsRemaining <= 0 && status === "playing" && lastQuestion !== null) {
      finishInterrogation("Se acabaron las preguntas disponibles.");
    }
  }, [questionsRemaining, status, lastQuestion, finishInterrogation]);

  // ── Ask a question ────────────────────────────────────────────────────────
  function handleAskQuestion(q: QuestionItem) {
    if (askedIds.includes(q.id) || questionsRemaining <= 0 || status !== "playing") return;

    setAskedIds((prev) => [...prev, q.id]);
    setLastQuestion(q);
    setShowTranslation(false);

    if (q.infoRevealed && !revealedInfo.includes(q.infoRevealed)) {
      setRevealedInfo((prev) => [...prev, q.infoRevealed!]);
      setJustRevealedId(q.infoRevealed!);
      setTimeout(() => setJustRevealedId(null), 2500);
    }
  }

  // portrait variable removed — using CharacterPortrait component below

  // ── Wrapping / complete feedback ──────────────────────────────────────────
  if (status === "wrapping" || status === "complete") {
    const allFound = foundRequired.length >= requiredInfo.length;
    return (
      <div className="min-h-[320px] flex flex-col items-center justify-center p-8 gap-5">
        <div className="text-4xl">{allFound ? "✅" : "📋"}</div>
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-[#e8b455] mb-1">
            {allFound ? "Interrogación completada" : "Interrogación concluida"}
          </p>
          <p className="font-typewriter text-sm text-[#8b7355]">
            {endMessage ?? "Interrogación finalizada."}
          </p>
        </div>
        <div className="border border-[rgba(201,147,58,0.25)] bg-[rgba(201,147,58,0.04)] px-6 py-3 text-center">
          <p className="font-typewriter text-xs text-[#c4a882]">
            Pistas clave encontradas: {foundRequired.length}/{requiredInfo.length} ·{" "}
            Preguntas usadas: {questionsUsed}/{maxQuestions}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[520px] bg-[#0d0b0a]">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[rgba(201,147,58,0.12)] bg-[#110f0d]">
        <div>
          <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#c9933a]">
            Interrogatorio · {character.name}
          </p>
          <p className="font-typewriter text-[9px] text-[#8b7355] mt-0.5">
            {character.role}
          </p>
        </div>

        {/* Questions remaining indicator */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-1">
            {Array.from({ length: maxQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 border rounded-full transition-colors ${
                  i < questionsUsed
                    ? "bg-[#8b1a1a] border-[#c0392b]"
                    : "bg-transparent border-[rgba(201,147,58,0.3)]"
                }`}
              />
            ))}
          </div>
          <p className="font-typewriter text-[9px] text-[#8b7355]">
            {questionsRemaining} pregunta{questionsRemaining !== 1 ? "s" : ""} restante{questionsRemaining !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Skip strip */}
      {status === "playing" && (
        <div className="shrink-0 border-b border-[rgba(201,147,58,0.08)] bg-[#0f0d0b] py-2 px-4">
          <SkipStageButton
            stageName="Interrogatorio"
            unitId={unitId}
            onSkip={() => finishInterrogation("Interrogatorio saltado.")}
          />
        </div>
      )}

      {/* ── Main area: character + notepad ─────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 divide-x divide-[rgba(201,147,58,0.08)]">
        {/* Character panel */}
        <div className="w-2/5 flex flex-col p-4 gap-3 overflow-y-auto">
          {/* Portrait */}
          <div className="relative">
            <CharacterPortrait
              imageUrl={character.imageUrl ?? undefined}
              altText={character.name}
              name={character.name}
              role={character.role}
              size="medium"
              grayscale
              unitId={unitId}
              className="w-full"
            />
            {/* Name badge */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent px-2 py-1.5 pointer-events-none">
              <p className="font-display font-bold text-sm text-[#e8b455] leading-none">
                {character.name}
              </p>
              <p className="font-typewriter text-[9px] text-[#8b7355]">{character.role}</p>
            </div>
          </div>

          {/* Character description */}
          <p className="font-typewriter text-[10px] text-[#8b7355] leading-snug border-l-2 border-[rgba(201,147,58,0.2)] pl-2">
            {character.description}
          </p>

          {/* Response area */}
          <div className="flex-1 min-h-[80px]">
            {lastQuestion ? (
              <ResponseBubble
                question={lastQuestion}
                showTranslation={showTranslation}
                onToggleTranslation={() => setShowTranslation((v) => !v)}
                isUseful={lastQuestion.isUseful}
              />
            ) : (
              <div className="border border-dashed border-[rgba(201,147,58,0.1)] px-3 py-4 text-center">
                <p className="font-typewriter text-[10px] text-[#3a2a1a] italic">
                  Selecciona una pregunta para comenzar la interrogación.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notepad panel */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#0f0d0b]">
          <Notepad
            revealedInfo={revealedInfo}
            requiredInfo={requiredInfo}
            justRevealedId={justRevealedId}
          />
        </div>
      </div>

      {/* ── Question bank ───────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[rgba(201,147,58,0.12)] bg-[#110f0d]">
        <div className="px-4 pt-3 pb-1">
          <p className="font-typewriter text-[9px] tracking-[0.25em] uppercase text-[#8b7355]">
            Preguntas disponibles — haz clic para preguntar:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 px-4 pb-3 max-h-48 overflow-y-auto">
          {questionBank.map((q) => {
            const asked = askedIds.includes(q.id);
            const disabled = asked || questionsRemaining <= 0;
            return (
              <button
                key={q.id}
                onClick={() => handleAskQuestion(q)}
                disabled={disabled}
                className={`
                  text-left px-3 py-2 border font-typewriter text-[10px] leading-snug
                  transition-all focus:outline-none focus:ring-1 focus:ring-[#c9933a] rounded-sm
                  ${asked
                    ? "border-[rgba(201,147,58,0.1)] bg-transparent text-[#3a2a1a] line-through cursor-default"
                    : questionsRemaining <= 0
                    ? "border-[rgba(201,147,58,0.1)] bg-transparent text-[#3a2a1a] cursor-not-allowed opacity-50"
                    : "border-[rgba(201,147,58,0.2)] bg-[#1a1614] text-[#c4a882] hover:border-[rgba(201,147,58,0.5)] hover:bg-[rgba(201,147,58,0.04)] cursor-pointer"
                  }
                `}
              >
                {asked && (
                  <span className="text-[#c9933a] not-italic no-underline mr-1">✓</span>
                )}
                {q.spanish}
              </button>
            );
          })}
        </div>

        {/* Concluir button */}
        {questionsUsed >= 2 && (
          <div className="px-4 pb-3">
            <button
              onClick={() => finishInterrogation("Interrogación concluida por el agente.")}
              className="w-full clip-skew py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
            >
              Concluir interrogación →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
