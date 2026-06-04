"use client";

import { useState } from "react";
import { TabHeader } from "./OverviewTab";

interface Props { classId: string }

function downloadCSV(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

async function triggerExport(classId: string, type: string, label: string) {
  const url = `/api/teacher/dashboard/export?classId=${encodeURIComponent(classId)}&type=${type}`;
  const res = await fetch(url);
  if (!res.ok) { alert("Export failed. Try again."); return; }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  downloadCSV(objectUrl, `${label}-${new Date().toISOString().slice(0, 10)}.csv`);
  URL.revokeObjectURL(objectUrl);
}

const EXPORTS = [
  { type: "students", label: "students", name: "Students", icon: "👤", desc: "Display name, units completed, time, badges, last active" },
  { type: "vocab", label: "vocab-mastery", name: "Vocabulary mastery", icon: "📚", desc: "Per-student mastery data for every vocab term" },
  { type: "attempts", label: "attempts", name: "Attempt history", icon: "📊", desc: "Every activity attempt with score, time, and date" },
];

export default function ExportTab({ classId }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleExport(type: string, label: string) {
    if (!classId) { alert("Select a class first."); return; }
    setLoading(type);
    await triggerExport(classId, type, label);
    setLoading(null);
  }

  async function handleExportAll() {
    if (!classId) { alert("Select a class first."); return; }
    for (const exp of EXPORTS) {
      setLoading(exp.type);
      await triggerExport(classId, exp.type, exp.label);
      await new Promise((r) => setTimeout(r, 400)); // small delay between downloads
    }
    setLoading(null);
  }

  return (
    <div className="space-y-4">
      <TabHeader title="Export Data" lastUpdated={null} onRefresh={() => {}} />
      <p className="font-typewriter text-xs text-[#8b7355]">
        All exports are CSV files for the currently selected class. Open in Excel, Google Sheets, or any spreadsheet app.
      </p>

      <div className="space-y-3">
        {EXPORTS.map((exp) => (
          <div key={exp.type} className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{exp.icon}</span>
              <div>
                <p className="font-typewriter text-sm text-[#f5e6c8] mb-0.5">{exp.name}</p>
                <p className="font-typewriter text-[10px] text-[#8b7355]">{exp.desc}</p>
              </div>
            </div>
            <button
              onClick={() => handleExport(exp.type, exp.label)}
              disabled={loading === exp.type}
              className="shrink-0 clip-skew px-5 py-2 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.1)] text-[#e8b455] border border-[rgba(201,147,58,0.3)] hover:bg-[rgba(201,147,58,0.2)] transition-colors disabled:opacity-50"
            >
              {loading === exp.type ? "Generating…" : "↓ CSV"}
            </button>
          </div>
        ))}
      </div>

      <div className="border border-[rgba(201,147,58,0.3)] bg-[rgba(201,147,58,0.05)] p-5 flex items-center justify-between">
        <div>
          <p className="font-typewriter text-sm text-[#e8b455]">Export everything</p>
          <p className="font-typewriter text-[10px] text-[#8b7355]">Downloads all three CSV files sequentially</p>
        </div>
        <button
          onClick={handleExportAll}
          disabled={!!loading}
          className="clip-skew px-6 py-2.5 font-typewriter text-xs tracking-[0.2em] uppercase bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-50"
        >
          {loading ? "Downloading…" : "↓ Export all"}
        </button>
      </div>
    </div>
  );
}
