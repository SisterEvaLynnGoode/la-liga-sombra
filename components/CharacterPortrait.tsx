"use client";

/**
 * CharacterPortrait — single source of truth for rendering character images.
 *
 * Priority order:
 *   1. manifest lookup by characterId (canonical, cache-busted)
 *   2. imageUrl prop fallback
 *   3. Styled "Imagen no disponible" placeholder
 *
 * All character images in the game should route through this component.
 * Never use <img> or <Image> tags for characters directly.
 */

import Image from "next/image";
import { useState, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PortraitSize = "small" | "medium" | "large";

interface Props {
  characterId?: string;   // primary: used for manifest lookup + cache busting
  imageUrl?: string;      // fallback if characterId lookup fails
  altText: string;
  size?: PortraitSize;
  showName?: boolean;
  name?: string;
  role?: string;
  className?: string;
  grayscale?: boolean;
  unitId?: string;        // for error flag context
}

// ── Manifest cache (module-level singleton, fetched once) ─────────────────────

interface ManifestEntry {
  characterId: string;
  publicUrl: string;
  version?: string;
  status: string;
}

let manifestCache: ManifestEntry[] | null = null;
let manifestFetchPromise: Promise<ManifestEntry[]> | null = null;

async function getManifest(): Promise<ManifestEntry[]> {
  if (manifestCache) return manifestCache;
  if (manifestFetchPromise) return manifestFetchPromise;

  manifestFetchPromise = fetch("/images/characters/manifest.json", { cache: "no-store" })
    .then((r) => r.json())
    .then((data: ManifestEntry[]) => {
      manifestCache = data;
      return data;
    })
    .catch(() => {
      manifestCache = [];
      return [];
    });

  return manifestFetchPromise;
}

function lookupManifest(
  manifest: ManifestEntry[],
  characterId: string | undefined
): string | null {
  if (!characterId || !manifest.length) return null;
  const entry = manifest.find((e) => e.characterId === characterId && e.status === "approved");
  if (!entry) return null;
  // Append version hash for cache busting
  return entry.version ? `${entry.publicUrl}?v=${entry.version}` : entry.publicUrl;
}

// ── Fire-and-forget failure flag ──────────────────────────────────────────────
async function logImageFailure(characterId: string | undefined, unitId: string | undefined) {
  if (!characterId) return;
  try {
    await fetch("/api/game/student-flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flagType: "image_load_failed",
        unitId: unitId ?? null,
        context: { characterId },
      }),
    });
  } catch { /* silent */ }
}

// ── Size config ───────────────────────────────────────────────────────────────

const SIZE_CONFIG: Record<PortraitSize, { w: number; h: number; cls: string }> = {
  small:  { w:  64, h:  64, cls: "w-16 h-16" },
  medium: { w: 120, h: 160, cls: "w-[120px] h-[160px]" },
  large:  { w: 240, h: 320, cls: "w-60 h-80" },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CharacterPortrait({
  characterId,
  imageUrl,
  altText,
  size = "medium",
  showName = false,
  name,
  role,
  className = "",
  grayscale = false,
  unitId,
}: Props) {
  const { w, h, cls } = SIZE_CONFIG[size];

  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");

  // ── Resolve the image URL on mount ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      const manifest = await getManifest();
      if (cancelled) return;

      // 1. Try manifest lookup
      const manifestUrl = lookupManifest(manifest, characterId);
      if (manifestUrl) {
        setResolvedSrc(manifestUrl);
        setPhase("loading");
        return;
      }

      // 2. Try imageUrl prop
      if (imageUrl && imageUrl.trim()) {
        setResolvedSrc(imageUrl);
        setPhase("loading");
        return;
      }

      // 3. No source available
      setPhase("error");
    }

    resolve();
    return () => { cancelled = true; };
  }, [characterId, imageUrl]);

  // ── Placeholder skeleton (shown while loading) ────────────────────────────
  function LoadingPlaceholder() {
    return (
      <div
        className={`${cls} bg-[#1a1614] border border-[rgba(201,147,58,0.15)] flex flex-col items-center justify-center gap-1 ${className}`}
        aria-label="Cargando imagen..."
      >
        <div className="w-8 h-8 border-2 border-[rgba(201,147,58,0.3)] border-t-[#c9933a] rounded-full animate-spin" />
        <p className="font-typewriter text-[9px] text-[#4a3a2a] uppercase tracking-wider mt-1">
          Cargando...
        </p>
      </div>
    );
  }

  // ── Error placeholder ─────────────────────────────────────────────────────
  function ErrorPlaceholder() {
    return (
      <div
        className={`${cls} bg-[#1a1614] border border-[rgba(201,147,58,0.15)] flex flex-col items-center justify-center gap-1 px-2 text-center ${className}`}
        aria-label={`Imagen no disponible: ${altText}`}
      >
        <span className="text-2xl text-[#4a3a2a]">?</span>
        {name && (
          <p className="font-typewriter text-[9px] text-[#8b7355] leading-tight line-clamp-2">
            {name}
          </p>
        )}
        {role && (
          <p className="font-typewriter text-[8px] text-[#4a3a2a] leading-tight line-clamp-1">
            {role}
          </p>
        )}
        <p className="font-typewriter text-[8px] text-[#3a2a1a] uppercase tracking-wider">
          Sin imagen
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Image area */}
      <div className={`${cls} relative overflow-hidden bg-[#1a1614] border border-[rgba(201,147,58,0.15)] shrink-0`}>
        {/* Loading skeleton — shown until image loads or error */}
        {phase === "loading" && !resolvedSrc && <LoadingPlaceholder />}

        {/* Error state */}
        {phase === "error" && <ErrorPlaceholder />}

        {/* Actual image */}
        {resolvedSrc && phase !== "error" && (
          <Image
            src={resolvedSrc}
            alt={altText}
            width={w}
            height={h}
            loading="lazy"
            className={`w-full h-full object-cover object-top transition-opacity duration-300 ${
              phase === "ready" ? "opacity-100" : "opacity-0"
            } ${grayscale ? "grayscale contrast-110" : ""}`}
            onLoad={() => setPhase("ready")}
            onError={() => {
              // If manifest URL fails, try falling back to imageUrl
              if (resolvedSrc !== imageUrl && imageUrl) {
                setResolvedSrc(imageUrl);
              } else {
                setPhase("error");
                logImageFailure(characterId, unitId);
              }
            }}
            unoptimized={resolvedSrc.startsWith("/")}  // local static files don't need Next optimization
          />
        )}

        {/* Loading skeleton overlay while image is fetching */}
        {phase === "loading" && resolvedSrc && (
          <div className="absolute inset-0 bg-[#1a1614] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[rgba(201,147,58,0.3)] border-t-[#c9933a] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Name + role labels */}
      {showName && name && (
        <p className="font-typewriter text-[10px] text-[#8b7355] text-center leading-tight">
          {name}
        </p>
      )}
      {showName && role && (
        <p className="font-typewriter text-[9px] text-[#4a3a2a] text-center leading-tight">
          {role}
        </p>
      )}
    </div>
  );
}
