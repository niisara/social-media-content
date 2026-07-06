# Phase 0 Research: Content Generation Entry Point

**Feature**: 005-content-generation-entry | **Date**: 2026-07-06

The spec had no `[NEEDS CLARIFICATION]` markers and clarification found no critical ambiguities.
The remaining decisions are implementation-pattern choices, resolved below against the existing
codebase so the new code matches established conventions.

## Decision 1 — Route location & URL

- **Decision**: Create the page at `app/(dashboard)/content-generation/page.tsx`, resolving to
  the URL `/content-generation`.
- **Rationale**: Next.js App Router route groups (parenthesized folders like `(dashboard)`) do
  not contribute path segments, so this yields exactly `/content-generation` while keeping the
  file next to `items/[entryId]/page.tsx`, whose pattern it reuses. The `/content-generation`
  path matches the example in the spec/feature request.
- **Alternatives considered**: `app/content-generation/page.tsx` (top-level) — same URL, but
  separates it from the sibling page whose layout pattern it reuses, so rejected for cohesion.

## Decision 2 — Client-side navigation mechanism

- **Decision**: Use the `next/link` `<Link>` component for the home-page control (same as
  `SegmentedControl` and `BrandFilterPill`).
- **Rationale**: `<Link>` performs App Router client-side navigation with no full page reload
  (satisfies FR-003), and it is already the established navigation primitive across the dashboard
  controls and the item-detail back link.
- **Alternatives considered**: `useRouter().push` in a client component — unnecessary; would
  force a `"use client"` boundary for what is a plain link. Plain `<a>` — triggers a full reload,
  violating FR-003. Both rejected.

## Decision 3 — Control styling on the home page

- **Decision**: Render the control as a styled `<Link>` matching the existing dark primary pill
  treatment already used in the app (e.g. the `bg-slate-950 ... text-white rounded-2xl`
  action-button style), placed inside the header toolbar row alongside the two
  `SegmentedControl` groups.
- **Rationale**: FR-002 requires it to match established button/pill styling and not look bare.
  A dark, filled pill reads as the primary call-to-action of the toolbar (this is the gateway to
  a new workflow) while staying within the existing token palette (`slate` scale, rounded pill
  radii, `text-sm font-medium/semibold`, `transition`). No new design token is introduced.
- **Alternatives considered**: Adding a brand-new generic `Button` component — over-engineering
  for one control; rejected in favor of reusing existing utility-class patterns. A neutral
  outlined pill like `BrandFilterPill` — acceptable but reads as a filter/toggle rather than a
  navigation CTA; the filled treatment communicates "go somewhere new" better.

## Decision 4 — Placeholder page layout pattern

- **Decision**: Reuse the item detail page's shell: a `<main className="mx-auto max-w-4xl p-6">`
  wrapper with the same rounded back-navigation bar containing a `← Back to dashboard` `<Link>`
  (`href="/"`) and a small uppercase context label, followed by a themed card containing the
  "Content Generation" title and a short "coming soon" message.
- **Rationale**: FR-006 and FR-007 require reusing the item detail back-navigation pattern and
  avoiding a one-off layout. The global theme (non-white `slate-200` body background from
  `app/globals.css`, consistent typography) applies automatically via the root layout, satisfying
  FR-004.
- **Alternatives considered**: Extracting a shared `<BackNavBar>`/`<PageShell>` component now —
  deferred; only two usages exist and the future content-generation feature will reshape this
  page, so premature extraction risks churn. Inlining the same markup keeps the change minimal
  and reversible. (Noted as a future refactor opportunity, not required by this feature.)

## Decision 5 — Server vs. client component for the new page

- **Decision**: Keep the new page as a default server component (no `"use client"`).
- **Rationale**: The page is fully static (title, message, back link) with no interactivity or
  state. Server component is the App Router default and renders correctly on direct visit/refresh
  (edge case in spec). No client-side JavaScript is needed.
- **Alternatives considered**: Client component — unnecessary; adds a client bundle for zero
  interactivity. Rejected.

## Outcome

All implementation-pattern unknowns resolved. No new dependencies, no data model, no external
integrations. Ready for Phase 1 design artifacts.
