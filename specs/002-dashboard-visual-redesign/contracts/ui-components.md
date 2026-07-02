# Contract: Shared UI Primitives

**Feature**: [spec.md](../spec.md) | **Design tokens**: [data-model.md](../data-model.md)

This feature's "interface" is a small set of shared presentational
components (research.md Decision 5) that the dashboard and item-detail
pages consume, replacing the bespoke inline-styled markup from
[001-scheduling-dashboard](../../001-scheduling-dashboard/). None of these
introduce new data — every prop below maps to a field already produced by
001's `lib/schedule/*` functions.

All components are presentational only: no data fetching, no Server
Actions. They live in `components/ui/`.

## `Card`

Generic elevated container used for content items and, in a lower-emphasis
variant, the unscheduled bucket.

- **Props**: `brandColor?: string` (sets the `--brand-color` CSS variable
  and left-border accent, per research.md Decision 2), `muted?: boolean`
  (lower-emphasis variant for unscheduled items, FR-015), `children`.
- **Renders**: rounded corners, subtle shadow, comfortable padding
  (FR-006); `muted` reduces shadow/border prominence and desaturates
  brand-color emphasis without hiding it entirely.

## `StatusChip`

- **Props**: `status: "draft" | "scheduled" | "posted"`.
- **Renders**: a small colored, labeled chip using the fixed status color
  mapping (data-model.md, research.md Decision 3) — never accepts an
  arbitrary color, so status coloring can't drift from the canonical
  mapping (FR-004).

## `RepostBadge`

- **Props**: none beyond presence — rendered only when the caller knows the
  entry has `repostOf` set.
- **Renders**: a small purple indicator, shown alongside (never replacing)
  a `StatusChip` (FR-005).

## `BrandTag`

- **Props**: `brand: { slug: string; displayName: string; color: string }`
  (the existing `Brand` type from `lib/schedule/list-brands.ts`).
- **Renders**: brand name label with its accent color applied consistently
  (FR-001, FR-002) — the only place a brand's color-to-swatch mapping is
  rendered, so every consumer (calendar, unscheduled bucket, detail page)
  looks identical for the same brand.

## `BrandFilterPill`

- **Props**: `brand: Brand | "all"`, `active: boolean`, `href: string`.
- **Renders**: a selectable pill styled with the brand's own accent color;
  a clearly distinguished active vs. inactive visual state (FR-013). The
  `"all"` variant uses the neutral/text-primary color rather than a brand
  color.

## `SegmentedControl`

- **Props**: `options: { label: string; href: string; active: boolean }[]`.
- **Renders**: a grouped, bordered control set (used for the week/month
  toggle and the Previous/Today/Next navigation) with the active option
  visually distinguished from the rest (FR-012).

## `WarningBanner`

- **Props**: `icon?: ReactNode`, `title: string`, `children`.
- **Renders**: an amber/warning-colored banner with an icon (FR-014), used
  for the untracked-content notice. Visually distinct from `Card` — this is
  never used for normal scheduled content.

## Calendar day cell (extension of existing `CalendarGrid`)

Not a new component per se, but a contract on the existing calendar day
cell's visual states:

- **Inputs**: `date: string`, `isToday: boolean`, `isWeekend: boolean`,
  `items: CalendarItem[]` (unchanged shape from 001).
- **Renders**: today gets a distinct highlight regardless of content
  (FR-007); a day with `items.length > 0` renders `Card`s inside itself
  ("full" treatment, FR-008); an empty day renders a minimal placeholder
  state, not a blank box; weekend days get a subtly different background
  (FR-009).
