interface CaseBadgeProps {
  code: string;
  flag: string;
  country: string;
  unit: number;
  label: string;
}

export default function CaseBadge({ flag, country, label }: CaseBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border border-[rgba(201,147,58,0.2)] bg-[rgba(26,22,20,0.8)] hover:border-[rgba(201,147,58,0.5)] hover:bg-[rgba(201,147,58,0.05)] transition-all duration-150 cursor-default">
      <span className="text-xl leading-none">{flag}</span>
      <div className="flex flex-col">
        <span className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] leading-none">
          {label}
        </span>
        <span className="font-typewriter text-xs text-[#c4a882] leading-tight mt-0.5">
          {country}
        </span>
      </div>
    </div>
  );
}
