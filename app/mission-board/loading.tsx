export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0d0b0a] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[rgba(201,147,58,0.2)] border-t-[#c9933a] rounded-full animate-spin" />
      <p className="font-typewriter text-xs text-[#8b7355] tracking-widest">
        Cargando sala de investigación…
      </p>
    </div>
  );
}
