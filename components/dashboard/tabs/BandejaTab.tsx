"use client";

import { useState, useCallback, useRef } from "react";
import { useClassData, relativeTime } from "@/lib/hooks/useClassData";
import { TabHeader, Loading, Empty } from "./OverviewTab";

interface FlagRow {
  id: string;
  studentId: string;
  studentName: string;
  flagType: string;
  flagLabel: string;
  urgency: number;
  unitNumber: number | null;
  context: Record<string, unknown>;
  createdAt: string;
  acknowledged: boolean;
  resolved: boolean;
  teacherNote: string | null;
}

interface InboxData {
  flags: FlagRow[];
  unacknowledgedCount: number;
}

// Flag type display config
const FLAG_UI: Record<string, { color: string; bg: string; icon: string }> = {
  help_requested:                 { color: "text-[#c0392b]",  bg: "bg-[rgba(192,57,43,0.12)]  border-[rgba(192,57,43,0.4)]",  icon: "🙋" },
  academia_skipped_after_failure: { color: "text-[#c9933a]",  bg: "bg-[rgba(201,147,58,0.08)] border-[rgba(201,147,58,0.35)]", icon: "⏭" },
  academia_struggling:            { color: "text-[#c0392b]",  bg: "bg-[rgba(192,57,43,0.1)]   border-[rgba(192,57,43,0.4)]",  icon: "🔄" },
  needs_listening_support:        { color: "text-[#e8b455]",  bg: "bg-[rgba(232,180,85,0.06)] border-[rgba(232,180,85,0.25)]", icon: "🔊" },
  listening_skipped:              { color: "text-[#c9933a]",  bg: "bg-[rgba(201,147,58,0.06)] border-[rgba(201,147,58,0.25)]", icon: "↷" },
  transcript_revealed:            { color: "text-[#8b7355]",  bg: "bg-[rgba(139,115,85,0.06)] border-[rgba(139,115,85,0.2)]",  icon: "📄" },
  repeated_failure:               { color: "text-[#c0392b]",  bg: "bg-[rgba(192,57,43,0.08)] border-[rgba(192,57,43,0.3)]",   icon: "⚠" },
  stage_skipped:                  { color: "text-[#8b7355]",  bg: "bg-[rgba(139,115,85,0.04)] border-[rgba(139,115,85,0.15)]", icon: "⏭" },
  repeated_skipping:              { color: "text-[#c0392b]",  bg: "bg-[rgba(192,57,43,0.1)]  border-[rgba(192,57,43,0.35)]",  icon: "⚠⏭" },
};

const UNLOCK_ELIGIBLE = new Set(["academia_struggling", "academia_skipped_after_failure"]);

const DEFAULT_UI = { color: "text-[#8b7355]", bg: "bg-[rgba(139,115,85,0.06)] border-[rgba(139,115,85,0.2)]", icon: "🚩" };

type FilterType = "all" | "unresolved" | "help" | "academia" | "listening";

export default function BandejaTab({ classId }: { classId: string }) {
  const { data, loading, lastUpdated, refetch } = useClassData<InboxData>("/api/teacher/dashboard/inbox", classId);
  const [filter, setFilter]             = useState<FilterType>("unresolved");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText]         = useState("");
  const [actioning, setActioning]       = useState<string | null>(null);
  const [unlocking, setUnlocking]       = useState<string | null>(null);   // flagId being unlocked
  const unlockedSet                     = useRef<Set<string>>(new Set());  // track already-unlocked flagIds

  const allFlags = data?.flags ?? [];

  const visible = allFlags.filter((f) => {
    if (filter === "unresolved") return !f.resolved;
    if (filter === "help")       return f.flagType === "help_requested";
    if (filter === "academia")   return f.flagType.startsWith("academia");
    if (filter === "listening")  return ["needs_listening_support", "listening_skipped", "transcript_revealed"].includes(f.flagType);
    return true;
  });

  const sorted = [...visible].sort((a, b) => {
    // Urgency first, then recency
    if (a.urgency !== b.urgency) return a.urgency - b.urgency;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const action = useCallback(
    async (id: string, act: "acknowledge" | "resolve" | "add_note", note?: string) => {
      setActioning(id);
      await fetch("/api/teacher/dashboard/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: act, note }),
      }).catch(() => {});
      await refetch();
      setActioning(null);
      setEditingNoteId(null);
    },
    [refetch]
  );

  const unlockAcademia = useCallback(
    async (flagId: string, studentId: string, unitNumber: number | null) => {
      if (!unitNumber || unlockedSet.current.has(flagId)) return;
      setUnlocking(flagId);
      const res = await fetch("/api/teacher/unlock-academia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, unitNumber }),
      }).catch(() => null);
      if (res?.ok) {
        unlockedSet.current.add(flagId);
        // Also resolve the flag so it leaves the inbox
        await action(flagId, "resolve");
      }
      setUnlocking(null);
    },
    [action]
  );

  if (!classId) return <Empty />;
  if (loading && !data) return <Loading />;

  const unackedCount = allFlags.filter((f) => !f.acknowledged).length;

  return (
    <div className="space-y-4">
      <TabHeader
        title={`Bandeja de entrada${unackedCount > 0 ? ` (${unackedCount} sin revisar)` : ""}`}
        lastUpdated={lastUpdated}
        onRefresh={refetch}
      />

      {/* Info banner */}
      <div className="border border-[rgba(201,147,58,0.15)] bg-[rgba(201,147,58,0.04)] px-4 py-3">
        <p className="font-typewriter text-[10px] text-[#8b7355] leading-relaxed">
          Estos son los momentos en que los estudiantes necesitaron más apoyo. Úsalos para conversaciones 1:1 o ajustes de grupo.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["unresolved", "help", "academia", "listening", "all"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-typewriter text-[10px] px-3 py-1.5 border tracking-[0.15em] uppercase transition-colors ${
              filter === f
                ? "border-[#c9933a] bg-[rgba(201,147,58,0.1)] text-[#e8b455]"
                : "border-[rgba(201,147,58,0.2)] text-[#8b7355] hover:text-[#c9933a]"
            }`}
          >
            {f === "unresolved" ? `Sin revisar (${allFlags.filter((x) => !x.resolved).length})`
              : f === "help"     ? "Piden ayuda"
              : f === "academia" ? "Academia"
              : f === "listening"? "Escucha"
              : "Todos"}
          </button>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] px-6 py-8 text-center">
          <p className="font-typewriter text-sm text-[#c9933a]">✓ Bandeja vacía</p>
          <p className="font-typewriter text-xs text-[#8b7355] mt-1">No hay alertas pendientes para este filtro.</p>
        </div>
      )}

      {/* Flag cards */}
      <div className="space-y-3">
        {sorted.map((flag) => {
          const ui = FLAG_UI[flag.flagType] ?? DEFAULT_UI;
          const isActioning = actioning === flag.id;

          return (
            <div
              key={flag.id}
              className={`border p-4 space-y-3 transition-opacity ${ui.bg} ${flag.resolved ? "opacity-50" : ""}`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0">{ui.icon}</span>
                  <div className="min-w-0">
                    <p className={`font-typewriter text-xs font-bold ${ui.color}`}>
                      {flag.flagLabel}
                    </p>
                    <p className="font-typewriter text-[10px] text-[#8b7355] mt-0.5">
                      <span className="text-[#c4a882]">{flag.studentName}</span>
                      {flag.unitNumber != null && ` · Unidad ${flag.unitNumber}`}
                      {" · "}{relativeTime(flag.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!flag.acknowledged && (
                    <span className="font-typewriter text-[9px] px-2 py-0.5 bg-[rgba(192,57,43,0.2)] border border-[rgba(192,57,43,0.4)] text-[#c0392b] uppercase tracking-wider">
                      Nuevo
                    </span>
                  )}
                  {flag.resolved && (
                    <span className="font-typewriter text-[9px] text-[#4a3a2a] uppercase tracking-wider">
                      Resuelto
                    </span>
                  )}
                </div>
              </div>

              {/* Help message / context */}
              {flag.flagType === "help_requested" && !!flag.context.message && (
                <div className="border-l-2 border-[rgba(192,57,43,0.4)] pl-3">
                  <p className="font-typewriter text-xs text-[#c4a882] leading-relaxed italic">
                    &ldquo;{flag.context.message as string}&rdquo;
                  </p>
                </div>
              )}

              {flag.flagType === "academia_skipped_after_failure" && flag.context.retries != null && (
                <p className="font-typewriter text-[10px] text-[#8b7355]">
                  {`Intentos antes de saltarse: ${flag.context.retries}`}
                </p>
              )}

              {/* Teacher note (display) */}
              {flag.teacherNote && editingNoteId !== flag.id && (
                <div className="border border-[rgba(201,147,58,0.15)] bg-[#0d0b0a] px-3 py-2">
                  <p className="font-typewriter text-[10px] text-[#8b7355] mb-0.5 uppercase tracking-wider">Nota privada</p>
                  <p className="font-typewriter text-xs text-[#c4a882]">{flag.teacherNote}</p>
                </div>
              )}

              {/* Note editor */}
              {editingNoteId === flag.id && (
                <div className="space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Nota privada (solo tú puedes verla)…"
                    rows={2}
                    className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.2)] text-[#c4a882] font-typewriter text-xs px-3 py-2 resize-none focus:outline-none focus:border-[rgba(201,147,58,0.4)] placeholder:text-[#4a3a2a]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => action(flag.id, "add_note", noteText)}
                      disabled={isActioning}
                      className="font-typewriter text-[10px] px-3 py-1.5 border border-[rgba(201,147,58,0.3)] text-[#c9933a] hover:bg-[rgba(201,147,58,0.08)] transition-colors disabled:opacity-40"
                    >
                      Guardar nota
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="font-typewriter text-[10px] px-3 py-1.5 text-[#8b7355] hover:text-[#c4a882]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {!flag.resolved && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-[rgba(201,147,58,0.08)]">
                  {/* Unlock academia — only for struggling/skipped flags */}
                  {UNLOCK_ELIGIBLE.has(flag.flagType) && flag.unitNumber != null && (
                    <button
                      onClick={() => unlockAcademia(flag.id, flag.studentId, flag.unitNumber)}
                      disabled={unlocking === flag.id || unlockedSet.current.has(flag.id)}
                      className="font-typewriter text-[10px] px-3 py-1.5 border border-[rgba(201,147,58,0.5)] text-[#e8b455] bg-[rgba(201,147,58,0.08)] hover:bg-[rgba(201,147,58,0.15)] transition-colors disabled:opacity-40"
                    >
                      {unlocking === flag.id ? "…" : unlockedSet.current.has(flag.id) ? "🔓 Desbloqueado" : "🔓 Desbloquear avance"}
                    </button>
                  )}

                  {!flag.acknowledged && (
                    <button
                      onClick={() => action(flag.id, "acknowledge")}
                      disabled={isActioning}
                      className="font-typewriter text-[10px] px-3 py-1.5 border border-[rgba(201,147,58,0.25)] text-[#c9933a] hover:bg-[rgba(201,147,58,0.08)] transition-colors disabled:opacity-40"
                    >
                      {isActioning ? "…" : "✓ Revisar"}
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingNoteId(flag.id); setNoteText(flag.teacherNote ?? ""); }}
                    className="font-typewriter text-[10px] px-3 py-1.5 border border-[rgba(201,147,58,0.15)] text-[#8b7355] hover:text-[#c9933a] transition-colors"
                  >
                    📝 Nota
                  </button>
                  <button
                    onClick={() => action(flag.id, "resolve")}
                    disabled={isActioning}
                    className="font-typewriter text-[10px] px-3 py-1.5 border border-[rgba(201,147,58,0.15)] text-[#8b7355] hover:text-[#c4a882] transition-colors disabled:opacity-40"
                  >
                    {isActioning ? "…" : "↗ Atendido"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
