"use client";

/**
 * The scoreboard, drawn once and used in two places.
 *
 * The dashboard tab and the projector page used to be separate implementations
 * of the same three columns, which is how they ended up showing subtly
 * different things. This is the only renderer now; `variant` scales it for a
 * laptop panel or a room-sized screen, and nothing else differs.
 *
 * Design rules this follows, because it gets shown to thirty teenagers:
 *  - The class goal is on top and is the biggest thing on screen. It is the one
 *    number nobody loses at.
 *  - Every category is a short podium, not a top ten. A long list of names is
 *    unreadable from the back row and rubs the bottom of it in.
 *  - Every card says what it takes to win it. A rank with no rule attached
 *    reads as a judgement about the student.
 *  - An empty category says why it is empty rather than showing "No data".
 */

export interface LeaderRow {
  id: string;
  displayName: string;
  value: number;
  display: string;
}

export interface LeaderCategory {
  key: string;
  title: string;
  emoji: string;
  note: string;
  entries: LeaderRow[];
  emptyNote: string;
}

export interface ClassGoal {
  solved: number;
  target: number;
  contributing: number;
  students: number;
}

export interface BoardData {
  weekStart: string;
  classGoal: ClassGoal | null;
  categories: LeaderCategory[];
  allTime: LeaderRow[];
}

const MEDALS = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];
const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

/** First name plus an initial: enough for a friend to recognise, not a roster. */
function shortName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function hide(name: string) {
  return `${name.trim()[0]?.toUpperCase() ?? "?"}${"•".repeat(4)}`;
}

function weekLabelEs(weekStart: string) {
  const d = new Date(weekStart + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return "";
  const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `Semana del ${d.getUTCDate()} de ${MES[d.getUTCMonth()]}`;
}

function GoalBar({ goal, big }: { goal: ClassGoal; big: boolean }) {
  const pct = goal.target > 0 ? Math.min(100, Math.round((goal.solved / goal.target) * 100)) : 0;
  const met = goal.solved >= goal.target && goal.target > 0;

  return (
    <div className={`border border-[rgba(201,147,58,0.25)] bg-[rgba(201,147,58,0.05)] ${big ? "p-8" : "p-5"}`}>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className={`font-typewriter tracking-[0.25em] uppercase text-[#8b7355] ${big ? "text-sm" : "text-[10px]"}`}>
            Meta de la clase
          </p>
          <p className={`font-display font-black text-[#e8b455] ${big ? "text-5xl mt-2" : "text-2xl mt-1"}`}>
            {goal.solved} <span className="text-[#8b7355] font-normal">/ {goal.target}</span>{" "}
            <span className={big ? "text-2xl" : "text-sm"}>casos esta semana</span>
          </p>
        </div>
        <p className={`font-typewriter text-[#c4a882] ${big ? "text-lg" : "text-xs"}`}>
          {met
            ? "\u{1F389} ¡Meta cumplida!"
            : `${goal.contributing} de ${goal.students} agentes ya aportaron`}
        </p>
      </div>

      <div className={`mt-4 w-full bg-[rgba(0,0,0,0.4)] overflow-hidden ${big ? "h-6" : "h-3"}`}>
        <div
          className="h-full transition-[width] duration-700"
          style={{
            width: `${pct}%`,
            background: met
              ? "linear-gradient(90deg,#2f7d4f,#5fbf85)"
              : "linear-gradient(90deg,#8b1a1a,#c9933a,#e8b455)",
          }}
        />
      </div>
    </div>
  );
}

function CategoryCard({
  cat, big, privacy,
}: {
  cat: LeaderCategory; big: boolean; privacy: boolean;
}) {
  return (
    <div className="flex-1 min-w-[15rem] border border-[rgba(201,147,58,0.2)] bg-[#14151b] flex flex-col">
      <div className={`border-b border-[rgba(201,147,58,0.15)] ${big ? "px-5 py-4" : "px-4 py-3"}`}>
        <div className="flex items-center gap-2">
          <span className={big ? "text-3xl" : "text-lg"}>{cat.emoji}</span>
          <p className={`font-display font-black text-[#e8b455] ${big ? "text-2xl" : "text-sm"}`}>{cat.title}</p>
        </div>
        <p className={`font-typewriter text-[#6b5a45] mt-1 ${big ? "text-xs" : "text-[10px]"}`}>{cat.note}</p>
      </div>

      <div className={`flex-1 ${big ? "p-4 space-y-2" : "p-3 space-y-1.5"}`}>
        {cat.entries.length === 0 ? (
          <p className={`font-typewriter text-[#4a3a2a] text-center py-6 ${big ? "text-sm" : "text-[11px]"}`}>
            {cat.emptyNote}
          </p>
        ) : (
          cat.entries.map((e, i) => (
            <div
              key={e.id}
              className={`flex items-center gap-3 ${big ? "px-4 py-3" : "px-3 py-2"} ${
                i < 3 ? "border border-[rgba(201,147,58,0.15)] bg-[rgba(201,147,58,0.05)]" : ""
              }`}
            >
              <span
                className={`shrink-0 text-center ${big ? "text-2xl w-9" : "text-base w-6"}`}
                style={{ color: i < 3 ? MEDAL_COLORS[i] : "#7a6650" }}
              >
                {i < 3 ? MEDALS[i] : i + 1}
              </span>
              <span className={`font-typewriter text-[#c4a882] flex-1 truncate ${big ? "text-xl" : "text-sm"}`}>
                {privacy ? hide(e.displayName) : shortName(e.displayName)}
              </span>
              <span className={`font-typewriter font-bold text-[#e8b455] shrink-0 ${big ? "text-xl" : "text-sm"}`}>
                {e.display}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function LeaderboardBoard({
  data, variant = "panel", privacy = false,
}: {
  data: BoardData | null;
  variant?: "panel" | "projector";
  privacy?: boolean;
}) {
  const big = variant === "projector";
  if (!data) {
    return (
      <p className="font-typewriter text-xs text-[#8b7355] py-10 text-center">Cargando el tablero…</p>
    );
  }

  return (
    <div className={big ? "space-y-6" : "space-y-4"}>
      <p className={`font-typewriter tracking-[0.3em] uppercase text-[#8b7355] ${big ? "text-sm text-center" : "text-[10px]"}`}>
        {weekLabelEs(data.weekStart)} · se reinicia cada lunes
      </p>

      {data.classGoal && <GoalBar goal={data.classGoal} big={big} />}

      <div className="flex flex-wrap gap-4">
        {data.categories.map((c) => (
          <CategoryCard key={c.key} cat={c} big={big} privacy={privacy} />
        ))}
      </div>

      {data.allTime.length > 0 && (
        <div className="border border-[rgba(201,147,58,0.15)] bg-[rgba(0,0,0,0.25)] px-5 py-3">
          <p className={`font-typewriter tracking-[0.25em] uppercase text-[#8b7355] ${big ? "text-xs" : "text-[10px]"}`}>
            Salón de la fama · casos resueltos en total
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
            {data.allTime.map((e, i) => (
              <span key={e.id} className={`font-typewriter text-[#c4a882] ${big ? "text-lg" : "text-xs"}`}>
                <span style={{ color: i < 3 ? MEDAL_COLORS[i] : "#7a6650" }}>{i + 1}.</span>{" "}
                {privacy ? hide(e.displayName) : shortName(e.displayName)}{" "}
                <span className="text-[#e8b455] font-bold">{e.display}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
