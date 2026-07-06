# Implementation Plan: Content Generation Entry Point

**Branch**: `005-content-generation-entry` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-content-generation-entry/spec.md`

## Summary

Add a "Content Generation" control to the Scheduling Dashboard home page header/toolbar and a
new `/content-generation` route that renders an on-brand placeholder ("coming soon") page with a
"← Back to dashboard" link. The control uses `next/link` for client-side navigation, styled to
match the existing toolbar controls. The destination page reuses the item detail page's
back-navigation header pattern and the shared global theme (non-white `slate-200` body
background, consistent typography). No forms, data entry, AI calls, or manifest/content changes —
this is purely the navigation entry point and page shell for a future content-creation feature.

## Technical Context

**Language/Version**: TypeScript 5.9 (React 19.2)

**Primary Dependencies**: Next.js 15.5 (App Router), Tailwind CSS 4.3, `next/link` for
client-side navigation

**Storage**: N/A — no content files, manifest, or persisted data are read or written by this
feature

**Testing**: Vitest (unit/component), Playwright (e2e) — existing project harnesses

**Target Platform**: Web (server-rendered React via Next.js App Router)

**Project Type**: Web application (single Next.js app)

**Performance Goals**: Client-side route transition with no full page reload; standard web
navigation responsiveness

**Constraints**: Reuse existing design system / components; no one-off layout; must render
correctly on direct visit/refresh (App Router page is server-rendered by default)

**Scale/Scope**: 1 new route/page, 1 new toolbar control (or reused styled `Link`); no new data
model, no new dependencies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution's five principles all govern content files, the per-brand manifest, and the
scheduling layer's relationship to them. This feature touches none of those:

- **I. Markdown-as-Source-of-Truth**: ✅ N/A — no content is read or written. No new content
  store introduced.
- **II. Brand-Partitioned File Structure**: ✅ N/A — no content files created or moved.
- **III. Single Manifest for Post & Repost State**: ✅ N/A — no manifest reads or writes; no
  lifecycle state introduced or duplicated.
- **IV. Next.js as a Thin Scheduling Layer**: ✅ Upheld — the app remains a thin presentation
  layer. The new page is a static shell that adds no second content store and no cache.
- **V. Explicit Date-Driven Scheduling**: ✅ N/A — no scheduling data involved.

**Result**: PASS. No violations, no Complexity Tracking entries required. (Re-checked post-design
below.)

## Project Structure

### Documentation (this feature)

```text
specs/005-content-generation-entry/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output — UI navigation contract
│   └── navigation.md
├── checklists/
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── (dashboard)/
│   ├── page.tsx                       # MODIFY: add "Content Generation" control to header toolbar
│   ├── content-generation/
│   │   └── page.tsx                   # NEW: /content-generation placeholder page (route group does
│   │                                  #      not affect URL; sits alongside item detail for pattern reuse)
│   └── items/[entryId]/
│       └── page.tsx                   # REFERENCE: back-navigation header pattern to reuse
│
components/
└── ui/
    ├── SegmentedControl.tsx           # REFERENCE: existing toolbar control styling
    └── BrandFilterPill.tsx            # REFERENCE: existing pill styling
```

**Structure Decision**: Single Next.js App Router web application. The new page lives at
`app/(dashboard)/content-generation/page.tsx` so it resolves to the `/content-generation` URL
(route groups do not contribute to the path) and sits alongside `items/[entryId]/page.tsx`,
whose back-navigation header pattern it reuses. The home-page control is added to the existing
header toolbar in `app/(dashboard)/page.tsx`, reusing the established `next/link`-based control
styling rather than introducing a new component or a bare button.

## Complexity Tracking

> No Constitution Check violations. Section intentionally empty.
