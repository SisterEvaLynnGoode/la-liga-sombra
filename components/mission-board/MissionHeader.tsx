"use client";

import { useRouter } from "next/navigation";

interface Props {
  displayName: string;
  casesSolved: number;
  totalCases: number;
  badgeCount: number;
}

export default function MissionHeader({ displayName, casesSolved, totalCases, badgeCount }: Props) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const pct = totalCases > 0 ? Math.round((casesSolved / totalCases) * 100) : 0;

  return (
    <header className="relative z-10 bg-[#110f0d] border-b border-[rgba(201,147,58,0.2)]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6 flex-wrap">
        {/* Brand */}
        <span className="font-display font-black text-lg text-[#e8b455] tracking-tight shrink-0">
          La Liga Sombra
        </span>

        <div className="w-px h-5 bg-[rgba(201,147,58,0.2)] hidden sm:block" />

        {/* Agent name */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm">🕵️</span>
          <div>
            <p className="font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#8b7355] leading-none">Agente</p>
            <p className="font-typewriter text-sm text-[#f5e6c8] leading-tight">{displayName}</p>
          </div>
        </div>

        <div className="w-px h-5 bg-[rgba(201,147,58,0.2)] hidden sm:block" />

        {/* Progress bar */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="shrink-0 text-right">
            <p className="font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#8b7355] leading-none">
              Casos resueltos
            </p>
            <p className="font-typewriter text-sm text-[#e8b455] leading-tight">
              {casesSolved}/{totalCases}
            </p>
          </div>
          <div className="flex-1 h-2 bg-[#2c2220] rounded-full overflow-hidden min-w-[60px]">
            <div
              className="h-full bg-gradient-to-r from-[#8b1a1a] to-[#c9933a] rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-typewriter text-[10px] text-[#8b7355] shrink-0">{pct}%</span>
        </div>

        <div className="w-px h-5 bg-[rgba(201,147,58,0.2)] hidden sm:block" />

        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-base">🏅</span>
          <div>
            <p className="font-typewriter text-[9px] tracking-[0.2em] uppercase text-[#8b7355] leading-none">Insignias</p>
            <p className="font-typewriter text-sm text-[#e8b455] leading-tight">{badgeCount}</p>
          </div>
        </div>

        {/* Logout — pushed right */}
        <button
          onClick={handleLogout}
          className="ml-auto font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c0392b] transition-colors shrink-0"
        >
          Salir →
        </button>
      </div>
    </header>
  );
}
