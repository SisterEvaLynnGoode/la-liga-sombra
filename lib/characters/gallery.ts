/**
 * Character gallery index.
 *
 * Built by scanning the content files for every character who has portrait art,
 * so the gallery cannot drift from the game: if a case gains a suspect, the
 * gallery gains a card, and if a portrait is missing the gallery says so out
 * loud instead of rendering a hole.
 */

import { UNITS } from "@/lib/game/units";
// Static import, NOT a filesystem read of public/. Reading public/ with a
// dynamic path makes Next's dependency tracer bundle the whole directory into
// the serverless function — 140 MB of portraits, which blew the 250 MB Vercel
// function limit and failed the deploy outright. The manifest already records
// every portrait that exists, so ask it instead of asking the disk.
import manifestJson from "../../public/images/characters/manifest.json";

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

/**
 * Every boss file, by id. Listed rather than globbed for the same reason the
 * cases are required below.
 */
const BOSS_IDS = [
  "unit-5-eclipse",
  "unit-8-medianoche",
  "unit-15-reloj-arena",
  "unit-26-ultima-cronica",
  "unit-32-coleccion",
];

/** Public URLs of every portrait the manifest knows about. */
const PORTRAITS = new Set(
  (manifestJson as Array<{ publicUrl?: string }>).map((e) => e.publicUrl).filter(Boolean) as string[],
);

/**
 * Load a content file by name.
 *
 * `require` and not fs: this module used to readdirSync("content") and read
 * each file while the page rendered. On Vercel the gallery is a serverless
 * function whose filesystem holds only what the build traced, and a directory
 * scan is invisible to the tracer, so the gallery could come up empty in
 * production while looking perfect locally. A require of a literal-ish path is
 * traced and bundled — the same way every case is loaded in the game itself.
 */
function readJson(name: string): Record<string, unknown> | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@/content/${name}.json`) as Record<string, unknown>;
  } catch {
    return null;
  }
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
    ...UNITS.flatMap((u) => {
      const n = String(u.number).padStart(2, "0");
      return [`unit-${n}`, `unit-${n}-cold`];
    }),
    ...BOSS_IDS.map((id) => `bosses/${id}`),
  ];

  const cases: Array<GalleryCase & { sort: number }> = [];

  for (const file of files) {
    const d = readJson(file);
    if (!d) continue;
    const stages = (d.stages as Array<Record<string, unknown>>) ?? [];
    const chars: GalleryCharacter[] = [];
    const base = file.split("/").pop() as string;

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
  const present = Boolean(imageUrl) && PORTRAITS.has(imageUrl!);
  let borrowedFrom: string | undefined;
  if (imageUrl) {
    // basename without the extension, without pulling in node:path.
    const f = (imageUrl.split("/").pop() ?? "").replace(/\.[a-z0-9]+$/i, "");
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
