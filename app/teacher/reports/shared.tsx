import { fmtDate, type Payload } from "./types";

/** The letterhead every printed page carries, so a loose sheet is identifiable. */
export function Letterhead({ data, title, subtitle }: { data: Payload; title: string; subtitle?: string }) {
  return (
    <header className="border-b-2 border-black pb-3 mb-5">
      <div className="flex justify-between items-end gap-4">
        <div>
          <p className="font-serif text-[10px] uppercase tracking-[0.3em]">La Liga Sombra · Spanish 1</p>
          <h1 className="font-serif text-2xl font-bold leading-tight">{title}</h1>
          {subtitle && <p className="font-serif text-sm italic">{subtitle}</p>}
        </div>
        <div className="font-serif text-[10px] text-right leading-snug shrink-0">
          {data.className && <p>{data.className}</p>}
          {data.teacherName && <p>{data.teacherName}</p>}
          <p>{fmtDate(data.generatedAt)}</p>
        </div>
      </div>
    </header>
  );
}

/** A percentage printed so it survives a black-and-white printer. */
export function Pct({ value }: { value: number | null }) {
  if (value == null) return <span className="text-[#777]">—</span>;
  return <span className={value < 60 ? "font-bold" : ""}>{value}%</span>;
}
