"use client";

import { useState, useEffect, useCallback } from "react";

interface TeacherRow {
  id: string; email: string; name: string | null; plan: string; status: string;
  isAdmin: boolean; trialDaysLeft: number | null; trialExpired: boolean;
  classes: number; students: number; joined: string;
}
interface Summary { total: number; onTrial: number; paid: number; expired: number }

export default function AdminTeachers() {
  const [rows, setRows] = useState<TeacherRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/teacher/admin/teachers");
    if (res.ok) {
      const d = await res.json() as { teachers: TeacherRow[]; summary: Summary };
      setRows(d.teachers); setSummary(d.summary);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function act(teacherId: string, action: string, days?: number) {
    setBusy(teacherId);
    await fetch("/api/teacher/admin/teachers", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, action, days }),
    }).catch(() => {});
    await load();
    setBusy(null);
  }

  const btn = "font-typewriter text-[9px] tracking-[0.15em] uppercase px-2 py-1 border transition-colors disabled:opacity-40";

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display font-bold text-xl text-[#e8b455]">Teachers</h2>
        {summary && (
          <div className="flex gap-3 font-typewriter text-[10px]">
            <span className="text-[#8b7355]">{summary.total} total</span>
            <span className="text-[#5a9e6f]">{summary.onTrial} on trial</span>
            <span className="text-[#e8b455]">{summary.paid} paid</span>
            {summary.expired > 0 && <span className="text-[#c0392b]">{summary.expired} expired</span>}
          </div>
        )}
      </div>

      <div className="overflow-x-auto border border-[rgba(201,147,58,0.12)]">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-[#0d0f15] text-left">
              {["Teacher", "Plan", "Classes", "Students", "Joined", "Actions"].map((h) => (
                <th key={h} className="font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#8b7355] px-3 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center font-typewriter text-xs text-[#4a3a2a]">No teachers yet — share your free-trial link or send an access code.</td></tr>
            )}
            {rows.map((t) => (
              <tr key={t.id} className={`border-t border-[rgba(201,147,58,0.08)] ${t.status !== "active" ? "opacity-50" : ""}`}>
                <td className="px-3 py-2.5">
                  <p className="font-typewriter text-xs text-[#f5e6c8]">{t.name ?? "—"}{t.isAdmin && <span className="ml-2 text-[9px] text-[#c9933a]">OWNER</span>}</p>
                  <p className="font-typewriter text-[10px] text-[#8b7355]">{t.email}</p>
                </td>
                <td className="px-3 py-2.5">
                  {t.isAdmin ? (
                    <span className="font-typewriter text-[10px] text-[#c9933a]">admin</span>
                  ) : t.plan === "trial" ? (
                    <span className={`font-typewriter text-[10px] px-2 py-0.5 border ${t.trialExpired ? "text-[#c0392b] border-[rgba(192,57,43,0.4)]" : "text-[#5a9e6f] border-[rgba(90,158,111,0.4)]"}`}>
                      {t.trialExpired ? "trial expired" : `trial · ${t.trialDaysLeft}d left`}
                    </span>
                  ) : (
                    <span className="font-typewriter text-[10px] px-2 py-0.5 border text-[#e8b455] border-[rgba(232,180,85,0.4)]">paid</span>
                  )}
                  {t.status !== "active" && <span className="ml-1 font-typewriter text-[9px] text-[#c0392b]">inactive</span>}
                </td>
                <td className="px-3 py-2.5 font-typewriter text-xs text-[#c4a882] tabular-nums">{t.classes}</td>
                <td className="px-3 py-2.5 font-typewriter text-xs text-[#c4a882] tabular-nums">{t.students}</td>
                <td className="px-3 py-2.5 font-typewriter text-[10px] text-[#4a3a2a]">{t.joined.slice(0, 10)}</td>
                <td className="px-3 py-2.5">
                  {!t.isAdmin && (
                    <div className="flex flex-wrap gap-1">
                      {t.plan === "trial" && (
                        <>
                          <button disabled={busy === t.id} onClick={() => act(t.id, "upgrade")}
                            className={`${btn} border-[rgba(232,180,85,0.4)] text-[#e8b455] hover:bg-[rgba(232,180,85,0.1)]`}>Make paid</button>
                          <button disabled={busy === t.id} onClick={() => act(t.id, "extend_trial", 30)}
                            className={`${btn} border-[rgba(90,158,111,0.4)] text-[#5a9e6f] hover:bg-[rgba(90,158,111,0.1)]`}>+30d</button>
                        </>
                      )}
                      {t.status === "active" ? (
                        <button disabled={busy === t.id} onClick={() => act(t.id, "deactivate")}
                          className={`${btn} border-[rgba(192,57,43,0.35)] text-[#c0392b] hover:bg-[rgba(192,57,43,0.08)]`}>Disable</button>
                      ) : (
                        <button disabled={busy === t.id} onClick={() => act(t.id, "activate")}
                          className={`${btn} border-[rgba(90,158,111,0.4)] text-[#5a9e6f] hover:bg-[rgba(90,158,111,0.1)]`}>Enable</button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
