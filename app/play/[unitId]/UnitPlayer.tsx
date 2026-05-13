"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { UnitContent, StageData } from "@/lib/types/unit-content";
import type { GameResult } from "@/lib/games/types";

import CutsceneStage from "@/components/play/CutsceneStage";
import ClueReveal from "@/components/play/ClueReveal";
import BadgeModal from "@/components/play/BadgeModal";
import LineupStage from "@/components/play/LineupStage";
import BadgeEarned from "@/components/games/BadgeEarned";
import AlertToast from "@/components/ui/AlertToast";
import VocabMatch from "@/components/games/VocabMatch";
import DialogueChoice from "@/components/games/DialogueChoice";
import ReadingComprehension from "@/components/games/ReadingComprehension";
import ListeningComprehension from "@/components/games/ListeningComprehension";
import type { BadgeType } from "@/lib/types/database";

interface Props {
  content: UnitContent;
  unitId: string;       // Supabase DB unit UUID
  unitNumber: number;
  classId: string;
  initialStageIndex: number;
  isCompleted: boolean;
}

// Compute which clues have already been earned given a stage index
function computeEarnedClues(stages: StageData[], upToIndex: number): string[] {
  return stages
    .slice(0, upToIndex)
    .flatMap((s) => ("clueReward" in s && s.clueReward ? [s.clueReward] : []));
}

// Human-readable stage names for progress indicator
const STAGE_LABELS: Record<StageData["type"], string> = {
  cutscene: "Briefing",
  vocabMatch: "Vocabulario",
  dialogueChoice: "Testigo",
  readingComp: "Evidencia",
  listeningComp: "Vigilancia",
  lineup: "Identificación",
};

export default function UnitPlayer({ content, unitId, unitNumber, classId, initialStageIndex, isCompleted }: Props) {
  useRouter(); // reserved for future navigation (chase mechanic)
  const [currentStage, setCurrentStage] = useState(
    isCompleted ? content.stages.length : initialStageIndex
  );
  const [earnedClues, setEarnedClues] = useState<string[]>(
    () => computeEarnedClues(content.stages, initialStageIndex)
  );
  const [pendingClue, setPendingClue] = useState<string | null>(null);
  const [showBadge, setShowBadge] = useState(isCompleted);
  const [newBadges, setNewBadges] = useState<BadgeType[]>([]);
  const [showBadgeEarned, setShowBadgeEarned] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [lineupScore, setLineupScore] = useState(1);
  const stageStartRef = useRef(Date.now());

  // ── Save stage progress + advance ────────────────────────────────────────────
  const handleStageComplete = useCallback(
    async (result: GameResult) => {
      const stage = content.stages[currentStage];
      if (!stage) return;

      // Persist to DB (fire-and-forget — don't block UI)
      fetch("/api/game/stage-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitNumber,
          stageIndex: currentStage,
          activityType:
            stage.type === "vocabMatch" ? "vocab_match"
            : stage.type === "dialogueChoice" ? "dialogue"
            : stage.type === "readingComp" ? "dialogue"
            : stage.type === "listeningComp" ? "listening"
            : "cultural",
          score: result.score,
          maxScore: result.maxScore,
          timeSpentSeconds: result.timeSpent,
        }),
      }).catch(() => {}); // never crash gameplay on a network error

      setTotalTime((t) => t + result.timeSpent);

      // Check for clue reward
      const clue = "clueReward" in stage && !result.isSkipped ? (stage.clueReward ?? null) : null;
      if (clue) {
        setEarnedClues((prev) => [...prev, clue]);
        setPendingClue(clue);
        // Actual stage advance happens after clue is dismissed
      } else {
        setCurrentStage((s) => s + 1);
        stageStartRef.current = Date.now();
      }
    },
    [content.stages, currentStage, unitNumber]
  );

  // ── Lineup (final stage) ─────────────────────────────────────────────────────
  const handleLineupComplete = useCallback(
    async (result: GameResult, score: number) => {
      setLineupScore(score);
      setTotalTime((t) => t + result.timeSpent);

      const res = await fetch("/api/game/unit-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitNumber,
          score: result.score,
          maxScore: result.maxScore,
          timeSpentSeconds: result.timeSpent,
        }),
      }).catch(() => null);

      if (res?.ok) {
        const data = await res.json() as { ok: boolean; newBadges: BadgeType[] };
        if (data.newBadges?.length) {
          setNewBadges(data.newBadges);
          setShowBadgeEarned(true);
          // BadgeModal shown after BadgeEarned dismisses
          return;
        }
      }
      setShowBadge(true);
    },
    [unitNumber]
  );

  // ── Clue dismissed → advance stage ──────────────────────────────────────────
  function handleClueDismissed() {
    setPendingClue(null);
    setCurrentStage((s) => s + 1);
    stageStartRef.current = Date.now();
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  const stages = content.stages;
  const stage = stages[currentStage] as StageData | undefined;
  const allDone = currentStage >= stages.length;

  // Already completed — show badge immediately
  if (showBadge || (allDone && !pendingClue)) {
    return (
      <BadgeModal
        caseTitle={content.caseTitle}
        country={content.country}
        criminalName={content.criminalName}
        score={lineupScore}
        maxScore={1}
        totalTimeSeconds={totalTime}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0b0a]">
      {/* ── Progress bar ────────────────────────────────────────────────── */}
      <div className="border-b border-[rgba(201,147,58,0.12)] bg-[#110f0d] px-5 py-2.5 shrink-0">
        <div className="flex items-center gap-1 max-w-4xl mx-auto">
          {stages.map((s, i) => {
            const done = i < currentStage;
            const active = i === currentStage;
            return (
              <div key={i} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`w-3 h-3 rounded-full border transition-colors ${
                      done
                        ? "bg-[#c9933a] border-[#c9933a]"
                        : active
                        ? "bg-[#8b1a1a] border-[#c0392b] shadow-[0_0_6px_rgba(192,57,43,0.6)]"
                        : "bg-transparent border-[rgba(201,147,58,0.2)]"
                    }`}
                  />
                  <span
                    className={`font-typewriter text-[8px] tracking-wide uppercase mt-0.5 hidden sm:block leading-none ${
                      active ? "text-[#e8b455]" : done ? "text-[#c9933a]" : "text-[#4a3a2a]"
                    }`}
                  >
                    {STAGE_LABELS[s.type]}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${i < currentStage ? "bg-[#c9933a]" : "bg-[rgba(201,147,58,0.15)]"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile label */}
        <p className="font-typewriter text-[9px] text-[#8b7355] text-center mt-1 sm:hidden">
          {stage ? STAGE_LABELS[stage.type] : ""} · {currentStage + 1}/{stages.length}
        </p>
      </div>

      {/* ── Stage content ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {stage?.type === "cutscene" && (
          <CutsceneStage {...stage} onComplete={handleStageComplete} />
        )}

        {stage?.type === "vocabMatch" && (
          <VocabMatch
            key={`stage-${currentStage}`}
            title="Vocabulario — Memoria"
            pairs={stage.pairs}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}

        {stage?.type === "dialogueChoice" && (
          <DialogueChoice
            key={`stage-${currentStage}`}
            title="Entrevista al Testigo"
            npcName={stage.npcName}
            npcAvatar={stage.npcAvatar}
            nodes={stage.nodes}
            startNodeId={stage.startNodeId}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}

        {stage?.type === "readingComp" && (
          <ReadingComprehension
            key={`stage-${currentStage}`}
            title="Analizar la Evidencia"
            passage={stage.passage}
            glossary={stage.glossary}
            questions={stage.questions}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}

        {stage?.type === "listeningComp" && (
          <ListeningComprehension
            key={`stage-${currentStage}`}
            title="Audio de Vigilancia"
            audioUrl={stage.audioUrl}
            transcript={stage.transcript}
            question={stage.question}
            options={stage.options}
            correctIndex={stage.correctIndex}
            maxReplays={stage.maxReplays}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}

        {stage?.type === "lineup" && (
          <LineupStage
            key={`stage-${currentStage}`}
            suspects={stage.suspects}
            correctSuspectId={stage.correctSuspectId}
            hint={stage.hint}
            earnedClues={earnedClues}
            onComplete={handleLineupComplete}
          />
        )}
      </div>

      {/* ── Clue reveal overlay ──────────────────────────────────────────── */}
      {pendingClue && (
        <ClueReveal
          clue={pendingClue}
          clueNumber={earnedClues.length}
          onDismiss={handleClueDismissed}
        />
      )}

      {/* ── Badge earned celebration ─────────────────────────────────────── */}
      {showBadgeEarned && newBadges.length > 0 && (
        <BadgeEarned
          badges={newBadges}
          onDismiss={() => { setShowBadgeEarned(false); setShowBadge(true); }}
        />
      )}

      {/* ── Teacher alert toasts ─────────────────────────────────────────── */}
      <AlertToast classId={classId} />
    </div>
  );
}
