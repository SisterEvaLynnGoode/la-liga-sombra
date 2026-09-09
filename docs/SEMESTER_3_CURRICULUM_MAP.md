# La Liga Sombra — Chapter 3 Curriculum Map (Casos 21–26)

**Status:** Approved direction, nothing built yet.
**Decided with the teacher (2026-09-08):**
- **Scope:** 6 casos across 10 weeks, on the established ~1.8-weeks-per-caso cadence.
- **Audience:** this year's students, continuing straight on from Caso 20. Chapter 3 may
  assume all twenty casos are solved and may lean on those specific case files and characters.
- **Assets:** bank a reserve from Higgsfield and ElevenLabs *before both subscriptions are
  cancelled this month.* Nothing in Chapter 3 may depend on generating assets later.
- **Level:** Spanish 2. Align the final sequence to the actual Level 2 textbook before
  authoring; what follows is standard Spanish 2 scope, not a claim about a specific book.

---

## 1. Why this shape

Two hard constraints, discovered while auditing:

**The country engine is spent.** Casos 1–10 used ten countries, 11–20 used ten more. Of the
21 Spanish-speaking countries exactly one is unused: **Guinea Ecuatorial**. "A new country
each caso" cannot carry a third chapter, so the fiction has to change rather than extend.

**The arc has no ending.** `lib/pacing/plan.ts` promises "Final boss · El Cronista" at week
35, but no boss content file exists — only Eclipse (5), Medianoche (8) and Reloj de Arena
(15). Students currently finish Caso 20 having never confronted him. Chapter 3 opens in that
hole rather than beside it.

---

## 2. Premise — "El Expediente Cronista"

El Cronista is **caught**. That is where Chapter 3 begins, not where it ends.

But twenty thefts across twenty timelines left history damaged, and he will not say what he
actually did. Each caso **reopens one of the student's own old case files** — *Expediente
reabierto: Caso III · España* — and the job is no longer to identify a suspect. It is to
**reconstruct what happened**: re-interview the witnesses, cross-check his statement against
theirs, and file a report accurate enough to repair the timeline.

### Why the frame IS the grammar

Reconstructing a past event is precisely the **pretérito / imperfecto** distinction, which is
the single hardest thing in Spanish 2:

- **Pretérito** = what happened. The completed acts. *Llegó, tomó el mapa, salió.*
- **Imperfecto** = what things were like. The background, the ongoing, the scene.
  *Era de noche. Había mucha gente. La cantante cantaba.*

A wrong tense is not a red X on a worksheet; it files a false report and history stays broken.
This is the first chapter whose win condition is **narrating correctly** rather than pointing
at the guilty one — which also breaks the "same five things every caso" fatigue, because
every previous caso ends on the same verb: *accuse*.

### What this buys us on assets

Revisiting is not a retread, it is the design. It also means the chapter is largely built from
things that already exist: **148 character portraits**, **617 vocabulary clips**, and **20
case-intro videos**. Reopened files can reuse their original establishing shot, which reads as
intentional (it is the same place, later).

---

## 3. Caso map

Each caso pairs a reopened case file with the grammar its story naturally demands.

| # | Reopened file | Grammar focus | Why this case carries it |
|---|---|---|---|
| 21 | **Caso I · México, Guadalajara** | Pretérito, regular -AR/-ER/-IR | Back where the whole game started, with Don Rodrigo. The first honest account of that night: *llegó, tomó, salió, habló, escribió.* |
| 22 | **Caso III · España, Museo del Prado** | Pretérito, irregulars | A heist retelling is carried by exactly the irregular set: *fue, hizo, tuvo, dijo, vino, puso, estuvo, pudo.* |
| 23 | **Caso VIII · Perú, Cusco** | Imperfecto | Description and habitual past. What the site and the market *were like* before he arrived: *era, había, tenía, iba, veía.* |
| 24 | **Caso VII · Chile, Viña del Mar** | **Pretérito vs. imperfecto I** | The festival is wall-to-wall simultaneous activity interrupted by one event — the textbook shape of the contrast. *Mientras la cantante cantaba, alguien entró.* |
| 25 | **Caso XV · Cuba, La Habana 1954** | **Pretérito vs. imperfecto II** + double object pronouns | Caso 15 already taught *me lo / se los*; this returns to the same studio and the same characters one level deeper. Who gave what to whom, and when. |
| 26 | **Guinea Ecuatorial · Malabo / Bioko** | Present perfect + commands (tú negative, Ud./Uds.) | The twenty-first country. The one place he never reached. *Ha robado veinte tesoros. No lo dejes escapar.* |
| ★ | **FINAL BOSS · El Cronista** | Cumulative past-tense narration | The confrontation the pacing plan has promised since week 35. |

**Deliberately out of scope.** Por/para and the subjunctive are real Spanish 2 content, but six
casos cannot hold them *and* teach the past-tense system properly. The past tense is the point
of Spanish 2; a shallow pass at five more topics would be worse than a solid pass at one.
Subjunctive is left as the Chapter 4 hook (*ojalá que…*).

### Cultural-sensitivity filter (carried over from Semester 2)

Celebratory material only. For **Guinea Ecuatorial** specifically this means Malabo and Bioko
today, Fang and Bubi cultural traditions, music, architecture and the island's biodiversity —
**not** colonial history or the dictatorship years. Same filter that kept Semester 2 on
archaeology, sport, poetry, engineering and craft.

---

## 4. Week map (weeks 37–46)

| Week | Content |
|---|---|
| 37 | Caso 21 · Pretérito regular |
| 38 | Caso 22 · Pretérito irregular |
| 39 | Caso 23 · Imperfecto |
| 40 | Caso 24 · Contrast I |
| 41 | **Review / milestone** — contrast consolidation, HQ paper work |
| 42 | Caso 25 · Contrast II + double object pronouns |
| 43 | Caso 26 · Guinea Ecuatorial |
| 44 | **Final boss** · El Cronista |
| 45 | Capstone build |
| 46 | Capstone presentations + year reflection |

---

## 5. Mechanics — spend the ones already built

Four mechanics exist and are used **exactly once each** across twenty casos. Chapter 3 should
spend that sunk cost rather than commission anything new:

- `swipeSort` (9 uses, built for ser/estar) → **pretérito vs. imperfecto sorting.** Nearly
  unchanged; point the same component at the S2 centerpiece.
- `sentenceBuilder` (17 uses) → **narration assembly**, choosing the tense per verb.
- `chaseScene`, `chaseMap`, `timedFlashcards`, `liveStakeout` (1 use each) → redistribute
  across the six casos so no caso repeats the Caso 1–20 stage order.

### One genuinely new mechanic: **la contradicción**

Two witnesses give accounts of the same moment. One uses a tense that cannot be right — a
completed action in the imperfect, or an ongoing state in the preterite. The student flags the
false sentence and repairs it.

This is worth building because it is the only stage in the game where the student **judges**
Spanish rather than produces or selects it, and because it is the assessment that actually
distinguishes a student who has internalised the contrast from one who is pattern-matching
endings. Build it on the existing `swipeSort` shell if possible.

---

## 6. Asset reserve — MUST be generated before the subscriptions lapse

Nothing here may depend on post-cancellation generation. The build order is therefore:

1. **Write the six vocabulary lists first** (free, no API).
2. **Diff them against the 617 terms that already have clips.** Only genuinely new forms need
   audio. Note that conjugated forms count as new terms: *llegar* has a clip, *llegó* does not.
   Expect the new-audio need to be dominated by preterite/imperfect forms plus narration
   connectors (*mientras, de repente, entonces, luego, ayer, anoche, primero, después, por fin*).
3. **Generate the audio reserve** (ElevenLabs), the **six reopened-file intro videos** plus one
   for Guinea Ecuatorial and one for the boss (Higgsfield `kling3_0_turbo`, 7.5 credits per 5s
   clip, measured), and **any new portraits** — the Guinea Ecuatorial cast, and El Cronista
   himself, who has never been drawn.
4. Only then cancel.

Everything after step 3 — authoring the JSON, the worksheets, the boss — needs no API at all.

### Reopened-file intros

A reopened case can reuse its original video, but the stronger read is a **second shot of the
same location, later and colder**: the Prado gallery with the painting back and a guard's
chair pulled up to it, the Guadalajara stage with a new guitar on the stand. Same place, after.
Budget for these; fall back to reuse if credits get tight.

---

## 7. El Cronista's face — a decision, and it is worth money this month

He appears in all ten of Casos 11–20 as `id: "cronista"`, under a different alias each time
(*El Forastero Pálido*, *El Falso Astrónomo*, *El Hombre que No Miraba el Cielo*). He has ten
portraits, one per caso.

**They are ten different men.** Casos 16–20 are roughly one consistent figure — dark hair,
moustache, period suit. Casos 11–15 are five unrelated people of different builds and
ethnicities, matching neither each other nor the later five. He has no entry in
`content/characters/recurring.json`, so no brief ever fixed his appearance.

The writing, notably, never describes his face. It identifies him by **behavioural anomaly**:
pale clean hands that have never carved stone, sandals nobody recognises, walking without
sound, not marking the clave when the music plays, a watch that makes no noise. He is spotted
because he does not belong to the era, not because of how he looks.

So this is a story decision, not simply a defect, and it has an asset cost:

- **Canonise one face.** Write him a character brief, pick the strongest of the ten (the 16–20
  figure is the most consistent), and regenerate the five that disagree. Costs Higgsfield
  credits **that must be spent before cancellation.** Gives Chapter 3 a villain students
  recognise on sight, which matters when the whole chapter is a confrontation with him.
- **Make the shifting face canon.** He wears the era's face; that is what a time thief does.
  Costs nothing, is supported by the aliases, and turns an inconsistency into the premise. But
  it forecloses any lineup or "pick him out" mechanic for the final boss, because there is
  nothing stable to pick.

**Recommendation: canonise.** Chapter 3's climax is meeting him in person, and the game's core
verb has always been recognising a face. Ten faces makes the villain abstract at exactly the
moment he needs to be a person. Budget roughly five portraits.

Note also that **Caso 20 already seeds this chapter's grammar as his tell**: he recites
Tiwanaku's history in the preterite, "like four dates from a book," while the guardian tells it
in the imperfect because she lived it. That contrast is the whole of Chapter 3, and it is
already in the fiction.

## 8. Open questions for the teacher

- Confirm the grammar sequence against the actual Level 2 textbook chapter order before authoring.
- Canonise El Cronista's face, or make the shifting face canon? (§7 — affects what art must be
  bought this month.)
- Does the capstone (weeks 45–46) stay as-is, or become a written past-tense case report, which
  would assess the chapter's actual target?
