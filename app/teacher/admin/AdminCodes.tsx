"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminTeachers from "./AdminTeachers";

interface CodeRow { code: string; plan: string; note: string | null; redeemed: boolean; redeemedBy: string | null; createdAt: string }

export default function AdminCodes() {
  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [unredeemed, setUnredeemed] = useState(0);
  const [count, setCount] = useState(5);
  const [note, setNote] = useState("");
  const [minting, setMinting] = useState(false);
  const [justMinted, setJustMinted] = useState<string[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/teacher/admin/codes");
    if (res.ok) {
      const d = await res.json() as { codes: CodeRow[]; unredeemed: number };
      setCodes(d.codes); setUnredeemed(d.unredeemed);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function mint() {
    setMinting(true);
    const res = await fetch("/api/teacher/admin/codes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count, note }),
    });
    if (res.ok) {
      const d = await res.json() as { codes: string[] };
      setJustMinted(d.codes);
      await load();
    }
    setMinting(false);
  }

  return (
    <main className="min-h-screen bg-[#0c0e14] px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355]">Owner · Admin</p>
            <h1 className="font-display font-bold text-2xl text-[#e8b455]">Accounts</h1>
          </div>
          <Link href="/teacher/dashboard" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a]">← Dashboard</Link>
        </div>

        <AdminTeachers />

        <h2 className="font-display font-bold text-xl text-[#e8b455] mb-3">Access Codes</h2>

        <p className="font-typewriter text-xs text-[#8b7355] mb-5 leading-relaxed">
          Mint codes to sell on Teachers Pay Teachers. After a sale, send one unused code to the buyer — they redeem it at
          <span className="text-[#c4a882]"> /teacher/signup</span> to create their own dashboard. Currently <span className="text-[#e8b455]">{unredeemed}</span> unused.
        </p>

        {/* Mint */}
        <div className="border border-[rgba(201,147,58,0.2)] bg-[#111218] p-5 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block font-typewriter text-[9px] tracking-[0.25em] uppercase text-[#8b7355] mb-1">How many</label>
              <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-24 bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-3 py-2 font-typewriter text-sm text-[#f5e6c8]" />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block font-typewriter text-[9px] tracking-[0.25em] uppercase text-[#8b7355] mb-1">Note (optional)</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., TpT batch Aug 2026"
                className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-3 py-2 font-typewriter text-sm text-[#f5e6c8]" />
            </div>
            <button onClick={mint} disabled={minting}
              className="clip-skew px-6 py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-50">
              {minting ? "Minting…" : "Mint codes"}
            </button>
          </div>

          {justMinted.length > 0 && (
            <div className="mt-4 border-t border-[rgba(201,147,58,0.12)] pt-3">
              <p className="font-typewriter text-[9px] tracking-[0.25em] uppercase text-[#5a9e6f] mb-2">✓ Just minted — copy these now</p>
              <div className="flex flex-wrap gap-2">
                {justMinted.map((c) => (
                  <code key={c} className="font-typewriter text-xs px-2 py-1 bg-[rgba(90,158,111,0.1)] border border-[rgba(90,158,111,0.4)] text-[#e8b455] select-all">{c}</code>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* List */}
        <div className="overflow-x-auto border border-[rgba(201,147,58,0.12)]">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr className="bg-[#0d0f15] text-left">
                {["Code", "Status", "Redeemed by", "Note", "Created"].map((h) => (
                  <th key={h} className="font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#8b7355] px-3 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center font-typewriter text-xs text-[#4a3a2a]">No codes yet — mint some above.</td></tr>
              )}
              {codes.map((c) => (
                <tr key={c.code} className="border-t border-[rgba(201,147,58,0.08)]">
                  <td className="px-3 py-2.5"><code className="font-typewriter text-xs text-[#f5e6c8] select-all">{c.code}</code></td>
                  <td className="px-3 py-2.5">
                    <span className={`font-typewriter text-[10px] px-2 py-0.5 border ${c.redeemed ? "text-[#8b7355] border-[rgba(139,115,85,0.3)]" : "text-[#5a9e6f] border-[rgba(90,158,111,0.4)] bg-[rgba(90,158,111,0.06)]"}`}>
                      {c.redeemed ? "Used" : "Available"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-typewriter text-[11px] text-[#c4a882]">{c.redeemedBy ?? "—"}</td>
                  <td className="px-3 py-2.5 font-typewriter text-[11px] text-[#8b7355]">{c.note ?? "—"}</td>
                  <td className="px-3 py-2.5 font-typewriter text-[10px] text-[#4a3a2a]">{c.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
