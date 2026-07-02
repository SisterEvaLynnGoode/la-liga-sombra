import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

// "Informe del detective" — free-writing capture at case end, Unit 6+ (B3).
// Teacher-reviewed, never auto-graded.

const MAX_LEN = 600;

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { unitNumber, text } = await request.json() as { unitNumber?: number; text?: string };
  const clean = typeof text === "string" ? text.trim().slice(0, MAX_LEN) : "";
  if (typeof unitNumber !== "number" || !clean) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: unitRows } = await supabase.from("units").select("id").eq("number", unitNumber).limit(1);
  const unitId = (unitRows as Array<{ id: string }> | null)?.[0]?.id;
  if (!unitId) return NextResponse.json({ error: "Unknown unit" }, { status: 400 });

  const { error } = await supabase.from("field_reports").insert({
    student_id: session.studentId,
    unit_id: unitId,
    report_text: clean,
  });

  if (error) {
    console.error("field_reports insert error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
