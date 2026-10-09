"use client";

import { practiceFor } from "@/lib/reports/practice";
import type { SkillBucket } from "@/lib/reports/skills";
import { INK } from "@/components/reports/charts";
import {
  StoryStrip, KnewLearned, MistakeMix, PaceMarker, GrowthPair, GlanceStrip,
  ParentFigure, NotEnoughYet, type CaseSquare,
} from "@/components/reports/parent-charts";
import { Letterhead } from "./shared";
import { allBuckets, firstTryPctOf, nameFor, type Payload, type Profile, type Student } from "./types";

/**
 * The parent report card — three pages, English, written for an adult who
 * does not speak Spanish and will read this once.
 *
 *   1. Who this is about, what changed recently, what they do well.
 *   2. The data, four small figures in two columns, each explained.
 *   3. Where they need practice, and what to do about it at the kitchen table.
 *
 * Every figure follows the same contract: a plain title, one line on how to
 * read it, and one line of "what it means for you" that either names an
 * action or says plainly that none is needed. A number never appears without
 * the thing it counts attached to it, and no figure shows a rank — where a
 * comparison helps, the class median appears as a quiet reference and nothing
 * more. A parent handed a rank reads it as a verdict.
 *
 * Figures degrade individually. A child three weeks into the course has no
 * mistake profile and no pace; those boxes say so in a sentence rather than
 * printing an empty chart or, worse, a chart built on four data points.
 */

const TOTAL_CASES = 32;

/** The practice engine needs to know what sort of skill a weak area is. */
function kindOf(bucket: SkillBucket, p: Profile): "vocab" | "grammar" | "listening" | "speaking" {
  if (p.listening && bucket.label === p.listening.label) return "listening";
  if (p.speaking && bucket.label === p.speaking.label) return "speaking";
  if (p.grammarBySkill.some((b) => b.label === bucket.label)) return "grammar";
  return "vocab";
}

/** Plain English for a number, because "72%" alone tells a parent nothing. */
function masteryWords(b: SkillBucket): string {
  const m = b.masteredPct ?? 0;
  const f = b.firstTryPct ?? 0;
  if (m >= 95 && f >= 85) return "Solid. They knew almost all of this the first time they saw it.";
  if (m >= 90 && f >= 75) return "Strong. They worked out nearly everything here, most of it straight away.";
  if (m >= 90) return "They got there on all of it, but needed more than one try on much of it — the knowledge is new rather than secure.";
  if (m >= 75) return "Mostly there. A few items are still missing, and first attempts are often wrong.";
  if (m >= 50) return "About half of this is not yet learned. This is where practice pays off fastest.";
  return "Most of this has not been learned yet. Short, frequent practice will move it quickly.";
}

const MISTAKE_WORDS: Record<string, string> = {
  word_order: "Word order",
  vocab: "The word itself",
  spelling: "Spelling",
  agreement: "Gender or number",
  conjugation: "Verb endings",
};

export default function ParentReport({ s, data }: { s: Student; data: Payload }) {
  const p = s.profile;
  const first = nameFor(s).split(" ")[0];
  const a = data.analytics;
  const gaps = p.needsWork;
  const bossesTaken = s.bosses.filter((b) => b.status === "completed").length;

  /* ── The story strip ────────────────────────────────────────────────── */
  const myStatus = new Map(
    (a?.caseStatus ?? []).filter((c) => c.studentId === s.studentId).map((c) => [c.caso, c])
  );
  const squares: CaseSquare[] = Array.from({ length: TOTAL_CASES }, (_, i) => {
    const caso = i + 1;
    const row = myStatus.get(caso);
    const state: CaseSquare["state"] =
      !row ? "todo"
      : row.credited ? "credited"
      : row.status === "completed" ? "done"
      : row.status === "in_progress" ? "doing"
      : "todo";
    return { caso, state };
  });
  const done = squares.filter((q) => q.state === "done").length;
  const credited = squares.filter((q) => q.state === "credited").length;
  const doing = squares.find((q) => q.state === "doing");

  /* ── Knew it / learned it ───────────────────────────────────────────── */
  const knewLearned = allBuckets(p)
    .filter((b) => b.items >= 4)
    .sort((x, y) => (x.firstTryPct ?? 0) - (y.firstTryPct ?? 0))
    .slice(0, 6)
    .map((b) => ({ label: b.label, knew: b.firstTryPct ?? 0, learned: b.masteredPct ?? 0 }));
  const widestGap = [...knewLearned].sort((x, y) => (y.learned - y.knew) - (x.learned - x.knew))[0];

  /* ── Mistake mix ────────────────────────────────────────────────────── */
  const myErrors = (a?.errorsByStudent ?? [])
    .filter((e) => e.studentId === s.studentId)
    .sort((x, y) => y.events - x.events);
  const errorTotal = myErrors.reduce((n, e) => n + e.events, 0);
  const enoughErrors = errorTotal >= 5;

  /* ── Pace ───────────────────────────────────────────────────────────── */
  const mine = (a?.latency ?? []).find((l) => l.studentId === s.studentId);
  const allPace = (a?.latency ?? []).map((l) => l.medianMs / 1000).sort((x, y) => x - y);
  const classPace = allPace.length ? allPace[Math.floor(allPace.length / 2)] : null;
  const mySeconds = mine ? mine.medianMs / 1000 : null;
  const paceMax = Math.max(8, Math.ceil(((classPace ?? 3) * 2.5) / 2) * 2);
  const paceWords = (() => {
    if (mySeconds == null || classPace == null) return "";
    const ft = firstTryPctOf(p) ?? 0;
    const quick = mySeconds < classPace * 0.8;
    const slow = mySeconds > classPace * 1.3;
    if (quick && ft >= 70) return `${first} answers quickly and gets it right — that is fluency starting to form, and it is exactly what you want to see.`;
    if (quick && ft < 70) return `${first} is answering faster than most and missing a lot of them. That pattern usually means guessing rather than reading the question. Slowing down is the whole fix.`;
    if (slow && ft >= 70) return `${first} takes their time and gets it right. That is careful work, not a problem — speed comes later, on its own.`;
    if (slow) return `${first} is working slowly and still missing a lot, which usually means the material itself is hard rather than that they are rushing. The practice on the last page is aimed at that.`;
    return `${first} works at about the pace of the class. Nothing to act on here.`;
  })();

  /* ── Recent growth ──────────────────────────────────────────────────── */
  const g = (a?.growth ?? []).find((x) => x.studentId === s.studentId);

  return (
    <>
      {/* ═══ PAGE 1 ═══════════════════════════════════════════════════════ */}
      <section className="ws-page">
        <Letterhead data={data} title={`Spanish Progress Report: ${nameFor(s)}`} />

        <p className="font-serif text-[11px] leading-relaxed mb-2.5">
          This covers your child&rsquo;s work in Spanish 1. The class learns through a detective story: students take
          on cases set in a different Spanish-speaking country each time, and to solve one they have to understand and
          use real Spanish — reading a witness statement, listening to a recording, building sentences, choosing the
          right verb. The program records every one of those moments, and that is where these numbers come from.
        </p>

        <GlanceStrip
          items={[
            ["Skills learned", p.overallPct != null ? `${p.overallPct}%` : "—", `${p.totalMastered} of ${p.totalItems} items`],
            ["Knew it first time", firstTryPctOf(p) != null ? `${firstTryPctOf(p)}%` : "—", "of what they met"],
            ["Unit tests", s.bossAveragePct != null ? `${s.bossAveragePct}%` : "—",
              s.bossAveragePct != null ? `${bossesTaken} taken` : bossesTaken > 0 ? `${bossesTaken} taken, not scored` : "none taken yet"],
            ["Cases finished", `${done}${credited ? ` + ${credited}` : ""}`, `of ${TOTAL_CASES} in the year`],
          ]}
        />
        <p className="font-serif text-[9.5px] leading-snug mt-1.5 mb-4">
          <b>Skills learned</b> is the share of individual Spanish items — words, phrases, sentences — your child has
          answered correctly at least once. <b>Knew it first time</b> is how much they got right on first contact,
          before any practice; it is the better measure of secure knowledge, and it is always the lower of the two.
          Neither is the report-card grade, which also counts homework and participation.
          {p.totalItems > 0 && p.totalItems < 20 && (
            <> <b>These percentages rest on only {p.totalItems} items so far</b>, so treat them as a first
            impression rather than a measurement — they will settle as {first} works through more cases.</>
          )}
        </p>

        <h2 className="font-serif text-[14px] font-bold uppercase tracking-[0.15em] border-b-2 border-black pb-1 mb-2">
          What changed recently
        </h2>
        {g ? (
          <>
            <GrowthPair
              learned14={g.learned14d}
              learned30={g.learned30d}
              days14={g.activeDays14d}
              days30={g.activeDays30d}
            />
            <p className="font-serif text-[10px] leading-snug mt-1.5 mb-4">
              A &ldquo;new thing learned&rdquo; is one word, phrase or sentence your child answered correctly for the
              first time in that window. It is a count rather than a percentage on purpose: a percentage goes down
              when the material gets harder, which happens all year, so it would understate real progress.{" "}
              {g.learned14d === 0 && g.learned30d === 0
                ? `${first} has not worked on Spanish outside class in the last month. The five-minute activity on the last page is the easiest place to start.`
                : g.learned14d === 0
                ? `${first} was active earlier in the month but has not added anything new in the last two weeks.`
                : g.learned14d === g.learned30d
                ? `Both boxes show the same number because all of ${first}'s work this month happened in the last two weeks — they started recently, or came back to it after a gap.`
                : `At this rate ${first} is adding roughly ${Math.round(g.learned14d / 2)} new things a week.`}
            </p>
          </>
        ) : (
          <div className="mb-4">
            <NotEnoughYet what={`${first} has not recorded any work yet, so there is nothing to compare against. This section fills in after their first case.`} />
          </div>
        )}

        {p.strengths.length > 0 && (
          <>
            <h2 className="font-serif text-[14px] font-bold uppercase tracking-[0.15em] border-b-2 border-black pb-1 mb-2">
              What {first} does well
            </h2>
            <div className="space-y-1.5 mb-3">
              {p.strengths.map((b) => (
                <div key={b.label}>
                  <p className="font-serif text-[11px] font-bold leading-tight">{b.label}</p>
                  <p className="font-serif text-[10.5px] leading-snug">
                    {masteryWords(b)}{" "}
                    <span className="text-[9.5px]">
                      ({b.mastered} of {b.items} items
                      {b.firstTryPct != null && <>, right first time {b.firstTryPct}% of the time</>})
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {gaps.length === 0 && (
          <p className="font-serif text-[11px] leading-relaxed">
            Nothing in the record stands out as a weak area right now — {first} is keeping up across every topic they
            have reached. The best thing you can do is keep the habit going: a few minutes of Spanish out loud, a few
            times a week.
          </p>
        )}
      </section>

      {/* ═══ PAGE 2 — the data, explained ════════════════════════════════ */}
      <section className="ws-page">
        <h2 className="font-serif text-lg font-bold border-b-2 border-black pb-1 mb-1">
          A closer look at {first}&rsquo;s Spanish
        </h2>
        <p className="font-serif text-[10px] leading-snug mb-3">
          Four pictures, each with what it shows and what, if anything, to do about it. None of these is a rank —
          where the class appears at all, it is to give you a sense of scale, never a position in a line.
        </p>

        <ParentFigure
          title={`Where ${first} is in the year`}
          howToRead={`Each square is one of the 32 cases. Filled means finished${credited ? "; a striped square is a case they were credited for after joining the class late" : ""}.`}
          meaning={
            doing
              ? `${first} has finished ${done} and is working on Caso ${doing.caso}. The class moves through these together, so being mid-case is normal.`
              : done === 0
              ? `${first} has not finished a case yet. Starting one is the single most useful thing they could do this week.`
              : `${first} has finished ${done} of ${TOTAL_CASES} and is between cases.`
          }
          wide
        >
          <StoryStrip squares={squares} />
        </ParentFigure>

        <ParentFigure
          title={`What ${first} already knew, and what they learned`}
          howToRead="Each line is one topic. The hollow dot is how much they got right on the very first try; the solid dot is how much they got right eventually. The line between them is how much practice it took."
          wide
          meaning={
            knewLearned.length === 0
              ? "Not enough topics yet to compare."
              : p.totalItems < 20 || knewLearned.length < 2
              ? `There is too little recorded so far to read a pattern into this — ${first} has met ${p.totalItems} items across ${knewLearned.length} ${knewLearned.length === 1 ? "topic" : "topics"}. It will say more after another case or two.`
              : widestGap && widestGap.learned - widestGap.knew >= 20
              ? `The long line on “${widestGap.label}” means ${first} can do it but it is not automatic yet. That is normal for new material, and repetition — not re-teaching — is what closes it.`
              : `The short lines mean ${first} is mostly getting things right first time rather than grinding them out. That is secure knowledge.`
          }
        >
          {knewLearned.length ? (
            <KnewLearned rows={knewLearned} />
          ) : (
            <NotEnoughYet what={`${first} has not met enough topics yet for this comparison.`} />
          )}
        </ParentFigure>

        <ParentFigure
          title={`What kind of mistake ${first} makes`}
          howToRead="When an answer is wrong, the program can often tell why. This splits those mistakes by type."
          meaning={
            !enoughErrors
              ? "There are not enough recorded mistakes yet to see a pattern. That is usually a good sign."
              : myErrors[0].kind === "word_order"
              ? `Most of ${first}'s mistakes are not vocabulary — they know the words, and are putting them in English order. Spanish word order is the thing to practise, and the activity on the next page does exactly that.`
              : myErrors[0].kind === "vocab"
              ? `Most of ${first}'s mistakes are the words themselves rather than how sentences are built. Five minutes of word practice, often, is the fastest fix there is.`
              : `Most of ${first}'s mistakes are ${(MISTAKE_WORDS[myErrors[0].kind] ?? myErrors[0].kind).toLowerCase()}.`
          }
        >
          {enoughErrors ? (
            <MistakeMix
              slices={myErrors.map((e, i) => ({
                label: MISTAKE_WORDS[e.kind] ?? e.kind,
                value: e.events,
                fill: [INK.r900, "url(#hatch45)", INK.r300][i % 3],
              }))}
            />
          ) : (
            <NotEnoughYet what={`Only ${errorTotal} ${errorTotal === 1 ? "mistake has" : "mistakes have"} been classified so far — too few to show a pattern.`} />
          )}
        </ParentFigure>

        <ParentFigure
          title={`How quickly ${first} answers`}
          howToRead="The dot is your child's usual answering time. The small tick is where most of the class sits. Neither end of this scale is good or bad on its own — it only means something next to accuracy."
          meaning={paceWords || "Not enough timed answers yet to say."}
        >
          {mySeconds != null && classPace != null ? (
            <PaceMarker seconds={mySeconds} classSeconds={classPace} max={paceMax} name={first} />
          ) : (
            <NotEnoughYet what={`${first} has not answered enough questions for a reliable timing yet.`} />
          )}
        </ParentFigure>
      </section>

      {/* ═══ PAGE 3 — gaps and what to do ════════════════════════════════ */}
      {gaps.length > 0 && (
        <section className="ws-page">
          <h2 className="font-serif text-lg font-bold border-b-2 border-black pb-1 mb-2">
            Where {first} needs more practice — and what to do
          </h2>
          <p className="font-serif text-[10.5px] leading-relaxed mb-3">
            A topic is here either because some of it is not learned yet, or because first attempts are usually wrong
            even when your child gets there in the end. Being on this list is normal: Spanish 1 moves quickly and every
            student has topics still settling. What matters is that each one is specific enough to do something about.
            <b> You do not need to speak Spanish</b> for any of the activities — each says what to say, what your child
            should answer, and what counts as right. Twice a week beats one long session.
          </p>

          <div className="space-y-3">
            {gaps.map((b, i) => {
              const act = practiceFor(b, kindOf(b, p));
              return (
                <div key={b.label} className="border border-black px-3.5 py-2.5 break-inside-avoid">
                  <p className="font-serif text-[11.5px] font-bold leading-tight">{i + 1}. {b.label}</p>
                  <p className="font-serif text-[10px] leading-snug">
                    {masteryWords(b)} <span className="text-[9.5px]">
                      (learned {b.mastered} of {b.items}
                      {b.firstTryPct != null && <>, right first time {b.firstTryPct}% of the time</>})
                    </span>
                  </p>
                  <div className="border-t border-black mt-1.5 pt-1.5">
                    <p className="font-serif text-[8.5px] uppercase tracking-[0.2em]">
                      Try this · about {act.minutes} minutes
                    </p>
                    <p className="font-serif text-[11.5px] font-bold mb-1">{act.title}</p>
                    <ol className="font-serif text-[10.5px] leading-snug list-decimal pl-5 space-y-0.5">
                      {act.steps.map((step, j) => <li key={j}>{step}</li>)}
                    </ol>
                    {act.items.length > 0 && (
                      <p className="font-serif text-[10px] mt-1.5">
                        <b>Use these — the ones {first} has been missing: </b>
                        {act.items.join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t-2 border-black mt-4 pt-2.5">
            <h3 className="font-serif text-[11.5px] font-bold uppercase tracking-[0.15em] mb-1">Questions?</h3>
            <p className="font-serif text-[10.5px] leading-relaxed">
              {first} can replay any case in the program to raise these numbers — replaying is encouraged, and the
              record always reflects their current best rather than their first attempt. If you would like to talk
              through this report, please contact {data.teacherName ?? "your child's Spanish teacher"}.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
