"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ClassRow {
  id: string;
  class_code: string;
  teacher_name: string;
  period_name: string;
  created_at: string;
  student_count: number;
}

export default function TeacherSetupPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // ── Create class form state ────────────────────────────────────────────────
  const [teacherName, setTeacherName] = useState("");
  const [periodName, setPeriodName] = useState("");
  const [createResult, setCreateResult] = useState<{ code?: string; error?: string } | null>(null);
  const [creating, setCreating] = useState(false);

  // ── Reset PIN form state ───────────────────────────────────────────────────
  const [resetCode, setResetCode] = useState("");
  const [resetName, setResetName] = useState("");
  const [resetPin, setResetPin] = useState("");
  const [resetResult, setResetResult] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [resetting, setResetting] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true);
    const res = await fetch("/api/teacher/classes");
    if (res.ok) {
      const data = await res.json();
      setClasses(data.classes ?? []);
    }
    setLoadingClasses(false);
  }, []);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateResult(null);
    const res = await fetch("/api/teacher/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherName, periodName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCreateResult({ error: data.error });
    } else {
      setCreateResult({ code: data.classCode });
      setTeacherName("");
      setPeriodName("");
      fetchClasses();
    }
    setCreating(false);
  }

  async function handleResetPin(e: React.FormEvent) {
    e.preventDefault();
    setResetting(true);
    setResetResult(null);
    const res = await fetch("/api/teacher/reset-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classCode: resetCode, displayName: resetName, newPin: resetPin }),
    });
    const data = await res.json();
    setResetResult(res.ok ? { ok: true } : { error: data.error });
    if (res.ok) { setResetCode(""); setResetName(""); setResetPin(""); }
    setResetting(false);
  }

  async function handleLogout() {
    await fetch("/api/teacher/auth", { method: "DELETE" });
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#0d0b0a] px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[rgba(201,147,58,0.15)]">
          <div>
            <p className="font-typewriter text-xs tracking-[0.25em] uppercase text-[#8b7355]">
              Panel del Maestro
            </p>
            <h1 className="font-display text-3xl font-bold text-[#f5e6c8]">Configuración</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/teacher/dashboard" className="clip-skew px-4 py-2 font-typewriter text-xs tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.1)] text-[#e8b455] border border-[rgba(201,147,58,0.3)] hover:bg-[rgba(201,147,58,0.2)] transition-colors">
              📊 Dashboard →
            </a>
            <button onClick={handleLogout} className="font-typewriter text-xs tracking-widest uppercase text-[#8b7355] hover:text-[#c0392b] transition-colors">
              Cerrar sesión →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Create Class ─────────────────────────────────────────────── */}
          <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-6">
            <h2 className="font-display text-xl font-bold text-[#e8b455] mb-1">Nueva Clase</h2>
            <p className="font-typewriter text-xs text-[#8b7355] mb-5">
              Creates a unique 6-character class code for your students.
            </p>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Ms. Rodriguez"
                  className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-2.5 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] transition-colors"
                />
              </div>
              <div>
                <label className="block font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] mb-1.5">
                  Period / class name
                </label>
                <input
                  type="text"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  placeholder="Period 3 — Spanish 1"
                  className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-2.5 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full clip-skew py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-50"
              >
                {creating ? "Generating..." : "Crear clase"}
              </button>
            </form>

            {createResult?.code && (
              <div className="mt-4 border border-[rgba(201,147,58,0.4)] bg-[rgba(201,147,58,0.08)] p-4">
                <p className="font-typewriter text-xs text-[#8b7355] mb-1">Código generado:</p>
                <p className="font-typewriter text-3xl font-bold text-[#e8b455] tracking-[0.4em]">
                  {createResult.code}
                </p>
                <p className="font-typewriter text-xs text-[#8b7355] mt-2">
                  Share this with your students. They enter it at signup.
                </p>
              </div>
            )}
            {createResult?.error && (
              <p className="mt-3 font-typewriter text-xs text-[#c0392b]">{createResult.error}</p>
            )}
          </div>

          {/* ── Reset PIN ────────────────────────────────────────────────── */}
          <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-6">
            <h2 className="font-display text-xl font-bold text-[#e8b455] mb-1">Restablecer PIN</h2>
            <p className="font-typewriter text-xs text-[#8b7355] mb-5">
              If a student forgets their PIN, reset it here.
            </p>

            <form onSubmit={handleResetPin} className="space-y-4">
              <div>
                <label className="block font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] mb-1.5">
                  Class code
                </label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                  placeholder="OAK101"
                  maxLength={6}
                  className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-2.5 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] tracking-[0.3em] transition-colors"
                />
              </div>
              <div>
                <label className="block font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] mb-1.5">
                  Student agent name
                </label>
                <input
                  type="text"
                  value={resetName}
                  onChange={(e) => setResetName(e.target.value)}
                  placeholder="Sofia"
                  className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-2.5 font-typewriter text-sm text-[#f5e6c8] placeholder-[#3a3028] transition-colors"
                />
              </div>
              <div>
                <label className="block font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] mb-1.5">
                  New PIN (4 digits)
                </label>
                <input
                  type="text"
                  value={resetPin}
                  onChange={(e) => setResetPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  maxLength={4}
                  inputMode="numeric"
                  className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.25)] focus:border-[#c9933a] focus:outline-none px-3 py-2.5 font-typewriter text-sm text-center tracking-[0.4em] text-[#f5e6c8] placeholder-[#3a3028] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={resetting}
                className="w-full clip-skew py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.15)] text-[#e8b455] border border-[rgba(201,147,58,0.4)] hover:bg-[rgba(201,147,58,0.25)] transition-colors disabled:opacity-50"
              >
                {resetting ? "Resetting..." : "Restablecer PIN"}
              </button>
            </form>

            {resetResult?.ok && (
              <p className="mt-3 font-typewriter text-xs text-[#c9933a]">✓ PIN updated successfully.</p>
            )}
            {resetResult?.error && (
              <p className="mt-3 font-typewriter text-xs text-[#c0392b]">{resetResult.error}</p>
            )}
          </div>
        </div>

        {/* ── Class List ─────────────────────────────────────────────────── */}
        <div className="mt-6 border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold text-[#e8b455]">Mis Clases</h2>
            <button
              onClick={fetchClasses}
              className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors"
            >
              ↻ Refresh
            </button>
          </div>

          {loadingClasses ? (
            <p className="font-typewriter text-xs text-[#8b7355]">Loading classes...</p>
          ) : classes.length === 0 ? (
            <p className="font-typewriter text-xs text-[#8b7355]">No classes yet. Create your first one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(201,147,58,0.15)]">
                    {["Code", "Period / Class", "Teacher", "Students", "Created"].map((h) => (
                      <th key={h} className="pb-2 text-left font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c) => (
                    <tr key={c.id} className="border-b border-[rgba(201,147,58,0.06)] hover:bg-[rgba(201,147,58,0.03)]">
                      <td className="py-3 font-typewriter text-sm font-bold text-[#e8b455] tracking-[0.2em]">
                        {c.class_code}
                      </td>
                      <td className="py-3 font-typewriter text-xs text-[#c4a882]">{c.period_name}</td>
                      <td className="py-3 font-typewriter text-xs text-[#8b7355]">{c.teacher_name}</td>
                      <td className="py-3 font-typewriter text-xs text-[#c4a882]">{c.student_count}</td>
                      <td className="py-3 font-typewriter text-xs text-[#8b7355]">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
