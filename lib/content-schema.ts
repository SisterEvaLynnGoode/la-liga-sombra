import { z } from "zod";

// ─── Primitives ───────────────────────────────────────────────────────────────

export const VocabPairSchema = z.object({
  spanish: z.string().min(1, "Spanish word required"),
  english: z.string().min(1, "English translation required"),
  audio: z.string().optional(),
});

export const GlossaryEntrySchema = z.object({
  word: z.string().min(1),
  translation: z.string().min(1),
});

// ─── Dialogue ─────────────────────────────────────────────────────────────────

export const DialogueOptionSchema = z.object({
  text: z.string().min(1, "Option text required"),
  isCorrect: z.boolean(),
  feedback: z.string().optional(),
  nextNodeId: z.string().optional(),
});

export const DialogueNodeSchema = z.object({
  id: z.string().min(1, "Node id required"),
  npcLine: z.string(),
  options: z.array(DialogueOptionSchema).min(2).max(4).optional(),
  isEnd: z.boolean().optional(),
  endMessage: z.string().optional(),
});

// ─── Reading questions ────────────────────────────────────────────────────────

export const MCQuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  type: z.literal("multiple_choice"),
  options: z.array(z.string().min(1)).length(4, "Multiple-choice questions must have exactly 4 options"),
  correctIndex: z.number().int().min(0).max(3),
});

export const SAQuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  type: z.literal("short_answer"),
  acceptableAnswers: z.array(z.string().min(1)).min(1, "Provide at least one acceptable answer"),
});

export const ReadingQuestionSchema = z.discriminatedUnion("type", [
  MCQuestionSchema,
  SAQuestionSchema,
]);

// ─── Interrogation ────────────────────────────────────────────────────────────

export const QuestionItemSchema = z.object({
  id: z.string().min(1),
  spanish: z.string().min(1, "Spanish question required"),
  english: z.string().min(1, "English translation required"),
  response: z.string().min(1, "Spanish response required"),
  responseEnglish: z.string().min(1, "English response required"),
  infoRevealed: z.string().optional(), // display text added to notepad
  isUseful: z.boolean(),
});

export const InterrogationCharacterSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),            // e.g., "la tía"
  imageUrl: z.string().optional(),
  imageSeed: z.number().int().optional(),
  description: z.string().min(1),
});

export const InterrogationStageSchema = z.object({
  type: z.literal("interrogation"),
  clueReward: z.string().optional(),
  character: InterrogationCharacterSchema,
  questionBank: z.array(QuestionItemSchema).min(4).max(12),
  requiredInfo: z.array(z.string().min(1)).min(1),
  maxQuestions: z.number().int().min(2).max(10),
}).refine(
  (d) => d.requiredInfo.every((req) => d.questionBank.some((q) => q.infoRevealed === req)),
  { message: "Every requiredInfo item must match an infoRevealed value in the questionBank", path: ["requiredInfo"] }
);

// ─── Chase Map ────────────────────────────────────────────────────────────────

export const ChaseLocationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  coordinates: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }),
});

// ─── Sentence Builder (multi-sentence) ───────────────────────────────────────

export const SentenceItemSchema = z.object({
  sentence: z.string().min(1, "Sentence required"),
  translation: z.string().min(1, "Translation required"),
});

// ─── Suspects ─────────────────────────────────────────────────────────────────

export const SuspectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Suspect alias required"),
  realName: z.string().min(1),
  age: z.number().int().min(10).max(80),
  description: z.string().min(20, "Description must be at least 20 characters (2-3 Spanish sentences)"),
  imageSeed: z.number().int().min(1).max(70, "pravatar.cc supports seeds 1-70"),
  imageUrl: z.string().optional(), // explicit URL overrides imageSeed — use for guaranteed gender/appearance
});

// ─── Stages ───────────────────────────────────────────────────────────────────

export const CutsceneStageSchema = z.object({
  type: z.literal("cutscene"),
  videoUrl: z.string().min(1),
  subtitleUrl: z.string().optional(),
  fallbackImage: z.string().optional(),
  chiefName: z.string().min(1),
  chiefImageSeed: z.number().int().min(1).max(70),
  briefingLines: z.array(z.string().min(1)).min(3, "Include at least 3 briefing lines"),
});

export const VocabMatchStageSchema = z.object({
  type: z.literal("vocabMatch"),
  pairs: z.array(VocabPairSchema)
    .min(4, "Include at least 4 vocab pairs")
    .max(12, "Maximum 12 pairs (too many is overwhelming)"),
});

export const DialogueStageSchema = z.object({
  type: z.literal("dialogueChoice"),
  clueReward: z.string().optional(),
  npcName: z.string().min(1, "NPC name required"),
  npcAvatar: z.string().optional(),
  startNodeId: z.string().min(1),
  nodes: z.array(DialogueNodeSchema).min(2, "Need at least 2 nodes (one question + one end)"),
});

export const ReadingStageSchema = z.object({
  type: z.literal("readingComp"),
  clueReward: z.string().optional(),
  passage: z.string().min(50, "Passage must be at least 50 characters"),
  glossary: z.array(GlossaryEntrySchema),
  questions: z.array(ReadingQuestionSchema)
    .min(2, "Include at least 2 questions")
    .max(5, "Maximum 5 questions"),
});

export const ListeningStageSchema = z.object({
  type: z.literal("listeningComp"),
  clueReward: z.string().optional(),
  audioUrl: z.string().min(1, "Audio file URL required"),
  transcript: z.string().optional(),
  question: z.string().min(1, "Question required"),
  options: z.array(z.string().min(1)).length(4, "Exactly 4 answer options required"),
  correctIndex: z.number().int().min(0).max(3),
  maxReplays: z.number().int().min(1).max(5).optional(),
});

export const LineupStageSchema = z.object({
  type: z.literal("lineup"),
  suspects: z.array(SuspectSchema).length(4, "The lineup must have exactly 4 suspects"),
  correctSuspectId: z.string().min(1),
  hint: z.string().min(10, "Hint must be descriptive enough to guide students"),
}).refine(
  (data) => data.suspects.some((s) => s.id === data.correctSuspectId),
  { message: "correctSuspectId must match one of the suspect ids", path: ["correctSuspectId"] }
);

export const ChaseMapStageSchema = z.object({
  type: z.literal("chaseMap"),
  clueReward: z.string().optional(),
  locations: z.array(ChaseLocationSchema).min(4).max(12),
  correctRoute: z.array(z.string().min(1)).min(2),
  clues: z.array(z.string().min(1)).min(1),
  wrongPenalty: z.number().int().min(5).max(60).optional(),
}).refine(
  (d) => d.clues.length >= d.correctRoute.length,
  { message: "Must have at least one clue per route step", path: ["clues"] }
).refine(
  (d) => d.correctRoute.every((id) => d.locations.some((l) => l.id === id)),
  { message: "All correctRoute IDs must exist in locations", path: ["correctRoute"] }
);

export const SentenceBuilderStageSchema = z.object({
  type: z.literal("sentenceBuilder"),
  clueReward: z.string().optional(),
  sentences: z.array(SentenceItemSchema).min(1).max(10),
});

export const FlashcardItemSchema = z.object({
  prompt: z.string().min(1),
  answer: z.string().min(1),
});

export const TimedFlashcardsStageSchema = z.object({
  type: z.literal("timedFlashcards"),
  clueReward: z.string().optional(),
  title: z.string().optional(),
  cards: z.array(FlashcardItemSchema).min(4).max(30),
  timeLimit: z.number().int().min(15).max(300),
});

export const StageSchema = z.discriminatedUnion("type", [
  CutsceneStageSchema,
  VocabMatchStageSchema,
  DialogueStageSchema,
  ReadingStageSchema,
  ListeningStageSchema,
  LineupStageSchema,
  ChaseMapStageSchema,
  SentenceBuilderStageSchema,
  InterrogationStageSchema,
  TimedFlashcardsStageSchema,
]);

// ─── Unit root ────────────────────────────────────────────────────────────────

export const UnitContentSchema = z.object({
  unitNumber: z.number().int().min(1).max(10),
  country: z.string().min(1),
  city: z.string().min(1),
  caseTitle: z.string().min(1),
  caseDescription: z.string().min(10),
  criminalName: z.string().min(1),
  vocab: z.array(VocabPairSchema).min(1),
  stages: z.array(StageSchema)
    .min(3, "Each unit must have at least 3 stages")
    .max(10, "Maximum 10 stages per unit"),
}).refine(
  (data) => data.stages[0]?.type === "cutscene",
  { message: "First stage must be a cutscene", path: ["stages", "0"] }
);

export type UnitContentInput = z.input<typeof UnitContentSchema>;
export type UnitContentOutput = z.output<typeof UnitContentSchema>;
