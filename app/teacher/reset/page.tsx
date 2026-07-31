"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputCls = "w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-4 py-3 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] transition-colors";
  const labelCls = "block font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1.5";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Those two passwords don't match."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/teacher/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not reset the password.");
        setLoading(false);
        return;
      }
      router.push("/teacher/dashboard");
    } catch {
      setError("Server error — please try again.");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-8 text-center">
        <h1 className="font-display text-xl font-bold text-[#f5e6c8]">Reset link missing</h1>
        <p className="font-typewriter text-[11px] text-[#8b7355] mt-2">
          This page needs the link from your reset email. Request a new one from the sign-in page.
        </p>
        <Link href="/teacher/login" className="inline-block mt-5 font-typewriter text-[11px] text-[#c9933a] hover:underline">
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-8">
      <div className="mb-6 text-center">
        <span className="text-3xl block mb-2">🔑</span>
        <h1 className="font-display text-2xl font-bold text-[#f5e6c8]">Choose a new password</h1>
        <p className="font-typewriter text-[11px] text-[#8b7355] mt-2">
          You&apos;ll be signed in as soon as it&apos;s saved.
        </p>
        <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#c9933a] to-transparent" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelCls}>New password (8+ characters)</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" autoComplete="new-password" autoFocus className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Confirm password</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••" autoComplete="new-password" className={inputCls} />
        </div>

        {error && <p className="font-typewriter text-xs text-[#c0392b]">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-50">
          {loading ? "Saving…" : "Save and sign in →"}
        </button>
      </form>
    </div>
  );
}

export default function TeacherResetPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#0d0b0a] px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_40%,rgba(201,147,58,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm">
        <Suspense fallback={<p className="font-typewriter text-xs text-[#4a3a2a] text-center">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
