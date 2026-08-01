/**
 * La Última Estación — the Casos 16–20 season.
 *
 * What a student did to El Cronista at the end of Operación Reloj de Arena
 * decides which faction they spend the rest of the year in. The three endings
 * are three different positions to be standing in, so the season reuses them
 * rather than inventing a new choice students have no stake in.
 *
 * DESIGN CONSTRAINT worth stating up front, because it is what keeps this
 * affordable: a faction changes POSTURE, not CONTENT. Three endings × five
 * cases would be fifteen cases to author, which is Semester 2 written three
 * times and the end of any hope that the decks and lesson plans stay derived
 * from one source. Instead every faction plays the same case and differs in
 * where its information comes from — and in how that information betrays them
 * exactly once.
 */

import type { BossEnding } from "@/lib/types/boss";

export type FactionId = "viajeros" | "cazadores" | "socios";

export interface Faction {
  id: FactionId;
  /** Shown to students. */
  name: string;
  /** One line, second person — what you did and where it left you. */
  tagline: string;
  /** How this faction gets its information across the season. */
  informant: string;
  /**
   * The betrayal. Every faction gets one, in the flavour of its own choice —
   * a twist only one third of the class experiences is a twist two thirds of
   * the class hear about secondhand.
   */
  betrayal: string;
  emoji: string;
  /** Tailwind-ready accent, matching the existing noir palette. */
  accent: string;
}

export const FACTIONS: Record<FactionId, Faction> = {
  viajeros: {
    id: "viajeros",
    name: "Los Viajeros",
    tagline: "Tomaste la máquina. Él sigue libre — y siempre llega primero.",
    informant:
      "El Cronista llega a cada época antes que tú y deja sus notas. Son verdaderas y nunca están completas.",
    betrayal:
      "Una vez, las notas son cebo. Él sabe que tienes su máquina, y sabe exactamente dónde vas a buscar.",
    emoji: "⏳",
    accent: "#c9933a",
  },
  cazadores: {
    id: "cazadores",
    name: "Los Cazadores",
    tagline: "Lo detuviste. No habla — y las cinco piezas siguen perdidas.",
    informant:
      "De él no sacas nada. En su lugar tienes un testigo más en cada caso: más trabajo, más español, ninguna pista regalada.",
    betrayal:
      "Una vez, ese testigo está comprado. La única fuente que no vino de él resulta que también era suya.",
    emoji: "⚖️",
    accent: "#c0392b",
  },
  socios: {
    id: "socios",
    name: "Los Socios",
    tagline: "Hiciste el trato. Coopera contigo — y sigue siendo un ladrón.",
    informant:
      "El Cronista te da una pista en cada caso. Llegan rápido, llegan claras, y te ahorran una etapa entera.",
    betrayal:
      "Una vez, miente. Confiaste en él cuatro casos seguidos y usó exactamente eso.",
    emoji: "🤝",
    accent: "#6faa5c",
  },
};

export const FACTION_IDS: FactionId[] = ["viajeros", "cazadores", "socios"];

/**
 * Which case the floor drops out in. Three cases to build trust, the betrayal
 * in the fourth, and the finale after it — early enough to recover from, late
 * enough to have cost something.
 */
export const BETRAYAL_UNIT = 19;

/** The season's cases. 20 is the live finale. */
export const SEASON_UNITS = [16, 17, 18, 19, 20];
export const FINALE_UNIT = 20;

/** Reloj de Arena's three endings map straight onto the three factions. */
const ENDING_TO_FACTION: Partial<Record<BossEnding, FactionId>> = {
  trato_del_reloj: "viajeros",
  la_detencion: "cazadores",
  el_acuerdo: "socios",
};

export function factionFromEnding(ending: string | null | undefined): FactionId | null {
  if (!ending) return null;
  return ENDING_TO_FACTION[ending as BossEnding] ?? null;
}

export function isFactionId(v: string | null | undefined): v is FactionId {
  return v === "viajeros" || v === "cazadores" || v === "socios";
}

/**
 * The faction a student is actually in.
 *
 * An explicit choice always wins over the derived one: a student who was absent
 * for the boss picks a side on entry, and a teacher can move anyone to balance
 * team sizes. Returning null means "not in the season yet" — the caller shows
 * the picker rather than guessing, because being silently assigned to a story
 * position you did not choose is worse than one extra screen.
 */
export function resolveFaction(input: {
  override?: string | null;
  bossEnding?: string | null;
}): FactionId | null {
  if (isFactionId(input.override)) return input.override;
  return factionFromEnding(input.bossEnding);
}

// ── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Season points for one finished case.
 *
 * Weighted toward production on purpose. Competition is a lever and it pulls
 * whichever way it is pointed: if the score rewards finishing fast, a class
 * learns that fast beats good, and that is a semester spent undoing something
 * we caused. Speaking and writing are worth the most; raw speed is worth
 * nothing at all, and does not appear in this function.
 */
export interface CaseScoreInput {
  /** 0–1, accuracy across the case's non-production stages. */
  accuracy: number;
  /** 0–1, score on spoken/written production stages. Absent if the case had none. */
  production?: number;
  /** Did they finish the case at all? */
  solved: boolean;
  /** 0–1, their own previous best on this unit — improvement is worth points. */
  previousBest?: number;
}

export const POINTS = {
  solved: 100,
  accuracy: 60,
  production: 140,
  improvement: 80,
} as const;

export function scoreCase(input: CaseScoreInput): number {
  if (!input.solved) return 0;
  let pts = POINTS.solved;
  pts += Math.round(input.accuracy * POINTS.accuracy);
  if (input.production !== undefined) {
    pts += Math.round(input.production * POINTS.production);
  }
  if (input.previousBest !== undefined) {
    const gain = Math.max(0, input.accuracy - input.previousBest);
    pts += Math.round(gain * POINTS.improvement);
  }
  return pts;
}

export interface FactionStanding {
  faction: FactionId;
  members: number;
  totalPoints: number;
  /**
   * The number actually shown. Raw totals mean the biggest faction wins by
   * Tuesday and the competition is over — six students have to be able to beat
   * twenty.
   */
  pointsPerAgent: number;
  casesSolved: number;
}

export function buildStandings(
  rows: Array<{ faction: FactionId; studentId: string; points: number; casesSolved: number }>,
): FactionStanding[] {
  const byFaction = new Map<FactionId, { pts: number; ids: Set<string>; cases: number }>();
  for (const id of FACTION_IDS) byFaction.set(id, { pts: 0, ids: new Set(), cases: 0 });

  for (const r of rows) {
    const f = byFaction.get(r.faction);
    if (!f) continue;
    f.pts += r.points;
    f.ids.add(r.studentId);
    f.cases += r.casesSolved;
  }

  return FACTION_IDS.map((id) => {
    const f = byFaction.get(id)!;
    const members = f.ids.size;
    return {
      faction: id,
      members,
      totalPoints: f.pts,
      pointsPerAgent: members ? Math.round(f.pts / members) : 0,
      casesSolved: f.cases,
    };
  }).sort((a, b) => b.pointsPerAgent - a.pointsPerAgent);
}
