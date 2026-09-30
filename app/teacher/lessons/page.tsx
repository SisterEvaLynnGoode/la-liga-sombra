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
import assetManifest from "@/lib/generated/asset-manifest.json";

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

/**
 * What media exists, according to the build.
 *
 * This used to be fs.existsSync against /public while the page rendered. That
 * is true locally and false on every production request — Vercel serves /public
 * from its static layer, so the server function cannot see those files — and
 * the result was every lesson plan reporting "the listening clip is missing
 * from disk … that stage will play silence" for audio that plays perfectly.
 * scripts/build-asset-manifest.mjs records the real filesystem at build time.
 */
const AUDIO_ON_DISK = new Set<string>(assetManifest.audio);
const SCROLL_WORLDS = new Set<string>(assetManifest.scrollWorlds);

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
    const hasAudio = audioUrls.length === 0 || audioUrls.every((u) => AUDIO_ON_DISK.has(u));
    const vocabAudioCount = content.vocab.filter((v) => v.audio && AUDIO_ON_DISK.has(v.audio)).length;

    const shared = {
      unit,
      content,
      grammar,
      culture,
      story,
      storyMinutes: story ? buildStoryDeck(content, story).meta.coreMinutes : null,
      vocabDeckSlides: buildDeck(content, grammar).meta.slideCount,
      hasAudio,
      listeningClips: audioUrls.length,
      vocabAudioCount,
      hasColdCase: !!getUnitContent(unit.number, true),
      hasScrollWorld: SCROLL_WORLDS.has(`unit-${String(unit.number).padStart(2, "0")}`),
    };
    for (const sc of SCHEDULES) {
      plansBySchedule[sc.id].push(buildLessonPlan({ ...shared, scheduleId: sc.id as ScheduleId }));
    }
  }

  return <LessonsClient plansBySchedule={plansBySchedule} />;
}
