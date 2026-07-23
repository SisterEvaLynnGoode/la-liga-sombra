"use client";

import { WORLDS, hasWorld } from "@/lib/scroll-world/worlds";

// Country label per unit for the "coming soon" cards (worlds not yet generated).
const UNIT_COUNTRIES: Record<number, string> = {
  1: "México", 2: "Puerto Rico", 3: "España", 4: "México", 5: "Colombia",
  6: "Perú", 7: "Argentina", 8: "Perú", 9: "Chile", 10: "Ecuador",
};

export default function MundosTab() {
  const units = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-[#e8b455]">Mundos de enseñanza</h2>
        <p className="font-typewriter text-xs text-[#8b7355] mt-1 leading-relaxed max-w-2xl">
          Vuela por la ciudad de cada caso mientras enseñas el vocabulario y la gramática.
          Proyéctalo en clase <span className="text-[#c4a882]">antes</span> de enviar a los
          estudiantes al componente en línea o a la hoja de trabajo.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((n) => {
          const world = WORLDS[n];
          const country = world?.country ?? UNIT_COUNTRIES[n] ?? "";
          const ready = hasWorld(n);
          return (
            <div
              key={n}
              className={`border ${ready ? "border-[rgba(201,147,58,0.25)]" : "border-[rgba(201,147,58,0.08)]"} bg-[#1a1614] overflow-hidden flex flex-col`}
            >
              {/* Poster */}
              <div className="relative aspect-video bg-[#0d0b0a] overflow-hidden">
                {ready ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/scroll-worlds/unit-${String(n).padStart(2, "0")}/scene1.jpg`}
                    alt={`Unidad ${n}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl opacity-30">🗺️</span>
                  </div>
                )}
                <span className="absolute top-2 left-2 font-typewriter text-[9px] tracking-[0.2em] uppercase px-1.5 py-0.5 bg-black/60 text-[#e8b455]">
                  Unidad {n}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col">
                <p className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">{country}</p>
                <p className="font-display font-bold text-[#f5e6c8] leading-tight mt-0.5">
                  {ready ? world!.focus : "Próximamente"}
                </p>

                <div className="mt-auto pt-4">
                  {ready ? (
                    <a
                      href={`/teacher/mundo/${n}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center clip-skew py-2 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.1)] text-[#e8b455] border border-[rgba(201,147,58,0.35)] hover:bg-[rgba(201,147,58,0.2)] transition-colors"
                    >
                      🌎 Proyectar mundo →
                    </a>
                  ) : (
                    <span className="block text-center py-2 font-typewriter text-[10px] tracking-[0.2em] uppercase border border-[rgba(201,147,58,0.08)] text-[#4a3a2a]">
                      En producción
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
