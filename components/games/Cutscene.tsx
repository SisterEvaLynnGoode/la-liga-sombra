"use client";

import { useState, useRef, useEffect } from "react";
import CharacterPortrait from "@/components/CharacterPortrait";
import type { GameResult } from "@/lib/games/types";

export interface PostQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Props {
  videoUrl: string;
  subtitleUrl?: string;
  fallbackImage?: string;
  chiefName?: string;
  briefingLines?: string[];
  chiefImageUrl?: string;   // generated portrait
  postQuestion?: PostQuestion;
  onComplete: (result: GameResult) => void;
}

type Phase = "idle" | "playing" | "ended" | "question" | "error";

export default function Cutscene({
  videoUrl, subtitleUrl, fallbackImage, chiefName, chiefImageUrl,
  briefingLines = [], postQuestion, onComplete,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [skipVisible, setSkipVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  // Skip button appears after 3s of play
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setTimeout(() => setSkipVisible(true), 3000);
    return () => clearTimeout(t);
  }, [phase]);

  // Preflight: if the video URL 404s or returns 0×0 dimensions, fall back to
  // the text/image briefing rather than showing a black frame. Some browsers
  // don't fire `onerror` for missing files — they just play black.
  useEffect(() => {
    if (!videoUrl) return;
    let cancelled = false;
    fetch(videoUrl, { method: "HEAD" })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) setPhase((p) => (p === "idle" ? "error" : p));
      })
      .catch(() => {
        if (!cancelled) setPhase((p) => (p === "idle" ? "error" : p));
      });
    return () => { cancelled = true; };
  }, [videoUrl]);

  function handlePlay() {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setPhase("error"));
    setPhase("playing");
    startRef.current = Date.now();
  }

  function handleVideoEnd() {
    setElapsed(Math.round((Date.now() - startRef.current) / 1000));
    if (postQuestion) { setPhase("question"); }
    else { setPhase("ended"); finish(1, 0); }
  }

  function handleVideoError() { setPhase("error"); }

  // Belt-and-suspenders: when metadata loads, verify the video has real dimensions.
  // A 0×0 video (e.g. corrupted file) wouldn't fire onError but would render black.
  function handleVideoMetadata() {
    const v = videoRef.current;
    if (v && (v.videoWidth === 0 || v.videoHeight === 0)) {
      setPhase("error");
    }
  }

  function handleSkip() {
    videoRef.current?.pause();
    const t = Math.round((Date.now() - startRef.current) / 1000);
    if (postQuestion) { setPhase("question"); setElapsed(t); }
    else { finish(1, t); }
  }

  function handleAnswer(i: number) {
    if (answered) return;
    setSelectedAnswer(i);
    setAnswered(true);
    setTimeout(() => finish(i === postQuestion?.correctIndex ? 1 : 0, elapsed), 1200);
  }

  function finish(score: number, time: number) {
    onComplete({ score, maxScore: 1, timeSpent: time, attempts: 1 });
  }

  // Fallback: if video errors, show briefing-lines UI
  if (phase === "error" || (phase === "idle" && !videoUrl)) {
    return <FallbackBriefing chiefName={chiefName} chiefImageUrl={chiefImageUrl} briefingLines={briefingLines} fallbackImage={fallbackImage} onComplete={() => finish(1, 0)} />;
  }

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-48px)] bg-black items-center justify-center">
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted={muted}
        playsInline
        onLoadedMetadata={handleVideoMetadata}
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        className={`w-full max-h-[calc(100vh-200px)] object-contain ${phase === "idle" ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
      >
        {subtitleUrl && <track kind="subtitles" src={subtitleUrl} srcLang="es" label="Español" default />}
      </video>

      {/* Play overlay (idle state) */}
      {phase === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#0d0b0a]">
          <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] px-8 py-5 text-center max-w-sm">
            <p className="font-typewriter text-[10px] tracking-[0.35em] uppercase text-[#8b7355] mb-2">Mensaje Entrante</p>
            <p className="font-display font-bold text-lg text-[#f5e6c8]">Jefe {chiefName ?? "Ramírez"}</p>
            <p className="font-typewriter text-xs text-[#8b7355] mt-1">Video · {subtitleUrl ? "Subtítulos disponibles" : "Sin subtítulos"}</p>
          </div>
          <button onClick={handlePlay} className="w-20 h-20 rounded-full border-4 border-[#c9933a] bg-[rgba(201,147,58,0.1)] hover:bg-[rgba(201,147,58,0.2)] flex items-center justify-center text-4xl transition-all hover:scale-105">
            ▶
          </button>
          <p className="font-typewriter text-xs text-[#8b7355]">Presiona para recibir tu briefing</p>
        </div>
      )}

      {/* Controls bar (while playing) */}
      {(phase === "playing" || phase === "ended") && (
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-6">
          <button onClick={() => setMuted((m) => !m)} className="font-typewriter text-xs text-[#8b7355] hover:text-[#c9933a] transition-colors px-3 py-1.5 border border-[rgba(201,147,58,0.2)]">
            {muted ? "🔇 Activar audio" : "🔊 Silenciar"}
          </button>
          <div className="flex gap-3">
            {phase === "playing" && (
              <button
                onClick={() => { if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); } }}
                className="font-typewriter text-xs text-[#8b7355] hover:text-[#c9933a] transition-colors px-3 py-1.5 border border-[rgba(201,147,58,0.2)]"
              >
                ↺ Repetir
              </button>
            )}
            {skipVisible && phase === "playing" && (
              <button onClick={handleSkip} className="font-typewriter text-xs text-[#8b7355] hover:text-[#f5e6c8] transition-colors px-3 py-1.5 border border-[rgba(201,147,58,0.2)]">
                Saltar →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Post-question overlay */}
      {phase === "question" && postQuestion && (
        <div className="absolute inset-0 bg-[rgba(13,11,10,0.92)] flex flex-col items-center justify-center px-6 gap-5">
          <div className="w-full max-w-lg">
            <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">Pregunta de comprensión</p>
            <p className="font-display text-lg font-bold text-[#f5e6c8] mb-5">{postQuestion.question}</p>
            <div className="space-y-3">
              {postQuestion.options.map((opt, i) => {
                let style = "border-[rgba(201,147,58,0.2)] bg-[#1a1614] text-[#c4a882] hover:border-[rgba(201,147,58,0.5)]";
                if (answered) {
                  if (i === postQuestion.correctIndex) style = "border-[#c9933a] bg-[rgba(201,147,58,0.1)] text-[#e8b455]";
                  else if (i === selectedAnswer) style = "border-[#c0392b] bg-[rgba(192,57,43,0.08)] text-[#c0392b]";
                  else style = "border-[rgba(201,147,58,0.1)] bg-[#1a1614] text-[#4a3a2a] opacity-50";
                } else if (selectedAnswer === i) style = "border-[#c9933a] bg-[rgba(201,147,58,0.08)] text-[#e8b455]";
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                    className={`w-full text-left px-4 py-3 border font-typewriter text-sm transition-all ${style}`}>
                    <span className="text-[#8b7355] mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FallbackBriefing({ chiefName, chiefImageUrl, briefingLines, fallbackImage, onComplete }:
  { chiefName?: string; chiefImageUrl?: string; briefingLines: string[]; fallbackImage?: string; onComplete: () => void }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [started, setStarted] = useState(false);

  function next() {
    if (!started) { setStarted(true); return; }
    if (lineIndex < briefingLines.length - 1) setLineIndex((i) => i + 1);
    else onComplete();
  }

  return (
    <div className="relative min-h-[calc(100vh-48px)] bg-[#0d0b0a] flex flex-col items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(139,26,26,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-typewriter text-[10px] tracking-[0.4em] uppercase text-[#8b7355]">La Liga Sombra · Archivo Confidencial</p>
            <h1 className="font-display font-black text-2xl text-[#f5e6c8]">Briefing del Jefe</h1>
          </div>
          <div className="border-4 border-[#c0392b] px-3 py-1 opacity-90" style={{ transform: "rotate(-4deg)" }}>
            <span className="font-display font-black text-[#c0392b] text-sm tracking-[0.3em] uppercase">Clasificado</span>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#c9933a] to-transparent mb-6" />
        <div className="flex gap-5 mb-6">
          <div className="shrink-0">
            <CharacterPortrait
              characterId="chief-ramirez"
              imageUrl={chiefImageUrl ?? (fallbackImage ?? undefined)}
              altText={chiefName ?? "Jefe"}
              size="small"
              grayscale={!!fallbackImage}
              name={chiefName ?? undefined}
            />
          </div>
          <div className="flex-1 border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5 min-h-[120px] flex flex-col justify-between">
            {!started
              ? <div className="flex flex-col items-center justify-center h-full gap-3 text-center"><span className="text-4xl">📁</span><p className="font-typewriter text-sm text-[#8b7355]">Briefing clasificado entrante</p></div>
              : <><p className="font-typewriter text-sm text-[#c4a882] leading-relaxed">&ldquo;{briefingLines[lineIndex]}&rdquo;</p><p className="font-typewriter text-[10px] text-[#8b7355] mt-3 text-right">{lineIndex + 1} / {briefingLines.length}</p></>
            }
          </div>
        </div>
        {started && (
          <div className="flex justify-center gap-2 mb-5">
            {briefingLines.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i <= lineIndex ? "bg-[#c9933a]" : "bg-[#2c2220]"}`} />
            ))}
          </div>
        )}
        <button onClick={next} className="w-full clip-skew py-4 font-typewriter text-sm tracking-[0.25em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-all duration-200">
          {!started ? "Recibir Briefing →" : lineIndex < briefingLines.length - 1 ? "Continuar →" : "¡Comenzar Misión! →"}
        </button>
      </div>
    </div>
  );
}
