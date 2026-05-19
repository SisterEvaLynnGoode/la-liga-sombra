"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { BossContent, BossState, BossDifficulty, EthicalChoiceKey, BossEnding, BossPhase } from "@/lib/types/boss";
import type { GameResult } from "@/lib/games/types";

import DifficultySelect from "@/components/boss/DifficultySelect";
import CollaborationToggle from "@/components/boss/CollaborationToggle";
import EthicalChoice from "@/components/boss/EthicalChoice";
import CodeBreaker from "@/components/boss/CodeBreaker";
import BadgeEarned from "@/components/games/BadgeEarned";
import ReadingComprehension from "@/components/games/ReadingComprehension";
import ListeningComprehension from "@/components/games/ListeningComprehension";
import ChaseMap from "@/components/games/ChaseMap";
import Interrogation from "@/components/games/Interrogation";
import type { BadgeType } from "@/lib/types/database";
import type {
  BossReadingStage, BossListeningStage, BossChaseStage,
  BossInterrogationStage, BossLineupStage,
} from "@/lib/types/boss";

// Inline lineup component (re-uses existing LineupStage logic inline for boss)
import LineupStage from "@/components/play/LineupStage";

interface Props {
  content: BossContent;
  initialState: BossState;
  displayName: string;
}

const PHASE_ORDER: BossPhase[] = [
  "briefing",
  "stage1", "stage2", "stage3", "stage4",
  "ethical_choice",
  "stage5",
  "resolution",
];

const PHASE_LABELS: Record<BossPhase, string> = {
  briefing: "Briefing",
  stage1: "México",
  stage2: "Puerto Rico",
  stage3: "España",
  stage4: "Costa Rica",
  ethical_choice: "Decisión",
  stage5: "Argentina",
  resolution: "Resolución",
  completed: "Completado",
};

export default function BossPlayer({ content, initialState, displayName }: Props) {
  const router = useRouter();

  // Derive initial phase from currentStage
  function stageToPhase(stage: number): BossPhase {
    return PHASE_ORDER[Math.min(stage, PHASE_ORDER.length - 1)];
  }

  const [phase, setPhase] = useState<BossPhase>(() => {
    if (initialState.completedAt) return "completed";
    return stageToPhase(initialState.currentStage);
  });
  const [difficulty, setDifficulty]   = useState<BossDifficulty | null>(initialState.difficulty);
  const [partnerName, setPartnerName] = useState<string | null>(initialState.partnerName);
  const [ethicalChoice, setEthicalChoice] = useState<EthicalChoiceKey | null>(
    initialState.ethicalChoices?.[0]?.choice as EthicalChoiceKey ?? null
  );
  const [clues, setClues]         = useState<string[]>([]);
  const [savedToast, setSavedToast] = useState(false);
  const [newBadges, setNewBadges] = useState<BadgeType[]>([]);
  const [listeningDone, setListeningDone] = useState(false);
  const [stageScore, setStageScore] = useState(0);

  const saveRef = useRef(false);

  // ── Save state after stage ─────────────────────────────────────────────────

  const saveState = useCallback(async (updates: Record<string, unknown>) => {
    await fetch(`/api/boss/${content.id}/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  }, [content.id]);

  // ── Advance phase ──────────────────────────────────────────────────────────

  const advanceTo = useCallback(async (nextPhase: BossPhase, extraUpdates: Record<string, unknown> = {}) => {
    const stageIndex = PHASE_ORDER.indexOf(nextPhase);
    setPhase(nextPhase);
    await saveState({ current_stage: stageIndex, ...extraUpdates });
  }, [saveState]);

  // ── Briefing complete ──────────────────────────────────────────────────────

  async function handleBriefingConfirm() {
    if (!difficulty) return;
    await advanceTo("stage1", { difficulty, partner_name: partnerName });
  }

  // ── Stage completions ──────────────────────────────────────────────────────

  async function handleStage1Complete(result: GameResult) {
    const stage = content.stages[0] as BossReadingStage;
    setClues((c) => [...c, stage.clueReward]);
    setStageScore((s) => s + result.score);
    await advanceTo("stage2");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleStage2Complete(..._: unknown[]) {
    const stage = content.stages[1] as BossLineupStage;
    setClues((c) => [...c, stage.clueReward]);
    await advanceTo("stage3");
  }

  async function handleStage3Complete(result: GameResult) {
    const stage = content.stages[2] as BossChaseStage;
    setClues((c) => [...c, stage.clueReward]);
    setStageScore((s) => s + result.score);
    await advanceTo("stage4");
  }

  async function handleStage4Complete() {
    const stage = content.stages[3] as BossInterrogationStage;
    setClues((c) => [...c, stage.clueReward]);
    await advanceTo("ethical_choice");
  }

  async function handleEthicalChoice(key: EthicalChoiceKey, sentence?: string) {
    setEthicalChoice(key);
    const choiceRecord = { stage: 4, choice: key, sentence };
    await advanceTo("stage5", {
      ethical_choices: JSON.stringify([choiceRecord]),
    });
  }

  async function handleListeningComplete(result: GameResult) {
    setStageScore((s) => s + result.score);
    setListeningDone(true); // now show code breaker
  }

  async function handleCodeComplete(correct: boolean) {
    const stage = content.stages[4] as BossListeningStage;
    if (correct) setClues((c) => [...c, stage.clueReward]);
    await advanceTo("resolution");
  }

  // ── Boss complete ──────────────────────────────────────────────────────────

  async function handleResolutionComplete() {
    if (saveRef.current) return;
    saveRef.current = true;

    const ending = ethicalChoice === "A" ? "pacto_silencioso"
      : ethicalChoice === "C" ? "maestro_negociador"
      : "cazador" as BossEnding;

    const res = await fetch(`/api/boss/${content.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        difficulty: difficulty ?? "normal",
        ethicalChoice: ethicalChoice ?? "B",
        finalEnding: ending,
        baseScore: stageScore,
        hadPartner: !!partnerName,
        partnerName,
      }),
    }).catch(() => null);

    if (res?.ok) {
      const data = await res.json() as { newBadges?: BadgeType[] };
      if (data.newBadges?.length) setNewBadges(data.newBadges);
    }
    setPhase("completed");
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  const diff = difficulty ?? "normal";
  const phaseIndex = PHASE_ORDER.indexOf(phase);

  // Get difficulty-adjusted stage data
  function getReadingQuestions(stage: BossReadingStage) {
    return stage.questions[diff];
  }

  function getSuspects(stage: BossLineupStage) {
    return stage.suspects[diff];
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const stage1 = content.stages[0] as BossReadingStage;
  const stage2 = content.stages[1] as BossLineupStage;
  const stage3 = content.stages[2] as BossChaseStage;
  const stage4 = content.stages[3] as BossInterrogationStage;
  const stage5 = content.stages[4] as BossListeningStage;

  // ── Completed screen ───────────────────────────────────────────────────────
  if (phase === "completed") {
    return (
      <div className="min-h-screen bg-[#0d0b0a] flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="text-6xl mb-2">🎯</div>
          <h1 className="font-display font-black text-4xl text-[#e8b455]">Operación Completada</h1>
          <p className="font-typewriter text-sm text-[#8b7355]">
            Desenlace: <span className="text-[#f5e6c8]">{
              ethicalChoice === "A" ? "El Pacto Silencioso"
              : ethicalChoice === "C" ? "El Maestro Negociador"
              : "El Cazador"
            }</span>
          </p>
          {newBadges.length > 0 && (
            <BadgeEarned badges={newBadges} onDismiss={() => setNewBadges([])} />
          )}
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

  return (
    <div className="min-h-screen bg-[#0d0b0a] flex flex-col">
      {/* Header */}
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

        {/* Stage progress pills */}
        <div className="hidden sm:flex items-center gap-1.5">
          {PHASE_ORDER.filter((p) => p !== "completed").map((p, i) => (
            <div key={p} title={PHASE_LABELS[p]}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < phaseIndex ? "bg-[#c9933a]"
                : i === phaseIndex ? "bg-[#c0392b] shadow-[0_0_6px_rgba(192,57,43,0.8)] scale-110"
                : "bg-[#2c1a1a]"
              }`}
            />
          ))}
          <span className="font-typewriter text-[9px] text-[#8b4a4a] ml-1">{PHASE_LABELS[phase]}</span>
        </div>

        <button onClick={() => router.push("/mission-board")}
          className="font-typewriter text-[10px] tracking-widest uppercase text-[#4a2a2a] hover:text-[#8b4a4a] transition-colors">
          Salir →
        </button>
      </header>

      {/* Save toast */}
      {savedToast && (
        <div className="fixed bottom-4 right-4 z-50 font-typewriter text-xs bg-[#1a1614] border border-[rgba(201,147,58,0.3)] text-[#c9933a] px-4 py-2 shadow-lg">
          ✓ Progreso guardado
        </div>
      )}

      {/* Clue notepad */}
      {clues.length > 0 && phase !== "briefing" && (
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

      {/* Main content */}
      <main className="flex-1 overflow-auto">

        {/* ── Briefing ── */}
        {phase === "briefing" && (
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
                <p className="font-typewriter text-[10px] uppercase text-[#8b7355] mb-1">Jefe Ramírez</p>
                <p className="font-typewriter text-sm text-[#c4a882] leading-relaxed italic">
                  &ldquo;Recluta, esta operación es peligrosa. Seguirás el rastro de El Tejedor a través de cinco países. Necesitarás todo lo que aprendiste. ¿Cómo prefieres atacarla?&rdquo;
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

            <button
              disabled={!difficulty}
              onClick={handleBriefingConfirm}
              className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40"
            >
              Comenzar operación →
            </button>
          </div>
        )}

        {/* ── Stage 1: México Reading ── */}
        {phase === "stage1" && (
          <ReadingComprehension
            key="stage1"
            title={`${stage1.country}: ${stage1.title}`}
            passage={stage1.passage}
            glossary={stage1.glossary}
            questions={getReadingQuestions(stage1)}
            unitId=""
            onComplete={handleStage1Complete}
          />
        )}

        {/* ── Stage 2: Puerto Rico Lineup ── */}
        {phase === "stage2" && (
          <LineupStage
            key="stage2"
            suspects={getSuspects(stage2).map((s) => ({
              id: s.id, name: s.name, realName: s.realName,
              age: s.age, description: s.description,
              imageSeed: s.imageSeed, imageUrl: s.imageUrl,
            }))}
            correctSuspectId={stage2.correctSuspectId}
            hint={stage2.hint}
            earnedClues={clues}
            onComplete={handleStage2Complete}
          />
        )}

        {/* ── Stage 3: España ChaseMap ── */}
        {phase === "stage3" && (
          <ChaseMap
            key="stage3"
            locations={stage3.locations}
            correctRoute={stage3.correctRoute}
            clues={stage3.clues}
            wrongPenalty={diff === "hard" ? (stage3.wrongPenalty ?? 15) + 10 : stage3.wrongPenalty}
            onComplete={handleStage3Complete}
          />
        )}

        {/* ── Stage 4: Costa Rica Interrogation ── */}
        {phase === "stage4" && (
          <Interrogation
            key="stage4"
            character={stage4.character}
            questionBank={stage4.questionBank}
            requiredInfo={stage4.requiredInfo}
            maxQuestions={diff === "hard" ? stage4.maxQuestions - 1 : stage4.maxQuestions + (diff === "easy" ? 2 : 0)}
            unitId=""
            onComplete={handleStage4Complete}
          />
        )}

        {/* ── Ethical Choice overlay ── */}
        {phase === "ethical_choice" && (
          <EthicalChoice
            choice={content.ethicalChoice}
            onSelect={handleEthicalChoice}
          />
        )}

        {/* ── Stage 5: Argentina Listening + Code ── */}
        {phase === "stage5" && (
          <div>
            {!listeningDone ? (
              <ListeningComprehension
                key="stage5-listening"
                title={`${stage5.country}: ${stage5.title}`}
                audioUrl={stage5.audioUrl}
                transcript={stage5.transcript}
                translation={stage5.translation}
                questions={stage5.questions}
                maxReplays={diff === "hard" ? 1 : stage5.maxReplays}
                passingScore={0.6}
                unitId=""
                onComplete={handleListeningComplete}
              />
            ) : (
              <CodeBreaker
                hint={stage5.codeHint}
                answer={stage5.codeAnswer}
                onComplete={handleCodeComplete}
              />
            )}
          </div>
        )}

        {/* ── Resolution ── */}
        {phase === "resolution" && (
          <BossResolution
            ending={content.endings[ethicalChoice ?? "B"]}
            choice={ethicalChoice ?? "B"}
            difficulty={diff}
            partnerName={partnerName}
            onComplete={handleResolutionComplete}
          />
        )}
      </main>

      {newBadges.length > 0 && (
        <BadgeEarned badges={newBadges} onDismiss={() => setNewBadges([])} />
      )}
    </div>
  );
}

// ── Resolution sub-component ──────────────────────────────────────────────────

import type { BossEndingDef } from "@/lib/types/boss";

function BossResolution({ ending, choice, difficulty, partnerName, onComplete }: {
  ending: BossEndingDef;
  choice: EthicalChoiceKey;
  difficulty: BossDifficulty;
  partnerName: string | null;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);

  const difficultyBadge = difficulty === "hard" ? "🔥 Agente Élite" : difficulty === "normal" ? "⚡ Agente Estándar" : "🔍 Agente Cuidadoso";
  const choiceBadge = choice === "A" ? "🕊️ Diplomático" : choice === "C" ? "🤝 Maestro Negociador" : "⚖️ Cazador Implacable";

  const lines = ending.description;

  return (
    <div className="max-w-lg mx-auto px-5 py-8 space-y-6">
      <div className="text-center">
        <p className="font-typewriter text-[9px] tracking-[0.4em] uppercase text-[#c0392b] mb-1">Resolución</p>
        <h2 className="font-display font-black text-3xl text-[#e8b455]">{ending.title}</h2>
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
      {step >= lines.length && (
        <div className="border border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)] p-5">
          <p className="font-typewriter text-[9px] uppercase text-[#c0392b] mb-2">🔍 Pista final — El Coleccionista</p>
          <p className="font-typewriter text-sm text-[#f5e6c8] leading-relaxed italic">
            &ldquo;{ending.finalClue}&rdquo;
          </p>
        </div>
      )}

      {/* Rewards */}
      {step >= lines.length && (
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-4 space-y-2">
          <p className="font-typewriter text-[9px] uppercase text-[#8b7355] mb-2">Insignias ganadas</p>
          <p className="font-typewriter text-sm text-[#c9933a]">🎯 Operación Eclipse Completada</p>
          <p className="font-typewriter text-sm text-[#c9933a]">{difficultyBadge}</p>
          <p className="font-typewriter text-sm text-[#c9933a]">{choiceBadge}</p>
          {partnerName && (
            <p className="font-typewriter text-xs text-[#8b7355]">+100 puntos de colaboración con {partnerName}</p>
          )}
        </div>
      )}

      <button
        onClick={() => {
          if (step < lines.length) {
            setStep((s) => s + 1);
          } else {
            onComplete();
          }
        }}
        className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
      >
        {step < lines.length ? "Continuar →" : "Completar misión →"}
      </button>
    </div>
  );
}
