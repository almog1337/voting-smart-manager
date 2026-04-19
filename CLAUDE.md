# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`voting-smart` is a **pnpm monorepo** managed with Turborepo. Workspace packages live under `apps/`. There are no shared `packages/` yet. The two apps are independent deployments that share no compiled code — only the MongoDB database connects them at runtime.

- `apps/api` — NestJS REST API backed by MongoDB (Mongoose)
- `apps/client` — React + Vite admin SPA in Hebrew (RTL)

Running `pnpm <script>` at the root fans out to all workspaces via Turborepo. To target a single app, use `--filter`, e.g. `pnpm --filter @voting-smart/api <script>`.

## Commands

All commands run from the repo root unless noted.

```bash
# Run both apps in dev mode
pnpm dev

# Run only one app
pnpm dev:api
pnpm dev:client

# Build all
pnpm build

# Run tests (API only — Jest)
pnpm test
# Single test file
cd apps/api && pnpm test -- --testPathPattern=candidates

# Lint
pnpm lint
```

The API starts on port 3000 by default (`PORT` env var). The client dev server is on port 8080.

## Environment Variables

**API** (`apps/api/.env`):
- `MONGO_URI` — required; MongoDB connection string
- `PORT` — optional; defaults to 3000
- `SCORING_JOB_CRON` — optional; cron schedule for the scoring job (defaults to `0 0 * * *`)

**Client** (`apps/client/.env`):
- `VITE_API_URL` — optional; defaults to `http://localhost:3000`

## Architecture

### API (NestJS)

The API uses a **manual provider pattern** instead of `@nestjs/mongoose`. Mongoose models are registered as injection tokens in `src/schemas/schema.providers.ts` (e.g. `MODEL_CANDIDATE`, `MODEL_TICKET`, `MODEL_TICKET_ATTRIBUTE`) and exported from `DatabaseModule`. Every feature module imports `DatabaseModule` to access the models it needs.

Feature modules follow a standard NestJS layout: `module → service → controller → dto/`.

**Modules:**
- `CandidatesModule` — CRUD for political candidates
- `PartiesModule` — CRUD for political parties
- `TicketsModule` — CRUD for "tickets" (policy/issue categories, each with named vectors)
- `TicketAttributesModule` — CRUD for scoring rules that map candidate attributes → tickets
- `ScoringJobsModule` — background job that computes and caches `Candidate.tickets[]`

### Data Model

```
Ticket
  └── vectors[]: { name, orientation: 'right'|'left' }

TicketAttribute (scoring rule)
  ├── type: 'committee' | 'sub_committee' | 'government_ministry' |
  │         'role_type' | 'education_field' | 'residence_district'
  ├── identifiers: { committeeName?, ministryName?, roleType?, field?, district?, … }
  ├── tickets[]: ObjectId[]   ← which tickets this rule contributes to
  ├── vectorNames[]: string[] ← which vectors within those tickets
  └── score: number

Candidate
  ├── roles[]: discriminated union (party | military | knesset | public | other)
  ├── committees[]: { committeeName, participationType, committeeId? }
  ├── residence[]: { city, district, … }
  ├── education[]: { field, degree, … }
  └── tickets[]: ICandidateTicket[]  ← COMPUTED by scoring job; do not edit directly
       └── { ticketId, ticketName, isPrimary, vectors[]: { vectorName, score } }
```

`Candidate.tickets[]` is a **denormalized cache** written by the scoring job — never write to it directly via the candidates API.

### Scoring Job

`ScoringJobsService` runs on a cron schedule. It:
1. Loads all `TicketAttribute` rules and all `Ticket` documents.
2. Iterates candidates in batches of 100.
3. For each candidate, evaluates every rule with `matchesRule()` — a switch on `rule.type` that checks the relevant candidate sub-array.
4. Accumulates `score` per `(ticketId, vectorName)` pair.
5. Marks the ticket with the highest total score as `isPrimary`.
6. Writes results back via `bulkWrite`.

The job can also be triggered manually via `POST /scoring-jobs/run`.

### Client (React)

The client is a Hebrew RTL admin SPA using Ant Design 5, React Query v5, React Router v6, and React Hook Form + Zod for form validation.

**Data fetching:** `src/api/*.ts` files contain thin axios wrappers over a shared `apiClient` (configured in `src/api/client.ts`). `src/hooks/use*.ts` files wrap those in React Query hooks (`useQuery` / `useMutation`). Mutations call `queryClient.invalidateQueries` on success to keep the cache fresh. Pages consume hooks directly — no prop drilling through layers.

**Routing:** All routes are nested under `AppLayout` (a fixed left sidebar + content area). The root redirects to `/candidates`. Every resource follows the same four-route pattern:

| Path | Purpose |
|---|---|
| `/resource` | list |
| `/resource/new` | create form |
| `/resource/:id` | view |
| `/resource/:id/edit` | edit form |

**Sidebar navigation** (`Layout.tsx`) is defined in the `NAV_ITEMS` array — add new top-level routes there.

**Settings page** (`/settings`) is the only non-CRUD page. It exposes a manual trigger for the scoring job via `POST /scoring-jobs/run` and displays the `ScoringJobResult` (counts, duration, any per-candidate errors).

**RTL/i18n:** `ConfigProvider` in `App.tsx` is set to `direction="rtl"` with `heIL` locale — do not remove these props. All UI text is in Hebrew.

**Theme:** Brand colors and component overrides are all defined in the `ConfigProvider` `theme` prop in `App.tsx`. The primary brand color is `#2952d9`.

## Swagger

API docs available at `http://localhost:3000/api/docs` when running locally.
