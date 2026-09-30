/**
 * Write down which media files exist, at BUILD time.
 *
 * The teacher lesson plans used to answer "is this case's listening clip
 * ready?" with fs.existsSync("public/audio/…") while rendering the page. That
 * works locally and is always false in production: Vercel serves /public from
 * its static layer, and those files are not in the serverless function's
 * filesystem. So every lesson plan told the teacher the audio was missing and
 * the stage would "play silence", while the clip played perfectly for students.
 *
 * The build has the real filesystem, so it records what is there once, and the
 * page reads the list. A genuinely missing clip still shows up as a gap.
 *
 *   node scripts/build-asset-manifest.mjs
 */
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, relative, sep } from "path";

const ROOT = process.cwd();
const OUT = join(ROOT, "lib", "generated", "asset-manifest.json");

/** Every file under a public/ subtree, as a web path ("/audio/unit-01/x.mp3"). */
function walk(rel) {
  const abs = join(ROOT, "public", rel);
  if (!existsSync(abs)) return [];
  const out = [];
  for (const entry of readdirSync(abs)) {
    const full = join(abs, entry);
    if (statSync(full).isDirectory()) out.push(...walk(join(rel, entry)));
    else out.push("/" + relative(join(ROOT, "public"), full).split(sep).join("/"));
  }
  return out;
}

const audio = walk("audio").filter((p) => /\.(mp3|m4a|ogg|wav)$/i.test(p)).sort();
// Only the directory names matter for the scroll-world hook.
const scrollWorldsDir = join(ROOT, "public", "scroll-worlds");
const scrollWorlds = existsSync(scrollWorldsDir)
  ? readdirSync(scrollWorldsDir).filter((d) => statSync(join(scrollWorldsDir, d)).isDirectory()).sort()
  : [];

// Cross-check what the content asks for, so a real gap is still reported.
const contentDir = join(ROOT, "content");
const referenced = new Set();
function collect(node) {
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if ((k === "audioUrl" || k === "audio") && typeof v === "string" && v.trim()) referenced.add(v);
      collect(v);
    }
  } else if (Array.isArray(node)) node.forEach(collect);
}
function readContent(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) readContent(full);
    else if (entry.endsWith(".json") && !entry.startsWith("_")) {
      try { collect(JSON.parse(readFileSync(full, "utf-8"))); } catch { /* validate-content reports bad JSON */ }
    }
  }
}
if (existsSync(contentDir)) readContent(contentDir);

const have = new Set(audio);
const missing = [...referenced].filter((u) => !have.has(u)).sort();

mkdirSync(join(ROOT, "lib", "generated"), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({ audio, scrollWorlds, generatedAt: new Date().toISOString() }, null, 2) + "\n",
  "utf-8"
);

console.log(`🎧 Asset manifest — ${audio.length} audio files, ${scrollWorlds.length} scroll-world(s)`);
console.log(`   ${referenced.size} clips referenced by content · ${missing.length} missing`);
for (const m of missing.slice(0, 20)) console.log(`   ⚠ referenced but not on disk: ${m}`);
if (missing.length > 20) console.log(`   …and ${missing.length - 20} more`);
console.log(missing.length ? "" : "✅  Every referenced clip is on disk.\n");
