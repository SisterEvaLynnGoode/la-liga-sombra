"use client";

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b0a] via-[#1a1614] to-[#0d0b0a]" />

      {/* Warm center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(201,147,58,0.07)_0%,transparent_70%)]" />

      {/* Top-left atmospheric light */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[radial-gradient(circle,rgba(139,26,26,0.15)_0%,transparent_70%)]" />

      {/* Bottom-right shadow depth */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(0,0,0,0.6)_0%,transparent_70%)]" />

      {/* Scanline texture */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.08) 3px,
            rgba(0,0,0,0.08) 4px
          )`,
        }}
      />

      {/* Decorative vertical rule lines */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[rgba(201,147,58,0.15)] to-transparent" />
      <div className="absolute right-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[rgba(201,147,58,0.15)] to-transparent" />

      {/* Top horizontal accent */}
      <div className="absolute top-16 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[rgba(201,147,58,0.2)] to-transparent" />
    </div>
  );
}
