// Types that mirror the /content/unit-XX.json schema.
// Edit the JSON files directly — these types validate the shape.

import type { VocabPair, DialogueNode, GlossaryEntry, ReadingQuestion } from "@/lib/games/types";

export interface VocabItem extends VocabPair {
  audio?: string;
}

export interface Suspect {
  id: string;
  name: string;         // alias / criminal handle
  realName: string;
  age: number;
  description: string;  // 2-3 sentences in Spanish
  imageSeed: number;    // pravatar.cc ?img=N (fallback)
  imageUrl?: string;    // explicit URL — use this to guarantee correct gender/appearance
}

// ── Stage shapes ──────────────────────────────────────────────────────────────

export interface CutsceneStageData {
  type: "cutscene";
  videoUrl: string;
  subtitleUrl?: string;
  fallbackImage?: string;
  chiefName: string;
  chiefImageSeed: number;
  briefingLines: string[];  // paragraphs of the chief's briefing
}

export interface VocabMatchStageData {
  type: "vocabMatch";
  pairs: VocabPair[];
}

export interface DialogueStageData {
  type: "dialogueChoice";
  clueReward?: string;
  npcName: string;
  npcAvatar?: string;
  startNodeId: string;
  nodes: DialogueNode[];
}

export interface ReadingStageData {
  type: "readingComp";
  clueReward?: string;
  passage: string;
  glossary: GlossaryEntry[];
  questions: ReadingQuestion[];
}

export interface ListeningQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanationEs?: string;
  explanationEn?: string;
}

export interface ListeningStageData {
  type: "listeningComp";
  clueReward?: string;
  audioUrl: string;
  transcript?: string;
  translation?: string;
  retryHint?: string;
  passingScore?: number;
  maxReplays?: number;
  // Legacy single-question (units 2+)
  question?: string;
  options?: string[];
  correctIndex?: number;
  // Multi-question (unit 1+)
  questions?: ListeningQuestion[];
}

export interface LineupStageData {
  type: "lineup";
  suspects: Suspect[];
  correctSuspectId: string;
  hint: string;
}

export interface QuestionItem {
  id: string;
  spanish: string;
  english: string;
  response: string;
  responseEnglish: string;
  infoRevealed?: string;
  isUseful: boolean;
}

export interface InterrogationCharacter {
  name: string;
  role: string;
  imageUrl?: string;
  imageSeed?: number;
  description: string;
}

export interface InterrogationStageData {
  type: "interrogation";
  clueReward?: string;
  character: InterrogationCharacter;
  questionBank: QuestionItem[];
  requiredInfo: string[];
  maxQuestions: number;
}

export interface ChaseLocation {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
}

export interface ChaseMapStageData {
  type: "chaseMap";
  clueReward?: string;
  locations: ChaseLocation[];
  correctRoute: string[];
  clues: string[];
  wrongPenalty?: number;
}

export interface SentenceItem {
  sentence: string;
  translation: string;
}

export interface SentenceBuilderStageData {
  type: "sentenceBuilder";
  clueReward?: string;
  sentences: SentenceItem[];
}

export interface StakeoutScene {
  imageUrl: string;
  description: string;    // camera / location label
  currentAction: string;  // Spanish present-progressive caption
  isTarget: boolean;
}

export interface LiveStakeoutStageData {
  type: "liveStakeout";
  clueReward?: string;
  scenes: StakeoutScene[];
  targetActionDescription: string;
  timeLimit: number;
}

export interface TimedFlashcardsStageData {
  type: "timedFlashcards";
  clueReward?: string;
  title?: string;
  cards: Array<{ prompt: string; answer: string }>;
  timeLimit: number;
}

export type StageData =
  | CutsceneStageData
  | VocabMatchStageData
  | DialogueStageData
  | ReadingStageData
  | ListeningStageData
  | LineupStageData
  | ChaseMapStageData
  | SentenceBuilderStageData
  | InterrogationStageData
  | TimedFlashcardsStageData
  | LiveStakeoutStageData;

// ── Academia config ──────────────────────────────────────────────────────────

/**
 * Optional per-unit configuration for La Academia pre-case training gate.
 *
 * If omitted, the gate still runs but skips the Aplicación (SentenceBuilder)
 * stage because there are no sentences to build.
 *
 * `sentences` powers the 4th Academia stage (Aplicación).
 * Each sentence should use vocabulary from this unit.
 */
export interface AcademiaConfig {
  sentences?: SentenceItem[];
}

// ── Unit root ─────────────────────────────────────────────────────────────────

export interface UnitContent {
  unitNumber: number;
  country: string;
  city: string;
  caseTitle: string;
  caseDescription: string;
  criminalName: string;
  /**
   * Bonus clue awarded when the student passes the Vigilancia stakeout.
   * Appears in the lineup as a 4th clue. Must be a detail that uniquely
   * distinguishes the correct suspect (e.g. handedness, tattoo, distinctive habit).
   */
  bonusClue: string;
  /**
   * Marks this file as a Cold Case. When true:
   * - Accessed via /play/[unitId]/cold
   * - Lineup may have 5 suspects
   * - Listening comp maxReplays capped at 1 by the game engine
   * - Stakeout timer is 70s instead of 90s
   */
  isColdCase?: boolean;
  vocab: VocabItem[];
  stages: StageData[];
  academiaConfig?: AcademiaConfig;
}
