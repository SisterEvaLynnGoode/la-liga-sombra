"use client";

import { useState } from "react";
import Definiciones from "./Definiciones";
import { buildDefinicionesQuestions, type VocabDrillItem } from "@/lib/personalized-drills";
import { UNITS } from "@/lib/game/units";

interface Props {
  masteredTerms:   VocabDrillItem[];
  strugglingTerms: VocabDrillItem[];
  drillItems:      VocabDrillItem[];
  termToUnit:      Record<string, number>;
  badges: Array<{ badge_type: string; unit_id: string | null; earned_at: string }>;
  stakeoutBests: Array<{ unitNumber: number; timeRemaining: number }>;
  trainingStreak: number;
  totalMastered: number;
  onActivityComplete: (opts: {
    subtype: "drill";
    score: number;
    maxScore: number;
    timeSeconds: number;
    termsFromUnits: number[];
  }) => void;
}

const BADGE_META: Record<string, { emoji: string; labelEs: string }> = {
  case_solved:         { emoji: "🔍", labelEs: "Caso Resuelto"          },
  perfect_score:       { emoji: "💯", labelEs: "Puntaje Perfecto"       },
  speed_run:           { emoji: "⚡", labelEs: "Carrera Relámpago"       },
  cultural_expert:     { emoji: "🌎", labelEs: "Experto Cultural"        },
  first_case:          { emoji: "🎯", labelEs: "Primera Misión"          },
  unit_completed:      { emoji: "✅", labelEs: "Caso Completado"         },
  speed_demon:         { emoji: "👹", labelEs: "Demonio de Velocidad"    },
  vocab_master:        { emoji: "📚", labelEs: "Maestro de Vocabulario"  },
  streak_3:            { emoji: "🔥", labelEs: "Racha de 3 días"         },
  streak_7:            { emoji: "🌟", labelEs: "Racha de 7 días"         },
  distinguished_recruit:{ emoji: "🏅", labelEs: "Recluta Distinguido"    },
  vigilancia_exitosa:  { emoji: "🎯", labelEs: "Vigilancia Exitosa"      },
  entrenamiento_diario:{ emoji: "🏋️", labelEs: "Entrenamiento Diario"   },
  maestro_vocabulario: { emoji: "🎓", labelEs: "Maestro de Vocabulario"  },
  poliglota:           { emoji: "🌍", labelEs: "Políglota"               },
};

type DrillState = "idle" | "drilling" | "done";

export default function Locker({
  masteredTerms, strugglingTerms, drillItems,
  badges, stakeoutBests, trainingStreak, totalMastered, onActivityComplete,
}: Props) {
  const [drillTerm, setDrillTerm] = useState<VocabDrillItem | null>(null);
  const [drillState, setDrillState] = useState<DrillState>("idle");
  const [drillResult, setDrillResult] = useState<{ score: number; total: number } | null>(null);

  const uniqueBadges = Array.from(new Map(badges.map((b) => [b.badge_type, b])).values());

  function startTermDrill(term: VocabDrillItem) {
    // Build a 5-question Definiciones session focused on this term + 4 distractors
    setDrillTerm(term);
    setDrillState("drilling");
    setDrillResult(null);
  }

  function handleDrillComplete(score: number, total: number, time: number, units: number[]) {
    setDrillResult({ score, total });
    setDrillState("done");
    onActivityComplete({ subtype: "drill", score, maxScore: total, timeSeconds: time, termsFromUnits: units });
  }

  // When drilling a single term: build questions using that term + random distractors
  function buildTermQuestions(term: VocabDrillItem) {
    // Put the focus term first in drill items to guarantee it appears
    const others = drillItems.filter((d) => d.spanish !== term.spanish);
    return buildDefinicionesQuestions([term, ...others], 5);
  }

  if (drillState === "drilling" && drillTerm) {
    const qs = buildTermQuestions(drillTerm);
    return (
      <div>
        <div className="flex items-center justify-between px-5 py-2 border-b border-[rgba(201,147,58,0.1)] bg-[#0d0b0a]">
          <span className="font-typewriter text-[10px] uppercase text-[#8b7355]">
            Practicando: <span className="text-[#e8b455]">{drillTerm.spanish}</span>
          </span>
          <button onClick={() => setDrillState("idle")} className="font-typewriter text-[10px] text-[#4a3a2a] hover:text-[#8b7355]">
            ✕ Cancelar
          </button>
        </div>
        <Definiciones questions={qs} onComplete={handleDrillComplete} />
      </div>
    );
  }

  if (drillState === "done" && drillResult) {
    const pct = Math.round((drillResult.score / drillResult.total) * 100);
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-5 py-12">
        <div className="text-5xl mb-3">{pct >= 80 ? "🌟" : "💪"}</div>
        <p className="font-display font-bold text-3xl text-[#e8b455]">{drillResult.score}/{drillResult.total}</p>
        <button onClick={() => { setDrillState("idle"); setDrillTerm(null); }}
          className="clip-skew px-6 py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors">
          ← Volver al casillero
        </button>
      </div>
    );
  }

  // ── Main locker view ────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto p-5 space-y-6">

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { emoji: "🔥", value: `${trainingStreak}`, label: "días de racha" },
          { emoji: "⭐", value: `${totalMastered}`,   label: "términos dominados" },
          { emoji: "📊", value: `${uniqueBadges.length}`, label: "insignias" },
        ].map((s) => (
          <div key={s.label} className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] p-3 text-center">
            <div className="text-2xl mb-1">{s.emoji}</div>
            <p className="font-display font-bold text-xl text-[#e8b455]">{s.value}</p>
            <p className="font-typewriter text-[9px] text-[#8b7355] uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Struggling terms */}
      {strugglingTerms.length > 0 && (
        <div>
          <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#c0392b] mb-3 flex items-center gap-2">
            <span>⚠</span> Necesita más práctica ({strugglingTerms.length} términos)
          </p>
          <div className="space-y-1.5">
            {strugglingTerms.slice(0, 12).map((t) => (
              <button
                key={t.spanish}
                onClick={() => startTermDrill(t)}
                className="w-full flex items-center justify-between border border-[rgba(192,57,43,0.2)] bg-[#1a1614] hover:border-[rgba(192,57,43,0.4)] hover:bg-[rgba(192,57,43,0.04)] transition-all px-4 py-2.5 group"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="font-typewriter text-sm text-[#f5e6c8] group-hover:text-[#e8b455] transition-colors">{t.spanish}</span>
                  <span className="font-typewriter text-xs text-[#8b7355]">{t.english}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-typewriter text-xs text-[#c0392b]">{Math.round(t.accuracy * 100)}%</span>
                  <span className="font-typewriter text-[10px] text-[#4a3a2a] group-hover:text-[#c9933a] transition-colors">
                    Practicar →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mastered terms */}
      {masteredTerms.length > 0 && (
        <div>
          <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#c9933a] mb-3 flex items-center gap-2">
            <span>🏆</span> Dominados ({masteredTerms.length} términos)
          </p>
          <div className="flex flex-wrap gap-2">
            {masteredTerms.map((t) => (
              <button
                key={t.spanish}
                onClick={() => startTermDrill(t)}
                title={`${t.english} · ${Math.round(t.accuracy * 100)}% · ${t.attempts} intentos`}
                className="font-typewriter text-xs px-3 py-1.5 border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.06)] text-[#c9933a] hover:border-[#c9933a] hover:text-[#e8b455] transition-all"
              >
                {t.spanish} ⭐
              </button>
            ))}
          </div>
        </div>
      )}

      {masteredTerms.length === 0 && strugglingTerms.length === 0 && (
        <div className="text-center py-8 border border-[rgba(201,147,58,0.1)] bg-[#1a1614]">
          <p className="font-typewriter text-sm text-[#4a3a2a]">
            Completa ejercicios de vocabulario para ver tus estadísticas aquí.
          </p>
        </div>
      )}

      {/* Stakeout bests */}
      {stakeoutBests.length > 0 && (
        <div>
          <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-3">
            🚨 Mejores tiempos en Vigilancia
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {stakeoutBests.map((b) => {
              const unit = UNITS.find((u) => u.number === b.unitNumber);
              const color = b.timeRemaining > 45 ? "text-[#4ade80]" : b.timeRemaining > 20 ? "text-[#e8b455]" : "text-[#c0392b]";
              return (
                <div key={b.unitNumber} className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] p-3 text-center">
                  <p className="text-xl mb-1">{unit?.flag ?? "🌎"}</p>
                  <p className="font-typewriter text-[9px] text-[#8b7355] mb-1">U{b.unitNumber}</p>
                  <p className={`font-typewriter text-sm font-bold ${color}`}>{b.timeRemaining}s</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Badge collection */}
      {uniqueBadges.length > 0 && (
        <div>
          <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-3">
            🏅 Colección de insignias ({uniqueBadges.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {uniqueBadges.map((b) => {
              const meta = BADGE_META[b.badge_type] ?? { emoji: "🎖", labelEs: b.badge_type };
              return (
                <div key={b.badge_type} className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] px-3 py-2.5 flex items-center gap-2.5">
                  <span className="text-xl">{meta.emoji}</span>
                  <div>
                    <p className="font-typewriter text-xs text-[#c4a882]">{meta.labelEs}</p>
                    <p className="font-typewriter text-[9px] text-[#4a3a2a]">
                      {b.earned_at.slice(0, 10)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
