# Ticket System

## Overview

The ticket system is a political scoring engine. It maps candidate attributes (committees, roles, education, residence) to ideological "tickets" via a set of configurable rules, producing a per-candidate score breakdown cached directly on the candidate document.

---

## Data Model

### `Ticket` — the questionnaire definition

Defined in `apps/api/src/schemas/ticket.schema.ts`.

| Field | Type | Description |
|---|---|---|
| `name` | `string` (unique) | Ticket identifier |
| `threshold` | `number` | Minimum score to be considered affiliated |
| `vectors` | `IVector[]` | Ideological axes on this ticket |

Each **vector** has:
- `name` — axis label (e.g. `"security"`, `"social"`)
- `orientation` — `'right'` or `'left'`

A ticket is essentially a multi-axis political questionnaire. A candidate can score differently on each vector.

---

### `TicketAttribute` — the scoring rules

Defined in `apps/api/src/schemas/ticket-attribute.schema.ts`.

| Field | Type | Description |
|---|---|---|
| `tickets` | `ObjectId[]` | Which tickets this rule applies to |
| `type` | `TicketAttributeType` | The candidate dimension being matched |
| `score` | `number` | Points awarded on a match |
| `identifiers` | `Map<string, string>` | The specific value(s) to match against |
| `description` | `string?` | Human-readable label |

**Supported `type` values:**

| Type | Matched against |
|---|---|
| `committee` | `candidate.committees[].committeeName` |
| `sub_committee` | sub-committee participation |
| `government_ministry` | public role ministry |
| `role_type` | `candidate.roles[].roleType` |
| `education_field` | `candidate.education[].field` |
| `residence_district` | `candidate.residence[].district` |

The `identifiers` map is flexible — keys correspond to the field being matched (e.g. `{ committeeName: "Foreign Affairs" }`). A wildcard index covers all map keys for efficient querying.

---

### `Candidate.tickets[]` — cached score output

Defined in `apps/api/src/schemas/candidate.schema.ts` (`ICandidateTicket[]`).

> **Note:** This array is computed and cached by a scoring job — it is not set manually.

Each entry holds:

| Field | Type | Description |
|---|---|---|
| `ticketId` | `ObjectId` | Reference to the `Ticket` |
| `ticketName` | `string` | Denormalized name for display |
| `isPrimary` | `boolean` | Whether this is the candidate's primary affiliation |
| `vectors` | `ITicketVector[]` | Per-vector score breakdown |

Each `ITicketVector`:
- `vectorName` — matches a vector name on the parent `Ticket`
- `score` — accumulated score for that axis

---

## Scoring Flow

```
TicketAttribute rules (in DB)
        +
Candidate attributes:
  - committees[]
  - roles[]
  - education[]
  - residence[]
        ↓
  [ scoring job — not yet implemented ]
        ↓
Candidate.tickets[] (written back to DB)
```

The scoring job should:
1. Fetch all `TicketAttribute` documents
2. For each candidate, match attributes against each rule's `type` + `identifiers`
3. Accumulate points by `(ticketId, vectorName)`
4. Upsert the result into `candidate.tickets[]`
