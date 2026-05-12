import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-[#0d0b0a] px-8 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-[rgba(201,147,58,0.15)]">
        <div>
          <p className="font-typewriter text-xs tracking-[0.25em] uppercase text-[#8b7355]">
            Panel del Maestro
          </p>
          <h1 className="font-display text-2xl font-bold text-[#f5e6c8]">
            Cuartel General
          </h1>
        </div>
        <Link
          href="/"
          className="font-typewriter text-xs tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors"
        >
          ← Salir
        </Link>
      </header>

      {/* Placeholder grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
        {PANELS.map((p) => (
          <div
            key={p.title}
            className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-6"
          >
            <span className="text-3xl block mb-3">{p.icon}</span>
            <h2 className="font-typewriter text-sm tracking-[0.15em] uppercase text-[#e8b455] mb-1">
              {p.title}
            </h2>
            <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed">
              {p.description}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

const PANELS = [
  {
    icon: "📊",
    title: "Progreso de clase",
    description: "Puntuaciones y avance por unidad para cada estudiante.",
  },
  {
    icon: "🏅",
    title: "Insignias ganadas",
    description: "Logros desbloqueados por los agentes de tu clase.",
  },
  {
    icon: "📖",
    title: "Dominio de vocabulario",
    description: "Términos dominados vs. términos que necesitan repaso.",
  },
  {
    icon: "🗺️",
    title: "Casos activos",
    description: "Qué países están investigando tus estudiantes ahora.",
  },
  {
    icon: "⏱️",
    title: "Tiempo en juego",
    description: "Minutos dedicados por estudiante y por actividad.",
  },
  {
    icon: "⚙️",
    title: "Configuración",
    description: "Administrar códigos de clase y ajustes del juego.",
  },
];
