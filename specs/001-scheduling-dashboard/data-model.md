# Data Model: Scheduling Dashboard

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

## Brand

A named partition corresponding to exactly one `content/<brand>/` folder and
exactly one manifest file.

| Field | Type | Notes |
|---|---|---|
| `slug` | string | Directory name under `content/`; unique by filesystem construction. Used as the brand's identifier and filter value. |
| `displayName` | string | Human-readable label shown in the UI (brand filter, color legend). Derived from the slug if not otherwise configured. |
| `color` | string | A stable visual identifier (e.g. a hex value or palette index) so the calendar can distinguish this brand's items at a glance. Deterministically derived from `slug` so no separate config file is required. |

**Relationships**: A Brand has many Content Items and exactly one Manifest
(the file `content/<brand>/manifest.yaml`, containing many Manifest Entries).

## Content Item

A standalone markdown file under `content/<brand>/` — the canonical artifact
for one piece of social content (constitution Principle I).

| Field (frontmatter) | Type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Path relative to `content/`, e.g. `acme/2026-08-03-launch-teaser.md`. Self-describing; matches the file's own location. |
| `caption` | string | Yes | The post body/caption text. |
| `hashtags` | string[] | No (default `[]`) | Hashtags without enforced formatting beyond being strings. |
| `media` | string[] | No (default `[]`) | Media references (filenames, relative paths, or URLs) — displayed as identifying text, not rendered as previews in this version. |
| `platforms` | string[] | Yes (min 1) | Target platform(s), e.g. `["instagram", "linkedin"]`. |
| `status` | string | No | Informational only, human-editable context for someone reading the file directly. **Not authoritative** — the dashboard always reads/writes status via the brand's manifest instead (see [research.md](./research.md) Decision 3). |

**Identity & uniqueness**: `id` MUST be unique within the whole project
(enforced naturally by being a filesystem path). If the same `id` appears in
more than one manifest entry across brands, that is a duplicate-reference
edge case the dashboard MUST flag (spec Edge Cases).

**Validation rules**:
- `caption` and `platforms` (non-empty) are required for a file to be
  considered well-formed; a file failing validation is surfaced as broken
  rather than silently dropped.
- `id` must resolve to the file's own actual relative path; a mismatch is
  treated as a data-integrity issue to surface, not silently corrected.

## Manifest Entry

One record inside a brand's single `manifest.yaml`, describing the lifecycle
state of one Content Item or Repost (constitution Principle III).

| Field | Type | Required | Notes |
|---|---|---|---|
| `contentId` | string | Yes | References a Content Item's `id`. This is the join key between manifest and markdown file. |
| `status` | enum: `draft` \| `scheduled` \| `posted` | Yes | Authoritative lifecycle state. Defaults to `draft` for a newly tracked item. |
| `scheduledAt` | string (ISO 8601 date-time, no zone offset baked in) | Only when `status` is `scheduled` or `posted` | The explicit date/time this item is/was scheduled for. |
| `timezone` | string (IANA zone name, e.g. `America/New_York`) | Only when `status` is `scheduled` or `posted` | Paired with `scheduledAt`; required together per spec FR-006/FR-007. |
| `repostOf` | string (Content Item `id`) | Only for reposts | Present only on entries created via the repost flow. When present, this entry is a Repost (see below) and its own `contentId` still points to the *original* item's file — no new markdown file or duplicated caption/body is created. |

**Lifecycle / state transitions** (spec FR-006–FR-009, FR-012–FR-015):

```text
draft ──(supply date + timezone)──> scheduled ──> posted
```

- `draft → scheduled`: requires `scheduledAt` and `timezone` to be supplied
  in the same action; rejected otherwise (FR-006, FR-007).
- `scheduled → posted`: no additional data required (FR-008).
- No other transition is permitted (e.g. `draft → posted` directly, or any
  backward move) — forward-only per spec Assumptions.
- Creating a repost is a distinct action, not a transition of the existing
  entry: it appends a **new** Manifest Entry with its own `contentId`
  (pointing back to the original item's file), its own required
  `scheduledAt`/`timezone`, `repostOf` set to the original item's `id`, and
  `status` starting at `draft`. That new entry then follows the same
  `draft → scheduled → posted` lifecycle independently (FR-015).

**Write semantics** (spec FR-010a, clarification Q3): status-transition
writes are read-modify-write against a single target entry, identified by
`contentId` (and, for reposts, further disambiguated since multiple entries
can share a `contentId` — see Repost below). If the manifest no longer
contains the targeted entry at write time, the write fails with a clear
error rather than partially applying.

**Identity note**: because a repost entry has the *same* `contentId` as its
original (they reference the same underlying file), Manifest Entries need an
entry-level identifier distinct from `contentId` for the read-modify-write
target lookup and for the UI to address a specific entry (original vs. one
of its reposts). This is `entryId` — a manifest-scoped identifier
(e.g. a slug combining `contentId` + an incrementing suffix, or a short
random token generated at entry-creation time and stored in the entry
itself).

| Field (addendum) | Type | Required | Notes |
|---|---|---|---|
| `entryId` | string | Yes | Unique within the brand's manifest. Generated when the entry is first added (draft creation or repost creation). This — not `contentId` — is what status-transition writes target. |

## Repost

Not a separate storage construct — a Repost *is* a Manifest Entry with
`repostOf` set (see above). Modeled separately here only to make the
relationship explicit for the UI and for validation:

| Field | Type | Notes |
|---|---|---|
| `entryId` | string | The repost's own manifest entry identifier. |
| `repostOf` | string | The original Content Item's `id`. Required, immutable once set. |
| Lifecycle fields | — | Same `status` / `scheduledAt` / `timezone` fields as any Manifest Entry, tracked independently of the original. |

**Validation rules**:
- `repostOf` MUST reference a `contentId` that exists in some brand's
  manifest as a non-repost entry with `status = posted` at the moment the
  repost is created (spec FR-012).
- A repost's `scheduledAt`/`timezone` MUST be supplied independently and
  MUST NOT be copied or inferred from the original's schedule (FR-013).
- If the file at `repostOf` later becomes unreadable/missing, the repost
  entry still displays, with the reference flagged broken (spec Edge Cases)
  — the repost's own lifecycle state is unaffected.

## Derived / read-only concepts (no new storage)

- **Untracked content file**: a markdown file under `content/<brand>/` with
  no Manifest Entry whose `contentId` matches its `id`. Surfaced by the
  dashboard (FR-021) but does not require any new schema — it's the absence
  of a manifest entry for an existing file.
- **Broken reference**: a Manifest Entry whose `contentId` (or, for a
  repost, `repostOf`) does not resolve to an existing, valid Content Item
  file. Surfaced by the dashboard (FR-020) rather than hidden.
- **Duplicate reference**: the same `contentId` appearing as a non-repost
  entry in more than one manifest (across brands) or more than once as a
  non-repost entry within the same manifest. Flagged rather than silently
  resolved (spec Edge Cases).
