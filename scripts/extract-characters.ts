/**
 * extract-characters.ts
 *
 * Scans /content/unit-XX.json files, extracts every named character
 * (suspects, witnesses, interrogation characters, recurring NPCs), attempts
 * to parse their Spanish descriptions into structured fields, and writes
 * draft character JSON files to /content/characters/.
 *
 * Existing character files are NOT overwritten — the script only adds new
 * characters it doesn't recognise. Run this whenever a new unit is added.
 *
 * Usage:
 *   npx tsx scripts/extract-characters.ts
 *   npx tsx scripts/extract-characters.ts --unit 9     # specific unit only
 *   npx tsx scripts/extract-characters.ts --dry-run    # print without writing
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CHAR_DIR = join(ROOT, "content", "characters");

// ── Spanish number parser ─────────────────────────────────────────────────────

const ONES: Record<string, number> = {
  uno:1, dos:2, tres:3, cuatro:4, cinco:5, seis:6, siete:7, ocho:8, nueve:9,
  diez:10, once:11, doce:12, trece:13, catorce:14, quince:15,
  dieciséis:16, diecisiete:17, dieciocho:18, diecinueve:19,
  veinte:20, veintiuno:21, veintidós:22, veintitrés:23, veinticuatro:24,
  veinticinco:25, veintiséis:26, veintisiete:27, veintiocho:28, veintinueve:29,
};
const TENS: Record<string, number> = {
  treinta:30, cuarenta:40, cincuenta:50, sesenta:60, setenta:70, ochenta:80, noventa:90,
};

function parseAge(desc: string): number | null {
  // "cuarenta y cinco años" → 45 | "veintidós años" → 22 | "treinta años" → 30
  const combined = Object.keys(ONES).join("|");
  const tensKeys  = Object.keys(TENS).join("|");
  const onesKeys  = combined;

  const r1 = new RegExp(`(${tensKeys})\\s+y\\s+(${onesKeys})\\s+años`, "i");
  const r2 = new RegExp(`(${onesKeys}|${tensKeys})\\s+años`, "i");

  let m = desc.match(r1);
  if (m) return (TENS[m[1].toLowerCase()] ?? 0) + (ONES[m[2].toLowerCase()] ?? 0);
  m = desc.match(r2);
  if (m) {
    const w = m[1].toLowerCase();
    return ONES[w] ?? TENS[w] ?? null;
  }
  return null;
}

function parseBuild(desc: string): string {
  const tokens: string[] = [];
  const d = desc.toLowerCase();
  if (/\balta?\b/.test(d))    tokens.push("alto/a");
  if (/\bbaja?\b/.test(d))    tokens.push("bajo/a");
  if (/\bmediana?\b/.test(d)) tokens.push("mediano/a");
  if (/delgad/i.test(d))      tokens.push("delgado/a");
  if (/robust/i.test(d))      tokens.push("robusto/a");
  if (/fuerte/i.test(d))      tokens.push("fuerte");
  if (/gordo|gordita/i.test(d)) tokens.push("gordo/a");
  return tokens.join(", ");
}

function parseHair(desc: string): string {
  const m = desc.match(/(?:pelo|cabello)\s+([^.]+?)(?:\.|,|\s+y\s+(?:es|tiene|lleva|habla))/i);
  return m ? m[1].trim() : "";
}

function parseDistinctiveFeatures(desc: string): string[] {
  const feats: string[] = [];
  if (/bigote/i.test(desc))          feats.push("bigote");
  if (/lentes|gafas/i.test(desc))    feats.push("lentes");
  if (/cicatriz/i.test(desc))        feats.push("cicatriz");
  if (/barba/i.test(desc))           feats.push("barba");
  if (/tatuaje/i.test(desc))         feats.push("tatuaje");
  if (/calvo|calvicie/i.test(desc))  feats.push("calvo");
  if (/trenzas/i.test(desc))         feats.push("trenzas");
  if (/auriculares/i.test(desc))     feats.push("auriculares");
  if (/gorra/i.test(desc))           feats.push("gorra");
  if (/sombrero/i.test(desc))        feats.push("sombrero");
  if (/mochila/i.test(desc))         feats.push("mochila");
  if (/estuche/i.test(desc))         feats.push("estuche");
  if (/cámara/i.test(desc))          feats.push("cámara");
  return feats;
}

function parseGender(desc: string): string {
  if (/\bmuchacha\b|\bmujer\b|\bchica\b|\bniña\b/i.test(desc)) return "mujer";
  if (/\bmuchacho\b|\bhombre\b|\bchico\b|\bniño\b/i.test(desc)) return "hombre";
  return "";
}

function parseSkinTone(desc: string): string {
  if (/morena?/i.test(desc))  return "morena";
  if (/rubia?/i.test(desc))   return "blanca / rubia";
  if (/blanca?/i.test(desc))  return "blanca";
  if (/negra?/i.test(desc))   return "negra";
  return "";
}

// ── Draft character factory ───────────────────────────────────────────────────

interface RawSuspect {
  id: string; name: string; realName?: string; age: number;
  description: string; imageUrl?: string; imageSeed?: number;
}

function draftFromSuspect(unit: number, s: RawSuspect, role: "suspect" | "villain" = "suspect") {
  const desc = s.description ?? "";
  return {
    id: `unit-0${unit}-${s.id}`,
    role,
    unitNumber: unit,
    name: s.name,
    realName: s.realName ?? "",
    age: s.age ?? parseAge(desc) ?? 0,
    gender: parseGender(desc),
    skinTone: parseSkinTone(desc),
    build: parseBuild(desc),
    hair: parseHair(desc),
    distinctiveFeatures: parseDistinctiveFeatures(desc),
    clothing: "",  // not extractable from in-game descriptions
    accessories: [],
    expression: "",
    pose: "retrato de busto, mirando ligeramente hacia un lado",
    spanishDescription: desc,
    country: "",   // must be filled manually
    currentImageUrl: s.imageUrl ?? null,
    notes: "⚠ AUTO-EXTRACTED — review and complete all empty fields",
  };
}

// ── Main extraction ───────────────────────────────────────────────────────────

interface Report {
  unit: number;
  characters: Array<{ id: string; name: string; issues: string[] }>;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const unitArg = process.argv.find((a, i) => process.argv[i - 1] === "--unit");
  const targetUnit = unitArg ? parseInt(unitArg) : null;

  if (!existsSync(CHAR_DIR)) mkdirSync(CHAR_DIR, { recursive: true });

  const reports: Report[] = [];
  const units = targetUnit ? [targetUnit] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  for (const n of units) {
    const jsonPath = join(ROOT, "content", `unit-0${n}.json`);
    if (!existsSync(jsonPath)) continue;

    const unit = JSON.parse(readFileSync(jsonPath, "utf8")) as {
      criminalName: string;
      stages: Array<{
        type: string;
        suspects?: RawSuspect[];
        npcName?: string;
        character?: { name: string; role: string; imageUrl?: string; description?: string };
      }>;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extracted: any[] = [];
    const report: Report = { unit: n, characters: [] };

    for (const stage of unit.stages) {
      // ── Lineup suspects
      if (stage.type === "lineup" && stage.suspects) {
        for (const s of stage.suspects) {
          const draft = draftFromSuspect(n, s);
          extracted.push(draft);

          const issues: string[] = [];
          if (!draft.gender)   issues.push("gender not parsed");
          if (!draft.skinTone) issues.push("skinTone not parsed");
          if (!draft.build)    issues.push("build not parsed");
          if (!draft.hair)     issues.push("hair not parsed");
          issues.push("clothing: EMPTY — fill manually");
          issues.push("expression: EMPTY — fill manually");
          issues.push("country: EMPTY — fill manually");

          report.characters.push({ id: draft.id, name: s.name, issues });
        }
      }

      // ── Dialogue witnesses
      if (stage.type === "dialogueChoice" && stage.npcName) {
        const id = `unit-0${n}-witness-${stage.npcName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
        extracted.push({
          id,
          role: "witness" as "witness",
          unitNumber: n,
          name: stage.npcName,
          realName: "",
          age: 0,
          gender: "",
          skinTone: "",
          build: "",
          hair: "",
          distinctiveFeatures: [],
          clothing: "",
          accessories: [],
          expression: "",
          pose: "retrato de busto, mirando ligeramente hacia un lado",
          spanishDescription: "",
          country: "",
          currentImageUrl: null,
          notes: "⚠ AUTO-EXTRACTED witness — all fields need manual review",
        });
        report.characters.push({
          id, name: stage.npcName,
          issues: ["ALL fields empty — witness has no structured data in JSON"],
        });
      }

      // ── Interrogation characters
      if (stage.type === "interrogation" && stage.character) {
        const ch = stage.character;
        const id = `unit-0${n}-interro-${ch.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
        extracted.push({
          id,
          role: "witness" as "witness",
          unitNumber: n,
          name: ch.name,
          realName: "",
          age: 0,
          gender: "",
          skinTone: "",
          build: "",
          hair: "",
          distinctiveFeatures: [],
          clothing: "",
          accessories: [],
          expression: "",
          pose: "retrato de busto, mirando ligeramente hacia un lado",
          spanishDescription: ch.description ?? "",
          country: "",
          currentImageUrl: ch.imageUrl ?? null,
          notes: `⚠ AUTO-EXTRACTED interrogation character (${ch.role}) — needs full review`,
        });
        report.characters.push({
          id, name: ch.name,
          issues: ["Most fields empty — parse from description manually"],
        });
      }
    }

    reports.push(report);

    // Write draft file (skip if already exists)
    const outPath = join(CHAR_DIR, `unit-0${n}-draft.json`);
    if (!existsSync(outPath)) {
      if (dryRun) {
        console.log(`[DRY RUN] Would write ${extracted.length} characters to ${outPath}`);
      } else {
        writeFileSync(outPath, JSON.stringify(extracted, null, 2), "utf8");
        console.log(`✓ Wrote ${extracted.length} characters → ${outPath}`);
      }
    } else {
      console.log(`⏭ Skipped ${outPath} (already exists)`);
    }
  }

  // Generate Markdown report
  const reportLines = [
    "# Character Extraction Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    "This report shows every character auto-extracted from unit JSON files.",
    "Fields marked ⚠ need manual completion before image generation.",
    "",
    "---",
    "",
  ];

  for (const r of reports) {
    reportLines.push(`## Unit ${r.unit}`);
    reportLines.push("");
    for (const c of r.characters) {
      const status = c.issues.length === 0 ? "✅" : c.issues.some(i => i.includes("EMPTY")) ? "🔴" : "🟡";
      reportLines.push(`### ${status} ${c.name} (\`${c.id}\`)`);
      if (c.issues.length > 0) {
        reportLines.push("");
        for (const issue of c.issues) {
          reportLines.push(`- ⚠ ${issue}`);
        }
      }
      reportLines.push("");
    }
    reportLines.push("---");
    reportLines.push("");
  }

  reportLines.push(
    "## Next Steps",
    "",
    "1. Open `/teacher/characters` to review and complete each character sheet",
    "2. Pay special attention to: `clothing`, `accessories`, `expression`, `country`",
    "3. For suspects: ensure `accessories` includes EVERY item mentioned in `spanishDescription`",
    "4. Run `npx tsx scripts/generate-images/build-prompt.ts --all` to preview prompts",
    "5. Generate images via Higgsfield (see README for workflow)",
    "",
  );

  const reportPath = join(ROOT, "scripts", "character-extraction-report.md");
  if (dryRun) {
    console.log("\n[DRY RUN] Report would be written to:", reportPath);
  } else {
    writeFileSync(reportPath, reportLines.join("\n"), "utf8");
    console.log(`\n✓ Report → ${reportPath}`);
  }
}

main().catch(console.error);
