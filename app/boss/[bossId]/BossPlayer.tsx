"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type {
  BossContent, BossState, BossDifficulty, EthicalChoiceKey, BossEndingDef,
  BossStageContent, BossReadingStage, BossListeningStage, BossChaseStage,
  BossInterrogationStage, BossLineupStage, BossSwipeSortStage, BossSentenceBuilderStage,
} from "@/lib/types/boss";
import type { GameResult } from "@/lib/games/types";
import type { BadgeType } from "@/lib/types/database";

import DifficultySelect from "@/components/boss/DifficultySelect";
import CollaborationToggle from "@/components/boss/CollaborationToggle";
import EthicalChoice from "@/components/boss/EthicalChoice";
import CodeBreaker from "@/components/boss/CodeBreaker";
import BadgeEarned from "@/components/games/BadgeEarned";
import ReadingComprehension from "@/components/games/ReadingComprehension";
import ListeningComprehension from "@/components/games/ListeningComprehension";
import ChaseMap from "@/components/games/ChaseMap";
import Interrogation from "@/components/games/Interrogation";
import SwipeSort from "@/components/games/SwipeSort";
import SentenceBuilder from "@/components/games/SentenceBuilder";
import LineupStage from "@/components/play/LineupStage";
import { buildSlots } from "@/lib/boss/slots";

interface Props {
  content: BossContent;
  initialState: BossState;
  displayName: string;
}

export default function BossPlayer({ content, initialState, displayName }: Props) {
  const router = useRouter();
  const slots = buildSlots(content);

  const [slotIndex, setSlotIndex] = useState<number>(() =>
    Math.max(0, Math.min(initialState.currentStage, slots.length - 1))
  );
  const [completed, setCompleted] = useState<boolean>(!!initialState.completedAt);
  const [difficulty, setDifficulty] = useState<BossDifficulty | null>(initialState.difficulty);
  const [partnerName, setPartnerName] = useState<string | null>(initialState.partnerName);
  const [ethicalChoice, setEthicalChoice] = useState<EthicalChoiceKey | null>(
    (initialState.ethicalChoices?.[0]?.choice as EthicalChoiceKey) ?? null
  );
  const [clues, setClues] = useState<string[]>([]);
  const [savedToast, setSavedToast] = useState(false);
  const [newBadges, setNewBadges] = useState<BadgeType[]>([]);
  const [stageScore, setStageScore] = useState(0);
  /** Sub-step inside one stage: listening→code, or sentence N of M. */
  const [subStep, setSubStep] = useState(0);

  const saveRef = useRef(false);
  const slot = slots[slotIndex];
  const diff = difficulty ?? "normal";

  const saveState = useCallback(async (updates: Record<string, unknown>) => {
    await fetch(`/api/boss/${content.id}/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  }, [content.id]);

  const advance = useCallback(async (extra: Record<string, unknown> = {}) => {
    setSubStep(0);
    setSlotIndex((cur) => {
      const next = Math.min(cur + 1, slots.length - 1);
      void saveState({ current_stage: next, ...extra });
      return next;
    });
  }, [slots.length, saveState]);

  async function handleBriefingConfirm() {
    if (!difficulty) return;
    await advance({ difficulty, partner_name: partnerName });
  }

  /** One completion path for every stage type. */
  async function completeStage(stage: BossStageContent, result?: GameResult) {
    if (stage.clueReward) {
      setClues((c) => (c.includes(stage.clueReward) ? c : [...c, stage.clueReward]));
    }
    if (result) setStageScore((s) => s + result.score);
    await advance();
  }

  async function handleEthicalChoice(key: EthicalChoiceKey, sentence?: string) {
    setEthicalChoice(key);
    await advance({ ethical_choices: JSON.stringify([{ stage: slotIndex, choice: key, sentence }]) });
  }

  async function handleResolutionComplete() {
    if (saveRef.current) return;
    saveRef.current = true;

    const key = ethicalChoice ?? "B";
    // Ending id comes from the boss's own content, not a hardcoded mapping.
    const ending = content.endings[key]?.id ?? content.endings.B?.id;

    const res = await fetch(`/api/boss/${content.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        difficulty: diff,
        ethicalChoice: key,
        finalEnding: ending,
        baseScore: stageScore,
        hadPartner: !!partnerName,
        partnerName,
      }),
    }).catch(() => null);

    if (res?.ok) {
      const data = (await res.json()) as { newBadges?: BadgeType[] };
      if (data.newBadges?.length) setNewBadges(data.newBadges);
    }
    setCompleted(true);
  }

  // ── Completed ──────────────────────────────────────────────────────────────
  if (completed) {
    const ending = content.endings[ethicalChoice ?? "B"];
    return (
      <div className="min-h-screen bg-[#0d0b0a] flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="text-6xl mb-2">🎯</div>
          <h1 className="font-display font-black text-4xl text-[#e8b455]">Operación Completada</h1>
          <p className="font-typewriter text-sm text-[#8b7355]">
            Desenlace: <span className="text-[#f5e6c8]">{ending?.title ?? "—"}</span>
          </p>
          {newBadges.length > 0 && <BadgeEarned badges={newBadges} onDismiss={() => setNewBadges([])} />}
          <button
            onClick={() => router.push("/mission-board")}
            className="clip-skew px-8 py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            ← Volver al tablero
          </button>
        </div>
      </div>
    );
  }

  /** Render whichever mechanic this stage declares. */
  function renderStage(stage: BossStageContent) {
    const title = `${stage.country}: ${stage.title}`;

    switch (stage.type) {
      case "readingComp": {
        const st = stage as BossReadingStage;
        return (
          <ReadingComprehension
            key={`s${slotIndex}`} title={title} passage={st.passage} glossary={st.glossary}
            questions={st.questions[diff]} unitId=""
            onComplete={(r) => void completeStage(st, r)}
          />
        );
      }
      case "lineup": {
        const st = stage as BossLineupStage;
        return (
          <LineupStage
            key={`s${slotIndex}`}
            suspects={st.suspects[diff].map((s) => ({
              id: s.id, name: s.name, realName: s.realName, age: s.age,
              description: s.description, imageSeed: s.imageSeed, imageUrl: s.imageUrl,
            }))}
            correctSuspectId={st.correctSuspectId} hint={st.hint} earnedClues={clues}
            onComplete={() => void completeStage(st)}
          />
        );
      }
      case "chaseMap": {
        const st = stage as BossChaseStage;
        return (
          <ChaseMap
            key={`s${slotIndex}`} locations={st.locations} correctRoute={st.correctRoute} clues={st.clues}
            wrongPenalty={diff === "hard" ? (st.wrongPenalty ?? 15) + 10 : st.wrongPenalty}
            onComplete={(r) => void completeStage(st, r)}
          />
        );
      }
      case "interrogation": {
        const st = stage as BossInterrogationStage;
        return (
          <Interrogation
            key={`s${slotIndex}`} character={st.character} questionBank={st.questionBank}
            requiredInfo={st.requiredInfo}
            maxQuestions={diff === "hard" ? st.maxQuestions - 1 : st.maxQuestions + (diff === "easy" ? 2 : 0)}
            unitId="" onComplete={() => void completeStage(st)}
          />
        );
      }
      case "swipeSort": {
        const st = stage as BossSwipeSortStage;
        return (
          <SwipeSort
            key={`s${slotIndex}`} title={title} prompt={st.prompt}
            leftLabel={st.leftLabel} leftHint={st.leftHint}
            rightLabel={st.rightLabel} rightHint={st.rightHint}
            items={st.items} unitId=""
            onComplete={(r) => void completeStage(st, r)}
          />
        );
      }
      case "sentenceBuilder": {
        // SentenceBuilder takes one sentence, so walk the list with subStep.
        const st = stage as BossSentenceBuilderStage;
        const idx = Math.min(subStep, st.sentences.length - 1);
        const line = st.sentences[idx];
        const last = idx >= st.sentences.length - 1;
        return (
          <SentenceBuilder
            key={`s${slotIndex}-${idx}`}
            title={`${title} (${idx + 1}/${st.sentences.length})`}
            sentence={line.sentence} translation={line.translation} unitId=""
            onComplete={(r) => {
              if (last) { void completeStage(st, r); }
              else { setStageScore((s) => s + r.score); setSubStep((n) => n + 1); }
            }}
          />
        );
      }
      case "listeningComp": {
        // Eclipse follows listening with a code breaker. Only do that when the
        // stage actually defines a code — other bosses need not have one.
        const st = stage as BossListeningStage;
        const hasCode = Boolean(st.codeAnswer);
        if (!hasCode || subStep === 0) {
          return (
            <ListeningComprehension
              key={`s${slotIndex}-listen`} title={title} audioUrl={st.audioUrl}
              transcript={st.transcript} translation={st.translation} questions={st.questions}
              maxReplays={diff === "hard" ? 1 : st.maxReplays} passingScore={0.6} unitId=""
              onComplete={(r) => {
                setStageScore((s) => s + r.score);
                if (hasCode) setSubStep(1); else void completeStage(st);
              }}
            />
          );
        }
        return (
          <CodeBreaker
            key={`s${slotIndex}-code`} hint={st.codeHint} answer={st.codeAnswer}
            onComplete={() => void completeStage(st)}
          />
        );
      }
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0b0a] flex flex-col">
      <header className="shrink-0 border-b border-[rgba(192,57,43,0.3)] bg-[#110808] px-5 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎯</span>
          <div>
            <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b4a4a]">
              Misión Especial · {displayName}
            </p>
            <p className="font-display font-bold text-sm text-[#f5a0a0]">{content.title}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          {slots.map((sl, i) => (
            <div key={i} title={sl.label}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < slotIndex ? "bg-[#c9933a]"
                : i === slotIndex ? "bg-[#c0392b] shadow-[0_0_6px_rgba(192,57,43,0.8)] scale-110"
                : "bg-[#2c1a1a]"
              }`}
            />
          ))}
          <span className="font-typewriter text-[9px] text-[#8b4a4a] ml-1">{slot?.label}</span>
        </div>

        <button onClick={() => router.push("/mission-board")}
          className="font-typewriter text-[10px] tracking-widest uppercase text-[#4a2a2a] hover:text-[#8b4a4a] transition-colors">
          Salir →
        </button>
      </header>

      {savedToast && (
        <div className="fixed bottom-4 right-4 z-50 font-typewriter text-xs bg-[#1a1614] border border-[rgba(201,147,58,0.3)] text-[#c9933a] px-4 py-2 shadow-lg">
          ✓ Progreso guardado
        </div>
      )}

      {clues.length > 0 && slot?.kind !== "briefing" && (
        <div className="shrink-0 border-b border-[rgba(192,57,43,0.15)] bg-[#130808] px-5 py-2">
          <div className="flex items-start gap-2 overflow-x-auto">
            <span className="font-typewriter text-[9px] uppercase text-[#8b4a4a] shrink-0 mt-0.5">Pistas:</span>
            {clues.map((c, i) => (
              <span key={i} className="font-typewriter text-[10px] text-[#c4a882] border border-[rgba(192,57,43,0.2)] px-2 py-0.5 shrink-0">
                {i + 1}. {c}
              </span>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto">
        {slot?.kind === "briefing" && (
          <div className="max-w-xl mx-auto px-5 py-8 space-y-6">
            <div className="text-center mb-6">
              <p className="font-typewriter text-[9px] tracking-[0.4em] uppercase text-[#c0392b] mb-1">Misión Especial</p>
              <h2 className="font-display font-black text-3xl text-[#f5e6c8]">{content.title}</h2>
              <p className="font-typewriter text-xs text-[#8b7355] mt-2">{content.description}</p>
            </div>

            <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5 flex gap-4">
              <div className="w-14 h-14 shrink-0 overflow-hidden rounded-full border border-[rgba(201,147,58,0.3)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://i.pravatar.cc/300?img=60" alt="Chief" className="w-full h-full object-cover grayscale" />
              </div>
              <div>
                <p className="font-typewriter text-[10px] uppercase text-[#8b7355] mb-1">Jefa Ramírez</p>
                <p className="font-typewriter text-sm text-[#c4a882] leading-relaxed italic">
                  &ldquo;{content.briefingLine ??
                    "Recluta, esta operación es peligrosa. Necesitarás todo lo que aprendiste. ¿Cómo prefieres atacarla?"}&rdquo;
                </p>
              </div>
            </div>

            <DifficultySelect selected={difficulty} onChange={setDifficulty} />
            <CollaborationToggle partnerName={partnerName} onChange={setPartnerName} />

            <div className="border border-[rgba(201,147,58,0.1)] bg-[rgba(201,147,58,0.04)] p-4">
              <p className="font-typewriter text-[10px] text-[#8b7355]">
                ✅ El progreso se guarda automáticamente después de cada etapa.
                Puedes salir y volver cuando quieras.
              </p>
            </div>

            <button disabled={!difficulty} onClick={handleBriefingConfirm}
              className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40">
              Comenzar operación →
            </button>
          </div>
        )}

        {slot?.kind === "stage" && renderStage(content.stages[slot.stageIndex])}

        {slot?.kind === "ethical" && (
          <EthicalChoice choice={content.ethicalChoice} onSelect={handleEthicalChoice} />
        )}

        {slot?.kind === "resolution" && (
          <BossResolution
            bossTitle={content.title}
            ending={content.endings[ethicalChoice ?? "B"]}
            choice={ethicalChoice ?? "B"}
            difficulty={diff}
            partnerName={partnerName}
            onComplete={handleResolutionComplete}
          />
        )}
      </main>

      {newBadges.length > 0 && <BadgeEarned badges={newBadges} onDismiss={() => setNewBadges([])} />}
    </div>
  );
}

// ── Resolution sub-component ──────────────────────────────────────────────────

function BossResolution({ bossTitle, ending, choice, difficulty, partnerName, onComplete }: {
  bossTitle: string;
  ending: BossEndingDef;
  choice: EthicalChoiceKey;
  difficulty: BossDifficulty;
  partnerName: string | null;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);

  const difficultyBadge = difficulty === "hard" ? "🔥 Agente Élite" : difficulty === "normal" ? "⚡ Agente Estándar" : "🔍 Agente Cuidadoso";
  const choiceBadge = choice === "A" ? "🕊️ Diplomático" : choice === "C" ? "🤝 Maestro Negociador" : "⚖️ Cazador Implacable";

  const lines = ending?.description ?? [];

  return (
    <div className="max-w-lg mx-auto px-5 py-8 space-y-6">
      <div className="text-center">
        <p className="font-typewriter text-[9px] tracking-[0.4em] uppercase text-[#c0392b] mb-1">Resolución</p>
        <h2 className="font-display font-black text-3xl text-[#e8b455]">{ending?.title ?? "—"}</h2>
      </div>

      {/* Story lines revealed one at a time */}
      <div className="space-y-3">
        {lines.slice(0, step + 1).map((line, i) => (
          <div key={i} className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] p-4">
            <p className="font-typewriter text-sm text-[#c4a882] leading-relaxed">{line}</p>
          </div>
        ))}
      </div>

      {/* Final clue reveal */}
      {step >= lines.length && ending?.finalClue && (
        <div className="border border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)] p-5">
          <p className="font-typewriter text-[9px] uppercase text-[#c0392b] mb-2">🔍 Pista final</p>
          <p className="font-typewriter text-sm text-[#f5e6c8] leading-relaxed italic">
            &ldquo;{ending.finalClue}&rdquo;
          </p>
        </div>
      )}

      {/* Rewards */}
      {step >= lines.length && (
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-4 space-y-2">
          <p className="font-typewriter text-[9px] uppercase text-[#8b7355] mb-2">Insignias ganadas</p>
          <p className="font-typewriter text-sm text-[#c9933a]">🎯 {bossTitle} Completada</p>
          <p className="font-typewriter text-sm text-[#c9933a]">{difficultyBadge}</p>
          <p className="font-typewriter text-sm text-[#c9933a]">{choiceBadge}</p>
          {partnerName && (
            <p className="font-typewriter text-xs text-[#8b7355]">+100 puntos de colaboración con {partnerName}</p>
          )}
        </div>
      )}

      <button
        onClick={() => {
          if (step < lines.length) setStep((s) => s + 1);
          else onComplete();
        }}
        className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
      >
        {step < lines.length ? "Continuar →" : "Completar misión →"}
      </button>
    </div>
  );
}
