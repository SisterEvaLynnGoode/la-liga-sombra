"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FACTIONS, FACTION_IDS, type Faction, type FactionId } from "@/lib/season/factions";

interface Props {
  /** Already decided — by their own boss ending, or by the teacher. */
  faction: FactionId | null;
  fromBoss: boolean;
  displayName: string;
}

export default function SeasonEntryClient({ faction, fromBoss, displayName }: Props) {
  const router = useRouter();
  const [picked, setPicked] = useState<FactionId | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function commit() {
    if (!picked) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/season/faction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faction: picked }),
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "No se pudo guardar.");
      setSaving(false);
      return;
    }
    router.refresh();
    router.push("/mission-board");
  }

  // ── Already assigned: this is a reveal, not a menu ─────────────────────────
  if (faction) {
    const f = FACTIONS[faction];
    return (
      <div className="w-full max-w-2xl">
        <p className="font-typewriter text-[10px] tracking-[0.35em] uppercase text-[#8b7355] text-center">
          La Última Estación · Casos 16–20
        </p>
        <h1 className="mt-3 text-center font-display text-4xl font-bold text-[#f5e6c8]">
          {f.emoji} {f.name}
        </h1>
        <p className="mt-4 text-center font-typewriter text-sm text-[#c4a882] leading-relaxed">
          {f.tagline}
        </p>

        <div className="mt-8 border border-[rgba(201,147,58,0.25)] bg-[#16130f] p-6">
          <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">
            Tu fuente de información
          </p>
          <p className="mt-2 font-typewriter text-sm text-[#f5e6c8] leading-relaxed">{f.informant}</p>
        </div>

        <p className="mt-6 text-center font-typewriter text-[11px] text-[#8b7355] leading-relaxed">
          {fromBoss
            ? "Este bando no se elige aquí. Es la consecuencia de lo que hiciste con El Cronista al final de Operación Reloj de Arena."
            : "Tu profe te asignó a este bando."}
        </p>

        <button
          onClick={() => router.push("/mission-board")}
          className="mt-8 w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
        >
          Al tablero de misiones →
        </button>
      </div>
    );
  }

  // ── No ending on record: pick a side, once ─────────────────────────────────
  return (
    <div className="w-full max-w-3xl">
      <p className="font-typewriter text-[10px] tracking-[0.35em] uppercase text-[#8b7355] text-center">
        La Última Estación · Casos 16–20
      </p>
      <h1 className="mt-3 text-center font-display text-4xl font-bold text-[#f5e6c8]">
        ¿De qué lado estás, {displayName}?
      </h1>
      <p className="mt-4 text-center font-typewriter text-[12px] text-[#8b7355] leading-relaxed max-w-xl mx-auto">
        No tenemos tu decisión final sobre El Cronista en el expediente. Elige tu bando ahora —
        se elige una sola vez y no se cambia.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {FACTION_IDS.map((id) => (
          <FactionCard
            key={id}
            f={FACTIONS[id]}
            selected={picked === id}
            onSelect={() => setPicked(id)}
          />
        ))}
      </div>

      {error && <p className="mt-4 text-center font-typewriter text-xs text-[#c0392b]">{error}</p>}

      <button
        onClick={commit}
        disabled={!picked || saving}
        className="mt-8 w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? "Guardando…" : picked ? `Unirme a ${FACTIONS[picked].name} →` : "Elige un bando"}
      </button>
    </div>
  );
}

function FactionCard({ f, selected, onSelect }: { f: Faction; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`text-left border p-5 transition-colors h-full flex flex-col ${
        selected
          ? "border-[#c9933a] bg-[rgba(201,147,58,0.10)]"
          : "border-[rgba(201,147,58,0.2)] bg-[#16130f] hover:border-[rgba(201,147,58,0.45)]"
      }`}
      style={selected ? { borderColor: f.accent } : undefined}
    >
      <span className="text-2xl" aria-hidden>{f.emoji}</span>
      <h2 className="mt-2 font-display text-xl font-bold" style={{ color: f.accent }}>{f.name}</h2>
      <p className="mt-2 font-typewriter text-[12px] text-[#c4a882] leading-relaxed">{f.tagline}</p>
      <p className="mt-4 font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">
        Tu información
      </p>
      <p className="mt-1 font-typewriter text-[11px] text-[#8b7355] leading-relaxed">{f.informant}</p>
      {/* The betrayal is deliberately NOT shown here. Every faction gets one; a
          student who knows it is coming is not a student who can be surprised. */}
    </button>
  );
}
