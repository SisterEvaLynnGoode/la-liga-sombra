#!/usr/bin/env tsx
/**
 * Generate the per-word vocabulary audio.
 *
 * Every vocab entry in every unit carries an `audio` path like
 * /audio/unit-01/hola.mp3, and not one of those files was ever generated — all
 * 532 distinct paths 404. The Training Room's Definiciones drill plays that
 * file and falls back to the browser's speech synthesis, which on a managed
 * Chromebook is often missing a Spanish voice entirely. A student taps the
 * speaker, hears nothing or hears Spanish read by an English voice, and cannot
 * answer a question whose whole point is recognising the spoken word.
 *
 * Resumable by design: a path that already exists on disk is skipped, so this
 * can be re-run after a quota stop and picks up exactly where it left off.
 * Quota is not readable from this API key (it lacks the user_read permission),
 * so the only honest approach is to generate until the API says stop, then
 * report how far it got.
 *
 *   npx tsx scripts/generate-audio/vocab.ts --dry-run
 *   npx tsx scripts/generate-audio/vocab.ts --limit 50
 *   npx tsx scripts/generate-audio/vocab.ts
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { dirname, join } from "path";

// ─── .env.local ───────────────────────────────────────────────────────────────
const ROOT = process.cwd();
const envPath = join(ROOT, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    if (k && !(k in process.env)) process.env[k] = t.slice(i + 1).trim();
  }
}

const API_KEY = (process.env.ELEVENLABS_API_KEY ?? "").trim();
const VOICE   = (process.env.ELEVENLABS_VOICE_FEMALE_1 ?? "").trim();
if (!API_KEY || !VOICE) {
  console.error("Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_FEMALE_1 in .env.local");
  process.exit(1);
}

const args    = process.argv.slice(2);
const dryRun  = args.includes("--dry-run");
const limitAt = args.indexOf("--limit");
const LIMIT   = limitAt >= 0 ? parseInt(args[limitAt + 1], 10) : Infinity;

// ─── Collect the work ─────────────────────────────────────────────────────────
// One clip per distinct audio path. The same word appears in several units and
// shares a path; generating it once is correct and saves the quota.

interface Job { audio: string; spanish: string; unit: string }

const jobs: Job[] = [];
const seen = new Set<string>();
for (const file of readdirSync("content").filter((f) => /^unit-.*\.json$/.test(f)).sort()) {
  const d = JSON.parse(readFileSync(join("content", file), "utf-8")) as {
    vocab?: Array<{ spanish: string; audio?: string }>;
  };
  for (const v of d.vocab ?? []) {
    if (!v.audio || seen.has(v.audio)) continue;
    seen.add(v.audio);
    jobs.push({ audio: v.audio, spanish: v.spanish, unit: file });
  }
}

const pending = jobs.filter((j) => !existsSync(join(ROOT, "public", j.audio.replace(/^\//, ""))));
const chars = pending.reduce((n, j) => n + j.spanish.length, 0);

console.log(`distinct clips referenced : ${jobs.length}`);
console.log(`already on disk           : ${jobs.length - pending.length}`);
console.log(`to generate               : ${pending.length}`);
console.log(`billable characters       : ${chars.toLocaleString()}\n`);

if (dryRun) process.exit(0);

// ─── Generate ─────────────────────────────────────────────────────────────────

let done = 0, failed = 0, usedChars = 0;
let quotaStop: string | null = null;

async function one(job: Job): Promise<void> {
  if (quotaStop) return;
  const out = join(ROOT, "public", job.audio.replace(/^\//, ""));
  mkdirSync(dirname(out), { recursive: true });

  for (let attempt = 1; attempt <= 4; attempt++) {
    if (quotaStop) return;
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}`, {
        method: "POST",
        headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: job.spanish,
          model_id: "eleven_multilingual_v2",
          // Single words with no sentence context: high stability keeps the
          // delivery even and dictionary-like rather than theatrical, which is
          // what a pronunciation model needs to be.
          voice_settings: { stability: 0.7, similarity_boost: 0.8, style: 0, use_speaker_boost: true },
        }),
      });

      if (res.status === 401 || res.status === 402) {
        // Out of credits, or the key lost permission. Either way, stop the whole
        // run rather than burning through 500 identical failures.
        quotaStop = `${res.status} ${(await res.text()).slice(0, 300)}`;
        return;
      }
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 1200 * attempt));
        continue;
      }
      if (!res.ok) {
        const body = (await res.text()).slice(0, 200);
        if (/quota|credit|exceed/i.test(body)) { quotaStop = `${res.status} ${body}`; return; }
        throw new Error(`${res.status} ${body}`);
      }

      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error(`suspiciously small response (${buf.length} bytes)`);
      writeFileSync(out, buf);
      done++; usedChars += job.spanish.length;
      if (done % 25 === 0) console.log(`  ${done}/${pending.length} …`);
      return;
    } catch (err) {
      if (attempt === 4) {
        failed++;
        console.error(`  ✗ ${job.audio} (${job.spanish}): ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
      await new Promise((r) => setTimeout(r, 1200 * attempt));
    }
  }
}

async function main() {
  const queue = pending.slice(0, Number.isFinite(LIMIT) ? LIMIT : undefined);
  const CONCURRENCY = 4;
  let cursor = 0;

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (cursor < queue.length && !quotaStop) {
        const job = queue[cursor++];
        await one(job);
      }
    })
  );

  console.log(`\ngenerated : ${done}`);
  console.log(`failed    : ${failed}`);
  console.log(`chars used: ${usedChars.toLocaleString()}`);
  if (quotaStop) {
    console.log(`\nSTOPPED — the API refused further requests:\n  ${quotaStop}`);
    console.log(`${pending.length - done} clips still missing. Re-run this script after topping up; it resumes.`);
  } else if (done === queue.length && queue.length === pending.length) {
    console.log("\nAll referenced vocabulary clips now exist.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
