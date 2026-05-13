import { ElevenLabsClient } from "elevenlabs";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import type { AudioScript, VoiceKey, VoiceSettings } from "./types.js";

// ─── Project root ─────────────────────────────────────────────────────────────
// elevenlabs-client.ts lives at <root>/scripts/generate-audio/
// → two levels up = project root
const __filenameLocal = fileURLToPath(import.meta.url);
const __dirnameLocal  = dirname(__filenameLocal);
const PROJECT_ROOT    = join(__dirnameLocal, "..", "..");

// ─── Voice setting normalization ──────────────────────────────────────────────
// Accept both 0-1 and 0-100 ranges for stability/similarityBoost/style.
// (speed is a multiplier like 0.88, so it is never divided by 100)
function normalizeSetting(val: number): number {
  return val > 1 ? val / 100 : val;
}

// ─── Env helpers ─────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `  → Add it to your .env.local file (see .env.local.example for reference)`
    );
  }
  return value.trim();
}

function resolveVoiceId(voiceKey: VoiceKey): string {
  const envMap: Record<VoiceKey, string> = {
    female1: "ELEVENLABS_VOICE_FEMALE_1",
    male1:   "ELEVENLABS_VOICE_MALE_1",
    female2: "ELEVENLABS_VOICE_FEMALE_2",
    male2:   "ELEVENLABS_VOICE_MALE_2",
  };
  return requireEnv(envMap[voiceKey]);
}

// ─── Character counting ───────────────────────────────────────────────────────
// ElevenLabs does not count <break time="Xs"/> SSML tags against the quota.
// Strip them before counting to get an accurate estimate.

const BREAK_TAG_REGEX = /<break\s+time="[^"]*"\s*\/>/g;

function countBillableChars(text: string): number {
  return text.replace(BREAK_TAG_REGEX, "").length;
}

// ─── Stream → Buffer ──────────────────────────────────────────────────────────

async function streamToBuffer(stream: AsyncIterable<Buffer | Uint8Array>): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

// ─── Silence ─────────────────────────────────────────────────────────────────
// Minimal valid 0.5 s / 44.1 kHz silent MP3 frame block.
// Used as a separator when fluent-ffmpeg is unavailable.
// Note: raw-concatenated MP3 files work for CBR streams but may produce a
// brief click at the join; for production, install fluent-ffmpeg.

async function buildSilenceBuffer(durationMs: number): Promise<Buffer | null> {
  try {
    // Prefer ffmpeg to generate mathematically correct silence
    const ffmpeg = await import("fluent-ffmpeg");
    const tmp = join(PROJECT_ROOT, ".audio-tmp-silence.mp3");
    await new Promise<void>((resolve, reject) => {
      ffmpeg
        .default()
        .input("anullsrc=r=44100:cl=stereo")
        .inputFormat("lavfi")
        .duration(durationMs / 1000)
        .audioCodec("libmp3lame")
        .audioBitrate("128k")
        .output(tmp)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });
    const { readFileSync, unlinkSync } = await import("fs");
    const buf = readFileSync(tmp);
    unlinkSync(tmp);
    return buf;
  } catch {
    return null; // fluent-ffmpeg unavailable — caller will handle
  }
}

// ─── Single API call ──────────────────────────────────────────────────────────

async function generateOneLine(
  client: ElevenLabsClient,
  voiceId: string,
  text: string,
  settings: VoiceSettings
): Promise<Buffer> {
  const response = await client.textToSpeech.convert(voiceId, {
    model_id: "eleven_multilingual_v2",
    text,
    voice_settings: {
      stability:        normalizeSetting(settings.stability),
      similarity_boost: normalizeSetting(settings.similarityBoost),
      style:            normalizeSetting(settings.style),
      use_speaker_boost: true,
      // speed is not part of the standard ElevenLabs VoiceSettings type
      // but newer model versions accept it; we cast to allow it
      ...(settings.speed !== 1.0 ? { speed: settings.speed } : {}),
    } as Parameters<ElevenLabsClient["textToSpeech"]["convert"]>[1]["voice_settings"],
  });

  // The SDK returns a Node.js Readable-compatible async iterable
  return streamToBuffer(response as unknown as AsyncIterable<Buffer>);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateAudio(
  script: AudioScript
): Promise<{ charactersUsed: number }> {
  // 1. Validate env
  const apiKey = requireEnv("ELEVENLABS_API_KEY");
  const client = new ElevenLabsClient({ apiKey });

  // 2. Resolve output path (strip leading slash so join works on all OS)
  const relPath = script.outputPath.replace(/^[/\\]/, "");
  const absOutputPath = join(PROJECT_ROOT, relPath);
  const outputDir = dirname(absOutputPath);

  // 3. Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log(`  📁 Created directory: ${outputDir}`);
  }

  let totalChars = 0;

  if (script.lines.length === 1) {
    // ── Single line — one API call ──────────────────────────────────────────
    const line = script.lines[0];
    const voiceId = resolveVoiceId(line.voiceKey);
    const chars = countBillableChars(line.text);
    totalChars += chars;

    console.log(`  → Generating [${line.voiceKey}, ${chars} chars]...`);
    const buf = await generateOneLine(client, voiceId, line.text, script.voiceSettings);
    writeFileSync(absOutputPath, buf);
    console.log(`  ✓ Written: ${script.outputPath} (${buf.byteLength} bytes)`);
  } else {
    // ── Multi-line — generate each, then stitch ─────────────────────────────
    const silenceMs = 500;
    let silenceBuf: Buffer | null = null;
    let useFfmpeg = true;

    // Try to get a proper silence buffer
    silenceBuf = await buildSilenceBuffer(silenceMs);
    if (!silenceBuf) {
      useFfmpeg = false;
      console.warn(
        "  ⚠  fluent-ffmpeg not found — stitching raw MP3 buffers.\n" +
        "     Audio seams may be audible. Install fluent-ffmpeg for cleaner output:\n" +
        "       npm install -D fluent-ffmpeg @types/fluent-ffmpeg"
      );
    } else {
      console.log(`  ✓ Using fluent-ffmpeg for ${silenceMs}ms silence padding`);
    }

    const partBuffers: Buffer[] = [];

    for (let i = 0; i < script.lines.length; i++) {
      const line = script.lines[i];
      const voiceId = resolveVoiceId(line.voiceKey);
      const chars = countBillableChars(line.text);
      totalChars += chars;

      console.log(
        `  → Generating line ${i + 1}/${script.lines.length} [${line.voiceKey}, ${chars} chars]...`
      );
      const buf = await generateOneLine(client, voiceId, line.text, script.voiceSettings);
      partBuffers.push(buf);
      console.log(`    done (${buf.byteLength} bytes)`);
    }

    // Stitch with silence between parts
    const stitched: Buffer[] = [];
    for (let i = 0; i < partBuffers.length; i++) {
      stitched.push(partBuffers[i]);
      if (i < partBuffers.length - 1) {
        stitched.push(silenceBuf ?? Buffer.alloc(0));
      }
    }

    const finalBuf = Buffer.concat(stitched);
    writeFileSync(absOutputPath, finalBuf);
    console.log(
      `  ✓ Written: ${script.outputPath} (${finalBuf.byteLength} bytes, ${useFfmpeg ? "ffmpeg-stitched" : "raw concat"})`
    );
  }

  return { charactersUsed: totalChars };
}

// ─── Dry-run helper ───────────────────────────────────────────────────────────
// Does NOT call the API. Returns estimated character count for the script.

export function dryRunScript(script: AudioScript): number {
  const total = script.lines.reduce(
    (sum, line) => sum + countBillableChars(line.text),
    0
  );

  const voiceLabel = script.lines.length === 1
    ? `${script.lines[0].voiceKey}`
    : script.lines.map((l) => l.voiceKey).join(", ");

  console.log(
    `  [Unit ${script.unitNumber}] ${script.outputPath}\n` +
    `    "${script.description}"\n` +
    `    voices: ${voiceLabel}  ·  ~${total} chars  ·  ${script.lines.length} line(s)\n`
  );

  return total;
}
