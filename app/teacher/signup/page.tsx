"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Open-beta teacher signup.
 *
 * No access code. Four fields, one button, and the very next thing the teacher
 * sees is the class code their students type in — because an account without a
 * class code is an account nobody can use.
 */
export default function TeacherSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", periodName: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ classCode: string; periodName: string } | null>(null);
  const [copied, setCopied] = useState(false);

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
      const d = data as { classCode?: string; periodName?: string };
      // If the class somehow failed to create, don't strand them on a blank
      // success screen — send them to Settings where they can add one.
      if (!d.classCode) { router.push("/teacher/setup"); return; }
      setDone({ classCode: d.classCode, periodName: d.periodName ?? "Period 1" });
      setLoading(false);
    } catch {
      setError("Server error — please try again.");
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!done) return;
    try {
      await navigator.clipboard.writeText(done.classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  }

  const inputCls = "w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-4 py-3 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] transition-colors";
  const labelCls = "block font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1.5";

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#0d0b0a] px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_40%,rgba(201,147,58,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm">

        {done ? (
          /* ── Success: hand them the class code ─────────────────────────── */
          <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-8">
            <div className="text-center mb-6">
              <span className="text-3xl block mb-2">🎉</span>
              <h1 className="font-display text-2xl font-bold text-[#f5e6c8]">You&apos;re in</h1>
              <p className="font-typewriter text-[11px] text-[#8b7355] mt-2">
                Your first class, <span className="text-[#c4a882]">{done.periodName}</span>, is ready.
              </p>
            </div>

            <div className="border border-[rgba(201,147,58,0.35)] bg-[#0d0b0a] p-5 text-center">
              <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-2">
                Your class code
              </p>
              <p className="font-display font-black text-4xl tracking-[0.15em] text-[#e8b455]">
                {done.classCode}
              </p>
              <button
                onClick={copyCode}
                className="mt-3 font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#c9933a] hover:text-[#e8b455] transition-colors"
              >
                {copied ? "✓ Copied" : "Copy code"}
              </button>
            </div>

            <p className="font-typewriter text-[11px] leading-relaxed text-[#8b7355] mt-5">
              Give this code to your students. They go to the student sign-up page, enter it, pick an
              agent name, and they&apos;re in — no email address and no password reset for you to manage.
            </p>

            <button
              onClick={() => router.push("/teacher/dashboard")}
              className="mt-5 w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
            >
              Go to my dashboard →
            </button>
            <p className="mt-3 text-center font-typewriter text-[10px] text-[#4a3a2a]">
              You can add more classes any time from Settings.
            </p>
          </div>
        ) : (
          /* ── The form ──────────────────────────────────────────────────── */
          <>
            <Link href="/teacher/login" className="inline-flex items-center gap-2 font-typewriter text-xs tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors mb-6">
              ← Back to sign in
            </Link>
            <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-8">
              <div className="mb-6 text-center">
                <span className="text-3xl block mb-2">🕵️</span>
                <h1 className="font-display text-2xl font-bold text-[#f5e6c8]">Create your free account</h1>
                <p className="font-typewriter text-[11px] text-[#8b7355] mt-2">
                  Open beta — free while we build. Every case, every worksheet, and the full teacher
                  dashboard. No access code, no card, no expiry.
                </p>
                <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#c9933a] to-transparent" />
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className={labelCls}>Your name</label>
                  <input value={form.name} onChange={set("name")} placeholder="Ms. Rivera" autoComplete="name" className={inputCls} />
                  <p className="font-typewriter text-[10px] text-[#4a3a2a] mt-1">This is what your students will see.</p>
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={form.email} onChange={set("email")} placeholder="you@school.org" autoComplete="email" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Password (8+ characters)</label>
                  <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" autoComplete="new-password" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>
                    First class <span className="normal-case tracking-normal text-[#4a3a2a]">(optional)</span>
                  </label>
                  <input value={form.periodName} onChange={set("periodName")} placeholder="Period 1" className={inputCls} />
                  <p className="font-typewriter text-[10px] text-[#4a3a2a] mt-1">We&apos;ll create it and give you a class code straight away.</p>
                </div>

                {error && <p className="font-typewriter text-xs text-[#c0392b]">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-50">
                  {loading ? "Creating account…" : "Create account →"}
                </button>
              </form>

              <p className="mt-5 pt-4 border-t border-[rgba(201,147,58,0.12)] text-center font-typewriter text-[11px] text-[#8b7355]">
                Already have an account?{" "}
                <Link href="/teacher/login" className="text-[#c9933a] hover:underline">Sign in →</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
