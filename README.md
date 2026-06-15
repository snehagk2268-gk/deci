# Lattice — AI Decision Audit System

A full-stack web application for recording, auditing, and analyzing AI decisions. Built with Next.js 14 (App Router), MySQL, Tailwind CSS, and Recharts.

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
| `/auth/signup` | Account creation |
| `/dashboard` | KPI cards, 14-day decision-volume trend, compliance posture, recent decisions |
| `/decisions` | Searchable, filterable, paginated ledger |
| `/decisions/new` | Form to log a new decision (with JSON metadata + tags) |
| `/decisions/[id]` | Full detail view: prompt, response, metadata, audit trail, performance, reviewer actions |
| `/analytics` | Outcome donut, risk distribution, top models, key aggregates |
| `/settings` | Profile management |

---

## Stack

- **Framework**: Next.js 14 (App Router, RSC + Server Actions where appropriate)
- **Auth**: JWT-based session cookies stored in HTTP-only cookies
- **Database**: MySQL with schema migrations and indexed search
- **Styling**: Tailwind CSS with a custom token system (`ink`, `azure`, `paper`)
- **Charts**: Recharts
- **Icons**: lucide-react
- **Type-safe**: TypeScript end-to-end

---

## Getting started

### 1. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your MySQL connection string and a JWT secret.
```

### 2. Install dependencies

```bash
npm install
```

### 3. Initialize & Seed Database

Ensure your MySQL instance is running and the credentials in `.env.local` are correct. Start the Next.js dev server:

```bash
npm run dev
```

Then, visit [http://localhost:3000/api/setup?seed=true](http://localhost:3000/api/setup?seed=true) in your browser. This will:
- Create the `profiles`, `decisions`, and `decision_events` tables.
- Seed the database with a default auditor account (`auditor@example.com` / `password`) and sample decisions.

### 4. Run the application

If not already running, start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in using:
- **Email**: `auditor@example.com`
- **Password**: `password`

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
│   │   └── signup/
│   ├── api/                    # API endpoints (decisions, setup, export)
│   ├── globals.css             # Theme tokens + base styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   ├── charts/                 # Recharts wrappers
│   ├── decisions/              # Badges, ReviewPanel
│   ├── layout/                 # Sidebar, MobileTopbar
│   └── SettingsForm.tsx
├── lib/
│   ├── mysql/                  # Connection pool, authentication, schemas
│   └── utils.ts                # cn(), formatters
├── types/                      # Decision, Profile types
└── middleware.ts               # Session refresh + auth gating
```

---

## Security model

- **JWT Session Security.** Next.js middleware verifies the `dt-session` cookie on all protected routes and API requests, extracting user details.
- **Tenant Isolation.** All decision queries include a `WHERE user_id = ?` clause utilizing the verified user's ID to prevent unauthorized access.
- **Append-only event log.** `decision_events` records audit logs for tracking actions over decisions.

---

## License

MIT.
