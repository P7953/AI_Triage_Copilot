# AI Triage Copilot

An issue/bug triage tool for small teams. Members submit issues; an AI copilot
triages each one (category, priority, root-cause hypothesis, suggested first
step, confidence score) as an assistive first pass. Admins review the queue,
can override any AI decision, and have exclusive control over status,
assignment, and deletion. The AI is assistive, not authoritative — a human
admin always has final say.

> Status: work in progress, built incrementally phase by phase. This README
> will be filled in as each phase lands (see `Build phases` below).

## Tech stack

- Next.js 16 (App Router, Server Components, Server Actions), TypeScript (strict)
- PostgreSQL on Neon (serverless) via Prisma ORM
- Auth.js v5 (Credentials provider, bcrypt, JWT sessions)
- Vercel AI SDK (`ai` package, `generateObject`) — Groq or Google Gemini
- Tailwind CSS + shadcn/ui
- Zod for input and AI-output validation
- Vitest (unit) + Playwright (e2e)

## Getting started (local dev)

```bash
npm install
cp .env.example .env   # fill in real values, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See [`.env.example`](.env.example) for the full list. You will need:

- A Neon Postgres project — grab both the **pooled** connection string
  (`DATABASE_URL`, host contains `-pooler`) and the **direct** one
  (`DIRECT_URL`, no `-pooler`) from the Neon dashboard's Connection Details.
  The app uses the pooled URL at runtime via the Neon driver adapter
  (`@prisma/adapter-neon`); Prisma Migrate uses the direct URL.
- An `AUTH_SECRET` (generate with `npx auth secret`)
- An API key for either Groq or Google Gemini, matching `AI_PROVIDER`

## Database

Prisma schema lives in [`prisma/schema.prisma`](prisma/schema.prisma):
`User`, `Issue`, `Comment`, `AuditLog` models plus the `Role`, `Status`,
`Category`, `Priority`, and `TriageStatus` enums described in the spec.

Prisma 7 no longer reads the connection URL from the schema file — it comes
from [`prisma.config.ts`](prisma.config.ts) for CLI commands (migrate, seed,
studio), and from an explicit driver adapter for the app's runtime
`PrismaClient` (see [`src/lib/prisma.ts`](src/lib/prisma.ts)).

```bash
npm run db:migrate   # apply migrations (prisma migrate dev)
npm run db:seed       # (re)seed sample data
npm run db:studio     # browse the database
```

## Build phases

This project is built in the following order; each phase ends in its own
commit:

1. Scaffold — Next.js + Tailwind + shadcn/ui
2. Database — Prisma schema, migration, seed
3. Auth — Auth.js v5 credentials, JWT roles, `proxy.ts` guard
4. Core CRUD — issue creation/listing/viewing via Server Actions
5. Authorization — admin-only actions, audit log, UI gating
6. AI triage — real `generateObject` call, failure fallback, overrides
7. UI/UX + accessibility
8. Hardening — rate limiting, security headers, sanitization
9. Tests + CI
10. Deploy prep + full documentation

## Seeded accounts

The seed script (`prisma/seed.ts`) creates one admin, two members, and six
sample issues (five triaged with varying confidence, one with
`triageStatus = FAILED` to exercise the manual-triage fallback UI).

| Role   | Email               | Password    |
|--------|---------------------|-------------|
| Admin  | admin@triage.dev    | Admin123!   |
| Member | alice@triage.dev    | Member123!  |
| Member | bob@triage.dev      | Member123!  |

## Architecture, security model, and key decisions

To be written in Phase 10, once the full system is in place.
