"use client";

import { useState } from "react";

interface Props {
  partnerName: string | null;
  onChange: (name: string | null) => void;
}

export default function CollaborationToggle({ partnerName, onChange }: Props) {
  const [enabled, setEnabled] = useState(!!partnerName);
  const [input, setInput]   = useState(partnerName ?? "");

  function handleToggle(val: boolean) {
    setEnabled(val);
    if (!val) onChange(null);
  }

  return (
    <div className="border border-[rgba(201,147,58,0.1)] bg-[#1a1614] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-typewriter text-xs text-[#c4a882]">¿Trabajarás con un compañero?</p>
          <p className="font-typewriter text-[10px] text-[#4a3a2a]">Ambos estudiantes ganarán el mismo crédito.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleToggle(false)}
            className={`font-typewriter text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${
              !enabled ? "border-[rgba(201,147,58,0.5)] text-[#e8b455] bg-[rgba(201,147,58,0.08)]" : "border-[rgba(201,147,58,0.15)] text-[#4a3a2a]"
            }`}
          >
            Solo
          </button>
          <button
            onClick={() => handleToggle(true)}
            className={`font-typewriter text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${
              enabled ? "border-[rgba(201,147,58,0.5)] text-[#e8b455] bg-[rgba(201,147,58,0.08)]" : "border-[rgba(201,147,58,0.15)] text-[#4a3a2a]"
            }`}
          >
            Con compañero
          </button>
        </div>
      </div>

      {enabled && (
        <div className="space-y-2">
          <label className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355]">
            Nombre del compañero
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe el nombre del compañero…"
              className="flex-1 bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-2 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028]"
            />
            <button
              disabled={!input.trim()}
              onClick={() => onChange(input.trim())}
              className="px-4 py-2 font-typewriter text-[10px] tracking-widest uppercase border border-[rgba(201,147,58,0.3)] text-[#8b7355] hover:text-[#c9933a] transition-colors disabled:opacity-40"
            >
              Confirmar
            </button>
          </div>
          {partnerName && (
            <p className="font-typewriter text-[10px] text-[#c9933a]">
              ✓ Con: {partnerName} · +100 puntos al completar
            </p>
          )}
        </div>
      )}
    </div>
  );
}
