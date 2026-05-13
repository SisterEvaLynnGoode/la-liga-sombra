import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Liga Sombra — Detective de Español",
  description:
    "A noir detective game for Spanish 1 students. Travel through Spanish-speaking countries, solve cases, and catch cultural treasure thieves.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-[#0d0b0a] text-[#d4c9b8]">
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
