"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "code" | "identity";

interface FieldError { classCode?: string; displayName?: string; pin?: string; global?: string; }

export default function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("code");
  const [classCode, setClassCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);

  // ── Step 1: verify class code format locally, then move on ───────────────
  function handleCodeNext() {
    const code = classCode.trim().toUpperCase();
    if (!/^[A-Za-z]{3}[0-9]{3}$/.test(code)) {
      setErrors({ classCode: "Code must be 3 letters + 3 numbers (e.g., OAK101)." });
      return;
    }
    setErrors({});
    setClassCode(code);
    setStep("identity");
  }

  // ── Step 2: submit everything ─────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldError = {};

    if (!displayName.trim()) errs.displayName = "Enter your agent name.";
    if (!/^\d{4}$/.test(pin)) errs.pin = "PIN must be exactly 4 digits.";
    else if (pin !== pinConfirm) errs.pin = "PINs don't match.";

    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classCode, displayName: displayName.trim(), pin }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ global: (data as { error?: string }).error ?? "Something went wrong. Try again." });
        setLoading(false);
        return;
      }

      router.push("/mission-board");
    } catch {
      setErrors({ global: "Server error — please try again." });
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Progress dots */}
      <div className="flex items-center gap-2 justify-center mb-6">
        <div className={`w-2 h-2 rounded-full transition-colors ${step === "code" ? "bg-[#c9933a]" : "bg-[#c9933a]"}`} />
        <div className="w-8 h-px bg-[rgba(201,147,58,0.3)]" />
        <div className={`w-2 h-2 rounded-full transition-colors ${step === "identity" ? "bg-[#c9933a]" : "bg-[rgba(201,147,58,0.3)]"}`} />
      </div>

      {/* ── Step 1: Class code ────────────────────────────────────────── */}
      {step === "code" && (
        <div className="space-y-5">
          <div>
            <p className="font-typewriter text-xs tracking-[0.25em] uppercase text-[#8b7355] mb-1">
              Paso 1 de 2
            </p>
            <h2 className="font-display text-2xl font-bold text-[#f5e6c8]">Código de clase</h2>
            <p className="font-typewriter text-xs text-[#8b7355] mt-1">
              Your teacher will give you this 6-character code.
            </p>
          </div>
          <div>
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleCodeNext()}
              placeholder="OAK101"
              maxLength={6}
              className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-4 py-3 font-typewriter text-xl text-center tracking-[0.4em] uppercase text-[#f5e6c8] placeholder-[#3a3028] transition-colors"
            />
            {errors.classCode && (
              <p className="mt-1.5 font-typewriter text-xs text-[#c0392b]">{errors.classCode}</p>
            )}
          </div>
          <button
            onClick={handleCodeNext}
            className="w-full clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors"
          >
            Continuar →
          </button>
          <p className="font-typewriter text-xs text-center text-[#8b7355]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#c9933a] hover:underline">
              Continuar misión
            </Link>
          </p>
        </div>
      )}

      {/* ── Step 2: Identity ──────────────────────────────────────────── */}
      {step === "identity" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="font-typewriter text-xs tracking-[0.25em] uppercase text-[#8b7355] mb-1">
              Paso 2 de 2 · Clase {classCode}
            </p>
            <h2 className="font-display text-2xl font-bold text-[#f5e6c8]">Elige tu identidad</h2>
            <p className="font-typewriter text-xs text-[#8b7355] mt-1">
              First name or nickname only — no last names.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1.5">
                Nombre del agente
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Sofia, El Lobo, Marco"
                maxLength={20}
                autoFocus
                className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-4 py-3 font-typewriter text-base text-[#f5e6c8] placeholder-[#3a3028] transition-colors"
              />
              {errors.displayName && (
                <p className="mt-1.5 font-typewriter text-xs text-[#c0392b]">{errors.displayName}</p>
              )}
            </div>

            <div>
              <label className="block font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1.5">
                PIN secreto (4 dígitos)
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

            <div>
              <label className="block font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1.5">
                Confirmar PIN
              </label>
              <input
                type="password"
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                inputMode="numeric"
                maxLength={4}
                className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-4 py-3 font-typewriter text-xl text-center tracking-[0.5em] text-[#f5e6c8] placeholder-[#3a3028] transition-colors"
              />
              {errors.pin && (
                <p className="mt-1.5 font-typewriter text-xs text-[#c0392b]">{errors.pin}</p>
              )}
            </div>
          </div>

          {errors.global && (
            <div className="border border-[#c0392b] bg-[rgba(192,57,43,0.1)] px-4 py-3">
              <p className="font-typewriter text-xs text-[#c0392b]">{errors.global}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep("code"); setErrors({}); }}
              className="px-4 py-3 font-typewriter text-xs tracking-widest uppercase text-[#8b7355] border border-[rgba(201,147,58,0.2)] hover:border-[rgba(201,147,58,0.4)] transition-colors"
            >
              ← Atrás
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 clip-skew py-3 font-typewriter text-sm tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registrando agente..." : "Unirme a la misión →"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
