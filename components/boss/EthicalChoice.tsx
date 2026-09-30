"use client";

import { useState } from "react";
import type { BossEthicalChoice, EthicalChoiceKey } from "@/lib/types/boss";

interface Props {
  choice: BossEthicalChoice;
  onSelect: (key: EthicalChoiceKey, sentence?: string) => void;
}

export default function EthicalChoice({ choice, onSelect }: Props) {
  const [selected, setSelected]   = useState<EthicalChoiceKey | null>(null);
  const [sentence, setSentence]   = useState("");
  const [error, setError]         = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const optionC = choice.options.find((o) => o.requiresSentence);

  function validateSentenceC(s: string): boolean {
    const lower = s.toLowerCase();
    const words = s.trim().split(/\s+/).length;
    if (words < 5) return false;
    const required = optionC?.requiredWords ?? [];
    return required.some((w) => lower.includes(w));
  }

  function handleConfirm() {
    if (!selected) return;
    if (selected === "C") {
      if (!validateSentenceC(sentence)) {
        // Built from this boss's own list. It used to be hardcoded to Eclipse's
        // words, so every later boss told students to use words it never checks.
        const examples = (optionC?.requiredWords ?? []).slice(0, 6).join(", ");
        setError(`Tu oración debe tener al menos 5 palabras e incluir una de estas palabras: ${examples}…`);
        return;
      }
      onSelect("C", sentence.trim());
    } else {
      onSelect(selected);
    }
    setConfirmed(true);
  }

  if (confirmed) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0b0a] bg-opacity-95 flex flex-col items-center justify-center px-4 py-8 overflow-auto">
      <div className="max-w-xl w-full space-y-5">

        {/* Header */}
        <div className="text-center mb-6">
          <p className="font-typewriter text-[9px] tracking-[0.4em] uppercase text-[#c0392b] mb-1">Decisión ética</p>
          <h2 className="font-display font-black text-2xl text-[#f5e6c8]">Momento Crítico</h2>
        </div>

        {/* Context */}
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5">
          <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed mb-3">{choice.context}</p>
          <div className="border-l-2 border-[#c0392b] pl-4">
            <p className="font-typewriter text-[10px] uppercase text-[#c0392b] mb-1">{choice.speakerName}</p>
            <p className="font-typewriter text-sm text-[#f5e6c8] leading-relaxed italic">
              &ldquo;{choice.speakerLine}&rdquo;
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {choice.options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setSelected(opt.key); setError(""); }}
              className={`w-full text-left border px-5 py-4 transition-all ${
                selected === opt.key
                  ? "border-[#c0392b] bg-[rgba(192,57,43,0.1)]"
                  : "border-[rgba(201,147,58,0.15)] bg-[#1a1614] hover:border-[rgba(201,147,58,0.4)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{opt.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-typewriter text-[10px] font-bold text-[#c9933a]">Opción {opt.key}:</span>
                    <span className="font-display font-bold text-sm text-[#f5e6c8]">{opt.title}</span>
                  </div>
                  <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed mb-1">{opt.description}</p>
                  <p className="font-typewriter text-[10px] text-[#4a3a2a] italic">{opt.effect}</p>
                  {opt.requiresSentence && (
                    <p className="font-typewriter text-[10px] text-[#c9933a] mt-1">
                      ✍ Requiere construir una oración en español.
                    </p>
                  )}
                </div>
                {selected === opt.key && <span className="text-[#c0392b] text-lg">✓</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Option C sentence input */}
        {selected === "C" && (
          <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-4 space-y-3">
            {/* All three lines used to be Eclipse's: every later boss told the
                student to make a deal with Elena using Eclipse's words. They now
                come from the boss being played. */}
            <p className="font-typewriter text-xs text-[#c4a882]">{optionC?.description}</p>
            <div className="border-l-2 border-[#c9933a] bg-[rgba(201,147,58,0.06)] px-3 py-2 space-y-1">
              <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#c9933a]">
                💡 Pista
              </p>
              {optionC?.sentenceExample && (
                <p className="font-typewriter text-xs text-[#e8b455] leading-snug">
                  Ejemplo: &ldquo;{optionC.sentenceExample}&rdquo;
                </p>
              )}
              <p className="font-typewriter text-[10px] text-[#8b7355] leading-snug">
                Usa al menos una de estas palabras:{" "}
                <span className="text-[#c4a882]">{(optionC?.requiredWords ?? []).slice(0, 8).join(" · ")}</span>
              </p>
              <p className="font-typewriter text-[10px] text-[#6b5a48]">
                Mínimo 5 palabras. / At least 5 words — you can adapt the example.
              </p>
            </div>
            <textarea
              value={sentence}
              onChange={(e) => { setSentence(e.target.value); setError(""); }}
              rows={3}
              placeholder="Escribe tu oración aquí…"
              className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-2 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] resize-none"
            />
            {error && (
              <p className="font-typewriter text-[10px] text-[#c0392b]">{error}</p>
            )}
          </div>
        )}

        {/* Confirm */}
        {selected && (
          <button
            onClick={handleConfirm}
            className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            Confirmar decisión →
          </button>
        )}
      </div>
    </div>
  );
}
