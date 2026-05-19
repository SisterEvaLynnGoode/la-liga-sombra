import { NextRequest, NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/session";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { CharacterSheet } from "@/lib/character-schema";

const CHAR_DIR = join(process.cwd(), "content", "characters");

// Map from character id → which JSON file it lives in
function fileForCharacter(unitNumber: number | undefined, id: string): string {
  if (!unitNumber) return join(CHAR_DIR, "recurring.json");
  if (id.includes("cold")) return join(CHAR_DIR, `unit-0${unitNumber}-cold.json`);
  return join(CHAR_DIR, `unit-0${unitNumber}.json`);
}

/** GET /api/teacher/characters — return all characters grouped */
export async function GET() {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Dynamic require so we always get fresh data after edits
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const allRaw = require("@/content/characters/index") as { characters: CharacterSheet[] };
    return NextResponse.json({ characters: allRaw.characters });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** PATCH /api/teacher/characters — update a single character in its JSON file */
export async function PATCH(request: NextRequest) {
  if (!(await getTeacherSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as CharacterSheet;
  const result = CharacterSheet.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid character sheet", issues: result.error.flatten() }, { status: 400 });
  }

  const updated = result.data;
  const filePath = fileForCharacter(updated.unitNumber, updated.id);

  // Read + patch the array in the file
  const raw = JSON.parse(readFileSync(filePath, "utf8")) as CharacterSheet[];
  const idx = raw.findIndex((c) => c.id === updated.id);
  if (idx === -1) {
    return NextResponse.json({ error: `Character ${updated.id} not found in ${filePath}` }, { status: 404 });
  }
  raw[idx] = updated;
  writeFileSync(filePath, JSON.stringify(raw, null, 2) + "\n", "utf8");

  return NextResponse.json({ ok: true, saved: updated.id });
}
