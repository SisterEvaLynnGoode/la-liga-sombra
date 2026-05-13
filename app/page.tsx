import Link from "next/link";
import HeroBackground from "@/components/HeroBackground";
import CaseBadge from "@/components/CaseBadge";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#0d0b0a]">
      <HeroBackground />

      {/* ── Header bar ── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-[rgba(201,147,58,0.15)]">
        <span className="font-typewriter text-xs tracking-[0.3em] uppercase text-[#8b7355]">
          Clase de Español · Nivel 1
        </span>
        <span className="font-typewriter text-xs tracking-[0.3em] uppercase text-[#8b7355]">
          Archivo: Caso Abierto
        </span>
      </header>

      {/* ── Hero content ── */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">

        {/* Case file stamp */}
        <div className="mb-6 inline-flex items-center gap-3 px-5 py-2 border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.05)]">
          <span className="w-2 h-2 rounded-full bg-[#c0392b] animate-pulse" />
          <span className="font-typewriter text-xs tracking-[0.25em] uppercase text-[#c9933a]">
            Investigación Activa · 6 Países · 6 Casos
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-[clamp(3rem,8vw,6rem)] leading-none tracking-tight text-glow-mustard">
          <span className="block text-[#e8b455]">La Liga</span>
          <span className="block text-[#f5e6c8]">Sombra</span>
        </h1>

        {/* Rule line */}
        <div className="my-6 flex items-center gap-4 w-full max-w-md">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#c9933a]" />
          <span className="font-typewriter text-[#8b7355] text-xs tracking-widest">◆</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#c9933a]" />
        </div>

        {/* Tagline */}
        <p className="font-typewriter text-[#c4a882] text-base leading-relaxed max-w-xl mb-2">
          Una banda de ladrones recorre el mundo hispano robando
          <span className="text-[#e8b455]"> tesoros culturales.</span>
        </p>
        <p className="font-typewriter text-[#8b7355] text-sm leading-relaxed max-w-lg mb-10">
          Solo los agentes que dominen el español podrán seguirles la pista.
          <span className="text-[#d4c9b8]"> ¿Estás listo para la misión?</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none sm:w-auto">
          <Link
            href="/signup"
            className="clip-skew inline-flex items-center justify-center gap-3 px-10 py-4 font-typewriter text-sm tracking-[0.2em] uppercase transition-all duration-200 bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] hover:shadow-[0_0_20px_rgba(192,57,43,0.5)] hover:-translate-y-px"
          >
            <span className="text-lg">🕵️</span>
            Nuevo agente
          </Link>
          <Link
            href="/login"
            className="clip-skew inline-flex items-center justify-center gap-3 px-10 py-4 font-typewriter text-sm tracking-[0.2em] uppercase transition-all duration-200 bg-transparent text-[#e8b455] border border-[#c9933a] hover:bg-[rgba(201,147,58,0.1)] hover:shadow-[0_0_20px_rgba(201,147,58,0.3)] hover:-translate-y-px"
          >
            <span className="text-lg">📁</span>
            Continuar misión
          </Link>
        </div>
      </section>

      {/* ── Country case badges ── */}
      <section className="relative z-10 px-8 pb-8">
        <p className="font-typewriter text-center text-xs tracking-[0.25em] uppercase text-[#8b7355] mb-5">
          Destinos de la liga — 6 países · 6 casos
        </p>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {COUNTRIES.map((c) => (
            <CaseBadge key={c.code} {...c} />
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[rgba(201,147,58,0.1)] px-8 py-3 flex items-center justify-between">
        <span className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355]">
          Que Chevere Level 1
        </span>
        <div className="flex items-center gap-4">
          <Link href="/about" className="font-typewriter text-[10px] tracking-widest uppercase text-[#4a3a2a] hover:text-[#8b7355] transition-colors">
            Acerca de
          </Link>
          <Link href="/teacher/login" className="font-typewriter text-[10px] tracking-widest uppercase text-[#4a3a2a] hover:text-[#8b7355] transition-colors">
            Maestros →
          </Link>
        </div>
      </footer>
    </main>
  );
}

const COUNTRIES = [
  { code: "MX", flag: "🇲🇽", country: "México",     unit: 1, label: "Caso I" },
  { code: "PR", flag: "🇵🇷", country: "Puerto Rico", unit: 2, label: "Caso II" },
  { code: "CO", flag: "🇨🇴", country: "Colombia",   unit: 3, label: "Caso III" },
  { code: "AR", flag: "🇦🇷", country: "Argentina",  unit: 4, label: "Caso IV" },
  { code: "ES", flag: "🇪🇸", country: "España",     unit: 5, label: "Caso V" },
  { code: "PE", flag: "🇵🇪", country: "Perú",       unit: 6, label: "Caso VI" },
];
