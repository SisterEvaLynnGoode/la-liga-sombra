"use client";

import { Fragment, useState } from "react";
import { useClassData } from "@/lib/hooks/useClassData";
import { TabHeader, Loading } from "./OverviewTab";

interface GradeRow {
  studentId: string;
  displayName: string;
  sisId: string;
  band: string;
  bandIndex: number;
  scorePct: number;
  casesSolved: number;
  vocab: number | null;
  grammar: number | null;
  communication: number | null;
  gradePct: number;
  gradeLetter: string;
  provisional: boolean;
  narrative: string;
  teacherNote: string;
  daysSinceActive: number | null;
}
interface GradesData { rows: GradeRow[]; casesAssigned: number }

// ACTFL band → chip color (index 0..3)
const BAND_STYLE = [
  "text-[#c0392b] border-[rgba(192,57,43,0.4)] bg-[rgba(192,57,43,0.08)]",   // Novice Low
  "text-[#e8b455] border-[rgba(232,180,85,0.4)] bg-[rgba(232,180,85,0.06)]", // Novice Mid
  "text-[#c9933a] border-[rgba(201,147,58,0.5)] bg-[rgba(201,147,58,0.1)]",  // Novice High
  "text-[#5a9e6f] border-[rgba(90,158,111,0.5)] bg-[rgba(90,158,111,0.1)]",  // Intermediate Low
];

function skillColor(pct: number) {
  return pct >= 78 ? "#5a9e6f" : pct >= 55 ? "#c9933a" : pct >= 30 ? "#e8b455" : "#c0392b";
}

export default function GradesTab({ classId }: { classId: string }) {
  const { data, loading, lastUpdated, refetch } = useClassData<GradesData>("/api/teacher/dashboard/grades", classId);
  const [editing, setEditing] = useState<string | null>(null);
  const [sisDraft, setSisDraft] = useState("");
  const [savingSis, setSavingSis] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function copyNarrative(r: GradeRow) {
    try {
      await navigator.clipboard.writeText(r.narrative);
      setCopied(r.studentId);
      setTimeout(() => setCopied((c) => (c === r.studentId ? null : c)), 1800);
    } catch { /* clipboard unavailable */ }
  }

  async function saveSis(studentId: string) {
    setSavingSis(true);
    await fetch("/api/teacher/dashboard/grades", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, sisId: sisDraft }),
    }).catch(() => {});
    setSavingSis(false);
    setEditing(null);
    refetch();
  }

  function exportCsv(type: "grades" | "grades-aeries") {
    window.open(`/api/teacher/dashboard/export?classId=${encodeURIComponent(classId)}&type=${type}`, "_blank");
  }

  if (loading && !data) return <Loading />;
  const rows = data?.rows ?? [];
  const casesAssigned = data?.casesAssigned ?? 1;

  // Band distribution for the summary strip
  const dist = [0, 0, 0, 0];
  rows.forEach((r) => { dist[r.bandIndex] = (dist[r.bandIndex] ?? 0) + 1; });
  const BAND_NAMES = ["Novice Low", "Novice Mid", "Novice High", "Intermediate Low"];

  return (
    <div className="space-y-4">
      <TabHeader title="Grades" lastUpdated={lastUpdated} onRefresh={refetch} />

      <div className="border border-[rgba(201,147,58,0.15)] bg-[rgba(201,147,58,0.04)] px-4 py-3">
        <p className="font-typewriter text-[10px] text-[#8b7355] leading-relaxed">
          Two numbers, on purpose. <span className="text-[#c4a882]">Grade</span> is gradebook-style — quality of work done (70%) and completion of what has been assigned (30%) — and is the one safe to share with families. <span className="text-[#c4a882]">ACTFL Level</span> is the standards-based proficiency band, which rises slowly by design; a student can be on track and still sit at Novice Mid. Students climb by replaying to improve, so grades reflect their current best. Open <span className="text-[#c4a882]">report</span> for a parent-ready note.
        </p>
      </div>

      {/* Band distribution + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {BAND_NAMES.map((name, i) => (
            <span key={name} className={`font-typewriter text-[10px] px-2.5 py-1 border ${BAND_STYLE[i]}`}>
              {name}: <b>{dist[i] ?? 0}</b>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCsv("grades")}
            className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border border-[rgba(201,147,58,0.3)] text-[#c9933a] hover:border-[#c9933a] hover:text-[#e8b455] transition-colors">
            ↓ CSV
          </button>
          <button onClick={() => exportCsv("grades-aeries")}
            className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border border-[rgba(201,147,58,0.3)] text-[#c9933a] hover:border-[#c9933a] hover:text-[#e8b455] transition-colors">
            ↓ Aeries
          </button>
        </div>
      </div>

      {rows.length === 0 && (
        <div className="h-40 flex items-center justify-center border border-[rgba(201,147,58,0.12)]">
          <p className="font-typewriter text-xs text-[#4a3a2a]">No students yet.</p>
        </div>
      )}

      {/* Gradebook */}
      {rows.length > 0 && (
        <div className="overflow-x-auto border border-[rgba(201,147,58,0.12)]">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="bg-[#0d0f15] text-left">
                {["Student", "Grade", "ACTFL Level", "Vocab", "Grammar", "Communication", "Cases", "SIS ID", ""].map((h) => (
                  <th key={h} className="font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#8b7355] px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Fragment key={r.studentId}>
                <tr className="border-t border-[rgba(201,147,58,0.08)] hover:bg-[rgba(201,147,58,0.03)]">
                  <td className="px-3 py-2.5 font-typewriter text-sm text-[#f5e6c8] whitespace-nowrap">{r.displayName}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {r.provisional ? (
                      <span className="font-typewriter text-[11px] text-[#8b7355]" title="Not enough completed work to grade yet">
                        no grade yet
                      </span>
                    ) : (
                      <span className="font-typewriter text-sm tabular-nums" style={{ color: skillColor(r.gradePct) }}>
                        {r.gradePct}% <span className="text-[#8b7355]">{r.gradeLetter}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`font-typewriter text-[10px] px-2 py-0.5 border whitespace-nowrap ${BAND_STYLE[r.bandIndex]}`} title={`Proficiency composite ${r.scorePct}%`}>{r.band}</span>
                  </td>
                  {[r.vocab, r.grammar, r.communication].map((pct, i) => (
                    <td key={i} className="px-3 py-2.5">
                      {pct === null ? (
                        <span className="font-typewriter text-[10px] text-[#4a3a2a]">—</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1 bg-[#2c2220] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: skillColor(pct) }} />
                          </div>
                          <span className="font-typewriter text-[9px] tabular-nums text-[#8b7355]">{pct}</span>
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 font-typewriter text-xs text-[#c4a882] tabular-nums">{r.casesSolved}/{casesAssigned}</td>
                  <td className="px-3 py-2.5">
                    {editing === r.studentId ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={sisDraft}
                          onChange={(e) => setSisDraft(e.target.value)}
                          placeholder="Aeries ID"
                          className="w-24 bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-2 py-1 font-typewriter text-[11px] text-[#f5e6c8]"
                          autoFocus
                        />
                        <button disabled={savingSis} onClick={() => saveSis(r.studentId)} className="font-typewriter text-[10px] text-[#5a9e6f] px-1">✓</button>
                        <button onClick={() => setEditing(null)} className="font-typewriter text-[10px] text-[#8b7355] px-1">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditing(r.studentId); setSisDraft(r.sisId); }}
                        className="font-typewriter text-[11px] text-[#8b7355] hover:text-[#c9933a] transition-colors"
                      >
                        {r.sisId || <span className="text-[#4a3a2a]">+ add</span>}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => setOpenRow(openRow === r.studentId ? null : r.studentId)}
                      className="font-typewriter text-[10px] tracking-wider uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors whitespace-nowrap"
                    >
                      {openRow === r.studentId ? "hide" : "report"}
                    </button>
                  </td>
                </tr>

                {openRow === r.studentId && (
                  <tr className="bg-[#0d0f15]">
                    <td colSpan={9} className="px-4 py-4">
                      <div className="max-w-[52rem] space-y-3">
                        <div>
                          <p className="font-typewriter text-[9px] tracking-[0.25em] uppercase text-[#5a9e6f] mb-1.5">
                            For families — safe to send home
                          </p>
                          <p className="font-typewriter text-[12px] leading-relaxed text-[#f5e6c8]">
                            {r.narrative}
                          </p>
                        </div>

                        {r.teacherNote && (
                          <div className="border-t border-[rgba(201,147,58,0.12)] pt-2.5">
                            <p className="font-typewriter text-[9px] tracking-[0.25em] uppercase text-[#c0392b] mb-1">
                              Your eyes only — do not send
                            </p>
                            <p className="font-typewriter text-[11px] leading-relaxed text-[#c4a882]">
                              {r.teacherNote}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => copyNarrative(r)}
                          className="clip-skew px-3 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.12)] text-[#e8b455] border border-[rgba(201,147,58,0.35)] hover:bg-[rgba(201,147,58,0.22)] transition-colors"
                        >
                          {copied === r.studentId ? "✓ Copied" : "Copy family note"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
