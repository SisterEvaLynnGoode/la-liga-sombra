#!/usr/bin/env tsx
// ─── La Liga Sombra — Audio Generator CLI ────────────────────────────────────
// Usage:
//   npm run audio:generate -- --dry-run          Preview what would be generated
//   npm run audio:generate -- --unit 1           Generate Unit 1 scripts only
//   npm run audio:generate -- --all              Generate all scripts
//
// Requires .env.local to be populated with ELEVENLABS_API_KEY and voice IDs.
// Run --dry-run first to verify character costs before spending credits.

import { createInterface } from "readline";
import { scripts } from "./index.js";
import { generateAudio, dryRunScript } from "./elevenlabs-client.js";

// ─── Load .env.local ──────────────────────────────────────────────────────────
// tsx does not auto-load .env.local, so we do it manually
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
} else {
  console.warn("⚠  .env.local not found — env vars must already be set in the shell.");
}

// ─── CLI argument parsing ─────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isAll    = args.includes("--all");

const unitFlagIdx = args.indexOf("--unit");
const unitFilter: number | null =
  unitFlagIdx !== -1 && args[unitFlagIdx + 1]
    ? parseInt(args[unitFlagIdx + 1], 10)
    : null;

// Validate flags
if (!isDryRun && !isAll && unitFilter === null) {
  console.error(
    "Error: specify one of --dry-run, --all, or --unit <number>\n" +
    "  Examples:\n" +
    "    npm run audio:generate -- --dry-run\n" +
    "    npm run audio:generate -- --unit 1\n" +
    "    npm run audio:generate -- --all"
  );
  process.exit(1);
}

if (unitFilter !== null && isNaN(unitFilter)) {
  console.error(`Error: --unit must be a number (got: "${args[unitFlagIdx + 1]}")`);
  process.exit(1);
}

// ─── Filter scripts ───────────────────────────────────────────────────────────

const targeted = scripts.filter((s) => {
  if (unitFilter !== null) return s.unitNumber === unitFilter;
  if (isAll || isDryRun) return true;
  return false;
});

// ─── Prompt helper ────────────────────────────────────────────────────────────

function confirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase().startsWith("y"));
    });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const startMs = Date.now();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  La Liga Sombra · Audio Generator");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ── Zero scripts guard ──────────────────────────────────────────────────────
  if (targeted.length === 0) {
    const scopeLabel = unitFilter !== null
      ? `unit ${unitFilter}`
      : isAll ? "all units" : "all units (dry-run)";

    console.log(`  0 scripts defined for ${scopeLabel}. Nothing to generate.`);
    console.log("  → Add entries to scripts/generate-audio/index.ts to get started.\n");

    // Summary still meaningful for dry-run
    console.log("  Total characters: 0");
    console.log("  Total scripts:    0\n");
    return;
  }

  // ── Dry-run mode ────────────────────────────────────────────────────────────
  if (isDryRun) {
    console.log("  DRY RUN — no API calls will be made.\n");

    let totalChars = 0;
    for (const script of targeted) {
      totalChars += dryRunScript(script);
    }

    console.log("─".repeat(50));
    console.log(`  Total scripts:    ${targeted.length}`);
    console.log(`  Total chars:      ~${totalChars.toLocaleString()}`);
    console.log(`  Free tier impact: ${totalChars.toLocaleString()} / 10,000 chars/month`);
    console.log(`  Approx. % used:   ${((totalChars / 10_000) * 100).toFixed(1)}%`);
    if (totalChars > 10_000) {
      console.log("  ⚠  Exceeds free tier — paid credits will be used.");
    }
    console.log();
    return;
  }

  // ── Generate mode ────────────────────────────────────────────────────────────

  // Calculate total chars for confirmation prompt
  const estimatedChars = targeted.reduce((sum, s) =>
    sum + s.lines.reduce((ls, l) => ls + l.text.replace(/<break\s+time="[^"]*"\s*\/>/g, "").length, 0),
    0
  );

  const scopeLabel = unitFilter !== null ? `Unit ${unitFilter}` : `all ${targeted.length} scripts`;

  console.log(`  Scope:          ${scopeLabel}`);
  console.log(`  Scripts:        ${targeted.length}`);
  console.log(`  Est. chars:     ~${estimatedChars.toLocaleString()}`);
  console.log(`  Free tier left: up to 10,000/month`);
  console.log();

  const ok = await confirm(
    `  ⚡ Generate ${targeted.length} audio file(s) using ~${estimatedChars.toLocaleString()} ElevenLabs credits? [y/N] `
  );

  if (!ok) {
    console.log("\n  Aborted — no files generated.\n");
    return;
  }

  console.log();

  // ── Run each script ──────────────────────────────────────────────────────────
  let totalCharsUsed = 0;
  let succeeded = 0;
  let failed = 0;

  for (const script of targeted) {
    console.log(`\n[${script.unitNumber}] ${script.filename}  —  ${script.description}`);
    try {
      const { charactersUsed } = await generateAudio(script);
      totalCharsUsed += charactersUsed;
      succeeded++;
    } catch (err) {
      console.error(
        `  ✗ FAILED: ${err instanceof Error ? err.message : String(err)}`
      );
      failed++;
    }
  }

  const elapsedSec = ((Date.now() - startMs) / 1000).toFixed(1);

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Generation complete");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Succeeded:      ${succeeded}`);
  if (failed > 0) console.log(`  Failed:         ${failed}`);
  console.log(`  Chars used:     ${totalCharsUsed.toLocaleString()}`);
  console.log(`  Free tier:      10,000 chars/month — check usage at elevenlabs.io`);
  console.log(`  Elapsed:        ${elapsedSec}s`);
  console.log();

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("\n  Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
