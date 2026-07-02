# Implementation Plan: Dashboard Visual Redesign

**Branch**: `002-dashboard-visual-redesign` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-dashboard-visual-redesign/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A presentation-only redesign of the existing scheduling dashboard
(001-scheduling-dashboard): adopt Tailwind CSS v4 for a consistent type
scale, spacing, elevation, and responsive behavior; introduce a small shared
`components/ui/` primitives layer (Card, StatusChip, RepostBadge, BrandTag,
BrandFilterPill, SegmentedControl, WarningBanner) so brand color, status
color, card styling, and control styling each have exactly one definition
reused everywhere; and restyle the calendar, navigation, filters, and
warning/unscheduled areas per the clarified clean/minimal, light-only,
no-custom-animation aesthetic direction. No data, manifest, or scheduling
logic changes — every existing interactive behavior from 001 must keep
working identically (FR-017/SC-003).

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (unchanged from 001)

**Primary Dependencies**: Next.js 15 (App Router, unchanged), React 19
(unchanged), **+ new:** `tailwindcss` v4, `@tailwindcss/postcss` v4,
`lucide-react` (icons)

**Storage**: Unchanged — local filesystem `content/<brand>/*.md` +
`manifest.yaml`, untouched by this feature

**Testing**: Unchanged automated gates (`tsc --noEmit`, `eslint`); no new
automated test tooling (research.md Decision 8) — verification is manual,
multi-viewport review per [quickstart.md](./quickstart.md)

**Target Platform**: Unchanged — local Node.js server (localhost),
cross-platform dev machine

**Project Type**: Unchanged — single full-stack Next.js web application

**Performance Goals**: No regression to page load; Tailwind compiles to
static CSS at build time, adding no runtime styling cost

**Constraints**: Zero functional regression (FR-017/SC-003) — this feature
changes appearance only; no new data fields, manifest schema changes, or
scheduling logic changes (spec non-goals); light theme only, no custom
animation (spec Clarifications)

**Scale/Scope**: Unchanged from 001 — single concurrent user, single-digit
to low-tens of brands

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Section | Check | Result |
|---|---|---|
| I. Markdown-as-Source-of-Truth | No content file changes; frontmatter untouched. | PASS |
| II. Brand-Partitioned File Structure | No change to `content/<brand>/` structure. | PASS |
| III. Single Manifest, Derive Don't Duplicate | No manifest schema or field changes; brand accent color remains derived from the existing centralized `list-brands.ts` logic (research.md Decision 7 only expands the color pool, not the mechanism or any persisted data). | PASS |
| IV. Next.js as Thin Scheduling Layer | Tailwind is a build-time CSS compiler, not a runtime data/cache layer; every read still hits the filesystem fresh per request, unchanged from 001. | PASS |
| V. Explicit Date-Driven Scheduling | No scheduling logic changes; today-highlighting and weekend styling are presentation-only and don't affect which items are "in range" (spec Assumptions). | PASS |
| Content & Data Standards | No new fields introduced anywhere. | PASS |
| Development Workflow & Quality Gates | No new cache/store introduced; this plan documents zero data-layer impact. | PASS |

No violations — Complexity Tracking is not needed for this feature.

## Project Structure

### Documentation (this feature)

```text
specs/002-dashboard-visual-redesign/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command) — design tokens, not data entities
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── ui-components.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# New/changed files for this feature — everything else from 001 is unchanged.

postcss.config.mjs        # NEW — registers @tailwindcss/postcss
app/globals.css           # CHANGED — @import "tailwindcss"; + status/warning color CSS variables

components/ui/            # NEW shared presentational primitives (contracts/ui-components.md)
├── Card.tsx
├── StatusChip.tsx
├── RepostBadge.tsx
├── BrandTag.tsx
├── BrandFilterPill.tsx
├── SegmentedControl.tsx
└── WarningBanner.tsx

lib/theme/
└── status-colors.ts      # NEW — fixed draft/scheduled/posted/repost color mapping (research.md Decision 3)

lib/schedule/list-brands.ts   # CHANGED — palette array expanded (research.md Decision 7); hashing logic unchanged

app/(dashboard)/
├── page.tsx                          # CHANGED — restyled with Tailwind + SegmentedControl/BrandFilterPill, responsive grid
├── components/
│   ├── CalendarGrid.tsx               # CHANGED — Tailwind layout, today/weekend/full-vs-empty day states, uses Card/BrandTag/StatusChip
│   ├── UnscheduledBucket.tsx          # CHANGED — muted Card variant
│   ├── DataIntegrityNotices.tsx       # CHANGED — uses WarningBanner
│   └── BrandFilter.tsx                # CHANGED — uses BrandFilterPill
└── items/[entryId]/
    ├── ItemDetailView.tsx             # CHANGED — Tailwind layout, StatusChip/RepostBadge, type scale
    ├── ScheduleForm.tsx               # CHANGED — Tailwind form styling only, unchanged Server Action wiring
    └── RepostForm.tsx                 # CHANGED — Tailwind form styling only, unchanged Server Action wiring

package.json               # CHANGED — adds tailwindcss, @tailwindcss/postcss, lucide-react
```

**Structure Decision**: No structural/routing changes — every existing page
and Server Action from 001 stays where it is. This feature adds one new
layer (`components/ui/`) and one new theme module (`lib/theme/`), then
restyles existing components in place to consume them. `postcss.config.mjs`
and `app/globals.css` wire up Tailwind at the project root, matching
Next.js's standard Tailwind integration.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations were found — this section is intentionally empty.
