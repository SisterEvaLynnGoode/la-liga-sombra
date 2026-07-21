import { NextRequest, NextResponse } from "next/server";
import { guardClass, isResponse } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { classId, message } = await request.json() as { classId: string; message: string };
  const guard = await guardClass(classId);
  if (isResponse(guard)) return guard;
  if (!classId || !message?.trim()) {
    return NextResponse.json({ error: "classId and message required" }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase.from("class_alerts").insert({ class_id: classId, message: message.trim() });
  if (error) return NextResponse.json({ error: "Failed to send alert" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
