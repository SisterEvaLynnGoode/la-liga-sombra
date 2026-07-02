import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

// Batch item-event ingest (Workstream A1). One POST per stage, not per click.
// Also maintains the grammar concept ledger (A3): events with skill === "grammar"
// increment concept_mastery keyed by item_key (the Dojo concept id).

const SKILLS = new Set(["vocab", "grammar", "listening", "reading", "culture", "speaking"]);
const ERROR_KINDS = new Set(["word_order", "conjugation", "agreement", "vocab", "spelling"]);
const MAX_BATCH = 100;

interface RawEvent {
  unitNumber?: number | null;
  unitId?: string | null;
  stageType?: string;
  itemKey?: string;
  skill?: string;
  correct?: boolean;
  chosen?: string | null;
  expected?: string | null;
  errorKind?: string | null;
  latencyMs?: number | null;
}

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let events: RawEvent[];
  try {
    const body = await request.json();
    events = Array.isArray(body?.events) ? body.events : [];
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  if (!events.length) return NextResponse.json({ ok: true, inserted: 0 });
  events = events.slice(0, MAX_BATCH);

  const supabase = createClient();

  // Resolve unit numbers → unit ids in one query
  const unitNumbers = Array.from(new Set(
    events.map((e) => e.unitNumber).filter((n): n is number => typeof n === "number" && n >= 1)
  ));
  const unitIdByNumber = new Map<number, string>();
  if (unitNumbers.length) {
    const { data } = await supabase.from("units").select("id, number").in("number", unitNumbers);
    for (const u of (data ?? []) as Array<{ id: string; number: number }>) {
      unitIdByNumber.set(u.number, u.id);
    }
  }

  const clean = (s: unknown, max = 200): string | null =>
    typeof s === "string" && s.trim() ? s.trim().slice(0, max) : null;

  const rows = events.flatMap((e) => {
    const stageType = clean(e.stageType, 60);
    const itemKey = clean(e.itemKey);
    const skill = typeof e.skill === "string" && SKILLS.has(e.skill) ? e.skill : null;
    if (!stageType || !itemKey || !skill || typeof e.correct !== "boolean") return [];
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const directUnitId = typeof e.unitId === "string" && UUID_RE.test(e.unitId) ? e.unitId : null;
    return [{
      student_id: session.studentId,
      unit_id: directUnitId ?? (typeof e.unitNumber === "number" ? unitIdByNumber.get(e.unitNumber) ?? null : null),
      stage_type: stageType,
      item_key: itemKey,
      skill,
      correct: e.correct,
      chosen: clean(e.chosen),
      expected: clean(e.expected),
      error_kind: typeof e.errorKind === "string" && ERROR_KINDS.has(e.errorKind) ? e.errorKind : null,
      latency_ms: typeof e.latencyMs === "number" && e.latencyMs >= 0 ? Math.round(e.latencyMs) : null,
    }];
  });

  if (!rows.length) return NextResponse.json({ ok: true, inserted: 0 });

  const { error } = await supabase.from("item_events").insert(rows);
  if (error) {
    console.error("item_events insert error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // ── Grammar concept ledger (A3) ─────────────────────────────────────────────
  const grammarTally = new Map<string, { attempts: number; correct: number }>();
  for (const r of rows) {
    if (r.skill !== "grammar") continue;
    const t = grammarTally.get(r.item_key) ?? { attempts: 0, correct: 0 };
    t.attempts += 1;
    if (r.correct) t.correct += 1;
    grammarTally.set(r.item_key, t);
  }

  if (grammarTally.size) {
    const conceptIds = Array.from(grammarTally.keys());
    const { data: existing } = await supabase
      .from("concept_mastery")
      .select("id, concept_id, attempts, correct")
      .eq("student_id", session.studentId)
      .in("concept_id", conceptIds);
    const byConcept = new Map(
      ((existing ?? []) as Array<{ id: string; concept_id: string; attempts: number; correct: number }>)
        .map((r) => [r.concept_id, r])
    );

    const nowIso = new Date().toISOString();
    for (const [conceptId, t] of Array.from(grammarTally.entries())) {
      const row = byConcept.get(conceptId);
      if (row) {
        await supabase.from("concept_mastery")
          .update({ attempts: row.attempts + t.attempts, correct: row.correct + t.correct, last_seen: nowIso })
          .eq("id", row.id);
      } else {
        await supabase.from("concept_mastery").insert({
          student_id: session.studentId,
          concept_id: conceptId,
          attempts: t.attempts,
          correct: t.correct,
          last_seen: nowIso,
        });
      }
    }
  }

  return NextResponse.json({ ok: true, inserted: rows.length });
}
