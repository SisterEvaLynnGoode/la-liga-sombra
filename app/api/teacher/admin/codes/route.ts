import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { guardAdmin, isResponse } from "@/lib/auth/teacher";

// Admin-only redemption-code management (owner mints codes to sell on TpT).
function makeCode(): string {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars
  const block = () => Array.from({ length: 4 }, () => A[crypto.randomInt(A.length)]).join("");
  return `LLS-${block()}-${block()}`;
}

export async function GET() {
  const guard = await guardAdmin();
  if (isResponse(guard)) return guard;

  const supabase = createClient();
  const { data } = await supabase
    .from("redemption_codes")
    .select("id, code, plan, note, redeemed_at, created_at, redeemed_by_teacher_id")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (data ?? []) as Array<{ id: string; code: string; plan: string; note: string | null; redeemed_at: string | null; created_at: string; redeemed_by_teacher_id: string | null }>;

  // Attach redeemer email for redeemed codes
  const teacherIds = Array.from(new Set(rows.map((r) => r.redeemed_by_teacher_id).filter(Boolean))) as string[];
  const emailById = new Map<string, string>();
  if (teacherIds.length) {
    const { data: tRows } = await supabase.from("teachers").select("id, email").in("id", teacherIds);
    for (const t of (tRows as Array<{ id: string; email: string }> | null) ?? []) emailById.set(t.id, t.email);
  }

  return NextResponse.json({
    codes: rows.map((r) => ({
      code: r.code,
      plan: r.plan,
      note: r.note,
      redeemed: !!r.redeemed_at,
      redeemedBy: r.redeemed_by_teacher_id ? emailById.get(r.redeemed_by_teacher_id) ?? null : null,
      createdAt: r.created_at,
    })),
    unredeemed: rows.filter((r) => !r.redeemed_at).length,
  });
}

export async function POST(request: NextRequest) {
  const guard = await guardAdmin();
  if (isResponse(guard)) return guard;

  const { count, note, plan } = await request.json() as { count?: number; note?: string; plan?: string };
  const n = Math.min(Math.max(Math.floor(count ?? 1), 1), 100);

  const supabase = createClient();
  const rows = Array.from({ length: n }, () => ({
    code: makeCode(),
    plan: (plan ?? "teacher").trim() || "teacher",
    note: (note ?? "").trim() || null,
  }));

  const { data, error } = await supabase.from("redemption_codes").insert(rows).select("code");
  if (error) {
    console.error("mint codes error:", error);
    return NextResponse.json({ error: "Could not mint codes. Try again." }, { status: 500 });
  }
  return NextResponse.json({ codes: (data as Array<{ code: string }>).map((d) => d.code) });
}
