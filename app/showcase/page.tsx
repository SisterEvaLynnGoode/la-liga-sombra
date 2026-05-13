"use client";

import { useState } from "react";
import VocabMatch from "@/components/games/VocabMatch";
import SentenceBuilder from "@/components/games/SentenceBuilder";
import DialogueChoice from "@/components/games/DialogueChoice";
import ListeningComprehension from "@/components/games/ListeningComprehension";
import ReadingComprehension from "@/components/games/ReadingComprehension";
import ConjugationDragDrop from "@/components/games/ConjugationDragDrop";
import TimedFlashcards from "@/components/games/TimedFlashcards";
import ChaseMap from "@/components/games/ChaseMap";
import Interrogation from "@/components/games/Interrogation";
import LiveStakeout from "@/components/games/LiveStakeout";
import type { GameResult } from "@/lib/games/types";
import type { DialogueNode, VocabPair, ReadingQuestion, GlossaryEntry, FlashcardItem } from "@/lib/games/types";
import type { ChaseLocation, QuestionItem, InterrogationCharacter, StakeoutScene } from "@/lib/types/unit-content";

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

const CHASE_LOCATIONS: ChaseLocation[] = [
  { id: "puerta_sol",  name: "Puerta del Sol",     coordinates: { x: 48, y: 50 } },
  { id: "museo_prado", name: "Museo del Prado",    coordinates: { x: 63, y: 67 } },
  { id: "retiro",      name: "Parque del Retiro",  coordinates: { x: 77, y: 53 } },
  { id: "gran_via",    name: "Gran Vía",            coordinates: { x: 35, y: 33 } },
  { id: "atocha",      name: "Estación de Atocha", coordinates: { x: 58, y: 83 } },
  { id: "plaza_mayor", name: "Plaza Mayor",         coordinates: { x: 42, y: 62 } },
  { id: "banco_espana",name: "Banco de España",    coordinates: { x: 62, y: 48 } },
];

const INTERROGATION_CHARACTER: InterrogationCharacter = {
  name: "Tía Elena",
  role: "la tía (sample — Unit 4)",
  imageUrl: "https://randomuser.me/api/portraits/women/20.jpg",
  description: "Es la esposa de Carlos, el hijo de la abuela. Es simpática y generosa, pero hoy está muy preocupada por el collar desaparecido.",
};

const INTERROGATION_QUESTIONS: QuestionItem[] = [
  {
    id: "q1",
    spanish: "¿Cómo se llama usted y quién es en la familia?",
    english: "What is your name and who are you in the family?",
    response: "Me llamo Elena Vargas de Montoya. Soy la esposa de Carlos, el hijo de la abuela Carmen.",
    responseEnglish: "My name is Elena Vargas de Montoya. I am the wife of Carlos, grandmother Carmen's son.",
    isUseful: false,
  },
  {
    id: "q2",
    spanish: "¿Dónde está usted esta mañana?",
    english: "Where are you this morning?",
    response: "Estoy en el mercado central de San José desde las ocho de la mañana. Tengo los recibos aquí en mi bolsa.",
    responseEnglish: "I am at the central market in San José since eight in the morning. I have the receipts right here in my bag.",
    infoRevealed: "📍 Está en el mercado de San José (tiene recibos como prueba)",
    isUseful: true,
  },
  {
    id: "q3",
    spanish: "¿Cómo está usted hoy?",
    english: "How are you feeling today?",
    response: "Estoy muy preocupada y un poco asustada. ¡El collar de la abuela es un objeto muy especial para toda la familia!",
    responseEnglish: "I am very worried and a little scared. Grandmother's necklace is a very special object for the whole family!",
    infoRevealed: "😟 Está preocupada y asustada — no está nerviosa por culpa",
    isUseful: true,
  },
  {
    id: "q4",
    spanish: "¿Le gusta el collar de la abuela?",
    english: "Do you like grandmother's necklace?",
    response: "Es muy bonito, pero no es mío. Es de la abuela — un regalo de su esposo. Yo nunca toco el collar.",
    responseEnglish: "It is very pretty, but it is not mine. It belongs to grandmother — a gift from her husband. I never touch the necklace.",
    isUseful: false,
  },
  {
    id: "q5",
    spanish: "¿Quién tiene acceso a la habitación de la abuela?",
    english: "Who has access to grandmother's room?",
    response: "Toda la familia puede entrar. Pero esta mañana, Marco está mucho tiempo en esa parte de la casa. Es raro.",
    responseEnglish: "The whole family can enter. But this morning, Marco spends a lot of time in that part of the house. That is strange.",
    infoRevealed: "💡 Marco está en la zona de la habitación de la abuela esta mañana",
    isUseful: true,
  },
  {
    id: "q6",
    spanish: "¿Cómo es Marco, el nieto?",
    english: "What is Marco, the grandson, like?",
    response: "Marco es inteligente, pero últimamente está muy raro. No habla mucho y parece nervioso. No sé por qué.",
    responseEnglish: "Marco is intelligent, but lately he has been very strange. He doesn't talk much and seems nervous. I don't know why.",
    isUseful: false,
  },
  {
    id: "q7",
    spanish: "¿Su esposo Carlos está en casa esta mañana?",
    english: "Is your husband Carlos home this morning?",
    response: "No, Carlos está en la finca de café desde las seis de la mañana. Es un hombre muy trabajador.",
    responseEnglish: "No, Carlos has been at the coffee farm since six in the morning. He is a very hard-working man.",
    isUseful: false,
  },
  {
    id: "q8",
    spanish: "¿Usted necesita dinero?",
    english: "Do you need money?",
    response: "¡No! Nuestra familia está bien económicamente. No necesitamos el dinero del collar. ¡Qué pregunta tan extraña!",
    responseEnglish: "No! Our family is doing fine financially. We don't need the necklace's money. What a strange question!",
    isUseful: false,
  },
  {
    id: "q9",
    spanish: "¿Le gusta vivir en la finca cerca del volcán?",
    english: "Do you like living on the farm near the volcano?",
    response: "¡Sí, me encanta! La vista del Volcán Arenal es preciosa. Es un lugar muy tranquilo y hermoso.",
    responseEnglish: "Yes, I love it! The view of Arenal Volcano is beautiful. It is a very peaceful and beautiful place.",
    isUseful: false,
  },
];

const STAKEOUT_SCENES: StakeoutScene[] = [
  { imageUrl: "https://picsum.photos/400/300?random=81", description: "Escenario principal", currentAction: "La cantante está cantando en el escenario", isTarget: false },
  { imageUrl: "https://picsum.photos/400/300?random=82", description: "Área del público",   currentAction: "Los turistas están tomando fotos del festival", isTarget: false },
  { imageUrl: "https://picsum.photos/400/300?random=83", description: "Zona de prensa",      currentAction: "El periodista está grabando la actuación", isTarget: false },
  { imageUrl: "https://picsum.photos/400/300?random=84", description: "Puerta trasera",      currentAction: "El técnico está saliendo con una bolsa negra", isTarget: true },
  { imageUrl: "https://picsum.photos/400/300?random=85", description: "Parque lateral",      currentAction: "Los músicos están descansando antes del show", isTarget: false },
  { imageUrl: "https://picsum.photos/400/300?random=86", description: "Entrada principal",   currentAction: "Los guardias están revisando los boletos", isTarget: false },
  { imageUrl: "https://picsum.photos/400/300?random=87", description: "Backstage norte",     currentAction: "Los bailarines están practicando su coreografía", isTarget: false },
  { imageUrl: "https://picsum.photos/400/300?random=88", description: "Camerinos",           currentAction: "Los artistas están preparándose para el concierto", isTarget: false },
];

const GAMES = [
  { id: "vocab",          label: "Memoria",        emoji: "🃏" },
  { id: "sentence",       label: "Oraciones",      emoji: "🧩" },
  { id: "dialogue",       label: "Diálogo",        emoji: "💬" },
  { id: "listening",      label: "Auditiva",       emoji: "🎧" },
  { id: "reading",        label: "Lectora",        emoji: "📖" },
  { id: "conjugation",    label: "Conjugación",    emoji: "✍️" },
  { id: "flashcards",     label: "Fichas",         emoji: "⚡" },
  { id: "chasemap",       label: "Persecución",    emoji: "🗺️" },
  { id: "interrogation",  label: "Interrogatorio", emoji: "🔦" },
  { id: "stakeout",       label: "Vigilancia",     emoji: "📹" },
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

        {active === "interrogation" && (
          <Interrogation
            key={gameKey}
            character={INTERROGATION_CHARACTER}
            questionBank={INTERROGATION_QUESTIONS}
            requiredInfo={[
              "📍 Está en el mercado de San José (tiene recibos como prueba)",
              "💡 Marco está en la zona de la habitación de la abuela esta mañana",
            ]}
            maxQuestions={5}
            onComplete={handleComplete}
          />
        )}

        {active === "stakeout" && (
          <LiveStakeout
            key={gameKey}
            scenes={STAKEOUT_SCENES}
            targetActionDescription="Busca al técnico que está saliendo por la puerta trasera del escenario con una bolsa negra grande"
            timeLimit={90}
            onComplete={handleComplete}
          />
        )}

        {active === "chasemap" && (
          <ChaseMap
            key={gameKey}
            locations={CHASE_LOCATIONS}
            correctRoute={["puerta_sol", "museo_prado", "retiro", "atocha"]}
            clues={[
              "¡La sospechosa va a la Puerta del Sol ahora mismo! ¡Corre!",
              "Ahora ella va al Museo del Prado a pie. ¡Síguela!",
              "¡Va al Parque del Retiro en taxi! ¡Rápido!",
              "¡Va a la Estación de Atocha en metro! ¡Es la última parada!",
            ]}
            wrongPenalty={15}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
