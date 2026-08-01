/**
 * Character gallery index.
 *
 * Built by scanning the content files for every character who has portrait art,
 * so the gallery cannot drift from the game: if a case gains a suspect, the
 * gallery gains a card, and if a portrait is missing the gallery says so out
 * loud instead of rendering a hole.
 */

import fs from "fs";
import path from "path";

export interface GalleryCharacter {
  slug: string;
  name: string;
  realName?: string;
  age?: number;
  role?: string;
  imageUrl: string | null;
  /** True when the file behind imageUrl is actually on disk. */
  present: boolean;
  /** Set when the portrait belongs to a different case — a borrowed face. */
  borrowedFrom?: string;
}

export interface GalleryCase {
  key: string;
  label: string;
  place: string;
  characters: GalleryCharacter[];
}

const CONTENT = path.join(process.cwd(), "content");
const PUBLIC = path.join(process.cwd(), "public");

function readJson(p: string): Record<string, unknown> | null {
  try { return JSON.parse(fs.readFileSync(p, "utf-8")) as Record<string, unknown>; }
  catch { return null; }
}

function label(file: string, d: Record<string, unknown>): { label: string; place: string; sort: number } {
  const n = (d.unitNumber ?? d.unlockAfterUnit) as number | undefined;
  const city = (d.city as string) ?? "";
  const country = (d.country as string) ?? "";
  const place = [city, country].filter(Boolean).join(", ");
  if (file.includes("bosses")) {
    return { label: (d.title as string) ?? file, place: "Misión especial", sort: (n ?? 0) + 0.5 };
  }
  if (file.includes("-cold")) {
    return { label: `Caso ${n} · Caso Frío — ${(d.caseTitle as string) ?? ""}`, place, sort: (n ?? 0) + 0.25 };
  }
  return { label: `Caso ${n} · ${(d.caseTitle as string) ?? ""}`, place, sort: n ?? 0 };
}

export function buildGallery(): GalleryCase[] {
  const files = [
    ...fs.readdirSync(CONTENT).filter((f) => f.startsWith("unit-") && f.endsWith(".json"))
      .map((f) => path.join(CONTENT, f)),
    ...(fs.existsSync(path.join(CONTENT, "bosses"))
      ? fs.readdirSync(path.join(CONTENT, "bosses")).filter((f) => f.endsWith(".json"))
          .map((f) => path.join(CONTENT, "bosses", f))
      : []),
  ];

  const cases: Array<GalleryCase & { sort: number }> = [];

  for (const file of files) {
    const d = readJson(file);
    if (!d) continue;
    const stages = (d.stages as Array<Record<string, unknown>>) ?? [];
    const chars: GalleryCharacter[] = [];
    const base = path.basename(file, ".json");

    for (const st of stages) {
      if (st.type === "lineup") {
        const raw = st.suspects as unknown;
        const list = Array.isArray(raw)
          ? raw
          : ((raw as Record<string, unknown>)?.normal as unknown[]) ?? [];
        for (const s of list as Array<Record<string, unknown>>) {
          chars.push(toCharacter(base, s.id as string, s.name as string,
            s.realName as string, s.age as number, undefined, s.imageUrl as string));
        }
      }
      if (st.type === "interrogation") {
        const c = st.character as Record<string, unknown>;
        if (c) chars.push(toCharacter(base, String(c.name ?? ""), c.name as string,
          undefined, undefined, c.role as string, c.imageUrl as string));
      }
    }

    if (!chars.length) continue;
    const meta = label(file, d);
    cases.push({ key: base, label: meta.label, place: meta.place, characters: chars, sort: meta.sort });
  }

  cases.sort((a, b) => a.sort - b.sort);
  return cases.map((c) => ({ key: c.key, label: c.label, place: c.place, characters: c.characters }));
}

function toCharacter(
  caseBase: string, id: string, name: string, realName?: string,
  age?: number, role?: string, imageUrl?: string,
): GalleryCharacter {
  const present = Boolean(imageUrl) && fs.existsSync(path.join(PUBLIC, imageUrl!.replace(/^\//, "")));
  let borrowedFrom: string | undefined;
  if (imageUrl) {
    const f = path.basename(imageUrl, ".png");
    const own = caseBase.replace(/^unit-(\d)-/, "unit-0$1-");
    if (!f.startsWith(own) && !f.includes(slugify(id)) && !f.includes(slugify(name))) {
      borrowedFrom = f;
    }
  }
  return { slug: `${caseBase}-${slugify(id)}`, name, realName, age, role,
    imageUrl: imageUrl ?? null, present, borrowedFrom };
}

function slugify(s: string): string {
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}
