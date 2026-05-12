"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/teacher/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Incorrect password.");
      setLoading(false);
      return;
    }

    router.push("/teacher/setup");
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#0d0b0a] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_40%,rgba(201,147,58,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-xs">
        <Link href="/" className="inline-flex items-center gap-2 font-typewriter text-xs tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors mb-8">
          ← Inicio
        </Link>

        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-8">
          <div className="mb-6 text-center">
            <span className="text-3xl block mb-2">🔑</span>
            <h1 className="font-display text-2xl font-bold text-[#f5e6c8]">Acceso del Maestro</h1>
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#c9933a] to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-4 py-3 font-typewriter text-base text-[#f5e6c8] transition-colors"
              />
            </div>

            {error && (
              <p className="font-typewriter text-xs text-[#c0392b] border border-[rgba(192,57,43,0.3)] px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
