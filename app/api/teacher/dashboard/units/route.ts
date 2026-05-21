import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

// ── ACTFL mode mapping ────────────────────────────────────────────────────────
// Maps internal activity_type values → ACTFL Communication Mode
const ACTFL_MODE: Record<string, string> = {
  listening:             "interpretive_listening",
  stakeout:             "interpretive_listening",
  reading:              "interpretive_reading",
  dialogue:             "interpersonal",
  vocab_match:          "linguistic",
  academia_recognition: "linguistic",
  academia_memorization:"linguistic",
  academia_production:  "linguistic",
  lineup:               "interpretive_synthesis",
  cultural:             "cultures",
  sentence_builder:     "presentational",
};

// Novice-level proficiency bands (by per-student avg ratio)
function toBand(ratio: number): "exceeds" | "meets" | "approaching" | "novice_low" {
  if (ratio >= 0.85) return "exceeds";
  if (ratio >= 0.75) return "meets";
  if (ratio >= 0.60) return "approaching";
  return "novice_low";
}

function bandDistribution(studentAvgs: number[]) {
  const bands = { exceeds: 0, meets: 0, approaching: 0, novice_low: 0 };
  for (const s of studentAvgs) bands[toBand(s)]++;
  return bands;
}

export async function GET(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = request.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "Missing classId" }, { status: 400 });

  const supabase = createClient();
  const { data: studentsData } = await supabase.from("students").select("id").eq("class_id", classId);
  const studentIds = (studentsData as Array<{ id: string }> | null)?.map((s) => s.id) ?? [];
  const totalStudents = studentIds.length;

  const FLAG_TYPES = [
    "needs_listening_support", "transcript_revealed", "listening_skipped",
    "academia_skipped_after_failure", "help_requested", "stage_skipped",
    "repeated_skipping", "academia_struggling",
  ];

  const [progressRes, attemptsRes, masteryRes, unitsRes, academiaRes, flagsRes] = await Promise.all([
    studentIds.length
      ? supabase.from("unit_progress")
          .select("student_id, unit_id, status, cold_case_completed_at")
          .in("student_id", studentIds)
      : Promise.resolve({ data: [] }),
    // ← now includes student_id so we can compute per-student band distributions
    studentIds.length
      ? supabase.from("attempts")
          .select("student_id, unit_id, activity_type, score, max_score")
          .in("student_id", studentIds)
      : Promise.resolve({ data: [] }),
    studentIds.length
      ? supabase.from("mastery")
          .select("student_id, vocab_term, attempts, correct")
          .in("student_id", studentIds)
      : Promise.resolve({ data: [] }),
    supabase.from("units").select("id, number, country, title_es").order("number"),
    studentIds.length
      ? supabase.from("academia_sessions")
          .select("student_id, unit_id, routing_tier, passed_first_try, retry_count, advanced_without_passing")
          .in("student_id", studentIds)
      : Promise.resolve({ data: [] }),
    studentIds.length
      ? supabase.from("student_flags")
          .select("student_id, unit_id, flag_type")
          .in("student_id", studentIds)
          .in("flag_type", FLAG_TYPES)
          .is("resolved_at", null)
      : Promise.resolve({ data: [] }),
  ]);

  const progress = (progressRes.data ?? []) as Array<{
    student_id: string; unit_id: string; status: string; cold_case_completed_at?: string | null;
  }>;
  const attempts = (attemptsRes.data ?? []) as Array<{
    student_id: string; unit_id: string; activity_type: string; score: number; max_score: number;
  }>;
  const mastery = (masteryRes.data ?? []) as Array<{
    student_id: string; vocab_term: string; attempts: number; correct: number;
  }>;
  const units = (unitsRes.data ?? []) as Array<{ id: string; number: number; country: string; title_es: string }>;
  const academiaSessions = (academiaRes.data ?? []) as Array<{
    student_id: string; unit_id: string; routing_tier: string;
    passed_first_try?: boolean; retry_count?: number; advanced_without_passing?: boolean;
  }>;
  const flags = (flagsRes.data ?? []) as Array<{ student_id: string; unit_id: string; flag_type: string }>;

  const result = units.map((u) => {
    const unitProgress = progress.filter((p) => p.unit_id === u.id);
    const unitAttempts = attempts.filter((a) => a.unit_id === u.id && a.max_score > 0);

    const completionCount = unitProgress.filter((p) => p.status === "completed").length;
    const inProgressCount = unitProgress.filter((p) => p.status === "in_progress").length;

    // ── ACTFL mode band distributions ──────────────────────────────────────
    // Accumulate per-student ratios per mode
    const studentModeAccum = new Map<string, Map<string, number[]>>(); // studentId → mode → [ratios]
    for (const a of unitAttempts) {
      const mode = ACTFL_MODE[a.activity_type];
      if (!mode) continue;
      if (!studentModeAccum.has(a.student_id)) studentModeAccum.set(a.student_id, new Map());
      const sm = studentModeAccum.get(a.student_id)!;
      if (!sm.has(mode)) sm.set(mode, []);
      sm.get(mode)!.push(a.score / a.max_score);
    }

    // Collapse to per-mode student avg → band distribution
    const modeData: Record<string, {
      bands: { exceeds: number; meets: number; approaching: number; novice_low: number };
      avgScore: number;
      studentsAssessed: number;
    }> = {};

    const modesPresent = new Set<string>();
    for (const a of unitAttempts) {
      const mode = ACTFL_MODE[a.activity_type];
      if (mode) modesPresent.add(mode);
    }

    for (const mode of Array.from(modesPresent)) {
      const studentAvgs: number[] = [];
      for (const [, modeMap] of Array.from(studentModeAccum)) {
        const scores = modeMap.get(mode);
        if (scores && scores.length > 0) {
          studentAvgs.push(scores.reduce((a, b) => a + b, 0) / scores.length);
        }
      }
      if (studentAvgs.length === 0) continue;
      modeData[mode] = {
        bands: bandDistribution(studentAvgs),
        avgScore: Math.round((studentAvgs.reduce((a, b) => a + b, 0) / studentAvgs.length) * 100),
        studentsAssessed: studentAvgs.length,
      };
    }

    // ── Vocabulary mastery buckets ──────────────────────────────────────────
    const termMap = new Map<string, { totalAttempts: number; totalCorrect: number }>();
    for (const m of mastery) {
      if (m.attempts === 0) continue;
      const cur = termMap.get(m.vocab_term) ?? { totalAttempts: 0, totalCorrect: 0 };
      termMap.set(m.vocab_term, {
        totalAttempts: cur.totalAttempts + m.attempts,
        totalCorrect:  cur.totalCorrect  + m.correct,
      });
    }
    const vocabTerms = Array.from(termMap.entries()).map(([term, { totalAttempts, totalCorrect }]) => ({
      term,
      masteryPct: Math.round((totalCorrect / totalAttempts) * 100),
    }));

    const vocabMastered  = vocabTerms.filter((v) => v.masteryPct >= 80).length;
    const vocabEmerging  = vocabTerms.filter((v) => v.masteryPct >= 60 && v.masteryPct < 80).length;
    const vocabStruggling = vocabTerms.filter((v) => v.masteryPct < 60).length;
    const hardestVocab   = vocabTerms.sort((a, b) => a.masteryPct - b.masteryPct).slice(0, 5);

    // ── Academia stats ──────────────────────────────────────────────────────
    const unitAcademia = academiaSessions.filter((a) => a.unit_id === u.id);
    const academiaTotal          = unitAcademia.length;
    const academiaFirstTryPass   = unitAcademia.filter((a) => a.passed_first_try).length;
    const academiaAdvancedNoPass = unitAcademia.filter((a) => a.advanced_without_passing).length;
    const academiaReady          = unitAcademia.filter((a) => a.routing_tier === "ready").length;
    const academiaRecommended    = unitAcademia.filter((a) => a.routing_tier === "recommended").length;
    const academiaRequired       = unitAcademia.filter((a) => a.routing_tier === "required").length;

    // ── Support flags ───────────────────────────────────────────────────────
    const unitFlags = flags.filter((f) => f.unit_id === u.id);
    const studentsNeedingSupport  = new Set(unitFlags.map((f) => f.student_id)).size;
    const helpRequested           = new Set(unitFlags.filter((f) => f.flag_type === "help_requested").map((f) => f.student_id)).size;
    const listeningSkipped        = new Set(unitFlags.filter((f) => f.flag_type === "listening_skipped").map((f) => f.student_id)).size;
    const transcriptRevealed      = new Set(unitFlags.filter((f) => f.flag_type === "transcript_revealed").map((f) => f.student_id)).size;
    const repeatedSkipping        = new Set(unitFlags.filter((f) => f.flag_type === "repeated_skipping").map((f) => f.student_id)).size;
    const academiaStruggling      = new Set(unitFlags.filter((f) => f.flag_type === "academia_struggling").map((f) => f.student_id)).size;

    // Cold case
    const coldCaseCompletions = unitProgress.filter((p) => p.cold_case_completed_at).length;

    return {
      number: u.number,
      country: u.country,
      titleEs: u.title_es,
      completionCount,
      inProgressCount,
      totalStudents,
      coldCaseCompletions,
      modeData,
      vocab: { mastered: vocabMastered, emerging: vocabEmerging, struggling: vocabStruggling, hardest: hardestVocab, total: vocabTerms.length },
      academia: {
        total: academiaTotal,
        firstTryPassPct:    academiaTotal ? Math.round((academiaFirstTryPass   / academiaTotal) * 100) : null,
        advancedNoPassPct:  academiaTotal ? Math.round((academiaAdvancedNoPass / academiaTotal) * 100) : null,
        readyPct:           academiaTotal ? Math.round((academiaReady          / academiaTotal) * 100) : null,
        recommendedPct:     academiaTotal ? Math.round((academiaRecommended    / academiaTotal) * 100) : null,
        requiredPct:        academiaTotal ? Math.round((academiaRequired       / academiaTotal) * 100) : null,
      },
      support: {
        studentsNeedingSupport,
        helpRequested,
        listeningSkipped,
        transcriptRevealed,
        repeatedSkipping,
        academiaStruggling,
      },
    };
  });

  return NextResponse.json({ units: result });
}
