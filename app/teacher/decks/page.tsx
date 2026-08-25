import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import { UNITS } from "@/lib/game/units";
import { buildDeck, type Deck } from "@/lib/decks/build";
import { buildStoryDeck, type StoryDeck } from "@/lib/decks/story-build";
import { getCaseStory } from "@/lib/decks/stories";
import { buildIntroDecks } from "@/lib/decks/intro";
import { buildSyllabusDeck } from "@/lib/decks/syllabus";
import { getGrammarLesson } from "@/lib/worksheets/grammar";
import type { UnitContent } from "@/lib/types/unit-content";
import DecksClient from "./DecksClient";

export const metadata = { title: "Vocab Decks — La Liga Sombra" };

// Unit content registry (mirrors the worksheets/gate/play pages)
function getUnitContent(n: number): UnitContent | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@/content/unit-${String(n).padStart(2, "0")}.json`) as UnitContent;
  } catch {
    return null;
  }
}

export default async function DecksPage() {
  if (!(await getTeacherSession())) redirect("/teacher/login");

  // Pre-build every deck server-side so switching units and printing need no fetch.
  const decks: Deck[] = [];
  // Orientation first: the Story tab opens on the first day of the year, not on Caso 1.
  // Orientation first, then the family syllabus, then the cases.
  const stories: StoryDeck[] = [...buildIntroDecks(), buildSyllabusDeck()];

  for (const unit of UNITS) {
    const content = getUnitContent(unit.number);
    if (!content?.vocab?.length) continue;

    decks.push(buildDeck(content, getGrammarLesson(unit.number, unit.description)));

    // Story decks are authored per case, so most units won't have one yet.
    const story = getCaseStory(unit.number);
    if (story) stories.push(buildStoryDeck(content, story));
  }

  return <DecksClient decks={decks} stories={stories} />;
}
