/**
 * GET /api/characters/manifest — the portrait list students' screens use.
 *
 * Portraits used to be resolved from the static public/images/characters/
 * manifest.json, which meant a teacher rejecting a portrait changed nothing
 * for students until someone edited that file and redeployed. This serves the
 * same list with the teacher's review state from the database layered on top,
 * so "needs-regen" takes a portrait off students' screens straight away.
 *
 * The manifest is a static import (never a runtime read of public/ — that makes
 * Next's tracer bundle 140 MB of portraits and the deploy fails).
 *
 * No session required: it exposes nothing beyond the file that is already
 * served publicly, and the student game fetches it before anyone logs in on a
 * cold cache. Cached at the edge so a class of thirty is one origin request.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ManifestEntry } from "@/scripts/generate-images/generate";
import manifestJson from "../../../../public/images/characters/manifest.json";

const BASE = manifestJson as ManifestEntry[];

export async function GET() {
  let overrides: Array<{ character_id: string; status: string | null }> = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("character_overrides")
      .select("character_id, status")
      .not("status", "is", null);
    overrides = (data ?? []) as Array<{ character_id: string; status: string | null }>;
  } catch {
    // Fail open: a database hiccup must not blank every portrait mid-class.
  }

  const statusById = new Map(overrides.filter((o) => o.status).map((o) => [o.character_id, o.status!]));

  const entries = BASE.map((e) => ({
    characterId: e.characterId,
    publicUrl: e.publicUrl,
    version: e.timestamp,
    status: statusById.get(e.characterId) ?? e.status,
  }));

  return NextResponse.json(
    { entries },
    {
      headers: {
        // A rejection should reach the room quickly, but not cost an origin
        // request per portrait per student.
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
