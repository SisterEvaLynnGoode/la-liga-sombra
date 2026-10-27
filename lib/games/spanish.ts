import { normalizeAnswer } from "./utils";

/**
 * Spanish-specific answer tolerance.
 *
 * WHY THIS EXISTS
 *
 * Spanish is a pro-drop language: the verb ending already carries the person,
 * so the subject pronoun is optional and is usually left out. "Voy al museo en
 * metro" is not a worse version of "Yo voy al museo en metro" — it is the more
 * natural one, and the pronoun in the model sentence is there for emphasis or
 * for teaching.
 *
 * The sentence exercises were comparing the built sentence with the target
 * string, so a student who dropped the pronoun was marked wrong for writing
 * correct Spanish. Across the school that happened 46 times to 20 students,
 * and it was recorded as a grammar error against them.
 *
 * ACCENTS MATTER HERE, which is the one subtle part. The general answer
 * comparison strips accents so a student is not punished for a missing tilde,
 * but two of the droppable pronouns are distinguished from completely
 * different words by their accent alone:
 *
 *     él  (pronoun, "he")      vs  el  (article, "the")
 *     tú  (pronoun, "you")     vs  tu  (possessive, "your")
 *
 * Strip the accents first and "El collar no está en la habitación" looks like
 * a sentence beginning with a droppable pronoun, so a student who omitted the
 * article would be told they had written good Spanish. The pronoun test is
 * therefore accent-sensitive; only the remainder of the sentence is compared
 * loosely.
 */

/** Subject pronouns Spanish allows a speaker to omit. Accent-sensitive. */
const DROPPABLE = new Set([
  "yo",
  "tú",
  "él",
  "ella",
  "usted",
  "nosotros",
  "nosotras",
  "vosotros",
  "vosotras",
  "ustedes",
  "ellos",
  "ellas",
]);

function words(s: string): string[] {
  return s.normalize("NFC").trim().split(/\s+/).filter(Boolean);
}

/** Lowercase without touching accents — "Él" → "él", never "el". */
function lowerKeepAccents(s: string): string {
  return s.normalize("NFC").toLowerCase();
}

/**
 * If `built` is `expected` with its leading subject pronoun left out, return
 * that pronoun. Otherwise null.
 *
 * Only the sentence-initial pronoun is considered. A pronoun later in the
 * sentence can be carrying contrast ("yo voy, pero él se queda"), where
 * dropping it changes the meaning, so those are left alone.
 */
export function omittedSubjectPronoun(expected: string, built: string): string | null {
  const e = words(expected);
  const b = words(built);
  if (e.length !== b.length + 1) return null;

  const first = lowerKeepAccents(e[0]).replace(/[.,;:!?¿¡]/g, "");
  if (!DROPPABLE.has(first)) return null;

  // The pronoun is only droppable if a verb follows it, which in practice
  // means there is a remainder at all.
  if (b.length === 0) return null;

  return normalizeAnswer(e.slice(1).join(" ")) === normalizeAnswer(b.join(" ")) ? e[0] : null;
}

export interface SentenceVerdict {
  /** Whether to credit the student. */
  ok: boolean;
  /** Set when the answer was accepted as a pro-drop variant of the target. */
  droppedPronoun: string | null;
}

/**
 * Grade a built sentence against its target.
 *
 * An exact match (accent- and case-insensitive, as elsewhere) is correct. A
 * sentence that differs only by an omitted subject pronoun is also correct,
 * and says which pronoun was dropped so the exercise can explain itself
 * instead of simply passing the student.
 */
export function gradeSentence(expected: string, built: string): SentenceVerdict {
  const target = expected.replace(/[.!?¿¡]/g, "");
  if (normalizeAnswer(built) === normalizeAnswer(target)) {
    return { ok: true, droppedPronoun: null };
  }
  const dropped = omittedSubjectPronoun(target, built);
  return dropped ? { ok: true, droppedPronoun: dropped } : { ok: false, droppedPronoun: null };
}
