import type { ActivityType } from "@/lib/types/database";

export interface GameResult {
  score: number;
  maxScore: number;
  timeSpent: number;   // seconds elapsed
  attempts: number;
  isSkipped?: boolean;
}

export type OnComplete = (result: GameResult) => void;

export interface BaseGameProps {
  title?: string;
  activityType?: ActivityType;
  unitId?: string;         // undefined = showcase / no tracking
  onComplete: OnComplete;
}

// ── VocabMatch ───────────────────────────────────────────────────────────────
export interface VocabPair {
  spanish: string;
  english: string;
}

// ── SentenceBuilder ──────────────────────────────────────────────────────────
export interface SentenceBuilderData {
  sentence: string;       // correct sentence (will be scrambled)
  translation: string;    // shown as a hint
}

// ── DialogueChoice ───────────────────────────────────────────────────────────
export interface DialogueOption {
  text: string;
  isCorrect: boolean;
  feedback?: string;      // shown on wrong choice
  nextNodeId?: string;    // id of next node; omit for terminal correct
}

export interface DialogueNode {
  id: string;
  npcLine: string;
  options?: DialogueOption[];
  isEnd?: boolean;
  endMessage?: string;
}

// ── ListeningComprehension ───────────────────────────────────────────────────

export interface ListeningQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanationEs?: string; // shown after answering in Spanish
  explanationEn?: string; // shown after answering in English
}

export interface ListeningData {
  audioUrl: string;
  transcript?: string;
  translation?: string;   // English translation of transcript, toggle-able
  retryHint?: string;     // hint shown when score < passingScore
  passingScore?: number;  // 0–1 threshold; purely informational in the UI
  maxReplays?: number;
  // Legacy single-question format (units 2+)
  question?: string;
  options?: string[];
  correctIndex?: number;
  // New multi-question format
  questions?: ListeningQuestion[];
}

// ── ReadingComprehension ─────────────────────────────────────────────────────
export interface GlossaryEntry {
  word: string;
  translation: string;
}

export type ReadingQuestion =
  | {
      id: string;
      text: string;
      type: "multiple_choice";
      options: string[];
      correctIndex: number;
    }
  | {
      id: string;
      text: string;
      type: "short_answer";
      acceptableAnswers: string[];
    };

// ── ConjugationDragDrop ──────────────────────────────────────────────────────
export interface ConjugationSet {
  yo: string;
  tu: string;       // tú
  el: string;       // él/ella/usted
  nosotros: string;
  vosotros: string;
  ellos: string;    // ellos/ellas/ustedes
}

export const PRONOUNS: Array<{ key: keyof ConjugationSet; display: string }> = [
  { key: "yo",       display: "yo" },
  { key: "tu",       display: "tú" },
  { key: "el",       display: "él/ella" },
  { key: "nosotros", display: "nosotros" },
  { key: "vosotros", display: "vosotros" },
  { key: "ellos",    display: "ellos/ellas" },
];

// ── TimedFlashcards ──────────────────────────────────────────────────────────
export interface FlashcardItem {
  prompt: string;
  answer: string;
  hint?: string;
}
