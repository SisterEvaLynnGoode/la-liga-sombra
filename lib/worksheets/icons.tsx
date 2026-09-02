/**
 * Line-art icons for the printable vocabulary packets.
 *
 * WHY SVG AND NOT GENERATED ART
 *
 * These get photocopied. A rendered illustration turns to grey mush on a school
 * copier at 1cm, and a set of them would add megabytes to the repo for pictures
 * that exist to say "this word means bus". Flat stroked paths stay crisp at any
 * size, print pure black on white, weigh nothing, and never need regenerating.
 *
 * Only CONCRETE things get an icon. «aprender» and «comprender» are drawn by
 * nobody convincingly, and a vague picture next to a word is worse than no
 * picture — students memorise the wrong thing. Words with no entry here simply
 * render as text, which is the intended behaviour, not a gap.
 *
 * All icons share a 24×24 box, no fill, and currentColor, so they inherit the
 * print stylesheet's black like any other text.
 */

import type { ReactNode } from "react";

const P = (d: string) => <path d={d} />;

/**
 * Keyed by the exact Spanish string used in the unit vocabulary, so a packet
 * can look an icon up straight from the word it is printing.
 */
const ICONS: Record<string, ReactNode> = {
  // ── Madrid landmarks (Caso 3) ───────────────────────────────────────────
  "la Puerta del Sol": (
    <>
      <circle cx="12" cy="12" r="4" />
      {P("M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4")}
    </>
  ),
  "el Museo del Prado": (
    <>
      {P("M3 20h18M4 20V10M8 20V10M12 20V10M16 20V10M20 20V10M2 10h20L12 4 2 10Z")}
    </>
  ),
  "el Parque del Retiro": (
    <>
      {P("M12 21v-5")}
      <circle cx="12" cy="10" r="6" />
      {P("M4 21h16")}
    </>
  ),
  "la Gran Vía": (
    <>
      {P("M4 21L9 3M20 21L15 3M11 21v-3M13 12V9M11 6V3")}
    </>
  ),
  "la Estación de Atocha": (
    <>
      <rect x="5" y="4" width="14" height="12" rx="2" />
      {P("M5 11h14M8 19l-2 2M16 19l2 2M7 16v3h10v-3")}
      <circle cx="9" cy="13.5" r=".8" />
      <circle cx="15" cy="13.5" r=".8" />
    </>
  ),

  // ── Places (Caso 3) ─────────────────────────────────────────────────────
  "el aeropuerto": (
    <>
      {P("M9 21V9l3-6 3 6v12M9 12h6M3 21h18M5 21v-3h4M19 21v-3h-4")}
    </>
  ),
  "el hotel": (
    <>
      {P("M2 19v-8M2 15h20v4M22 19v-6a2 2 0 0 0-2-2h-9v4")}
      <circle cx="7" cy="12.5" r="2" />
    </>
  ),
  "la farmacia": <>{P("M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z")}</>,
  "el restaurante": <>{P("M6 3v8a2 2 0 0 0 4 0V3M8 11v10M17 3c-1.5 1-2 3-2 5s.5 3 2 3v10")}</>,
  "el mercado": (
    <>
      {P("M3 9l2-5h14l2 5M3 9h18M3 9c0 2 4 2 4 0 0 2 4 2 4 0 0 2 4 2 4 0 0 2 4 2 4 0M5 11v9h14v-9")}
    </>
  ),
  "la plaza": (
    <>
      {P("M12 4v6M8 10h8l-1 4H9zM10 14v4M14 14v4M6 21h12M9 8c0-2 6-2 6 0")}
    </>
  ),
  "la calle": <>{P("M6 3v18M18 3v18M12 4v3M12 10v3M12 16v3")}</>,
  "el banco": (
    <>
      <rect x="2" y="6" width="20" height="12" rx="1.5" />
      <circle cx="12" cy="12" r="3" />
      {P("M12 9.2v5.6M10.9 10.4h2.2M10.9 13.6h2.2M5 9v6M19 9v6")}
    </>
  ),
  "la comisaría": (
    <>
      {P("M12 3l7 3v6c0 5-3 7-7 9-4-2-7-4-7-9V6l7-3Z")}
      <circle cx="12" cy="11" r="2.5" />
    </>
  ),

  // ── Transport (Caso 3) ──────────────────────────────────────────────────
  "el metro": (
    <>
      <circle cx="12" cy="12" r="9" />
      {P("M8 16V9l4 5 4-5v7")}
    </>
  ),
  "el autobús": (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      {P("M3 10h18M7 17v2M17 17v2")}
      <circle cx="7.5" cy="14" r="1" />
      <circle cx="16.5" cy="14" r="1" />
    </>
  ),
  "el taxi": (
    <>
      <rect x="2" y="10" width="20" height="7" rx="2" />
      {P("M5 10l2-4h10l2 4M9 4h6v2H9z")}
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  ),
  "el tren": (
    <>
      <rect x="6" y="3" width="12" height="13" rx="2" />
      {P("M6 10h12M9 20l-2 2M15 20l2 2M8 16v4h8v-4")}
      <circle cx="9.5" cy="13" r=".8" />
      <circle cx="14.5" cy="13" r=".8" />
    </>
  ),
  "a pie": (
    <>
      <circle cx="13" cy="4" r="2" />
      {P("M13 7l-2 5 3 3v6M11 12L8 15M14 10l4 2")}
    </>
  ),
  "la bicicleta": (
    <>
      <circle cx="6" cy="17" r="4" />
      <circle cx="18" cy="17" r="4" />
      {P("M6 17l4-8h5l3 8M10 9h6M14 9l-3 8")}
    </>
  ),
  "el coche": (
    <>
      {P("M3 16v-4l2-5h14l2 5v4M3 16h18M6 16v2M18 16v2M5 12h14")}
      <circle cx="7.5" cy="13.5" r="1" />
      <circle cx="16.5" cy="13.5" r="1" />
    </>
  ),
  "el avión": <>{P("M2 13l20-6-6 14-3-6-6-1zM11 15l-3 5")}</>,

  // ── -ER verbs (Caso 3) ──────────────────────────────────────────────────
  comer: (
    <>
      <circle cx="12" cy="13" r="7" />
      <circle cx="12" cy="13" r="3.5" />
      {P("M3 6v4M21 6v4")}
    </>
  ),
  beber: <>{P("M6 4h12l-1.5 14a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2L6 4ZM6.6 10h10.8")}</>,
  correr: (
    <>
      <circle cx="15" cy="4" r="2" />
      {P("M15 7l-3 4 3 3v6M12 11L7 12M15 10l4 3M4 8h4M3 12h3")}
    </>
  ),
  leer: <>{P("M12 6C9 3.5 5.5 4 3 5v14c2.5-1 6-1.5 9 1 3-2.5 6.5-2 9-1V5c-2.5-1-6-1.5-9 1ZM12 6v14")}</>,
  vender: (
    <>
      {P("M3 12V4h8l10 10-8 8L3 12Z")}
      <circle cx="7.5" cy="7.5" r="1.4" />
    </>
  ),
  ver: (
    <>
      {P("M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z")}
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),

  // ── -IR verbs (Caso 4) ──────────────────────────────────────────────────
  vivir: <>{P("M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6")}</>,
  escribir: <>{P("M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM14 6l4 4")}</>,
  abrir: (
    <>
      {P("M4 21V4h11v17M15 4l5 2v15h-5")}
      <circle cx="12" cy="13" r="1" />
    </>
  ),
  recibir: <>{P("M3 6h18v12H3zM3 6l9 7 9-7")}</>,
  compartir: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      {P("M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6")}
    </>
  ),
};

export function hasIcon(spanish: string): boolean {
  return spanish in ICONS;
}

/** One icon, or null when the word has no honest picture. */
export function VocabIcon({ spanish, size = 34 }: { spanish: string; size?: number }) {
  const glyph = ICONS[spanish];
  if (!glyph) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  );
}
