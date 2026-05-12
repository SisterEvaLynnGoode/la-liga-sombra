import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#0d0b0a] px-6">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(201,147,58,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-typewriter text-xs tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors mb-8"
        >
          ← Volver al inicio
        </Link>

        {/* Card */}
        <div className="border border-[rgba(201,147,58,0.25)] bg-[#1a1614] p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <p className="font-typewriter text-xs tracking-[0.25em] uppercase text-[#8b7355] mb-2">
              Agencia de Investigación
            </p>
            <h1 className="font-display text-3xl font-bold text-[#f5e6c8]">
              Identificación
            </h1>
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#c9933a] to-transparent" />
          </div>

          {/* Placeholder content — auth form goes here */}
          <div className="space-y-4">
            <div className="p-4 border border-[rgba(201,147,58,0.1)] bg-[rgba(201,147,58,0.03)]">
              <p className="font-typewriter text-xs text-[#8b7355] text-center leading-relaxed">
                🚧 Formulario de acceso próximamente.
                <br />
                (Ingresa tu código de clase y alias.)
              </p>
            </div>

            <button
              disabled
              className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] opacity-50 cursor-not-allowed"
            >
              Entrar al cuartel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
