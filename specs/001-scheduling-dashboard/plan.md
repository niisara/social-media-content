# Implementation Plan: Scheduling Dashboard

**Branch**: `001-scheduling-dashboard` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-scheduling-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A single-user Next.js dashboard that reads content markdown files and
per-brand YAML manifests directly off disk to show everything scheduled
across brands on one calendar, lets the user drill into an item's frontmatter
detail, move it through `draft → scheduled → posted` (writing every
transition straight back to the manifest), and create reposts that reference
an original item's ID instead of duplicating its caption/body. No database,
no client-side content cache, and no publishing/analytics integration — the
markdown files and manifests remain the sole source of truth throughout, per
the project constitution.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS

**Primary Dependencies**: Next.js 15 (App Router, Server Actions), React 19,
`gray-matter` (frontmatter parsing), `yaml` (manifest read/write), `zod`
(schema validation), `luxon` (timezone-aware date handling)

**Storage**: Local filesystem only — `content/<brand>/*.md` content files and
one `content/<brand>/manifest.yaml` manifest per brand (see
[data-model.md](./data-model.md))

**Testing**: `vitest` for unit/integration tests of file-I/O and business
logic (frontmatter parsing, manifest read-modify-write, transition
validation, timezone-based range grouping); `playwright` for end-to-end
coverage of the five user-story flows

**Target Platform**: Local Node.js server (localhost), cross-platform dev
machine (Windows/macOS/Linux)

**Project Type**: Single full-stack Next.js web application — no separate
frontend/backend split, no external API service

**Performance Goals**: Current week's schedule renders in under 1 second at
personal scale (single-digit to low-tens of brands, low thousands of content
items total); not a high-throughput or multi-tenant system

**Constraints**: No caching of content or manifest data between requests —
every page load/action reads fresh from disk (spec FR-005a); "what's
scheduled for date X" must be answerable from manifest data alone, without
opening content files (FR-019); manifest writes are read-modify-write against
a single target entry and must fail clearly (not partially apply) if that
entry is gone by write time (FR-010a)

**Scale/Scope**: Single concurrent user; no authentication; five user-facing
capabilities (calendar/unscheduled view, detail view, status transitions,
repost flow, brand filter) as scoped in [spec.md](./spec.md)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Section | Check | Result |
|---|---|---|
| I. Markdown-as-Source-of-Truth | Content items are standalone `.md` files with YAML frontmatter (caption, hashtags, media, platforms, informational status); dashboard reads them live (FR-005, FR-005a), never persists a second copy of caption/body (Decision 1 in research.md rules out any DB). | PASS |
| II. Brand-Partitioned File Structure | One `content/<brand>/` folder per brand, one manifest per brand; no file or manifest entry crosses brands; reposts stay within the original's brand (contracts: `createRepost`). | PASS |
| III. Single Manifest, Derive Don't Duplicate | One `manifest.yaml` per brand is authoritative for status/schedule (data-model.md, research.md Decision 3); reposts reference `contentId`, never duplicate caption/body (FR-014). | PASS |
| IV. Next.js as Thin Scheduling Layer | No cache is introduced; every read/write hits the filesystem directly each time (FR-005a, research.md Decision 4/5); no second content store. | PASS |
| V. Explicit Date-Driven Scheduling | `draft → scheduled` requires both `scheduledAt` and `timezone` (FR-006/007); reposts require their own independent date (FR-013); `getScheduleForRange` answers date queries from manifest alone (FR-019). | PASS |
| Content & Data Standards | Frontmatter schema (data-model.md) defines required fields consistently for all brands; manifest entry schema shared across brands via one `zod` schema (research.md Decision 6) — no per-brand schema drift. | PASS |
| Development Workflow & Quality Gates | This plan introduces no new cache/index; the one derived-but-ephemeral concept (untracked/broken/duplicate detection) is computed fresh on every `getScheduleForRange` call, not stored. | PASS |

No violations — Complexity Tracking is not needed for this feature.

## Project Structure

### Documentation (this feature)

```text
specs/001-scheduling-dashboard/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── scheduling-functions.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
content/
├── <brand>/
│   ├── manifest.yaml           # single source of lifecycle truth for this brand
│   └── *.md                    # content items (frontmatter + caption body)

app/
├── (dashboard)/
│   ├── page.tsx                 # calendar/date view + unscheduled bucket + brand filter (US1, US5)
│   └── items/[entryId]/
│       └── page.tsx             # content detail view (US2)
├── actions/
│   ├── schedule.ts               # transitionToScheduled, transitionToPosted (US3) — Server Actions
│   └── repost.ts                 # createRepost (US4) — Server Action
└── layout.tsx

lib/
├── content/
│   ├── read-content-item.ts      # frontmatter parsing (gray-matter + zod)
│   └── content-schema.ts
├── manifest/
│   ├── read-manifest.ts
│   ├── write-manifest.ts         # atomic read-modify-write (research.md Decision 8)
│   └── manifest-schema.ts
├── schedule/
│   ├── get-schedule-for-range.ts # contracts: getScheduleForRange
│   ├── get-item-detail.ts        # contracts: getItemDetail
│   └── list-brands.ts            # contracts: listBrands
└── timezone.ts                   # luxon-based range/formatting helpers

tests/
├── unit/
│   ├── content-parsing.test.ts
│   ├── manifest-write.test.ts
│   ├── transitions.test.ts
│   └── schedule-range.test.ts
└── e2e/
    ├── calendar-view.spec.ts
    ├── item-detail.spec.ts
    ├── lifecycle-transitions.spec.ts
    ├── repost-flow.spec.ts
    └── brand-filter.spec.ts
```

**Structure Decision**: Single Next.js application (App Router) at the
repository root. `content/` holds the actual brand-partitioned markdown and
manifests per the constitution — it is data, not source code, and lives
alongside the app rather than inside `app/` or `lib/`. `lib/` holds all
filesystem-facing logic (parsing, validation, manifest I/O, schedule
queries) so it can be unit-tested without rendering anything, matching the
contract functions in [contracts/scheduling-functions.md](./contracts/scheduling-functions.md).
`app/actions/` holds the Server Actions the UI calls for mutations (status
transitions, repost creation); `app/(dashboard)/` holds the two screens the
spec's user stories require (calendar+filter, and item detail).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations were found — this section is intentionally empty.
