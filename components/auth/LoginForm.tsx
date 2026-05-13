"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [classCode, setClassCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classCode.trim() || !displayName.trim() || !pin) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classCode: classCode.trim().toUpperCase(),
          displayName: displayName.trim(),
          pin,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Login failed. Try again.");
        setLoading(false);
        return;
      }

      router.push("/mission-board");
    } catch {
      setError("Server error — please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <div>
        <label className="block font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1.5">
          Código de clase
        </label>
        <input
          type="text"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
          placeholder="OAK101"
          maxLength={6}
          className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-4 py-3 font-typewriter text-xl text-center tracking-[0.4em] uppercase text-[#f5e6c8] placeholder-[#3a3028] transition-colors"
        />
      </div>

      <div>
        <label className="block font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1.5">
          Nombre del agente
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your agent name"
          maxLength={20}
          className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-4 py-3 font-typewriter text-base text-[#f5e6c8] placeholder-[#3a3028] transition-colors"
        />
      </div>

      <div>
        <label className="block font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1.5">
          PIN secreto
        </label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="••••"
          inputMode="numeric"
          maxLength={4}
          className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-4 py-3 font-typewriter text-xl text-center tracking-[0.5em] text-[#f5e6c8] placeholder-[#3a3028] transition-colors"
        />
      </div>

      {error && (
        <div className="border border-[#c0392b] bg-[rgba(192,57,43,0.1)] px-4 py-3">
          <p className="font-typewriter text-xs text-[#c0392b]">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Verificando identidad..." : "Reanudar misión →"}
      </button>

      <p className="font-typewriter text-xs text-center text-[#8b7355]">
        New agent?{" "}
        <Link href="/signup" className="text-[#c9933a] hover:underline">
          Registrarse
        </Link>
      </p>
    </form>
  );
}
