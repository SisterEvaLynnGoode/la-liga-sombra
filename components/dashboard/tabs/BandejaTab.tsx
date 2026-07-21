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
  errorPatterns?: Array<{
    errorKind: string;
    label: string;
    unitNumber: number | null;
    studentCount: number;
    eventCount: number;
  }>;
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
  mastery_up:                     { color: "text-[#5a9e6f]",  bg: "bg-[rgba(90,158,111,0.08)] border-[rgba(90,158,111,0.4)]", icon: "🎉" },
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
  const [challenging, setChallenging]   = useState<string | null>(null);   // flagId being challenged
  const challengedSet                   = useRef<Set<string>>(new Set());  // track already-challenged
  const [challengeMsg, setChallengeMsg] = useState<Record<string, string>>({});  // per-flag optional message
  const [showMsgFor, setShowMsgFor]     = useState<string | null>(null);  // which flag is showing msg input

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
        await action(flagId, "resolve");
      }
      setUnlocking(null);
    },
    [action]
  );

  const sendRetryChallenge = useCallback(
    async (flagId: string, studentId: string, unitNumber: number | null, message?: string) => {
      if (!unitNumber || challengedSet.current.has(flagId)) return;
      setChallenging(flagId);
      const res = await fetch("/api/teacher/retry-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, unitNumber, message }),
      }).catch(() => null);
      if (res?.ok) {
        challengedSet.current.add(flagId);
        await action(flagId, "acknowledge");
      }
      setChallenging(null);
      setShowMsgFor(null);
    },
    [action]
  );

  if (!classId) return <Empty />;
  if (loading && !data) return <Loading />;

  const unackedCount = allFlags.filter((f) => !f.acknowledged).length;

  return (
    <div className="space-y-4">
      <TabHeader
        title={`Inbox${unackedCount > 0 ? ` (${unackedCount} unread)` : ""}`}
        lastUpdated={lastUpdated}
        onRefresh={refetch}
      />

      {/* Info banner */}
      <div className="border border-[rgba(201,147,58,0.15)] bg-[rgba(201,147,58,0.04)] px-4 py-3">
        <p className="font-typewriter text-[10px] text-[#8b7355] leading-relaxed">
          These are the moments your students needed extra support. Use them for 1:1 conversations or whole-class adjustments.
        </p>
      </div>

      {/* Class error patterns — from classified item-level mistakes, last 14 days */}
      {(data?.errorPatterns?.length ?? 0) > 0 && (
        <div className="border border-[rgba(192,57,43,0.25)] bg-[rgba(192,57,43,0.05)] px-4 py-3 space-y-1.5">
          <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#c0392b]">
            🔍 Class error patterns · last 14 days
          </p>
          {data!.errorPatterns!.map((p) => (
            <p key={`${p.errorKind}-${p.unitNumber}`} className="font-typewriter text-[11px] text-[#c4a882]">
              <span className="text-[#e8b455] font-bold">{p.studentCount} student{p.studentCount === 1 ? "" : "s"}</span>
              {" "}making <span className="text-[#e8b455]">{p.label}</span> errors
              {p.unitNumber ? ` in Unit ${p.unitNumber}` : ""} ({p.eventCount} occurrences) —
              consider a warm-up re-teach.
            </p>
          ))}
        </div>
      )}

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
            {f === "unresolved" ? `Open (${allFlags.filter((x) => !x.resolved).length})`
              : f === "help"     ? "Asked for help"
              : f === "academia" ? "Academy"
              : f === "listening"? "Listening"
              : "All"}
          </button>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="border border-[rgba(201,147,58,0.15)] bg-[#1a1614] px-6 py-8 text-center">
          <p className="font-typewriter text-sm text-[#c9933a]">✓ Inbox empty</p>
          <p className="font-typewriter text-xs text-[#8b7355] mt-1">No pending alerts for this filter.</p>
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
                      {flag.unitNumber != null && ` · Unit ${flag.unitNumber}`}
                      {" · "}{relativeTime(flag.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!flag.acknowledged && (
                    <span className="font-typewriter text-[9px] px-2 py-0.5 bg-[rgba(192,57,43,0.2)] border border-[rgba(192,57,43,0.4)] text-[#c0392b] uppercase tracking-wider">
                      New
                    </span>
                  )}
                  {flag.resolved && (
                    <span className="font-typewriter text-[9px] text-[#4a3a2a] uppercase tracking-wider">
                      Resolved
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
                  {`Attempts before skipping: ${flag.context.retries}`}
                </p>
              )}

              {flag.flagType === "mastery_up" && !!flag.context.to && (
                <div className="border-l-2 border-[rgba(90,158,111,0.5)] pl-3">
                  <p className="font-typewriter text-xs text-[#c4a882]">
                    {flag.context.from ? `${flag.context.from as string} → ` : ""}
                    <span className="text-[#5a9e6f] font-bold">{flag.context.to as string}</span>
                  </p>
                </div>
              )}

              {/* Teacher note (display) */}
              {flag.teacherNote && editingNoteId !== flag.id && (
                <div className="border border-[rgba(201,147,58,0.15)] bg-[#0d0b0a] px-3 py-2">
                  <p className="font-typewriter text-[10px] text-[#8b7355] mb-0.5 uppercase tracking-wider">Private note</p>
                  <p className="font-typewriter text-xs text-[#c4a882]">{flag.teacherNote}</p>
                </div>
              )}

              {/* Note editor */}
              {editingNoteId === flag.id && (
                <div className="space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Private note (only you can see it)…"
                    rows={2}
                    className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.2)] text-[#c4a882] font-typewriter text-xs px-3 py-2 resize-none focus:outline-none focus:border-[rgba(201,147,58,0.4)] placeholder:text-[#4a3a2a]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => action(flag.id, "add_note", noteText)}
                      disabled={isActioning}
                      className="font-typewriter text-[10px] px-3 py-1.5 border border-[rgba(201,147,58,0.3)] text-[#c9933a] hover:bg-[rgba(201,147,58,0.08)] transition-colors disabled:opacity-40"
                    >
                      Save note
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="font-typewriter text-[10px] px-3 py-1.5 text-[#8b7355] hover:text-[#c4a882]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {!flag.resolved && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-[rgba(201,147,58,0.08)]">

                  {/* Teacher actions for struggling Academia students */}
                  {UNLOCK_ELIGIBLE.has(flag.flagType) && flag.unitNumber != null && (() => {
                    const alreadyChallenged = challengedSet.current.has(flag.id);
                    const alreadyUnlocked   = unlockedSet.current.has(flag.id);
                    const isShowingMsg      = showMsgFor === flag.id;
                    return (
                      <>
                        {/* Option 1: Retry challenge */}
                        {!alreadyChallenged && !alreadyUnlocked && !isShowingMsg && (
                          <button
                            onClick={() => setShowMsgFor(flag.id)}
                            disabled={challenging === flag.id}
                            className="font-typewriter text-[10px] px-3 py-1.5 border border-[rgba(232,180,85,0.4)] text-[#e8b455] hover:bg-[rgba(232,180,85,0.08)] transition-colors disabled:opacity-40"
                          >
                            🎯 Challenge to try again
                          </button>
                        )}

                        {/* Message composer for retry challenge */}
                        {isShowingMsg && !alreadyChallenged && (
                          <div className="w-full space-y-2">
                            <input
                              type="text"
                              value={challengeMsg[flag.id] ?? ""}
                              onChange={(e) => setChallengeMsg((prev) => ({ ...prev, [flag.id]: e.target.value }))}
                              placeholder="Optional message to the student… (English or Spanish — student sees it as-is)"
                              maxLength={120}
                              className="w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.2)] text-[#c4a882] font-typewriter text-xs px-3 py-2 focus:outline-none focus:border-[rgba(201,147,58,0.4)] placeholder:text-[#4a3a2a]"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => sendRetryChallenge(flag.id, flag.studentId, flag.unitNumber, challengeMsg[flag.id])}
                                disabled={challenging === flag.id}
                                className="font-typewriter text-[10px] px-3 py-1.5 border border-[rgba(232,180,85,0.5)] text-[#e8b455] bg-[rgba(232,180,85,0.08)] hover:bg-[rgba(232,180,85,0.15)] transition-colors disabled:opacity-40"
                              >
                                {challenging === flag.id ? "…" : "🎯 Send challenge"}
                              </button>
                              <button
                                onClick={() => setShowMsgFor(null)}
                                className="font-typewriter text-[10px] px-3 py-1.5 text-[#8b7355] hover:text-[#c4a882] transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {alreadyChallenged && (
                          <span className="font-typewriter text-[10px] text-[#e8b455] px-2 py-1.5">🎯 Challenge sent</span>
                        )}

                        {/* Option 2: Unlock to advance */}
                        {!alreadyUnlocked && !alreadyChallenged && !isShowingMsg && (
                          <button
                            onClick={() => unlockAcademia(flag.id, flag.studentId, flag.unitNumber)}
                            disabled={unlocking === flag.id}
                            className="font-typewriter text-[10px] px-3 py-1.5 border border-[rgba(201,147,58,0.5)] text-[#c9933a] hover:bg-[rgba(201,147,58,0.08)] transition-colors disabled:opacity-40"
                          >
                            {unlocking === flag.id ? "…" : "🔓 Unlock next stage"}
                          </button>
                        )}

                        {alreadyUnlocked && (
                          <span className="font-typewriter text-[10px] text-[#c9933a] px-2 py-1.5">🔓 Unlocked</span>
                        )}
                      </>
                    );
                  })()}

                  {!flag.acknowledged && (
                    <button
                      onClick={() => action(flag.id, "acknowledge")}
                      disabled={isActioning}
                      className="font-typewriter text-[10px] px-3 py-1.5 border border-[rgba(201,147,58,0.25)] text-[#c9933a] hover:bg-[rgba(201,147,58,0.08)] transition-colors disabled:opacity-40"
                    >
                      {isActioning ? "…" : "✓ Mark read"}
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingNoteId(flag.id); setNoteText(flag.teacherNote ?? ""); }}
                    className="font-typewriter text-[10px] px-3 py-1.5 border border-[rgba(201,147,58,0.15)] text-[#8b7355] hover:text-[#c9933a] transition-colors"
                  >
                    📝 Note
                  </button>
                  <button
                    onClick={() => action(flag.id, "resolve")}
                    disabled={isActioning}
                    className="font-typewriter text-[10px] px-3 py-1.5 border border-[rgba(201,147,58,0.15)] text-[#8b7355] hover:text-[#c4a882] transition-colors disabled:opacity-40"
                  >
                    {isActioning ? "…" : "↗ Resolve"}
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
