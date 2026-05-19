import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = request.nextUrl.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "Missing classId" }, { status: 400 });

  const supabase = createClient();
  const { data: studentsData } = await supabase
    .from("students").select("id, display_name, created_at").eq("class_id", classId);
  const students = (studentsData ?? []) as Array<{ id: string; display_name: string; created_at: string }>;

  if (!students.length) return NextResponse.json({ students: [] });

  const ids = students.map((s) => s.id);
  const [progressRes, attemptsRes, masteryRes, badgesRes, academiaRes, stakeoutRes, briefingRes] = await Promise.all([
    supabase.from("unit_progress").select("student_id, status").in("student_id", ids),
    supabase.from("attempts").select("student_id, activity_type, score, max_score, time_spent_seconds, completed_at").in("student_id", ids),
    supabase.from("mastery").select("student_id, attempts, correct").in("student_id", ids),
    supabase.from("badges").select("student_id, id").in("student_id", ids),
    supabase.from("academia_sessions").select("student_id, retry_count").in("student_id", ids),
    supabase.from("attempts").select("student_id, score, max_score").in("student_id", ids).eq("activity_type", "stakeout").eq("max_score", 90),
    supabase.from("daily_briefings").select("student_id, briefing_date, completed, skipped").in("student_id", ids).order("briefing_date", { ascending: false }).limit(ids.length * 35),
  ]);

  const progress         = (progressRes.data  ?? []) as Array<{ student_id: string; status: string }>;
  const attempts         = (attemptsRes.data  ?? []) as Array<{ student_id: string; activity_type: string; score: number; max_score: number; time_spent_seconds: number; completed_at: string }>;
  const mastery          = (masteryRes.data   ?? []) as Array<{ student_id: string; attempts: number; correct: number }>;
  const badges           = (badgesRes.data    ?? []) as Array<{ student_id: string; id: string }>;
  const academiaSessions = (academiaRes.data  ?? []) as Array<{ student_id: string; retry_count: number }>;
  const stakeoutRows     = (stakeoutRes.data  ?? []) as Array<{ student_id: string; score: number; max_score: number }>;
  const briefingRows     = (briefingRes.data  ?? []) as Array<{ student_id: string; briefing_date: string; completed: boolean; skipped: boolean }>;

  const result = students.map((s) => {
    const myProgress  = progress.filter((p) => p.student_id === s.id);
    const myAttempts  = attempts.filter((a) => a.student_id === s.id);
    const myMastery   = mastery.filter((m) => m.student_id === s.id);
    const myStakeouts = stakeoutRows.filter((r) => r.student_id === s.id);

    const unitsCompleted = myProgress.filter((p) => p.status === "completed").length;
    const totalTimeSeconds = myAttempts.reduce((sum, a) => sum + a.time_spent_seconds, 0);

    const lastAttempt = myAttempts.reduce<string | null>((latest, a) => {
      if (!latest || a.completed_at > latest) return a.completed_at;
      return latest;
    }, null);

    const totalAttempts = myMastery.reduce((s, m) => s + m.attempts, 0);
    const totalCorrect = myMastery.reduce((s, m) => s + m.correct, 0);
    const masteryPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    // Academia retries
    const myAcademia = academiaSessions.filter((a) => a.student_id === s.id);
    const totalAcademiaRetries = myAcademia.reduce((sum, a) => sum + (a.retry_count ?? 0), 0);

    // Stakeout performance
    const stakeoutPassed  = myStakeouts.filter((r) => r.score > 0).length;
    const stakeoutAvgTime = myStakeouts.length
      ? Math.round(myStakeouts.reduce((sum, r) => sum + r.score, 0) / myStakeouts.length)
      : null;

    // Daily briefing streak
    const myBriefings = briefingRows.filter((b) => b.student_id === s.id);
    const completedDates = myBriefings.filter((b) => b.completed).map((b) => b.briefing_date);
    const briefingStreakCount = (() => {
      const unique = Array.from(new Set(completedDates)).sort().reverse();
      let streak = 0;
      const todayS = new Date().toISOString().slice(0, 10);
      let check = todayS;
      for (const d of unique) {
        if (d === check) {
          streak++;
          const dt = new Date(check); dt.setUTCDate(dt.getUTCDate() - 1);
          check = dt.toISOString().slice(0, 10);
        } else if (d < check) break;
      }
      return streak;
    })();
    const briefingSkips = myBriefings.filter((b) => b.skipped).length;
    const briefingTotal = myBriefings.length;

    // Training metrics
    const myTraining = myAttempts.filter((a) => a.activity_type.startsWith("training_"));
    const trainingMinutesWeek = (() => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString();
      return Math.round(
        myTraining
          .filter((a) => a.completed_at >= weekAgoStr)
          .reduce((sum, a) => sum + a.time_spent_seconds, 0) / 60
      );
    })();
    const trainingDrillsTotal = myTraining.length;
    // Training streak
    const trainingDatesSet = new Set(myTraining.map((a) => a.completed_at.slice(0, 10)));
    const trainingDates = Array.from(trainingDatesSet).sort().reverse();
    let trainingStreak = 0;
    const todayStr = new Date().toISOString().slice(0, 10);
    let check = todayStr;
    for (const d of trainingDates) {
      if (d === check) {
        trainingStreak++;
        const dt = new Date(check); dt.setUTCDate(dt.getUTCDate() - 1);
        check = dt.toISOString().slice(0, 10);
      } else if (d < check) break;
    }

    return {
      id: s.id,
      displayName: s.display_name,
      joinedAt: s.created_at,
      unitsCompleted,
      totalTimeSeconds,
      lastActive: lastAttempt,
      masteryPct,
      badgeCount: badges.filter((b) => b.student_id === s.id).length,
      academiaRetries: totalAcademiaRetries,
      academiaSessions: myAcademia.length,
      stakeoutAttempts: myStakeouts.length,
      stakeoutPassed,
      stakeoutAvgTime,
      trainingMinutesWeek,
      trainingDrillsTotal,
      trainingStreak,
      briefingStreak:  briefingStreakCount,
      briefingSkips,
      briefingTotal,
    };
  });

  return NextResponse.json({ students: result });
}
