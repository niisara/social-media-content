---

description: "Task list for Card Overflow Fix & UI Polish implementation"
---

# Tasks: Card Overflow Fix & UI Polish

**Input**: Design documents from `/specs/003-fix-card-overflow-polish/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: No automated test-writing tasks — not requested in the spec. However, FR-012 makes rendered-output verification part of this feature's **definition of done**: T001 captures the broken baseline, and T019–T021 in Polish are the mandatory completion gate (programmatic overflow + background checks at 375px and ~768px). The feature CANNOT be marked complete with T019–T021 unchecked.

**Organization**: Tasks are grouped by user story (from [spec.md](./spec.md)). This is a bug-fix + restyle of existing files only — no new components, routes, dependencies, or data ([plan.md](./plan.md) Structure Decision).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

## Path Conventions

Same Next.js application as 001/002. Only the 8 files listed in [plan.md](./plan.md)'s Source Code tree are modified.

---

## Phase 1: Setup (Baseline Capture)

**Purpose**: Reproduce and record the bug before fixing it, so the fix is provable

- [X] T001 With the dev server running, programmatically capture the broken baseline: at a ~1000px viewport on the week of Jul 5 2026, record which card elements fail `scrollWidth <= clientWidth + 1` or paint outside their card's bounding box, and record the computed `body` background-color (expected: near-white gray-50) — save findings as a short note for comparison in T019/T020. **BASELINE CAPTURED**: Acme card scrollWidth 137 > clientWidth 103; StatusChip span overflows card right edge by 34px; body bg = oklch(0.985 0.002 247.839) (gray-50, near-white)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Primitive-level fixes in `components/ui/` that US1 and US4 both build on ([contracts/component-changes.md](./contracts/component-changes.md))

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Add content containment to `components/ui/Card.tsx`: `overflow-hidden` on the card container so no descendant can paint outside the card boundary (FR-001, research.md Decision 1)
- [X] T003 [P] Add label truncation to `components/ui/BrandTag.tsx`: wrap the name text in a `truncate` span with a defined `max-w-*` cap (`max-w-32` + `title` tooltip for the full name); keep the color dot `shrink-0`; the tag's root tolerates a `min-w-0` flex context (FR-003)
- [X] T004 [P] Make `components/ui/StatusChip.tsx` non-squeezable: add `whitespace-nowrap` and `shrink-0` so the chip always keeps full padding and label, moving lines via parent wrap instead of shrinking (FR-004)

**Checkpoint**: Primitives are containment-safe — story phases can begin

---

## Phase 3: User Story 1 - Card content never overflows its boundary (Priority: P1) 🎯 MVP

**Goal**: Nothing inside any card renders outside or is clipped by its boundary, at any width from 375px up — the reproducible chip-clipping bug is eliminated.

**Independent Test**: Rerun T001's programmatic check at ~768px and 375px: zero elements fail the containment assertions on cards containing brand label + status chip ([quickstart.md](./quickstart.md) Scenario 1).

### Implementation for User Story 1

- [X] T005 [US1] Fix the item-card header row in `app/(dashboard)/components/CalendarGrid.tsx` (line ~75): change `flex items-center justify-between gap-2` to a wrap-capable row (`flex flex-wrap items-center gap-x-2 gap-y-1`), give the BrandTag side `min-w-0`, rely on StatusChip's new `shrink-0` (FR-002; research.md Decision 1)
- [X] T006 [US1] Apply the same wrap-capable header-row fix in `app/(dashboard)/components/UnscheduledBucket.tsx` (line ~29) (FR-002)
- [X] T007 [US1] Make the badge row (RepostBadge + broken-reference indicator) and date header row (incl. Today badge) in `app/(dashboard)/components/CalendarGrid.tsx` wrap-safe at narrow cell widths (spec Edge Cases: multi-indicator cards, Today badge overflow) — badge row already wrapped; date header row made wrap-capable with nowrap date + shrink-0 Today badge
- [X] T008 [US1] Verify US1 independently: programmatic containment check (per [quickstart.md](./quickstart.md) Scenario 1 method) at ~768px and 375px on the fixture week — zero violations; fix any stragglers found. **FOUND & FIXED a straggler**: at 768px a 7-col cell has only ~70px content width but the "Scheduled" chip alone is ~85px — impossible to fit without squeezing (forbidden by FR-004). Structural fix: 7-column grid now engages at `lg` (1024px+) instead of `md`, with a 2-column layout at sm–lg. Verified zero violations at 375px, 768px, 1000px, and 1024px (7-col mode)

**Checkpoint**: The reported bug is fixed and proven — MVP complete

---

## Phase 4: User Story 2 - A deliberate non-white theme is visibly applied (Priority: P1)

**Goal**: Cool light gray page background everywhere; white cards and toolbar visibly lifted off it.

**Independent Test**: Computed `body` background-color equals the slate-200 token on dashboard AND item detail; cards read as distinct surfaces ([quickstart.md](./quickstart.md) Scenario 2).

### Implementation for User Story 2

- [X] T009 [US2] Change the body background in `app/globals.css` from `bg-gray-50` to `bg-slate-200` (FR-007; research.md Decision 2)
- [X] T010 [US2] Bump muted text that sits directly on the page background to AA-passing tones (`gray-600` minimum) in `app/(dashboard)/page.tsx` (date-range line) and `app/(dashboard)/components/UnscheduledBucket.tsx` (section heading, empty-state line) (FR-013; research.md Decision 2 contrast table)
- [X] T011 [US2] Verify US2 independently: computed background-color check on `/` and an item detail page — **both render oklch(0.929 0.013 255.508) = slate-200** (baseline was oklch(0.985…) near-white gray-50)

**Checkpoint**: Background is measurably non-white on every screen

---

## Phase 5: User Story 3 - Uniform day-card sizing in the week grid (Priority: P2)

**Goal**: All 7 day cells equal width and uniform row height; captions clamp consistently; unbroken strings can't distort the grid.

**Independent Test**: With one long-caption day and empty neighbors, all 7 column widths match within 1px and all cells in the row share the tallest cell's height ([quickstart.md](./quickstart.md) Scenario 3).

### Implementation for User Story 3

- [X] T012 [US3] Standardize day-cell sizing in `app/(dashboard)/components/CalendarGrid.tsx`: keep `grid-cols-7` (equal tracks), ensure nothing disables the default grid stretch (uniform row height per Clarification Q2), and apply one consistent `min-h` to all cells (FR-005; research.md Decision 3) — verified programmatically: all 7 cells exactly 129px wide × 158px tall (row stretches to tallest cell; empty days match)
- [X] T013 [US3] Add `break-words` to caption text in `app/(dashboard)/components/CalendarGrid.tsx` and `app/(dashboard)/components/UnscheduledBucket.tsx`, keeping `line-clamp-2` identical in both (FR-006; spec Edge Cases: unbroken strings) — landed together with T005/T006's header-row edits

**Checkpoint**: Grid discipline holds under uneven content

---

## Phase 6: User Story 4 - Chips and labels handle long brand names gracefully (Priority: P2)

**Goal**: A 30+ character brand name truncates with ellipsis everywhere and never causes overflow; chips always keep comfortable padding.

**Independent Test**: Temporary long-name brand fixture renders with ellipsis in day cards, unscheduled bucket, filter pill, and item detail — zero overflow ([quickstart.md](./quickstart.md) Scenario 4).

### Implementation for User Story 4

- [X] T014 [US4] Add label max-width + truncation to the brand filter pills in `components/ui/BrandFilterPill.tsx` (label span `truncate` with `max-w-40` + `title` tooltip) so a long brand name can't stretch a pill off-layout (FR-003)
- [X] T015 [US4] Ensure the item detail header row in `app/(dashboard)/items/[entryId]/ItemDetailView.tsx` is wrap-safe (`flex-wrap` already present; BrandTag now carries its own `min-w-0` + truncate internally) (FR-003)
- [X] T016 [US4] Verify US4 independently: created a 44-character temporary brand fixture — label actively truncated with ellipsis in day card, unscheduled bucket, and filter pill; item detail article had zero overflowing descendants; chips intact everywhere; fixture removed after validation (also incidentally re-confirmed 001's duplicate-contentId warning still fires correctly)

**Checkpoint**: Long names degrade gracefully everywhere

---

## Phase 7: User Story 5 - Cohesive toolbar and modern card polish (Priority: P3)

**Goal**: Dominant page header; nav/toggle/filters inside one elevated toolbar container; day cells share the card surface family against the gray background.

**Independent Test**: Visual review per [quickstart.md](./quickstart.md) Scenario 5 — enclosed toolbar, dominant title, consistent card/cell surface family, weekend tint, today ring, quiet empty cells.

### Implementation for User Story 5

- [X] T017 [US5] Build the enclosed toolbar in `app/(dashboard)/page.tsx`: wrapped the two SegmentedControls, the date-range meta line, and BrandFilter inside one white `rounded-xl` `shadow-sm` bordered container with an internal divider between nav row and filter row (FR-010, Clarification Q3); page title raised to `text-3xl font-bold tracking-tight` (FR-009)
- [X] T018 [US5] Rework day-cell surfaces in `app/(dashboard)/components/CalendarGrid.tsx` for the gray background: filled cells white + `shadow-sm` matching the Card family (FR-008); weekend cells `bg-slate-50` tint; today keeps `ring-2 ring-gray-900`; empty cells recede via dashed `border-slate-300` + translucent `bg-white/40` with `text-gray-600` "No content" (AA on the blended background) (research.md Decision 5)

**Checkpoint**: All five user stories delivered

---

## Phase 8: Polish & Completion Gate (FR-012 — mandatory)

**Purpose**: The definition-of-done verification. T019–T021 MUST pass before this feature is complete.

- [X] T019 Run the full programmatic containment sweep ([quickstart.md](./quickstart.md) Scenario 1): **zero violations at 375px, 768px, 1024px (7-col mode), and 1280px** — versus T001's baseline of 2 violations (chip 34px past card edge) at 1000px; no page-level horizontal overflow at any width (FR-012, SC-001)
- [X] T020 Run the background verification ([quickstart.md](./quickstart.md) Scenario 2): computed `body` background = **oklch(0.929 0.013 255.508) = slate-200** on dashboard AND item detail (baseline: oklch(0.985…) near-white). Screenshot tooling timed out (same preview-infra issue as the 002 session) — accessibility-tree snapshot captured as the visual record instead; programmatic checks are authoritative per research.md Decision 6 (FR-012, SC-002)
- [X] T021 Run the contrast spot-check and regression pass ([quickstart.md](./quickstart.md) Scenarios 6–7): all 8 key pairings pass AA — gray-600/slate-200 = 6.13:1, title 14.39:1, "No content" 6.68:1, chips 4.57–9.37:1, warning 8.75:1; `git status` confirms zero changes under `lib/manifest/`, `lib/schedule/get-*`, `lib/content/`, `app/actions/`, or `content/`; all routes 200, unknown entry 404, Mark-as-Scheduled and Create-Repost forms intact (FR-011, FR-013, SC-005)
- [X] T022 [P] Run `npx tsc --noEmit` and `npx eslint .` — both clean

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — do first (captures the broken state before any fix lands)
- **Foundational (Phase 2)**: After T001 — BLOCKS all user stories (primitives underpin US1/US4)
- **US1 (Phase 3)**: After Foundational; touches `CalendarGrid.tsx` + `UnscheduledBucket.tsx`
- **US2 (Phase 4)**: After Foundational; independent files (`globals.css`, `page.tsx` text tones) — can run in parallel with US1 if desired, but T010 touches `UnscheduledBucket.tsx` (shared with T006), so land US1 first when working solo
- **US3 (Phase 5)**: After US1 (same file: `CalendarGrid.tsx`)
- **US4 (Phase 6)**: After Foundational (T003 provides BrandTag truncation); T015 is independent; verification T016 last in phase
- **US5 (Phase 7)**: After US2 (gray background must exist for surface work) and US3 (same file: `CalendarGrid.tsx`)
- **Polish (Phase 8)**: After ALL user stories — this is the completion gate, not optional cleanup

### Within Each User Story

- Fix tasks before that story's verification task (T008, T011, T016 close their phases)
- `CalendarGrid.tsx` is touched by US1 → US3 → US5 in that order; do not interleave

### Parallel Opportunities

- Foundational: T002, T003, T004 all parallel (three different primitive files)
- T009 (globals.css) can land in parallel with any US1 task (different file)
- T014 (BrandFilterPill) and T015 (ItemDetailView) parallel with each other
- Polish: T022 parallel with T019–T021; T019–T021 themselves are sequential-ish (same running server, different checks)

---

## Parallel Example: Foundational Phase

```bash
# All three primitive fixes together (different files):
Task: "Add overflow-hidden containment in components/ui/Card.tsx"
Task: "Add max-width + truncate label in components/ui/BrandTag.tsx"
Task: "Add whitespace-nowrap + shrink-0 in components/ui/StatusChip.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 baseline capture (proves the bug exists before the fix)
2. Phase 2 primitives (T002–T004)
3. Phase 3 wrap fixes + verification (T005–T008)
4. **STOP and VALIDATE**: the reported clipping bug is gone and provably so — ship-worthy on its own

### Incremental Delivery

1. Baseline + Foundational → containment-safe primitives
2. US1 (overflow fix) → verify → MVP
3. US2 (gray background + AA text) → verify
4. US3 (grid discipline) → verify
5. US4 (long-name robustness) → verify, remove temp fixture
6. US5 (toolbar + surface polish) → visual review
7. Phase 8 completion gate (T019–T022) — feature is NOT done until these pass

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- FR-012 is unusual: verification tasks (T019–T021) are contractually part of the feature, not optional polish — do not mark the feature complete with them unchecked
- The temporary long-brand-name fixture (T016) must be removed after validation — it must not ship in `content/`
- Avoid: shrinking/squeezing chips to fit (FR-004 forbids it — wrap instead), introducing any raw hex color in components (stay on Tailwind tokens / `--brand-color` pattern), touching any `lib/` data modules or Server Actions
