# Lattice — AI Decision Audit System

A full-stack web application for recording, auditing, and analyzing AI decisions. Built with Next.js 14 (App Router), Supabase (Postgres + Auth + Row Level Security), Tailwind CSS, and Recharts.

The aesthetic: an editorial white / light-blue / deep-blue theme — the look of a serious audit ledger.

---

## What this is

A database system that captures every AI decision your organization makes, the conditions it was made under, and any human review of it — searchable, filterable, exportable.

For each decision Lattice records:

- **Identity**: model name, model version, agent/system, decision type
- **Content**: full prompt and response text
- **Classification**: outcome (approved / rejected / flagged / pending / overridden), risk level (low / medium / high / critical)
- **Performance**: confidence, latency, tokens in/out, cost
- **Metadata**: free-form tags and JSON metadata
- **Review trail**: reviewer notes, who reviewed and when, plus an immutable event log of every state change

---

## Pages

| Route | What it does |
|---|---|
| `/` | Editorial landing page with feature overview and schema preview |
| `/auth/login` | Email + password sign-in |
| `/auth/signup` | Account creation (auto-creates a profile via trigger) |
| `/dashboard` | KPI cards, 14-day decision-volume trend, compliance posture, recent decisions |
| `/decisions` | Searchable, filterable, paginated ledger |
| `/decisions/new` | Form to log a new decision (with JSON metadata + tags) |
| `/decisions/[id]` | Full detail view: prompt, response, metadata, audit trail, performance, reviewer actions |
| `/analytics` | Outcome donut, risk distribution, top models, key aggregates |
| `/settings` | Profile management |

---

## Stack

- **Framework**: Next.js 14 (App Router, RSC + Server Actions where appropriate)
- **Auth**: Supabase Auth via `@supabase/ssr` (email + password; ready for OAuth providers)
- **Database**: Supabase Postgres with typed enums and Row Level Security
- **Styling**: Tailwind CSS with a custom token system (`ink`, `azure`, `paper`)
- **Charts**: Recharts
- **Icons**: lucide-react
- **Type-safe**: TypeScript end-to-end

---

## Getting started

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project. From **Settings → API**, copy:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Apply the schema

Open the **SQL Editor** in Supabase, paste the contents of `supabase/migrations/0001_init.sql`, and run. This creates:

- The `profiles`, `decisions`, and `decision_events` tables
- Enum types: `decision_outcome`, `risk_level`, `user_role`
- Row Level Security policies (every user only sees their own data)
- A trigger that auto-creates a `profiles` row when a user signs up
- Triggers that append immutable events to `decision_events` whenever a decision is created or its outcome / risk changes

### 3. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

### 4. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### 5. (Optional) seed sample data

After signing up and signing in, open the Supabase SQL Editor while authenticated as your user and run `supabase/seed.sql`. This inserts five sample decisions tied to your `auth.uid()`.

---

## Project structure

```
src/
├── app/
│   ├── (app)/                  # Protected route group
│   │   ├── layout.tsx          # Sidebar + mobile topbar shell
│   │   ├── dashboard/
│   │   ├── decisions/
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   ├── analytics/
│   │   └── settings/
│   ├── auth/
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/
│   ├── globals.css             # Theme tokens + base styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   ├── charts/                 # Recharts wrappers
│   ├── decisions/              # Badges, ReviewPanel
│   ├── layout/                 # Sidebar, MobileTopbar
│   └── SettingsForm.tsx
├── lib/
│   ├── supabase/               # client / server / middleware helpers
│   └── utils.ts                # cn(), formatters
├── types/                      # Decision, Profile types
└── middleware.ts               # Session refresh + auth gating
supabase/
├── migrations/0001_init.sql    # Schema, RLS, triggers
└── seed.sql                    # Optional sample data
```

---

## Security model

- **Row Level Security on every table.** A user can only ever read or write their own decisions and only insert events for decisions they own.
- **Append-only event log.** `decision_events` has no `update` or `delete` policies — past records cannot be rewritten.
- **Session refresh.** The Next.js middleware refreshes Supabase sessions on every request and gates `/dashboard`, `/decisions`, `/analytics`, `/settings` behind auth.
- **Server-side data fetching.** Protected pages run as React Server Components with the Supabase server client, so the anon key alone is never enough — every query carries the user's session JWT.

---

## Extending

Common next steps:

- **Multi-tenant orgs**: add an `organizations` table and an `organization_id` foreign key on `decisions` + `profiles`. Update RLS to scope by org membership.
- **Roles** (`admin` / `auditor` / `viewer`): the `profiles.role` column already exists; extend RLS and route guards to use it.
- **CSV / JSON export**: add an API route that streams filtered decisions back as a download with embedded SHA-256 chain-of-custody hashes.
- **Webhook ingestion**: an API route at `/api/decisions/ingest` that accepts a service-role-authenticated POST from your AI agents in production.

---

## License

MIT.
