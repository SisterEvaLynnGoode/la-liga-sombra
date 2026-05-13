"use client";

import { useState, useRef } from "react";

interface VocabPair { spanish: string; english: string; audio?: string }

interface Props {
  onImport: (pairs: VocabPair[]) => void;
}

function parseCsv(text: string): VocabPair[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  const pairs: VocabPair[] = [];
  for (const line of lines) {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length < 2) continue;
    const [spanish, english, audio] = cols;
    if (!spanish || !english || spanish.toLowerCase() === "spanish") continue; // skip header
    pairs.push({ spanish, english, ...(audio ? { audio } : {}) });
  }
  return pairs;
}

export default function VocabCsvImporter({ onImport }: Props) {
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<VocabPair[]>([]);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleParse() {
    const pairs = parseCsv(csvText);
    setParsed(pairs);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      setParsed(parseCsv(text));
    };
    reader.readAsText(file);
  }

  function speak(word: string) {
    if (!("speechSynthesis" in window)) { alert("Your browser doesn't support text-to-speech."); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(word);
    utt.lang = "es-MX";
    utt.rate = 0.85;
    setSpeaking(word);
    utt.onend = () => setSpeaking(null);
    window.speechSynthesis.speak(utt);
  }

  function speakAll() {
    if (!("speechSynthesis" in window)) { alert("Your browser doesn't support text-to-speech."); return; }
    window.speechSynthesis.cancel();
    const words = parsed.map((p) => p.spanish);
    let i = 0;
    function next() {
      if (i >= words.length) { setSpeaking(null); return; }
      const utt = new SpeechSynthesisUtterance(words[i]);
      utt.lang = "es-MX";
      utt.rate = 0.8;
      setSpeaking(words[i]);
      utt.onend = () => { i++; setTimeout(next, 500); };
      window.speechSynthesis.speak(utt);
    }
    next();
  }

  function copyJson() {
    navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
  }

  return (
    <div className="space-y-5">
      {/* Instructions */}
      <div className="border border-[rgba(201,147,58,0.2)] bg-[rgba(201,147,58,0.04)] px-4 py-3">
        <p className="font-typewriter text-xs text-[#c4a882] mb-1">Expected CSV format:</p>
        <code className="font-typewriter text-[10px] text-[#e8b455] block">
          spanish,english,audio_filename<br />
          hola,hello,hola.mp3<br />
          adiós,goodbye,adios.mp3<br />
          gracias,thank you
        </code>
        <p className="font-typewriter text-[10px] text-[#8b7355] mt-2">
          • Header row is optional — detected automatically<br />
          • <code>audio_filename</code> column is optional<br />
          • Commas inside values: wrap in quotes<br />
          • Accents are preserved
        </p>
      </div>

      {/* File upload + textarea */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-[rgba(201,147,58,0.25)] text-[#8b7355] hover:text-[#c9933a] transition-colors"
          >
            ↑ Upload CSV file
          </button>
          <span className="font-typewriter text-[10px] text-[#4a3a2a]">or paste below</span>
        </div>
        <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" aria-label="Upload CSV file" />
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={6}
          className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-2 font-typewriter text-xs text-[#f5e6c8] placeholder-[#3a3028] resize-y"
          placeholder="hola,hello&#10;adiós,goodbye&#10;gracias,thank you"
        />
        <button
          onClick={handleParse}
          className="clip-skew px-5 py-2 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
        >
          Analizar CSV →
        </button>
      </div>

      {/* Parsed results */}
      {parsed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-typewriter text-sm text-[#e8b455]">{parsed.length} palabras encontradas</p>
            <div className="flex gap-2">
              <button
                onClick={speakAll}
                disabled={!!speaking}
                className="font-typewriter text-[10px] tracking-widest uppercase px-3 py-1.5 border border-[rgba(201,147,58,0.2)] text-[#8b7355] hover:text-[#c9933a] transition-colors disabled:opacity-50"
                title="Play each Spanish word using browser text-to-speech (Spanish Mexico voice)"
              >
                🔊 Escuchar todo
              </button>
              <button
                onClick={copyJson}
                className="font-typewriter text-[10px] tracking-widest uppercase px-3 py-1.5 border border-[rgba(201,147,58,0.2)] text-[#8b7355] hover:text-[#c9933a] transition-colors"
              >
                ⎘ Copiar JSON
              </button>
            </div>
          </div>

          <div className="border border-[rgba(201,147,58,0.15)] max-h-64 overflow-y-auto">
            <table className="w-full">
              <thead className="border-b border-[rgba(201,147,58,0.1)]">
                <tr>
                  {["Español", "English", "Audio", "▶"].map((h) => (
                    <th key={h} className="text-left py-1.5 px-3 font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#8b7355]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.map((p, i) => (
                  <tr key={i} className={`border-b border-[rgba(201,147,58,0.05)] ${speaking === p.spanish ? "bg-[rgba(201,147,58,0.08)]" : ""}`}>
                    <td className="py-1.5 px-3 font-display text-sm text-[#f5e6c8]">{p.spanish}</td>
                    <td className="py-1.5 px-3 font-typewriter text-xs text-[#c4a882]">{p.english}</td>
                    <td className="py-1.5 px-3 font-typewriter text-[10px] text-[#4a3a2a]">{p.audio ?? "—"}</td>
                    <td className="py-1.5 px-3">
                      <button
                        onClick={() => speak(p.spanish)}
                        aria-label={`Pronounce ${p.spanish}`}
                        className="font-typewriter text-xs text-[#8b7355] hover:text-[#c9933a] transition-colors"
                      >
                        ▶
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TTS note */}
          <div className="border border-[rgba(201,147,58,0.1)] bg-[rgba(201,147,58,0.03)] px-3 py-2">
            <p className="font-typewriter text-[10px] text-[#8b7355] leading-relaxed">
              <strong className="text-[#c9933a]">🔊 Browser TTS pronunciation check</strong> — Use the ▶ buttons to hear how each word sounds
              using Spanish (Mexico) voice. This is for verification only — it cannot generate downloadable MP3 files.
            </p>
            <p className="font-typewriter text-[10px] text-[#4a3a2a] mt-1.5 leading-relaxed">
              <strong>To generate audio files:</strong> Use{" "}
              <strong>Google Text-to-Speech</strong> (console.cloud.google.com/apis/library/texttospeech.googleapis.com),{" "}
              <strong>ElevenLabs</strong>, or record yourself and export as .mp3.
              Drop files in <code>/public/audio/unit-0N/</code> and reference them in the vocab as <code>&quot;audio&quot;: &quot;/audio/unit-0N/word.mp3&quot;</code>.
            </p>
          </div>

          <button
            onClick={() => onImport(parsed)}
            className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            Importar {parsed.length} palabras →
          </button>
        </div>
      )}
    </div>
  );
}
