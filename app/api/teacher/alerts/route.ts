import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, message } = await request.json() as { classId: string; message: string };
  if (!classId || !message?.trim()) {
    return NextResponse.json({ error: "classId and message required" }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase.from("class_alerts").insert({ class_id: classId, message: message.trim() });
  if (error) return NextResponse.json({ error: "Failed to send alert" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
