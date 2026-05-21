/**
 * generate.ts — CLI runner for La Liga Sombra trailer shots
 *
 * Usage (dry-run, default):
 *   npx tsx scripts/generate-trailer/generate.ts --shot 1
 *
 * Usage (actually generate — costs credits):
 *   npx tsx scripts/generate-trailer/generate.ts --shot 1 --generate
 *
 * Flags:
 *   --shot <n>     Which shot number to generate (1-9). Required.
 *   --generate     Actually call the Higgsfield API. Without this flag, dry-run only.
 *   --all          Generate all 9 shots in sequence (still requires --generate).
 *
 * Output:
 *   Downloads clips to scripts/generate-trailer/output/shot-0N-<slug>.mp4
 *   Appends log entries to scripts/generate-trailer/output/log.json
 */

import { SHOTS, MODEL_PARAMS } from "./shots";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_DIR = path.join(__dirname, "output");
const LOG_FILE = path.join(OUTPUT_DIR, "log.json");

interface LogEntry {
  shotNumber: number;
  slug: string;
  jobId: string;
  outputFile: string;
  creditsUsed: number;
  generatedAt: string;
  status: "pending" | "complete" | "failed";
}

function loadLog(): LogEntry[] {
  if (!fs.existsSync(LOG_FILE)) return [];
  return JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));
}

function saveLog(entries: LogEntry[]) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2));
}

function printCreditSummary(shotNumbers: number[]) {
  const total = shotNumbers.length * MODEL_PARAMS.creditsPerShot;
  console.log("\n──────────────────────────────────────────");
  console.log(`  CREDIT CHECK — ${shotNumbers.length} shot(s)`);
  console.log(`  Model:       ${MODEL_PARAMS.model}`);
  console.log(`  Settings:    ${MODEL_PARAMS.duration}s · ${MODEL_PARAMS.resolution} · ${MODEL_PARAMS.aspect_ratio} · genre:${MODEL_PARAMS.genre}`);
  console.log(`  Cost/shot:   ${MODEL_PARAMS.creditsPerShot} credits`);
  console.log(`  Total cost:  ${total} credits`);
  console.log("──────────────────────────────────────────\n");
}

function main() {
  const args = process.argv.slice(2);
  const shotFlag = args.indexOf("--shot");
  const doGenerate = args.includes("--generate");
  const doAll = args.includes("--all");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let shotNumbers: number[];

  if (doAll) {
    shotNumbers = SHOTS.map((s) => s.number);
  } else if (shotFlag !== -1 && args[shotFlag + 1]) {
    const n = parseInt(args[shotFlag + 1]);
    if (isNaN(n) || n < 1 || n > 9) {
      console.error("❌ --shot must be a number between 1 and 9");
      process.exit(1);
    }
    shotNumbers = [n];
  } else {
    console.error("Usage: npx tsx generate.ts --shot <1-9> [--generate] [--all]");
    process.exit(1);
  }

  printCreditSummary(shotNumbers);

  for (const n of shotNumbers) {
    const shot = SHOTS.find((s) => s.number === n);
    if (!shot) {
      console.error(`❌ Shot ${n} not found.`);
      continue;
    }

    console.log(`Shot ${shot.number}: ${shot.description}`);
    console.log(`Slug: ${shot.slug}`);
    console.log(`Prompt (first 120 chars): ${shot.prompt.slice(0, 120)}...`);

    if (!doGenerate) {
      console.log("\n⚠  DRY RUN — add --generate to actually call the API.\n");
    } else {
      console.log("\n▶  Would call Higgsfield generate_video here (via MCP in Claude session).\n");
      console.log("   In practice, generation is triggered from Claude's MCP directly,");
      console.log("   not from this script. This file serves as documentation + prompt store.\n");
    }
  }
}

main();
