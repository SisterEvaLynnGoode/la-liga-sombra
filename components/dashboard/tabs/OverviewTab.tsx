"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useClassData, lastUpdatedText } from "@/lib/hooks/useClassData";

interface OverviewData {
  totalStudents: number;
  avgCompletionPct: number;
  avgTimeMinutes: number;
  unitCompletion: Array<{ number: number; country: string; completed: number; total: number }>;
  inactiveStudents: Array<{ id: string; displayName: string; lastActive: string | null; daysInactive: number }>;
}

const TooltipContent = ({ active, payload, label }: Record<string, unknown>) => {
  if (!active || !(payload as unknown[])?.length) return null;
  const p = (payload as Array<{ value: number; name: string }>)[0];
  return (
    <div className="bg-[#1a1614] border border-[rgba(201,147,58,0.3)] px-3 py-2 font-typewriter text-xs">
      <p className="text-[#e8b455] mb-0.5">{label as string}</p>
      <p className="text-[#c4a882]">{p.value} estudiantes completados</p>
    </div>
  );
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5">
      <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-1">{label}</p>
      <p className="font-display text-3xl font-bold text-[#e8b455]">{value}</p>
      {sub && <p className="font-typewriter text-xs text-[#8b7355] mt-1">{sub}</p>}
    </div>
  );
}

export default function OverviewTab({ classId }: { classId: string }) {
  const { data, loading, lastUpdated, refetch } = useClassData<OverviewData>("/api/teacher/dashboard/overview", classId);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!classId) return <Empty />;
  if (loading && !data) return <Loading />;

  const chartData = data?.unitCompletion.map((u) => ({
    name: `${u.number}·${u.country.substring(0, 6)}`,
    fullName: u.country,
    completados: u.completed,
    total: u.total,
  })) ?? [];

  return (
    <div className="space-y-6">
      <TabHeader title="Resumen" lastUpdated={lastUpdated} onRefresh={refetch} />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Estudiantes activos" value={data?.totalStudents ?? 0} />
        <StatCard label="Completado promedio" value={`${data?.avgCompletionPct ?? 0}%`} sub="de las unidades" />
        <StatCard label="Tiempo por actividad" value={`${data?.avgTimeMinutes ?? 0}m`} sub="promedio" />
      </div>

      {/* Unit completion chart */}
      <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5">
        <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-4">
          Estudiantes por unidad completada
        </p>
        {mounted && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,147,58,0.08)" />
              <XAxis dataKey="name" tick={{ fill: "#8b7355", fontSize: 10, fontFamily: "Courier New" }} tickLine={false} axisLine={{ stroke: "rgba(201,147,58,0.15)" }} />
              <YAxis tick={{ fill: "#8b7355", fontSize: 10, fontFamily: "Courier New" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<TooltipContent />} cursor={{ fill: "rgba(201,147,58,0.05)" }} />
              <Bar dataKey="completados" fill="#c9933a" radius={[2, 2, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <p className="font-typewriter text-xs text-[#8b7355]">No activity yet</p>
          </div>
        )}
      </div>

      {/* Inactive students */}
      <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] p-5">
        <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-3">
          Sin actividad en 7+ días ({data?.inactiveStudents.length ?? 0})
        </p>
        {!data?.inactiveStudents.length ? (
          <p className="font-typewriter text-xs text-[#4a3a2a]">¡Todos activos esta semana!</p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {data.inactiveStudents.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-1 border-b border-[rgba(201,147,58,0.06)]">
                <span className="font-typewriter text-sm text-[#c4a882]">{s.displayName}</span>
                <span className="font-typewriter text-xs text-[#f87171]">
                  {s.daysInactive > 300 ? "Never played" : `${s.daysInactive}d ago`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabHeader({ title, lastUpdated, onRefresh }: { title: string; lastUpdated: Date | null; onRefresh: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display font-bold text-xl text-[#f5e6c8]">{title}</h2>
      <div className="flex items-center gap-3">
        {lastUpdated && <span className="font-typewriter text-[10px] text-[#4a3a2a]">{lastUpdatedText(lastUpdated)}</span>}
        <button onClick={onRefresh} className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors">↻ Refresh</button>
      </div>
    </div>
  );
}

function Loading() { return <div className="h-64 flex items-center justify-center"><div className="font-typewriter text-xs text-[#8b7355] animate-pulse">Loading data…</div></div>; }
function Empty() { return <div className="h-64 flex items-center justify-center"><p className="font-typewriter text-xs text-[#4a3a2a]">Select a class to view data.</p></div>; }
export { TabHeader, Loading, Empty };
