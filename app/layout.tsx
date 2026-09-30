import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Liga Sombra — Detective de Español",
  description:
    "A noir detective game for Spanish 1 students. Travel through Spanish-speaking countries, solve cases, and catch cultural treasure thieves.",
  // Keep Chrome's translator off the game. See the note on <html> below.
  other: { google: "notranslate" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
     * translate="no" is load-bearing, not a preference.
     *
     * The page is lang="es" and the school Chromebooks run Chrome in English,
     * so Chrome offered to translate the game and students said yes. The
     * translator swaps out the very text nodes React is tracking, and React
     * then crashes on its next update with "Failed to execute 'insertBefore' /
     * 'removeChild' on 'Node'" — nine crash reports across Casos 3 and 4, every
     * one of them on a CrOS device. Marking the app notranslate keeps the DOM
     * React's own, and it also stops a Spanish class from reading the Spanish
     * in English: the glossary and the Traducir buttons are the way to get help
     * with a word.
     */
    <html lang="es" translate="no">
      <body className="notranslate antialiased bg-[#0d0b0a] text-[#d4c9b8]">
        {/* Skip navigation for screen readers / keyboard users */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#c9933a] focus:text-[#0d0b0a] focus:font-typewriter focus:text-xs focus:uppercase focus:tracking-widest"
        >
          Skip to content
        </a>
        <div id="main">
          {children}
        </div>
      </body>
    </html>
  );
}
