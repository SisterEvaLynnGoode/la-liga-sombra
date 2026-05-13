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

export const StageSchema = z.discriminatedUnion("type", [
  CutsceneStageSchema,
  VocabMatchStageSchema,
  DialogueStageSchema,
  ReadingStageSchema,
  ListeningStageSchema,
  LineupStageSchema,
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
    .length(6, "Each unit must have exactly 6 stages: cutscene, vocabMatch, dialogueChoice, readingComp, listeningComp, lineup"),
}).refine(
  (data) => {
    const types = data.stages.map((s) => s.type);
    const expected = ["cutscene", "vocabMatch", "dialogueChoice", "readingComp", "listeningComp", "lineup"];
    return expected.every((t, i) => types[i] === t);
  },
  { message: "Stages must appear in order: cutscene → vocabMatch → dialogueChoice → readingComp → listeningComp → lineup", path: ["stages"] }
);

export type UnitContentInput = z.input<typeof UnitContentSchema>;
export type UnitContentOutput = z.output<typeof UnitContentSchema>;
