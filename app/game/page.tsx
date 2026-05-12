import Link from "next/link";

export default function GamePage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-[#0d0b0a]">
      {/* HUD bar */}
      <header className="flex items-center justify-between px-8 py-3 border-b border-[rgba(201,147,58,0.15)]">
        <Link
          href="/"
          className="font-typewriter text-xs tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors"
        >
          ← Base
        </Link>
        <span className="font-display text-lg font-bold text-[#e8b455]">
          La Liga Sombra
        </span>
        <span className="font-typewriter text-xs tracking-widest uppercase text-[#8b7355]">
          Agente: —
        </span>
      </header>

      {/* Game viewport placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-10 max-w-lg w-full text-center">
          <span className="text-5xl mb-4 block">🗺️</span>
          <h2 className="font-display text-2xl font-bold text-[#f5e6c8] mb-2">
            Sala de Operaciones
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-[#c9933a] to-transparent my-4" />
          <p className="font-typewriter text-sm text-[#8b7355] leading-relaxed">
            El motor del juego se construirá aquí.
            <br />
            Mini-juegos · Casos · Mapa mundial
          </p>
        </div>
      </div>
    </main>
  );
}
