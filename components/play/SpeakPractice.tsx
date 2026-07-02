"use client";

/**
 * SpeakPractice — optional pronunciation practice via the browser's free
 * Web Speech API (Workstream B3). Renders nothing when the API is missing
 * (Firefox, some managed Chromebooks) and every term is skippable, so it can
 * never block progress. Results log to item_events with skill "speaking".
 */

import { useState, useRef } from "react";
import { normalizeAnswer } from "@/lib/games/utils";
import { logItemEvent, flushItemEvents } from "@/lib/events";

interface SpeakTerm {
  spanish: string;
  english: string;
}

interface Props {
  terms: SpeakTerm[];
  unitNumber: number;
}

// Minimal typings for the vendor-prefixed API (not in lib.dom for all targets)
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

type TermState = "idle" | "listening" | "correct" | "close" | "retry";

export default function SpeakPractice({ terms, unitNumber }: Props) {
  const [supported] = useState(() => getRecognition() !== null);
  const [states, setStates] = useState<Record<number, TermState>>({});
  const [heard, setHeard] = useState<Record<number, string>>({});
  const activeRef = useRef<SpeechRecognitionLike | null>(null);

  if (!supported || !terms.length) return null;

  function listen(index: number) {
    // Stop any in-flight recognition first
    try { activeRef.current?.stop(); } catch { /* noop */ }

    const rec = getRecognition();
    if (!rec) return;
    activeRef.current = rec;
    rec.lang = "es-MX";
    rec.interimResults = false;
    rec.maxAlternatives = 3;

    setStates((s) => ({ ...s, [index]: "listening" }));

    rec.onresult = (ev) => {
      const target = terms[index].spanish;
      const alternatives: string[] = [];
      const results = ev.results[0];
      for (let i = 0; i < results.length; i++) {
        if (results[i]?.transcript) alternatives.push(results[i].transcript);
      }
      const targetNorm = normalizeAnswer(target);
      const best = alternatives[0] ?? "";
      const matched = alternatives.some((alt) => {
        const a = normalizeAnswer(alt);
        return a === targetNorm || a.includes(targetNorm) || targetNorm.includes(a);
      });

      setHeard((h) => ({ ...h, [index]: best }));
      setStates((s) => ({ ...s, [index]: matched ? "correct" : "retry" }));
      logItemEvent({
        unitNumber,
        stageType: "speakPractice",
        skill: "speaking",
        itemKey: target,
        correct: matched,
        chosen: best || null,
        expected: target,
      });
      flushItemEvents();
    };
    rec.onerror = () => setStates((s) => ({ ...s, [index]: "idle" }));
    rec.onend = () => {
      setStates((s) => (s[index] === "listening" ? { ...s, [index]: "idle" } : s));
    };

    try { rec.start(); } catch { setStates((s) => ({ ...s, [index]: "idle" })); }
  }

  return (
    <div className="border border-[rgba(201,147,58,0.2)] bg-[rgba(201,147,58,0.04)] px-5 py-4 mb-6 text-left">
      <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-1">
        🎙 Dilo en voz alta <span className="normal-case tracking-normal">(opcional)</span>
      </p>
      <p className="font-typewriter text-[9px] text-[#4a3a2a] mb-2.5">
        Practica tu pronunciación — toca el micrófono y di la palabra.
      </p>
      <div className="space-y-2">
        {terms.map((t, i) => {
          const st = states[i] ?? "idle";
          return (
            <div key={i} className="flex items-center gap-3">
              <button
                onClick={() => listen(i)}
                disabled={st === "listening"}
                className={`w-9 h-9 shrink-0 border text-base transition-colors ${
                  st === "listening"
                    ? "border-[#c0392b] bg-[rgba(192,57,43,0.15)] animate-pulse"
                    : st === "correct"
                    ? "border-[#c9933a] bg-[rgba(201,147,58,0.15)]"
                    : "border-[rgba(201,147,58,0.25)] hover:border-[#c9933a]"
                }`}
                title="Toca y habla"
              >
                {st === "listening" ? "👂" : st === "correct" ? "✓" : "🎙"}
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm text-[#f5e6c8] leading-tight">{t.spanish}</p>
                <p className="font-typewriter text-[9px] text-[#8b7355]">{t.english}</p>
              </div>
              <p className="font-typewriter text-[9px] shrink-0 text-right">
                {st === "correct" && <span className="text-[#c9933a]">¡Excelente! 🎉</span>}
                {st === "retry" && (
                  <span className="text-[#8b7355]">
                    Escuché: &ldquo;{heard[i]}&rdquo; — intenta otra vez
                  </span>
                )}
                {st === "listening" && <span className="text-[#c0392b]">Escuchando…</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
