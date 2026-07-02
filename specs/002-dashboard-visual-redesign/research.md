# Research: Dashboard Visual Redesign

**Feature**: [spec.md](./spec.md) | **Date**: 2026-07-02

This feature restyles the existing dashboard built in
[001-scheduling-dashboard](../001-scheduling-dashboard/plan.md). No backend,
data, or routing decisions are revisited here — only the presentation layer.

## Decision 1: Styling approach — Tailwind CSS v4

**Decision**: Adopt Tailwind CSS v4 (via `@tailwindcss/postcss`) as the
project's styling system, replacing the ad hoc inline `style={{}}` objects
used throughout `001-scheduling-dashboard`'s components.

**Rationale**: The spec calls for a real type scale, a consistent spacing
scale, responsive behavior, and conventional hover/focus states (FR-010,
FR-011, FR-016, FR-020) — exactly what a utility-first framework's design
tokens and responsive/state variants (`sm:`, `md:`, `hover:`, `focus:`) are
built for. Tailwind v4 compiles to static CSS with no runtime JS, so it
works cleanly with the existing React Server Components (App Router pages
currently have no `"use client"` boundary; introducing a CSS-in-JS runtime
library would force one).

**Alternatives considered**:
- **CSS Modules**: viable, but every spacing/type-scale/breakpoint decision
  would need to be hand-authored and kept consistent by convention alone —
  more manual effort for the same outcome Tailwind gives out of the box.
- **styled-components / emotion**: rejected — runtime CSS-in-JS forces
  `"use client"` on components that are currently server components purely
  for layout/display, increasing client bundle size for no behavioral need.
- **Keep hand-written inline styles, just expand them**: rejected — this is
  exactly the "no real type scale, inconsistent spacing" problem the spec
  is asking to fix; scaling it up would still leave every component
  re-deciding sizes independently.

## Decision 2: Dynamic per-brand color with Tailwind

**Decision**: Keep brand accent-color *assignment* logic exactly as built in
001 (`lib/schedule/list-brands.ts`'s deterministic slug→palette hash) — it
already satisfies "one central, reusable definition" (FR-002). Apply the
resulting color at render time via an inline CSS custom property
(`style={{ "--brand-color": brand.color }}`) on each item's outer element,
then reference `var(--brand-color)` from Tailwind utility classes using
arbitrary-value syntax, e.g. `border-l-[var(--brand-color)]`.

**Rationale**: Brand colors are computed at request time from a slug that
isn't known at build time, so they can't be literal Tailwind utility classes
(Tailwind needs to see the class name as source text to generate it).
Arbitrary-value utilities referencing a CSS variable are static source text
("`border-l-[var(--brand-color)]`") that Tailwind can generate at build
time, while the actual color is supplied dynamically per element — this is
a standard, well-supported Tailwind pattern for exactly this situation.

**Alternatives considered**:
- **Inline `style={{ borderColor: brand.color }}`**: simpler, but mixes
  inline styles back into otherwise-Tailwind components inconsistently;
  the CSS-variable approach keeps every element using the same
  Tailwind-class-based styling method.
- **Generate a Tailwind safelist per brand at build time**: rejected —
  brands are data (directories under `content/`), not known at build time;
  a safelist would need regenerating whenever a brand folder is added.

## Decision 3: Fixed semantic colors for status and repost indicator

**Decision**: Status chip colors (draft/scheduled/posted) and the repost
indicator color are fixed, non-brand-dependent Tailwind color tokens —
draft = gray, scheduled = blue, posted = green, repost badge = purple, per
the spec's explicit color coding — defined once in a shared
`lib/theme/status-colors.ts` module and consumed by every component that
renders a status chip or repost badge.

**Rationale**: These are semantic, universal signals (same meaning
regardless of brand), so they must stay visually consistent across brands —
unlike brand color, which is deliberately different per brand. Centralizing
the mapping in one module prevents the same "hand-picked per component"
problem FR-002 already fixed for brand color from recurring for status
color.

**Alternatives considered**: none seriously considered — the spec pins the
exact 4-color mapping (research only needed to decide *where* it's defined
once, not *what* the colors mean).

## Decision 4: Icon usage — lucide-react

**Decision**: Add `lucide-react` for the small set of icons the redesign
needs (a warning icon for the untracked-content banner per FR-014, a
repost-indicator icon per FR-005).

**Rationale**: Tree-shakeable (only imported icons are bundled), a common,
well-maintained pairing with Tailwind-based Next.js projects, and avoids
hand-maintaining inline SVG markup for multiple icons.

**Alternatives considered**:
- **Hand-written inline SVGs**: avoids a dependency but means maintaining
  raw SVG path data directly in component files for every icon needed.
- **Emoji characters**: zero dependency cost, but rendering is
  platform/font-dependent and less visually consistent with a "polished
  product" aesthetic (Clarification: clean/minimal SaaS direction).

## Decision 5: Shared UI primitives layer

**Decision**: Introduce a small `components/ui/` layer of presentational
primitives — `Card`, `StatusChip`, `RepostBadge`, `BrandFilterPill`,
`SegmentedControl`, `WarningBanner` — used by both the dashboard and item
detail pages, replacing the bespoke inline-styled markup written per
component in 001.

**Rationale**: Several spec requirements (FR-002, FR-004, FR-006, FR-012,
FR-013, FR-014) each demand one *consistent* treatment reused everywhere a
concept appears (brand color, status, cards, controls, warnings). A shared
primitives layer is the only way to guarantee that consistency structurally
rather than by convention/reviewer diligence.

**Alternatives considered**: Restyle each existing component
(`CalendarGrid`, `UnscheduledBucket`, `ItemDetailView`, etc.) independently
in place — rejected, since it reintroduces the risk of subtly diverging
treatments across components that the spec explicitly calls out as the
current problem (FR-002: "not hand-picked per component").

## Decision 6: Responsive week grid strategy

**Decision**: The week/calendar grid stacks to a single column below
Tailwind's `md` breakpoint (768px) and lays out as a 7-column grid at `md`
and above, using Tailwind's responsive grid utilities
(`grid-cols-1 md:grid-cols-7`).

**Rationale**: FR-016 allows either stacking or horizontal scrolling;
stacking is chosen because it requires no extra scroll-affordance UI and
keeps every day's content immediately visible via normal vertical scrolling,
which is the more common, lower-friction mobile pattern for a
single-column list of day cards.

**Alternatives considered**: Horizontal scroll container at all
viewport widths — rejected as the primary approach since it requires an
explicit scroll gesture to see the full week, and a scrolling calendar grid
is minor extra interaction cost the spec doesn't otherwise call for.

## Decision 7: Expanded brand color palette

**Decision**: Expand the existing deterministic hash→palette array in
`lib/schedule/list-brands.ts` from 10 to a larger set (~16) of visually
distinct, contrast-safe hex colors, keeping the exact same hashing
mechanism (no change to *how* a brand's color is chosen, only to the pool
it's chosen from).

**Rationale**: More distinct colors reduce the chance of two brands in the
same workspace landing on the same or a visually similar color by hash
collision, directly supporting FR-001/SC-001 ("instantly recognizable").
This is a presentation-only change to a literal array, not a data-model or
schema change (Assumptions: "configurable per brand" is satisfied by one
central definition — this remains that same central definition, just with
more entries).

**Alternatives considered**: Leave the 10-color palette as-is — acceptable
but a smaller pool increases collision likelihood for workspaces with
several brands.

## Decision 8: Verification approach

**Decision**: No new automated visual-regression tooling is introduced.
Verification is manual: run the dev server, inspect each redesigned view at
common desktop and mobile (~375px) viewport widths, and confirm every
existing interactive flow (FR-017/SC-003) still works. `tsc --noEmit` and
`eslint` remain the automated gates, unchanged from 001.

**Rationale**: This is a personal-scale tool (per 001's assumptions); adding
visual-regression infrastructure (e.g., screenshot-diffing) would be
disproportionate tooling investment for a one-person redesign pass, and
wasn't requested.

**Alternatives considered**: Automated visual regression (e.g., Playwright
screenshot comparison) — deferred as unnecessary scope for this feature.

## Summary of resolved Technical Context

| Item | Resolution |
|---|---|
| Styling system | Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/postcss`) |
| Dynamic brand color | CSS custom property (`--brand-color`) + Tailwind arbitrary-value utilities |
| Status/repost colors | Fixed semantic tokens in `lib/theme/status-colors.ts` |
| Icons | `lucide-react` |
| Component architecture | New `components/ui/` shared primitives layer |
| Responsive strategy | `grid-cols-1 md:grid-cols-7` (stack below `md`) |
| Brand palette | Expanded to ~16 deterministic, contrast-checked colors |
| Verification | Manual multi-viewport review + existing `tsc`/`eslint` gates |
