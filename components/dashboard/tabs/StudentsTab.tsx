"use client";

import { useState } from "react";
import { useClassData, relativeTime, masteryColor, fmtMinutes } from "@/lib/hooks/useClassData";
import { TabHeader, Loading, Empty } from "./OverviewTab";
import StudentDetail from "../StudentDetail";

interface StudentRow {
  id: string;
  displayName: string;
  joinedAt: string;
  unitsCompleted: number;
  totalTimeSeconds: number;
  lastActive: string | null;
  masteryPct: number;
  badgeCount: number;
  academiaRetries?: number;
  academiaSessions?: number;
  needsSupportCount?: number;
  stakeoutAttempts?: number;
  stakeoutPassed?: number;
  stakeoutAvgTime?: number | null;
  trainingMinutesWeek?: number;
  trainingDrillsTotal?: number;
  trainingStreak?: number;
  briefingStreak?: number;
  briefingSkips?: number;
  briefingTotal?: number;
  coldCasesCompleted?: number;
  archived?: boolean;
  /** Casos granted by the teacher (late joiner) rather than played. */
  creditedCasos?: number;
  listeningFlags?: {
    needsSupport: boolean;
    transcriptRevealed: boolean;
    skipped: boolean;
    academiaSkipped?: boolean;
    helpRequested?: boolean;
    stagesSkippedCount?: number;
    repeatedSkipping?: boolean;
    flagCount: number;
  };
}

interface StudentsData { students: StudentRow[] }

type PinResult = { id: string; name: string; pin: string };

type SortKey = keyof StudentRow;

export default function StudentsTab({ classId }: { classId: string }) {
  const [showArchived, setShowArchived] = useState(false);
  const { data, loading, lastUpdated, refetch } = useClassData<StudentsData>(
    "/api/teacher/dashboard/students",
    classId,
    showArchived ? "&includeArchived=1" : ""
  );
  const [sortKey, setSortKey] = useState<SortKey>("unitsCompleted");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pinResult, setPinResult] = useState<PinResult | null>(null);
  const [catchUpFor, setCatchUpFor] = useState<StudentRow | null>(null);
  const [catchUpThrough, setCatchUpThrough] = useState("4");
  const [catchUpMsg, setCatchUpMsg] = useState<string | null>(null);
  const [archiveFor, setArchiveFor] = useState<StudentRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function post(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) throw new Error((json.error as string) ?? "Something went wrong.");
    return json;
  }

  async function handleNewPin(s: StudentRow) {
    setActionError(null); setBusyId(s.id);
    try {
      const r = await post("/api/teacher/student-pin", { studentId: s.id });
      setPinResult({ id: s.id, name: s.displayName, pin: String(r.pin) });
    } catch (e) { setActionError((e as Error).message); }
    finally { setBusyId(null); }
  }

  async function handleArchive(s: StudentRow, archived: boolean) {
    setActionError(null); setBusyId(s.id);
    try {
      await post("/api/teacher/student-archive", { studentId: s.id, archived });
      setArchiveFor(null);
      refetch();
    } catch (e) { setActionError((e as Error).message); }
    finally { setBusyId(null); }
  }

  async function handleCatchUp() {
    if (!catchUpFor) return;
    const through = Number(catchUpThrough);
    setActionError(null); setBusyId(catchUpFor.id);
    try {
      const r = await post("/api/teacher/catch-up", { studentId: catchUpFor.id, throughCaso: through });
      setCatchUpMsg(
        `${r.displayName}: ${r.credited} caso(s) credited` +
        (Number(r.alreadyPlayed) > 0 ? `, ${r.alreadyPlayed} already played (left alone)` : "") +
        (r.unlocked ? ` · now starts on Caso ${r.unlocked}.` : ".")
      );
      refetch();
    } catch (e) { setActionError((e as Error).message); }
    finally { setBusyId(null); }
  }

  if (!classId) return <Empty />;
  if (loading && !data) return <Loading />;

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sorted = [...(data?.students ?? [])].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = av == null ? -1 : bv == null ? 1 : av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  function SortTh({ k, label }: { k: SortKey; label: string }) {
    const active = sortKey === k;
    return (
      <th className="text-left pb-2 pr-4 cursor-pointer select-none" onClick={() => handleSort(k)}>
        <span className={`font-typewriter text-[10px] tracking-[0.2em] uppercase ${active ? "text-[#e8b455]" : "text-[#8b7355]"} hover:text-[#c9933a] transition-colors`}>
          {label} {active ? (sortDir === "asc" ? "↑" : "↓") : ""}
        </span>
      </th>
    );
  }

  return (
    <div className="space-y-4">
      <TabHeader title={`Students (${data?.students.length ?? 0})`} lastUpdated={lastUpdated} onRefresh={refetch} />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="flex items-center gap-2 font-typewriter text-[11px] text-[#8b7355] cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="accent-[#c9933a]"
          />
          Show archived students
        </label>
        {actionError && (
          <p className="font-typewriter text-[11px] text-[#c0392b]">{actionError}</p>
        )}
      </div>

      {/* A new PIN, shown once, big enough to read across a classroom. */}
      {pinResult && (
        <div className="border-2 border-[#c9933a] bg-[rgba(201,147,58,0.1)] px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#c9933a] mb-1">
              Nuevo PIN · {pinResult.name}
            </p>
            <p className="font-display font-black text-4xl text-[#f5e6c8] tracking-[0.35em]">{pinResult.pin}</p>
            <p className="font-typewriter text-[10px] text-[#8b7355] mt-1">
              Their old PIN no longer works. Tell them this one — it is not shown again.
            </p>
          </div>
          <button
            onClick={() => setPinResult(null)}
            className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-[rgba(201,147,58,0.4)] text-[#c9933a] hover:text-[#e8b455] hover:border-[#c9933a] transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {catchUpMsg && (
        <div className="border border-[rgba(90,158,111,0.5)] bg-[rgba(90,158,111,0.08)] px-4 py-2 flex items-center justify-between gap-3">
          <p className="font-typewriter text-xs text-[#9fd3ae]">✓ {catchUpMsg}</p>
          <button onClick={() => setCatchUpMsg(null)} className="font-typewriter text-[10px] text-[#8b7355] hover:text-[#c9933a]">✕</button>
        </div>
      )}

      <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[rgba(201,147,58,0.15)]">
            <tr className="px-4">
              <th className="text-left pb-2 pl-4 pt-3">
                <span className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">Agent</span>
              </th>
              <SortTh k="unitsCompleted" label="Units ✓" />
              <SortTh k="totalTimeSeconds" label="Time" />
              <SortTh k="lastActive" label="Last seen" />
              <SortTh k="masteryPct" label="Mastery" />
              <SortTh k="badgeCount" label="Badges" />
              <SortTh k="academiaRetries" label="Academy ↺" />
              <SortTh k="stakeoutAvgTime" label="Stakeout ⏱" />
              <SortTh k="trainingMinutesWeek" label="Training /wk" />
              <SortTh k="briefingStreak" label="Briefing 📋" />
              <SortTh k="coldCasesCompleted" label="❄ Cold" />
              <th className="text-left pb-2 pr-4 pt-3">
                <span className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">🔊 Audio</span>
              </th>
              <th className="text-right pb-2 pr-4 pt-3">
                <span className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr
                key={s.id}
                onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
                className={`border-b border-[rgba(201,147,58,0.06)] cursor-pointer transition-colors ${s.id === selectedId ? "bg-[rgba(201,147,58,0.08)]" : "hover:bg-[rgba(201,147,58,0.03)]"}`}
              >
                <td className="py-2.5 pl-4 pr-4">
                  <p className={`font-typewriter text-sm ${s.archived ? "text-[#6b5a48] line-through" : "text-[#f5e6c8]"}`}>
                    {s.displayName}
                  </p>
                  <p className="font-typewriter text-[10px] text-[#4a3a2a] flex items-center gap-1.5 flex-wrap">
                    Joined {s.joinedAt.slice(0, 10)}
                    {s.archived && <span className="text-[#8b7355]">· archivado</span>}
                    {(s.creditedCasos ?? 0) > 0 && (
                      <span
                        title={`${s.creditedCasos} caso(s) credited by you when this student joined, not played`}
                        className="px-1.5 py-0.5 border border-[rgba(201,147,58,0.35)] text-[#c9933a] leading-none"
                      >
                        ⏩ {s.creditedCasos} credited
                      </span>
                    )}
                  </p>
                </td>
                <td className="py-2.5 pr-4 font-typewriter text-sm text-[#c4a882]">{s.unitsCompleted}</td>
                <td className="py-2.5 pr-4 font-typewriter text-sm text-[#c4a882]">{fmtMinutes(s.totalTimeSeconds)}</td>
                <td className="py-2.5 pr-4 font-typewriter text-xs text-[#8b7355]">{relativeTime(s.lastActive)}</td>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[#2c2220] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.masteryPct}%`, background: masteryColor(s.masteryPct) }} />
                    </div>
                    <span className="font-typewriter text-xs" style={{ color: masteryColor(s.masteryPct) }}>{s.masteryPct}%</span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 font-typewriter text-sm text-[#c9933a]">{s.badgeCount}</td>
                <td className="py-2.5 pr-4 font-typewriter text-sm">
                  {s.academiaSessions != null && s.academiaSessions > 0
                    ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-[#8b7355]" title={`${s.academiaSessions} unit(s) trained · ${s.academiaRetries} retries`}>
                          {s.academiaRetries ?? 0}
                          <span className="text-[10px] text-[#4a3a2a] ml-0.5">/{s.academiaSessions}</span>
                        </span>
                        {(s.needsSupportCount ?? 0) > 0 && (
                          <span
                            title={`Advanced without passing in ${s.needsSupportCount} unit(s) — may need support`}
                            className="font-typewriter text-[10px] px-1.5 py-0.5 bg-[rgba(192,57,43,0.15)] border border-[rgba(192,57,43,0.3)] text-[#c0392b] leading-none"
                          >
                            ⚠ support
                          </span>
                        )}
                      </span>
                    )
                    : <span className="text-[#4a3a2a]">—</span>
                  }
                </td>
                <td className="py-2.5 pr-4 font-typewriter text-sm">
                  {s.briefingTotal != null && s.briefingTotal > 0
                    ? (
                      <span
                        title={`${s.briefingTotal} total · ${s.briefingSkips ?? 0} skipped`}
                        className={
                          (s.briefingStreak ?? 0) >= 5 ? "text-[#4a9eff]"
                          : (s.briefingStreak ?? 0) > 0 ? "text-[rgba(74,158,255,0.6)]"
                          : "text-[#4a3a2a]"
                        }>
                        🔵 {s.briefingStreak ?? 0}
                        {(s.briefingSkips ?? 0) > 0 && (
                          <span className="text-[10px] text-[#c0392b] ml-1">↷{s.briefingSkips}</span>
                        )}
                      </span>
                    )
                    : <span className="text-[#4a3a2a]">—</span>
                  }
                </td>
                <td className="py-2.5 pr-4 font-typewriter text-sm">
                  {s.trainingMinutesWeek != null
                    ? (
                      <span title={`${s.trainingDrillsTotal} drills · ${s.trainingStreak} day streak`}
                        className={s.trainingStreak && s.trainingStreak >= 3
                          ? "text-[#c9933a]"
                          : s.trainingMinutesWeek > 0
                          ? "text-[#e8b455]"
                          : "text-[#4a3a2a]"}>
                        {s.trainingMinutesWeek}m
                        {s.trainingStreak ? <span className="text-[10px] text-[#4a3a2a] ml-1">🔥{s.trainingStreak}</span> : null}
                      </span>
                    )
                    : <span className="text-[#4a3a2a]">—</span>
                  }
                </td>
                <td className="py-2.5 pr-4 font-typewriter text-sm">
                  {s.stakeoutAttempts
                    ? (
                      <span title={`${s.stakeoutPassed}/${s.stakeoutAttempts} passed`}
                        className={s.stakeoutAvgTime != null && s.stakeoutAvgTime > 30
                          ? "text-[#c9933a]"
                          : s.stakeoutAvgTime != null && s.stakeoutAvgTime > 0
                          ? "text-[#e8b455]"
                          : "text-[#c0392b]"}>
                        {s.stakeoutPassed}/{s.stakeoutAttempts}
                        {s.stakeoutAvgTime != null && (
                          <span className="text-[#4a3a2a] text-[10px] ml-1">({s.stakeoutAvgTime}s)</span>
                        )}
                      </span>
                    )
                    : <span className="text-[#4a3a2a]">—</span>
                  }
                </td>
                <td className="py-2.5 pr-4 font-typewriter text-sm">
                  {(s.coldCasesCompleted ?? 0) > 0
                    ? <span className="text-[#4a9eff]">❄ {s.coldCasesCompleted}</span>
                    : <span className="text-[#4a3a2a]">—</span>
                  }
                </td>
                <td className="py-2.5 pr-4 font-typewriter text-sm">
                  {s.listeningFlags && s.listeningFlags.flagCount > 0 ? (
                    <span className="flex items-center gap-1 flex-wrap">
                      {s.listeningFlags.repeatedSkipping && (
                        <span title="Skipped 3+ stages in a recent session" className="font-typewriter text-[10px] px-1.5 py-0.5 bg-[rgba(192,57,43,0.2)] border border-[rgba(192,57,43,0.5)] text-[#c0392b] leading-none font-bold">
                          ⚠ skip×{s.listeningFlags.stagesSkippedCount ?? 3}
                        </span>
                      )}
                      {!s.listeningFlags.repeatedSkipping && (s.listeningFlags.stagesSkippedCount ?? 0) > 0 && (
                        <span title={`Skipped ${s.listeningFlags.stagesSkippedCount} stage(s)`} className="font-typewriter text-[10px] px-1.5 py-0.5 bg-[rgba(201,147,58,0.08)] border border-[rgba(201,147,58,0.2)] text-[#8b7355] leading-none">
                          ⏭ ×{s.listeningFlags.stagesSkippedCount}
                        </span>
                      )}
                      {s.listeningFlags.helpRequested && (
                        <span title="Asked the teacher for help" className="font-typewriter text-[10px] px-1.5 py-0.5 bg-[rgba(192,57,43,0.15)] border border-[rgba(192,57,43,0.4)] text-[#c0392b] leading-none">
                          🙋 help
                        </span>
                      )}
                      {s.listeningFlags.academiaSkipped && (
                        <span title="Skipped the Academy after failing" className="font-typewriter text-[10px] px-1.5 py-0.5 bg-[rgba(201,147,58,0.12)] border border-[rgba(201,147,58,0.3)] text-[#c9933a] leading-none">
                          ⏭ academy
                        </span>
                      )}
                      {s.listeningFlags.needsSupport && (
                        <span title="Requested more audio replays" className="font-typewriter text-[10px] px-1.5 py-0.5 bg-[rgba(201,147,58,0.12)] border border-[rgba(201,147,58,0.3)] text-[#c9933a] leading-none">
                          🔄 +audio
                        </span>
                      )}
                      {s.listeningFlags.transcriptRevealed && (
                        <span title="Revealed the transcript early" className="font-typewriter text-[10px] px-1.5 py-0.5 bg-[rgba(201,147,58,0.08)] border border-[rgba(201,147,58,0.2)] text-[#8b7355] leading-none">
                          📄 transc.
                        </span>
                      )}
                      {s.listeningFlags.skipped && (
                        <span title="Skipped the listening stage unresolved" className="font-typewriter text-[10px] px-1.5 py-0.5 bg-[rgba(192,57,43,0.12)] border border-[rgba(192,57,43,0.3)] text-[#c0392b] leading-none">
                          ↷ skipped
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[#4a3a2a]">—</span>
                  )}
                </td>

                {/* Roster actions. stopPropagation: the row itself opens the
                    student detail panel, and a misfired click there is noise. */}
                <td className="py-2.5 pr-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  {s.archived ? (
                    <button
                      onClick={() => handleArchive(s, false)}
                      disabled={busyId === s.id}
                      className="font-typewriter text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 border border-[rgba(90,158,111,0.4)] text-[#5a9e6f] hover:border-[#5a9e6f] transition-colors disabled:opacity-40"
                    >
                      ↩ Restore
                    </button>
                  ) : (
                    <span className="inline-flex gap-1.5">
                      <button
                        onClick={() => handleNewPin(s)}
                        disabled={busyId === s.id}
                        title="Issue a new 4-digit PIN and show it (the old one stops working)"
                        className="font-typewriter text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 border border-[rgba(201,147,58,0.3)] text-[#c9933a] hover:border-[#c9933a] hover:text-[#e8b455] transition-colors disabled:opacity-40"
                      >
                        🔑 PIN
                      </button>
                      <button
                        onClick={() => { setCatchUpFor(s); setCatchUpMsg(null); setActionError(null); }}
                        disabled={busyId === s.id}
                        title="Late joiner: credit Casos 1-X and start them where the class is"
                        className="font-typewriter text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 border border-[rgba(201,147,58,0.3)] text-[#c9933a] hover:border-[#c9933a] hover:text-[#e8b455] transition-colors disabled:opacity-40"
                      >
                        ⏩ Catch up
                      </button>
                      <button
                        onClick={() => { setArchiveFor(s); setActionError(null); }}
                        disabled={busyId === s.id}
                        title="Hide this account from the roster, gradebook and leaderboards (reversible)"
                        className="font-typewriter text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 border border-[rgba(139,115,85,0.3)] text-[#8b7355] hover:border-[#c0392b] hover:text-[#c0392b] transition-colors disabled:opacity-40"
                      >
                        📦 Archive
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="font-typewriter text-xs text-[#4a3a2a] p-4">No students in this class yet.</p>
        )}
      </div>

      {/* Catch-up: credit Casos 1-X for a late joiner. */}
      {catchUpFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-[rgba(0,0,0,0.85)]" onClick={() => setCatchUpFor(null)}>
          <div className="w-full max-w-md border-2 border-[rgba(201,147,58,0.4)] bg-[#1a1614] p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#c9933a] mb-1">Catch up a late joiner</p>
              <p className="font-display font-bold text-xl text-[#f5e6c8]">{catchUpFor.displayName}</p>
            </div>
            <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed">
              Credit every caso up to and including this one, then start them on the next.
              Casos they already played are left exactly as they are.
            </p>
            <label className="block">
              <span className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">Skip through caso</span>
              <input
                type="number"
                min={1}
                max={32}
                value={catchUpThrough}
                onChange={(e) => setCatchUpThrough(e.target.value)}
                className="mt-1 w-full bg-[#0d0b0a] border border-[rgba(201,147,58,0.3)] focus:border-[#c9933a] focus:outline-none px-3 py-2 font-typewriter text-lg text-[#f5e6c8]"
              />
            </label>
            <p className="font-typewriter text-[11px] text-[#c4a882]">
              Casos 1-{Number(catchUpThrough) || 1} credited · they start on Caso {(Number(catchUpThrough) || 1) + 1}.
            </p>
            {actionError && <p className="font-typewriter text-[11px] text-[#c0392b]">{actionError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCatchUpFor(null)}
                className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-[rgba(139,115,85,0.3)] text-[#8b7355] hover:text-[#c4a882] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => { await handleCatchUp(); setCatchUpFor(null); }}
                disabled={busyId === catchUpFor.id || !(Number(catchUpThrough) >= 1 && Number(catchUpThrough) <= 32)}
                className="clip-skew font-typewriter text-[10px] tracking-[0.2em] uppercase px-5 py-2 bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40"
              >
                Credit casos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive confirmation. Reversible, but still worth one deliberate click. */}
      {archiveFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-[rgba(0,0,0,0.85)]" onClick={() => setArchiveFor(null)}>
          <div className="w-full max-w-md border-2 border-[rgba(192,57,43,0.5)] bg-[#1a1614] p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#c0392b]">Archive student</p>
            <p className="font-display font-bold text-xl text-[#f5e6c8]">{archiveFor.displayName}</p>
            <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed">
              They disappear from the roster, the gradebook, the leaderboards and the exports, and they
              cannot log in. Nothing is deleted — tick &ldquo;Show archived students&rdquo; to bring them back.
            </p>
            {actionError && <p className="font-typewriter text-[11px] text-[#c0392b]">{actionError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setArchiveFor(null)}
                className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-[rgba(139,115,85,0.3)] text-[#8b7355] hover:text-[#c4a882] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchive(archiveFor, true)}
                disabled={busyId === archiveFor.id}
                className="clip-skew font-typewriter text-[10px] tracking-[0.2em] uppercase px-5 py-2 bg-[#8b1a1a] text-[#f5e6c8] border border-[#c0392b] hover:bg-[#c0392b] transition-colors disabled:opacity-40"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      <StudentDetail studentId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
