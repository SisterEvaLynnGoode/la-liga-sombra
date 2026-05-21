/**
 * validate-images.mjs
 *
 * Build-time validation: checks that every /images/characters/* path referenced
 * in unit JSON files actually exists on disk.
 *
 * Run:  node scripts/validate-images.mjs
 * CI:   exits with code 1 if any broken references are found.
 *
 * Add to package.json scripts:
 *   "validate:images": "node scripts/validate-images.mjs"
 *   "build": "npm run validate:images && next build"
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "content");
const PUBLIC_DIR = join(ROOT, "public");

// ── Collect all image path references from unit JSONs ─────────────────────────
const errors = [];
const warnings = [];
const checked = new Set();

function checkPath(filePath, unitFile, context) {
  if (!filePath || typeof filePath !== "string") return;
  if (!filePath.startsWith("/images/characters/")) return; // only check our paths

  checked.add(filePath);
  const diskPath = join(PUBLIC_DIR, filePath.split("?")[0]); // strip query params
  if (!existsSync(diskPath)) {
    errors.push(`❌  BROKEN  ${unitFile} [${context}]  →  ${filePath}`);
  }
}

// Scan all unit-*.json files
const unitFiles = readdirSync(CONTENT_DIR).filter(
  (f) => f.startsWith("unit-") && f.endsWith(".json")
);

for (const unitFile of unitFiles) {
  const fullPath = join(CONTENT_DIR, unitFile);
  let data;
  try {
    data = JSON.parse(readFileSync(fullPath, "utf-8"));
  } catch (e) {
    warnings.push(`⚠️   Cannot parse ${unitFile}: ${e.message}`);
    continue;
  }

  // Vocab items
  for (const v of data.vocab ?? []) {
    checkPath(v.audio, unitFile, "vocab.audio");
  }

  // Stages
  for (const stage of data.stages ?? []) {
    const t = stage.type;

    if (t === "cutscene") {
      checkPath(stage.chiefImageUrl, unitFile, "cutscene.chiefImageUrl");
      checkPath(stage.fallbackImage, unitFile, "cutscene.fallbackImage");
    }

    if (t === "lineup") {
      for (const s of stage.suspects ?? []) {
        checkPath(s.imageUrl, unitFile, `lineup.suspect[${s.id}].imageUrl`);
      }
    }

    if (t === "interrogation") {
      checkPath(stage.character?.imageUrl, unitFile, "interrogation.character.imageUrl");
    }

    if (t === "dialogueChoice") {
      checkPath(stage.npcAvatar, unitFile, "dialogueChoice.npcAvatar");
    }

    if (t === "liveStakeout") {
      for (const sc of stage.scenes ?? []) {
        checkPath(sc.imageUrl, unitFile, `liveStakeout.scene[${sc.description?.slice(0, 20)}]`);
      }
    }
  }

  // chiefImageUrl at unit level (some units put it on cutscene stage)
}

// ── Also check characters directory ──────────────────────────────────────────
const charFiles = readdirSync(join(CONTENT_DIR, "characters")).filter(f => f.endsWith(".json"));
for (const charFile of charFiles) {
  const fullPath = join(CONTENT_DIR, "characters", charFile);
  let chars;
  try {
    chars = JSON.parse(readFileSync(fullPath, "utf-8"));
  } catch { continue; }
  for (const c of (Array.isArray(chars) ? chars : [])) {
    checkPath(c.generatedImageUrl, charFile, `characters[${c.id}].generatedImageUrl`);
    checkPath(c.imageUrl, charFile, `characters[${c.id}].imageUrl`);
  }
}

// ── Also check manifest consistency ──────────────────────────────────────────
const manifestPath = join(PUBLIC_DIR, "images", "characters", "manifest.json");
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  for (const entry of manifest) {
    if (entry.publicUrl) {
      const diskPath = join(PUBLIC_DIR, entry.publicUrl);
      if (!existsSync(diskPath)) {
        errors.push(`❌  MANIFEST-BROKEN  manifest.json[${entry.characterId}]  →  ${entry.publicUrl} (file missing on disk)`);
      }
    }
  }
}

// ── Report ─────────────────────────────────────────────────────────────────────

console.log(`\n🔍 Image validation — checked ${checked.size} paths across ${unitFiles.length} unit files\n`);

if (warnings.length) {
  console.log("Warnings:");
  for (const w of warnings) console.log("  " + w);
}

if (errors.length) {
  console.log("\nBROKEN IMAGE REFERENCES:");
  for (const e of errors) console.log("  " + e);
  console.log(`\n✖  ${errors.length} broken reference(s) found. Fix before deploying.\n`);
  process.exit(1);
} else {
  console.log("✅  All image references valid.\n");
  process.exit(0);
}
