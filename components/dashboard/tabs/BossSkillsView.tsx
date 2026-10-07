"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useClassData, lastUpdatedText } from "@/lib/hooks/useClassData";
import { Loading } from "./OverviewTab";

/**
 * Boss fights and the skills behind them, inside Notas.
 *
 * The gradebook column is `bossAveragePct`: the average of the boss fights that
 * have a real percentage. A fight finished before per-stage recording shipped
 * has points but no denominator, and is shown as points with a dash rather than
 * being turned into a grade it cannot support.
 */

interface SkillBucket {
  label: string;
  caso: number | null;
  items: number;
  mastered: number;
  firstTry: number;
  masteredPct: number | null;
  firstTryPct: number | null;
  unmastered: string[];
}
interface BossScore {
  bossId: string;
  label: string;
  afterCaso: number;
  status: "completed" | "in_progress" | "skipped" | "not_started";
  scorePct: number | null;
  points: number | null;
  difficulty: string | null;
  ending: string | null;
  completedAt: string | null;
  stages: Array<{ label: string; skill: string; score: number; maxScore: number; pct: number | null; skipped: boolean }>;
}
interface StudentMastery {
  studentId: string;
  displayName: string;
  sisId: string | null;
  bosses: BossScore[];
  bossAveragePct: number | null;
  bossesGraded: number;
  profile: {
    vocabByTopic: SkillBucket[];
    grammarBySkill: SkillBucket[];
    listening: SkillBucket | null;
    speaking: SkillBucket | null;
    overallPct: number | null;
    totalItems: number;
    totalMastered: number;
    strengths: SkillBucket[];
    needsWork: SkillBucket[];
  };
}
interface MasteryData { students: StudentMastery[]; className: string | null }

function pctColor(p: number | null): string {
  if (p == null) return "#4a3a2a";
  if (p >= 85) return "#5a9e6f";
  if (p >= 70) return "#c9933a";
  if (p >= 50) return "#e8b455";
  return "#c0392b";
}

export default function BossSkillsView({ classId }: { classId: string }) {
  const { data, loading, lastUpdated, refetch } = useClassData<MasteryData>(
    "/api/teacher/dashboard/mastery",
    classId
  );
  const [openId, setOpenId] = useState<string | null>(null);

  if (loading && !data) return <Loading />;
  const students = data?.students ?? [];
  const bossMeta = students[0]?.bosses ?? [];
  const withData = students.filter((s) => s.profile.totalItems > 0 || s.bosses.some((b) => b.status !== "not_started"));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href={`/teacher/reports?classId=${classId}&mode=class`}
          className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-[rgba(201,147,58,0.35)] text-[#c9933a] hover:text-[#e8b455] hover:border-[#c9933a] transition-colors"
        >
          🖨 Class report (for admin)
        </Link>
        <Link
          href={`/teacher/reports?classId=${classId}&mode=students`}
          className="font-typewriter text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-[rgba(201,147,58,0.35)] text-[#c9933a] hover:text-[#e8b455] hover:border-[#c9933a] transition-colors"
        >
          🖨 One page per student
        </Link>
        <button
          onClick={refetch}
          className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] hover:text-[#c4a882] transition-colors"
        >
          ↻ refresh{lastUpdated ? ` · ${lastUpdatedText(lastUpdated)}` : ""}
        </button>
        <p className="font-typewriter text-[10px] text-[#4a3a2a]">
          Print → “Save as PDF”. Parent report cards are on the same page.
        </p>
      </div>

      <div className="border border-[rgba(201,147,58,0.2)] bg-[#1a1614] overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[rgba(201,147,58,0.15)]">
            <tr>
              <th className="text-left pb-2 pl-4 pt-3 font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">Agent</th>
              {bossMeta.map((b) => (
                <th key={b.bossId} className="text-left pb-2 pr-3 pt-3 font-typewriter text-[10px] tracking-[0.15em] uppercase text-[#8b7355]">
                  {b.label.replace("Operación ", "")}
                  <span className="block text-[9px] text-[#4a3a2a] normal-case tracking-normal">after Caso {b.afterCaso}</span>
                </th>
              ))}
              <th className="text-left pb-2 pr-3 pt-3 font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#e8b455]">Boss grade</th>
              <th className="text-left pb-2 pr-3 pt-3 font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">Skills mastered</th>
              <th className="text-left pb-2 pr-4 pt-3 font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355]">Needs work</th>
            </tr>
          </thead>
          <tbody>
            {withData.map((s) => (
              <Fragment key={s.studentId}>
                <tr
                  onClick={() => setOpenId(openId === s.studentId ? null : s.studentId)}
                  className={`border-b border-[rgba(201,147,58,0.06)] cursor-pointer transition-colors ${openId === s.studentId ? "bg-[rgba(201,147,58,0.08)]" : "hover:bg-[rgba(201,147,58,0.03)]"}`}
                >
                  <td className="py-2.5 pl-4 pr-3 font-typewriter text-sm text-[#f5e6c8]">{s.displayName}</td>
                  {s.bosses.map((b) => (
                    <td key={b.bossId} className="py-2.5 pr-3 font-typewriter text-xs">
                      {b.status === "not_started" ? (
                        <span className="text-[#3a2a1a]">—</span>
                      ) : b.scorePct != null ? (
                        <span style={{ color: pctColor(b.scorePct) }}>{b.scorePct}%</span>
                      ) : b.status === "completed" ? (
                        <span className="text-[#8b7355]" title="Finished before per-stage scores were recorded — points only">
                          {b.points ?? 0} pts
                        </span>
                      ) : (
                        <span className="text-[#8b7355]">{b.status === "in_progress" ? "playing" : "skipped"}</span>
                      )}
                    </td>
                  ))}
                  <td className="py-2.5 pr-3 font-typewriter text-sm" style={{ color: pctColor(s.bossAveragePct) }}>
                    {s.bossAveragePct != null ? `${s.bossAveragePct}%` : <span className="text-[#4a3a2a]">—</span>}
                  </td>
                  <td className="py-2.5 pr-3 font-typewriter text-sm" style={{ color: pctColor(s.profile.overallPct) }}>
                    {s.profile.overallPct != null
                      ? <>{s.profile.overallPct}% <span className="text-[10px] text-[#4a3a2a]">({s.profile.totalMastered}/{s.profile.totalItems})</span></>
                      : <span className="text-[#4a3a2a]">no data</span>}
                  </td>
                  <td className="py-2.5 pr-4 font-typewriter text-[11px] text-[#c0392b]">
                    {s.profile.needsWork[0]?.label.slice(0, 34) ?? <span className="text-[#4a3a2a]">—</span>}
                  </td>
                </tr>

                {openId === s.studentId && (
                  <tr className="border-b border-[rgba(201,147,58,0.1)] bg-[#141210]">
                    <td colSpan={bossMeta.length + 4} className="px-4 py-4">
                      <div className="grid md:grid-cols-3 gap-5">
                        <Detail title="Vocabulary by topic" buckets={s.profile.vocabByTopic} />
                        <Detail title="Grammar skills" buckets={s.profile.grammarBySkill} />
                        <div className="space-y-3">
                          <Detail
                            title="Listening & speaking"
                            buckets={[s.profile.listening, s.profile.speaking].filter(Boolean) as SkillBucket[]}
                          />
                          <div className="flex flex-col gap-1.5">
                            <Link
                              href={`/teacher/reports?classId=${classId}&mode=parent&studentId=${s.studentId}`}
                              className="font-typewriter text-[10px] tracking-[0.15em] uppercase px-3 py-2 border border-[rgba(201,147,58,0.35)] text-[#c9933a] hover:text-[#e8b455] text-center transition-colors"
                            >
                              🖨 Parent report card
                            </Link>
                            <Link
                              href={`/teacher/reports?classId=${classId}&mode=students&studentId=${s.studentId}`}
                              className="font-typewriter text-[10px] tracking-[0.15em] uppercase px-3 py-2 border border-[rgba(139,115,85,0.3)] text-[#8b7355] hover:text-[#c4a882] text-center transition-colors"
                            >
                              🖨 Admin summary
                            </Link>
                          </div>
                        </div>
                      </div>
                      {s.bosses.some((b) => b.stages.length > 0) && (
                        <div className="mt-4 border-t border-[rgba(201,147,58,0.12)] pt-3">
                          <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">Boss stage breakdown</p>
                          {s.bosses.filter((b) => b.stages.length).map((b) => (
                            <div key={b.bossId} className="mb-2">
                              <p className="font-typewriter text-[11px] text-[#e8b455]">{b.label} — {b.scorePct}%</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {b.stages.map((st, i) => (
                                  <span key={i} className="font-typewriter text-[10px] px-2 py-0.5 border border-[rgba(201,147,58,0.2)] text-[#c4a882]">
                                    {st.label}: {st.score}/{st.maxScore}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {withData.length === 0 && (
          <p className="font-typewriter text-xs text-[#4a3a2a] p-4">
            No boss fights or skill data for this class yet.
          </p>
        )}
      </div>

      <p className="font-typewriter text-[10px] text-[#4a3a2a] leading-relaxed">
        “Skills mastered” counts items a student has got right at least once, never raw attempts: the memory-match
        drill is excluded, and a sentence rebuilt four times counts once. Click a row for the breakdown.
      </p>
    </div>
  );
}

function Detail({ title, buckets }: { title: string; buckets: SkillBucket[] }) {
  if (!buckets.length) {
    return (
      <div>
        <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">{title}</p>
        <p className="font-typewriter text-[11px] text-[#4a3a2a]">Nothing recorded yet.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">{title}</p>
      <div className="space-y-1.5">
        {buckets.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-typewriter text-[11px] text-[#c4a882] truncate" title={b.label}>{b.label}</p>
              <div className="h-1 bg-[#2c2220] rounded-full overflow-hidden mt-0.5">
                <div className="h-full rounded-full" style={{ width: `${b.masteredPct ?? 0}%`, background: pctColor(b.masteredPct) }} />
              </div>
            </div>
            <span className="font-typewriter text-[10px] shrink-0" style={{ color: pctColor(b.masteredPct) }}>
              {b.mastered}/{b.items}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
