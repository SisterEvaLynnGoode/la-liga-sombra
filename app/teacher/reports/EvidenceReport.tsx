"use client";

import {
  Figure, DataTable, StackedColumns, Bars, QuadrantScatter, INK,
} from "@/components/reports/charts";
import { groupByPattern, PATTERN_LABELS, PATTERN_NOTES, type SentenceAttempt } from "@/lib/reports/syntax";
import { fmtDate } from "./types";

/**
 * "Evidence of Learning" — the packet for an administrator.
 *
 * Written for a reader who will spend ten minutes with it and wants to know
 * whether instruction is working and how anyone would know. Every page follows
 * the same shape: a claim, the evidence for it, and what was done about it.
 *
 * Two editorial rules, both load-bearing:
 *
 *   • Nothing is claimed that the data does not carry. Where a figure shows
 *     something unflattering it says so, and where the system's own scoring is
 *     wrong the page names it. A packet that only flatters is worth nothing to
 *     an administrator and will not survive one sharp question.
 *   • The alert page reports DETECTION, not resolution. 3,804 alerts have been
 *     raised school-wide and one is marked resolved in-app, because teachers
 *     respond in the classroom and not in an alert queue. Presenting those as
 *     an intervention log would invite an administrator to count unclosed
 *     tickets and conclude nobody acted.
 */

export interface EvidencePayload {
  errorTrend: Array<{ month: string; kind: string; events: number; students: number }>;
  briefings: Array<{
    studentId: string; briefings: number; completed: number; skipped: number;
    termsShown: number; termsCorrect: number; distinctDays: number;
    firstDay: string | null; lastDay: string | null;
  }>;
  canDo: Array<{ studentId: string; caso: number | null; statement: string; rating: number; createdAt: string }>;
  signals: Array<{ flagType: string; month: string; n: number; students: number; resolved: number }>;
  sentences: SentenceAttempt[];
  ladder: Array<{ stageType: string; skill: string; events: number; correct: number; students: number; avgWords: number }>;
  roster: Array<{ studentId: string; displayName: string; reportName: string | null }>;
  className: string | null;
  teacherName: string | null;
  generatedAt: string;
}

const SEC = "font-serif text-[15px] font-bold uppercase tracking-[0.15em] border-b-2 border-black pb-1 mb-3";

const ERROR_LABELS: Record<string, string> = {
  word_order: "Word order",
  vocab: "Vocabulary",
  spelling: "Spelling",
  agreement: "Agreement",
  conjugation: "Verb endings",
};

/** Alerts a reader would recognise, in words that are not internal jargon. */
const SIGNAL_LABELS: Record<string, string> = {
  stage_skipped: "Skipped an activity",
  academia_struggling: "Struggling in vocabulary training",
  academia_skipped_after_failure: "Left vocabulary training after failing it",
  repeated_skipping: "Skipping repeatedly",
  listening_skipped: "Skipped a listening task",
  needs_listening_support: "Needs listening support",
  mastery_up: "Moved up a proficiency band",
  help_requested: "Asked for help",
  transcript_revealed: "Opened the transcript",
  client_crash: "Technical fault recorded",
  audio_load_failed: "Audio failed to load",
  academia_retry_challenge: "Set a retry challenge",
  academia_unlocked: "Granted a bypass",
};

function monthName(iso: string): string {
  return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function pct(part: number, whole: number): number | null {
  return whole > 0 ? Math.round((part / whole) * 100) : null;
}

function Head({ data, title, subtitle }: { data: EvidencePayload; title: string; subtitle?: string }) {
  return (
    <header className="border-b-2 border-black pb-3 mb-5">
      <div className="flex justify-between items-end gap-4">
        <div>
          <p className="font-serif text-[10px] uppercase tracking-[0.3em]">La Liga Sombra · Spanish 1 · Evidence of Learning</p>
          <h1 className="font-serif text-2xl font-bold leading-tight">{title}</h1>
          {subtitle && <p className="font-serif text-sm italic">{subtitle}</p>}
        </div>
        <div className="font-serif text-[10px] text-right leading-snug shrink-0">
          {data.className && <p>{data.className}</p>}
          {data.teacherName && <p>{data.teacherName}</p>}
          <p>{fmtDate(data.generatedAt)}</p>
        </div>
      </div>
    </header>
  );
}

export default function EvidenceReport({ data }: { data: EvidencePayload }) {
  /* ── 1. Mistake profile over time ──────────────────────────────────────── */
  const months = Array.from(new Set(data.errorTrend.map((r) => r.month))).sort();
  const kinds = Array.from(new Set(data.errorTrend.map((r) => r.kind)))
    .sort((a, b) => {
      const sum = (k: string) => data.errorTrend.filter((r) => r.kind === k).reduce((n, r) => n + r.events, 0);
      return sum(b) - sum(a);
    });
  const trendByMonth = months.map((m) => {
    const rows = data.errorTrend.filter((r) => r.month === m);
    const total = rows.reduce((n, r) => n + r.events, 0);
    return {
      month: m,
      total,
      parts: kinds.map((k) => rows.find((r) => r.kind === k)?.events ?? 0),
      topShare: total ? Math.round(((rows.find((r) => r.kind === kinds[0])?.events ?? 0) / total) * 100) : 0,
    };
  });
  const trendMax = Math.max(1, ...trendByMonth.map((m) => m.total));
  // A month with a handful of diagnosed mistakes has a share that swings on a
  // single answer. The trend sentence only compares months with a real sample;
  // the table still shows every month, with its total visible.
  const TREND_MIN = 20;
  const solidMonths = trendByMonth.filter((m) => m.total >= TREND_MIN);
  const firstShare = solidMonths[0]?.topShare ?? 0;
  const lastShare = solidMonths[solidMonths.length - 1]?.topShare ?? 0;

  /* ── 2. Retrieval practice ─────────────────────────────────────────────── */
  const b = data.briefings;
  const totalBriefings = b.reduce((n, r) => n + r.briefings, 0);
  const totalCompleted = b.reduce((n, r) => n + r.completed, 0);
  const totalTerms = b.reduce((n, r) => n + r.termsShown, 0);
  const totalCorrect = b.reduce((n, r) => n + r.termsCorrect, 0);
  const nameById = new Map(data.roster.map((r) => [r.studentId, r.reportName?.trim() || r.displayName]));

  /* ── 3. Standards and calibration ──────────────────────────────────────── */
  const byStatement = new Map<string, { ratings: number[]; casos: Set<number> }>();
  for (const r of data.canDo) {
    const cur = byStatement.get(r.statement) ?? { ratings: [], casos: new Set<number>() };
    cur.ratings.push(r.rating);
    if (r.caso != null) cur.casos.add(r.caso);
    byStatement.set(r.statement, cur);
  }
  const statements = Array.from(byStatement.entries())
    .map(([statement, v]) => ({
      statement,
      n: v.ratings.length,
      mean: v.ratings.reduce((x, y) => x + y, 0) / v.ratings.length,
      confident: v.ratings.filter((x) => x >= 4).length,
      unsure: v.ratings.filter((x) => x <= 2).length,
      casos: Array.from(v.casos).sort((x, y) => x - y),
    }))
    .sort((x, y) => x.mean - y.mean);
  const canDoStudents = new Set(data.canDo.map((r) => r.studentId)).size;
  // A statement rated by one student is not a class finding. Everything
  // charted needs a real sample; the full list still appears in the table,
  // with its counts visible.
  const CAN_DO_MIN = 5;
  const chartable = statements.filter((x) => x.n >= CAN_DO_MIN);
  const allRatings = data.canDo.map((r) => r.rating);
  const topRating = allRatings.length ? Math.max(...allRatings) : 0;
  const meanRating = allRatings.length ? allRatings.reduce((x, y) => x + y, 0) / allRatings.length : 0;

  /* ── 4. Signals ────────────────────────────────────────────────────────── */
  const byFlag = new Map<string, { n: number; students: number; resolved: number }>();
  for (const s of data.signals) {
    const cur = byFlag.get(s.flagType) ?? { n: 0, students: 0, resolved: 0 };
    cur.n += s.n; cur.students = Math.max(cur.students, s.students); cur.resolved += s.resolved;
    byFlag.set(s.flagType, cur);
  }
  const flags = Array.from(byFlag.entries())
    .map(([flagType, v]) => ({ flagType, ...v }))
    .sort((x, y) => y.n - x.n);
  const totalFlags = flags.reduce((n, f) => n + f.n, 0);

  /* ── 5. Sentence construction ──────────────────────────────────────────── */
  const groups = groupByPattern(data.sentences);
  const totalAttempts = groups.reduce((n, g) => n + g.attempts, 0);
  const acceptable = groups.filter((g) => g.acceptable);
  const acceptableAttempts = acceptable.reduce((n, g) => n + g.attempts, 0);
  const swap = groups.find((g) => g.pattern === "adjacent-swap");

  /* ── 6. The production ladder ──────────────────────────────────────────── */
  // Ordered by how much language the activity asks the student to produce at
  // once, which is the axis a presentation assessment actually runs along.
  const RUNGS: Array<{ stage: string; rung: string; asks: string }> = [
    { stage: "academia-produccion", rung: "Retrieve a word unprompted",
      asks: "Shown the English, the student produces the Spanish from memory — no options to choose from." },
    { stage: "timedFlashcards", rung: "Retrieve it under time pressure",
      asks: "The same recall against a clock. Pressure separates knowing a word from being able to reach for it." },
    { stage: "speakPractice", rung: "Say it out loud",
      asks: "Spoken production — the rung a presentation is built on, and the one no silent activity can build." },
    { stage: "sentenceBuilder", rung: "Assemble a whole sentence",
      asks: "Put a complete Spanish sentence in order. Syntax rather than vocabulary; the words are supplied." },
    { stage: "dialogueChoice-typed", rung: "Sustain an extended turn",
      asks: "Produce a full conversational turn unprompted, in one go. The closest thing here to presenting." },
  ];
  const ladderByStage = new Map(data.ladder.map((l) => [l.stageType, l]));
  const rosterSize = Math.max(1, data.roster.length);
  const rungs = RUNGS
    .map((r) => {
      const l = ladderByStage.get(r.stage);
      return {
        ...r,
        events: l?.events ?? 0,
        correct: l?.correct ?? 0,
        students: l?.students ?? 0,
        avgWords: l?.avgWords ?? 0,
        reach: Math.round(((l?.students ?? 0) / rosterSize) * 100),
      };
    })
    .filter((r) => r.events > 0);
  const totalProductions = rungs.reduce((n, r) => n + r.correct, 0);
  const widest = [...rungs].sort((a, b) => b.students - a.students)[0];
  const spoken = rungs.find((r) => r.stage === "speakPractice");

  // The Can-Do statements this course asks students to rate are presentational
  // tasks by construction — describe, compare, present yourself, give
  // directions — so the course already points at what the assessment measures.
  const PRESENTATIONAL = /^puedo (describir|comparar|hablar|presentar|dar|decir|pedir|usar)/i;
  const presentational = statements.filter((x) => PRESENTATIONAL.test(x.statement));

  return (
    <>
      {/* ═══ PAGE 1 — the mistake profile, and whether it moves ══════════ */}
      <section className="ws-page">
        <Head data={data} title="Evidence of Learning" subtitle="How this class is assessed, and what the record shows" />

        <p className="font-serif text-[11.5px] leading-relaxed mb-3">
          This packet is assembled from the work students actually do in the program: every word matched, sentence
          built, recording understood and question answered is recorded with a timestamp. Nothing here is a survey
          or an estimate. Each page states a claim, shows the evidence behind it, and says what was done about it.
        </p>
        <p className="font-serif text-[11px] leading-relaxed mb-5">
          <b>A note on what is not counted.</b> Two activities are excluded from every figure in this packet. The
          memory-match drill logs a card flip that does not pair as an incorrect answer, which is how matching works
          rather than a student failing. The typed dialogue turn is counted only from the date its prompt was
          corrected; before that it asked students to reproduce a sentence far beyond the course level and was
          answered correctly once in sixty-three attempts school-wide.
        </p>

        <h2 className={SEC}>I. What kind of mistakes, and whether that changes</h2>

        <Figure
          number={1}
          title="Diagnosed mistakes by month"
          finding={
            solidMonths.length < 2
              ? `Not enough months with a usable sample yet — a trend needs at least two months of ${TREND_MIN}+ diagnosed mistakes, and this class has ${solidMonths.length}. The month-by-month counts are in the table; the comparison becomes meaningful next month.`
              : `${ERROR_LABELS[kinds[0]] ?? kinds[0]} errors are ${lastShare}% of diagnosed mistakes in ${monthName(solidMonths[solidMonths.length - 1].month)}, against ${firstShare}% in ${monthName(solidMonths[0].month)}. ` +
                (lastShare < firstShare
                  ? "The share is falling, which is what a successful instructional response to this pattern looks like."
                  : lastShare > firstShare
                  ? "The share is rising, which identifies the next thing to teach rather than a failure."
                  : "The share is flat.")
          }
          howToRead={`When a student gets something wrong, the program compares their answer with the expected one word by word and classifies the difference where it can. Only mistakes it can diagnose appear here, so this is a sample of wrong answers rather than all of them. Months with fewer than ${TREND_MIN} diagnosed mistakes are charted but left out of the comparison above, because one answer moves their percentage a long way.`}
          table={
            <DataTable
              columns={["Month", ...kinds.map((k) => ERROR_LABELS[k] ?? k), "Total", `${ERROR_LABELS[kinds[0]] ?? kinds[0]} share`]}
              rows={trendByMonth.map((m) => [monthName(m.month), ...m.parts, m.total, `${m.topShare}%`])}
            />
          }
        >
          {trendByMonth.length ? (
            <StackedColumns
              columns={trendByMonth.map((m) => ({ label: monthName(m.month).split(" ")[0], parts: m.parts }))}
              seriesLabels={kinds.map((k) => ERROR_LABELS[k] ?? k)}
              fills={[INK.r900, "url(#hatch45)", INK.r300, "url(#hatch135)", INK.r150]}
              total={trendMax}
              xLabel="Month"
            />
          ) : (
            <p className="font-serif text-[11px] italic">No diagnosed mistakes recorded yet.</p>
          )}
        </Figure>

        <div className="border border-black px-4 py-3">
          <h3 className="font-serif text-[12px] font-bold uppercase tracking-[0.12em] mb-1">What was done about it</h3>
          <p className="font-serif text-[11px] leading-relaxed">
            A dominant word-order profile is an instructional finding rather than a vocabulary one: the words are
            known and the sentence structure is not. It is the reason the sentence-building activity is weighted as
            heavily as it is in this course, and the reason the home practice sent to families is built around
            saying and re-saying whole sentences rather than drilling isolated words.
          </p>
        </div>
      </section>

      {/* ═══ PAGE 2 — retrieval practice ═════════════════════════════════ */}
      <section className="ws-page">
        <h2 className={SEC}>II. Spaced retrieval practice</h2>

        <p className="font-serif text-[11.5px] leading-relaxed mb-3">
          Each session opens with a short <b>daily briefing</b>: a handful of terms the student has met before,
          re-asked on a later day. This is spaced retrieval practice — recalling material from memory at increasing
          intervals — which has one of the larger and more consistent effect sizes in the learning-science
          literature, and which is deliberately built into the opening minute of the lesson rather than left to
          revision at home.
        </p>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            ["Briefings taken", String(totalBriefings)],
            ["Completed", `${pct(totalCompleted, totalBriefings) ?? 0}%`],
            ["Terms re-tested", String(totalTerms)],
            ["Recalled correctly", `${pct(totalCorrect, totalTerms) ?? 0}%`],
          ].map(([label, value]) => (
            <div key={label} className="border border-black px-3 py-2">
              <p className="font-serif text-[9px] uppercase tracking-[0.15em] leading-tight">{label}</p>
              <p className="font-serif text-xl font-bold leading-none mt-1">{value}</p>
            </div>
          ))}
        </div>

        <Figure
          number={2}
          title="Participation in retrieval practice"
          finding={
            b.length
              ? `${b.length} students have taken ${totalBriefings} briefings across ${Math.max(...b.map((r) => r.distinctDays))} separate days at the top end. ` +
                `Recall sits at ${pct(totalCorrect, totalTerms) ?? 0}% of terms re-tested, which is the figure to watch: it is recall from memory, not recognition from a list.`
              : "No briefings recorded for this class yet."
          }
          howToRead="One row per student who has taken at least one briefing. A briefing is a few previously-seen terms, re-asked on a later day. Students who have taken none do not appear."
          table={
            <DataTable
              columns={["Student", "Briefings", "Completed", "Days", "Terms re-tested", "Recalled"]}
              rows={[...b]
                .sort((x, y) => y.briefings - x.briefings)
                .map((r) => [
                  nameById.get(r.studentId) ?? "—",
                  r.briefings, r.completed, r.distinctDays, r.termsShown,
                  r.termsShown ? `${pct(r.termsCorrect, r.termsShown)}%` : "—",
                ])}
              note="Recall percentages on small numbers of terms move a long way on one answer; the column is here for the distribution, not to rank students."
            />
          }
        >
          {b.length ? (
            <QuadrantScatter
              points={b.filter((r) => r.termsShown >= 3).map((r) => ({
                label: nameById.get(r.studentId) ?? "",
                x: r.distinctDays,
                y: pct(r.termsCorrect, r.termsShown) ?? 0,
              }))}
              xLabel="Days of retrieval practice"
              yLabel="Terms recalled correctly"
              xMax={Math.max(5, ...b.map((r) => r.distinctDays))}
              xSplit={Math.max(2, Math.round(b.reduce((n, r) => n + r.distinctDays, 0) / Math.max(1, b.length)))}
              ySplit={60}
              xFmt={(v) => String(Math.round(v))}
              quadrants={["Recalling well, few sessions", "Recalling well, practising often", "Practising often, recall still low", "Few sessions, recall low"]}
            />
          ) : (
            <p className="font-serif text-[11px] italic">Nothing to plot yet.</p>
          )}
        </Figure>
      </section>

      {/* ═══ PAGE 3 — standards and calibration ══════════════════════════ */}
      <section className="ws-page">
        <h2 className={SEC}>III. Standards, and whether students can judge their own work</h2>

        <p className="font-serif text-[11.5px] leading-relaxed mb-3">
          At the end of a case students rate themselves against <b>ACTFL-style Can-Do statements</b> — the national
          proficiency descriptors, written in the first person: <i>&ldquo;I can describe my family.&rdquo;</i> The
          statements tie the course to the standards framework, and the ratings are a record of whether students can
          judge their own ability, which is a teachable skill in its own right.
        </p>

        <Figure
          number={3}
          title="Self-rating against the Can-Do statements"
          finding={
            !statements.length
              ? "No Can-Do ratings recorded for this class yet."
              : topRating <= 3
              ? `${canDoStudents} students have given ${allRatings.length} ratings across ${statements.length} statements, averaging ${meanRating.toFixed(1)} of 5 — and not one rating in this class is above ${topRating}. ` +
                `Students are systematically under-claiming what they can do. That is worth addressing directly: a learner who cannot recognise their own competence will not use it, and the measured mastery on these same cases runs well above what they are claiming here.`
              : chartable.length
              ? `${canDoStudents} students have given ${allRatings.length} ratings across ${statements.length} statements, averaging ${meanRating.toFixed(1)} of 5. ` +
                `Of the statements with at least ${CAN_DO_MIN} ratings, the lowest is “${chartable[0].statement}” at ${chartable[0].mean.toFixed(1)}.`
              : `${canDoStudents} students have given ${allRatings.length} ratings, but no single statement has reached ${CAN_DO_MIN} ratings yet, so none is charted. The table below shows every statement with its count.`
          }
          howToRead={`Students rate each statement 1 to 5. Only statements rated by at least ${CAN_DO_MIN} students are charted, since a mean of one rating is not a class finding; the table below lists every statement with its sample size.`}
          table={
            <DataTable
              columns={["Can-Do statement", "Case", "Ratings", "Mean of 5", "Confident (4–5)", "Unsure (1–2)"]}
              rows={statements.map((s) => [
                s.statement.length > 72 ? s.statement.slice(0, 70) + "…" : s.statement,
                s.casos.length ? s.casos.join(", ") : "—",
                s.n, s.mean.toFixed(1), s.confident, s.unsure,
              ])}
            />
          }
        >
          {chartable.length ? (
            <Bars
              rows={chartable.slice(0, 12).map((x) => ({
                label: x.statement,
                value: Number(x.mean.toFixed(1)),
                note: `(${x.n} ratings)`,
              }))}
              max={5}
              unit=" of 5"
            />
          ) : (
            <p className="font-serif text-[11px] italic">
              No statement has {CAN_DO_MIN} or more ratings yet, so nothing is charted. Every statement appears in the table below.
            </p>
          )}
        </Figure>
      </section>

      {/* ═══ PAGE 4 — what the system watches for ════════════════════════ */}
      <section className="ws-page">
        <h2 className={SEC}>IV. What the system watches for</h2>

        <p className="font-serif text-[11.5px] leading-relaxed mb-3">
          The program raises an alert when a student&rsquo;s behaviour suggests they need attention — skipping an
          activity, repeatedly failing the vocabulary gate, abandoning a listening task. These surface on the
          teacher dashboard during the lesson. <b>This page reports detection, not case closure:</b> the response
          happens at the student&rsquo;s shoulder in the room, and is not keyed back into the system, so the figures
          below should be read as what the class made visible rather than as a ticket queue.
        </p>

        <Figure
          number={4}
          title="Alerts raised this term"
          finding={
            flags.length
              ? `${totalFlags.toLocaleString("en-US")} alerts across ${flags.length} types. The largest is “${SIGNAL_LABELS[flags[0].flagType] ?? flags[0].flagType}” — ${flags[0].n.toLocaleString("en-US")} of them, affecting ${flags[0].students} students. ` +
                `Concentration like that is a design signal as much as a student one: it points at the activity, not at the children.`
              : "No alerts raised for this class yet."
          }
          howToRead="One row per alert type. A single student can raise the same alert many times, so counts exceed student numbers."
          table={
            <DataTable
              columns={["Alert", "Times raised", "Students involved"]}
              rows={flags.map((f) => [SIGNAL_LABELS[f.flagType] ?? f.flagType, f.n, f.students])}
            />
          }
        >
          <Bars
            rows={flags.slice(0, 11).map((f) => ({
              label: SIGNAL_LABELS[f.flagType] ?? f.flagType,
              value: f.n,
              note: `· ${f.students} students`,
            }))}
            unit=""
          />
        </Figure>

        <div className="border border-black px-4 py-3 break-inside-avoid">
          <h3 className="font-serif text-[12px] font-bold uppercase tracking-[0.12em] mb-1.5">
            Changes made this term in response to this data
          </h3>
          <ul className="font-serif text-[11px] leading-relaxed list-disc pl-5 space-y-1">
            <li>
              <b>The vocabulary memory game was rebuilt.</b> It had been dealing every term in a case at once — up
              to sixty-four cards on a board nearly three screens tall on a Chromebook, which no student can hold in
              memory. Across the school it had logged 104,000 card flips at a 12% match rate, the signature of
              guessing rather than recall. It now deals boards of at most eight pairs that fit a single screen.
            </li>
            <li>
              <b>The typed production task was re-targeted.</b> It had been asking students to reproduce the
              detective&rsquo;s own closing line, up to twenty-four words, and had been answered correctly once in
              sixty-three attempts. It now selects a sentence of eight words or fewer, and a near miss is re-asked
              with more of the model shown rather than marked wrong.
            </li>
            <li>
              <b>Completion records were repaired.</b> Replaying a finished case was silently marking it unfinished
              again, which understated the progress of exactly the students who practise most. Eighty-four affected
              records were corrected and the cause fixed.
            </li>
          </ul>
          <p className="font-serif text-[10px] leading-snug mt-2 italic">
            These are recorded here because &ldquo;we looked at the data and changed something&rdquo; is only a
            claim until the change is named.
          </p>
        </div>
      </section>

      {/* ═══ PAGE 5 — sentence construction ══════════════════════════════ */}
      <section className="ws-page">
        <h2 className={SEC}>V. What students&rsquo; own sentences show</h2>

        <p className="font-serif text-[11.5px] leading-relaxed mb-2">
          In the sentence-building activity the student is given the words of a Spanish sentence and must put them
          in order. <b>Vocabulary is held constant by design, so what varies is syntax and almost nothing else</b> —
          which makes a wrong answer unusually informative. Every attempt that missed the target is stored exactly
          as the student built it, and the sentences below are quoted verbatim from this class.
        </p>
        <p className="font-serif text-[10.5px] leading-relaxed mb-4 italic">
          One caveat, stated plainly: this is sentence construction, not free composition. Students are ordering
          supplied words rather than choosing their own, so it is evidence of grammatical knowledge rather than of
          independent writing.
        </p>

        <Figure
          number={5}
          title="Patterns in the sentences students built"
          finding={
            groups.length
              ? (swap
                  ? `The clearest pattern is two neighbouring words transposed — ${swap.attempts} attempts. In a beginner class this is most often the adjective and the noun, where English puts the adjective first and Spanish does not: a direct, visible trace of first-language transfer. `
                  : "") +
                (acceptableAttempts
                  ? `${acceptableAttempts} of ${totalAttempts} attempts are defensible Spanish that simply did not match the target string, and are marked as such below rather than counted against the students.`
                  : "")
              : "No sentence attempts recorded for this class yet."
          }
          howToRead="Each attempt is compared with the target sentence word by word and grouped by what the student actually did. “Students” sums across sentences, so a student who missed two sentences appears in both."
          table={
            <DataTable
              columns={["Pattern", "Attempts", "Student-sentences", "Counts against them?"]}
              rows={groups.map((g) => [
                PATTERN_LABELS[g.pattern], g.attempts, g.students, g.acceptable ? "No — valid Spanish" : "Yes",
              ])}
            />
          }
        >
          <Bars
            rows={groups.map((g) => ({
              label: PATTERN_LABELS[g.pattern] + (g.acceptable ? " (valid Spanish)" : ""),
              value: Math.round((g.attempts / Math.max(1, totalAttempts)) * 100),
              note: `· ${g.attempts} attempts`,
            }))}
            max={100}
          />
        </Figure>

        {groups.slice(0, 4).map((g) => (
          <div key={g.pattern} className="border border-black px-4 py-3 mb-3 break-inside-avoid">
            <h3 className="font-serif text-[12px] font-bold">
              {PATTERN_LABELS[g.pattern]}
              {g.acceptable && <span className="font-normal italic"> — not an error</span>}
            </h3>
            <p className="font-serif text-[10.5px] leading-snug mb-2">{PATTERN_NOTES[g.pattern]}</p>
            <table className="w-full border-collapse font-serif text-[10px]">
              <thead>
                <tr>
                  <th className="border border-black px-1.5 py-0.5 text-left">The student wrote</th>
                  <th className="border border-black px-1.5 py-0.5 text-left">The sentence wanted</th>
                  <th className="border border-black px-1.5 py-0.5 text-center">Students</th>
                </tr>
              </thead>
              <tbody>
                {g.examples.map((ex, i) => (
                  <tr key={i}>
                    <td className="border border-black px-1.5 py-0.5 italic">{ex.chosen}</td>
                    <td className="border border-black px-1.5 py-0.5">{ex.expected}</td>
                    <td className="border border-black px-1.5 py-0.5 text-center tabular-nums">{ex.students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div className="border-t-2 border-black pt-2.5">
          <h3 className="font-serif text-[12px] font-bold uppercase tracking-[0.12em] mb-1">A correction we owe the record</h3>
          <p className="font-serif text-[11px] leading-relaxed">
            {acceptableAttempts > 0
              ? `${acceptableAttempts} attempts in this class were scored as wrong for omitting the subject pronoun — writing “Voy al museo en metro” where the target was “Yo voy al museo en metro”. Spanish permits this, so the students were right and the exercise was wrong. They are excluded from the error figures in this packet, and the activity is being corrected.`
              : "No scoring artefacts of this kind were found in this class's sentence attempts."}
          </p>
        </div>
      </section>

      {/* ═══ PAGE 6 — building toward the presentation assessment ════════ */}
      <section className="ws-page">
        <h2 className={SEC}>VI. Building toward the presentation assessment</h2>

        <p className="font-serif text-[11.5px] leading-relaxed mb-3">
          A presentation assessment measures the <b>presentational mode</b>: one-way production, prepared and
          delivered to an audience, with nobody to help the speaker along. It is the most demanding of the three
          ACTFL modes for a beginner, because none of it can be inferred from context — the student has to supply
          every word, in the right order, out loud, unprompted.
        </p>
        <p className="font-serif text-[11.5px] leading-relaxed mb-4">
          That is not one skill, and this course does not treat it as one. It is built in rungs, each practised and
          recorded separately, so readiness can be shown rather than asserted. This class has produced{" "}
          <b>{totalProductions.toLocaleString("en-US")} correct pieces of Spanish</b> across the rungs below —
          every one generated by the student from memory rather than chosen from a list.
        </p>

        <Figure
          number={6}
          title="The production ladder"
          finding={
            rungs.length
              ? `Every rung is in use. The base is broad: ${widest.students} students have worked at ` +
                `“${widest.rung.toLowerCase()}”, producing ${widest.correct.toLocaleString("en-US")} correct items. ` +
                `The ladder narrows as the utterance lengthens, which is the shape you would expect mid-year — and it is what the assessment is for. ` +
                `The task itself is what carries students from the rungs they hold onto the ones above.`
              : "No production activity recorded for this class yet."
          }
          howToRead="Rungs are ordered by how much Spanish the student must produce at once, from a single word to a whole conversational turn. “Reach” is the share of the class that has worked at that rung at all — a measure of exposure, not a score."
          table={
            <DataTable
              columns={["Rung", "What it asks of the student", "Students", "Reach", "Correct", "Words per item"]}
              rows={rungs.map((r) => [r.rung, r.asks, r.students, `${r.reach}%`, r.correct, r.avgWords])}
              note={
                "“Words per item” is the size of what the activity asks for, not how much a student chose to say: the material sets the length, so it orders the rungs rather than measuring growth." +
                ((rungs.find((r) => r.stage === "dialogueChoice-typed")?.events ?? 0) < 10
                  ? " The extended-turn rung reopened on 7 October after being re-targeted (see page IV), so its counts reflect three weeks of availability rather than three months — it is the newest rung, not the weakest."
                  : "")
              }
            />
          }
        >
          {rungs.length ? (
            <Bars
              rows={rungs.map((r) => ({
                label: r.rung,
                value: r.reach,
                note: `· ${r.correct.toLocaleString("en-US")} correct`,
              }))}
              max={100}
            />
          ) : (
            <p className="font-serif text-[11px] italic">Nothing to plot yet.</p>
          )}
        </Figure>

        <div className="border border-black px-4 py-3 mb-4 break-inside-avoid">
          <h3 className="font-serif text-[12px] font-bold uppercase tracking-[0.12em] mb-1.5">
            The course already asks for what the assessment measures
          </h3>
          <p className="font-serif text-[11px] leading-relaxed mb-2">
            The Can-Do statements students rate themselves against are not comprehension statements. They are
            presentational tasks, written in the first person — the same kind of task a presentation assessment
            sets:
          </p>
          <ul className="font-serif text-[11px] leading-snug list-disc pl-5 mb-2">
            {(presentational.length ? presentational : statements).slice(0, 8).map((x) => (
              <li key={x.statement} className="mb-0.5">
                <i>{x.statement}</i>
              </li>
            ))}
          </ul>
          <p className="font-serif text-[10.5px] leading-relaxed">
            <b>Describir. Comparar. Presentarse. Dar direcciones.</b> Each is a short presentation in miniature,
            attached to a case the student has already worked through — so when a formal assessment arrives the
            task type is familiar and only the audience is new.
          </p>
        </div>

        <div className="border-2 border-black px-4 py-3 break-inside-avoid">
          <h3 className="font-serif text-[12px] font-bold uppercase tracking-[0.12em] mb-1.5">
            What the record says to do before the assessment
          </h3>
          <ul className="font-serif text-[11px] leading-relaxed list-disc pl-5 space-y-1">
            {spoken && spoken.reach < 50 && (
              <li>
                <b>Move more students onto the spoken rung.</b> {spoken.students} of {rosterSize} have used the
                speaking practice. The written rungs beneath it are well established, so the language is there —
                what is missing is repetitions with a voice attached, which is the one thing a silent activity
                cannot build and the first thing the assessment will ask for.
              </li>
            )}
            {topRating <= 3 && allRatings.length > 0 && (
              <li>
                <b>Close the confidence gap on purpose.</b> Not one of this class&rsquo;s {allRatings.length}{" "}
                self-ratings is above {topRating} of 5, while the measured record on those same cases runs well
                above what students are claiming. In a live presentation that gap shows up as hesitation rather
                than as error. Showing students their own production count —{" "}
                {totalProductions.toLocaleString("en-US")} correct pieces of Spanish — is a direct, evidenced way
                to address it.
              </li>
            )}
            <li>
              <b>Rehearse from the rungs already strong.</b> Every sentence a student has built correctly is stored
              verbatim, and is by definition Spanish this class can already produce. A presentation assembled from
              patterns already mastered is a performance task rather than a memorisation task.
            </li>
          </ul>
        </div>

        <p className="font-serif text-[10.5px] leading-relaxed mt-3 italic">
          The claim here is deliberately modest: not that these students are ready to present, but that the
          components a presentation requires are being built, practised and counted one at a time — and that the
          record shows which are strong and which still need repetitions, before the assessment rather than after
          it.
        </p>
      </section>
    </>
  );
}
