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

## Adding a new unit

### Quick start

1. **Open the author helper** — go to `/teacher/author` (login required). The form-based UI walks you through every field with live previews.

2. **Or start from the template** — copy `content/_template.json`, rename it to `unit-02.json`, and fill in every field. The `_comment` fields explain each section.

3. **Validate locally** before committing:
   ```bash
   npm run validate
   ```
   This checks every `content/*.json` file against the Zod schema and prints clear error messages.

4. **Commit** the file — the `prebuild` hook runs validation automatically before Vercel builds.

---

### Unit content checklist

| Step | What to write | Notes |
|---|---|---|
| **Case narrative** | `caseTitle`, `caseDescription`, `criminalName` | Keep it dramatic — students are detectives! |
| **Vocab** (12+ pairs) | `vocab[]` | From the Que Chevere unit — include audio filenames if you have recordings |
| **Cutscene** | `stages[0]` briefing lines | Drop `unit-0N-intro.mp4` + `.vtt` in `/public/videos/` |
| **VocabMatch** | `stages[1].pairs` | 6-8 pairs is the sweet spot |
| **Witness dialogue** | `stages[2].nodes` | 3-4 nodes: greeting → get clue → thank them. Each wrong option needs `feedback`. |
| **Reading passage** | `stages[3].passage` | 50-150 words in Spanish — a note or letter left by the thief works well |
| **Listening audio** | `stages[4].audioUrl` | Drop `.mp3` in `/public/audio/unit-0N/`. Use Google TTS, ElevenLabs, or record yourself. |
| **Lineup suspects** | `stages[5].suspects` | 4 suspects — one correct. Descriptions should be 2-3 Spanish sentences each. |

---

### Adding cutscene videos

1. Drop your video at `/public/videos/unit-0N-intro.mp4`
2. Drop your subtitle file at `/public/videos/unit-0N-intro.vtt`
3. Reference them in the stage JSON:
   ```json
   { "type": "cutscene", "videoUrl": "/videos/unit-02-intro.mp4", "subtitleUrl": "/videos/unit-02-intro.vtt", ... }
   ```
4. If the video fails to load, the game automatically falls back to the text briefing.

**VTT subtitle format:**
```
WEBVTT

00:00:00.500 --> 00:00:03.500
¡Bienvenido a La Liga Sombra, agente!

00:00:04.000 --> 00:00:07.000
Tenemos una situación urgente en México.
```

---

### Adding audio files

Drop `.mp3` files in `/public/audio/unit-0N/` and reference them in vocab:
```json
{ "spanish": "hola", "english": "hello", "audio": "/audio/unit-02/hola.mp3" }
```

**Free audio generation options:**
- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) — excellent Spanish voices
- [ElevenLabs](https://elevenlabs.io) — high quality, free tier available
- The **Vocab CSV Importer** at `/teacher/author` has a "Listen" button using browser TTS for pronunciation checking

---

## Content validation

The schema is defined in `lib/content-schema.ts` (Zod). Run `npm run validate` at any time. The build will fail if any unit file is invalid.

---

## Deploy to Vercel

### Option A — GitHub integration (recommended)

1. Push the repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Under **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SESSION_SECRET` (32+ random characters)
   - `TEACHER_PASSWORD` (your teacher login password)
4. Deploy — every push to `main` auto-deploys.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SESSION_SECRET
vercel env add TEACHER_PASSWORD
vercel --prod
```

---

## Roadmap

- [x] Student auth (class code + display name, no email)
- [x] Mission board / world map
- [x] Cutscene player (Higgsfield-ready + text fallback)
- [x] 7 mini-game types (vocab match, sentence builder, dialogue, listening, reading, conjugation, flashcards)
- [x] Spaced repetition mastery tracking
- [x] Teacher dashboard with 6-tab analytics
- [x] Badge / achievement system (6 badge types, passport stamps)
- [x] Supabase Realtime class alerts
- [x] Content authoring helper + Zod validation
- [ ] Units 2-10 content (vocab, dialogue, suspects)
- [ ] Higgsfield cutscene video integration
- [ ] Chase mechanic (future sprint)
- [ ] Interrogation mechanic (future sprint)
