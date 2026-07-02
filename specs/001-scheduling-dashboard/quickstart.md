# Quickstart: Scheduling Dashboard

**Feature**: [spec.md](./spec.md) | **Contracts**: [contracts/scheduling-functions.md](./contracts/scheduling-functions.md)

This is a validation guide for proving the feature works end-to-end, mapped
directly to the spec's user stories. It assumes the Next.js app and its
dependencies (see [research.md](./research.md)) are already implemented.

## Prerequisites

- Node.js 20 LTS installed
- Project dependencies installed (`npm install`)
- No existing `content/` directory is required — the dashboard must work
  starting from an empty or partially-populated one (spec Edge Cases:
  untracked files, empty brands)

## Setup: seed sample content

Create two brands with a handful of items so every scenario below has data
to exercise:

```text
content/
├── acme/
│   ├── manifest.yaml
│   ├── 2026-07-05-launch-teaser.md      (manifest entry: scheduled, this week)
│   ├── 2026-07-10-behind-the-scenes.md  (manifest entry: draft, unscheduled)
│   ├── 2026-06-20-product-shot.md       (manifest entry: posted, past)
│   └── 2026-07-12-untracked-post.md     (no manifest entry — untracked)
└── globex/
    ├── manifest.yaml
    └── 2026-07-06-weekly-update.md      (manifest entry: scheduled, this week)
```

Each `.md` file needs frontmatter matching [data-model.md](./data-model.md)
(`id`, `caption`, `hashtags`, `media`, `platforms`). Each `manifest.yaml`
needs one entry per file it tracks, matching the Manifest Entry shape. Note
the distinction the dashboard draws between two different "no schedule yet"
cases: `2026-07-10-behind-the-scenes.md` has a manifest entry with
`status: draft` and no date (shows in the **unscheduled bucket**, FR-003),
while `2026-07-12-untracked-post.md` has no manifest entry at all (shows as
**untracked content**, FR-021) — only an existing draft manifest entry can
be moved to "scheduled"; an untracked file has nothing to transition yet.

## Run

```bash
npm run dev
```

Open the dashboard in a browser at the local dev URL.

## Validation scenarios

### 1. See everything scheduled across brands (User Story 1)

- Confirm `2026-07-05-launch-teaser` (acme) and `2026-07-06-weekly-update`
  (globex) both appear on their respective dates in the current week, each
  visibly tagged/colored by brand.
- Confirm `2026-07-10-behind-the-scenes` does **not** appear on the calendar
  but does appear in the unscheduled bucket (it's a draft manifest entry
  with no date, FR-003).
- Confirm `2026-07-12-untracked-post` does **not** appear on the calendar or
  in the unscheduled bucket, but does appear flagged as **untracked
  content** somewhere visible (FR-021).
- Navigate to the following week, then back to the previous week; confirm
  the visible items change to match each range and the current week's items
  reappear when you return (FR-001a).

### 2. Drill into a single item's details (User Story 2)

- Click `2026-07-05-launch-teaser`. Confirm caption, hashtags, media
  references, and platforms match the `.md` file's frontmatter exactly, and
  status reads "scheduled" with its date/timezone.
- Edit the `.md` file's caption directly on disk, reload the detail view,
  and confirm the new caption appears without restarting the app (FR-005a —
  proves there's no caching layer to invalidate).

### 3. Move an item through its lifecycle (User Story 3)

- Open `2026-07-10-behind-the-scenes` (draft manifest entry, unscheduled).
  Attempt to submit the "Mark as Scheduled" form without filling in the date
  or timezone — confirm the browser/server rejects it and identifies what's
  missing (FR-007).
- Supply a date and timezone and confirm. Check `content/acme/manifest.yaml`
  on disk: this entry now has `status: scheduled` and the supplied
  date/timezone (FR-010).
- Reload the dashboard; confirm the item now appears on its new scheduled
  date instead of the unscheduled bucket.
- Mark the item "posted". Check the manifest again: `status: posted`
  (FR-008, SC-003).
- Confirm there is no control anywhere in the UI that lets a `draft` item
  jump straight to `posted` — only "Mark as Scheduled" (from draft) and
  "Mark as Posted" (from scheduled) are ever offered (FR-009).

### 4. Repost a previously posted item (User Story 4)

- Open `2026-06-20-product-shot` (status: posted). Initiate a repost.
- Confirm you're required to supply a new, independent date/timezone before
  the repost can be created (FR-013).
- Confirm afterward, in `content/acme/manifest.yaml`, a new entry exists
  with `repostOf: acme/2026-06-20-product-shot.md`, its own `entryId`, its
  own `scheduledAt`/`timezone`, `status: scheduled`, and **no** caption/body
  fields of its own (FR-014, SC-004).
- Confirm the repost appears as its own item on the calendar under its new
  date, visually distinguishable from the original.
- Mark the repost "posted" independently and confirm the original item's
  manifest entry is unchanged (FR-015).

### 5. Filter the dashboard by brand (User Story 5)

- Apply the "acme" brand filter. Confirm only acme items appear, across
  both the calendar and the unscheduled bucket (FR-016).
- Clear the filter. Confirm globex's `2026-07-06-weekly-update` reappears
  (FR-017).

### 6. Broken references surface, not hide

- Delete `content/acme/2026-06-20-product-shot.md` from disk while its
  manifest entry (and any repost referencing it) still exists.
- Reload the dashboard. Confirm the entry (and its repost, if created)
  still appear but are visibly flagged as having a broken/missing
  reference, rather than disappearing or crashing the view (FR-020, Edge
  Cases).

## Success check

If all six scenarios pass, the feature satisfies SC-001 through SC-006 in
[spec.md](./spec.md).
