"use client";

import { useState, useEffect, useCallback } from "react";
import type { CharacterSheet } from "@/lib/character-schema";
import { completenessScore } from "@/lib/character-schema";

// ── Field config ───────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  suspect:   "border-[#c0392b] text-[#c0392b]",
  witness:   "border-[#2980b9] text-[#2980b9]",
  villain:   "border-[#8b1a1a] text-[#f5a0a0]",
  recurring: "border-[#c9933a] text-[#e8b455]",
};

function pct2color(p: number) {
  if (p >= 85) return "text-[#4ade80]";
  if (p >= 50) return "text-[#e8b455]";
  return "text-[#c0392b]";
}

// ── Edit form ──────────────────────────────────────────────────────────────────

function CharacterForm({ char, onSaved }: { char: CharacterSheet; onSaved: (c: CharacterSheet) => void }) {
  const [draft, setDraft]   = useState<CharacterSheet>(char);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  function set<K extends keyof CharacterSheet>(k: K, v: CharacterSheet[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
    setSaved(false);
  }

  function setArray(k: "distinctiveFeatures" | "accessories", raw: string) {
    set(k, raw.split(",").map((s) => s.trim()).filter(Boolean) as CharacterSheet[typeof k]);
  }

  async function handleSave() {
    setSaving(true); setError("");
    const res = await fetch("/api/teacher/characters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    }).catch((e) => { setError(String(e)); return null; });

    setSaving(false);
    if (res?.ok) { setSaved(true); onSaved(draft); }
    else { const d = await res?.json().catch(() => ({})); setError(d?.error ?? "Save failed"); }
  }

  const score = completenessScore(draft);
  const INPUT = "w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-2 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] transition-colors";
  const LABEL = "block font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#8b7355] mb-1";

  return (
    <div className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-typewriter text-[9px] tracking-widest uppercase border px-1.5 py-0.5 ${ROLE_COLORS[draft.role] ?? ""}`}>
            {draft.role}
          </span>
          <span className="font-typewriter text-xs text-[#4a3a2a]">{draft.id}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`font-typewriter text-xs font-bold ${pct2color(score)}`}>{score}% completo</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="clip-skew px-4 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.1)] text-[#e8b455] border border-[rgba(201,147,58,0.3)] hover:bg-[rgba(201,147,58,0.2)] transition-colors disabled:opacity-40"
          >
            {saving ? "Guardando…" : saved ? "✓ Guardado" : "Guardar"}
          </button>
        </div>
      </div>

      {/* Spanish description (read-only) — the ground truth */}
      <div className="border border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.06)] p-3 rounded-sm">
        <p className="font-typewriter text-[9px] tracking-widest uppercase text-[#c0392b] mb-1">
          📋 Descripción en juego (NO editar — es el texto que los estudiantes leen)
        </p>
        <p className="font-typewriter text-sm text-[#f5e6c8] leading-relaxed">
          {draft.spanishDescription || <em className="text-[#4a3a2a]">sin descripción</em>}
        </p>
      </div>

      {/* Current stock image */}
      {draft.currentImageUrl && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={draft.currentImageUrl} alt={draft.name} width={64} height={64}
            className="w-16 h-16 object-cover rounded-sm grayscale" />
          <p className="font-typewriter text-[10px] text-[#4a3a2a]">Stock image (to be replaced)</p>
        </div>
      )}

      {/* Two-column form grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Nombre en juego</label>
          <input type="text" value={draft.name} onChange={(e) => set("name", e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Nombre real</label>
          <input type="text" value={draft.realName ?? ""} onChange={(e) => set("realName", e.target.value)} placeholder="nombre real si se conoce" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Edad</label>
          <input type="number" value={draft.age} onChange={(e) => set("age", parseInt(e.target.value) || 0)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>País</label>
          <input type="text" value={draft.country} onChange={(e) => set("country", e.target.value)} placeholder="México, Perú, España…" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Género</label>
          <input type="text" value={draft.gender} onChange={(e) => set("gender", e.target.value)} placeholder="hombre, mujer, no binario…" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Tono de piel</label>
          <input type="text" value={draft.skinTone} onChange={(e) => set("skinTone", e.target.value)} placeholder="morena, blanca, negra, trigueña…" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Complexión / build</label>
          <input type="text" value={draft.build} onChange={(e) => set("build", e.target.value)} placeholder="alto y delgado, bajo y robusto…" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Cabello</label>
          <input type="text" value={draft.hair} onChange={(e) => set("hair", e.target.value)} placeholder="cabello negro corto, rizado castaño…" className={INPUT} />
        </div>
      </div>

      {/* Full-width fields */}
      <div>
        <label className={LABEL}>Rasgos distintivos (separados por coma)</label>
        <input type="text"
          value={draft.distinctiveFeatures.join(", ")}
          onChange={(e) => setArray("distinctiveFeatures", e.target.value)}
          placeholder="bigote espeso, lentes redondos, cicatriz en la mejilla"
          className={INPUT}
        />
      </div>

      <div>
        <label className={LABEL}>
          Ropa / vestimenta <span className="text-[rgba(201,147,58,0.4)] normal-case tracking-normal">— describe el outfit completo</span>
        </label>
        <input type="text" value={draft.clothing} onChange={(e) => set("clothing", e.target.value)} placeholder="camisa blanca y chaleco verde, uniforme de chef…" className={INPUT} />
      </div>

      <div>
        <label className={LABEL}>
          Accesorios ⚠ <span className="text-[#c0392b] normal-case tracking-normal">— CRÍTICO: todo lo que se menciona en la descripción española debe estar aquí</span>
        </label>
        <input type="text"
          value={draft.accessories.join(", ")}
          onChange={(e) => setArray("accessories", e.target.value)}
          placeholder="sombrero de charro negro, mochila negra, estuche de música…"
          className={INPUT}
        />
        {draft.accessories.length === 0 && draft.spanishDescription && (
          <p className="font-typewriter text-[10px] text-[#c0392b] mt-1">
            ⚠ Sin accesorios — revisa la descripción española; ¿menciona objetos que lleva el personaje?
          </p>
        )}
      </div>

      <div>
        <label className={LABEL}>Expresión facial</label>
        <input type="text" value={draft.expression} onChange={(e) => set("expression", e.target.value)} placeholder="mirada seria, sonrisa nerviosa, expresión amable…" className={INPUT} />
      </div>

      <div>
        <label className={LABEL}>Pose / composición</label>
        <input type="text" value={draft.pose} onChange={(e) => set("pose", e.target.value)} className={INPUT} />
      </div>

      <div>
        <label className={LABEL}>Notas para generación de imagen</label>
        <textarea value={draft.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={2}
          placeholder="Contexto adicional para el generador de imágenes…"
          className={INPUT + " resize-y"} />
      </div>

      {error && <p className="font-typewriter text-xs text-[#c0392b]">⚠ {error}</p>}
    </div>
  );
}

// ── Main client ────────────────────────────────────────────────────────────────

export default function CharactersClient() {
  const [characters, setCharacters]     = useState<CharacterSheet[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState<string>("all");
  const [search, setSearch]             = useState("");
  const [expandedId, setExpandedId]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/teacher/characters")
      .then((r) => r.json())
      .then((d: { characters: CharacterSheet[] }) => {
        setCharacters(d.characters ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSaved = useCallback((updated: CharacterSheet) => {
    setCharacters((prev) => prev.map((c) => c.id === updated.id ? updated : c));
  }, []);

  // Group by unit
  const grouped = characters.reduce<Record<string, CharacterSheet[]>>((acc, c) => {
    const key = c.unitNumber ? `Unidad ${c.unitNumber}` : "Recurrentes";
    (acc[key] ??= []).push(c);
    return acc;
  }, {});

  const unitKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "Recurrentes") return -1;
    if (b === "Recurrentes") return 1;
    return parseInt(a.split(" ")[1]) - parseInt(b.split(" ")[1]);
  });

  const filtered = characters.filter((c) => {
    if (filter === "incomplete" && completenessScore(c) >= 85) return false;
    if (filter !== "all" && filter !== "incomplete" && c.role !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.id.includes(search.toLowerCase())) return false;
    return true;
  });

  const totalIncomplete = characters.filter((c) => completenessScore(c) < 85).length;

  return (
    <div className="min-h-screen bg-[#0c0e14] flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-[rgba(201,147,58,0.15)] bg-[#111218] px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">Panel del Maestro</p>
          <h1 className="font-display font-bold text-lg text-[#e8b455]">Fichas de Personajes</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-typewriter text-[10px] text-[#8b7355]">
            {characters.length} personajes · {totalIncomplete} incompletos
          </span>
          <a href="/teacher/dashboard" className="font-typewriter text-[10px] text-[#8b7355] hover:text-[#c9933a] transition-colors">
            ← Dashboard
          </a>
        </div>
      </header>

      {/* Filter bar */}
      <div className="shrink-0 border-b border-[rgba(201,147,58,0.1)] bg-[#111218] px-6 py-3 flex items-center gap-4 flex-wrap">
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o ID…"
          className="bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-1.5 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] w-48"
        />
        {[
          { id: "all",        label: "Todos" },
          { id: "incomplete", label: `Incompletos (${totalIncomplete})` },
          { id: "suspect",    label: "Sospechosos" },
          { id: "witness",    label: "Testigos" },
          { id: "villain",    label: "Villanos" },
          { id: "recurring",  label: "Recurrentes" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`font-typewriter text-[10px] tracking-[0.15em] uppercase transition-colors ${filter === f.id ? "text-[#e8b455]" : "text-[#8b7355] hover:text-[#c4a882]"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <p className="font-typewriter text-xs text-[#4a3a2a] animate-pulse">Cargando fichas…</p>
          </div>
        )}

        {!loading && (
          search || filter !== "all" ? (
            // Flat list when filtering
            <div className="max-w-3xl mx-auto space-y-3">
              <p className="font-typewriter text-[10px] text-[#4a3a2a]">{filtered.length} resultados</p>
              {filtered.map((c) => (
                <CharacterRow
                  key={c.id} char={c}
                  expanded={expandedId === c.id}
                  onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  onSaved={handleSaved}
                />
              ))}
            </div>
          ) : (
            // Grouped by unit
            <div className="max-w-3xl mx-auto space-y-8">
              {unitKeys.map((unit) => (
                <div key={unit}>
                  <h2 className="font-display font-bold text-lg text-[#f5e6c8] mb-3 flex items-center gap-3">
                    {unit}
                    <span className="font-typewriter text-[9px] text-[#4a3a2a] font-normal">
                      {grouped[unit].filter((c) => completenessScore(c) < 85).length} incompletos
                    </span>
                  </h2>
                  <div className="space-y-3">
                    {grouped[unit].map((c) => (
                      <CharacterRow
                        key={c.id} char={c}
                        expanded={expandedId === c.id}
                        onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
                        onSaved={handleSaved}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}

// ── Character row (collapsed + expandable) ────────────────────────────────────

function CharacterRow({ char, expanded, onToggle, onSaved }: {
  char: CharacterSheet; expanded: boolean;
  onToggle: () => void; onSaved: (c: CharacterSheet) => void;
}) {
  const score = completenessScore(char);
  const hasAccessoryGap = char.accessories.length === 0;
  const hasClothingGap  = !char.clothing;

  return (
    <div className={`border transition-all ${expanded ? "border-[rgba(201,147,58,0.4)]" : "border-[rgba(201,147,58,0.15)]"} bg-[#1a1614]`}>
      {/* Collapsed row */}
      <button onClick={onToggle} className="w-full text-left px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {char.currentImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={char.currentImageUrl} alt="" width={36} height={36}
              className="w-9 h-9 object-cover rounded-sm grayscale shrink-0" />
          ) : (
            <div className="w-9 h-9 bg-[#2c2220] rounded-sm shrink-0 flex items-center justify-center text-lg">
              {char.role === "suspect" ? "🔍" : char.role === "witness" ? "👤" : char.role === "villain" ? "🎭" : "⭐"}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-typewriter text-sm text-[#f5e6c8] truncate">{char.name}</p>
            <p className="font-typewriter text-[10px] text-[#4a3a2a] truncate">
              {char.realName && `${char.realName} · `}
              {char.age > 0 ? `${char.age} años` : "edad?"} · {char.country || "país?"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {hasAccessoryGap && (
            <span title="Sin accesorios — revisa la descripción española"
              className="font-typewriter text-[9px] px-1.5 py-0.5 border border-[rgba(192,57,43,0.4)] text-[#c0392b]">
              ⚠ acc
            </span>
          )}
          {hasClothingGap && (
            <span title="Ropa vacía"
              className="font-typewriter text-[9px] px-1.5 py-0.5 border border-[rgba(201,147,58,0.3)] text-[#8b7355]">
              ⚠ ropa
            </span>
          )}
          <span className={`font-typewriter text-xs font-bold ${pct2color(score)}`}>{score}%</span>
          <span className="font-typewriter text-[10px] text-[#4a3a2a]">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded edit form */}
      {expanded && (
        <div className="border-t border-[rgba(201,147,58,0.1)] p-5">
          <CharacterForm char={char} onSaved={onSaved} />
        </div>
      )}
    </div>
  );
}
