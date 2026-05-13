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

// ── Unit root ─────────────────────────────────────────────────────────────────

export interface UnitContent {
  unitNumber: number;
  country: string;
  city: string;
  caseTitle: string;
  caseDescription: string;
  criminalName: string;
  vocab: VocabItem[];
  stages: StageData[];
}
