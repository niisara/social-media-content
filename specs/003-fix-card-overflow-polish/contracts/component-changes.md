# Contract: Component Behavior Changes

**Feature**: [spec.md](../spec.md) | **Design deltas**: [data-model.md](../data-model.md)

This feature modifies the rendering contracts of existing components from
[002's ui-components contract](../../002-dashboard-visual-redesign/contracts/ui-components.md).
No component props change — every change below is internal layout/style
behavior. No new data flows, Server Actions, or routes.

## `Card` (components/ui/Card.tsx)

- **Adds**: content containment — the card clips its own content
  (`overflow-hidden`); no descendant may paint outside the card boundary
  (FR-001).
- **Unchanged**: `brandColor?`, `muted?`, `className?` props; left-border
  brand accent; radius/shadow family.

## `BrandTag` (components/ui/BrandTag.tsx)

- **Adds**: defined max width with ellipsis truncation on the name text
  (FR-003); the color dot never shrinks. Applies everywhere the tag renders
  (day cards, unscheduled cards, item detail).
- **Unchanged**: `brand: { displayName, color }` prop shape.

## `StatusChip` (components/ui/StatusChip.tsx)

- **Adds**: `whitespace-nowrap` and non-shrink behavior — a chip keeps its
  padding and full label at all times; when it doesn't fit beside the brand
  label it moves to the next line via the parent row's wrapping (FR-004).
- **Unchanged**: `status` prop; fixed color mapping from
  `lib/theme/status-colors.ts`.

## Item-card header row (CalendarGrid.tsx, UnscheduledBucket.tsx)

- **Changes**: from non-wrapping `flex items-center justify-between` to a
  wrap-capable row: `flex flex-wrap`, BrandTag wrapper gets `min-w-0`,
  StatusChip gets `shrink-0` (FR-002). Same DOM order (brand first, status
  second).

## Day cell (CalendarGrid.tsx)

- **Changes**:
  - Surface: white + rounded + `shadow-sm` (same family as Card, FR-008);
    weekend surface `slate-50`; today keeps a strong ring; empty cells use a
    quieter treatment with muted "No content".
  - Sizing: equal-width tracks (unchanged `grid-cols-7`) + uniform row
    height via default grid stretch + shared `min-h` (FR-005).
  - Date header row is wrap-safe so the Today badge cannot overflow narrow
    cells (Edge Cases).
- **Unchanged**: item ordering, links to detail pages, all data displayed.

## Caption text (CalendarGrid.tsx, UnscheduledBucket.tsx)

- **Changes**: uniform `line-clamp-2` (already present — now contractually
  required to stay identical across both surfaces) plus `break-words` so
  unbroken strings wrap (FR-006).

## Dashboard page (app/(dashboard)/page.tsx)

- **Changes**:
  - Toolbar: date-nav SegmentedControl, week/month SegmentedControl,
    date-range meta line, and BrandFilter move inside one white `rounded-xl`
    `shadow-sm` container (FR-010).
  - Page header becomes the dominant text tier (FR-009).
  - Muted text sitting directly on the page background moves to `gray-600`+
    (FR-013, research Decision 2).
- **Unchanged**: all URL/searchParams behavior, all links, data fetching.

## Global background (app/globals.css)

- **Changes**: body background token from `gray-50` to `slate-200`
  (FR-007). Applied once in the base layer — no per-screen overrides.
- **Unchanged**: Tailwind import structure; the rule that components never
  hardcode raw hex values (brand `--brand-color` CSS-variable pattern stays).

## Explicitly NOT changed

- All `lib/` modules (manifest, content, schedule, timezone, theme mapping
  values for chips), Server Actions, routes, fixtures, and data files.
- `lib/theme/status-colors.ts` chip color classes (chips sit on their own
  tinted backgrounds; unaffected by the page background change).
