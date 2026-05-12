# La Liga Sombra

A Carmen Sandiego-style browser detective game for Spanish 1 students built on **Next.js 14 App Router**, **Supabase**, and **Tailwind CSS**. Students travel through six Spanish-speaking countries solving cases while practicing vocabulary and grammar from *Que Chevere Level 1*.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (Postgres + Row Level Security) |
| Deployment | Vercel |

---

## Local Development Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd la-liga-sombra
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
# Edit .env.local and paste your Supabase values
```

### 4. Run the database migration

**Option A — Supabase SQL Editor (easiest for first-time setup):**
1. Open your Supabase dashboard → **SQL Editor**.
2. Paste the full contents of `supabase/migrations/001_initial.sql` and click **Run**.

**Option B — Supabase CLI:**
```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the La Liga Sombra landing page.

---

## Project Structure

```
la-liga-sombra/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page (/)
│   ├── login/page.tsx      # Student login (/login)
│   ├── game/page.tsx       # Game viewport (/game)  [stub]
│   └── dashboard/page.tsx  # Teacher dashboard (/dashboard)  [stub]
├── components/
│   ├── HeroBackground.tsx  # Animated noir background
│   └── CaseBadge.tsx       # Country case badge
├── content/
│   └── units.json          # Unit/country data — add vocab and dialogues here
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser-side Supabase client
│   │   └── server.ts       # Server-side Supabase client (Server Components)
│   └── types/
│       └── database.ts     # TypeScript types matching the DB schema
├── public/
│   └── videos/             # Placeholder for Higgsfield cutscene videos
└── supabase/
    └── migrations/
        └── 001_initial.sql # Full DB schema with enums, tables, and RLS policies
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `students` | Student profiles — display name + class code, no email required |
| `units` | One row per Que Chevere chapter / country (seeded with 6 units) |
| `attempts` | Every mini-game submission with score and time spent |
| `mastery` | Per-student, per-vocab-term spaced-repetition counters |
| `badges` | Achievements earned by students |
| `unit_progress` | Per-student unit state: `locked → available → in_progress → completed` |

---

## Deploy to Vercel

### Option A — GitHub integration (recommended)

1. Push the repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Under **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — every push to `main` auto-deploys.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

---

## Roadmap

- [ ] Student auth (class code + display name, no email)
- [ ] World map UI with unlockable countries
- [ ] Cutscene player (Higgsfield videos in `/public/videos`)
- [ ] Mini-games: vocab match, dialogue fill-in, listening comprehension
- [ ] Spaced repetition mastery tracking
- [ ] Teacher dashboard with class analytics
- [ ] Badge / achievement system
