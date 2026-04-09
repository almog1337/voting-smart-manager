# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm run start:dev       # Run with file watching
pnpm run start:debug     # Run with debugger + watch

# Build & Production
pnpm run build           # Compile TypeScript → dist/
pnpm run start:prod      # Run compiled build

# Testing
pnpm run test            # Unit tests
pnpm run test:watch      # Unit tests with watch
pnpm run test:cov        # Unit tests with coverage
pnpm run test:e2e        # E2E tests (uses test/jest-e2e.json)
pnpm run test:debug      # Debug tests

# Code Quality
pnpm run lint            # ESLint with auto-fix
pnpm run format          # Prettier format src/ and test/
```

## Architecture

NestJS REST API backend for managing Israeli political candidate data, backed by MongoDB (Mongoose).

**Entry point:** `src/main.ts` → bootstraps `src/app.module.ts`

**Database:** MongoDB Atlas connection via `MONGO_URI` in `.env`. Connection is provided in `src/database.providers.ts` and consumed through NestJS dependency injection.

**Schema layer** (`src/schemas/`): All data models live here as Mongoose schemas. The four core schemas are:

- **`candidate.schema.ts`** — The most complex schema. Represents a political candidate with nested sub-documents for: residence (city, district, periphery, birth country), education (degree, field, institution), roles (discriminated union across party/military/knesset/public/other role types with dates), links (LinkedIn, Wikipedia, Knesset URLs), committee participation, ticket affiliations with scoring vectors, and image variants (primary, secondary, mobile, thumbnail). Has virtuals: `age`, `currentParty`, `firstElected`, `seniorityDuration`. Heavily indexed for querying by name, orientation, sector, residence, and party affiliation.
- **`party.schema.ts`** — Political parties (name, platform, isActive). Has a virtual `candidates` populate back-reference.
- **`ticket.schema.ts`** — Electoral tickets (name unique, threshold, vectors array with name + orientation: right/left). Used for political scoring/affiliation.
- **`ticket-attribute.schema.ts`** — Scoring rules that match candidate attributes to tickets. Types: `committee`, `sub_committee`, `government_ministry`, `role_type`, `education_field`, `residence_district`. Contains a score and an `identifiers` Map for flexible matching.

**Schema providers:** `src/schemas/schema.providers.ts` registers all Mongoose models; `src/schemas/index.ts` re-exports them.

**Tech stack:** NestJS 11, Express 5, Mongoose 9, TypeScript 5.7 (ES2023 target, strict mode, decorators enabled), Jest 30, ESLint 9 + Prettier 3.
