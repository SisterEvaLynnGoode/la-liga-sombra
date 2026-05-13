"use client";

import { useState, useCallback } from "react";
import { UnitContentSchema } from "@/lib/content-schema";
import VocabCsvImporter from "@/components/author/VocabCsvImporter";
import dynamic from "next/dynamic";

// Dynamically import game components to avoid SSR issues
const VocabMatch = dynamic(() => import("@/components/games/VocabMatch"), { ssr: false });
const DialogueChoice = dynamic(() => import("@/components/games/DialogueChoice"), { ssr: false });
const ReadingComprehension = dynamic(() => import("@/components/games/ReadingComprehension"), { ssr: false });
const ListeningComprehension = dynamic(() => import("@/components/games/ListeningComprehension"), { ssr: false });

type Step = "meta" | "vocab" | "dialogue" | "reading" | "listening" | "lineup";

const STEPS: Array<{ id: Step; label: string; emoji: string }> = [
  { id: "meta",      label: "Información",  emoji: "📋" },
  { id: "vocab",     label: "Vocabulario",  emoji: "📚" },
  { id: "dialogue",  label: "Diálogo",      emoji: "💬" },
  { id: "reading",   label: "Lectura",      emoji: "📖" },
  { id: "listening", label: "Audio",        emoji: "🎧" },
  { id: "lineup",    label: "Sospechosos",  emoji: "🔎" },
];

const EMPTY_STATE = {
  unitNumber: 2,
  country: "",
  city: "",
  caseTitle: "",
  caseDescription: "",
  criminalName: "",
  vocab: [{ spanish: "", english: "" }, { spanish: "", english: "" }],
  dialogue: {
    clueReward: "",
    npcName: "",
    npcAvatar: "👴",
    startNodeId: "start",
    nodes: [
      { id: "start", npcLine: "", options: [
        { text: "", isCorrect: true, feedback: "", nextNodeId: "clue" },
        { text: "", isCorrect: false, feedback: "" },
        { text: "", isCorrect: false, feedback: "" },
      ]},
      { id: "clue", npcLine: "", options: [
        { text: "", isCorrect: true, feedback: "", nextNodeId: "end" },
        { text: "", isCorrect: false, feedback: "" },
      ]},
      { id: "end", npcLine: "", isEnd: true, endMessage: "" },
    ],
  },
  reading: {
    clueReward: "",
    passage: "",
    glossary: [{ word: "", translation: "" }],
    questions: [
      { id: "r1", text: "", type: "multiple_choice" as const, options: ["", "", "", ""], correctIndex: 0 },
      { id: "r2", text: "", type: "short_answer" as const, acceptableAnswers: [""] },
    ],
  },
  listening: {
    clueReward: "",
    audioUrl: "",
    transcript: "",
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    maxReplays: 3,
  },
  lineup: {
    hint: "",
    correctSuspectId: "suspect-a",
    suspects: [
      { id: "suspect-a", name: "", realName: "", age: 35, description: "", imageSeed: 12 },
      { id: "suspect-b", name: "", realName: "", age: 28, description: "", imageSeed: 25 },
      { id: "suspect-c", name: "", realName: "", age: 50, description: "", imageSeed: 57 },
      { id: "suspect-d", name: "", realName: "", age: 22, description: "", imageSeed: 44 },
    ],
  },
};

type AuthorState = typeof EMPTY_STATE;

function buildUnitJSON(s: AuthorState) {
  return {
    unitNumber: s.unitNumber,
    country: s.country,
    city: s.city,
    caseTitle: s.caseTitle,
    caseDescription: s.caseDescription,
    criminalName: s.criminalName,
    vocab: s.vocab.filter((v) => v.spanish && v.english),
    stages: [
      {
        type: "cutscene",
        videoUrl: `/videos/unit-0${s.unitNumber}-intro.mp4`,
        subtitleUrl: `/videos/unit-0${s.unitNumber}-intro.vtt`,
        chiefName: "Jefe Ramírez",
        chiefImageSeed: 60,
        briefingLines: [
          "Bienvenido de nuevo, agente. Tenemos una nueva misión urgente.",
          `Alguien ha robado algo importante en ${s.city}, ${s.country}.`,
          `El sospechoso se llama '${s.criminalName}'.`,
          "Todos los testigos solo hablan español — tus habilidades serán esenciales.",
          "¿Estás listo para la misión? ¡Buena suerte!",
        ],
      },
      { type: "vocabMatch", pairs: s.vocab.filter((v) => v.spanish && v.english) },
      { type: "dialogueChoice", ...s.dialogue },
      { type: "readingComp", ...s.reading },
      { type: "listeningComp", ...s.listening },
      { type: "lineup", ...s.lineup },
    ],
  };
}

// ── Field helpers ─────────────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] mb-1.5">{label}</label>
      {children}
      {hint && <p className="font-typewriter text-[10px] text-[#4a3a2a] mt-1">{hint}</p>}
    </div>
  );
}

const INPUT = "w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-2 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] transition-colors";
const TEXTAREA = INPUT + " resize-y min-h-[80px]";

// ── Author client ─────────────────────────────────────────────────────────────

export default function AuthorClient() {
  const [step, setStep] = useState<Step>("meta");
  const [state, setState] = useState<AuthorState>(EMPTY_STATE);
  const [preview, setPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showCsvImporter, setShowCsvImporter] = useState(false);

  const set = useCallback(<K extends keyof AuthorState>(key: K, val: AuthorState[K]) => {
    setState((s) => ({ ...s, [key]: val }));
  }, []);

  function validate() {
    const result = UnitContentSchema.safeParse(buildUnitJSON(state));
    if (result.success) {
      setValidationErrors([]);
      return true;
    }
    setValidationErrors(result.error.issues.map((i) => `${i.path.join(" › ")}: ${i.message}`));
    return false;
  }

  function handleDownload() {
    const json = buildUnitJSON(state);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unit-0${state.unitNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const noop = useCallback(() => {}, []);

  return (
    <div className="min-h-screen bg-[#0c0e14] flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-[rgba(201,147,58,0.15)] bg-[#111218] px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">Panel del Maestro</p>
          <h1 className="font-display font-bold text-lg text-[#e8b455]">Crear Nueva Unidad</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={validate}
            className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-[rgba(201,147,58,0.25)] text-[#8b7355] hover:text-[#c9933a] transition-colors"
          >
            ✓ Validar
          </button>
          <button
            onClick={handleDownload}
            className="clip-skew px-5 py-2 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.1)] text-[#e8b455] border border-[rgba(201,147,58,0.3)] hover:bg-[rgba(201,147,58,0.2)] transition-colors"
          >
            ↓ Descargar JSON
          </button>
          <a href="/teacher/dashboard" className="font-typewriter text-[10px] text-[#8b7355] hover:text-[#c9933a] transition-colors">
            ← Dashboard
          </a>
        </div>
      </header>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="border-b border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)] px-6 py-3">
          <p className="font-typewriter text-[10px] uppercase text-[#c0392b] mb-1">Errores de validación:</p>
          {validationErrors.map((e, i) => (
            <p key={i} className="font-typewriter text-xs text-[#c0392b]">• {e}</p>
          ))}
        </div>
      )}

      {validationErrors.length === 0 && (
        <div className="border-b border-[rgba(201,147,58,0.1)] bg-[rgba(201,147,58,0.03)] px-6 py-2">
          <p className="font-typewriter text-[10px] text-[#4a3a2a]">
            Fill in each section → Validate → Download JSON → drop in <code className="text-[#8b7355]">/content/</code> → commit.
            Run <code className="text-[#8b7355]">npm run validate</code> locally to double-check.
          </p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Step nav */}
        <nav className="shrink-0 w-44 border-r border-[rgba(201,147,58,0.1)] bg-[#111218] flex flex-col py-4 gap-1">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => { setStep(s.id); setPreview(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 font-typewriter text-xs tracking-[0.15em] uppercase transition-all text-left ${
                step === s.id
                  ? "bg-[rgba(201,147,58,0.1)] text-[#e8b455] border-r-2 border-[#c9933a]"
                  : "text-[#8b7355] hover:text-[#c4a882]"
              }`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        {/* Main content: form + preview side by side */}
        <div className="flex-1 flex overflow-hidden">
          {/* Form pane */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 min-w-0">
            {step === "meta" && <MetaForm state={state} set={set} />}
            {step === "vocab" && (
              <VocabForm
                state={state}
                set={set}
                onImportCsv={() => setShowCsvImporter(true)}
              />
            )}
            {step === "dialogue" && <DialogueForm state={state} set={set} />}
            {step === "reading" && <ReadingForm state={state} set={set} />}
            {step === "listening" && <ListeningForm state={state} set={set} />}
            {step === "lineup" && <LineupForm state={state} set={set} />}

            {/* Preview toggle */}
            <button
              onClick={() => setPreview((v) => !v)}
              className="font-typewriter text-xs text-[#c9933a] hover:underline mt-2"
            >
              {preview ? "▲ Hide preview" : "▼ Show live preview"}
            </button>
          </div>

          {/* Preview pane */}
          {preview && (
            <div className="w-[480px] shrink-0 border-l border-[rgba(201,147,58,0.15)] bg-[#0d0b0a] overflow-y-auto">
              <div className="px-4 py-2 border-b border-[rgba(201,147,58,0.1)]">
                <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">Vista previa en vivo</p>
              </div>
              <div className="h-[600px] overflow-y-auto">
                {step === "vocab" && state.vocab.filter(v => v.spanish && v.english).length >= 2 && (
                  <VocabMatch
                    key={JSON.stringify(state.vocab)}
                    pairs={state.vocab.filter((v) => v.spanish && v.english)}
                    onComplete={noop}
                  />
                )}
                {step === "dialogue" && state.dialogue.nodes.length >= 2 && (
                  <DialogueChoice
                    key={JSON.stringify(state.dialogue)}
                    npcName={state.dialogue.npcName || "Testigo"}
                    npcAvatar={state.dialogue.npcAvatar}
                    nodes={state.dialogue.nodes as import("@/lib/games/types").DialogueNode[]}
                    startNodeId={state.dialogue.startNodeId}
                    onComplete={noop}
                  />
                )}
                {step === "reading" && state.reading.passage.length > 10 && (
                  <ReadingComprehension
                    key={state.reading.passage.slice(0, 20)}
                    passage={state.reading.passage}
                    glossary={state.reading.glossary.filter((g) => g.word && g.translation)}
                    questions={state.reading.questions.filter((q) => q.text) as import("@/lib/games/types").ReadingQuestion[]}
                    onComplete={noop}
                  />
                )}
                {step === "listening" && state.listening.question && (
                  <ListeningComprehension
                    key={state.listening.question}
                    audioUrl={state.listening.audioUrl || "/audio/placeholder.mp3"}
                    transcript={state.listening.transcript}
                    question={state.listening.question}
                    options={state.listening.options}
                    correctIndex={state.listening.correctIndex}
                    maxReplays={state.listening.maxReplays}
                    onComplete={noop}
                  />
                )}
                {!["vocab","dialogue","reading","listening"].includes(step) && (
                  <div className="flex items-center justify-center h-full">
                    <p className="font-typewriter text-xs text-[#4a3a2a] text-center px-6">
                      {step === "meta" ? "Fill in unit info — no preview for metadata." : ""}
                      {step === "lineup" ? "Lineup preview is in the game itself. Fill in suspects and download to test." : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSV importer modal */}
      {showCsvImporter && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-[#1a1614] border border-[rgba(201,147,58,0.3)] p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display font-bold text-lg text-[#f5e6c8]">Importar Vocabulario (CSV)</h2>
              <button onClick={() => setShowCsvImporter(false)} className="font-typewriter text-[#8b7355] hover:text-[#f5e6c8]">✕</button>
            </div>
            <VocabCsvImporter
              onImport={(pairs) => {
                set("vocab", [...state.vocab.filter(v => v.spanish && v.english), ...pairs]);
                setShowCsvImporter(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Form sections ─────────────────────────────────────────────────────────────

function MetaForm({ state, set }: { state: AuthorState; set: (k: keyof AuthorState, v: AuthorState[keyof AuthorState]) => void }) {
  return (
    <div className="space-y-4 max-w-lg">
      <SectionHead title="Información de la unidad" />
      <Field label="Número de unidad (2-10)">
        <input type="number" min={2} max={10} value={state.unitNumber} onChange={e => set("unitNumber", parseInt(e.target.value) || 2)} className={INPUT} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="País"><input type="text" value={state.country} onChange={e => set("country", e.target.value)} placeholder="España" className={INPUT} /></Field>
        <Field label="Ciudad"><input type="text" value={state.city} onChange={e => set("city", e.target.value)} placeholder="Madrid" className={INPUT} /></Field>
      </div>
      <Field label="Título del caso"><input type="text" value={state.caseTitle} onChange={e => set("caseTitle", e.target.value)} placeholder="El Misterio del..." className={INPUT} /></Field>
      <Field label="Descripción del caso" hint="1-2 sentences summarizing what was stolen and why."><textarea value={state.caseDescription} onChange={e => set("caseDescription", e.target.value)} className={TEXTAREA} placeholder="Algo valioso fue robado de..." /></Field>
      <Field label="Nombre del criminal (alias)"><input type="text" value={state.criminalName} onChange={e => set("criminalName", e.target.value)} placeholder="El Camaleón" className={INPUT} /></Field>
    </div>
  );
}

function VocabForm({ state, set, onImportCsv }: { state: AuthorState; set: (k: keyof AuthorState, v: AuthorState[keyof AuthorState]) => void; onImportCsv: () => void }) {
  const pairs = state.vocab;
  function update(i: number, field: "spanish" | "english", val: string) {
    const next = pairs.map((p, j) => j === i ? { ...p, [field]: val } : p);
    set("vocab", next);
  }
  function addPair() { set("vocab", [...pairs, { spanish: "", english: "" }]); }
  function removePair(i: number) { set("vocab", pairs.filter((_, j) => j !== i)); }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center justify-between">
        <SectionHead title="Pares de vocabulario" />
        <button onClick={onImportCsv} className="font-typewriter text-[10px] text-[#c9933a] hover:underline">↑ Importar CSV</button>
      </div>
      <p className="font-typewriter text-[10px] text-[#8b7355]">Add 6-10 pairs. These are used in the VocabMatch game.</p>
      {pairs.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="font-typewriter text-[10px] text-[#4a3a2a] w-5 shrink-0">{i + 1}</span>
          <input type="text" value={p.spanish} onChange={e => update(i, "spanish", e.target.value)} placeholder="español" className={INPUT + " flex-1"} />
          <span className="text-[#4a3a2a]">↔</span>
          <input type="text" value={p.english} onChange={e => update(i, "english", e.target.value)} placeholder="english" className={INPUT + " flex-1"} />
          <button onClick={() => removePair(i)} aria-label="Remove pair" className="font-typewriter text-xs text-[#4a3a2a] hover:text-[#c0392b] px-1">✕</button>
        </div>
      ))}
      <button onClick={addPair} className="font-typewriter text-xs text-[#c9933a] hover:underline">+ Añadir par</button>
    </div>
  );
}

function DialogueForm({ state, set }: { state: AuthorState; set: (k: keyof AuthorState, v: AuthorState[keyof AuthorState]) => void }) {
  const d = state.dialogue;
  function updateD(patch: Partial<typeof d>) { set("dialogue", { ...d, ...patch }); }
  function updateNode(idx: number, patch: Partial<typeof d.nodes[0]>) {
    const nodes = d.nodes.map((n, i) => i === idx ? { ...n, ...patch } : n) as typeof d.nodes;
    updateD({ nodes });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function updateOption(nodeIdx: number, optIdx: number, patch: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateNode(nodeIdx, { options: d.nodes[nodeIdx].options?.map((o, i) => i === optIdx ? { ...o, ...patch } : o) } as any);
  }

  return (
    <div className="space-y-5 max-w-xl">
      <SectionHead title="Entrevista al testigo (diálogo)" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nombre del testigo"><input type="text" value={d.npcName} onChange={e => updateD({ npcName: e.target.value })} placeholder="Don Rodrigo" className={INPUT} /></Field>
        <Field label="Emoji del testigo"><input type="text" value={d.npcAvatar} onChange={e => updateD({ npcAvatar: e.target.value })} placeholder="👴" className={INPUT} /></Field>
      </div>
      <Field label="Pista revelada (clue reward)" hint="Shown to students after they complete this stage.">
        <input type="text" value={d.clueReward} onChange={e => updateD({ clueReward: e.target.value })} placeholder="El sospechoso lleva un sombrero negro..." className={INPUT} />
      </Field>

      {d.nodes.map((node, ni) => (
        <div key={node.id} className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] p-4 space-y-3">
          <p className="font-typewriter text-[10px] uppercase text-[#8b7355]">
            Nodo: <span className="text-[#e8b455]">{node.id}</span>
            {node.isEnd && " (fin)"}
          </p>
          {node.isEnd ? (
            <Field label="Mensaje final">
              <input type="text" value={node.endMessage ?? ""} onChange={e => updateNode(ni, { endMessage: e.target.value })} placeholder="¡De nada, detective! ..." className={INPUT} />
            </Field>
          ) : (
            <>
              <Field label="Línea del NPC">
                <textarea value={node.npcLine} onChange={e => updateNode(ni, { npcLine: e.target.value })} className={TEXTAREA + " min-h-[60px]"} placeholder="¿Qué dice el testigo?" />
              </Field>
              {node.options?.map((opt, oi) => (
                <div key={oi} className={`pl-3 border-l-2 ${opt.isCorrect ? "border-[#4ade80]" : "border-[#4a3a2a]"} space-y-2`}>
                  <div className="flex items-center gap-2">
                    <input type="text" value={opt.text} onChange={e => updateOption(ni, oi, { text: e.target.value })} placeholder={`Option ${String.fromCharCode(65+oi)}`} className={INPUT + " flex-1 text-xs"} />
                    <label className="flex items-center gap-1 font-typewriter text-[10px] text-[#8b7355] shrink-0">
                      <input type="checkbox" checked={opt.isCorrect} onChange={e => updateOption(ni, oi, { isCorrect: e.target.checked })} className="accent-[#c9933a]" />
                      Correct
                    </label>
                  </div>
                  {!opt.isCorrect && (
                    <input type="text" value={opt.feedback ?? ""} onChange={e => updateOption(ni, oi, { feedback: e.target.value })} placeholder="Feedback if wrong..." className={INPUT + " text-xs"} />
                  )}
                  {opt.isCorrect && (
                    <input type="text" value={opt.nextNodeId ?? ""} onChange={e => updateOption(ni, oi, { nextNodeId: e.target.value })} placeholder="Next node id..." className={INPUT + " text-xs"} />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function ReadingForm({ state, set }: { state: AuthorState; set: (k: keyof AuthorState, v: AuthorState[keyof AuthorState]) => void }) {
  const r = state.reading;
  function updateR(patch: Partial<typeof r>) { set("reading", { ...r, ...patch }); }
  return (
    <div className="space-y-4 max-w-xl">
      <SectionHead title="Comprensión lectora" />
      <Field label="Pista revelada"><input type="text" value={r.clueReward} onChange={e => updateR({ clueReward: e.target.value })} placeholder="El sospechoso..." className={INPUT} /></Field>
      <Field label="Pasaje en español" hint="50-150 words. This is the document the thief left behind.">
        <textarea value={r.passage} onChange={e => updateR({ passage: e.target.value })} className={TEXTAREA + " min-h-[140px]"} placeholder="Querida guitarra,&#10;Finalmente te tengo. Me llamo..." />
      </Field>
      <div>
        <label className="block font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] mb-1.5">Glosario (clickable words)</label>
        {r.glossary.map((g, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="text" value={g.word} onChange={e => updateR({ glossary: r.glossary.map((x, j) => j===i ? {...x, word: e.target.value} : x) })} placeholder="word" className={INPUT + " flex-1 text-xs"} />
            <input type="text" value={g.translation} onChange={e => updateR({ glossary: r.glossary.map((x, j) => j===i ? {...x, translation: e.target.value} : x) })} placeholder="translation" className={INPUT + " flex-1 text-xs"} />
            <button onClick={() => updateR({ glossary: r.glossary.filter((_, j) => j!==i) })} aria-label="Remove" className="text-[#4a3a2a] hover:text-[#c0392b] font-typewriter text-xs px-1">✕</button>
          </div>
        ))}
        <button onClick={() => updateR({ glossary: [...r.glossary, { word: "", translation: "" }] })} className="font-typewriter text-xs text-[#c9933a] hover:underline">+ Añadir palabra</button>
      </div>
      <p className="font-typewriter text-[10px] text-[#4a3a2a]">Questions: edit via the live preview or the downloaded JSON. (Form for questions coming soon.)</p>
    </div>
  );
}

function ListeningForm({ state, set }: { state: AuthorState; set: (k: keyof AuthorState, v: AuthorState[keyof AuthorState]) => void }) {
  const l = state.listening;
  function updateL(patch: Partial<typeof l>) { set("listening", { ...l, ...patch }); }
  return (
    <div className="space-y-4 max-w-lg">
      <SectionHead title="Comprensión auditiva" />
      <Field label="Pista revelada"><input type="text" value={l.clueReward} onChange={e => updateL({ clueReward: e.target.value })} placeholder="El sospechoso..." className={INPUT} /></Field>
      <Field label="URL del audio" hint="Drop .mp3 in /public/audio/unit-0N/ — reference as /audio/unit-0N/phone-call.mp3">
        <input type="text" value={l.audioUrl} onChange={e => updateL({ audioUrl: e.target.value })} placeholder="/audio/unit-02/phone-call.mp3" className={INPUT} />
      </Field>
      <Field label="Transcripción (opcional — shown after correct answer)">
        <textarea value={l.transcript} onChange={e => updateL({ transcript: e.target.value })} className={TEXTAREA} placeholder="Oye, ya tengo..." />
      </Field>
      <Field label="Pregunta"><input type="text" value={l.question} onChange={e => updateL({ question: e.target.value })} placeholder="Según la llamada, ¿qué característica tiene el sospechoso?" className={INPUT} /></Field>
      <div className="space-y-2">
        <label className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">4 opciones (correct index: 0-3)</label>
        <div className="flex items-center gap-2 mb-1">
          <label className="font-typewriter text-[10px] text-[#8b7355]">Correct answer index:</label>
          <select value={l.correctIndex} onChange={e => updateL({ correctIndex: parseInt(e.target.value) })} className="bg-[#1a1614] border border-[rgba(201,147,58,0.2)] px-2 py-1 font-typewriter text-xs text-[#f5e6c8]">
            {[0,1,2,3].map(i => <option key={i} value={i}>{i} ({String.fromCharCode(65+i)})</option>)}
          </select>
        </div>
        {l.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`font-typewriter text-[10px] w-4 shrink-0 ${l.correctIndex === i ? "text-[#4ade80]" : "text-[#4a3a2a]"}`}>{String.fromCharCode(65+i)}.</span>
            <input type="text" value={opt} onChange={e => updateL({ options: l.options.map((o, j) => j===i ? e.target.value : o) })} placeholder={`Option ${String.fromCharCode(65+i)}`} className={INPUT + " flex-1 text-xs"} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LineupForm({ state, set }: { state: AuthorState; set: (k: keyof AuthorState, v: AuthorState[keyof AuthorState]) => void }) {
  const l = state.lineup;
  function updateL(patch: Partial<typeof l>) { set("lineup", { ...l, ...patch }); }
  function updateSuspect(i: number, patch: Partial<typeof l.suspects[0]>) {
    updateL({ suspects: l.suspects.map((s, j) => j===i ? { ...s, ...patch } : s) });
  }
  return (
    <div className="space-y-5 max-w-xl">
      <SectionHead title="Rueda de reconocimiento (4 sospechosos)" />
      <Field label="Pista general (hint shown after 1 wrong answer)">
        <textarea value={l.hint} onChange={e => updateL({ hint: e.target.value })} className={TEXTAREA + " min-h-[60px]"} placeholder="Recuerda las pistas: [clue 1], [clue 2], [clue 3]. ¿Quién tiene TODAS?" />
      </Field>
      <div className="flex items-center gap-2">
        <label className="font-typewriter text-[10px] uppercase text-[#8b7355]">Sospechoso correcto (id):</label>
        <select value={l.correctSuspectId} onChange={e => updateL({ correctSuspectId: e.target.value })} className="bg-[#1a1614] border border-[rgba(201,147,58,0.2)] px-2 py-1 font-typewriter text-xs text-[#f5e6c8]">
          {l.suspects.map(s => <option key={s.id} value={s.id}>{s.id} ({s.name || "unnamed"})</option>)}
        </select>
      </div>
      {l.suspects.map((s, i) => (
        <div key={s.id} className={`border p-4 space-y-3 ${s.id === l.correctSuspectId ? "border-[rgba(201,147,58,0.3)]" : "border-[rgba(201,147,58,0.1)]"} bg-[#1a1614]`}>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.pravatar.cc/48?img=${s.imageSeed}`} alt="" width={48} height={48} className="rounded-sm grayscale shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="flex gap-2">
                <input type="text" value={s.name} onChange={e => updateSuspect(i, { name: e.target.value })} placeholder="Alias" className={INPUT + " flex-1 text-xs"} />
                <input type="text" value={s.realName} onChange={e => updateSuspect(i, { realName: e.target.value })} placeholder="Real name" className={INPUT + " flex-1 text-xs"} />
              </div>
              <div className="flex gap-2">
                <input type="number" value={s.age} onChange={e => updateSuspect(i, { age: parseInt(e.target.value) || 0 })} placeholder="Age" className={INPUT + " w-20 text-xs"} />
                <input type="number" min={1} max={70} value={s.imageSeed} onChange={e => updateSuspect(i, { imageSeed: parseInt(e.target.value) || 1 })} placeholder="Photo seed (1-70)" className={INPUT + " flex-1 text-xs"} />
              </div>
            </div>
          </div>
          <Field label="Descripción en español (2-3 oraciones)">
            <textarea value={s.description} onChange={e => updateSuspect(i, { description: e.target.value })} className={TEXTAREA + " min-h-[70px]"} placeholder="Es un hombre alto y delgado. Tiene bigote negro. Es de..." />
          </Field>
        </div>
      ))}
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div>
      <h2 className="font-display font-bold text-lg text-[#f5e6c8]">{title}</h2>
      <div className="h-px bg-gradient-to-r from-[rgba(201,147,58,0.3)] to-transparent mt-1" />
    </div>
  );
}
