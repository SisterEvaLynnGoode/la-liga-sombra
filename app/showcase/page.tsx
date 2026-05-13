"use client";

import { useState } from "react";
import VocabMatch from "@/components/games/VocabMatch";
import SentenceBuilder from "@/components/games/SentenceBuilder";
import DialogueChoice from "@/components/games/DialogueChoice";
import ListeningComprehension from "@/components/games/ListeningComprehension";
import ReadingComprehension from "@/components/games/ReadingComprehension";
import ConjugationDragDrop from "@/components/games/ConjugationDragDrop";
import TimedFlashcards from "@/components/games/TimedFlashcards";
import type { GameResult } from "@/lib/games/types";
import type { DialogueNode, VocabPair, ReadingQuestion, GlossaryEntry, FlashcardItem } from "@/lib/games/types";

// ── Sample data (Unit 1 — México — Greetings & Intros) ──────────────────────

const VOCAB_PAIRS: VocabPair[] = [
  { spanish: "hola",          english: "hello" },
  { spanish: "adiós",         english: "goodbye" },
  { spanish: "gracias",       english: "thank you" },
  { spanish: "por favor",     english: "please" },
  { spanish: "buenos días",   english: "good morning" },
  { spanish: "me llamo",      english: "my name is" },
];

const DIALOGUE_NODES: DialogueNode[] = [
  {
    id: "start",
    npcLine: "¡Hola! ¿Cómo te llamas?",
    options: [
      { text: "Me llamo [tu nombre].", isCorrect: true, nextNodeId: "q2" },
      { text: "Tengo doce años.", isCorrect: false, feedback: "That tells your age! He asked for your name. Try again." },
      { text: "¡Adiós!", isCorrect: false, feedback: "We just started! Respond to his greeting." },
    ],
  },
  {
    id: "q2",
    npcLine: "¡Mucho gusto! ¿De dónde eres?",
    options: [
      { text: "Soy de los Estados Unidos.", isCorrect: true, nextNodeId: "q3" },
      { text: "Soy alto y simpático.", isCorrect: false, feedback: "That describes you, but he asked where you're from." },
      { text: "Me gusta la pizza.", isCorrect: false, feedback: "Great sentence, but answer where you're from!" },
    ],
  },
  {
    id: "q3",
    npcLine: "¡Qué interesante! ¿Cuántos años tienes?",
    options: [
      { text: "Tengo quince años.", isCorrect: true, nextNodeId: "end" },
      { text: "Soy de México.", isCorrect: false, feedback: "That's where you're from. He asked your age (años)." },
      { text: "Hablas español muy bien.", isCorrect: false, feedback: "That's a compliment for him — he asked your age." },
    ],
  },
  {
    id: "end",
    npcLine: "",
    isEnd: true,
    endMessage: "¡Excelente conversación! You introduced yourself perfectly.",
  },
];

const READING_PASSAGE = "Hola. Me llamo Carlos. Soy de México. Tengo quince años. Me gusta mucho el fútbol y la música. Mi familia es grande — tengo tres hermanos y una hermana.";

const READING_GLOSSARY: GlossaryEntry[] = [
  { word: "tengo",    translation: "I have / I am (age)" },
  { word: "años",     translation: "years old" },
  { word: "me gusta", translation: "I like" },
  { word: "mucho",    translation: "a lot / very much" },
  { word: "familia",  translation: "family" },
  { word: "grande",   translation: "big / large" },
  { word: "hermanos", translation: "brothers / siblings" },
  { word: "hermana",  translation: "sister" },
];

const READING_QUESTIONS: ReadingQuestion[] = [
  {
    id: "q1",
    text: "¿De dónde es Carlos?",
    type: "multiple_choice",
    options: ["De España", "De México", "De los Estados Unidos", "De Argentina"],
    correctIndex: 1,
  },
  {
    id: "q2",
    text: "¿Cuántos años tiene Carlos?",
    type: "short_answer",
    acceptableAnswers: ["quince", "15", "quince años", "15 años", "tiene quince años"],
  },
  {
    id: "q3",
    text: "¿Qué le gusta a Carlos?",
    type: "multiple_choice",
    options: ["El baloncesto y la lectura", "El fútbol y la música", "La pizza y el cine", "Las ciencias y el arte"],
    correctIndex: 1,
  },
  {
    id: "q4",
    text: "¿Cuántos hermanos tiene Carlos?",
    type: "short_answer",
    acceptableAnswers: ["tres", "3", "tres hermanos", "3 hermanos"],
  },
];

const FLASHCARDS: FlashcardItem[] = [
  { prompt: "hola",             answer: "hello" },
  { prompt: "adiós",           answer: "goodbye" },
  { prompt: "gracias",         answer: "thank you" },
  { prompt: "por favor",       answer: "please" },
  { prompt: "buenos días",     answer: "good morning" },
  { prompt: "buenas tardes",   answer: "good afternoon" },
  { prompt: "buenas noches",   answer: "good night" },
  { prompt: "¿Cómo te llamas?",answer: "what is your name" },
  { prompt: "me llamo",        answer: "my name is" },
  { prompt: "¿De dónde eres?", answer: "where are you from" },
];

// ── Game tab config ──────────────────────────────────────────────────────────

const GAMES = [
  { id: "vocab",     label: "Memoria",       emoji: "🃏" },
  { id: "sentence",  label: "Oraciones",     emoji: "🧩" },
  { id: "dialogue",  label: "Diálogo",       emoji: "💬" },
  { id: "listening", label: "Auditiva",      emoji: "🎧" },
  { id: "reading",   label: "Lectora",       emoji: "📖" },
  { id: "conjugation", label: "Conjugación", emoji: "✍️" },
  { id: "flashcards", label: "Fichas",       emoji: "⚡" },
] as const;

type GameId = (typeof GAMES)[number]["id"];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ShowcasePage() {
  const [active, setActive] = useState<GameId>("vocab");
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [gameKey, setGameKey] = useState(0); // force remount to reset

  function handleComplete(result: GameResult) {
    setLastResult(result);
  }

  function handleTabChange(id: GameId) {
    setActive(id);
    setLastResult(null);
    setGameKey((k) => k + 1);
  }

  function handleReset() {
    setLastResult(null);
    setGameKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-[#0d0b0a] flex flex-col">
      {/* Dev banner */}
      <div className="bg-[#2c1a08] border-b border-[rgba(201,147,58,0.3)] px-5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#c9933a]">
            🔧 Dev Mode
          </span>
          <span className="font-typewriter text-[10px] text-[#8b7355]">
            Game Showcase — sample data only, no tracking
          </span>
        </div>
        <a href="/" className="font-typewriter text-[10px] text-[#8b7355] hover:text-[#c9933a] transition-colors">
          ← Back to site
        </a>
      </div>

      {/* Tab nav */}
      <div className="border-b border-[rgba(201,147,58,0.15)] bg-[#110f0d] px-4 overflow-x-auto">
        <div className="flex gap-1 py-2 min-w-max">
          {GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => handleTabChange(g.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-typewriter text-xs tracking-[0.15em] uppercase transition-all focus:outline-none focus:ring-1 focus:ring-[#c9933a] rounded-sm
                ${active === g.id
                  ? "bg-[rgba(201,147,58,0.12)] border border-[rgba(201,147,58,0.3)] text-[#e8b455]"
                  : "text-[#8b7355] hover:text-[#c4a882] border border-transparent"
                }`}
            >
              <span>{g.emoji}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Last result strip */}
      {lastResult && (
        <div className="flex items-center justify-between px-5 py-2 bg-[rgba(201,147,58,0.06)] border-b border-[rgba(201,147,58,0.15)]">
          <div className="flex items-center gap-5 font-typewriter text-xs">
            <span className="text-[#8b7355]">Último resultado:</span>
            <span className="text-[#e8b455]">Score: {lastResult.score}/{lastResult.maxScore}</span>
            <span className="text-[#c4a882]">Time: {lastResult.timeSpent}s</span>
            <span className="text-[#c4a882]">Attempts: {lastResult.attempts}</span>
            {lastResult.isSkipped && <span className="text-[#c0392b]">Skipped</span>}
          </div>
          <button onClick={handleReset} className="font-typewriter text-[10px] text-[#c9933a] hover:underline">
            ↺ Play again
          </button>
        </div>
      )}

      {/* Game area */}
      <div className="flex-1">
        {active === "vocab" && (
          <VocabMatch key={gameKey} pairs={VOCAB_PAIRS} onComplete={handleComplete} />
        )}

        {active === "sentence" && (
          <SentenceBuilder
            key={gameKey}
            sentence="Hola me llamo Sofia y soy de México"
            translation="Hi, my name is Sofia and I'm from Mexico."
            onComplete={handleComplete}
          />
        )}

        {active === "dialogue" && (
          <DialogueChoice
            key={gameKey}
            npcName="Señor García"
            npcAvatar="👨‍🏫"
            nodes={DIALOGUE_NODES}
            startNodeId="start"
            onComplete={handleComplete}
          />
        )}

        {active === "listening" && (
          <ListeningComprehension
            key={gameKey}
            audioUrl="/placeholder-audio.mp3"
            question="¿Cómo se llama el chico en el audio?"
            options={["Me llamo Carlos", "Soy de España", "Buenos días", "Hasta luego"]}
            correctIndex={0}
            transcript="Hola, me llamo Carlos. Soy de México y tengo quince años."
            onComplete={handleComplete}
          />
        )}

        {active === "reading" && (
          <ReadingComprehension
            key={gameKey}
            passage={READING_PASSAGE}
            glossary={READING_GLOSSARY}
            questions={READING_QUESTIONS}
            onComplete={handleComplete}
          />
        )}

        {active === "conjugation" && (
          <ConjugationDragDrop
            key={gameKey}
            verb="hablar"
            tense="Presente de Indicativo"
            conjugations={{
              yo: "hablo",
              tu: "hablas",
              el: "habla",
              nosotros: "hablamos",
              vosotros: "habláis",
              ellos: "hablan",
            }}
            onComplete={handleComplete}
          />
        )}

        {active === "flashcards" && (
          <TimedFlashcards
            key={gameKey}
            cards={FLASHCARDS}
            timeLimit={60}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
