"use client";

import { useState } from "react";

interface Props {
  hint: string;
  answer: string;       // correct code (e.g. "74")
  onComplete: (correct: boolean) => void;
}

export default function CodeBreaker({ hint, answer, onComplete }: Props) {
  const [input, setInput]     = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [attempts, setAttempts] = useState(0);

  function normalizeCode(s: string) {
    return s.trim().replace(/^0+/, "") || "0";
  }

  function handleSubmit() {
    if (!input.trim() || feedback === "correct") return;
    const isCorrect = normalizeCode(input) === normalizeCode(answer);
    setFeedback(isCorrect ? "correct" : "wrong");
    setAttempts((a) => a + 1);

    if (isCorrect) {
      setTimeout(() => onComplete(true), 800);
    } else {
      setTimeout(() => {
        setFeedback(null);
        setInput("");
      }, 1400);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center">
        <p className="font-typewriter text-[9px] tracking-[0.4em] uppercase text-[#c0392b] mb-1">Descifrador de Código</p>
        <h3 className="font-display font-bold text-xl text-[#f5e6c8]">Introduce el código del escondite</h3>
      </div>

      {/* Hint */}
      <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-4">
        <p className="font-typewriter text-[10px] uppercase text-[#8b7355] mb-2">🔑 Pista</p>
        <p className="font-typewriter text-sm text-[#c4a882] leading-relaxed">{hint}</p>
      </div>

      {/* Code input — styled like a retro keypad */}
      <div className={`border-2 p-6 text-center transition-all ${
        feedback === "correct" ? "border-[#c9933a] bg-[rgba(201,147,58,0.1)]"
        : feedback === "wrong"  ? "border-[#c0392b] bg-[rgba(192,57,43,0.08)]"
        : "border-[rgba(201,147,58,0.3)] bg-[#1a1614]"
      }`}>
        <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-4">
          Código de 2-4 dígitos
        </p>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={feedback === "correct"}
          placeholder="_ _"
          className="bg-transparent text-center font-display font-bold text-5xl text-[#e8b455] placeholder-[#3a3028] focus:outline-none w-full tracking-[0.5em]"
        />
        {feedback === "wrong" && (
          <p className="font-typewriter text-xs text-[#c0392b] mt-3">Código incorrecto. Inténtalo de nuevo.</p>
        )}
        {feedback === "correct" && (
          <p className="font-typewriter text-sm text-[#c9933a] mt-3">✓ ¡Código correcto! Abriendo el acceso…</p>
        )}
      </div>

      {attempts > 0 && feedback !== "correct" && (
        <p className="font-typewriter text-[10px] text-[#4a3a2a] text-center">
          {attempts} intento{attempts !== 1 ? "s" : ""} · Escucha de nuevo la llamada si necesitas ayuda
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!input.trim() || feedback === "correct"}
        className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40"
      >
        Introducir código →
      </button>
    </div>
  );
}
