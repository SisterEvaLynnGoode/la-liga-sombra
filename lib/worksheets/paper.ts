/**
 * Shared shapes for the printable paper packets (Semana 1, Semana 2, …).
 *
 * The paper weeks run BEFORE and independently of the game: no case is
 * referenced, nothing needs a Chromebook, and no page ends by promising an
 * online case the class may not be able to open. One renderer, many weeks.
 */

export interface MatchPair {
  spanish: string;
  english: string;
}

export interface ScenarioItem {
  /** The situation, in English — students are three days into Spanish 1. */
  situation: string;
  /** The phrase we expect. Used to build the key. */
  answer: string;
}

export interface CommandItem {
  spanish: string;
  english: string;
}

export type WeekOneBlock =
  | { kind: "instructions"; text: string }
  | { kind: "refBox"; title: string; pairs: MatchPair[] }
  | { kind: "match"; title: string; instructions: string; pairs: MatchPair[] }
  | { kind: "scenarios"; title: string; instructions: string; items: ScenarioItem[] }
  | { kind: "writeLines"; title: string; instructions: string; prompts: string[]; lines: number }
  | { kind: "drawGrid"; title: string; instructions: string; items: CommandItem[] }
  | { kind: "badge"; title: string; instructions: string; fields: string[] }
  | { kind: "persona"; title: string; instructions: string; frame: string[]; options: MatchPair[] }
  /** Compact multi-column reference — numbers, where a 2-column box runs too tall. */
  | { kind: "grid"; title: string; columns: number; pairs: MatchPair[] }
  /** A drawing area with numbered label lines beside it. */
  | { kind: "labelScene"; title: string; instructions: string; sceneHint: string; labels: number; wordBank?: string[] };

export interface WeekOnePage {
  id: string;
  day: string;
  title: string;
  subtitle: string;
  blocks: WeekOneBlock[];
  /** Printed small at the foot of the page. */
  footer?: string;
}


// ── Answer key ───────────────────────────────────────────────────────────────

/** Everything that has a correct answer, collected for the teacher key. */
export interface KeySection {
  page: string;
  title: string;
  answers: string[];
}

export function buildAnswerKey(pages: WeekOnePage[]): KeySection[] {
  const out: KeySection[] = [];
  for (const page of pages) {
    for (const b of page.blocks) {
      if (b.kind === "scenarios") {
        out.push({
          page: `${page.day} · ${page.title}`,
          title: b.title,
          answers: b.items.map((it, i) => `${i + 1}. ${it.answer}`),
        });
      }
      if (b.kind === "match") {
        out.push({
          page: `${page.day} · ${page.title}`,
          title: b.title,
          answers: b.pairs.map((p) => `${p.spanish} — ${p.english}`),
        });
      }
    }
  }
  return out;
}
