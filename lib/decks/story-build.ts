/**
 * Story-deck builder.
 *
 * Flattens an authored CaseStory (lib/decks/stories.ts) plus the unit's own
 * content into an ordered slide list, so the renderer stays dumb and the slide
 * ORDER lives in one place.
 *
 * Order is deliberate and is the pedagogy:
 *   cover → crime → artifact → country/city → stakes → vocab → expect → discuss → closer
 * Hook them with the theft, tell them what was taken, ground it in a real
 * place, land why it matters, and only THEN hand them the words — by which
 * point the words have a job to do.
 */

import type { UnitContent } from "@/lib/types/unit-content";
import type { CaseStory, StoryFact, StoryVocabBeat } from "@/lib/decks/stories";

export type StorySlide =
  | {
      kind: "storyCover";
      unitNumber: number;
      caseTitle: string;
      country: string;
      city: string;
      hook: string;
    }
  | {
      kind: "storyBeat";
      eyebrow: string;
      headline: string;
      body: string[];
      pull?: string;
      facts?: StoryFact[];
      real: boolean;
      optional?: boolean;
    }
  | ({ kind: "storyVocab" } & StoryVocabBeat)
  | {
      kind: "storyExpect";
      headline: string;
      items: Array<{ label: string; text: string }>;
    }
  | { kind: "storyDiscuss"; prompt: string; followups: string[] }
  | { kind: "storyCloser"; text: string; caseTitle: string };

export interface StoryDeckMeta {
  unitNumber: number;
  caseTitle: string;
  country: string;
  city: string;
  slideCount: number;
  /** Rough read-aloud estimate, minutes — surfaced so the bell-ringer budget
   *  is visible in the UI instead of being a claim in a comment. */
  estimatedMinutes: number;
  /** Same, with `optional` slides dropped (the NÚCLEO run). */
  coreSlideCount: number;
  coreMinutes: number;
}

export interface StoryDeck {
  meta: StoryDeckMeta;
  slides: StorySlide[];
  teacherNote: string;
}

/**
 * ~118 wpm plus fixed costs per slide type.
 *
 * 118, not the 130 a fluent adult reads at: this is projected to week-one
 * Spanish 1, so the teacher pauses on every Spanish phrase to model
 * pronunciation. 130 under-reported a measured run by ~2 minutes, and a
 * bell-ringer estimate that lies is worse than no estimate.
 */
function estimateMinutes(slides: StorySlide[]): number {
  let words = 0;
  let fixedSeconds = 0;

  for (const s of slides) {
    switch (s.kind) {
      case "storyBeat":
        words += countWords(s.body.join(" ")) + countWords(s.pull ?? "");
        words += (s.facts ?? []).reduce((n, f) => n + countWords(`${f.label} ${f.value}`), 0);
        break;
      case "storyVocab":
        words += countWords(s.situation);
        words += s.entries.reduce((n, e) => n + countWords(`${e.spanish} ${e.english} ${e.note ?? ""}`), 0);
        if (s.production) fixedSeconds += 60; // billed at 30s; costs ~60 with 9th-grade settling
        break;
      case "storyExpect":
        words += s.items.reduce((n, i) => n + countWords(`${i.label} ${i.text}`), 0);
        break;
      case "storyDiscuss":
        words += countWords(s.prompt) + countWords(s.followups.join(" "));
        fixedSeconds += 210; // turn-and-talk + one pair reporting out, measured
        break;
      default:
        words += 10;
    }
    fixedSeconds += 5; // slide transition
  }

  return Math.round(((words / 130) * 60 + fixedSeconds) / 60);
}

function countWords(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

export function buildStoryDeck(unit: UnitContent, story: CaseStory): StoryDeck {
  const slides: StorySlide[] = [];

  slides.push({
    kind: "storyCover",
    unitNumber: unit.unitNumber,
    caseTitle: unit.caseTitle,
    country: unit.country,
    city: unit.city,
    hook: story.hook,
  });

  const beat = (b: CaseStory["crime"]): StorySlide => ({
    kind: "storyBeat",
    eyebrow: b.eyebrow,
    headline: b.headline,
    body: b.body,
    pull: b.pull,
    facts: b.facts,
    real: b.real,
    optional: b.optional,
  });

  slides.push(beat(story.crime));
  story.artifact.forEach((b) => slides.push(beat(b)));
  story.place.forEach((b) => slides.push(beat(b)));
  slides.push(beat(story.stakes));

  story.vocab.forEach((v) => slides.push({ kind: "storyVocab", ...v }));

  slides.push({ kind: "storyExpect", headline: story.expect.headline, items: story.expect.items });
  slides.push({ kind: "storyDiscuss", prompt: story.discuss.prompt, followups: story.discuss.followups });
  slides.push({ kind: "storyCloser", text: story.closer, caseTitle: unit.caseTitle });

  const core = slides.filter((s) => !(s.kind === "storyBeat" && s.optional));

  return {
    meta: {
      unitNumber: unit.unitNumber,
      caseTitle: unit.caseTitle,
      country: unit.country,
      city: unit.city,
      slideCount: slides.length,
      estimatedMinutes: estimateMinutes(slides),
      coreSlideCount: core.length,
      coreMinutes: estimateMinutes(core),
    },
    slides,
    teacherNote: story.teacherNote,
  };
}
