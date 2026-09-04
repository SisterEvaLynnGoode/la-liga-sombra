import Link from "next/link";

/**
 * The page a parent, a principal, or a curriculum director reads before they
 * decide whether this is allowed in their building.
 *
 * It is written for someone who is skimming and slightly skeptical, so the
 * answers come before the story: what it is, what it runs on, what it collects,
 * what it costs. Every number here comes from the game files. When a case,
 * a country, or a week is added, update this page with it.
 */

export const metadata = {
  title: "About La Liga Sombra",
  description:
    "What La Liga Sombra is, how it runs in class, and exactly what student data it does and does not collect. For parents, teachers, and administrators.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0d0b0a] px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <Link
            href="/"
            className="font-typewriter text-[10px] tracking-widest uppercase text-[#8b7355] hover:text-[#c9933a] transition-colors mb-6 inline-block px-2 py-1 -ml-2"
          >
            ← Back to home
          </Link>
          <p className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-[#8b7355] mb-2">
            For parents, teachers, and administrators
          </p>
          <h1 className="font-display font-black text-4xl text-[#e8b455]">
            About La Liga Sombra
          </h1>
          <div className="h-px bg-gradient-to-r from-[#c9933a] to-transparent mt-4" />
        </div>

        {/* The short version, for someone who will not read the rest. */}
        <div className="border border-[rgba(201,147,58,0.25)] bg-[rgba(201,147,58,0.05)] p-5 space-y-2">
          <p className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355]">
            The short version
          </p>
          <p className="font-typewriter text-sm text-[#c4a882] leading-relaxed">
            A Spanish 1 detective game that runs in a Chromebook browser. Students join
            with a class code and a nickname. It collects no real names, no email
            addresses, and no location. It is free for the teacher, and it covers a full
            year of curriculum rather than a single lesson.
          </p>
          <p className="font-typewriter text-xs text-[#8b7355] pt-1">
            <Link
              href="/showcase"
              className="inline-block px-2 py-1 -ml-2 text-[#e8b455] underline decoration-[rgba(201,147,58,0.4)] underline-offset-4 hover:text-[#f5e6c8] transition-colors"
            >
              Play the actual activities, no account needed →
            </Link>
          </p>
        </div>

        <Section title="What is La Liga Sombra?">
          <p>
            La Liga Sombra (&ldquo;The Shadow League&rdquo;) is a browser-based detective
            game for high school Spanish 1. A ring of thieves is stealing cultural
            treasures across the Spanish-speaking world, and students work the cases as
            agents: they interview witnesses, read case files, listen to recorded
            statements, and name a suspect.
          </p>
          <p className="mt-3">
            The point of the story is that the Spanish is load bearing. A student who
            skips the vocabulary cannot follow the witness, and a student who ignores the
            verb tense arrests the wrong person. Comprehension is how you win, not a quiz
            bolted onto a game.
          </p>
          <p className="mt-3">
            The content follows the <em>Que Chévere Level 1</em> sequence and the ACTFL
            proficiency bands, moving from Novice Low to Intermediate Low across the year.
          </p>
        </Section>

        <Section title="What is in it">
          <ul className="space-y-1.5">
            {[
              "20 cases set in 20 different Spanish-speaking countries",
              "10 cold cases for students who finish early",
              "3 boss cases that pull together several units at once",
              "689 vocabulary terms, each tracked per student",
              "A 36-week plan across two semesters, with printable worksheets, a Pasaporte Cultural, and rubrics",
            ].map((item) => (
              <li key={item} className="flex gap-2 font-typewriter text-xs text-[#c4a882]">
                <span className="text-[#c9933a] shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[#8b7355]">
            A case takes about one class period. Each one has six to ten stages depending
            on the unit, always including a briefing, vocabulary work, a reading, a
            listening passage, and the suspect lineup.
          </p>
        </Section>

        <Section title="How it works in class">
          <ol className="space-y-2 list-none">
            {[
              ["The teacher creates a class", "This produces a 6-character class code. It takes about a minute and costs nothing."],
              ["Students join", "A student picks a display name, usually a first name or a nickname, and sets a 4-digit PIN. No email address is involved at any point."],
              ["They work the case", "Students play through the stages in Spanish. Wrong answers explain themselves rather than just buzzing, so a stuck student can keep going."],
              ["They earn the stamp", "Solving a country earns a passport stamp, plus badges for accuracy, speed, and vocabulary mastery."],
              ["The teacher checks the board", "The dashboard shows who is stuck, what specifically they are failing, and whether the class is on pace with the plan."],
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

        <Section title="Data and privacy">
          <p className="text-[#c0392b] font-typewriter text-xs mb-3 border border-[rgba(192,57,43,0.3)] px-3 py-2">
            No personally identifiable information is required to play.
          </p>

          <h3 className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">
            What is collected
          </h3>
          <ul className="space-y-1.5">
            {[
              "The display name the student chooses. It is a nickname or first name and it is not verified against anything.",
              "A 4-digit PIN, hashed with HMAC-SHA256 and a per-student salt. It is never stored in readable form.",
              "Game progress: which activities were finished, the scores, and time spent on each.",
              "Vocabulary data: which words were practiced and which were answered correctly.",
              "The class code, which the teacher assigns and which is not tied to any personal identity.",
            ].map((item) => (
              <li key={item} className="flex gap-2 font-typewriter text-xs text-[#c4a882]">
                <span className="text-[#c9933a] shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>

          <h3 className="font-typewriter text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mt-4 mb-2">
            What is not collected
          </h3>
          <ul className="space-y-1.5">
            {[
              "Real names, email addresses, or photos",
              "Location data",
              "Device identifiers or IP addresses, beyond ordinary server logs",
              "Behavioral or advertising data",
            ].map((item) => (
              <li key={item} className="flex gap-2 font-typewriter text-xs text-[#c4a882]">
                <span className="text-[#4a3a2a] shrink-0">✗</span>
                {item}
              </li>
            ))}
          </ul>

          <p className="font-typewriter text-xs text-[#8b7355] mt-4 leading-relaxed">
            Nothing is sold or shared with third parties. Game data is stored in a Supabase
            PostgreSQL database and the game is hosted on Vercel. Both services are SOC 2
            compliant. Data is kept for the school year and the teacher can delete it at
            any time.
          </p>
        </Section>

        <Section title="For site and district administrators">
          <p>
            The game is a static browser application. There is nothing to install on the
            device, nothing to push through an image, and no plugin or extension. If a
            Chromebook can open a web page, it can run this.
          </p>
          <p className="mt-3">
            Because students sign in with a class code and a PIN rather than a school
            account, no roster sync, SIS integration, or SSO configuration is required to
            start. That also means the game never touches directory data.
          </p>
          <p className="mt-3">
            The teacher dashboard exports grades as CSV, so scores can go into whatever
            gradebook the district already uses.
          </p>
        </Section>

        <Section title="Questions?">
          <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed">
            Parents: please contact your student&apos;s Spanish teacher directly with
            questions about how the game is used in class.
          </p>
          <p className="font-typewriter text-xs text-[#8b7355] leading-relaxed mt-3">
            Teachers and administrators: the fastest way to evaluate it is to{" "}
            <Link
              href="/showcase"
              className="text-[#c9933a] underline decoration-[rgba(201,147,58,0.4)] underline-offset-4 hover:text-[#e8b455] transition-colors"
            >
              play the activities
            </Link>{" "}
            and then{" "}
            <Link
              href="/teacher/login"
              className="text-[#c9933a] underline decoration-[rgba(201,147,58,0.4)] underline-offset-4 hover:text-[#e8b455] transition-colors"
            >
              open a free class
            </Link>{" "}
            with a single period before committing to anything wider.
          </p>
        </Section>

        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(201,147,58,0.2)] to-transparent" />
        <p className="font-typewriter text-[10px] text-center text-[#4a3a2a]">
          La Liga Sombra · Built for Spanish 1 · Based on Que Chévere Level 1
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
