/**
 * Item-level event logging — client-side queue + error taxonomy.
 *
 * Components call `logItemEvent()` once per answered item; events are batched
 * and flushed to POST /api/game/item-event (one network call per ~dozen answers,
 * plus a keepalive flush when the tab hides). Fire-and-forget: logging must
 * never break gameplay, so every path swallows errors.
 */

export type Skill = "vocab" | "grammar" | "listening" | "reading" | "culture" | "speaking";
export type ErrorKind = "word_order" | "conjugation" | "agreement" | "vocab" | "spelling";

export interface ItemEventInput {
  /** Unit number (1–10). The server resolves it to units.id; omit for training-room drills. */
  unitNumber?: number | null;
  /** Direct units.id uuid — use when the component has it instead of the number. */
  unitId?: string | null;
  /** Stage/context, e.g. "vocabMatch", "sentenceBuilder", "academia-produccion", "dojo". */
  stageType: string;
  /** The thing being tested: a vocab term, grammar concept id, or question id. */
  itemKey: string;
  skill: Skill;
  correct: boolean;
  /** What the student picked/typed (null for untracked inputs). */
  chosen?: string | null;
  expected?: string | null;
  errorKind?: ErrorKind | null;
  latencyMs?: number | null;
}

// ── Queue ──────────────────────────────────────────────────────────────────────

const queue: ItemEventInput[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_SIZE = 12;
const FLUSH_DELAY_MS = 4000;
const ENDPOINT = "/api/game/item-event";

function send(events: ItemEventInput[], useBeacon: boolean) {
  if (!events.length) return;
  const body = JSON.stringify({ events });
  try {
    if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
    } else {
      void fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // never let logging break gameplay
  }
}

/** Flush the queue now. Pass useBeacon=true from pagehide handlers. */
export function flushItemEvents(useBeacon = false) {
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
  if (!queue.length) return;
  send(queue.splice(0, queue.length), useBeacon);
}

/** Queue one item event; batches are flushed automatically. */
export function logItemEvent(ev: ItemEventInput) {
  queue.push(ev);
  if (queue.length >= FLUSH_SIZE) {
    flushItemEvents();
    return;
  }
  if (!flushTimer) {
    flushTimer = setTimeout(() => { flushTimer = null; flushItemEvents(); }, FLUSH_DELAY_MS);
  }
}

// Flush pending events when the tab is hidden/closed (Chromebook lid shuts, etc.)
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushItemEvents(true);
  });
}

// ── Error taxonomy (A4) ────────────────────────────────────────────────────────

function stripDiacriticsLower(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function tokens(s: string): string[] {
  return stripDiacriticsLower(s).replace(/[.,;:!?¿¡"'()]/g, " ").split(/\s+/).filter(Boolean);
}

function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

const AGREEMENT_ENDINGS: Array<[string, string]> = [
  ["o", "a"], ["a", "o"], ["os", "as"], ["as", "os"],
  ["o", "os"], ["a", "as"], ["os", "o"], ["as", "a"],
];

/** Two words that share a stem but differ in a gender/number ending. */
function isAgreementSlip(expected: string, chosen: string): boolean {
  for (const [e1, e2] of AGREEMENT_ENDINGS) {
    if (expected.endsWith(e1) && chosen.endsWith(e2) &&
        expected.slice(0, -e1.length) === chosen.slice(0, -e2.length) &&
        expected.length - e1.length >= 2) {
      return true;
    }
  }
  return false;
}

/** Two words that share a verb-like stem but differ in the conjugated ending. */
function isConjugationSlip(expected: string, chosen: string): boolean {
  const stemLen = Math.min(expected.length, chosen.length, Math.max(3, Math.floor(expected.length * 0.6)));
  if (stemLen < 3) return false;
  return expected.slice(0, stemLen) === chosen.slice(0, stemLen) && expected !== chosen;
}

/**
 * Classify a wrong answer against the expected one. Pure heuristic — no network,
 * deterministic, cheap. Sentence-level first (word order), then word-level.
 */
export function classifyError(expected: string, chosen: string): ErrorKind {
  const expT = tokens(expected);
  const choT = tokens(chosen);

  // Same words, different order → word order
  if (expT.length > 1 &&
      expT.length === choT.length &&
      [...expT].sort().join(" ") === [...choT].sort().join(" ") &&
      expT.join(" ") !== choT.join(" ")) {
    return "word_order";
  }

  // Word-level: find the first mismatched pair and classify it
  const PRONOUNS = new Set(["yo", "tu", "el", "ella", "usted", "nosotros", "nosotras", "vosotros", "vosotras", "ellos", "ellas", "ustedes", "vos"]);
  const n = Math.min(expT.length, choT.length);
  for (let i = 0; i < n; i++) {
    if (expT[i] === choT[i]) continue;
    const e = expT[i], c = choT[i];
    // An o↔a ending swap right after a subject pronoun is a verb-ending slip
    // (yo hablo → yo habla), not gender agreement (alta → alto).
    const afterPronoun = i > 0 && PRONOUNS.has(expT[i - 1]);
    if (afterPronoun && isConjugationSlip(e, c)) return "conjugation";
    if (isAgreementSlip(e, c)) return "agreement";
    if (isConjugationSlip(e, c)) return "conjugation";
    if (editDistance(e, c) <= 2 && Math.max(e.length, c.length) >= 4) return "spelling";
    return "vocab";
  }

  // Length mismatch with a common prefix → missing/extra word ≈ vocab choice
  return "vocab";
}
