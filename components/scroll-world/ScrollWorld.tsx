"use client";

import { useEffect, useRef } from "react";
import { mountScrollWorld } from "@/lib/scroll-world/scrub-engine";
import { WORLDS, worldAsset, type WorldConfig } from "@/lib/scroll-world/worlds";

interface Props {
  unitNumber: number;
  /** Final-section call-to-action. Student → enter case; teacher → back to dashboard. */
  cta?: { primaryLabel: string; primaryHref: string; secondaryLabel?: string; secondaryHref?: string };
}

export default function ScrollWorld({ unitNumber, cta }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const world: WorldConfig | undefined = WORLDS[unitNumber];
    if (!el || !world) return;

    const sections = world.sections.map((s, i) => {
      const isLast = i === world.sections.length - 1;
      return {
        id: s.id,
        label: s.label,
        accent: s.accent,
        eyebrow: s.eyebrow,
        title: s.title,
        body: s.body,
        tags: s.tags,
        scroll: s.scroll,
        linger: s.linger,
        still: worldAsset(unitNumber, i, "still"),
        clip: worldAsset(unitNumber, i, "clip"),
        ...(isLast && cta
          ? {
              cta: {
                primary: { label: cta.primaryLabel, href: cta.primaryHref },
                ...(cta.secondaryLabel && cta.secondaryHref
                  ? { secondary: { label: cta.secondaryLabel, href: cta.secondaryHref } }
                  : {}),
              },
            }
          : {}),
      };
    });

    mountScrollWorld(el, {
      brand: { name: `La Liga Sombra · ${world.city}` },
      diveScroll: 1.4,
      crossfade: 0.1,
      nav: true,
      atmosphere: true,
      hint: "desliza para volar por la ciudad",
      sections,
      connectors: [], // architecture A: forward-flight legs chain directly, no connectors
    });

    // React re-mount / strict-mode safety: clear the engine's generated DOM on cleanup.
    return () => { el.replaceChildren(); };
  }, [unitNumber, cta]);

  // Dark noir theme for the engine (its defaults are light; a container-level
  // override wins because the engine scopes its tokens under @layer sw).
  const theme = {
    width: "100%",
    ["--sw-bg" as string]: "#0d0b0a",
    ["--sw-ink" as string]: "#f5e6c8",
    ["--sw-ink-soft" as string]: "#8b7355",
    ["--sw-accent" as string]: "#e8b455",
    ["--sw-font-display" as string]: "Georgia, 'Times New Roman', serif",
    ["--sw-font-body" as string]: "'Courier New', ui-monospace, monospace",
  } as React.CSSProperties;

  return <div ref={ref} className="sw-mount" style={theme} />;
}
