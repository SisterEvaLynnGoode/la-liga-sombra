import Link from "next/link";

export const metadata = {
  title: "About La Liga Sombra",
  description: "Information for parents and administrators about the La Liga Sombra educational Spanish game.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0d0b0a] px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <Link href="/" className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors mb-6 inline-block">
            ← Back to home
          </Link>
          <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-2">
            Para padres y administradores
          </p>
          <h1 className="font-display font-black text-4xl text-[#e8b455]">
            About La Liga Sombra
          </h1>
          <div className="h-px bg-gradient-to-r from-[#c9933a] to-transparent mt-4" />
        </div>

        {/* What is it */}
        <Section title="What is La Liga Sombra?">
          <p>
            La Liga Sombra (&ldquo;The Shadow League&rdquo;) is a browser-based educational
            detective game designed for high school Spanish 1 students. Students play
            as agents traveling through 10 Spanish-speaking countries, solving cases
            while learning vocabulary and grammar from the{" "}
            <em>Que Chevere Level 1</em> curriculum.
          </p>
          <p className="mt-3">
            The game is played in class on Chromebooks and takes approximately
            30 minutes per unit (one class period). No downloads or accounts are
            required — students join using a 6-character class code provided by
            their teacher.
          </p>
        </Section>

        {/* How it works */}
        <Section title="How it works">
          <ol className="space-y-2 list-none">
            {[
              ["Teacher creates a class", "The teacher generates a unique 6-character class code in the teacher setup panel."],
              ["Students join", "Students pick a display name (first name or nickname — no last names required) and create a 4-digit PIN."],
              ["Play through units", "Each unit has 6 stages: a video briefing, vocabulary matching, a witness interview in Spanish, a reading comprehension activity, a listening comprehension activity, and a suspect lineup."],
              ["Earn badges", "Students collect passport-stamp badges for each country solved, plus achievement badges for perfect scores, speed, and vocabulary mastery."],
              ["Teacher monitors", "The teacher dashboard shows class progress, vocab mastery, time spent, and a leaderboard in real time."],
            ].map(([title, desc], i) => (
              <li key={i} className="flex gap-3">
                <span className="font-display font-bold text-[#c9933a] text-lg shrink-0 w-6">{i + 1}.</span>
                <div>
                  <p className="font-display font-bold text-[#f5e6c8] text-sm">{title}</p>
                  <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* Data & Privacy */}
        <Section title="Data & Privacy">
          <p className="text-[#c0392b] font-typewriter text-xs mb-3 border border-[rgba(192,57,43,0.3)] px-3 py-2">
            No personally identifiable information is required to play.
          </p>

          <h3 className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">
            What we collect:
          </h3>
          <ul className="space-y-1.5">
            {[
              "Display name chosen by the student (nickname or first name — not verified)",
              "4-digit PIN (hashed using HMAC-SHA256 with a per-student salt — never stored in readable form)",
              "Game progress: which activities were completed, scores, and time spent per activity",
              "Vocabulary mastery data: which words were practiced and answered correctly",
              "Class code (assigned by teacher, not linked to personal identity)",
            ].map((item, i) => (
              <li key={i} className="flex gap-2 font-typewriter text-xs text-[#c4a882]">
                <span className="text-[#c9933a] shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>

          <h3 className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mt-4 mb-2">
            What we do NOT collect:
          </h3>
          <ul className="space-y-1.5">
            {[
              "Real names, email addresses, or photos",
              "Location data",
              "Device identifiers or IP addresses (beyond standard server logs)",
              "Any data sold to or shared with third parties",
              "Behavioral or advertising data",
            ].map((item, i) => (
              <li key={i} className="flex gap-2 font-typewriter text-xs text-[#c4a882]">
                <span className="text-[#4a3a2a] shrink-0">✗</span>
                {item}
              </li>
            ))}
          </ul>

          <p className="font-typewriter text-xs text-[#8b7355] mt-4 leading-relaxed">
            Game data is stored in a Supabase PostgreSQL database. The game is
            hosted on Vercel. Both services are SOC 2 compliant. Data is retained
            for the duration of the school year and can be deleted by the teacher
            at any time.
          </p>
        </Section>

        {/* Contact */}
        <Section title="Questions?">
          <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed">
            Please contact your student&apos;s Spanish teacher directly with any
            questions about this game and how it is used in class.
          </p>
        </Section>

        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(201,147,58,0.2)] to-transparent" />
        <p className="font-typewriter text-[10px] text-center text-[#4a3a2a]">
          La Liga Sombra · Built for Spanish 1 education · Based on Que Chevere Level 1
        </p>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display font-bold text-xl text-[#f5e6c8] mb-3 flex items-center gap-3">
        <span className="w-1 h-5 bg-[#c9933a] shrink-0" />
        {title}
      </h2>
      <div className="font-typewriter text-sm text-[#c4a882] leading-relaxed pl-4">
        {children}
      </div>
    </section>
  );
}
