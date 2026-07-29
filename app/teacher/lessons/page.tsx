import fs from "fs";
import path from "path";
import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import { UNITS } from "@/lib/game/units";
import { buildLessonPlan, type LessonPlan } from "@/lib/lessons/build";
import { buildDeck } from "@/lib/decks/build";
import { buildStoryDeck } from "@/lib/decks/story-build";
import { getCaseStory } from "@/lib/decks/stories";
import { getGrammarLesson, GRAMMAR } from "@/lib/worksheets/grammar";
import { getCultureLesson } from "@/lib/worksheets/culture";
import type { UnitContent } from "@/lib/types/unit-content";
import { SCHEDULES, type ScheduleId } from "@/lib/lessons/schedule";
import LessonsClient from "./LessonsClient";

export const metadata = { title: "Lesson Plans — La Liga Sombra" };

function getUnitContent(n: number, cold = false): UnitContent | null {
  try {
    const suffix = cold ? "-cold" : "";
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@/content/unit-${String(n).padStart(2, "0")}${suffix}.json`) as UnitContent;
  } catch {
    return null;
  }
}

/** Disk checks live here so the builder stays pure and testable. */
function fileExists(rel: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), rel));
  } catch {
    return false;
  }
}

export default async function LessonsPage() {
  if (!(await getTeacherSession())) redirect("/teacher/login");

  // Build every schedule variant server-side — they are pure functions over data
  // already in memory, so switching schedules in the UI needs no round trip.
  const plansBySchedule: Record<string, LessonPlan[]> = {};
  for (const sc of SCHEDULES) plansBySchedule[sc.id] = [];

  for (const unit of UNITS) {
    const content = getUnitContent(unit.number);
    if (!content?.vocab?.length) continue;

    const story = getCaseStory(unit.number);
    const grammar = GRAMMAR[unit.number] ? getGrammarLesson(unit.number, unit.description) : null;
    const culture = getCultureLesson(unit.number);

    // Does the listening clip this case points at actually exist?
    const audioUrls = content.stages
      .map((s) => (s.type === "listeningComp" ? s.audioUrl : null))
      .filter(Boolean) as string[];
    const hasAudio =
      audioUrls.length === 0 ||
      audioUrls.every((u) => fileExists(path.join("public", u.replace(/^\//, ""))));

    const shared = {
      unit,
      content,
      grammar,
      culture,
      story,
      storyMinutes: story ? buildStoryDeck(content, story).meta.coreMinutes : null,
      vocabDeckSlides: buildDeck(content, grammar).meta.slideCount,
      hasAudio,
      hasColdCase: !!getUnitContent(unit.number, true),
      hasScrollWorld: fileExists(`public/scroll-worlds/unit-${String(unit.number).padStart(2, "0")}`),
    };
    for (const sc of SCHEDULES) {
      plansBySchedule[sc.id].push(buildLessonPlan({ ...shared, scheduleId: sc.id as ScheduleId }));
    }
  }

  return <LessonsClient plansBySchedule={plansBySchedule} />;
}
