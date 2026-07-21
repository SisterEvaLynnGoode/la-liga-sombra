import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { guardAdmin, isResponse } from "@/lib/auth/teacher";

// Admin-only teacher management: see everyone who signed up (trial or paid),
// their usage, and control their access.

export async function GET() {
  const guard = await guardAdmin();
  if (isResponse(guard)) return guard;

  const supabase = createClient();
  const { data: tRows } = await supabase
    .from("teachers")
    .select("id, email, name, plan, status, trial_ends_at, is_admin, created_at")
    .order("created_at", { ascending: false });
  const teachers = (tRows as Array<{
    id: string; email: string; name: string | null; plan: string; status: string;
    trial_ends_at: string | null; is_admin: boolean; created_at: string;
  }> | null) ?? [];

  // Usage: classes + students per teacher
  const { data: cRows } = await supabase.from("classes").select("id, teacher_id");
  const classes = (cRows as Array<{ id: string; teacher_id: string | null }> | null) ?? [];
  const classIds = classes.map((c) => c.id);

  const studentsByClass = new Map<string, number>();
  if (classIds.length) {
    const { data: sRows } = await supabase.from("students").select("class_id").in("class_id", classIds);
    for (const s of (sRows as Array<{ class_id: string | null }> | null) ?? []) {
      if (s.class_id) studentsByClass.set(s.class_id, (studentsByClass.get(s.class_id) ?? 0) + 1);
    }
  }

  const now = Date.now();
  const rows = teachers.map((t) => {
    const mine = classes.filter((c) => c.teacher_id === t.id);
    const students = mine.reduce((sum, c) => sum + (studentsByClass.get(c.id) ?? 0), 0);
    const trialDaysLeft = t.trial_ends_at
      ? Math.ceil((new Date(t.trial_ends_at).getTime() - now) / 86_400_000)
      : null;
    return {
      id: t.id,
      email: t.email,
      name: t.name,
      plan: t.plan,
      status: t.status,
      isAdmin: t.is_admin,
      trialDaysLeft,
      trialExpired: trialDaysLeft !== null && trialDaysLeft <= 0,
      classes: mine.length,
      students,
      joined: t.created_at,
    };
  });

  return NextResponse.json({
    teachers: rows,
    summary: {
      total: rows.filter((r) => !r.isAdmin).length,
      onTrial: rows.filter((r) => r.plan === "trial" && !r.trialExpired && !r.isAdmin).length,
      paid: rows.filter((r) => r.plan !== "trial" && !r.isAdmin).length,
      expired: rows.filter((r) => r.trialExpired && !r.isAdmin).length,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const guard = await guardAdmin();
  if (isResponse(guard)) return guard;

  const { teacherId, action, days } = await request.json() as {
    teacherId?: string; action?: "activate" | "deactivate" | "upgrade" | "extend_trial"; days?: number;
  };
  if (!teacherId || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = createClient();

  // Never let an admin lock themselves out
  const { data: target } = await supabase.from("teachers").select("is_admin").eq("id", teacherId).limit(1);
  if ((target as Array<{ is_admin: boolean }> | null)?.[0]?.is_admin) {
    return NextResponse.json({ error: "Can't modify the owner account." }, { status: 400 });
  }

  const update: { status?: string; plan?: string; trial_ends_at?: string | null } = {};
  if (action === "activate") update.status = "active";
  if (action === "deactivate") update.status = "inactive";
  if (action === "upgrade") { update.plan = "teacher"; update.trial_ends_at = null; update.status = "active"; }
  if (action === "extend_trial") {
    const add = Math.min(Math.max(Math.floor(days ?? 30), 1), 365);
    update.trial_ends_at = new Date(Date.now() + add * 86_400_000).toISOString();
    update.plan = "trial";
    update.status = "active";
  }

  const { error } = await supabase.from("teachers").update(update).eq("id", teacherId);
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
