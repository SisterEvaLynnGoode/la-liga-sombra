/**
 * Resilient Spanish audio playback.
 *
 * Much of the per-word vocab audio referenced in unit content was never
 * generated (the files 404), which left listening questions silent. This
 * helper tries the mp3 first and falls back to the browser's built-in
 * speech synthesis with a Spanish voice — free, offline, available on
 * Chromebooks — so listening practice keeps working with zero assets.
 *
 * Returns "audio" | "tts" | "none" so callers can adapt their UI.
 */

export type PlayResult = "audio" | "tts" | "none";

export function speakSpanish(text: string, rate = 0.9): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const es = voices.find((v) => /^es[-_]/i.test(v.lang) || v.lang === "es");
    if (es) u.voice = es;
    u.lang = es?.lang ?? "es-MX";
    u.rate = rate;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

/**
 * Play `url` if it loads; otherwise speak `text` via TTS.
 * Resolves with which path actually produced sound.
 */
export function playSpanishAudio(url: string | undefined, text: string): Promise<PlayResult> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(speakSpanish(text) ? "tts" : "none");
      return;
    }
    const audio = new Audio(url);
    let settled = false;
    const fallback = () => {
      if (settled) return;
      settled = true;
      resolve(speakSpanish(text) ? "tts" : "none");
    };
    audio.addEventListener("error", fallback);
    audio.play().then(() => {
      if (!settled) { settled = true; resolve("audio"); }
    }).catch(fallback);
  });
}
