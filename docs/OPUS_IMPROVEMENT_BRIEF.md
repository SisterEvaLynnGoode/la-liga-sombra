# La Liga Sombra — Improvement Brief for Claude (Opus 4.8)

**Audience:** a Claude Opus 4.8 agent working in this repo (`la-liga-sombra`, Next.js 14 App Router + TypeScript + Tailwind + Supabase, deployed on Vercel from `master`).
**Audited:** 2026-06-30, post-QA-v11, all 10 units + boss + cold case shipped, classroom launch imminent.
**Owner:** a Spanish 1 teacher (non-engineer). Students play on Chromebooks (1366×768) via class code + name + PIN — **no email, no PII beyond a first name/nickname**.

---

## 0. Ground rules (read first)

1. **Never break a live classroom.** All schema changes must be *additive* (new tables/columns, idempotent upserts). Never `delete from` a table with student FKs. Migration 002 did this once; migration 013 is the model for how to do it right.
2. **Migrations do not auto-run.** Pushing to `master` deploys code only. Any new `supabase/migrations/*.sql` must be pasted into the Supabase SQL editor by the teacher — so keep migrations **single-file, idempotent, and paste-safe** (plain quotes, no psql meta-commands), and tell the teacher exactly what to paste.
3. **Student-facing text is Spanish** (comprehensible, Novice-friendly, cognate-rich). Teacher-facing text is English. This is a hard convention (see `DashboardClient.tsx` comments).
4. **Verify before claiming.** Run `npx tsc --noEmit` and `npm run validate` before every commit. The prebuild hook runs content validation; a broken unit JSON breaks the deploy.
5. **Respect the noir brand**: bg `#0d0b0a`/`#0c0e14`, gold `#c9933a`/`#e8b455`, red `#8b1a1a`/`#c0392b`, `font-typewriter`/`font-display`.
6. **Data ethics:** no PII collection, no third-party analytics SDKs, no external trackers. Everything stays in the class's Supabase. Aggregate before you display.

---

## 1. Audit summary — what exists today

### Systems inventory
- **Case engine** (`app/play/[unitId]/UnitPlayer.tsx`): 11 stage types — `cutscene, vocabMatch, dialogueChoice, readingComp, listeningComp, lineup, interrogation, chaseMap, sentenceBuilder, liveStakeout, timedFlashcards`.
- **Academia** pre-mission vocab gate: Reconocimiento → Memorización → Producción, 70% gates, readiness tiers (`lib/mastery.ts`: ready ≥.80 / recommended ≥.50 / required <.50) with a "🟢 Listo" skip.
- **Training room** (`app/training`): VocabGym, GrammarDojo (concept-gated by case), Definiciones, Locker (streaks/badges/times).
- **Spaced repetition** (`lib/spaced-repetition.ts`): Leitner intervals (14/5/2/1 days by accuracy), daily briefing of **max 3 overdue terms**.
- **Engagement**: leaderboard, badges (**only 5 enum types**: case_solved, perfect_score, speed_run, cultural_expert, first_case), streak days, Pasaporte Cultural, **one** cold case (Unit 1), **one** boss (Operación Eclipse after Unit 5), teacher alerts + inbox.
- **Teacher dashboard**: 9 tabs (Inbox, Overview, Pacing, Students, Units, Bosses, Vocabulary, Leaderboard, Export) + worksheets/pasaporte/presentations printables.

### Data model (the important part)
- `attempts(student_id, unit_id, activity_type, score, max_score, time_spent_seconds, completed_at)` — **one aggregate row per activity**, `activity_type` enum has only 5 values (`vocab_match, dialogue, listening, grammar, cultural`) vs 11 stage types.
- `mastery(student_id, vocab_term, attempts, correct, last_seen)` — **lifetime** counters, per vocab term only.
- `unit_progress`, `boss_progress`, `badges`, `student_flags`, listening/academia support flags.

### Strengths (do not regress these)
- Story-as-pedagogy: grammar *is* the evidence (demonstratives in Caso VI, preterite in Caso VIII). QA v11 called it "one of the best-designed language learning experiences I've seen."
- Accessibility: transcripts everywhere, ES↔EN toggles, audio fallbacks.
- Forgiving design: "Casi listo, recluta" recovery, Tiempo Agotado graceful continuation, "Pedir ayuda al profesor."
- Persistence: mid-case resume works across sessions.

### Weaknesses found in audit
| # | Area | Finding |
|---|------|---------|
| W1 | Data | No item-level events: we can't see *which word* was missed, *which distractor* was chosen, or per-item latency. `attempts` is a per-activity aggregate. |
| W2 | Data | `mastery` is lifetime `correct/attempts` — a student who was wrong 10× in August and right 10× in October reads as 50% forever. No recency weighting/decay. Readiness gates inherit this bias. |
| W3 | Data | Grammar has no mastery ledger at all — only vocab terms. GrammarDojo results vanish into aggregate attempts. No error taxonomy (gender agreement vs conjugation vs word order). |
| W4 | Pedagogy | Output ladder tops out early: almost all input is multiple-choice/recognition; free production exists only in scattered free-text evidence answers and the boss "Negociar en español." No speaking anywhere; no structured writing capture. |
| W5 | Pedagogy | Daily briefing caps at 3 terms and is the *only* spaced-repetition surface. Old-unit vocab otherwise never resurfaces inside new cases (no deliberate interleaving). |
| W6 | Pedagogy | Feedback is binary (✓/✗ + correct answer). No *elaborated* feedback ("`duele` porque 'la cabeza' es singular"). |
| W7 | Engagement | Progression cliff: 1 cold case (Unit 1 only), 1 boss (after Unit 5). Units 6–10 have no replayable/optional content and no second boss before the capstone. |
| W8 | Engagement | Only 5 badge types; streaks tracked but weakly celebrated; leaderboard is individual-only (no team/squad play); QA noted counter mismatches across Casillero/Gimnasio/Expediente (P3, still open). |
| W9 | Engagement | No student goal-setting or visible "can-do" self-tracking in-game (exists only on paper via Pasaporte). |
| W10 | UX debt (QA P3s) | Caso VIII chief portrait empty; Caso IV/VI progress-rail label crowding on narrow viewports; vocab counter drift (W8). |

---

## 2. Your mission — three workstreams, in priority order

Work in this order. Each phase ends with: `npx tsc --noEmit` clean, `npm run validate` clean, commit, push, and a plain-English note to the teacher (incl. any SQL to paste).

### Workstream A — Data collection foundation (do this first; everything else feeds on it)

**A1. Item-level event log.** New migration `014_events.sql`:
```sql
create table if not exists item_events (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  unit_id       uuid references units(id) on delete cascade,
  stage_type    text not null,          -- one of the 11 stage kinds
  item_key      text not null,          -- vocab term, grammar concept id, question id
  skill         text not null,          -- 'vocab' | 'grammar' | 'listening' | 'reading' | 'culture'
  correct       boolean not null,
  chosen        text,                   -- distractor actually chosen (null for free text)
  expected      text,
  latency_ms    integer,
  created_at    timestamptz not null default now()
);
create index if not exists idx_item_events_student on item_events(student_id, created_at);
create index if not exists idx_item_events_item on item_events(item_key);
```
Add `POST /api/game/item-event` (batch array payload — one network call per stage, not per click). Instrument the highest-value stages first: `vocabMatch`, `listeningComp`, `sentenceBuilder`, `liveStakeout`, `timedFlashcards`, Academia's three sub-stages. Keep the existing `attempts` writes untouched (dashboards depend on them).

**A2. Recency-weighted mastery.** Don't change the `mastery` table; change the *read*. In `lib/mastery.ts`, compute readiness from the last N=10 `item_events` per term when available (exponentially weighted, half-life ~14 days), falling back to lifetime `correct/attempts` when the event log is thin. Gates get fairer automatically.

**A3. Grammar concept ledger.** Reuse `mastery` mechanics: new table `concept_mastery(student_id, concept_id, attempts, correct, last_seen)` where `concept_id` matches GrammarDojo concept ids (e.g. `ser-adjectives`, `preterite-ar`). Instrument GrammarDojo + `sentenceBuilder` + interrogation grammar picks. Surface in the teacher dashboard Units tab next to vocab mastery.

**A4. Error taxonomy (lightweight).** On `sentenceBuilder` and free-text misses, classify into `word_order | conjugation | agreement | vocab | spelling` with a pure function (no LLM), store in `item_events.chosen` prefix or a `error_kind` column. Teacher Inbox digest: "5 students are making agreement errors in Unit 4."

**A5. One counter to rule them all.** Fix W8/W10 counter drift: create a single `lib/stats.ts` `getStudentStats(studentId)` used by Casillero, Gimnasio, and Expediente. Authoritative definition: *dominado = term with recency-weighted accuracy ≥ 0.8 and ≥ 3 attempts*. Delete the three divergent ad-hoc queries.

### Workstream B — Pedagogy upgrades

**B1. Interleaved review inside cases (fixes W5).** In `lib/question-generator.ts`, when building Vigilancia/stakeout question sets, draw 20–30% of items from *prior units'* overdue terms (use `getOverdueTermsForBriefing` logic, remove its 3-term cap in this context). Label them "🗂 Expediente antiguo" so recycling is visible and thematic.

**B2. Elaborated feedback (fixes W6).** Extend unit content schema (`lib/content-schema.ts`) with optional `feedback` per question/option: one Spanish sentence explaining *why* (shown after answer, 8-word max, cognate-heavy). Author it for Units 1–4 first (highest usage). Validation must keep it optional so old content stays valid.

**B3. Production ramp (fixes W4).**
- Add a `typedResponse` variant to `dialogueChoice`: after Unit 3, one dialog turn per case requires *typing* the answer (accent-tolerant matching via existing `normalizeAnswer`).
- Add optional **speaking practice** using the browser's free Web Speech API (`SpeechRecognition`, es-ES/es-MX): a "🎙 Dilo en voz alta" button on vocab results and the case-closing summary. Score = recognized-text similarity; always skippable (Chromebook mics vary); log to `item_events` with skill `speaking`. No external services.
- Capstone writing: a plain `textarea` "Informe del detective" (2–3 sentences) at case end from Unit 6 onward, saved to a new `field_reports` table for the teacher to review in the dashboard (not auto-graded).

**B4. Can-do self-assessment in-game (fixes W9).** After each case's result screen, show the unit's 2–3 ACTFL can-do statements with a 3-emoji self-rating (😕/🙂/😎), stored in `student_flags` or a small new table. Surface per-student in the dashboard next to actual mastery — the gap between self-rating and data is gold for conferences.

### Workstream C — Engagement systems

**C1. Cold cases for Units 2–10 (fixes W7).** The cold-case engine already exists (`app/play/[unitId]/cold`, `content/unit-01-cold.json` as template, `COLD_CASE_UNITS` set in `mission-board/page.tsx`). Author cold-case JSON for the remaining 9 units (harder rules, double points, same vocab) and expand the set. This is the single cheapest replayability win.

**C2. Second boss: "Operación Medianoche" after Unit 8.** Clone the Eclipse architecture (`BOSS_AFTER_UNIT` map, `boss_progress`) covering Units 6–8 (food/festival/market vocab, stem-changers + preterite), with an ethical branch and a Spanish-production gate like Negociar. Fills the Units 6–10 engagement cliff before the capstone.

**C3. Badge expansion.** Extend `badge_type` enum (additive `alter type ... add value`) with: `racha_7`, `racha_30`, `interleave_ace` (10 old-unit reviews correct), `primera_produccion` (first typed/spoken answer), `culture_collector` (all pasaporte pages), `cold_case_master`, `boss_both_endings`. Celebrate streaks in the header (small 🔥 counter), not just the Locker.

**C4. Squad mode for the leaderboard.** Optional teacher-created squads (4–5 students) with a squad score = *mean* mastery growth (not raw points — growth, so weak students help by improving). One new table `squads` + `squad_members`, one dashboard tab section, one student-side widget. No student chat, no free text between students.

**C5. Weekly case-drop ritual.** Add a "Caso de la Semana" banner slot on the mission board driven by the pacing plan (`lib/pacing/plan.ts`) so the in-game week matches the teacher's calendar and the Instagram series (@laligasombra). One config read, one banner component.

---

## 3. Explicit non-goals
- No account system changes (class code + PIN stays).
- No external analytics, ads, or trackers; no LLM API calls from the student runtime.
- No difficulty *punishment* mechanics (timers that shame, public failure states). The forgiving-design ethos is a feature.
- Don't rewrite the case engine or restyle the UI.

## 4. Definition of done, per phase
1. `npx tsc --noEmit` and `npm run validate` pass.
2. New tables have a single idempotent migration file + a paste-ready SQL block in the commit message (teacher applies manually — assume she will paste exactly one block).
3. Student-visible strings in Spanish; teacher-visible in English.
4. Smoke-test the affected flow on the deployed site with the QA accounts (class `HGK175` — ask the teacher before creating new test students).
5. Nothing in `attempts`/`mastery` write paths removed or renamed — dashboards and exports read them.

## 5. Suggested order of commits
1. A1 event log + instrumentation of 3 stages → 2. A5 unified stats (fixes live QA P3) → 3. A2 recency mastery → 4. B1 interleaving → 5. C1 cold cases (content-only, zero risk) → 6. A3/A4 grammar ledger + taxonomy → 7. B2 feedback authoring → 8. C3 badges → 9. B3 production ramp → 10. C2 second boss → 11. B4 can-do → 12. C4 squads → 13. C5 weekly ritual.

*Each is independently shippable. Stop and report to the teacher after every 2–3 commits.*
