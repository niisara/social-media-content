# Implementation Plan: Card Overflow Fix & UI Polish

**Branch**: `003-fix-card-overflow-polish` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-fix-card-overflow-polish/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Fix the confirmed card-clipping bug (non-wrapping brand-label + status-chip
flex row with unshrinkable children — verified at `CalendarGrid.tsx:75` and
`UnscheduledBucket.tsx:29`) by making the header row wrap-capable, truncating
brand labels at a max width, marking chips non-shrinkable, and adding
`overflow-hidden` containment to `Card`. Simultaneously finish the visual
pass 002 left incomplete: replace the reads-as-white `gray-50` page
background with an unmistakable cool light gray (`slate-200`), move day cells
onto the same white-surface/rounded/shadow family as item cards, enclose all
controls in one elevated toolbar container, and bump muted-on-background text
to AA-passing tones. Completion is gated on rendered-output verification
(programmatic overflow + background checks at 375px and ~768px) per FR-012.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (unchanged)

**Primary Dependencies**: Next.js 15, React 19, Tailwind CSS v4,
`lucide-react` — all already installed; **no new dependencies**

**Storage**: Unchanged and untouched — `content/<brand>/` markdown +
manifests

**Testing**: `tsc --noEmit` + `eslint` gates (unchanged), plus this
feature's own FR-012 verification: programmatic overflow/background checks
against the running dev server at 375px and ~768px viewports
([research.md](./research.md) Decision 6)

**Target Platform**: Local Next.js dev server, evergreen desktop + mobile
browsers, viewports ≥375px

**Project Type**: Single Next.js web application (unchanged)

**Performance Goals**: No change — static CSS classes only; zero runtime
cost added

**Constraints**: Zero functional regression (FR-011); no new data fields or
manifest changes (non-goals); all colors stay on the Tailwind token scale /
existing `--brand-color` variable pattern — no new raw hex values in
components; light theme only (dark mode still out of scope per 002)

**Scale/Scope**: 6 component/page files restyled, 1 global stylesheet value
change; no new files except this feature's docs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Section | Check | Result |
|---|---|---|
| I. Markdown-as-Source-of-Truth | No content file or frontmatter changes (temporary long-brand-name fixture used during validation is added and removed within the quickstart, not shipped). | PASS |
| II. Brand-Partitioned File Structure | Untouched. | PASS |
| III. Single Manifest, Derive Don't Duplicate | Untouched — no manifest reads/writes change. | PASS |
| IV. Next.js as Thin Scheduling Layer | Pure presentation-layer change; no cache, store, or data path introduced. | PASS |
| V. Explicit Date-Driven Scheduling | Untouched — cell styling changes don't affect range logic. | PASS |
| Content & Data Standards | No schema surface touched. | PASS |
| Development Workflow & Quality Gates | No new derived store; FR-012 adds a *stricter* completion gate than the constitution requires. | PASS |

No violations — Complexity Tracking is not needed for this feature.

## Project Structure

### Documentation (this feature)

```text
specs/003-fix-card-overflow-polish/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output — design-token deltas & layout rules, no data entities
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── component-changes.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Changed files only — everything else is untouched.

app/globals.css                                   # CHANGED — body background gray-50 → slate-200
components/ui/Card.tsx                            # CHANGED — overflow-hidden containment
components/ui/BrandTag.tsx                        # CHANGED — max-width + truncate on label text
components/ui/StatusChip.tsx                      # CHANGED — whitespace-nowrap, shrink-0
app/(dashboard)/page.tsx                          # CHANGED — enclosed toolbar container; header tier; muted-text tone bump
app/(dashboard)/components/CalendarGrid.tsx       # CHANGED — wrap-capable header row; day-cell surface/min-h/wrap-safe date row; break-words
app/(dashboard)/components/UnscheduledBucket.tsx  # CHANGED — wrap-capable header row; break-words; muted heading tone
app/(dashboard)/items/[entryId]/ItemDetailView.tsx # CHANGED (minor) — header row wrap safety for long brand names
```

**Structure Decision**: No new components, routes, or modules. The fix
lands inside the three existing `components/ui/` primitives it concerns
(Card/BrandTag/StatusChip — keeping "one definition reused everywhere"
intact) plus the two card-rendering surfaces and the dashboard page. The
toolbar is a page-level composition in `page.tsx`, not a new primitive
([research.md](./research.md) Decision 4).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations were found — this section is intentionally empty.
