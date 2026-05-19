import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { GRAMMAR_CONCEPTS, type VocabDrillItem } from "@/lib/personalized-drills";

// ── Unit content loader ────────────────────────────────────────────────────────
function loadUnit(n: number): { vocab: Array<{ spanish: string; english: string; audio?: string }> } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@/content/unit-0${n}.json`);
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require(`@/content/unit-${n}.json`);
    } catch {
      return null;
    }
  }
}

// ── Streak computation ─────────────────────────────────────────────────────────
function computeStreak(dates: string[]): number {
  const unique = Array.from(new Set(dates)).sort().reverse(); // newest first
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let check = today;
  for (const d of unique) {
    if (d === check) {
      streak++;
      const dt = new Date(check);
      dt.setUTCDate(dt.getUTCDate() - 1);
      check = dt.toISOString().slice(0, 10);
    } else if (d < check) break;
  }
  return streak;
}

export async function GET() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient();

  // 1. Unlocked unit numbers
  const { data: progressRows } = await supabase
    .from("unit_progress")
    .select("unit_id, status")
    .eq("student_id", session.studentId)
    .neq("status", "locked");

  const unlockedUnitIds = (progressRows ?? []).map((r: { unit_id: string }) => r.unit_id);

  const { data: unitRows } = await supabase
    .from("units").select("id, number")
    .in("id", unlockedUnitIds.length ? unlockedUnitIds : ["__none__"])
    .order("number");

  const unlockedNums = (unitRows ?? []).map((r: { id: string; number: number }) => r.number);

  // 2. All vocab from unlocked units + term→unit map
  const termToUnit: Record<string, number> = {};
  const allVocab: Array<{ spanish: string; english: string; audio?: string; unitNumber: number }> = [];
  for (const num of unlockedNums) {
    const content = loadUnit(num);
    if (!content) continue;
    for (const v of content.vocab) {
      if (!termToUnit[v.spanish]) {
        termToUnit[v.spanish] = num;
        allVocab.push({ ...v, unitNumber: num });
      }
    }
  }

  // 3. Mastery data
  const { data: masteryRows } = await supabase
    .from("mastery")
    .select("vocab_term, attempts, correct")
    .eq("student_id", session.studentId);

  const masteryMap = new Map<string, { attempts: number; correct: number }>(
    (masteryRows ?? []).map((r: { vocab_term: string; attempts: number; correct: number }) => [
      r.vocab_term,
      { attempts: r.attempts, correct: r.correct },
    ])
  );

  // 4. Build VocabDrillItem list
  const drillItems: VocabDrillItem[] = allVocab.map((v) => {
    const m = masteryMap.get(v.spanish);
    return {
      spanish: v.spanish,
      english: v.english,
      audio: v.audio,
      unitNumber: v.unitNumber,
      attempts: m?.attempts ?? 0,
      accuracy: m && m.attempts > 0 ? m.correct / m.attempts : -1,
    };
  });

  // 5. Categorise terms
  const masteredTerms  = drillItems.filter((d) => d.accuracy >= 0.85 && d.attempts >= 5);
  const strugglingTerms = drillItems.filter((d) => d.accuracy !== -1 && d.accuracy < 0.6 && d.attempts >= 3);

  // 6. Attempts data (grammar accuracy + stakeout + today's training time)
  const { data: attemptRows } = await supabase
    .from("attempts")
    .select("unit_id, activity_type, score, max_score, time_spent_seconds, completed_at")
    .eq("student_id", session.studentId);

  const attempts = (attemptRows ?? []) as Array<{
    unit_id: string;
    activity_type: string;
    score: number;
    max_score: number;
    time_spent_seconds: number;
    completed_at: string;
  }>;

  // Grammar concept accuracy (approximate from unit-level attempts)
  const unitIdByNum = new Map((unitRows ?? []).map((r: { id: string; number: number }) => [r.number, r.id]));
  const grammarAccuracy: Record<string, number | null> = {};
  for (const concept of GRAMMAR_CONCEPTS) {
    if (!concept.unitNumbers.some((n) => unlockedNums.includes(n))) {
      grammarAccuracy[concept.id] = null; // not yet unlocked
      continue;
    }
    const ids = concept.unitNumbers.map((n) => unitIdByNum.get(n)).filter(Boolean) as string[];
    const rel = attempts.filter(
      (a) => ids.includes(a.unit_id) && ["vocab_match", "grammar"].includes(a.activity_type) && a.max_score > 0
    );
    grammarAccuracy[concept.id] = rel.length
      ? Math.round((rel.reduce((s, a) => s + a.score / a.max_score, 0) / rel.length) * 100)
      : null;
  }

  // Stakeout best times per unit
  const stakeoutBests: Array<{ unitNumber: number; timeRemaining: number }> = [];
  for (const num of unlockedNums) {
    const uid = unitIdByNum.get(num);
    if (!uid) continue;
    const rows = attempts.filter(
      (a) => a.unit_id === uid && a.activity_type === "stakeout" && a.max_score === 90 && a.score > 0
    );
    if (rows.length) {
      stakeoutBests.push({ unitNumber: num, timeRemaining: Math.max(...rows.map((r) => r.score)) });
    }
  }

  // Today's training minutes
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTrainingSeconds = attempts
    .filter((a) => a.activity_type.startsWith("training_") && a.completed_at.startsWith(todayStr))
    .reduce((s, a) => s + a.time_spent_seconds, 0);

  // Training streak
  const trainingDates = attempts
    .filter((a) => a.activity_type.startsWith("training_"))
    .map((a) => a.completed_at.slice(0, 10));
  const trainingStreak = computeStreak(trainingDates);

  // Today's unique terms practiced (for progress display)
  const todayDrills = attempts.filter(
    (a) => a.activity_type.startsWith("training_") && a.completed_at.startsWith(todayStr)
  ).length;

  // 7. Badges
  const { data: badgeRows } = await supabase
    .from("badges")
    .select("badge_type, unit_id, earned_at")
    .eq("student_id", session.studentId);

  return NextResponse.json({
    drillItems,
    masteredTerms,
    strugglingTerms,
    termToUnit,
    unlockedUnitNumbers: unlockedNums,
    grammarConcepts: GRAMMAR_CONCEPTS.map((c) => ({
      id: c.id,
      labelEs: c.labelEs,
      labelEn: c.labelEn,
      unitNumbers: c.unitNumbers,
      unlocked: c.unitNumbers.some((n) => unlockedNums.includes(n)),
      accuracy: grammarAccuracy[c.id] ?? null,
    })),
    stakeoutBests,
    badges: badgeRows ?? [],
    todayTrainingMinutes: Math.round(todayTrainingSeconds / 60),
    trainingStreak,
    todayDrills,
    totalMastered: masteredTerms.length,
  });
}
