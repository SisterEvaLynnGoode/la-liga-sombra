import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CAN_DO } from "@/lib/can-do";

// Can-do self-assessment submit (Workstream B4). Upserts one row per statement
// so a replayed case simply refreshes the student's self-rating.

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { unitNumber, ratings } = await request.json() as {
    unitNumber?: number;
    ratings?: Array<{ index: number; rating: number }>;
  };

  if (typeof unitNumber !== "number" || !Array.isArray(ratings) || !ratings.length) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const statements = CAN_DO[unitNumber];
  if (!statements) return NextResponse.json({ error: "Unknown unit" }, { status: 400 });

  const supabase = createClient();
  const { data: unitRows } = await supabase.from("units").select("id").eq("number", unitNumber).limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!unitId) return NextResponse.json({ error: "Unknown unit" }, { status: 400 });

  const rows = ratings
    .filter((r) => Number.isInteger(r.index) && r.index >= 0 && r.index < statements.length &&
                   Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 3)
    .map((r) => ({
      student_id: session.studentId,
      unit_id: unitId,
      statement_index: r.index,
      statement: statements[r.index],
      rating: r.rating,
      created_at: new Date().toISOString(),
    }));

  if (!rows.length) return NextResponse.json({ error: "No valid ratings" }, { status: 400 });

  const { error } = await supabase
    .from("can_do_ratings")
    .upsert(rows, { onConflict: "student_id,unit_id,statement_index" });

  if (error) {
    console.error("can_do_ratings upsert error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
