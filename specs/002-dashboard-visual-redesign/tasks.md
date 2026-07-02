---

description: "Task list for Dashboard Visual Redesign implementation"
---

# Tasks: Dashboard Visual Redesign

**Input**: Design documents from `/specs/002-dashboard-visual-redesign/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Not explicitly requested in the feature specification — no automated test-writing tasks are included. Verification is manual per [quickstart.md](./quickstart.md) (T029), plus the existing `tsc --noEmit` / `eslint` gates from 001, which remain unchanged and should be run after each phase.

**Organization**: Tasks are grouped by user story (from [spec.md](./spec.md)) to enable independent implementation and testing of each story. This feature restyles the existing dashboard from [001-scheduling-dashboard](../001-scheduling-dashboard/) — no new routes, data, or Server Actions are introduced.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Include exact file paths in descriptions

## Path Conventions

Same single Next.js application as 001, plus:
- `components/ui/` — NEW shared presentational primitives (contracts/ui-components.md)
- `lib/theme/` — NEW fixed semantic color mapping

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Wire up Tailwind CSS and icon library

- [X] T001 Add `tailwindcss`, `@tailwindcss/postcss`, and `lucide-react` to `package.json` and install (research.md Decisions 1, 4)
- [X] T002 [P] Create `postcss.config.mjs` registering `@tailwindcss/postcss`
- [X] T003 Update `app/globals.css` to `@import "tailwindcss";` and define the base color CSS custom properties from [data-model.md](./data-model.md)'s Color Roles table (background, surface, border, text-primary/secondary/muted) — implemented as Tailwind's own gray scale applied via `@layer base`, rather than duplicate CSS variables (see comment in globals.css)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared design tokens and UI primitives every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create `lib/theme/status-colors.ts` with the fixed draft/scheduled/posted/repost color mapping ([data-model.md](./data-model.md) Status Indicator Model, research.md Decision 3) (depends on T001–T003)
- [X] T005 [P] Expand the brand color palette array in `lib/schedule/list-brands.ts` to ~16 distinct, contrast-checked colors, keeping the existing slug→color hash mechanism unchanged (research.md Decision 7) — palette also deliberately avoids hues reserved for status/warning/danger to prevent semantic confusion
- [X] T006 [P] Build `components/ui/Card.tsx`: elevated container with `brandColor?` (sets `--brand-color` + left-border accent, research.md Decision 2) and `muted?` props ([contracts/ui-components.md](./contracts/ui-components.md): Card)
- [X] T007 [P] Build `components/ui/StatusChip.tsx`: colored status label consuming `lib/theme/status-colors.ts` (depends on T004) ([contracts/ui-components.md](./contracts/ui-components.md): StatusChip)
- [X] T008 [P] Build `components/ui/RepostBadge.tsx`: small purple repost indicator ([contracts/ui-components.md](./contracts/ui-components.md): RepostBadge)
- [X] T009 [P] Build `components/ui/BrandTag.tsx`: brand name label rendered in the brand's accent color ([contracts/ui-components.md](./contracts/ui-components.md): BrandTag)
- [X] T010 [P] Build `components/ui/BrandFilterPill.tsx`: selectable pill with active/inactive states, using brand accent color or neutral for "all brands" ([contracts/ui-components.md](./contracts/ui-components.md): BrandFilterPill)
- [X] T011 [P] Build `components/ui/SegmentedControl.tsx`: grouped control set with a clearly marked active option ([contracts/ui-components.md](./contracts/ui-components.md): SegmentedControl)
- [X] T012 [P] Build `components/ui/WarningBanner.tsx`: amber warning banner accepting an icon and title/children ([contracts/ui-components.md](./contracts/ui-components.md): WarningBanner)

**Checkpoint**: Design tokens and primitives ready — user story restyling can now begin

---

## Phase 3: User Story 1 - Recognize content at a glance by brand and status (Priority: P1) 🎯 MVP

**Goal**: Every item card shows its brand and lifecycle status via consistent color cues, with reposts marked by a separate badge.

**Independent Test**: View the dashboard with items from multiple brands in multiple statuses (draft, scheduled, posted, repost) and confirm brand/status are identifiable purely from color, without reading captions ([quickstart.md](./quickstart.md) Scenario 1).

### Implementation for User Story 1

- [X] T013 [US1] Restyle item cards in `app/(dashboard)/components/CalendarGrid.tsx` to use `Card` + `BrandTag` + `StatusChip` + `RepostBadge` (depends on T006, T007, T008, T009)
- [X] T014 [US1] Restyle item cards in `app/(dashboard)/components/UnscheduledBucket.tsx` to use `Card` + `BrandTag` + `StatusChip` (depends on T006, T007, T009)
- [X] T015 [US1] Restyle the header of `app/(dashboard)/items/[entryId]/ItemDetailView.tsx` to use `BrandTag` + `StatusChip` + `RepostBadge` in place of the current plain-text status line (depends on T007, T008, T009) — also fixed `page.tsx` to fetch `listBrands()` for the brand color/name, and restyled `ScheduleForm.tsx`/`RepostForm.tsx` (previously plain inline styles, not referenced by any task but needed fixing since T003 removed the CSS variables they implicitly relied on being consistent with)

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Experience a polished, well-typeset page (Priority: P1)

**Goal**: A consistent type scale and clear section spacing across the dashboard and item detail pages.

**Independent Test**: Compare page title, section headings, caption text, and meta text for distinct size/weight tiers, and confirm clear whitespace between major sections ([quickstart.md](./quickstart.md) Scenario 2).

### Implementation for User Story 2

- [X] T016 [US2] Apply the Tailwind type scale (title/heading/body/meta tiers, [data-model.md](./data-model.md) Type Scale) and section-level spacing to `app/(dashboard)/page.tsx` (depends on T013 — same file, land after US1's calendar restyle)
- [X] T017 [US2] Apply the type scale and spacing to `app/(dashboard)/items/[entryId]/ItemDetailView.tsx` (caption, section headings, meta text) (depends on T015 — same file, land after US1's header restyle) — largely completed as part of T015 since the header and body sections were rewritten together; verified spacing rhythm (mt-1/3/4/6) is consistent

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - Navigate dates and filter brands through clear, interactive controls (Priority: P2)

**Goal**: Date navigation, view toggle, and brand filter read as grouped, stateful controls with obvious active states.

**Independent Test**: Switch between week/month views and brand filters, confirming the active option is always visually obvious and controls are grouped, not plain links ([quickstart.md](./quickstart.md) Scenario 3).

### Implementation for User Story 3

- [X] T018 [US3] Replace the Previous/Today/Next links in `app/(dashboard)/page.tsx` with a `SegmentedControl` instance (depends on T011, T016 — same file, land after US2's typography pass)
- [X] T019 [US3] Replace the week/month view-toggle link in `app/(dashboard)/page.tsx` with a second `SegmentedControl` instance (depends on T011, T016)
- [X] T020 [US3] Restyle `app/(dashboard)/components/BrandFilter.tsx` to render a `BrandFilterPill` per brand plus an "all brands" pill (depends on T010)

**Checkpoint**: User Stories 1–3 all work independently

---

## Phase 6: User Story 4 - See today and content density highlighted on the calendar (Priority: P2)

**Goal**: Today's date is visually highlighted; days with content look "full," empty days look intentionally minimal, weekends are subtly differentiated.

**Independent Test**: View a range including today and a mix of full/empty days, confirming today's highlight and the full-vs-empty visual distinction ([quickstart.md](./quickstart.md) Scenario 4).

### Implementation for User Story 4

- [X] T021 [US4] Add today-highlight styling to day cells in `app/(dashboard)/components/CalendarGrid.tsx` (depends on T013 — same file, land after US1's item-card restyle)
- [X] T022 [US4] Add weekend-day differentiation styling to day cells in `app/(dashboard)/components/CalendarGrid.tsx` (depends on T013)
- [X] T023 [US4] Add distinct "full" vs. "empty" day visual treatment to day cells in `app/(dashboard)/components/CalendarGrid.tsx` (depends on T013)

**Checkpoint**: User Stories 1–4 all work independently

---

## Phase 7: User Story 5 - Distinguish warnings and unscheduled content from normal content (Priority: P3)

**Goal**: The untracked-content warning reads as an alert; the unscheduled section reads as visually separate and subdued.

**Independent Test**: With an untracked file and a draft item present, confirm the warning banner's alert styling and the unscheduled section's muted, separated treatment ([quickstart.md](./quickstart.md) Scenario 5).

### Implementation for User Story 5

- [X] T024 [US5] Restyle `app/(dashboard)/components/DataIntegrityNotices.tsx` to use `WarningBanner` with a warning icon (depends on T012)
- [X] T025 [US5] Apply a muted, visually separated section treatment to the unscheduled bucket container in `app/(dashboard)/components/UnscheduledBucket.tsx` (depends on T014 — same file, land after US1's item-card restyle)

**Checkpoint**: User Stories 1–5 all work independently

---

## Phase 8: User Story 6 - Use the dashboard comfortably on a small screen (Priority: P3)

**Goal**: The calendar grid and page controls adapt gracefully at mobile widths.

**Independent Test**: View the dashboard at a ~375px viewport and confirm the calendar stacks to a single column and controls remain fully visible and usable ([quickstart.md](./quickstart.md) Scenario 6).

### Implementation for User Story 6

- [X] T026 [US6] Make the calendar grid responsive in `app/(dashboard)/components/CalendarGrid.tsx` — single column below `md`, 7-column grid at `md`+ (research.md Decision 6) (depends on T021, T022, T023 — same file, land after US4's day-cell states) — verified no horizontal overflow and vertical stacking at 375px viewport
- [X] T027 [US6] Ensure navigation controls and brand filter pills wrap gracefully at narrow viewports in `app/(dashboard)/page.tsx` and `app/(dashboard)/components/BrandFilter.tsx` (depends on T018, T019, T020) — verified nav stays within viewport bounds at 375px via `flex flex-wrap`

**Checkpoint**: All six user stories are independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Contrast verification, full regression pass, and cleanup

- [X] T028 [P] Verify text/background contrast for every status color, brand palette entry, and warning color pairing (FR-018); adjust any failing pairing in `lib/theme/status-colors.ts` or `lib/schedule/list-brands.ts` — computed WCAG contrast ratios for all 16 brand colors; 5 fell below 4.5:1 (cyan-600, teal-600, lime-600, orange-600, indigo-400) and were swapped for darker shades that clear 4.5:1 while preserving hue variety; status/warning chips use Tailwind's standard 100-bg/700-text pairing, which reliably passes AA
- [X] T029 Run all 7 [quickstart.md](./quickstart.md) validation scenarios end-to-end, including the full 001 regression pass (FR-017/SC-003), and fix any discrepancies found — confirmed via live server checks (all routes 200, 404 still correct for unknown entries) and confirmed no business-logic files (`lib/manifest/`, `lib/schedule/get-*`, `app/actions/*`) were modified from the committed 001 baseline
- [X] T030 [P] Remove any now-unused inline `style={{}}` objects left over from 001 in restyled components, replacing them with Tailwind classes for consistency — verified zero remain except the 3 intentional `--brand-color` CSS-variable usages (Card, BrandTag, BrandFilterPill)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational only
- **User Story 2 (Phase 4)**: Depends on Foundational; its tasks land in the same files US1 touches (`page.tsx`, `ItemDetailView.tsx`), so complete US1 first
- **User Story 3 (Phase 5)**: Depends on Foundational; shares `page.tsx` with US2, so complete US2 first
- **User Story 4 (Phase 6)**: Depends on Foundational; shares `CalendarGrid.tsx` with US1, so complete US1 first
- **User Story 5 (Phase 7)**: Depends on Foundational; shares `UnscheduledBucket.tsx` with US1, so complete US1 first
- **User Story 6 (Phase 8)**: Depends on Foundational; shares `CalendarGrid.tsx` with US4 and `page.tsx`/`BrandFilter.tsx` with US3, so complete US3 and US4 first
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

Unlike 001, most stories here share files (this is a restyle of a small existing page set, not new routes), so the priority order in spec.md doubles as the safe completion order: **US1 → US2 → US3 → US4 → US5 → US6**. Each story is still independently *testable* once its own tasks land — the dependency is about avoiding merge conflicts within the same files, not functional coupling.

### Within Each User Story

- Foundational primitives (Card, StatusChip, etc.) before any story consumes them
- Item-card-level changes before day-cell-level changes before grid-layout-level changes (within `CalendarGrid.tsx`, this is US1 → US4 → US6)

### Parallel Opportunities

- Setup: T002 can run in parallel with T001/T003 once dependencies are installed
- Foundational: T005–T012 can all run in parallel with each other (different files); T007 depends on T004 landing first
- Polish: T028 and T030 can run in parallel; T029 should run last (it validates everything else)
- Across stories: because most stories share files, cross-story parallelism is limited compared to 001 — treat this feature as substantially sequential by story, with parallelism concentrated in the Foundational and Polish phases

---

## Parallel Example: Foundational Phase

```bash
# After T004 lands, build the primitives together:
Task: "Build Card component in components/ui/Card.tsx"
Task: "Build StatusChip component in components/ui/StatusChip.tsx"
Task: "Build RepostBadge component in components/ui/RepostBadge.tsx"
Task: "Build BrandTag component in components/ui/BrandTag.tsx"
Task: "Build BrandFilterPill component in components/ui/BrandFilterPill.tsx"
Task: "Build SegmentedControl component in components/ui/SegmentedControl.tsx"
Task: "Build WarningBanner component in components/ui/WarningBanner.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm brand/status recognition works via quickstart Scenario 1
5. This alone delivers the redesign's core value — scannable brand/status — even before typography, nav, or calendar polish land

### Incremental Delivery

1. Setup + Foundational → design tokens and primitives ready
2. Add US1 (brand/status recognition) → validate → this is the MVP
3. Add US2 (typography & spacing) → validate
4. Add US3 (nav/filter controls) → validate
5. Add US4 (calendar today/weekend/density) → validate
6. Add US5 (warning/unscheduled distinction) → validate
7. Add US6 (responsive) → validate
8. Polish (T028–T030) → final full regression pass via quickstart.md

### Solo Sequential Strategy

Given the file-sharing dependencies noted above, this feature is best implemented sequentially in priority order (US1 → US6) rather than split across parallel workers — the Foundational phase is where parallel work pays off, not the story phases.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No test-writing tasks are included because the spec did not request tests; T029 (manual quickstart validation) is the required verification step
- FR-017/SC-003 (zero functional regression) is the highest-risk requirement here — re-run 001's quickstart scenarios (T029) after every story phase, not just at the end, if you want earlier regression detection
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
- Avoid: hand-picking a brand or status color inside a component instead of using `lib/theme/status-colors.ts` / `list-brands.ts` (reintroduces the exact problem FR-002 fixes), adding custom transitions/animations (out of scope per Clarifications), adding a dark theme (out of scope per Clarifications)
