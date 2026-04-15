# Plan: Add `vectorNames` to `TicketAttribute`

## Goal

Add a `vectorNames: string[]` field to `TicketAttribute` so that each scoring rule declares
which vectors (on the associated ticket) it contributes to. This closes the gap that prevents
the scoring job from producing a per-vector score breakdown on `candidate.tickets[].vectors[]`.

---

## Touchpoints

### API

#### 1. `apps/api/src/schemas/ticket-attribute.schema.ts`

- Add `vectorNames: string[]` to `ITicketAttribute`.
- Add the field to `TicketAttributeSchema` as `{ type: [String], default: [] }`.
- No index needed — this field is not queried, only read during the scoring job.

```ts
// ITicketAttribute — add:
vectorNames: string[];

// TicketAttributeSchema — add:
vectorNames: { type: [String], default: [] },
```

#### 2. `apps/api/src/ticket-attributes/dto/create-ticket-attribute.dto.ts`

- Add `vectorNames` field with `class-validator` decorators.
- It is optional (an attribute with no vector names scores the ticket globally).

```ts
@IsOptional()
@IsArray()
@IsString({ each: true })
@IsNotEmpty({ each: true })
vectorNames?: string[];
```

`UpdateTicketAttributeDto` extends `PartialType(CreateTicketAttributeDto)` so it picks
this up automatically — no change needed there.

---

### Client

#### 3. `apps/client/src/types/index.ts`

- Add `vectorNames: string[]` to the `TicketAttribute` interface.

```ts
export interface TicketAttribute {
  _id: string;
  tickets: string[];
  type: TicketAttributeType;
  score: number;
  identifiers: Record<string, string>;
  vectorNames: string[];   // ← add
  description?: string;
}
```

#### 4. `apps/client/src/pages/TicketAttributeFormPage.tsx`

Two changes:

**a. Zod schema** — add `vectorNames` field:

```ts
const schema = z.object({
  // ... existing fields ...
  vectorNames: z.array(z.string()).default([]),
});
```

**b. Form field** — add a `Select` (mode `multiple`) for `vectorNames`, positioned after the
tickets selector. The available options must be the union of vectors across the currently
selected tickets, so the options list is derived reactively from the `tickets` watch value:

```tsx
// Inside the component:
const selectedTicketIds = useWatch({ control, name: 'tickets' });

const vectorOptions = useMemo(() => {
  const names = new Set<string>();
  (tickets ?? [])
    .filter(t => selectedTicketIds.includes(t._id))
    .flatMap(t => t.vectors)
    .forEach(v => names.add(v.name));
  return [...names].map(n => ({ value: n, label: n }));
}, [tickets, selectedTicketIds]);
```

Render the field after the tickets selector:

```tsx
<Form.Item label="וקטורים">
  <Controller
    name="vectorNames"
    control={control}
    render={({ field }) => (
      <Select
        mode="multiple"
        value={field.value}
        onChange={field.onChange}
        options={vectorOptions}
        placeholder="בחר וקטורים (אופציונלי)"
        style={{ width: '100%' }}
      />
    )}
  />
</Form.Item>
```

Also update the `reset()` call in the `useEffect` to include `vectorNames`:

```ts
reset({
  // ...existing fields...
  vectorNames: existing.vectorNames ?? [],
});
```

And pass `vectorNames` through in `onSubmit` (it is already included in the spread `...rest`
once added to the schema, no extra wiring needed).

#### 5. `apps/client/src/pages/TicketAttributeViewPage.tsx`

Add a display row for `vectorNames` in the "פרטי מאפיין" `Descriptions` card:

```tsx
<Descriptions.Item label="וקטורים" span={2}>
  {attr.vectorNames?.length
    ? attr.vectorNames.map(n => <Tag key={n}>{n}</Tag>)
    : '—'}
</Descriptions.Item>
```

---

## Order of changes

1. **Schema** (`ticket-attribute.schema.ts`) — data model first.
2. **DTO** (`create-ticket-attribute.dto.ts`) — API validation layer.
3. **Client type** (`types/index.ts`) — shared contract.
4. **Form** (`TicketAttributeFormPage.tsx`) — input UI.
5. **View** (`TicketAttributeViewPage.tsx`) — read UI.

---

## Out of scope

- Migration of existing `TicketAttribute` documents in the database — the field defaults to
  `[]` so old records are unaffected.
- Scoring job implementation — tracked separately in `docs/ticket-system.md`.
- Validation that each name in `vectorNames` actually exists on the referenced tickets —
  this is intentionally left as an application-level concern, not enforced at the DB layer.
