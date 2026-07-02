# Contract: Scheduling Server Functions

**Feature**: [spec.md](../spec.md) | **Data model**: [data-model.md](../data-model.md)

This feature has one consumer in scope — its own Next.js UI — reached
through server-only functions (Server Actions / server components), not an
HTTP API (see [research.md](../research.md) Decision 5). These functions are
documented as a contract anyway so that (a) the UI layer and future
automation share one authoritative implementation, and (b) the interface
survives implementation refactors and later HTTP-exposure decisions.

All functions read/write only `content/<brand>/*.md` and
`content/<brand>/manifest.yaml` files (constitution Principles I–IV). None
of them cache results across calls (spec FR-005a).

## `listBrands()`

Returns every brand discovered under `content/`.

- **Input**: none
- **Output**: `Brand[]` — `{ slug, displayName, color }` (see data-model.md)
- **Errors**: none (an empty `content/` directory yields an empty array)

## `getScheduleForRange(range, brandSlug?)`

Answers "what's scheduled for date X" using manifest data alone (FR-019).

- **Input**:
  - `range`: `{ start: ISODate, end: ISODate }` — inclusive date range in the
    caller's requested granularity (week or month); the dashboard computes
    this range from the currently viewed period (spec FR-001a).
  - `brandSlug` (optional): restrict to one brand; omitted means all brands
    (spec FR-016, FR-017).
- **Output**: `ScheduleView`:
  - `scheduled: ManifestEntrySummary[]` — entries with `scheduledAt` inside
    `range`, each `{ entryId, contentId, brand, status, scheduledAt,
    timezone, repostOf?, brokenReference?: boolean }`.
  - `unscheduled: ManifestEntrySummary[]` — all `draft` entries with no
    `scheduledAt`, regardless of `range` (spec FR-003; drafts are always
    shown, not date-filtered).
  - `untrackedContent: ContentItemSummary[]` — content files with no
    matching manifest entry (FR-021): `{ contentId, brand }`.
  - `duplicateContentIds: string[]` — any `contentId` referenced by more
    than one non-repost manifest entry (Edge Cases).
- **Errors**: none — malformed individual entries are represented via
  `brokenReference: true` rather than raising, so one bad entry never
  breaks the whole view.

## `getItemDetail(entryId, brandSlug)`

Returns everything needed for the detail view (FR-004, FR-005).

- **Input**: `entryId`, `brandSlug`
- **Output**: `ItemDetail`:
  - Manifest-derived: `entryId, contentId, status, scheduledAt?, timezone?,
    repostOf?`
  - Content-file-derived (read fresh from disk, FR-005/FR-005a):
    `caption, hashtags, media, platforms`
  - `brokenReference: boolean` — true if `contentId` does not resolve to an
    existing, valid file; when true, content-file-derived fields are
    omitted/null.
- **Errors**: `EntryNotFoundError` if no manifest entry with `entryId`
  exists in the given brand's manifest.

## `transitionToScheduled(entryId, brandSlug, scheduledAt, timezone)`

Moves a `draft` entry to `scheduled` (FR-006, FR-007).

- **Input**: `entryId`, `brandSlug`, `scheduledAt` (required, non-empty),
  `timezone` (required, valid IANA zone name)
- **Behavior**: read-modify-write targeting `entryId` only (FR-010a,
  Decision 8); fails rather than partially applying if the entry is gone.
- **Output**: the updated `ManifestEntrySummary`
- **Errors**:
  - `MissingScheduleFieldsError` — `scheduledAt` or `timezone` absent
  - `InvalidTransitionError` — entry's current status is not `draft`
  - `EntryNotFoundError` — entry no longer exists in the manifest at write
    time (spec Edge Cases: concurrent external edit)

## `transitionToPosted(entryId, brandSlug)`

Moves a `scheduled` entry to `posted` (FR-008, FR-009).

- **Input**: `entryId`, `brandSlug`
- **Behavior**: same read-modify-write semantics as above.
- **Output**: the updated `ManifestEntrySummary`
- **Errors**:
  - `InvalidTransitionError` — entry's current status is not `scheduled`
    (blocks `draft → posted` and any other skip, FR-009)
  - `EntryNotFoundError` — as above

## `createRepost(originalContentId, brandSlug, scheduledAt, timezone)`

Creates a new manifest entry referencing an already-posted item (FR-012–015).

- **Input**:
  - `originalContentId`: the Content Item `id` being reposted
  - `brandSlug`: brand the original belongs to (reposts stay within the
    original's brand, consistent with Principle II's brand partitioning)
  - `scheduledAt`, `timezone`: required, independent of the original's own
    schedule (FR-013)
- **Behavior**: appends a new Manifest Entry with a freshly generated
  `entryId`, `contentId = originalContentId`, `repostOf = originalContentId`,
  `status = draft` transitioning immediately to `scheduled` using the
  supplied date/timezone (equivalent to draft creation + immediate
  scheduling in one action), and does **not** write any caption/body content
  — the repost entry carries no copy of the original's text (FR-014).
- **Output**: the newly created `ManifestEntrySummary`
- **Errors**:
  - `OriginalNotPostedError` — `originalContentId`'s current manifest entry
    is not `status = posted`
  - `MissingScheduleFieldsError` — as above
  - `ContentNotFoundError` — `originalContentId` does not resolve to an
    existing file (surfaced as broken rather than silently allowed)
