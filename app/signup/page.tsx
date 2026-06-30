import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";

export const metadata = { title: "Nuevo Agente — La Liga Sombra" };

export default function SignupPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#0d0b0a] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(139,26,26,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(201,147,58,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 font-typewriter text-xs tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors mb-8">
          ← Volver al inicio
        </Link>

        <div className="border border-[rgba(201,147,58,0.25)] bg-[#1a1614] p-8">
          <div className="mb-7 text-center">
            <p className="font-typewriter text-xs tracking-[0.3em] uppercase text-[#8b7355] mb-1">
              Agencia de Investigación
            </p>
            <h1 className="font-display text-3xl font-bold text-[#f5e6c8]">Nuevo Agente</h1>
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#c9933a] to-transparent" />
            <p className="mt-3 font-typewriter text-xs text-[#8b7355] leading-relaxed">
              Únete a La Liga Sombra y empieza a atrapar a los ladrones de tesoros culturales.
            </p>
          </div>

          <SignupForm />
        </div>
      </div>
    </main>
  );
}
