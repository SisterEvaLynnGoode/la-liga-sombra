/**
 * What a student's sentence attempt reveals about their syntax.
 *
 * The sentence builder supplies the words and the student orders them. That
 * constraint is what makes this data worth reading: vocabulary is held
 * constant, so a wrong answer is almost always a statement about word order
 * and nothing else. 78% of wrong attempts across the school are the right
 * words in the wrong order.
 *
 * This classifies (expected, chosen) into patterns a language teacher can act
 * on, and — just as importantly — separates out the attempts that are not
 * errors at all.
 */

/** Subject pronouns Spanish allows a speaker to omit. */
const SUBJECT_PRONOUNS = new Set([
  "yo", "tú", "tu", "él", "el", "ella", "usted",
  "nosotros", "nosotras", "vosotros", "vosotras",
  "ustedes", "ellos", "ellas",
]);

export type SyntaxPattern =
  | "dropped-pronoun"
  | "adjacent-swap"
  | "reordered"
  | "word-missing"
  | "word-extra"
  | "other";

export interface SyntaxFinding {
  pattern: SyntaxPattern;
  /** A plain description of what the student did, naming the words involved. */
  detail: string;
  /**
   * True when the attempt is defensible Spanish that simply is not the target
   * string. These are scored wrong by the game and should not be reported to
   * anyone as a mistake the student made.
   */
  acceptable: boolean;
}

export const PATTERN_LABELS: Record<SyntaxPattern, string> = {
  "dropped-pronoun": "Subject pronoun omitted",
  "adjacent-swap": "Two neighbouring words swapped",
  "reordered": "Words rearranged",
  "word-missing": "A word left out",
  "word-extra": "An extra word used",
  "other": "Other",
};

export const PATTERN_NOTES: Record<SyntaxPattern, string> = {
  "dropped-pronoun":
    "Spanish lets a speaker drop the subject pronoun, so these are correct Spanish that did not match the target sentence. They are scored as errors by the exercise and are listed here so they are not read as mistakes.",
  "adjacent-swap":
    "Two words next to each other were transposed. In a beginner Spanish class this is most often the adjective and the noun — English puts the adjective first, Spanish usually puts it second — so it is the clearest single marker of first-language transfer.",
  "reordered":
    "The right words in a different arrangement. Some of these are valid Spanish with a different emphasis; others are not. They are worth reading individually.",
  "word-missing":
    "The sentence was submitted with a word unused. Often a dropped article or preposition.",
  "word-extra":
    "A word appears that is not in the target sentence.",
  "other": "Did not fall into one of the patterns above.",
};

function tokens(s: string): string[] {
  return s.trim().toLowerCase().replace(/\s+/g, " ").split(" ").filter(Boolean);
}

function sameMultiset(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

/**
 * Classify one attempt.
 *
 * `expected` and `chosen` come straight from item_events, so both are the raw
 * strings the game compared.
 */
export function classifySyntax(expected: string, chosen: string): SyntaxFinding {
  const e = tokens(expected);
  const c = tokens(chosen);

  // A leading subject pronoun dropped, everything else identical.
  if (
    e.length === c.length + 1 &&
    SUBJECT_PRONOUNS.has(e[0]) &&
    e.slice(1).every((w, i) => w === c[i])
  ) {
    return {
      pattern: "dropped-pronoun",
      detail: `left out “${expected.trim().split(/\s+/)[0]}” — Spanish allows this`,
      acceptable: true,
    };
  }

  if (sameMultiset(e, c)) {
    // Exactly one adjacent pair transposed and nothing else moved.
    let diff = -1;
    for (let i = 0; i < e.length; i++) {
      if (e[i] !== c[i]) { diff = i; break; }
    }
    if (
      diff >= 0 &&
      diff + 1 < e.length &&
      e[diff] === c[diff + 1] &&
      e[diff + 1] === c[diff] &&
      e.slice(diff + 2).every((w, i) => w === c[diff + 2 + i])
    ) {
      return {
        pattern: "adjacent-swap",
        detail: `wrote “${c[diff]} ${c[diff + 1]}” where the sentence wants “${e[diff]} ${e[diff + 1]}”`,
        acceptable: false,
      };
    }
    return { pattern: "reordered", detail: "same words, different order", acceptable: false };
  }

  const missing = e.filter((w) => !c.includes(w));
  const extra = c.filter((w) => !e.includes(w));
  if (missing.length && !extra.length) {
    return {
      pattern: "word-missing",
      detail: `did not use “${missing.join(", ")}”`,
      acceptable: false,
    };
  }
  if (extra.length && !missing.length) {
    return {
      pattern: "word-extra",
      detail: `used “${extra.join(", ")}” as well`,
      acceptable: false,
    };
  }
  return { pattern: "other", detail: "did not match the target sentence", acceptable: false };
}

export interface SentenceAttempt {
  expected: string;
  chosen: string;
  errorKind: string | null;
  n: number;
  students: number;
}

export interface PatternGroup {
  pattern: SyntaxPattern;
  attempts: number;
  students: number;
  acceptable: boolean;
  /** The most widespread examples, for printing verbatim. */
  examples: Array<{ expected: string; chosen: string; detail: string; n: number; students: number }>;
}

/**
 * Group a class's attempts by pattern, widest-spread first.
 *
 * `students` is summed rather than counted distinctly — the aggregate arrives
 * pre-grouped by sentence, so a student who missed two sentences counts in
 * both. The report labels this column accordingly.
 */
export function groupByPattern(attempts: SentenceAttempt[]): PatternGroup[] {
  const map = new Map<SyntaxPattern, PatternGroup>();
  for (const a of attempts) {
    const f = classifySyntax(a.expected, a.chosen);
    const g = map.get(f.pattern) ?? {
      pattern: f.pattern, attempts: 0, students: 0, acceptable: f.acceptable, examples: [],
    };
    g.attempts += a.n;
    g.students += a.students;
    g.examples.push({ expected: a.expected, chosen: a.chosen, detail: f.detail, n: a.n, students: a.students });
    map.set(f.pattern, g);
  }
  for (const g of Array.from(map.values())) {
    g.examples.sort((x, y) => y.students - x.students || y.n - x.n);
    g.examples = g.examples.slice(0, 6);
  }
  return Array.from(map.values()).sort((x, y) => y.students - x.students);
}
