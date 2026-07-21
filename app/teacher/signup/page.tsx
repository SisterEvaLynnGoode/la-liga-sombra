"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeacherSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ code: "", name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not create account.");
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
  const labelCls = "block font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1.5";

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#0d0b0a] px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_40%,rgba(201,147,58,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm">
        <Link href="/teacher/login" className="inline-flex items-center gap-2 font-typewriter text-xs tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors mb-6">
          ← Back to sign in
        </Link>
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-8">
          <div className="mb-6 text-center">
            <span className="text-3xl block mb-2">🕵️</span>
            <h1 className="font-display text-2xl font-bold text-[#f5e6c8]">Start Your Free Trial</h1>
            <p className="font-typewriter text-[11px] text-[#8b7355] mt-2">
              30 days free — the full Spanish 1 unit, all 10 cases, and your teacher dashboard. No card required.
            </p>
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#c9933a] to-transparent" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className={labelCls}>
                Access code <span className="normal-case tracking-normal text-[#4a3a2a]">(optional — leave blank for the free trial)</span>
              </label>
              <input value={form.code} onChange={set("code")} placeholder="LLS-XXXX-XXXX" className={`${inputCls} tracking-[0.15em] uppercase`} />
            </div>
            <div>
              <label className={labelCls}>Your name</label>
              <input value={form.name} onChange={set("name")} placeholder="Ms. Rivera" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@school.org" autoComplete="email" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password (8+ characters)</label>
              <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" autoComplete="new-password" className={inputCls} />
            </div>

            {error && <p className="font-typewriter text-xs text-[#c0392b]">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-50">
              {loading ? "Creating account…" : form.code.trim() ? "Activate account →" : "Start free trial →"}
            </button>
          </form>

          <p className="mt-5 pt-4 border-t border-[rgba(201,147,58,0.12)] text-center font-typewriter text-[11px] text-[#8b7355]">
            Already have an account?{" "}
            <Link href="/teacher/login" className="text-[#c9933a] hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
