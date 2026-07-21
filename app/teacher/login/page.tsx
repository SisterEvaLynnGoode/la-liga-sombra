"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"teacher" | "owner">("teacher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "owner" ? "/api/teacher/auth" : "/api/teacher/login";
      const body = mode === "owner" ? { password } : { email, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Login failed.");
        setLoading(false);
        return;
      }
      router.push("/teacher/setup");
    } catch {
      setError("Server error — please try again.");
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-4 py-3 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] transition-colors";

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#0d0b0a] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_40%,rgba(201,147,58,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-xs">
        <Link href="/" className="inline-flex items-center gap-2 font-typewriter text-xs tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors mb-8">
          ← Home
        </Link>
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-8">
          <div className="mb-6 text-center">
            <span className="text-3xl block mb-2">🕵️</span>
            <h1 className="font-display text-2xl font-bold text-[#f5e6c8]">Teacher Sign In</h1>
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#c9933a] to-transparent" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "teacher" && (
              <div>
                <label className="block font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.org" autoComplete="email" className={inputCls} />
              </div>
            )}
            <div>
              <label className="block font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1.5">
                {mode === "owner" ? "Owner password" : "Password"}
              </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className={inputCls} />
            </div>

            {error && <p className="font-typewriter text-xs text-[#c0392b]">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-50">
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[rgba(201,147,58,0.12)] space-y-2 text-center">
            <p className="font-typewriter text-[11px] text-[#8b7355]">
              New teacher?{" "}
              <Link href="/teacher/signup" className="text-[#c9933a] hover:underline">Redeem your access code →</Link>
            </p>
            <button
              onClick={() => { setMode(mode === "owner" ? "teacher" : "owner"); setError(null); }}
              className="font-typewriter text-[10px] tracking-widest uppercase text-[#4a3a2a] hover:text-[#8b7355] transition-colors"
            >
              {mode === "owner" ? "← Teacher sign in" : "Owner access"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
