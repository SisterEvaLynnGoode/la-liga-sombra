/**
 * Vocabulary deck builder.
 *
 * Turns a unit's own content into a projectable / printable slide deck.
 *
 * Why this exists: these decks used to be produced by Canva's AI generator,
 * which reliably drifted — it rewrote sourced example sentences into invented
 * prose, dropped English translations, reversed section order, and appended
 * fake "reallygreatsite.com" contact pages. Every deck then needed a manual
 * audit-and-repair pass, and regenerating reintroduced the same damage.
 *
 * Everything here is DERIVED, never authored twice:
 *   - words, translations, examples, sections  ← content/unit-NN.json vocab
 *   - grammar spotlight                        ← lib/worksheets/grammar.ts
 *   - glossary                                 ← the unit's readingComp stage
 *   - bonus clue                               ← the unit's bonusClue
 *   - repaso                                   ← the grouped vocab itself
 *
 * So the deck cannot disagree with the game: they read the same file.
 */

import type { UnitContent, VocabItem } from "@/lib/types/unit-content";
import type { GrammarLesson, GrammarTable, GrammarExample } from "@/lib/worksheets/grammar";

export type DeckSlide =
  | {
      kind: "title";
      unitNumber: number;
      caseTitle: string;
      country: string;
      city: string;
      criminalName: string;
    }
  | { kind: "divider"; label: string; index: number; total: number }
  | { kind: "vocab"; spanish: string; english: string; example?: string; section?: string }
  | {
      kind: "grammar";
      title: string;
      briefing: string;
      examples: GrammarExample[];
      table?: GrammarTable;
    }
  | { kind: "clue"; title: string; text: string }
  | { kind: "glossary"; title: string; entries: Array<{ word: string; translation: string }> }
  | { kind: "repaso"; title: string; groups: Array<{ label: string; words: string[] }> };

export interface DeckMeta {
  unitNumber: number;
  caseTitle: string;
  country: string;
  city: string;
  vocabCount: number;
  slideCount: number;
}

export interface Deck {
  meta: DeckMeta;
  slides: DeckSlide[];
}

const UNGROUPED = "__ungrouped__";

/** Group vocab by `section`, preserving first-appearance order. */
function groupBySection(vocab: VocabItem[]): Array<{ label: string; items: VocabItem[] }> {
  const order: string[] = [];
  const bySection = new Map<string, VocabItem[]>();

  for (const item of vocab) {
    const key = item.section?.trim() || UNGROUPED;
    if (!bySection.has(key)) {
      bySection.set(key, []);
      order.push(key);
    }
    bySection.get(key)!.push(item);
  }

  return order.map((label) => ({ label, items: bySection.get(label)! }));
}

/** Pull the glossary from the unit's readingComp stage, if it has one. */
function readingGlossary(unit: UnitContent): Array<{ word: string; translation: string }> {
  for (const stage of unit.stages) {
    if (stage.type === "readingComp" && stage.glossary?.length) return stage.glossary;
  }
  return [];
}

export function buildDeck(unit: UnitContent, grammar?: GrammarLesson | null): Deck {
  const slides: DeckSlide[] = [];

  slides.push({
    kind: "title",
    unitNumber: unit.unitNumber,
    caseTitle: unit.caseTitle,
    country: unit.country,
    city: unit.city,
    criminalName: unit.criminalName,
  });

  const groups = groupBySection(unit.vocab);
  const labelled = groups.filter((g) => g.label !== UNGROUPED);

  groups.forEach((group) => {
    if (group.label !== UNGROUPED) {
      slides.push({
        kind: "divider",
        label: group.label,
        index: labelled.findIndex((g) => g.label === group.label) + 1,
        total: labelled.length,
      });
    }
    for (const item of group.items) {
      slides.push({
        kind: "vocab",
        spanish: item.spanish,
        english: item.english,
        example: item.example,
        section: group.label === UNGROUPED ? undefined : group.label,
      });
    }
  });

  // Grammar spotlight — reuses the worksheet lesson so the deck, the printed
  // packet, and the case never drift apart.
  if (grammar && (grammar.examples.length || grammar.referenceTable)) {
    slides.push({
      kind: "grammar",
      title: grammar.title,
      briefing: grammar.briefing,
      examples: grammar.examples,
      table: grammar.referenceTable,
    });
  }

  if (unit.bonusClue) {
    slides.push({ kind: "clue", title: "Pista Bonus", text: unit.bonusClue });
  }

  const glossary = readingGlossary(unit);
  if (glossary.length) {
    slides.push({ kind: "glossary", title: "Palabras de la Bitácora", entries: glossary });
  }

  const repasoGroups = groups.map((g) => ({
    label: g.label === UNGROUPED ? "Vocabulario" : g.label,
    words: g.items.map((i) => i.spanish),
  }));
  slides.push({ kind: "repaso", title: "Repaso: Vocabulario Completo", groups: repasoGroups });

  return {
    meta: {
      unitNumber: unit.unitNumber,
      caseTitle: unit.caseTitle,
      country: unit.country,
      city: unit.city,
      vocabCount: unit.vocab.length,
      slideCount: slides.length,
    },
    slides,
  };
}
