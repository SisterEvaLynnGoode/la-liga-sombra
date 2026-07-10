"use client";

/**
 * CinematicLanding — the public cover site for La Liga Sombra.
 *
 * Layered scroll parallax (rAF + CSS vars, zero dependencies), staggered
 * IntersectionObserver reveals, and a SE BUSCA gallery built from the real
 * in-game criminal portraits. Respects prefers-reduced-motion: parallax and
 * entrance animations collapse to static layout.
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

// ── Real criminals from the game files ────────────────────────────────────────
const CRIMINALS = [
  { img: "/images/characters/unit-01-camaleon.png",          name: "El Camaleón",         crime: "Robo del Códice Azteca",        país: "México",          flag: "🇲🇽", caso: "I" },
  { img: "/images/characters/unit-02-tecladista.png",        name: "El Tecladista",       crime: "Hackeo de la Escuela Central",  país: "Puerto Rico",     flag: "🇵🇷", caso: "II" },
  { img: "/images/characters/unit-03-la-sombra.png",         name: "La Sombra",           crime: "Robo en el Museo del Prado",    país: "España",          flag: "🇪🇸", caso: "III" },
  { img: "/images/characters/unit-04-heredero.png",          name: "El Heredero",         crime: "El Collar de Esmeraldas",       país: "Costa Rica",      flag: "🇨🇷", caso: "IV" },
  { img: "/images/characters/unit-05-fantasma-digital.png",  name: "El Fantasma Digital", crime: "Ciberataque en Buenos Aires",   país: "Argentina",       flag: "🇦🇷", caso: "V" },
  { img: "/images/characters/unit-06-cocinero-secreto.png",  name: "El Cocinero Secreto", crime: "La Receta Familiar robada",     país: "Colombia",        flag: "🇨🇴", caso: "VI" },
  { img: "/images/characters/unit-07-tecnico-oscuro.png",    name: "El Técnico Oscuro",   crime: "Sabotaje del Festival",         país: "Chile",           flag: "🇨🇱", caso: "VII" },
  { img: "/images/characters/unit-08-coleccionista-local.png", name: "El Coleccionista",  crime: "El Tesoro Inca desaparecido",   país: "Perú",            flag: "🇵🇪", caso: "VIII" },
];

const COUNTRIES = ["🇲🇽","🇵🇷","🇪🇸","🇨🇷","🇦🇷","🇨🇴","🇨🇱","🇵🇪","🇩🇴","🇪🇨"];

const STEPS = [
  { n: "01", title: "Investiga",  desc: "Entrevista testigos, escucha testimonios y examina la evidencia — todo en español.", icon: "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" },
  { n: "02", title: "Descifra",   desc: "Cada palabra nueva es una pista. La gramática ES la evidencia que resuelve el caso.", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41a2 2 0 0 0-4 0H8a4 4 0 0 1 8 0c0 .88-.36 1.68-.93 2.25z" },
  { n: "03", title: "Acusa",      desc: "Usa tus pistas para identificar al culpable en la rueda de reconocimiento. Cierra el caso.", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
];

export default function CinematicLanding() {
  const rootRef = useRef<HTMLDivElement>(null);

  // ── Parallax: one rAF loop writes a unitless --sy CSS var ─────────────────
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let ticking = false;
    const update = () => {
      root.style.setProperty("--sy", String(window.scrollY));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Staggered reveals ──────────────────────────────────────────────────────
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (reduced) { els.forEach((el) => el.classList.add("is-revealed")); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          const delay = Number(el.dataset.reveal || 0);
          setTimeout(() => el.classList.add("is-revealed"), delay);
          io.unobserve(el);
        }
      }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="landing-root relative bg-[#0d0b0a] text-[#f5e6c8] overflow-x-clip" style={{ ["--sy" as string]: 0 }}>
      {/* Component-scoped animation CSS */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-[115vh] min-h-[640px]">
        {/* Layer 1 — city (slowest) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ transform: "translate3d(0, calc(var(--sy) * 0.25px), 0)" }}
          aria-hidden
        >
          <Image
            src="/images/landing/hero-city.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-110 hero-drift"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_42%,transparent_0%,rgba(13,11,10,0.55)_70%,#0d0b0a_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0d0b0a] to-transparent" />
        </div>

        {/* Layer 2 — drifting fog (mid speed) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 fog-pan"
          style={{
            transform: "translate3d(0, calc(var(--sy) * 0.12px), 0)",
            background:
              "radial-gradient(ellipse 40% 18% at 25% 70%, rgba(201,147,58,0.10) 0%, transparent 70%), radial-gradient(ellipse 45% 20% at 75% 60%, rgba(192,57,43,0.08) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        {/* Layer 3 — content (fastest fade-away) */}
        <div
          className="relative z-10 flex h-screen flex-col items-center justify-center px-6 text-center"
          style={{
            transform: "translate3d(0, calc(var(--sy) * -0.18px), 0)",
            opacity: "calc(1 - var(--sy) / 620)",
          }}
        >
          <div data-reveal="0" className="reveal mb-6 inline-flex items-center gap-3 px-5 py-2 border border-[rgba(201,147,58,0.35)] bg-[rgba(13,11,10,0.6)] backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#c0392b] animate-pulse" />
            <span className="font-typewriter text-[11px] tracking-[0.3em] uppercase text-[#e8b455]">
              Expediente abierto · 10 países · 20 casos
            </span>
          </div>

          <h1 data-reveal="120" className="reveal font-display font-black text-[clamp(3.2rem,9vw,7rem)] leading-[0.95] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
            <span className="block text-[#e8b455] text-glow-mustard">La Liga</span>
            <span className="block text-[#f5e6c8]">Sombra</span>
          </h1>

          <p data-reveal="240" className="reveal mt-6 font-typewriter text-[#e8d3a0] text-base sm:text-lg max-w-xl leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            Una banda de ladrones recorre el mundo hispano robando tesoros culturales.
            <span className="text-[#f5e6c8]"> Solo un agente que domine el español puede detenerlos.</span>
          </p>

          <div data-reveal="360" className="reveal mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none sm:w-auto">
            <Link
              href="/signup"
              className="clip-skew group inline-flex items-center justify-center gap-2 px-10 py-4 font-typewriter text-sm tracking-[0.22em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] transition-all duration-200 hover:bg-[#c0392b] hover:shadow-[0_0_35px_rgba(192,57,43,0.55)] hover:-translate-y-0.5 cursor-pointer"
            >
              Acepto la misión
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/login"
              className="clip-skew inline-flex items-center justify-center px-10 py-4 font-typewriter text-sm tracking-[0.22em] uppercase bg-[rgba(13,11,10,0.55)] backdrop-blur-sm text-[#e8b455] border border-[#c9933a] transition-all duration-200 hover:bg-[rgba(201,147,58,0.15)] hover:shadow-[0_0_25px_rgba(201,147,58,0.35)] hover:-translate-y-0.5 cursor-pointer"
            >
              Continuar misión
            </Link>
          </div>

          {/* Scroll cue */}
          <div data-reveal="600" className="reveal absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="font-typewriter text-[10px] tracking-[0.4em] uppercase text-[#8b7355]">Descubre a los sospechosos</span>
            <span className="scroll-cue block w-px h-10 bg-gradient-to-b from-[#c9933a] to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══ STAT STRIP ═════════════════════════════════════════════════════ */}
      <section className="relative border-y border-[rgba(201,147,58,0.2)] bg-[#111218] py-5 overflow-hidden">
        <div className="marquee flex items-center gap-12 whitespace-nowrap font-typewriter text-xs tracking-[0.3em] uppercase text-[#8b7355]">
          {[0, 1].map((k) => (
            <div key={k} className="flex items-center gap-12 shrink-0" aria-hidden={k === 1}>
              <span>10 países</span><span className="text-[#c9933a]">◆</span>
              <span>10 casos principales</span><span className="text-[#c9933a]">◆</span>
              <span>10 casos fríos</span><span className="text-[#c9933a]">◆</span>
              <span>1 misión especial</span><span className="text-[#c9933a]">◆</span>
              <span className="text-[#e8b455]">Español 1 · ACTFL</span><span className="text-[#c9933a]">◆</span>
              <span>{COUNTRIES.join("  ")}</span><span className="text-[#c9933a]">◆</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SE BUSCA — real criminals ══════════════════════════════════════ */}
      <section className="relative py-24 px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            transform: "translate3d(0, calc((var(--sy) - 900) * 0.06px), 0)",
            background: "radial-gradient(ellipse 60% 40% at 20% 30%, rgba(139,26,26,0.25) 0%, transparent 70%), radial-gradient(ellipse 50% 35% at 85% 70%, rgba(201,147,58,0.12) 0%, transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto">
          <div data-reveal="0" className="reveal text-center mb-14">
            <p className="font-typewriter text-xs tracking-[0.45em] uppercase text-[#c0392b] mb-3">⚠ Alerta internacional</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-[#f5e6c8]">
              SE <span className="text-[#e8b455]">BUSCA</span>
            </h2>
            <p className="mt-4 font-typewriter text-sm text-[#8b7355] max-w-lg mx-auto">
              Estos son los ladrones de La Liga Sombra — fotografiados por nuestros agentes de campo. ¿Puedes atraparlos a todos?
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {CRIMINALS.map((c, i) => (
              <article
                key={c.name}
                data-reveal={String(i * 90)}
                className="reveal wanted-card group relative bg-[#efe3c4] p-2.5 pb-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] cursor-default"
                style={{ transform: `rotate(${i % 2 === 0 ? -1.6 : 1.4}deg)` }}
              >
                {/* push pin */}
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-[#c0392b] to-[#7a1010] shadow-md z-10" aria-hidden />
                <p className="text-center font-display font-black text-[15px] tracking-[0.25em] text-[#2c1a08] pt-1.5 pb-1">SE BUSCA</p>
                <div className="relative aspect-square overflow-hidden bg-[#1a1614]">
                  <Image
                    src={c.img}
                    alt={`Retrato del criminal ${c.name}`}
                    fill
                    sizes="(max-width: 768px) 45vw, 22vw"
                    className="object-cover grayscale-[0.35] sepia-[0.25] transition-all duration-300 group-hover:grayscale-0 group-hover:sepia-0 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/20" />
                </div>
                <div className="pt-2.5 text-center">
                  <p className="font-display font-bold text-[15px] leading-tight text-[#2c1a08]">{c.name}</p>
                  <p className="font-typewriter text-[10px] text-[#6b4c1f] mt-0.5 leading-snug">{c.crime}</p>
                  <p className="font-typewriter text-[10px] text-[#8b5e10] mt-1.5">{c.flag} {c.país} · Caso {c.caso}</p>
                </div>
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_45px_rgba(201,147,58,0.5)]" aria-hidden />
              </article>
            ))}
          </div>

          <p data-reveal="0" className="reveal mt-12 text-center font-typewriter text-xs text-[#8b7355]">
            … y su líder, <span className="text-[#c0392b] font-bold">El Tejedor</span>, sigue libre.
            <Link href="/signup" className="ml-2 text-[#e8b455] underline decoration-[rgba(201,147,58,0.4)] underline-offset-4 hover:text-[#f5e6c8] transition-colors">Únete a la cacería →</Link>
          </p>
        </div>
      </section>

      {/* ═══ CÓMO FUNCIONA ══════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 bg-[#111218] border-y border-[rgba(201,147,58,0.12)]">
        <div className="max-w-5xl mx-auto">
          <div data-reveal="0" className="reveal text-center mb-14">
            <p className="font-typewriter text-xs tracking-[0.45em] uppercase text-[#8b7355] mb-3">Manual del agente</p>
            <h2 className="font-display font-black text-4xl text-[#f5e6c8]">Aprende español <span className="text-[#e8b455]">resolviendo crímenes</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} data-reveal={String(i * 130)} className="reveal relative border border-[rgba(201,147,58,0.2)] bg-[#0d0b0a] p-7 transition-all duration-300 hover:border-[rgba(201,147,58,0.5)] hover:shadow-[0_0_30px_rgba(201,147,58,0.12)] hover:-translate-y-1">
                <span className="absolute top-4 right-5 font-display font-black text-4xl text-[rgba(201,147,58,0.15)]">{s.n}</span>
                <svg viewBox="0 0 24 24" className="w-9 h-9 fill-[#c9933a] mb-5" aria-hidden><path d={s.icon} /></svg>
                <h3 className="font-display font-bold text-xl text-[#e8b455] mb-2">{s.title}</h3>
                <p className="font-typewriter text-sm text-[#c4a882] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PARA MAESTROS ══════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div data-reveal="0" className="reveal">
            <p className="font-typewriter text-xs tracking-[0.45em] uppercase text-[#8b7355] mb-3">Para maestros</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#f5e6c8] leading-tight mb-5">
              Un semestre completo de Español 1, <span className="text-[#e8b455]">listo para tu clase</span>
            </h2>
            <ul className="space-y-3 font-typewriter text-sm text-[#c4a882]">
              {[
                "Plan de 18 semanas alineado a ACTFL (Novice Low → Intermediate Low)",
                "Panel del maestro con dominio de vocabulario y gramática en vivo",
                "Hojas de trabajo imprimibles, Pasaporte Cultural y rúbricas",
                "Sin correos ni contraseñas: los estudiantes entran con un código de clase",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#c9933a] shrink-0 mt-0.5" aria-hidden><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/teacher/login"
              className="mt-8 inline-flex items-center gap-2 font-typewriter text-xs tracking-[0.25em] uppercase px-7 py-3 border border-[#c9933a] text-[#e8b455] hover:bg-[rgba(201,147,58,0.1)] hover:shadow-[0_0_20px_rgba(201,147,58,0.3)] transition-all cursor-pointer"
            >
              Portal de maestros →
            </Link>
          </div>
          <div data-reveal="150" className="reveal relative">
            <div className="relative aspect-[4/3] border border-[rgba(201,147,58,0.25)] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)]" style={{ transform: "rotate(1.2deg)" }}>
              <Image src="/images/landing/hero-city.png" alt="Vista nocturna del mundo de La Liga Sombra" fill sizes="(max-width: 768px) 90vw, 45vw" className="object-cover object-left" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,11,10,0.8)] to-transparent" />
              <p className="absolute bottom-4 left-4 font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#e8b455]">Archivo fotográfico · La Liga Sombra</p>
            </div>
            <div className="absolute -top-3 -right-3 rotate-6 border-2 border-[#c0392b] px-3 py-1 font-display font-black text-sm text-[#c0392b] bg-[rgba(13,11,10,0.85)]">CLASIFICADO</div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ══════════════════════════════════════════════════════ */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-[-15%]"
          style={{ transform: "translate3d(0, calc((var(--sy) - 3200) * 0.1px), 0)" }}
          aria-hidden
        >
          <Image src="/images/landing/hero-city.png" alt="" fill sizes="100vw" className="object-cover object-bottom" />
          <div className="absolute inset-0 bg-[rgba(13,11,10,0.78)]" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0d0b0a] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0d0b0a] to-transparent" />
        </div>
        <div className="relative z-10 text-center px-6" data-reveal="0">
          <p className="reveal font-typewriter text-xs tracking-[0.45em] uppercase text-[#c0392b] mb-4" data-reveal="0">El caso te espera</p>
          <h2 className="reveal font-display font-black text-4xl sm:text-6xl text-[#f5e6c8] mb-8" data-reveal="120">
            ¿Tienes lo que se necesita<br /><span className="text-[#e8b455]">para ser agente?</span>
          </h2>
          <div className="reveal flex flex-col sm:flex-row gap-4 justify-center" data-reveal="260">
            <Link
              href="/signup"
              className="clip-skew inline-flex items-center justify-center gap-2 px-12 py-5 font-typewriter text-base tracking-[0.22em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] transition-all duration-200 hover:bg-[#c0392b] hover:shadow-[0_0_45px_rgba(192,57,43,0.6)] hover:-translate-y-0.5 cursor-pointer"
            >
              Crear mi agente →
            </Link>
            <Link
              href="/login"
              className="clip-skew inline-flex items-center justify-center px-12 py-5 font-typewriter text-base tracking-[0.22em] uppercase bg-[rgba(13,11,10,0.6)] text-[#e8b455] border border-[#c9933a] transition-all duration-200 hover:bg-[rgba(201,147,58,0.12)] hover:-translate-y-0.5 cursor-pointer"
            >
              Ya soy agente
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═════════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-[rgba(201,147,58,0.12)] px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355]">
          La Liga Sombra · Español 1 · Que Chévere Level 1
        </span>
        <div className="flex items-center gap-5">
          <Link href="/about" className="font-typewriter text-[10px] tracking-widest uppercase text-[#4a3a2a] hover:text-[#c9933a] transition-colors">Acerca de</Link>
          <Link href="/teacher/login" className="font-typewriter text-[10px] tracking-widest uppercase text-[#4a3a2a] hover:text-[#c9933a] transition-colors">Maestros →</Link>
        </div>
      </footer>
    </div>
  );
}

// ── Scoped CSS: reveals, marquee, drift, scroll cue ───────────────────────────
const CSS = `
.landing-root .reveal { opacity: 0; transform: translateY(26px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); will-change: opacity, transform; }
.landing-root .reveal.is-revealed { opacity: 1; transform: translateY(0); }
.landing-root .wanted-card.reveal { transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease; }
.landing-root .wanted-card.reveal:not(.is-revealed) { opacity: 0; }
.landing-root .wanted-card:hover { z-index: 5; }
@keyframes lls-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.landing-root .marquee { animation: lls-marquee 36s linear infinite; width: max-content; }
@keyframes lls-drift { 0% { transform: scale(1.1) translateX(0); } 50% { transform: scale(1.12) translateX(-1.2%); } 100% { transform: scale(1.1) translateX(0); } }
.landing-root .hero-drift { animation: lls-drift 26s ease-in-out infinite; }
@keyframes lls-fog { 0% { background-position: 0% 0%; } 100% { background-position: 6% -3%; } }
.landing-root .fog-pan { animation: lls-fog 18s ease-in-out infinite alternate; }
@keyframes lls-cue { 0%,100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(8px); opacity: 0.4; } }
.landing-root .scroll-cue { animation: lls-cue 2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .landing-root .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
  .landing-root .marquee, .landing-root .hero-drift, .landing-root .fog-pan, .landing-root .scroll-cue { animation: none !important; }
}
`;
