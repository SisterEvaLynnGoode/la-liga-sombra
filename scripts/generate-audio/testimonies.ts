#!/usr/bin/env tsx
/**
 * Generate the narrative testimony clip for each caso's listeningComp stage.
 *
 * The per-word vocabulary generator (vocab.ts) covers single terms. This covers
 * the other kind of audio a caso needs: one witness speaking for twenty or
 * thirty seconds, which is the only stage that trains real listening rather
 * than word recognition.
 *
 * The transcript is read straight out of the unit JSON, so the audio and the
 * on-screen transcript can never drift apart — a student who reveals the
 * transcript after failing must see exactly what they heard.
 *
 * CASTING. Every witness is a different person, so every witness gets a
 * different voice. The project's own two custom voices are not enough for
 * twelve speakers, but premade library voice IDs still synthesize on this key,
 * which brings it to six. Voices are assigned per unit below and recorded here
 * rather than chosen at random, so a re-run reproduces the same cast.
 *
 * These are English-centred voices speaking Spanish through the multilingual
 * model. They are good enough for "a different person is talking"; they are NOT
 * good enough to carry authentic regional accents, which is exactly why the
 * Arc B casos put the regional tells in the WORDS (orale, asere, truje) rather
 * than in the pronunciation.
 *
 *   npx tsx scripts/generate-audio/testimonies.ts --dry-run
 *   npx tsx scripts/generate-audio/testimonies.ts
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

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
if (!API_KEY) {
  console.error("Missing ELEVENLABS_API_KEY in .env.local");
  process.exit(1);
}

const OWN_F = (process.env.ELEVENLABS_VOICE_FEMALE_1 ?? "").trim();
const OWN_M = (process.env.ELEVENLABS_VOICE_MALE_1 ?? "").trim();

/** Premade library voices. Verified to synthesize on this key. */
const RACHEL = "21m00Tcm4TlvDq8ikWAM";
const BELLA  = "EXAVITQu4vr4xnSDxMaL";
const ANTONI = "ErXwobaYiN019PkySvjV";
const ADAM   = "pNInz6obpgDQGcFmaJgB";

/** unit -> voice. One witness, one voice, fixed so re-runs are reproducible. */
const CAST: Record<number, string> = {
  21: OWN_M,   // don Rodrigo, el del salón
  22: ADAM,    // el guardia del almacén
  23: OWN_F,   // Aurora, la restauradora
  24: ANTONI,  // el de la cámara tres
  25: ADAM,    // Rogelio, ingeniero de sonido
  26: ANTONI,  // el pescador del puerto de Malabo
  27: OWN_F,   // Lupe, muralista de Boyle Heights
  28: BELLA,   // la dueña del café de El Barrio
  29: RACHEL,  // Yolanda, nieta de don Nica
  30: OWN_M,   // Yuniel, el de la ventanita
  31: ANTONI,  // Amadeo, santero de Chimayó
  32: BELLA,   // Nilda, cocinera de Chicago
};

interface Job { unit: number; out: string; text: string; voice: string }

const jobs: Job[] = [];
for (let n = 21; n <= 32; n++) {
  const file = join(ROOT, "content", `unit-${n}.json`);
  if (!existsSync(file)) continue;
  const d = JSON.parse(readFileSync(file, "utf-8")) as {
    stages?: Array<{ type: string; audioUrl?: string; transcript?: string }>;
  };
  const st = (d.stages ?? []).find((s) => s.type === "listeningComp");
  if (!st?.audioUrl || !st.transcript) continue;
  const voice = CAST[n];
  if (!voice) { console.error(`No voice cast for unit ${n}`); process.exit(1); }
  jobs.push({ unit: n, out: st.audioUrl, text: st.transcript, voice });
}

const pending = jobs.filter((j) => !existsSync(join(ROOT, "public", j.out.replace(/^\//, ""))));
const chars = pending.reduce((n, j) => n + j.text.length, 0);

console.log(`testimonies referenced : ${jobs.length}`);
console.log(`already on disk        : ${jobs.length - pending.length}`);
console.log(`to generate            : ${pending.length}`);
console.log(`billable characters    : ${chars.toLocaleString()}\n`);

if (process.argv.includes("--dry-run")) process.exit(0);

let done = 0, failed = 0;

// Wrapped in a main(): this tsconfig emits CJS, where top-level await is a build error.
async function main() {
  for (const job of pending) {
    const out = join(ROOT, "public", job.out.replace(/^\//, ""));
    mkdirSync(dirname(out), { recursive: true });
    let ok = false;

    for (let attempt = 1; attempt <= 4 && !ok; attempt++) {
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${job.voice}`, {
          method: "POST",
          headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            text: job.text,
            model_id: "eleven_multilingual_v2",
            // Lower stability than the single-word clips: this is a person telling
            // a story, and a flat dictionary read makes a witness sound like a
            // label. Still high enough to stay intelligible for a learner.
            voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.1, use_speaker_boost: true },
          }),
        });

        if (res.status === 401 || res.status === 402) {
          console.error(`\nQuota or auth stop at unit ${job.unit}: ${res.status} ${(await res.text()).slice(0, 200)}`);
          process.exit(1);
        }
        if (res.status === 429 || res.status >= 500) {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
          continue;
        }
        if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);

        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 4000) throw new Error(`suspiciously small (${buf.length} bytes)`);
        writeFileSync(out, buf);
        ok = true;
        done++;
        console.log(`  unit-${job.unit}  ${(buf.length / 1024).toFixed(0)} KB  ${job.out}`);
      } catch (err) {
        if (attempt === 4) {
          failed++;
          console.error(`  unit-${job.unit} FAILED: ${(err as Error).message}`);
        } else {
          await new Promise((r) => setTimeout(r, 1200 * attempt));
        }
      }
    }
  }

  console.log(`\ngenerated : ${done}`);
  console.log(`failed    : ${failed}`);
}

void main();
