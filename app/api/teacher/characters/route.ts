/**
 * Teacher Characters API.
 *
 * This page was a laptop-only tool pretending to be part of the deployed app.
 * It read portrait review state with readFileSync("public/images/characters/
 * manifest.json") and saved a character sheet with writeFileSync into
 * content/characters/*.json. On Vercel the first returns nothing (public/ is
 * served from the static layer and is not in the function's filesystem) and the
 * second throws (read-only filesystem), so in production the gallery came up
 * empty and every save failed.
 *
 * Now:
 *   • the manifest is a STATIC import, so it is compiled into the bundle and
 *     readable anywhere. It must stay static: a dynamic read of public/ makes
 *     Next's tracer pull all 140 MB of portraits into the function and the
 *     deploy fails outright (see lib/characters/gallery.ts).
 *   • edits and approvals are stored in Supabase (character_overrides) and
 *     layered over the repo files, so a save made in class persists.
 *   • when the filesystem IS writable (a laptop), the character file is also
 *     updated, so local authoring keeps editing the repo and the image
 *     generation scripts see the change.
 */
import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { CharacterSheet } from "@/lib/character-schema";
import type { ManifestEntry } from "@/scripts/generate-images/generate";
import manifestJson from "../../../../public/images/characters/manifest.json";

const CHAR_DIR = join(process.cwd(), "content", "characters");

/** Map from character id → which JSON file it lives in. */
function fileForCharacter(unitNumber: number | undefined, id: string): string {
  if (!unitNumber) return join(CHAR_DIR, "recurring.json");
  if (id.includes("cold")) return join(CHAR_DIR, `unit-0${unitNumber}-cold.json`);
  return join(CHAR_DIR, `unit-0${unitNumber}.json`);
}

const BASE_MANIFEST = manifestJson as ManifestEntry[];

interface OverrideRow {
  character_id: string;
  sheet: CharacterSheet | null;
  status: ManifestEntry["status"] | null;
}

async function readOverrides(): Promise<OverrideRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("character_overrides")
    .select("character_id, sheet, status");
  if (error) return [];
  return (data ?? []) as unknown as OverrideRow[];
}

/** GET /api/teacher/characters — every character + the portrait manifest. */
export async function GET() {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const allRaw = require("@/content/characters/index") as { characters: CharacterSheet[] };
    const overrides = await readOverrides();
    const sheetById = new Map(overrides.filter((o) => o.sheet).map((o) => [o.character_id, o.sheet!]));
    const statusById = new Map(overrides.filter((o) => o.status).map((o) => [o.character_id, o.status!]));

    const characters = allRaw.characters.map((c) => sheetById.get(c.id) ?? c);
    const manifest = BASE_MANIFEST.map((e) =>
      statusById.has(e.characterId) ? { ...e, status: statusById.get(e.characterId)! } : e
    );

    return NextResponse.json({ characters, manifest });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** PUT — set a portrait's review status. */
export async function PUT(request: NextRequest) {
  const session = await getTeacherSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    characterId?: string;
    status?: ManifestEntry["status"];
  };
  const allowed: ManifestEntry["status"][] = ["generated", "approved", "needs-regen"];
  if (!body.characterId || !body.status || !allowed.includes(body.status)) {
    return NextResponse.json({ error: "Need a characterId and a valid status." }, { status: 400 });
  }
  if (!BASE_MANIFEST.some((e) => e.characterId === body.characterId)) {
    return NextResponse.json({ error: "No portrait with that id." }, { status: 404 });
  }

  const supabase = createClient();
  const { error } = await supabase.from("character_overrides").upsert(
    {
      character_id: body.characterId,
      status: body.status,
      updated_at: new Date().toISOString(),
      updated_by: session.teacherId,
    },
    { onConflict: "character_id" }
  );
  if (error) return NextResponse.json({ error: "Could not save that status." }, { status: 500 });

  return NextResponse.json({ ok: true, characterId: body.characterId, status: body.status });
}

/** PATCH — save an edited character sheet. */
export async function PATCH(request: NextRequest) {
  const session = await getTeacherSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const result = CharacterSheet.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid character sheet", issues: result.error.flatten() }, { status: 400 });
  }
  const updated = result.data;

  // The durable copy: works in production, survives deploys.
  const supabase = createClient();
  const { error } = await supabase.from("character_overrides").upsert(
    {
      character_id: updated.id,
      sheet: updated,
      updated_at: new Date().toISOString(),
      updated_by: session.teacherId,
    },
    { onConflict: "character_id" }
  );
  if (error) return NextResponse.json({ error: "Could not save that character." }, { status: 500 });

  // On a laptop, keep the repo file in step so the image-generation scripts and
  // git history see the same character. Read-only filesystem (production) is
  // expected and not an error.
  let wroteFile = false;
  try {
    const filePath = fileForCharacter(updated.unitNumber, updated.id);
    const raw = JSON.parse(readFileSync(filePath, "utf8")) as CharacterSheet[];
    const idx = raw.findIndex((c) => c.id === updated.id);
    if (idx !== -1) {
      raw[idx] = updated;
      writeFileSync(filePath, JSON.stringify(raw, null, 2) + "\n", "utf8");
      wroteFile = true;
    }
  } catch {
    /* production: saved to the database only */
  }

  return NextResponse.json({ ok: true, saved: updated.id, wroteFile });
}
