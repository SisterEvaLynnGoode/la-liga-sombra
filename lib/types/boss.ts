/**
 * Boss Fight — type definitions
 * Boss content is stored in /content/bosses/[bossId].json
 */

import type { ReadingQuestion, GlossaryEntry } from "@/lib/games/types";
import type { BadgeType } from "@/lib/types/database";

export type BossDifficulty = "easy" | "normal" | "hard";
export type EthicalChoiceKey = "A" | "B" | "C";
export type BossEnding =
  // Operación Eclipse
  | "pacto_silencioso" | "cazador" | "maestro_negociador"
  // Operación Reloj de Arena
  | "trato_del_reloj" | "la_detencion" | "el_acuerdo";
export type BossPhase =
  | "briefing"
  | "stage1" | "stage2" | "stage3" | "stage4"
  | "ethical_choice"
  | "stage5"
  | "resolution"
  | "completed";

// ── Stage content types ────────────────────────────────────────────────────────

export interface BossSuspect {
  id: string;
  name: string;
  realName: string;
  age: number;
  description: string;
  imageUrl: string;
  imageSeed: number;
}

export interface BossListeningQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanationEs?: string;
}

// Per-difficulty variants
export interface BossReadingStage {
  type: "readingComp";
  country: string;
  title: string;
  passage: string;
  glossary: GlossaryEntry[];
  clueReward: string;
  questions: {
    easy:   ReadingQuestion[];
    normal: ReadingQuestion[];
    hard:   ReadingQuestion[];
  };
}

export interface BossLineupStage {
  type: "lineup";
  country: string;
  title: string;
  correctSuspectId: string;
  hint: string;
  clueReward: string;
  suspects: {
    easy:   BossSuspect[];
    normal: BossSuspect[];
    hard:   BossSuspect[];
  };
}

export interface BossChaseStage {
  type: "chaseMap";
  country: string;
  title: string;
  clueReward: string;
  locations: Array<{ id: string; name: string; coordinates: { x: number; y: number } }>;
  correctRoute: string[];
  clues: string[];
  wrongPenalty: number;
}

export interface BossInterrogationQuestion {
  id: string;
  spanish: string;
  english: string;
  response: string;
  responseEnglish: string;
  infoRevealed?: string;
  isUseful: boolean;
}

export interface BossInterrogationStage {
  type: "interrogation";
  country: string;
  title: string;
  clueReward: string;
  // imageUrl is optional: Semester 2 characters have no portrait art yet, and
  // CharacterPortrait already falls back to initials when it is absent.
  character: { name: string; role: string; imageUrl?: string; description: string };
  questionBank: BossInterrogationQuestion[];
  requiredInfo: string[];
  maxQuestions: number;
}

export interface BossListeningStage {
  type: "listeningComp";
  country: string;
  title: string;
  clueReward: string;
  audioUrl: string;
  transcript: string;
  translation: string;
  questions: BossListeningQuestion[];
  maxReplays: number;
  codeAnswer: string;  // the correct code (e.g. "74")
  codeHint: string;    // hint shown to student
}

/**
 * Swipe-sort, as introduced in Caso 12. A boss uses it to re-run a binary
 * grammar decision at speed.
 */
export interface BossSwipeSortStage {
  type: "swipeSort";
  country: string;
  title: string;
  clueReward: string;
  prompt: string;
  leftLabel: string;
  leftHint?: string;
  rightLabel: string;
  rightHint?: string;
  items: Array<{ text: string; category: "left" | "right"; explanation?: string }>;
}

/** Sentence builder, as used from Caso 3 onward. */
export interface BossSentenceBuilderStage {
  type: "sentenceBuilder";
  country: string;
  title: string;
  clueReward: string;
  sentences: Array<{ sentence: string; translation: string }>;
}

export type BossStageContent =
  | BossReadingStage
  | BossLineupStage
  | BossChaseStage
  | BossInterrogationStage
  | BossListeningStage
  | BossSwipeSortStage
  | BossSentenceBuilderStage;

// ── Ethical choice ─────────────────────────────────────────────────────────────

export interface EthicalChoiceOption {
  key: EthicalChoiceKey;
  emoji: string;
  title: string;
  description: string;
  effect: string;
  requiresSentence?: boolean;  // Option C — student must write a Spanish sentence
  requiredWords?: string[];    // words the sentence must include (any one)
}

export interface BossEthicalChoice {
  context: string;          // the situation paragraph
  speakerName: string;
  speakerLine: string;      // what the family member says
  options: EthicalChoiceOption[];
}

// ── Endings ────────────────────────────────────────────────────────────────────

export interface BossEndingDef {
  id: BossEnding;
  title: string;
  badge: BadgeType;
  description: string[];
  finalClue: string;
}

// ── Full boss content ──────────────────────────────────────────────────────────

export interface BossContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  unlockAfterUnit: number;
  nextUnit: number;
  totalStages: number;
  basePoints: number;
  pointsMultiplier: { easy: number; normal: number; hard: number };
  collaborationBonus: number;
  /**
   * Badge awarded for finishing this boss at all, whatever the ending. Per-boss,
   * so the route no longer hands every boss the Eclipse badge.
   */
  completionBadge?: BadgeType;
  stages: BossStageContent[];
  /** What the chief says on the briefing screen. Was hardcoded to Eclipse. */
  briefingLine?: string;
  /**
   * 0-based index of the stage AFTER which the ethical choice fires.
   * Defaults to second-to-last, which is where Eclipse puts it.
   */
  ethicalChoiceAfterStage?: number;
  ethicalChoice: BossEthicalChoice;
  endings: Record<EthicalChoiceKey, BossEndingDef>;
}

// ── Save state ─────────────────────────────────────────────────────────────────

export interface BossState {
  id: string;
  primaryStudentId: string;
  partnerStudentId: string | null;
  bossId: string;
  difficulty: BossDifficulty | null;
  currentStage: number;
  stageData: Record<string, unknown>;
  ethicalChoices: Array<{ stage: number; choice: EthicalChoiceKey; sentence?: string }>;
  partnerName: string | null;
  startedAt: string;
  lastSavedAt: string;
  completedAt: string | null;
  skippedAt: string | null;
  finalScore: number | null;
  finalEnding: BossEnding | null;
}
