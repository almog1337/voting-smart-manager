# Scoring Job — Implementation Plan

## Overview

Implement the ticket scoring engine as:
1. A **`ScoringJobsModule`** with a `ScoringJobsService` containing the core algorithm
2. A **`@Cron()`-decorated method** for scheduled execution (via `@nestjs/schedule`)
3. A **`POST /scoring-jobs/run`** HTTP route to trigger scoring on demand

---

## Module Location

```
apps/api/src/scoring-jobs/
├── scoring-jobs.module.ts
├── scoring-jobs.service.ts
└── scoring-jobs.controller.ts
```

Register in `apps/api/src/app.module.ts` after all feature modules.

---

## Dependencies

Add `@nestjs/schedule` to `apps/api/package.json`:

```bash
pnpm add @nestjs/schedule --filter api
```

Import `ScheduleModule.forRoot()` in `app.module.ts`.

---

## Algorithm

The scoring service needs three injected models: `MODEL_CANDIDATE`, `MODEL_TICKET`, `MODEL_TICKET_ATTRIBUTE` (constants from `schema.providers.ts`).

### Step 1 — Load rules and tickets

```
rules   = TicketAttribute.find({}).lean()
tickets = Ticket.find({}).lean()          // needed for vector list per ticket
```

Build an index: `ticketById: Map<string, ITicket>` for O(1) lookups.

### Step 2 — Stream candidates in batches

Cursor over all candidates in batches of N (e.g. 100) to avoid loading the entire collection into memory.

### Step 3 — Match candidate against each rule

For each candidate, iterate `rules`. For each rule, call a pure `matchesRule(candidate, rule)` function:

| `rule.type` | Candidate field checked | Identifiers used |
|---|---|---|
| `committee` | `candidate.committees[]` | `committeeName`, `participationType?` |
| `sub_committee` | `candidate.committees[]` | `subCommitteeName`, `committeeName?`, `participationType?` |
| `government_ministry` | `candidate.roles[]` where `roleType === 'public'` | `ministryName` → `role.ministry` |
| `role_type` | `candidate.roles[]` | `roleType` |
| `education_field` | `candidate.education[]` | `field` |
| `residence_district` | `candidate.residence[]` | `district` |

All string comparisons are **case-insensitive trimmed** to avoid data inconsistency issues.

### Step 4 — Accumulate scores

For each matched rule, loop over `rule.tickets × rule.vectorNames` and accumulate into a nested map:

```
scores: Map<ticketId, Map<vectorName, totalScore>>
```

### Step 5 — Determine `isPrimary`

`isPrimary = true` for the ticket whose sum of all vector scores is the highest among all tickets the candidate scored on. Ties broken by ticket insertion order. Only one ticket may be primary per candidate.

### Step 6 — Build `ICandidateTicket[]`

For each ticketId in the scores map, build:

```typescript
{
  ticketId,
  ticketName: ticketById.get(ticketId).name,
  isPrimary,
  vectors: [{ vectorName, score }, ...]   // only vectors with score > 0
}
```

Omit tickets where all vector scores are 0.

### Step 7 — Write back

```typescript
await CandidateModel.updateOne(
  { _id: candidate._id },
  { $set: { tickets: computedTickets } },
);
```

Use `bulkWrite()` with `updateOne` operations per batch for efficiency.

---

## Service Interface

```typescript
@Injectable()
export class ScoringJobsService {
  constructor(
    @Inject(MODEL_CANDIDATE) private readonly candidateModel: Model<ICandidate>,
    @Inject(MODEL_TICKET) private readonly ticketModel: Model<ITicket>,
    @Inject(MODEL_TICKET_ATTRIBUTE) private readonly attributeModel: Model<ITicketAttribute>,
  ) {}

  /** Core scoring algorithm. Returns stats: { processed, updated, errors }. */
  async runScoringJob(): Promise<ScoringJobResult>

  /** @Cron — runs on configured schedule */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduledRun(): Promise<void>

  // private helpers
  private matchesRule(candidate: ICandidate, rule: ITicketAttribute): boolean
  private computeScores(candidate: ICandidate, rules: ITicketAttribute[]): Map<string, Map<string, number>>
  private buildCandidateTickets(scores, ticketById): ICandidateTicket[]
}
```

`ScoringJobResult`:
```typescript
interface ScoringJobResult {
  processedAt: Date;
  candidatesProcessed: number;
  candidatesUpdated: number;
  durationMs: number;
  errors: { candidateId: string; message: string }[];
}
```

---

## Controller

```typescript
@Controller('scoring-jobs')
@ApiTags('scoring-jobs')
export class ScoringJobsController {
  constructor(private readonly scoringJobsService: ScoringJobsService) {}

  @Post('run')
  @ApiOperation({ summary: 'Trigger scoring job manually' })
  @ApiOkResponse({ description: 'Returns job execution stats' })
  async run(): Promise<ScoringJobResult> {
    return this.scoringJobsService.runScoringJob();
  }
}
```

---

## Module

```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [ScoringJobsController],
  providers: [ScoringJobsService, ...SchemaProviders],
  exports: [ScoringJobsService],
})
export class ScoringJobsModule {}
```

Note: `SchemaProviders` is already defined in `schema.providers.ts` and provides all three needed models. Import `DatabaseModule` (not just `database.providers.ts`) to get the connection token.

---

## `app.module.ts` changes

```typescript
imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  ScheduleModule.forRoot(),        // ← add
  DatabaseModule,
  PartiesModule,
  TicketsModule,
  TicketAttributesModule,
  CandidatesModule,
  ScoringJobsModule,               // ← add (last, depends on all feature models)
],
```

---

## Cron Schedule

Default: `CronExpression.EVERY_DAY_AT_MIDNIGHT` (`0 0 * * *`).

Make it configurable via env var `SCORING_JOB_CRON` so it can be changed per environment without a code change:

```typescript
@Cron(process.env.SCORING_JOB_CRON ?? CronExpression.EVERY_DAY_AT_MIDNIGHT)
async scheduledRun(): Promise<void> { ... }
```

---

## Error Handling

- Per-candidate errors are caught individually and accumulated in `ScoringJobResult.errors` — a single bad document must not abort the whole run.
- If `runScoringJob()` itself throws (e.g. DB connection failure), the cron wrapper logs the error; the HTTP route re-throws so the caller gets a 500.
- Log start/end/stats at `log` level; per-candidate errors at `warn` level; use NestJS `Logger`.

---

## Implementation Order

1. `pnpm add @nestjs/schedule --filter api`
2. Add `ScheduleModule.forRoot()` to `app.module.ts`
3. Create `scoring-jobs/scoring-jobs.service.ts` — implement `runScoringJob()` + `matchesRule()` helpers
4. Add `@Cron()` decorated `scheduledRun()` to the service
5. Create `scoring-jobs/scoring-jobs.controller.ts` — `POST /scoring-jobs/run`
6. Create `scoring-jobs/scoring-jobs.module.ts` — wire everything together
7. Register `ScoringJobsModule` in `app.module.ts`
8. Write unit tests for `matchesRule()` (pure function — easy to unit test with mock candidates/rules)
9. Manual smoke test: seed a few `TicketAttribute` documents, call `POST /scoring-jobs/run`, verify `candidate.tickets` is populated

---

## Open Questions

- **Batch size**: start with 100 candidates per batch; tune based on memory profiling.
- **Re-run idempotency**: each run fully replaces `candidate.tickets` via `$set` — safe to re-run at any time.
- **Authorization**: `POST /scoring-jobs/run` should eventually be protected (admin-only). Out of scope for initial implementation.
- **Observability**: consider emitting a NestJS event (`EventEmitter2`) on job completion for future webhook/notification support.
