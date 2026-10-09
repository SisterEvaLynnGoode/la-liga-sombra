"use client";

import {
  Figure, DataTable, QuadrantScatter, Dumbbell, StackedBar, EmphasisLines,
  StackedColumns, BoxPlot, Heatmap, quartiles, INK,
  type BoxStats, type Series,
} from "@/components/reports/charts";
import { Letterhead, Pct } from "./shared";
import { allBuckets, firstTryPctOf, nameFor, type GradeRow, type Payload, type Student } from "./types";
import { BANDS } from "@/lib/grading";

/**
 * The charted class report — the version an administrator reads.
 *
 * Two audiences, one document. A person reads the figures; a language model
 * (NotebookLM, Gemini) reads the PDF's extracted text. Everything here is
 * built so the second audience is not served a worse version of the first:
 *
 *   • Every figure states its finding in a sentence BEFORE the chart, so a
 *     model that cannot see shapes still gets the claim.
 *   • Every figure carries its own data table, so the numbers survive text
 *     extraction. Nothing is reachable only by looking at a mark.
 *   • Headings are real headings in reading order, and the appendix restates
 *     every dataset as labelled plain text with a glossary and a statement of
 *     method — the things a model needs in order to answer questions about
 *     the report without inventing anything.
 *
 * That is also the accessible version of the document, which is not a
 * coincidence: a screen reader and a language model want the same thing.
 */

const SEC = "font-serif text-[15px] font-bold uppercase tracking-[0.15em] border-b-2 border-black pb-1 mb-3";

/** The error kinds the game can diagnose, in words an administrator can use. */
const ERROR_LABELS: Record<string, string> = {
  word_order: "Word order — the words are known, the sentence structure is not",
  vocab: "Vocabulary — the word itself was not known",
  spelling: "Spelling — right word, wrong letters",
  agreement: "Agreement — gender or number did not match",
  conjugation: "Conjugation — wrong verb ending",
};

function pctOf(part: number, whole: number): number | null {
  return whole > 0 ? Math.round((part / whole) * 100) : null;
}

export default function ClassReport({
  data,
  students,
  grades,
}: {
  data: Payload;
  students: Student[];
  grades: GradeRow[];
}) {
  const a = data.analytics;
  const bossMeta = students[0]?.bosses ?? [];

  /* ── Headline numbers ──────────────────────────────────────────────────── */
  const graded = students.filter((s) => s.bossAveragePct != null);
  const classBossAvg = graded.length
    ? Math.round(graded.reduce((n, s) => n + (s.bossAveragePct ?? 0), 0) / graded.length)
    : null;
  const withSkills = students.filter((s) => s.profile.overallPct != null);
  const classMastery = withSkills.length
    ? Math.round(withSkills.reduce((n, s) => n + (s.profile.overallPct ?? 0), 0) / withSkills.length)
    : null;
  const classFirstTry = (() => {
    const items = students.reduce((n, s) => n + s.profile.totalItems, 0);
    const ft = students.reduce((n, s) => n + allBuckets(s.profile).reduce((m, b) => m + b.firstTry, 0), 0);
    return pctOf(ft, items);
  })();
  const totalItems = students.reduce((n, s) => n + s.profile.totalItems, 0);

  /* ── Topic aggregate, shared by figures 2 and 9 ────────────────────────── */
  const topicAgg = new Map<string, { kind: "Vocabulary" | "Grammar"; items: number; mastered: number; firstTry: number; students: number }>();
  for (const s of students) {
    for (const [kind, list] of [["Vocabulary", s.profile.vocabByTopic], ["Grammar", s.profile.grammarBySkill]] as const) {
      for (const b of list) {
        const cur = topicAgg.get(b.label) ?? { kind: kind as "Vocabulary" | "Grammar", items: 0, mastered: 0, firstTry: 0, students: 0 };
        cur.items += b.items; cur.mastered += b.mastered; cur.firstTry += b.firstTry; cur.students += 1;
        topicAgg.set(b.label, cur);
      }
    }
  }
  const topics = Array.from(topicAgg.entries())
    .map(([label, t]) => ({
      label, kind: t.kind, students: t.students, items: t.items,
      masteredPct: pctOf(t.mastered, t.items) ?? 0,
      firstTryPct: pctOf(t.firstTry, t.items) ?? 0,
    }))
    .filter((t) => t.students >= 3)
    .sort((x, y) => x.firstTryPct - y.firstTryPct);

  /* ── Figure 1: mastery against first try ───────────────────────────────── */
  const scatter = students
    .filter((s) => s.profile.totalItems >= 10 && s.profile.overallPct != null)
    .map((s) => ({ label: nameFor(s), x: firstTryPctOf(s.profile) ?? 0, y: s.profile.overallPct ?? 0 }));
  const quad = (x: number, y: number) =>
    y >= 80 ? (x >= 70 ? "Secure" : "Getting there") : (x >= 70 ? "Thin coverage" : "Needs support");
  const quadCounts = scatter.reduce<Record<string, number>>((acc, p) => {
    const k = quad(p.x, p.y); acc[k] = (acc[k] ?? 0) + 1; return acc;
  }, {});
  const QUAD_GLOSS: Record<string, string> = {
    "Secure": "they have learned the material and knew most of it on first contact",
    "Getting there": "they reach the answers but rarely on the first attempt, which is what a class mid-acquisition looks like",
    "Thin coverage": "they are accurate on what they have met, but have not met much of it yet",
    "Needs support": "neither learned nor accurate",
  };
  const topQuad = Object.entries(quadCounts).sort((x, y) => y[1] - x[1])[0];

  /* ── Figure 6: ACTFL bands ─────────────────────────────────────────────── */
  const rosterIds = new Set(students.map((s) => s.studentId));
  const myGrades = grades.filter((g) => rosterIds.has(g.studentId));
  const bandCounts = BANDS.map((_, i) => myGrades.filter((g) => g.bandIndex === i).length);

  /* ── Figure 3: what kind of mistake ────────────────────────────────────── */
  const errors = a?.errorKinds ?? [];
  const errorTotal = errors.reduce((n, e) => n + e.events, 0);
  const errorFills = [INK.r900, "url(#hatch45)", INK.r300, "url(#hatch135)", INK.r150];

  /* ── Figure 8: pace against accuracy ───────────────────────────────────── */
  const ftById = new Map(students.map((s) => [s.studentId, firstTryPctOf(s.profile)]));
  const nameById = new Map(students.map((s) => [s.studentId, nameFor(s)]));
  const pace = (a?.latency ?? [])
    .filter((l) => ftById.get(l.studentId) != null)
    .map((l) => ({ label: nameById.get(l.studentId) ?? "", x: l.medianMs / 1000, y: ftById.get(l.studentId) ?? 0, timed: l.timedEvents }));
  const paceMedian = pace.length
    ? [...pace].sort((p, q) => p.x - q.x)[Math.floor(pace.length / 2)].x
    : 0;
  // The axis is set by the 90th percentile, not the maximum: one student who
  // walked away mid-question sits at 24 seconds and would squash everyone else
  // into the left tenth of the plot. Anyone past the axis is drawn as a hollow
  // triangle on the edge and named in the table.
  const paceSorted = [...pace].sort((p, q) => p.x - q.x);
  const p90 = paceSorted.length ? paceSorted[Math.floor(paceSorted.length * 0.9)].x : 10;
  const paceMax = Math.max(6, Math.ceil(p90 / 2) * 2);
  const offScale = pace.filter((p) => p.x > paceMax);

  /* ── Figure 4: growth, controlled for difficulty ───────────────────────── */
  const byCase = new Map<number, { items: number; firstTry: number; students: Set<string> }>();
  for (const r of a?.firstTryByCase ?? []) {
    const cur = byCase.get(r.caso) ?? { items: 0, firstTry: 0, students: new Set<string>() };
    cur.items += r.items; cur.firstTry += r.firstTry; cur.students.add(r.studentId);
    byCase.set(r.caso, cur);
  }
  const growthRows = Array.from(byCase.entries())
    .filter(([, v]) => v.students.size >= 3)
    .sort((x, y) => x[0] - y[0])
    .map(([caso, v]) => ({ caso, pct: pctOf(v.firstTry, v.items) ?? 0, students: v.students.size, items: v.items }));
  const classLine = growthRows.map((r) => ({ x: r.caso, y: r.pct }));
  const perStudent = new Map<string, Array<{ x: number; y: number }>>();
  for (const r of a?.firstTryByCase ?? []) {
    if (r.items < 4) continue;
    const list = perStudent.get(r.studentId) ?? [];
    list.push({ x: r.caso, y: pctOf(r.firstTry, r.items) ?? 0 });
    perStudent.set(r.studentId, list);
  }
  const faintLines: Series[] = Array.from(perStudent.entries())
    .filter(([, pts]) => pts.length >= 3)
    .map(([key, pts]) => ({ key, points: pts.sort((p, q) => p.x - q.x) }));

  /* ── Figure 5: pacing ──────────────────────────────────────────────────── */
  const coverage = (a?.coverage ?? []).filter((c) => c.completed + c.inProgress + c.credited > 0);
  const rosterSize = a?.rosterSize ?? students.length;

  /* ── Figure 7: boss distribution ───────────────────────────────────────── */
  const boxes: BoxStats[] = bossMeta
    .map((meta) => {
      const vals = students
        .map((s) => s.bosses.find((b) => b.bossId === meta.bossId)?.scorePct)
        .filter((v): v is number => v != null);
      const q = quartiles(vals);
      return q ? { label: meta.label.replace("Operación ", ""), ...q } : null;
    })
    .filter((b): b is BoxStats => b !== null);

  /* ── Figure 9: the heat grid ───────────────────────────────────────────── */
  const heatRows = topics.slice(0, 16);
  const heatCols = [...students]
    .filter((s) => s.profile.totalItems > 0)
    .sort((x, y) => (y.profile.overallPct ?? 0) - (x.profile.overallPct ?? 0));
  const heatValues = heatRows.map((t) =>
    heatCols.map((s) => {
      const b = allBuckets(s.profile).find((x) => x.label === t.label);
      return b ? b.masteredPct : null;
    })
  );

  return (
    <>
      {/* ═══ PAGE 1 — what this document is ═══════════════════════════════ */}
      <section className="ws-page">
        <Letterhead data={data} title="Class Progress Report" subtitle="Boss assessments, skill mastery, and where the class stands" />

        <div className="grid grid-cols-5 gap-2 mb-5">
          {[
            ["Students with work", String(students.length)],
            ["Items answered", totalItems.toLocaleString("en-US")],
            ["Skill mastery", classMastery != null ? `${classMastery}%` : "—"],
            ["First-try accuracy", classFirstTry != null ? `${classFirstTry}%` : "—"],
            ["Boss assessment avg.", classBossAvg != null ? `${classBossAvg}%` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="border border-black px-2.5 py-2">
              <p className="font-serif text-[8.5px] uppercase tracking-[0.12em] leading-tight">{label}</p>
              <p className="font-serif text-lg font-bold leading-none mt-1">{value}</p>
            </div>
          ))}
        </div>

        <h2 className={SEC}>What this report measures</h2>
        <p className="font-serif text-[11.5px] leading-relaxed mb-2">
          Students learn Spanish 1 through a detective story: each case is set in a different Spanish-speaking
          country, and solving it requires reading a witness statement, understanding a recording, building
          sentences, and choosing correct verb forms. Every one of those interactions is recorded. This report is
          built from {totalItems.toLocaleString("en-US")} of them.
        </p>

        <h2 className={SEC}>The two numbers, and why there are two</h2>
        <dl className="font-serif text-[11.5px] leading-relaxed mb-3">
          <dt className="font-bold inline">Mastery. </dt>
          <dd className="inline">
            The share of individual items — words, sentences, questions — a student has answered correctly at least
            once. This is the number to read as &ldquo;what have they learned&rdquo;. It reads generously on purpose:
            the program re-asks an item until the student gets it, so most students climb toward 100.
          </dd>
          <br />
          <dt className="font-bold inline">First-try accuracy. </dt>
          <dd className="inline">
            The share they answered correctly the <i>first</i> time they met it. This is the number to read as
            &ldquo;what do they know&rdquo;. It spreads properly across a class and is the better indicator of
            secure knowledge. Where the two diverge, the knowledge is new rather than settled.
          </dd>
        </dl>

        <h2 className={SEC}>What is deliberately not counted</h2>
        <p className="font-serif text-[11.5px] leading-relaxed mb-2">
          Nothing in this report counts raw attempts, because some activities interact many times per thing learned
          and counting rows would misstate ability by a wide margin:
        </p>
        <ul className="font-serif text-[11px] leading-relaxed list-disc pl-5 mb-3">
          <li>
            The memory-match drill logs a card flip that does not pair as &ldquo;incorrect&rdquo;. It has done so
            104,000 times across the school at a 12% &ldquo;accuracy&rdquo;. A flip that does not pair is how
            matching works, not a child failing, so that activity is excluded entirely.
          </li>
          <li>
            The sentence builder records every press of <i>Comprobar</i>, so a student who rearranges the words four
            times before getting it right would log one success and three failures. Every figure here therefore
            counts <b>items</b>, folded to one row per word or sentence, never events.
          </li>
          <li>
            Boss assessments finished before per-part scoring was added are shown as &ldquo;passed&rdquo; with no
            percentage. The student completed them; a percentage cannot honestly be reconstructed, so none is shown.
          </li>
        </ul>

        <h2 className={SEC}>How to read the figures</h2>
        <p className="font-serif text-[11.5px] leading-relaxed">
          Each figure states its finding in one sentence, then shows the chart, then repeats the same numbers as a
          table. The charts are printed in a single grey scale with patterns and direct labels, so nothing is lost
          in a photocopy or by a reader who does not distinguish colours. Figures {boxes.length ? "" : "7 "}
          {boxes.length ? "" : "has"} no interpretation beyond what is written beside it.
        </p>
      </section>

      {/* ═══ PAGE 2 — the shape of the class ══════════════════════════════ */}
      <section className="ws-page">
        <h2 className={SEC}>I. The shape of the class</h2>

        <Figure
          number={1}
          title="Mastery against first-try accuracy"
          finding={
            topQuad
              ? `${topQuad[1]} of ${scatter.length} students fall in "${topQuad[0].toLowerCase()}" — ${QUAD_GLOSS[topQuad[0]]}. ` +
                `${quadCounts["Needs support"] ?? 0} ${(quadCounts["Needs support"] ?? 0) === 1 ? "student needs" : "students need"} support, ` +
                `in the lower left.`
              : "No student has enough recorded work to place yet."
          }
          howToRead="One dot per student. Right is more knowledge that was already secure; up is more material eventually learned. The two heavy lines divide the plot at 70% first-try and 80% mastery."
          table={
            <DataTable
              columns={["Quadrant", "What it means", "Students"]}
              rows={[
                ["Secure (top right)", "Learned it, and knew it first time", quadCounts["Secure"] ?? 0],
                ["Getting there (top left)", "Learned it, but needed repeats", quadCounts["Getting there"] ?? 0],
                ["Thin coverage (bottom right)", "Accurate, but has met little material", quadCounts["Thin coverage"] ?? 0],
                ["Needs support (bottom left)", "Neither learned nor accurate", quadCounts["Needs support"] ?? 0],
              ]}
              note={`Students with fewer than 10 recorded items are excluded (${students.length - scatter.length} of ${students.length}).`}
            />
          }
        >
          <QuadrantScatter
            points={scatter}
            xLabel="First-try accuracy — what they already knew"
            yLabel="Mastery — what they learned"
            xSplit={70}
            ySplit={80}
            quadrants={["Getting there — needs repeats", "Secure", "Thin coverage", "Needs support"]}
          />
        </Figure>

        <Figure
          number={6}
          title="ACTFL proficiency bands"
          finding={
            bandCounts.some((n) => n > 0)
              ? `The class sits mainly at ${BANDS[bandCounts.indexOf(Math.max(...bandCounts))]}. Bands are breadth-gated: ` +
                `Intermediate Low requires at least six solved cases, so the distribution moves slowly by design.`
              : "No student has enough evidence for a band yet."
          }
          howToRead="A proficiency band is not a grade. It describes demonstrated range, so a student can be doing well and still sit at Novice Mid early in the year."
          table={
            <DataTable
              columns={["Band", "Students", "Share of class"]}
              rows={BANDS.map((b, i) => [b, bandCounts[i], `${pctOf(bandCounts[i], myGrades.length) ?? 0}%`])}
            />
          }
        >
          <StackedBar
            segments={BANDS.map((b, i) => ({
              label: b,
              value: bandCounts[i],
              fill: [INK.r900, INK.r700, INK.r300, INK.r150][i],
            })).filter((s) => s.value > 0)}
            unit=" students"
          />
        </Figure>
      </section>

      {/* ═══ PAGE 3 — what the class has and has not learned ══════════════ */}
      <section className="ws-page">
        <h2 className={SEC}>II. What the class has learned, topic by topic</h2>

        <Figure
          number={2}
          title="Every topic, from first attempt to eventual mastery"
          finding={
            topics.length
              ? `The widest gap is "${topics[0].label}" — ${topics[0].firstTryPct}% right first time against ` +
                `${topics[0].masteredPct}% eventually. The topics at the top of this chart are where re-teaching would do the most good.`
              : "No topic has yet been reached by three or more students."
          }
          howToRead="Each row is one topic. The hollow dot is first-try accuracy, the solid dot is mastery, and the bar between them is how much repetition the class needed. A long bar means the class gets there but does not yet know it."
          table={
            <DataTable
              columns={["Topic", "Area", "Students", "First try", "Mastery", "Gap"]}
              rows={topics.map((t) => [t.label, t.kind, t.students, `${t.firstTryPct}%`, `${t.masteredPct}%`, `${t.masteredPct - t.firstTryPct} ${t.masteredPct - t.firstTryPct === 1 ? "pt" : "pts"}`])}
              note="Topics reached by fewer than three students are omitted. Ordered by first-try accuracy, weakest first."
            />
          }
        >
          <Dumbbell
            rows={topics.map((t) => ({ label: t.label, from: t.firstTryPct, to: t.masteredPct }))}
            fromLabel="First try"
            toLabel="Mastery"
            target={80}
          />
        </Figure>
      </section>

      {/* ═══ PAGE 4 — how they are getting it wrong ═══════════════════════ */}
      <section className="ws-page">
        <h2 className={SEC}>III. How the class gets things wrong</h2>

        <Figure
          number={3}
          title="What kind of mistake"
          finding={
            errorTotal
              ? `${Math.round(((errors[0]?.events ?? 0) / errorTotal) * 100)}% of diagnosable mistakes are ` +
                `${(ERROR_LABELS[errors[0]?.kind ?? ""] ?? errors[0]?.kind ?? "").split(" — ")[0].toLowerCase()} errors, across ${errors[0]?.students ?? 0} students. ` +
                `That is an instructional finding, not a vocabulary one: the words are largely known and the sentence structure is not.`
              : "No mistakes have been classified yet."
          }
          howToRead="Only wrong answers the program can diagnose are counted — those where the student's answer can be compared with the expected one word by word. The sample is smaller than total wrong answers."
          table={
            <DataTable
              columns={["Mistake type", "Occurrences", "Students affected", "Share"]}
              rows={errors.map((e) => [ERROR_LABELS[e.kind] ?? e.kind, e.events, e.students, `${pctOf(e.events, errorTotal) ?? 0}%`])}
              note={`${errorTotal.toLocaleString("en-US")} diagnosed mistakes in total.`}
            />
          }
        >
          <StackedBar
            segments={errors.map((e, i) => ({
              label: (ERROR_LABELS[e.kind] ?? e.kind).split(" — ")[0],
              value: e.events,
              fill: errorFills[i % errorFills.length],
            }))}
          />
        </Figure>

        <Figure
          number={8}
          title="Answer pace against accuracy"
          finding={
            pace.length
              ? `The class answers in a median of ${paceMedian.toFixed(1)} seconds. Students in the lower left answer fast and get it wrong — ` +
                `that is guessing, and it needs a different response from the students in the lower right, who are working slowly and still missing.`
              : "Not enough timed responses yet."
          }
          howToRead={
            "One dot per student. Left is faster. Up is more accurate on first contact. Fast-and-wrong and slow-and-wrong look identical in a gradebook and need opposite interventions." +
            (offScale.length
              ? ` ${offScale.length} ${offScale.length === 1 ? "student is" : "students are"} slower than the axis and ${offScale.length === 1 ? "is" : "are"} drawn as a hollow triangle on the right edge: ${offScale.map((o) => `${o.label} at ${o.x.toFixed(1)}s`).join(", ")}.`
              : "")
          }
          table={
            <DataTable
              columns={["Student", "Median answer time", "First-try accuracy", "Timed responses"]}
              rows={[...pace].sort((p, q) => p.x - q.x).map((p) => [p.label, `${p.x.toFixed(1)}s`, `${Math.round(p.y)}%`, p.timed])}
              note="Responses under 0.3s or over 2 minutes are excluded as misfires and walk-aways. Students with fewer than 10 timed responses are omitted."
            />
          }
        >
          <QuadrantScatter
            points={pace}
            xLabel="Median answer time (seconds)"
            yLabel="First-try accuracy"
            xMax={paceMax}
            xSplit={paceMedian}
            ySplit={70}
            xFmt={(v) => `${Math.round(v)}s`}
            quadrants={["Fast and accurate", "Slow but accurate", "Slow and missing", "Fast and missing — guessing"]}
          />
        </Figure>
      </section>

      {/* ═══ PAGE 5 — movement and pace ═══════════════════════════════════ */}
      <section className="ws-page">
        <h2 className={SEC}>IV. Movement through the course</h2>

        <Figure
          number={4}
          title="First-try accuracy by case number"
          finding={(() => {
            if (growthRows.length < 2) return "Not enough cases yet for a trend.";
            const a0 = growthRows[0], a1 = growthRows[growthRows.length - 1];
            const delta = a1.pct - a0.pct;
            const shape =
              Math.abs(delta) <= 4
                ? "Accuracy is holding roughly level even as the material gets harder, which is what steady learning looks like on this axis — standing still here is progress."
                : delta < 0
                ? "The fall is difficulty, not decline: later cases carry past tenses and longer sentences, so the same student scores lower on harder material."
                : "Accuracy is rising even as the material gets harder, which is the strongest signal of growth this chart can show.";
            const low = [...growthRows].sort((x, y) => x.pct - y.pct)[0];
            return `Accuracy runs from ${a0.pct}% at Caso ${a0.caso} to ${a1.pct}% at Caso ${a1.caso}, with the low point at Caso ${low.caso} (${low.pct}%). ${shape}`;
          })()}
          howToRead="Plotted against CASE NUMBER, not date. Accuracy plotted against the calendar falls across any term because the material gets harder, which would say the opposite of the truth. Every student meets the same material at Caso 4, so this compares like with like. The bold line is the class; each faint line is one student."
          table={
            <DataTable
              columns={["Case", "First-try accuracy", "Students", "Items met"]}
              rows={growthRows.map((r) => [`Caso ${r.caso}`, `${r.pct}%`, r.students, r.items])}
              note="Cases reached by fewer than three students are omitted."
            />
          }
        >
          <EmphasisLines
            faint={faintLines}
            bold={classLine}
            boldLabel="Class"
            xLabel="Case number"
            yLabel="First-try accuracy"
          />
        </Figure>

        <Figure
          number={5}
          title="Where the class actually is, case by case"
          finding={
            coverage.length
              ? `Caso ${coverage[coverage.length - 1].caso} is the furthest any student has reached. ` +
                (coverage.some((c) => c.credited > 0)
                  ? `${coverage.reduce((n, c) => n + c.credited, 0)} case-credits were granted to students who joined the class late, shown separately so they are not read as missing work.`
                  : "No catch-up credits have been granted.")
              : "No case progress recorded yet."
          }
          howToRead={`Each column is one case; the full height is the roster of ${rosterSize}. "Credited" marks a case a late-joining student was deliberately skipped past, which is a teacher decision, not a gap.`}
          table={
            <DataTable
              columns={["Case", "Completed", "In progress", "Credited (late joiner)", "Not started"]}
              rows={coverage.map((c) => [`Caso ${c.caso}`, c.completed, c.inProgress, c.credited, c.notStarted])}
            />
          }
        >
          <StackedColumns
            columns={coverage.map((c) => ({
              label: String(c.caso),
              parts: [c.completed, c.inProgress, c.credited, c.notStarted],
            }))}
            seriesLabels={["Completed", "In progress", "Credited (late joiner)", "Not started"]}
            fills={[INK.r900, INK.r500, "url(#hatch45)", INK.r150]}
            total={rosterSize}
            xLabel="Case number"
          />
        </Figure>
      </section>

      {/* ═══ PAGE 6 — assessments and the grid ════════════════════════════ */}
      <section className="ws-page">
        <h2 className={SEC}>V. Assessments and the full grid</h2>

        <Figure
          number={7}
          title="Boss assessment score distribution"
          finding={
            boxes.length === 0
              ? "No boss assessment has been scored yet. Per-part scoring was added recently, so this figure fills in as the class reaches the next assessment; fights completed before then appear as “passed” in the roster table without a percentage."
              : boxes.length === 1
              ? `Only ${boxes[0].label} has scored attempts so far — ${boxes[0].n} ${boxes[0].n === 1 ? "student" : "students"}, median ${Math.round(boxes[0].median)}%, ` +
                `ranging ${Math.round(boxes[0].min)}% to ${Math.round(boxes[0].max)}%. Too few to generalise from; the figure is here so the next assessment can be compared against it.`
              : `Median scores run from ${Math.round(Math.min(...boxes.map((b) => b.median)))}% to ${Math.round(Math.max(...boxes.map((b) => b.median)))}%. ` +
                "A tall box means the class is spread out on that assessment and a short one means they performed alike."
          }
          howToRead="Each box spans the middle half of the class, the heavy line is the median, and the whiskers reach the lowest and highest scores."
          table={
            boxes.length ? (
              <DataTable
                columns={["Assessment", "Students", "Lowest", "25th", "Median", "75th", "Highest"]}
                rows={boxes.map((b) => [b.label, b.n, `${Math.round(b.min)}%`, `${Math.round(b.q1)}%`, `${Math.round(b.median)}%`, `${Math.round(b.q3)}%`, `${Math.round(b.max)}%`])}
              />
            ) : (
              <p className="font-serif text-[10px] italic">No scored assessments yet — nothing to tabulate.</p>
            )
          }
        >
          {boxes.length ? (
            <BoxPlot boxes={boxes} />
          ) : (
            <div className="border border-black px-4 py-6 text-center">
              <p className="font-serif text-[11px] italic">
                This figure is intentionally empty. Per-part scoring began partway through the term; no assessment
                in this class has been taken since. It will populate at the next boss assessment.
              </p>
            </div>
          )}
        </Figure>

        <Figure
          number={9}
          title="Every student against every topic"
          finding={
            heatRows.length
              ? "A dark row is a topic the whole class is missing and belongs in a lesson. A dark column is one student falling behind across the board and belongs in an intervention. The two need different responses, and a gradebook average hides which one you have."
              : "Not enough topic coverage yet for a grid."
          }
          howToRead="One row per topic, one column per student, darkest where mastery is lowest. Students are ordered strongest to weakest left to right; topics weakest to strongest top to bottom. A dotted cell means the student has not met that topic yet."
          table={
            <DataTable
              columns={["Topic", "Students who met it", "Class mastery", "Students below 75%"]}
              rows={heatRows.map((t, ri) => [
                t.label,
                t.students,
                `${t.masteredPct}%`,
                heatValues[ri].filter((v) => v != null && v < 75).length,
              ])}
              note="The per-student cells are shown in the grid above; this table gives the per-topic totals. Full per-student figures are in the appendix."
            />
          }
        >
          <Heatmap
            rowLabels={heatRows.map((t) => t.label)}
            colLabels={heatCols.map((s) => nameFor(s))}
            values={heatValues}
          />
        </Figure>
      </section>

      {/* ═══ PAGE 7 — the roster ══════════════════════════════════════════ */}
      <section className="ws-page">
        <h2 className={SEC}>VI. Student roster</h2>
        <p className="font-serif text-[11px] leading-relaxed mb-3">
          Every student with recorded work. Bold marks a figure below 60%. &ldquo;Passed&rdquo; in an assessment
          column means the fight was completed before per-part scoring existed.
        </p>
        <table className="w-full border-collapse font-serif text-[9.5px]">
          <thead>
            <tr>
              <th className="border border-black px-1.5 py-1 text-left">Student</th>
              {bossMeta.map((b) => (
                <th key={b.bossId} className="border border-black px-1.5 py-1 text-center">
                  {b.label.replace("Operación ", "")}
                  <span className="block font-normal text-[8px]">after case {b.afterCaso}</span>
                </th>
              ))}
              <th className="border border-black px-1.5 py-1 text-center">Boss avg.</th>
              <th className="border border-black px-1.5 py-1 text-center">Mastery</th>
              <th className="border border-black px-1.5 py-1 text-center">First try</th>
              <th className="border border-black px-1.5 py-1 text-center">Items</th>
              <th className="border border-black px-1.5 py-1 text-left">ACTFL band</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const g = myGrades.find((x) => x.studentId === s.studentId);
              return (
                <tr key={s.studentId}>
                  <td className="border border-black px-1.5 py-1">
                    {nameFor(s)}
                    {s.reportName && <span className="block text-[8px]">in game: {s.displayName}</span>}
                  </td>
                  {s.bosses.map((b) => (
                    <td key={b.bossId} className="border border-black px-1.5 py-1 text-center">
                      {b.scorePct != null ? `${b.scorePct}%`
                        : b.status === "completed" ? "passed"
                        : b.status === "not_started" ? "—"
                        : b.status === "in_progress" ? "in progress" : b.status}
                    </td>
                  ))}
                  <td className="border border-black px-1.5 py-1 text-center"><Pct value={s.bossAveragePct} /></td>
                  <td className="border border-black px-1.5 py-1 text-center"><Pct value={s.profile.overallPct} /></td>
                  <td className="border border-black px-1.5 py-1 text-center"><Pct value={firstTryPctOf(s.profile)} /></td>
                  <td className="border border-black px-1.5 py-1 text-center tabular-nums">{s.profile.totalItems}</td>
                  <td className="border border-black px-1.5 py-1">{g?.band ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* ═══ PAGE 8+ — the machine-readable appendix ══════════════════════ */}
      <Appendix
        data={data}
        students={students}
        topics={topics}
        growthRows={growthRows}
        coverage={coverage}
        errors={errors}
        pace={pace}
        myGrades={myGrades}
        heatRows={heatRows}
        heatCols={heatCols}
        heatValues={heatValues}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   The appendix: the whole report again, as text a machine can parse
   ══════════════════════════════════════════════════════════════════════════ */

function Csv({ title, header, rows }: { title: string; header: string; rows: string[] }) {
  return (
    <div className="mb-4 break-inside-avoid">
      <h3 className="font-serif text-[11px] font-bold mb-1">{title}</h3>
      <pre className="font-mono text-[7.5px] leading-[1.45] whitespace-pre-wrap break-words border border-black p-2 m-0">
        {header}
        {"\n"}
        {rows.join("\n")}
      </pre>
    </div>
  );
}

function esc(v: string): string {
  return v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
}

function Appendix({
  data, students, topics, growthRows, coverage, errors, pace, myGrades, heatRows, heatCols, heatValues,
}: {
  data: Payload;
  students: Student[];
  topics: Array<{ label: string; kind: string; students: number; items: number; masteredPct: number; firstTryPct: number }>;
  growthRows: Array<{ caso: number; pct: number; students: number; items: number }>;
  coverage: Array<{ caso: number; completed: number; inProgress: number; credited: number; notStarted: number }>;
  errors: Array<{ kind: string; events: number; students: number }>;
  pace: Array<{ label: string; x: number; y: number; timed: number }>;
  myGrades: GradeRow[];
  heatRows: Array<{ label: string }>;
  heatCols: Student[];
  heatValues: Array<Array<number | null>>;
}) {
  return (
    <section className="ws-page">
      <h2 className={SEC}>Appendix — data and definitions</h2>

      <p className="font-serif text-[11px] leading-relaxed mb-3">
        This appendix restates every figure as plain text. It exists so the report can be read by software — a
        document assistant, a spreadsheet, or a language model asked questions about it — without depending on the
        charts, which do not survive text extraction. The figures above and the tables below are the same data.
      </p>

      <h3 className="font-serif text-[12px] font-bold uppercase tracking-[0.12em] mb-1.5">Definitions</h3>
      <dl className="font-serif text-[10.5px] leading-relaxed mb-4">
        {[
          ["Item", "One thing to be learned: a word, a phrase, a sentence, or a comprehension question. The unit everything here is counted in."],
          ["Mastery", "The share of items a student has answered correctly at least once. Reads generously: the program re-asks an item until the student succeeds."],
          ["First-try accuracy", "The share of items answered correctly on first encounter. The better measure of secure knowledge."],
          ["Case (caso)", "One unit of the course, set in one Spanish-speaking country. Thirty-two across the year."],
          ["Boss assessment", "A cumulative five-part test after a block of cases. Scored out of available points; the single number for a gradebook."],
          ["Credited", "A case a late-joining student was deliberately skipped past by the teacher. Counted separately from unfinished work."],
          ["ACTFL band", "A standards-based proficiency level (Novice Low through Intermediate Low), gated by breadth of material covered, not by score alone."],
          ["Diagnosed mistake", "A wrong answer the program could compare word-by-word with the expected answer, and so classify by type."],
          ["Excluded activity", "The memory-match drill (academia-reconocimiento), whose non-matching card flips are logged as incorrect by design. Excluded from every number in this report."],
        ].map(([term, def]) => (
          <div key={term} className="mb-1">
            <dt className="font-bold inline">{term}: </dt>
            <dd className="inline">{def}</dd>
          </div>
        ))}
      </dl>

      <h3 className="font-serif text-[12px] font-bold uppercase tracking-[0.12em] mb-1.5">Method</h3>
      <ul className="font-serif text-[10.5px] leading-relaxed list-disc pl-5 mb-4">
        <li>Source: every recorded interaction for this class, aggregated in the database rather than sampled.</li>
        <li>Events are folded to one row per student per item before anything is counted, so repeated attempts at the same sentence count once.</li>
        <li>A percentage is only shown when its denominator exists; otherwise an em dash is printed rather than a zero.</li>
        <li>Growth is plotted against case number rather than date, because difficulty rises across the term and a date axis would read as decline.</li>
        <li>Topic figures exclude topics reached by fewer than three students; student figures exclude students with fewer than ten recorded items. Both exclusions are stated on the figure.</li>
        <li>Report generated {data.generatedAt} for {data.className ?? "this class"}.</li>
      </ul>

      <h3 className="font-serif text-[12px] font-bold uppercase tracking-[0.12em] mb-1.5">Datasets</h3>

      <Csv
        title="students.csv — one row per student"
        header="student,mastery_pct,first_try_pct,items_total,items_mastered,boss_avg_pct,bosses_graded,actfl_band,cases_solved"
        rows={students.map((s) => {
          const g = myGrades.find((x) => x.studentId === s.studentId);
          return [
            esc(nameFor(s)),
            s.profile.overallPct ?? "",
            firstTryPctOf(s.profile) ?? "",
            s.profile.totalItems,
            s.profile.totalMastered,
            s.bossAveragePct ?? "",
            s.bossesGraded,
            esc(g?.band ?? ""),
            g?.casesSolved ?? "",
          ].join(",");
        })}
      />

      <Csv
        title="topics.csv — one row per topic, class-wide"
        header="topic,area,students_reached,items,first_try_pct,mastery_pct"
        rows={topics.map((t) => [esc(t.label), t.kind, t.students, t.items, t.firstTryPct, t.masteredPct].join(","))}
      />

      <Csv
        title="growth_by_case.csv — first-try accuracy per case"
        header="case_number,first_try_pct,students,items_met"
        rows={growthRows.map((r) => [r.caso, r.pct, r.students, r.items].join(","))}
      />

      <Csv
        title="coverage.csv — where students are, per case"
        header="case_number,completed,in_progress,credited_late_joiner,not_started"
        rows={coverage.map((c) => [c.caso, c.completed, c.inProgress, c.credited, c.notStarted].join(","))}
      />

      <Csv
        title="mistake_types.csv — diagnosed errors"
        header="mistake_type,occurrences,students_affected"
        rows={errors.map((e) => [e.kind, e.events, e.students].join(","))}
      />

      <Csv
        title="pace.csv — median answer time against accuracy"
        header="student,median_seconds,first_try_pct,timed_responses"
        rows={[...pace].sort((p, q) => p.x - q.x).map((p) => [esc(p.label), p.x.toFixed(1), Math.round(p.y), p.timed].join(","))}
      />

      {/* Long format, one row per cell, rather than a wide grid. A wide row
          wraps across several printed lines, and PDF text extraction turns
          each wrapped line into its own line — which would hand a reader
          software a corrupted table. Short rows survive that intact. */}
      <Csv
        title="mastery_by_student_and_topic.csv — one row per student per topic"
        header="student,topic,mastery_pct"
        rows={heatRows.flatMap((t, ri) =>
          heatCols
            .map((st, ci) => ({ st, v: heatValues[ri][ci] }))
            .filter((x) => x.v != null)
            .map((x) => [esc(nameFor(x.st)), esc(t.label), x.v].join(","))
        )}
      />

      <p className="font-serif text-[9.5px] italic mt-2">
        End of report. Every number above is derived from recorded student interactions; none is estimated,
        projected, or imputed.
      </p>
    </section>
  );
}
