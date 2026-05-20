/**
 * generate.ts  — Character portrait generation CLI
 *
 * Uses the Higgsfield REST API (requires HIGGSFIELD_API_KEY env var).
 * In the Claude Code session, images are generated via the Higgsfield MCP
 * and this script handles file management and manifest updates.
 *
 * Commands:
 *   npx tsx scripts/generate-images/generate.ts --recurring
 *   npx tsx scripts/generate-images/generate.ts --unit 1
 *   npx tsx scripts/generate-images/generate.ts --character unit-01-camaleon
 *   npx tsx scripts/generate-images/generate.ts --unit 1 --dry-run
 *
 * NOTE: --all is intentionally unsupported. Generate one unit at a time,
 *       review at /teacher/characters, then approve before continuing.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as readline from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT       = join(__dirname, "..", "..");
const OUT_DIR    = join(ROOT, "public", "images", "characters");
const MANIFEST   = join(OUT_DIR, "manifest.json");

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ManifestEntry {
  characterId:     string;
  localPath:       string;   // relative to /public
  publicUrl:       string;   // /images/characters/{id}.png
  sourcePrompt:    string;
  higgsfieldJobId: string;
  higgsfieldUrl:   string;   // original URL from Higgsfield
  timestamp:       string;
  status:          "generated" | "approved" | "needs-regen";
  creditsUsed:     number;
}

// ── Manifest helpers ──────────────────────────────────────────────────────────

export function readManifest(): ManifestEntry[] {
  if (!existsSync(MANIFEST)) return [];
  return JSON.parse(readFileSync(MANIFEST, "utf8")) as ManifestEntry[];
}

export function writeManifest(entries: ManifestEntry[]) {
  writeFileSync(MANIFEST, JSON.stringify(entries, null, 2) + "\n", "utf8");
}

export function upsertManifestEntry(entry: ManifestEntry) {
  const entries = readManifest();
  const idx = entries.findIndex((e) => e.characterId === entry.characterId);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  writeManifest(entries);
}

export function getManifestEntry(characterId: string): ManifestEntry | undefined {
  return readManifest().find((e) => e.characterId === characterId);
}

// ── Download helper ───────────────────────────────────────────────────────────

async function downloadImage(url: string, outPath: string): Promise<void> {
  const { execSync } = await import("child_process");
  mkdirSync(dirname(outPath), { recursive: true });
  execSync(`curl -sSL -o "${outPath}" "${url}"`, { stdio: "pipe" });
}

// ── Higgsfield REST client ────────────────────────────────────────────────────

const HF_API = "https://api.higgsfield.ai/v1";

async function hfGenerate(prompt: string, dryRun: boolean): Promise<{ jobId: string; imageUrl: string; credits: number } | null> {
  if (dryRun) return null;

  const apiKey = process.env.HIGGSFIELD_API_KEY;
  if (!apiKey) {
    console.error("❌ HIGGSFIELD_API_KEY env var not set. Use --dry-run to preview prompts.");
    return null;
  }

  const res = await fetch(`${HF_API}/generate`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nano_banana_2",
      prompt,
      aspect_ratio: "3:4",
      count: 1,
      resolution: "1k",
    }),
  });

  if (!res.ok) {
    console.error(`❌ Higgsfield API error ${res.status}: ${await res.text()}`);
    return null;
  }

  const data = await res.json() as { id: string; results: Array<{ url: string }>; credits_used: number };
  return { jobId: data.id, imageUrl: data.results[0].url, credits: data.credits_used ?? 1.5 };
}

// ── Confirm prompt ────────────────────────────────────────────────────────────

function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (ans) => { rl.close(); resolve(ans.trim().toLowerCase() === "y"); });
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun   = args.includes("--dry-run");
  const unitArg  = args.find((a, i) => args[i - 1] === "--unit");
  const charArg  = args.find((a, i) => args[i - 1] === "--character");
  const recurring = args.includes("--recurring");

  if (args.includes("--all")) {
    console.error("❌ --all is not supported. Generate one unit at a time, review, then approve.");
    console.error("   Use --recurring, --unit 1, --unit 2, etc.");
    process.exit(1);
  }

  // Dynamic import
  const { characters } = await import("../../content/characters/index.js");
  const { buildImagePrompt } = await import("./build-prompt.js");

  // Select characters to generate
  let targets = characters.filter(() => false); // empty by default
  if (recurring) targets = characters.filter((c) => !c.unitNumber);
  else if (unitArg) targets = characters.filter((c) => c.unitNumber === parseInt(unitArg));
  else if (charArg) targets = characters.filter((c) => c.id === charArg);
  else {
    console.error("❌ Specify --recurring, --unit N, or --character <id>");
    process.exit(1);
  }

  if (targets.length === 0) {
    console.error("❌ No characters found for that selection.");
    process.exit(1);
  }

  const costEach = 1.5;
  const totalCost = targets.length * costEach;
  const label = recurring ? "recurring" : unitArg ? `Unit ${unitArg}` : charArg;

  console.log(`\n📋 ${label}: ${targets.length} characters`);
  targets.forEach((c) => console.log(`   • ${c.id} — ${c.name}`));
  console.log(`\n💳 Estimated cost: ${targets.length} × ${costEach} = ${totalCost} credits`);

  if (dryRun) {
    console.log("\n[DRY RUN] Prompts:\n");
    for (const c of targets) {
      console.log("=".repeat(60));
      console.log(`${c.id} — ${c.name}`);
      console.log("─".repeat(60));
      console.log(buildImagePrompt(c));
      console.log();
    }
    return;
  }

  const ok = await confirm(`\nGenerate ${targets.length} images (~${totalCost} credits)? (y/n) `);
  if (!ok) { console.log("Aborted."); return; }

  let generated = 0;
  let totalCreditsUsed = 0;

  for (const char of targets) {
    const prompt = buildImagePrompt(char);
    process.stdout.write(`  Generating ${char.id} (${char.name})… `);

    const result = await hfGenerate(prompt, false);
    if (!result) { console.log("FAILED"); continue; }

    // Download to local path
    const outPath = join(OUT_DIR, `${char.id}.png`);
    try {
      await downloadImage(result.imageUrl, outPath);
    } catch {
      console.log(`⚠ Generated but download failed — image at: ${result.imageUrl}`);
    }

    // Update manifest
    upsertManifestEntry({
      characterId:     char.id,
      localPath:       `images/characters/${char.id}.png`,
      publicUrl:       `/images/characters/${char.id}.png`,
      sourcePrompt:    prompt,
      higgsfieldJobId: result.jobId,
      higgsfieldUrl:   result.imageUrl,
      timestamp:       new Date().toISOString(),
      status:          "generated",
      creditsUsed:     result.credits,
    });

    // Also update character sheet with the generated URL
    // (handled separately via the review page PATCH endpoint)

    generated++;
    totalCreditsUsed += result.credits;
    console.log(`✓ (${result.credits} credits)`);
  }

  console.log(`\n✅ Generated ${generated}/${targets.length} images · ${totalCreditsUsed} credits used`);
  console.log(`📝 Manifest updated → ${MANIFEST}`);
  console.log(`\n👉 Review at: http://localhost:3000/teacher/characters`);
  console.log(`   Approve each image before continuing to the next unit.`);
}

main().catch(console.error);
