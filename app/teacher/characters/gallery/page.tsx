import { redirect } from "next/navigation";
import Link from "next/link";
import { getTeacherSession } from "@/lib/auth/session";
import { buildGallery } from "@/lib/characters/gallery";

export const metadata = { title: "Character Gallery — La Liga Sombra" };

/**
 * Every character in the game, by case, at a size worth printing.
 * Server-rendered from the content files so it can never disagree with the game.
 */
export default async function CharacterGalleryPage() {
  if (!(await getTeacherSession())) redirect("/teacher/login");

  const cases = buildGallery();
  const all = cases.flatMap((c) => c.characters);
  const withArt = all.filter((c) => c.present && !c.borrowedFrom).length;
  const borrowed = all.filter((c) => c.borrowedFrom).length;
  const missing = all.filter((c) => !c.present).length;

  return (
    <main className="min-h-screen bg-[#0d0b0a] text-[#f5e6c8] print:bg-white">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .case-block { break-inside: avoid; page-break-inside: avoid; }
          .card { break-inside: avoid; page-break-inside: avoid; }
          body { background: #fff !important; }
        }
      `}</style>

      <div className="no-print sticky top-0 z-20 border-b border-[rgba(201,147,58,0.2)] bg-[#110f0d] px-6 py-3 flex items-center gap-4 flex-wrap">
        <Link href="/teacher/characters" className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#8b7355] hover:text-[#c9933a]">
          ← Character sheets
        </Link>
        <h1 className="font-display text-lg font-bold">Character Gallery</h1>
        <span className="font-typewriter text-[10px] text-[#8b7355]">
          {all.length} characters · {withArt} with original art
          {borrowed > 0 && <> · <span className="text-[#e8b455]">{borrowed} borrowed</span></>}
          {missing > 0 && <> · <span className="text-[#c0392b]">{missing} missing</span></>}
        </span>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-[78rem] px-6 py-8 print:px-0">
        {cases.map((c) => (
          <section key={c.key} className="case-block mb-12">
            <div className="flex items-baseline gap-3 border-b border-[rgba(201,147,58,0.25)] pb-2 mb-5">
              <h2 className="font-display text-2xl font-bold text-[#e8b455] print:text-black">{c.label}</h2>
              {c.place && (
                <span className="font-typewriter text-[11px] tracking-[0.2em] uppercase text-[#8b7355]">{c.place}</span>
              )}
            </div>

            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {c.characters.map((ch) => (
                <figure key={ch.slug} className="card">
                  <div className="relative border border-[rgba(201,147,58,0.25)] bg-[#16130f] aspect-[896/1216] overflow-hidden print:border-black">
                    {ch.present ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ch.imageUrl!} alt={ch.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-[#4a3a2a] text-center px-3">
                          Sin retrato
                        </span>
                      </div>
                    )}
                    {ch.borrowedFrom && (
                      <span className="no-print absolute top-1 left-1 bg-[rgba(232,180,85,0.9)] text-[#0d0b0a] font-typewriter text-[9px] px-1.5 py-0.5">
                        borrowed
                      </span>
                    )}
                  </div>
                  <figcaption className="mt-2">
                    <p className="font-display text-sm font-bold text-[#f5e6c8] print:text-black leading-tight">{ch.name}</p>
                    {ch.realName && ch.realName !== ch.name && (
                      <p className="font-typewriter text-[11px] text-[#c4a882] print:text-black">{ch.realName}</p>
                    )}
                    {ch.role && <p className="font-typewriter text-[11px] text-[#c4a882] print:text-black">{ch.role}</p>}
                    {ch.age !== undefined && (
                      <p className="font-typewriter text-[10px] text-[#8b7355]">{ch.age} años</p>
                    )}
                    {ch.borrowedFrom && (
                      <p className="no-print font-typewriter text-[9px] text-[#e8b455] mt-1">
                        reusing {ch.borrowedFrom}
                      </p>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function PrintButton() {
  return (
    <form action="" className="ml-auto">
      <button
        formAction=""
        className="clip-skew px-4 py-1.5 font-typewriter text-[10px] tracking-[0.2em] uppercase bg-[rgba(201,147,58,0.12)] text-[#e8b455] border border-[rgba(201,147,58,0.35)] hover:bg-[rgba(201,147,58,0.22)]"
        // Server component: a plain form button would submit. Print via the
        // browser's own shortcut instead of shipping a client bundle for one button.
        type="button"
      >
        Ctrl/⌘ + P to print
      </button>
    </form>
  );
}
