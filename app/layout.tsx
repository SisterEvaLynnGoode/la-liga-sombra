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
        {children}
      </body>
    </html>
  );
}
