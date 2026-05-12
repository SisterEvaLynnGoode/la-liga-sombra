import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateClassCode } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const { teacherName, periodName } = await request.json();

  if (!teacherName?.trim() || !periodName?.trim()) {
    return NextResponse.json({ error: "Teacher name and period name are required." }, { status: 400 });
  }

  const supabase = createClient();

  // Generate a unique class code (retry on collision)
  let classCode = "";
  for (let i = 0; i < 10; i++) {
    const candidate = generateClassCode();
    const { data } = await supabase
      .from("classes")
      .select("id")
      .eq("class_code", candidate)
      .maybeSingle();
    if (!data) { classCode = candidate; break; }
  }

  if (!classCode) {
    return NextResponse.json({ error: "Could not generate a unique code. Try again." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("classes")
    .insert({ class_code: classCode, teacher_name: teacherName.trim(), period_name: periodName.trim() })
    .select()
    .single();

  if (error) {
    console.error("Class insert error:", error);
    return NextResponse.json({ error: "Could not create class." }, { status: 500 });
  }

  return NextResponse.json({ classCode: data.class_code, id: data.id });
}

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, class_code, teacher_name, period_name, created_at, students(id)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Could not fetch classes." }, { status: 500 });

  const classes = (data ?? []).map((c) => ({
    id: c.id,
    class_code: c.class_code,
    teacher_name: c.teacher_name,
    period_name: c.period_name,
    created_at: c.created_at,
    student_count: Array.isArray(c.students) ? c.students.length : 0,
  }));

  return NextResponse.json({ classes });
}
