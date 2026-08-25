/**
 * Family syllabus — the back-to-school-night deck.
 *
 * Projected for parents and printed as the handout from the same page, so it
 * has to read both ways: big enough for a wall, complete enough to take home.
 *
 * Derived, not retyped. The grade split comes from lib/grading-report.ts, the
 * norms from the Day 2 student deck, the year's shape from lib/pacing/plan.ts,
 * and the bio from TEACHER_PROFILE. A syllabus is the one document a family
 * will quote back to you in March; it must not be able to drift from what the
 * gradebook and the classroom actually do.
 */

import type { StoryDeck, StorySlide } from "@/lib/decks/story-build";
import { estimateMinutes } from "@/lib/decks/story-build";
import { TEACHER_PROFILE, CLASS_NORMS } from "@/lib/decks/intro";
import { GRADE_WEIGHTS } from "@/lib/grading-report";
import { ARCS } from "@/lib/pacing/plan";

/**
 * The code families use to follow along at home.
 *
 * A named constant rather than a string buried in a slide, for one reason:
 * signing up with a class code creates a REAL student row in that class. Every
 * parent who uses this code lands in that class's roster, gradebook,
 * leaderboard and dashboard counts. Point it at a class made for families,
 * never at a period where students are graded.
 */
export const FAMILY_CLASS_CODE = "HGK175";

const SITE = "la-liga-sombra.vercel.app";
const pct = (n: number) => Math.round(n * 100) + "%";

function slides(): StorySlide[] {
  return [
    {
      kind: "storyCover",
      unitNumber: 0,
      caseTitle: "Español 1 · La Liga Sombra",
      country: "Noche de Regreso a Clases",
      city: TEACHER_PROFILE.name,
      hook: "A detective agency, twenty Spanish-speaking countries, and one year to get your student talking.",
    },

    {
      kind: "storyBeat",
      eyebrow: "La Clase · What This Class Is",
      headline: "Spanish 1, taught as a case file",
      body: [
        "Your student has joined a fictional agency that recovers stolen cultural treasures — a two-hundred-year-old guitar in Mexico, a jade mask in Guatemala, the only recording of a song in Cuba. Each case is set in a different Spanish-speaking country.",
        "To solve one they have to read a witness statement, listen to a phone call, question a suspect and justify an arrest — all in Spanish. The Spanish is not homework attached to a story. It is the only way through it.",
        "The agency and the thief are invented. The countries, cities, history, music and food are not, and every screen is stamped either ESTO ES REAL or FICCIÓN DEL CASO so your student always knows which is which.",
      ],
      pull: "Twenty countries. Twenty cases. One year.",
      real: true,
    },

    {
      kind: "storyBeat",
      eyebrow: "Su Profe · Your Teacher",
      headline: TEACHER_PROFILE.name,
      body: TEACHER_PROFILE.bio,
      facts: TEACHER_PROFILE.facts,
      real: true,
    },

    {
      kind: "storyBeat",
      eyebrow: "El Año · The Year",
      headline: "Where the year goes",
      body: [
        "The year runs in six six-week arcs. Semester one is present-day: greetings and introductions, then daily life and description, then culture and plans for the future. Semester two is a time-travel arc — the same countries, earlier centuries — which keeps grammar under constant review while the settings change.",
        "By June the target is Intermediate Low to Mid: your student can introduce themselves, describe people and places, ask and answer real questions, say what happened, and hold a short conversation with a stranger.",
      ],
      facts: ARCS.map((a) => ({ label: a.weeks + " · " + a.title, value: a.band })),
      real: true,
    },

    {
      kind: "storyBeat",
      eyebrow: "Las Notas · Grades",
      headline: pct(GRADE_WEIGHTS.quality) + " how well. " + pct(GRADE_WEIGHTS.completion) + " how much.",
      body: [
        "The percentage in the gradebook is built from two things. " + pct(GRADE_WEIGHTS.quality) + " is quality — how accurate the work is across vocabulary, grammar and listening. " + pct(GRADE_WEIGHTS.completion) + " is completion — how many of the assigned cases actually got finished.",
        "Almost everything in this class can be redone for full credit. A low score on a case is information, not a verdict. What cannot be fixed is work that was never turned in — and in practice that, not ability, is what sinks a grade.",
        "You will also see a proficiency level. That is not the grade. It measures what your student can DO with the language, it only ever goes up, and it is the number that matters when they reach Spanish 2.",
      ],
      pull: "Redo it. Almost everything here can be done again for full credit.",
      real: true,
    },

    {
      kind: "storyExpect",
      eyebrow: "Las Normas",
      headline: "The six rules of this room",
      items: CLASS_NORMS,
    },

    {
      kind: "storyBeat",
      eyebrow: "Ahora Mismo · Right Now",
      headline: "We are starting on paper",
      body: [
        "The school does not yet have enough Chromebooks for this class, so the first weeks run entirely on paper and out loud — greetings, survival phrases, classroom commands, numbers, and a good deal of drawing. Your student is building an agent file and a detective persona they will keep all year.",
        "None of that is a placeholder. It is the same Spanish they would be doing on a screen, and when the machines arrive they will already know who they are when they open the first case.",
        "So if your student says «we haven't done the game yet» — that is correct, and it is not a delay in their learning.",
      ],
      real: true,
    },

    {
      kind: "storyBeat",
      eyebrow: "En Casa · Play Along At Home",
      headline: "Class code: " + FAMILY_CLASS_CODE,
      body: [
        "You can play the cases yourself. It is the fastest way to know what your student is actually being asked to do, and it gives you something specific to ask about at dinner instead of «how was Spanish today».",
        "Go to " + SITE + ", choose «Soy estudiante», enter the class code " + FAMILY_CLASS_CODE + ", then pick a name and a four-digit PIN. Please put your family name in it — «Familia Nguyen» — so I can tell families apart from students.",
        "You need no Spanish at all to start. Case one assumes you know nothing, which is exactly the assumption it makes about your student.",
      ],
      facts: [
        { label: "Sitio web", value: SITE },
        { label: "Código de clase", value: FAMILY_CLASS_CODE },
        { label: "Su nombre", value: "Familia + su apellido" },
        { label: "Costo", value: "Nada. Sin anuncios." },
      ],
      real: true,
    },

    {
      kind: "storyBeat",
      eyebrow: "Cómo Ayudar · How To Help",
      headline: "Three things that actually help",
      body: [
        "Ask them to teach you one phrase, out loud, and let them correct your pronunciation. Being the expert for ninety seconds does more for a beginner than an hour of being quizzed.",
        "If they are behind, the fix is almost always finishing an unfinished case, not studying harder. Ask them to open the mission board and find what is still open.",
        "If Spanish is spoken in your home, please tell me. Your student may be in the wrong course — there is a class for heritage speakers, and it is a better room for them.",
      ],
      real: true,
    },

    {
      kind: "storyDiscuss",
      prompt: "The questions I get every year, and the honest answers.",
      followups: [
        "«My student has never taken Spanish.» — Neither had most of them. Case one assumes zero.",
        "«They're not a gamer.» — There is no speed or reflex involved. It is reading, listening and choosing.",
        "«What if they miss a week?» — Cases stay open. Nothing locks them out, and I would much rather they finish late than not at all.",
        "«How do I see grades?» — The district gradebook, same as every class. The proficiency level comes home separately.",
      ],
    },

    {
      kind: "storyCloser",
      text: "Thank you for coming. Class code " + FAMILY_CLASS_CODE + " — play case one tonight and you will know more about this course than any syllabus could tell you.",
      caseTitle: "Español 1 · La Liga Sombra",
    },
  ];
}

const TEACHER_NOTE = [
  "Built for back-to-school night: project it, and print the same page as the handout families take home.",
  "",
  "READ THIS BEFORE YOU PUBLISH THE CODE. Signing up with a class code creates a real student row in that class. Every parent who uses " + FAMILY_CLASS_CODE + " will show up in that class's roster, gradebook, leaderboard and dashboard counts — including the proficiency numbers you show administrators. If " + FAMILY_CLASS_CODE + " is one of your teaching periods, make a separate class for families first and put THAT code on the slide. The code lives in one constant (FAMILY_CLASS_CODE in lib/decks/syllabus.ts), so changing it once changes it on every slide.",
  "",
  "The «Familia + apellido» instruction is the fallback if you do share a live class code: it at least makes parent accounts identifiable at a glance so you can filter or delete them later.",
  "",
  "The grade split, the six norms, the arc table and the bio are imported from the files the classroom itself uses, so this deck cannot quietly disagree with the gradebook or with what students were told on day two.",
  "",
  "The «we are starting on paper» slide is worth saying out loud rather than skipping. Families who heard about a video game and then hear about worksheets will assume something went wrong; naming the Chromebook shortage yourself is what stops that becoming a rumour.",
].join("\n");

export function buildSyllabusDeck(): StoryDeck {
  const s = slides();
  return {
    meta: {
      unitNumber: 0.9,
      caseTitle: "Syllabus para familias",
      country: "La Liga Sombra",
      city: "Noche de Regreso a Clases",
      slideCount: s.length,
      estimatedMinutes: estimateMinutes(s),
      coreSlideCount: s.length,
      coreMinutes: estimateMinutes(s),
      label: "Familias · Syllabus (Back to School Night)",
    },
    slides: s,
    teacherNote: TEACHER_NOTE,
  };
}
