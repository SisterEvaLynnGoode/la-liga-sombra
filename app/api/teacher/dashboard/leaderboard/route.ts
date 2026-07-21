import { NextRequest, NextResponse } from "next/server";
import { guardClass, isResponse } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {

  const classId = request.nextUrl.searchParams.get("classId") ?? "";
  const period = request.nextUrl.searchParams.get("period") ?? "all"; // "week" | "all"
  const guard = await guardClass(classId);
  if (isResponse(guard)) return guard;

  const supabase = createClient();
  const { data: studentsData } = await supabase.from("students").select("id, display_name").eq("class_id", classId);
  const students = (studentsData ?? []) as Array<{ id: string; display_name: string }>;
  if (!students.length) return NextResponse.json({ byCasesSolved: [], byBadges: [], byMastery: [] });

  const ids = students.map((s) => s.id);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  let badgesQuery = supabase.from("badges").select("student_id, badge_type, earned_at").in("student_id", ids);
  if (period === "week") badgesQuery = badgesQuery.gte("earned_at", weekAgo);

  const [badgesRes, masteryRes] = await Promise.all([
    badgesQuery,
    supabase.from("mastery").select("student_id, attempts, correct").in("student_id", ids),
  ]);

  const badges = (badgesRes.data ?? []) as Array<{ student_id: string; badge_type: string; earned_at: string }>;
  const mastery = (masteryRes.data ?? []) as Array<{ student_id: string; attempts: number; correct: number }>;

  // By cases solved
  const caseCountMap = new Map<string, number>();
  for (const b of badges.filter((b) => b.badge_type === "case_solved")) {
    caseCountMap.set(b.student_id, (caseCountMap.get(b.student_id) ?? 0) + 1);
  }
  const byCasesSolved = students
    .map((s) => ({ id: s.id, displayName: s.display_name, count: caseCountMap.get(s.id) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // By total badges
  const badgeCountMap = new Map<string, number>();
  for (const b of badges) {
    badgeCountMap.set(b.student_id, (badgeCountMap.get(b.student_id) ?? 0) + 1);
  }
  const byBadges = students
    .map((s) => ({ id: s.id, displayName: s.display_name, count: badgeCountMap.get(s.id) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // By mastery %
  const masteryMap = new Map<string, { total: number; correct: number }>();
  for (const m of mastery) {
    const cur = masteryMap.get(m.student_id) ?? { total: 0, correct: 0 };
    masteryMap.set(m.student_id, { total: cur.total + m.attempts, correct: cur.correct + m.correct });
  }
  const byMastery = students
    .map((s) => {
      const d = masteryMap.get(s.id) ?? { total: 0, correct: 0 };
      return { id: s.id, displayName: s.display_name, masteryPct: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0 };
    })
    .sort((a, b) => b.masteryPct - a.masteryPct)
    .slice(0, 10);

  return NextResponse.json({ byCasesSolved, byBadges, byMastery });
}
