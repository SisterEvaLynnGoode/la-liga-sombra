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
import ChaseMap from "@/components/games/ChaseMap";
import TimedFlashcards from "@/components/games/TimedFlashcards";
import LiveStakeout from "@/components/games/LiveStakeout";
import SentenceBuilderStage from "@/components/games/SentenceBuilderStage";
import Interrogation from "@/components/games/Interrogation";
import Stakeout from "@/components/games/Stakeout";
import type { StakeoutQuestion } from "@/lib/question-generator";
import type { StakeoutResult } from "@/components/games/Stakeout";
import type { BadgeType } from "@/lib/types/database";

interface Props {
  content: UnitContent;
  unitId: string;       // Supabase DB unit UUID
  unitNumber: number;
  classId: string;
  initialStageIndex: number;
  isCompleted: boolean;
  stakeoutQuestions: StakeoutQuestion[];  // pre-generated server-side; empty = no stakeout
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
  chaseMap: "Persecución",
  sentenceBuilder: "Gramática",
  interrogation: "Interrogatorio",
  timedFlashcards: "Flashcards",
  liveStakeout: "Vigilancia",
};

export default function UnitPlayer({ content, unitId, unitNumber, classId, initialStageIndex, isCompleted, stakeoutQuestions }: Props) {
  useRouter(); // reserved for future navigation (chase mechanic)

  // Does this unit have a stakeout checkpoint? (only when last stage is lineup)
  const lineupIndex   = content.stages.length - 1;
  const hasStakeout   = stakeoutQuestions.length > 0 &&
                        content.stages[lineupIndex]?.type === "lineup";

  const [currentStage, setCurrentStage] = useState(
    isCompleted ? content.stages.length : initialStageIndex
  );
  const [earnedClues, setEarnedClues] = useState<string[]>(
    () => computeEarnedClues(content.stages, initialStageIndex)
  );
  const [pendingClue, setPendingClue]       = useState<string | null>(null);
  const [showBadge, setShowBadge]           = useState(isCompleted);
  const [newBadges, setNewBadges]           = useState<BadgeType[]>([]);
  const [showBadgeEarned, setShowBadgeEarned] = useState(false);
  const [totalTime, setTotalTime]           = useState(0);
  const [lineupScore, setLineupScore]       = useState(1);

  // Stakeout state — injected between stage (lineupIndex-1) and lineupIndex
  const [stakeoutPhase, setStakeoutPhase]   = useState<"pending" | "active" | "done">("pending");
  const [stakeoutPassed, setStakeoutPassed] = useState<boolean | null>(null);
  // When a stage completes with a clue AND the next stage is the stakeout intercept,
  // we need to delay showing the stakeout until the clue banner is dismissed.
  const [pendingStakeoutAfterClue, setPendingStakeoutAfterClue] = useState(false);

  const stageStartRef = useRef(Date.now());

  // ── Shared unit-complete logic ────────────────────────────────────────────────
  const completeUnit = useCallback(
    async (result: GameResult) => {
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
          return;
        }
      }
      setShowBadge(true);
    },
    [unitNumber]
  );

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
            : stage.type === "chaseMap" ? "cultural"
            : stage.type === "sentenceBuilder" ? "vocab_match"
            : "cultural",
          score: result.score,
          maxScore: result.maxScore,
          timeSpentSeconds: result.timeSpent,
        }),
      }).catch(() => {});

      setTotalTime((t) => t + result.timeSpent);

      const isLastStage = currentStage === content.stages.length - 1;

      // If this is the last stage and it's not a lineup (which has its own handler),
      // treat it as unit completion
      if (isLastStage && stage.type !== "lineup") {
        await completeUnit(result);
        return;
      }

      // Determine whether the NEXT stage is the lineup (stakeout intercept point)
      const nextIndex = currentStage + 1;
      const interceptForStakeout =
        hasStakeout &&
        stakeoutPhase === "pending" &&
        nextIndex === lineupIndex;

      // Check for clue reward
      const clue = "clueReward" in stage && !result.isSkipped ? (stage.clueReward ?? null) : null;
      if (clue) {
        setEarnedClues((prev) => [...prev, clue]);
        setPendingClue(clue);
        // If stakeout should fire after this clue, flag it
        if (interceptForStakeout) setPendingStakeoutAfterClue(true);
        // Actual advance happens in handleClueDismissed
      } else if (interceptForStakeout) {
        // No clue — go straight to stakeout
        setStakeoutPhase("active");
      } else {
        setCurrentStage((s) => s + 1);
        stageStartRef.current = Date.now();
      }
    },
    [content.stages, currentStage, unitNumber, completeUnit, hasStakeout, stakeoutPhase, lineupIndex]
  );

  // ── Lineup (final stage) ─────────────────────────────────────────────────────
  const handleLineupComplete = useCallback(
    async (result: GameResult, score: number) => {
      setLineupScore(score);
      setTotalTime((t) => t + result.timeSpent);
      await completeUnit(result);
    },
    [completeUnit]
  );

  // ── Clue dismissed → advance stage (or activate stakeout) ──────────────────
  function handleClueDismissed() {
    setPendingClue(null);
    if (pendingStakeoutAfterClue) {
      setPendingStakeoutAfterClue(false);
      setStakeoutPhase("active");
    } else {
      setCurrentStage((s) => s + 1);
      stageStartRef.current = Date.now();
    }
  }

  // ── Stakeout complete ────────────────────────────────────────────────────────
  const handleStakeoutComplete = useCallback(
    async (result: StakeoutResult) => {
      setStakeoutPhase("done");
      setStakeoutPassed(result.passed);

      // Modify earned clues based on result
      if (result.passed) {
        setEarnedClues((prev) => [...prev, content.bonusClue]);
      } else {
        // Remove the most recent clue
        setEarnedClues((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
      }

      // Record stakeout attempt (fire-and-forget)
      fetch("/api/game/stage-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitNumber,
          stageIndex: lineupIndex - 1,   // virtual position
          activityType: "stakeout",
          score: result.timeRemaining,   // time left = performance indicator
          maxScore: 90,
          timeSpentSeconds: Math.max(0, 90 - result.timeRemaining),
        }),
      }).catch(() => {});

      // Award badge + 100-point bonus if passed
      if (result.passed) {
        fetch("/api/game/stakeout-reward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unitNumber }),
        })
          .then((r) => r.json())
          .then((d: { newBadges?: BadgeType[] }) => {
            if (d.newBadges?.length) {
              setNewBadges(d.newBadges);
              setShowBadgeEarned(true);
            }
          })
          .catch(() => {});
      }

      // Advance to lineup
      setCurrentStage(lineupIndex);
      stageStartRef.current = Date.now();
    },
    [content.bonusClue, unitNumber, lineupIndex]
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  const stages   = content.stages;
  const stage    = stages[currentStage] as StageData | undefined;
  const allDone  = currentStage >= stages.length && stakeoutPhase !== "active";

  // Build a virtual stages list for the progress bar that includes a stakeout dot
  // Virtual index: each real stage maps 1:1, then the stakeout dot sits at lineupIndex
  // (pushing real lineupIndex to lineupIndex + 1 visually).
  const progressDots: Array<{ label: string; isStakeout?: boolean }> = stages.map((s) => ({
    label: STAGE_LABELS[s.type],
  }));
  if (hasStakeout) {
    // Insert a stakeout dot just before the lineup dot
    progressDots.splice(lineupIndex, 0, { label: "Vigilancia", isStakeout: true });
  }

  // Map currentStage → visual dot index
  const visualIndex = hasStakeout && stakeoutPhase !== "pending" && currentStage >= lineupIndex
    ? currentStage + 1  // stakeout dot consumed one slot
    : stakeoutPhase === "active"
    ? lineupIndex       // stakeout dot is active
    : currentStage;

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
          {progressDots.map((dot, i) => {
            const done   = i < visualIndex;
            const active = i === visualIndex;
            return (
              <div key={i} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`w-3 h-3 rounded-full border transition-colors ${
                      dot.isStakeout
                        ? done
                          ? stakeoutPassed === true
                            ? "bg-[#c9933a] border-[#c9933a]"
                            : "bg-[#c0392b] border-[#c0392b]"
                          : active
                          ? "bg-[#8b1a1a] border-[#c0392b] shadow-[0_0_8px_rgba(192,57,43,0.8)] animate-pulse"
                          : "bg-transparent border-[rgba(192,57,43,0.3)]"
                        : done
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
                    {dot.label}
                  </span>
                </div>
                {i < progressDots.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${i < visualIndex ? "bg-[#c9933a]" : "bg-[rgba(201,147,58,0.15)]"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile label */}
        <p className="font-typewriter text-[9px] text-[#8b7355] text-center mt-1 sm:hidden">
          {stakeoutPhase === "active" ? "Vigilancia" : (stage ? STAGE_LABELS[stage.type] : "")} · {visualIndex + 1}/{progressDots.length}
        </p>
      </div>

      {/* ── Stage content ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">

        {/* Stakeout intercept — shown INSTEAD of regular stage content */}
        {stakeoutPhase === "active" && (
          <Stakeout
            key="stakeout"
            questions={stakeoutQuestions}
            unitNumber={unitNumber}
            onComplete={handleStakeoutComplete}
          />
        )}

        {stakeoutPhase !== "active" && stage?.type === "cutscene" && (
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
            translation={stage.translation}
            retryHint={stage.retryHint}
            passingScore={stage.passingScore}
            question={stage.question}
            options={stage.options}
            correctIndex={stage.correctIndex}
            questions={stage.questions}
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

        {stage?.type === "chaseMap" && (
          <ChaseMap
            key={`stage-${currentStage}`}
            locations={stage.locations}
            correctRoute={stage.correctRoute}
            clues={stage.clues}
            wrongPenalty={stage.wrongPenalty}
            onComplete={handleStageComplete}
          />
        )}

        {stage?.type === "sentenceBuilder" && (
          <SentenceBuilderStage
            key={`stage-${currentStage}`}
            sentences={stage.sentences}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}

        {stage?.type === "liveStakeout" && (
          <LiveStakeout
            key={`stage-${currentStage}`}
            scenes={stage.scenes}
            targetActionDescription={stage.targetActionDescription}
            timeLimit={stage.timeLimit}
            onComplete={handleStageComplete}
          />
        )}

        {stage?.type === "timedFlashcards" && (
          <TimedFlashcards
            key={`stage-${currentStage}`}
            title={stage.title}
            cards={stage.cards}
            timeLimit={stage.timeLimit}
            unitId={unitId}
            onComplete={handleStageComplete}
          />
        )}

        {stage?.type === "interrogation" && (
          <Interrogation
            key={`stage-${currentStage}`}
            character={stage.character}
            questionBank={stage.questionBank}
            requiredInfo={stage.requiredInfo}
            maxQuestions={stage.maxQuestions}
            unitId={unitId}
            onComplete={handleStageComplete}
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
