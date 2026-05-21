"use client";

import { useClassData } from "@/lib/hooks/useClassData";
import { TabHeader, Loading, Empty } from "./OverviewTab";

// ── ACTFL mode metadata ────────────────────────────────────────────────────────
interface ModeInfo {
  label: string;         // Display name
  standard: string;      // ACTFL World-Readiness Standard label
  icon: string;
  order: number;
}
const MODES: Record<string, ModeInfo> = {
  interpretive_listening: { icon: "🎧", label: "Escucha Interpretiva",  standard: "Interpretive Listening",  order: 1 },
  interpretive_reading:   { icon: "📖", label: "Lectura Interpretiva",  standard: "Interpretive Reading",    order: 2 },
  interpersonal:          { icon: "💬", label: "Comunicación",          standard: "Interpersonal Communication", order: 3 },
  linguistic:             { icon: "📚", label: "Vocabulario & Forma",   standard: "Linguistic Knowledge",    order: 4 },
  interpretive_synthesis: { icon: "🔍", label: "Síntesis Interpretiva", standard: "Interpretive (Cultural)", order: 5 },
  cultures:               { icon: "🌍", label: "Culturas",              standard: "Cultures & Connections",  order: 6 },
  presentational:         { icon: "📢", label: "Presentacional",        standard: "Presentational Communication", order: 7 },
};

// ── Per-unit Can-Do statements by ACTFL mode ──────────────────────────────────
// ACTFL Novice Can-Do descriptors, localized to each unit's theme
const CAN_DO: Record<number, Partial<Record<string, string>>> = {
  1: {
    interpretive_listening: "I can identify a person's name, origin, age, and physical description from a spoken message.",
    interpersonal:          "I can ask and answer basic questions about who I am and where I'm from.",
    linguistic:             "I can recognize and use vocabulary for self-identification and physical description.",
    interpretive_synthesis: "I can identify a suspect's appearance from a witness description.",
  },
  2: {
    interpretive_listening: "I can understand references to family members and relationships in spoken Spanish.",
    interpersonal:          "I can exchange basic information about my family and others' families.",
    linguistic:             "I can recognize and use vocabulary for family relationships.",
    interpretive_synthesis: "I can identify relationships between people from visual and contextual clues.",
  },
  3: {
    interpretive_listening: "I can identify school subjects, schedules, and classroom objects in spoken Spanish.",
    interpersonal:          "I can discuss my school schedule and ask about someone else's.",
    linguistic:             "I can recognize and use vocabulary for school, subjects, and time.",
  },
  4: {
    interpretive_listening: "I can identify foods, meals, and dining contexts in spoken Spanish.",
    interpersonal:          "I can order food and discuss preferences in a restaurant context.",
    linguistic:             "I can recognize and use vocabulary for foods, meals, and Costa Rican culture.",
    cultures:               "I can identify cultural food practices in Costa Rica.",
  },
  5: {
    interpretive_listening: "I can understand descriptions of a city, neighborhood, and location in spoken Spanish.",
    interpersonal:          "I can give and follow simple directions and describe where things are located.",
    linguistic:             "I can recognize and use vocabulary for places, directions, and city life.",
    cultures:               "I can identify distinctive features of Argentine urban culture.",
  },
  6: {
    interpretive_listening: "I can identify jobs, workplaces, and professional contexts in spoken Spanish.",
    interpersonal:          "I can discuss job descriptions and workplace environments.",
    linguistic:             "I can recognize and use vocabulary for professions and the workplace.",
    cultures:               "I can identify aspects of Colombian professional culture.",
  },
  7: {
    interpretive_listening: "I can understand references to current events, news, and media in spoken Spanish.",
    interpersonal:          "I can discuss news stories and share basic opinions.",
    linguistic:             "I can recognize and use vocabulary for media, technology, and current events.",
    cultures:               "I can identify aspects of Chilean cultural life and media.",
  },
  8: {
    interpretive_listening: "I can identify environmental contexts, nature, and sustainability topics in spoken Spanish.",
    interpersonal:          "I can discuss environmental issues and community action.",
    linguistic:             "I can recognize and use vocabulary for nature, environment, and civic life.",
    cultures:               "I can identify aspects of Peruvian geography and environmental culture.",
  },
};

const GENERIC_CAN_DO: Record<string, string> = {
  interpretive_listening: "I can identify main ideas and key details in spoken Spanish.",
  interpersonal:          "I can exchange basic information in guided conversations in Spanish.",
  interpretive_reading:   "I can understand the main topic and key vocabulary of a written Spanish text.",
  linguistic:             "I can recognize and produce unit vocabulary in context.",
  interpretive_synthesis: "I can draw conclusions from combined visual and linguistic information.",
  cultures:               "I can identify cultural practices and products of the Spanish-speaking world.",
  presentational:         "I can produce simple sentences in Spanish using unit vocabulary.",
};

// ── Proficiency band thresholds ───────────────────────────────────────────────
// Based on ACTFL Novice level descriptors mapped to percentage scores
const BAND_META = [
  { key: "exceeds",     label: "Sobresaliente",  sublabel: "Novice High+",      color: "#c9933a", bg: "bg-[#c9933a]",     min: 85 },
  { key: "meets",       label: "Logrado",         sublabel: "Novice High",       color: "#5a9e6f", bg: "bg-[#5a9e6f]",    min: 75 },
  { key: "approaching", label: "En desarrollo",   sublabel: "Novice Mid",        color: "#e8b455", bg: "bg-[#e8b455]",    min: 60 },
  { key: "novice_low",  label: "Necesita apoyo",  sublabel: "Novice Low",        color: "#c0392b", bg: "bg-[#c0392b]",   min: 0  },
] as const;

// ── Data types ────────────────────────────────────────────────────────────────
interface BandCounts { exceeds: number; meets: number; approaching: number; novice_low: number }
interface ModeEntry { bands: BandCounts; avgScore: number; studentsAssessed: number }

interface UnitData {
  number: number;
  country: string;
  titleEs: string;
  completionCount: number;
  inProgressCount: number;
  totalStudents: number;
  coldCaseCompletions: number;
  modeData: Record<string, ModeEntry>;
  vocab: { mastered: number; emerging: number; struggling: number; total: number; hardest: Array<{ term: string; masteryPct: number }> };
  academia: {
    total: number;
    firstTryPassPct: number | null;
    advancedNoPassPct: number | null;
    readyPct: number | null;
    recommendedPct: number | null;
    requiredPct: number | null;
  };
  support: {
    studentsNeedingSupport: number;
    helpRequested: number;
    listeningSkipped: number;
    transcriptRevealed: number;
    repeatedSkipping: number;
    academiaStruggling: number;
  };
}
interface UnitsData { units: UnitData[] }

// ── Small helpers ─────────────────────────────────────────────────────────────
function proficiencyPct(bands: BandCounts, total: number) {
  return total > 0 ? Math.round(((bands.meets + bands.exceeds) / total) * 100) : 0;
}

function BandBar({ bands, total }: { bands: BandCounts; total: number }) {
  if (total === 0) return <div className="h-3 bg-[#2c2220] rounded-full w-full" />;
  return (
    <div className="h-3 rounded-full overflow-hidden flex w-full" title={`Sobresaliente: ${bands.exceeds} · Logrado: ${bands.meets} · En desarrollo: ${bands.approaching} · Necesita apoyo: ${bands.novice_low}`}>
      {BAND_META.map((b) => {
        const count = bands[b.key];
        const pct = (count / total) * 100;
        return pct > 0 ? (
          <div key={b.key} className={`${b.bg} h-full`} style={{ width: `${pct}%` }} />
        ) : null;
      })}
    </div>
  );
}

function CanDoBadge({ score }: { score: number }) {
  if (score >= 80) return <span className="text-[#5a9e6f] text-[10px]">✅</span>;
  if (score >= 60) return <span className="text-[#e8b455] text-[10px]">⚠️</span>;
  return <span className="text-[#c0392b] text-[10px]">❌</span>;
}

function HeatCell({ score }: { score: number | null }) {
  if (score === null) return <div className="w-8 h-6 bg-[#1a1614] rounded" />;
  const bg = score >= 80 ? "bg-[rgba(90,158,111,0.7)]" : score >= 60 ? "bg-[rgba(232,180,85,0.6)]" : "bg-[rgba(192,57,43,0.6)]";
  return (
    <div className={`w-8 h-6 ${bg} rounded flex items-center justify-center`} title={`${score}%`}>
      <span className="font-typewriter text-[9px] text-white font-bold">{score}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UnitsTab({ classId }: { classId: string }) {
  const { data, loading, lastUpdated, refetch } = useClassData<UnitsData>("/api/teacher/dashboard/units", classId);

  if (!classId) return <Empty />;
  if (loading && !data) return <Loading />;

  const units = data?.units ?? [];
  const activeUnits = units.filter((u) => u.completionCount > 0 || u.inProgressCount > 0);

  // Determine which modes appear across all units (for heat map columns)
  const allModes = Array.from(
    new Set(activeUnits.flatMap((u) => Object.keys(u.modeData)))
  ).sort((a, b) => (MODES[a]?.order ?? 99) - (MODES[b]?.order ?? 99));

  return (
    <div className="space-y-6">
      <TabHeader title="Estándares ACTFL — Por Unidad" lastUpdated={lastUpdated} onRefresh={refetch} />

      {/* ── Proficiency band legend ───────────────────────────────────────── */}
      <div className="border border-[rgba(201,147,58,0.15)] bg-[#111218] px-4 py-3">
        <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-2">
          Bandas de desempeño · ACTFL Novice Level
        </p>
        <div className="flex flex-wrap gap-4">
          {BAND_META.map((b) => (
            <div key={b.key} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: b.color }} />
              <div>
                <span className="font-typewriter text-[10px] text-[#c4a882]">{b.label}</span>
                <span className="font-typewriter text-[9px] text-[#8b7355] ml-1">({b.sublabel})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cross-unit ACTFL heat map ─────────────────────────────────────── */}
      {activeUnits.length > 1 && allModes.length > 0 && (
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] overflow-x-auto">
          <div className="px-4 py-3 border-b border-[rgba(201,147,58,0.1)]">
            <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">
              Vista global — Promedio de clase por modo ACTFL
            </p>
          </div>
          <div className="p-4">
            {/* Column headers */}
            <div className="flex gap-2 mb-2 ml-20">
              {allModes.map((mode) => (
                <div key={mode} className="w-8 text-center" title={(MODES[mode]?.standard ?? mode)}>
                  <span className="text-sm">{MODES[mode]?.icon ?? "?"}</span>
                </div>
              ))}
            </div>
            {/* Rows */}
            {activeUnits.map((u) => (
              <div key={u.number} className="flex items-center gap-2 mb-1.5">
                <span className="font-typewriter text-[10px] text-[#8b7355] w-20 shrink-0 truncate">
                  C{u.number} {u.country}
                </span>
                {allModes.map((mode) => {
                  const d = u.modeData[mode];
                  return <HeatCell key={mode} score={d ? d.avgScore : null} />;
                })}
              </div>
            ))}
            {/* Mode labels below */}
            <div className="flex gap-2 mt-3 ml-20 border-t border-[rgba(201,147,58,0.08)] pt-2">
              {allModes.map((mode) => (
                <div key={mode} className="w-8 text-center">
                  <p className="font-typewriter text-[7px] text-[#8b7355] leading-tight text-center">
                    {MODES[mode]?.standard.split(" ").slice(-1)[0] ?? mode}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Per-unit cards ────────────────────────────────────────────────── */}
      <div className="space-y-5">
        {units.map((u) => {
          const completionPct = u.totalStudents > 0 ? Math.round((u.completionCount / u.totalStudents) * 100) : 0;
          const modes = Object.entries(u.modeData)
            .sort(([a], [b]) => (MODES[a]?.order ?? 99) - (MODES[b]?.order ?? 99));
          const canDo = CAN_DO[u.number] ?? {};
          const hasActivity = u.completionCount > 0 || u.inProgressCount > 0;

          return (
            <div key={u.number} className={`border bg-[#1a1614] ${hasActivity ? "border-[rgba(201,147,58,0.25)]" : "border-[rgba(201,147,58,0.08)] opacity-60"}`}>

              {/* ── Unit header ────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(201,147,58,0.1)]">
                <div className="flex items-center gap-3">
                  <span className="font-typewriter text-[9px] tracking-widest uppercase text-[#8b7355]">Caso {u.number}</span>
                  <span className="font-display font-bold text-[#f5e6c8] text-lg">{u.country}</span>
                  <span className="font-typewriter text-xs text-[#8b7355] italic hidden sm:inline">&ldquo;{u.titleEs}&rdquo;</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="font-typewriter text-[9px] uppercase text-[#8b7355]">Completado</p>
                    <p className="font-typewriter text-sm font-bold text-[#e8b455]">{completionPct}%</p>
                  </div>
                  <div>
                    <p className="font-typewriter text-[9px] uppercase text-[#8b7355]">En progreso</p>
                    <p className="font-typewriter text-sm text-[#c4a882]">{u.inProgressCount}</p>
                  </div>
                </div>
              </div>

              {/* ── Class completion bar ───────────────────────────────── */}
              <div className="px-5 pt-3 pb-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-[#2c2220] rounded-full overflow-hidden">
                    <div className="h-full bg-[#c9933a] rounded-full" style={{ width: `${completionPct}%` }} />
                  </div>
                  <span className="font-typewriter text-[10px] text-[#8b7355] shrink-0">
                    {u.completionCount}/{u.totalStudents} estudiantes
                    {u.coldCaseCompletions > 0 && (
                      <span className="text-[rgba(74,158,255,0.8)] ml-2">· {u.coldCaseCompletions} ❄ Caso Frío</span>
                    )}
                  </span>
                </div>
              </div>

              {!hasActivity ? (
                <p className="font-typewriter text-xs text-[#4a3a2a] px-5 py-4 text-center">
                  Sin actividad aún para esta unidad.
                </p>
              ) : (
                <div className="px-5 pb-5 space-y-5 mt-3">

                  {/* ── ACTFL Communication Modes ───────────────────────── */}
                  {modes.length > 0 && (
                    <div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">
                          Modos de Comunicación ACTFL
                        </p>
                        <p className="font-typewriter text-[9px] text-[#4a3a2a]">World-Readiness Standards</p>
                      </div>
                      <div className="space-y-4">
                        {modes.map(([mode, d]) => {
                          const info = MODES[mode];
                          if (!info) return null;
                          const profPct = proficiencyPct(d.bands, d.studentsAssessed);
                          const statement = canDo[mode] ?? GENERIC_CAN_DO[mode];
                          const total = d.studentsAssessed;

                          return (
                            <div key={mode} className="space-y-1.5">
                              {/* Mode header */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-base shrink-0">{info.icon}</span>
                                  <div className="min-w-0">
                                    <p className="font-typewriter text-[11px] text-[#f5e6c8] font-bold leading-none">
                                      {info.label}
                                    </p>
                                    <p className="font-typewriter text-[9px] text-[#8b7355] leading-none mt-0.5">
                                      {info.standard}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="text-right">
                                    <p className="font-typewriter text-[9px] text-[#8b7355]">En nivel</p>
                                    <p className="font-typewriter text-sm font-bold" style={{
                                      color: profPct >= 80 ? "#5a9e6f" : profPct >= 60 ? "#e8b455" : "#c0392b"
                                    }}>
                                      {profPct}%
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-typewriter text-[9px] text-[#8b7355]">Promedio</p>
                                    <p className="font-typewriter text-xs text-[#c4a882]">{d.avgScore}%</p>
                                  </div>
                                </div>
                              </div>

                              {/* Band distribution bar with labels */}
                              <BandBar bands={d.bands} total={total} />
                              <div className="flex justify-between text-[8px] font-typewriter text-[#4a3a2a]">
                                <span>{d.bands.novice_low > 0 ? `${d.bands.novice_low} Novice Low` : ""}</span>
                                <span>{total} evaluados · {d.bands.meets + d.bands.exceeds} en nivel</span>
                              </div>

                              {/* Can-Do statement */}
                              {statement && (
                                <div className="flex items-start gap-2 bg-[rgba(201,147,58,0.03)] border border-[rgba(201,147,58,0.08)] px-3 py-2 rounded-sm">
                                  <CanDoBadge score={d.avgScore} />
                                  <p className="font-typewriter text-[10px] text-[#8b7355] leading-relaxed italic flex-1">
                                    <span className="text-[#c4a882] not-italic font-bold">Can-Do: </span>
                                    {statement}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Vocabulary mastery summary ───────────────────────── */}
                  {u.vocab.total > 0 && (
                    <div className="border-t border-[rgba(201,147,58,0.08)] pt-4">
                      <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-2">
                        Dominio de Vocabulario · {u.vocab.total} términos
                      </p>
                      {/* Three-bucket bar */}
                      <div className="flex h-4 rounded overflow-hidden mb-2 gap-px">
                        {u.vocab.mastered > 0 && (
                          <div
                            className="bg-[#5a9e6f] flex items-center justify-center"
                            style={{ width: `${(u.vocab.mastered / u.vocab.total) * 100}%` }}
                            title={`${u.vocab.mastered} dominados`}
                          >
                            <span className="font-typewriter text-[8px] text-white">{u.vocab.mastered}</span>
                          </div>
                        )}
                        {u.vocab.emerging > 0 && (
                          <div
                            className="bg-[#e8b455] flex items-center justify-center"
                            style={{ width: `${(u.vocab.emerging / u.vocab.total) * 100}%` }}
                            title={`${u.vocab.emerging} en desarrollo`}
                          >
                            <span className="font-typewriter text-[8px] text-[#1a1614]">{u.vocab.emerging}</span>
                          </div>
                        )}
                        {u.vocab.struggling > 0 && (
                          <div
                            className="bg-[#c0392b] flex items-center justify-center"
                            style={{ width: `${(u.vocab.struggling / u.vocab.total) * 100}%` }}
                            title={`${u.vocab.struggling} con dificultad`}
                          >
                            <span className="font-typewriter text-[8px] text-white">{u.vocab.struggling}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 text-[9px] font-typewriter mb-2">
                        <span className="text-[#5a9e6f]">● {u.vocab.mastered} dominados (≥80%)</span>
                        <span className="text-[#e8b455]">● {u.vocab.emerging} en desarrollo</span>
                        <span className="text-[#c0392b]">● {u.vocab.struggling} con dificultad</span>
                      </div>
                      {u.vocab.struggling > 0 && u.vocab.hardest.filter(v => v.masteryPct < 60).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="font-typewriter text-[9px] text-[#8b7355]">Reteach:</span>
                          {u.vocab.hardest.filter(v => v.masteryPct < 60).slice(0, 4).map((v) => (
                            <span key={v.term} className="font-typewriter text-[9px] px-2 py-0.5 border border-[rgba(192,57,43,0.3)] text-[#c0392b] bg-[rgba(192,57,43,0.05)]">
                              {v.term} <span className="text-[#4a3a2a]">{v.masteryPct}%</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Bottom row: Academia prep + Support flags ─────────── */}
                  <div className="border-t border-[rgba(201,147,58,0.08)] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Academia readiness */}
                    {u.academia.total > 0 && (
                      <div>
                        <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-2">
                          Preparación · La Academia ({u.academia.total})
                        </p>
                        <div className="space-y-1">
                          {[
                            { label: "Pre-evaluados listos",      pct: u.academia.readyPct,          color: "#5a9e6f", desc: "Entered with ≥70% vocab mastery" },
                            { label: "Recomendado",               pct: u.academia.recommendedPct,    color: "#e8b455", desc: "Some review needed" },
                            { label: "Preparación requerida",     pct: u.academia.requiredPct,       color: "#c0392b", desc: "Below mastery threshold" },
                          ].map((tier) => tier.pct != null && tier.pct > 0 ? (
                            <div key={tier.label} className="flex items-center gap-2" title={tier.desc}>
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tier.color }} />
                              <span className="font-typewriter text-[10px] text-[#8b7355] flex-1">{tier.label}</span>
                              <span className="font-typewriter text-[10px] font-bold" style={{ color: tier.color }}>{tier.pct}%</span>
                            </div>
                          ) : null)}
                          {u.academia.firstTryPassPct != null && (
                            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-[rgba(201,147,58,0.08)]">
                              <span className="text-xs">⭐</span>
                              <span className="font-typewriter text-[10px] text-[#8b7355] flex-1">Aprobaron a la primera</span>
                              <span className="font-typewriter text-[10px] text-[#c9933a] font-bold">{u.academia.firstTryPassPct}%</span>
                            </div>
                          )}
                          {u.academia.advancedNoPassPct != null && u.academia.advancedNoPassPct > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs">↗</span>
                              <span className="font-typewriter text-[10px] text-[#8b7355] flex-1">Avanzaron sin aprobar</span>
                              <span className="font-typewriter text-[10px] text-[#c0392b]">{u.academia.advancedNoPassPct}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Support flags summary */}
                    {u.support.studentsNeedingSupport > 0 && (
                      <div>
                        <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-2">
                          Señales de Apoyo
                        </p>
                        <div className="space-y-1">
                          {[
                            { label: "Pidieron ayuda",       count: u.support.helpRequested,      icon: "🙋", color: "#c0392b" },
                            { label: "Saltaron el audio",    count: u.support.listeningSkipped,   icon: "🎧", color: "#c9933a" },
                            { label: "Leyeron transcripción",count: u.support.transcriptRevealed, icon: "📄", color: "#8b7355" },
                            { label: "Saltaron repetido",    count: u.support.repeatedSkipping,   icon: "⚠",  color: "#c0392b" },
                            { label: "Dificultad Academia",  count: u.support.academiaStruggling, icon: "🔄", color: "#c9933a" },
                          ].filter((s) => s.count > 0).map((s) => (
                            <div key={s.label} className="flex items-center gap-2">
                              <span className="text-xs shrink-0">{s.icon}</span>
                              <span className="font-typewriter text-[10px] text-[#8b7355] flex-1">{s.label}</span>
                              <span className="font-typewriter text-[10px] font-bold" style={{ color: s.color }}>
                                {s.count} est.
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
