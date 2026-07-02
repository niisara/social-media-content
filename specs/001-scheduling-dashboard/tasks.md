---

description: "Task list for Scheduling Dashboard implementation"
---

# Tasks: Scheduling Dashboard

**Input**: Design documents from `/specs/001-scheduling-dashboard/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Not explicitly requested in the feature specification, so no TDD-style test-writing tasks are embedded in the user story phases. Two optional automated-test tasks are included in Polish (T033, T034) for the tooling the plan already selected (vitest, playwright); skip them if you don't want automated coverage yet — [quickstart.md](./quickstart.md)'s manual validation scenarios (T032) are sufficient to confirm the feature works.

**Organization**: Tasks are grouped by user story (from [spec.md](./spec.md)) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

## Path Conventions

Single Next.js application at the repository root, per [plan.md](./plan.md)'s Project Structure:
- `content/<brand>/` — markdown content files + `manifest.yaml` (data, not source)
- `app/` — routes, pages, Server Actions
- `lib/` — filesystem-facing logic (parsing, validation, manifest I/O, schedule queries)
- `tests/` — unit (vitest) and e2e (playwright), if added

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization

- [X] T001 Initialize the Next.js 15 (App Router, TypeScript) project at the repository root: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`
- [X] T002 [P] Install and declare core dependencies in `package.json`: `gray-matter`, `yaml`, `zod`, `luxon` (per [research.md](./research.md) Decisions 6–7)
- [X] T003 [P] Configure ESLint and Prettier for the project (`.eslintrc`, `.prettierrc`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core filesystem-access and validation logic that every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Define the content frontmatter validation schema in `lib/content/content-schema.ts`, matching [data-model.md](./data-model.md)'s Content Item fields (`id`, `caption`, `hashtags`, `media`, `platforms`, optional informational `status`)
- [X] T005 [P] Define the manifest entry validation schema in `lib/manifest/manifest-schema.ts`, matching [data-model.md](./data-model.md)'s Manifest Entry fields (`entryId`, `contentId`, `status`, `scheduledAt`, `timezone`, `repostOf`)
- [X] T006 Implement `lib/content/read-content-item.ts`: parse a markdown file's frontmatter and body via `gray-matter`, validate against `content-schema.ts`, and return a typed Content Item or a broken-file marker rather than throwing (depends on T004)
- [X] T007 Implement `lib/manifest/read-manifest.ts`: read and parse a brand's `manifest.yaml` via the `yaml` package, validate every entry against `manifest-schema.ts` (depends on T005)
- [X] T008 Implement `lib/manifest/write-manifest.ts`: atomic read-modify-write targeting exactly one `entryId`, via temp-file-then-rename ([research.md](./research.md) Decision 8); throws a typed "entry not found" error if the target entry is missing at write time (spec FR-010a) (depends on T007)
- [X] T009 [P] Implement `lib/timezone.ts`: `luxon`-based helpers to compute week/month date ranges in a given IANA timezone and to format `scheduledAt`/`timezone` for display
- [X] T010 Implement `lib/schedule/list-brands.ts`: discover brand folders under `content/`, derive `slug`, `displayName`, and a deterministic per-brand `color` ([contracts/scheduling-functions.md](./contracts/scheduling-functions.md): `listBrands`)
- [X] T011 Create sample content and manifest fixtures under `content/` for local development and quickstart validation: `content/acme/*.md` + `content/acme/manifest.yaml`, `content/globex/*.md` + `content/globex/manifest.yaml`, matching [quickstart.md](./quickstart.md)'s Setup section

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - See everything scheduled across brands (Priority: P1) 🎯 MVP

**Goal**: A calendar/date view showing every brand's scheduled items grouped by date, brand-distinguishable, with an unscheduled bucket and visible surfacing of untracked/broken/duplicate data — all navigable by week/month.

**Independent Test**: Point the dashboard at the fixture content from T011 (multiple brands, a mix of scheduled/draft/untracked items) and confirm every scheduled item appears on its correct date with a visible brand indicator, drafts appear in the unscheduled bucket, untracked/broken/duplicate data is surfaced rather than hidden, and week/month navigation shows the correct items for each range.

### Implementation for User Story 1

- [X] T012 [US1] Implement `lib/schedule/get-schedule-for-range.ts`: aggregate manifest entries (optionally filtered by brand) within a date range, separate scheduled vs. unscheduled (draft) entries, detect untracked content files, detect duplicate `contentId` references, and flag entries with broken content-file references ([contracts/scheduling-functions.md](./contracts/scheduling-functions.md): `getScheduleForRange`) (depends on T006, T007, T009, T010)
- [X] T013 [US1] Build the dashboard page in `app/(dashboard)/page.tsx`, computing the active date range via `lib/timezone.ts` and calling `getScheduleForRange` (depends on T012)
- [X] T014 [P] [US1] Build the `CalendarGrid` component in `app/(dashboard)/components/CalendarGrid.tsx`, rendering items grouped by scheduled date with a brand color/tag
- [X] T015 [P] [US1] Build the `UnscheduledBucket` component in `app/(dashboard)/components/UnscheduledBucket.tsx`, listing draft items with no scheduled date
- [X] T016 [P] [US1] Build the `DataIntegrityNotices` component in `app/(dashboard)/components/DataIntegrityNotices.tsx`, surfacing untracked content, broken references, and duplicate content IDs
- [X] T017 [US1] Wire `CalendarGrid`, `UnscheduledBucket`, and `DataIntegrityNotices` into the dashboard page together with week/month navigation controls in `app/(dashboard)/page.tsx` (depends on T013, T014, T015, T016)

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Drill into a single item's details (Priority: P1)

**Goal**: Clicking any item shows its caption, hashtags, media references, target platform(s), and current lifecycle status, read live from its markdown file and manifest entry.

**Independent Test**: Select an item from the dashboard and verify every displayed field matches its markdown file's frontmatter and manifest entry exactly; edit the file on disk and confirm the detail view reflects the change on next load (no caching).

### Implementation for User Story 2

- [X] T018 [US2] Implement `lib/schedule/get-item-detail.ts` ([contracts/scheduling-functions.md](./contracts/scheduling-functions.md): `getItemDetail`) (depends on T006, T007)
- [X] T019 [US2] Create the detail route `app/(dashboard)/items/[entryId]/page.tsx`, calling `getItemDetail` and rendering caption, hashtags, media references, platforms, status, and scheduledAt/timezone (depends on T018)
- [X] T020 [P] [US2] Build the `ItemDetailView` component (including a broken-reference display state) in `app/(dashboard)/items/[entryId]/ItemDetailView.tsx`
- [X] T021 [US2] Link calendar and unscheduled items to their detail route in `app/(dashboard)/components/CalendarGrid.tsx` and `UnscheduledBucket.tsx` (depends on T014, T015, T019)

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - Move an item through its lifecycle (Priority: P2)

**Goal**: Move an item from draft to scheduled (requiring date + timezone) and from scheduled to posted, with every transition written straight to the brand's manifest.

**Independent Test**: Take a draft item, supply a date and timezone to move it to "scheduled", confirm the manifest file on disk reflects it, then mark it "posted" and confirm the manifest reflects that too.

### Implementation for User Story 3

- [X] T022 [US3] Implement the `transitionToScheduled` Server Action in `app/actions/schedule.ts`, enforcing required date+timezone and a `draft`-only source status ([contracts/scheduling-functions.md](./contracts/scheduling-functions.md)) (depends on T007, T008)
- [X] T023 [US3] Implement the `transitionToPosted` Server Action in `app/actions/schedule.ts`, enforcing a `scheduled`-only source status ([contracts/scheduling-functions.md](./contracts/scheduling-functions.md)) (depends on T007, T008)
- [X] T024 [P] [US3] Build the `ScheduleForm` component (date + timezone inputs with missing-field validation messaging) in `app/(dashboard)/items/[entryId]/ScheduleForm.tsx`
- [X] T025 [US3] Wire "Mark as Scheduled" and "Mark as Posted" controls into `ItemDetailView.tsx`, calling the Server Actions and exposing only the transition valid for the item's current status (depends on T020, T022, T023, T024)

**Checkpoint**: User Stories 1, 2, AND 3 all work independently

---

## Phase 6: User Story 4 - Repost a previously posted item (Priority: P3)

**Goal**: From a posted item, create a repost that references the original's content ID (not a copy of its body) with its own independent scheduled date.

**Independent Test**: Select a posted item, initiate a repost, supply an independent date and timezone, and confirm a new manifest entry is created referencing the original's content ID without duplicating its caption/body.

### Implementation for User Story 4

- [X] T026 [US4] Implement the `createRepost` Server Action in `app/actions/repost.ts`, validating the original is `posted` and requiring an independent date+timezone, without copying caption/body ([contracts/scheduling-functions.md](./contracts/scheduling-functions.md)) (depends on T007, T008)
- [X] T027 [P] [US4] Build the `RepostForm` component (independent date+timezone input) in `app/(dashboard)/items/[entryId]/RepostForm.tsx`
- [X] T028 [US4] Wire the "Create Repost" control into `ItemDetailView.tsx` for posted items only, and ensure repost entries render distinctly (linked to their original) in `CalendarGrid` (depends on T020, T014, T026, T027)

**Checkpoint**: User Stories 1–4 all work independently

---

## Phase 7: User Story 5 - Filter the dashboard by brand (Priority: P2)

**Goal**: Narrow the dashboard to one brand or view all brands at once.

**Independent Test**: Select a single brand from the filter and confirm only that brand's items appear across the calendar and unscheduled bucket; clear the filter and confirm all brands reappear.

### Implementation for User Story 5

- [X] T029 [US5] Build the `BrandFilter` component in `app/(dashboard)/components/BrandFilter.tsx`, listing brands from `listBrands` with a clear/"all brands" option (depends on T010)
- [X] T030 [US5] Wire the brand filter selection into the dashboard page's `getScheduleForRange` calls in `app/(dashboard)/page.tsx` (depends on T013, T017, T029)

**Checkpoint**: All five user stories are independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validation and optional hardening across all stories

- [X] T031 [P] Apply a consistent brand color legend/style pass across `CalendarGrid` and `BrandFilter` in `app/(dashboard)/components/` — both already key off the same deterministic `Brand.color`/`displayName` from `listBrands()`
- [X] T032 Run the [quickstart.md](./quickstart.md) validation scenarios end-to-end and fix any discrepancies found — fixed a fixture/contract mismatch found along the way (see Notes) and extracted `lib/schedule/transitions.ts` so the draft→posted guard (FR-009) is independently verifiable, not just embedded in the Server Action
- [ ] T033 [P] (Optional — not requested in spec, skipped) Add unit tests for `lib/content`, `lib/manifest`, `lib/schedule`, and `lib/timezone` in `tests/unit/` using `vitest`
- [ ] T034 [P] (Optional — not requested in spec, skipped) Add e2e tests covering the five quickstart scenarios in `tests/e2e/` using `playwright`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational only
- **User Story 2 (Phase 4)**: Depends on Foundational; links into US1's components (T021 touches T014/T015) but its own detail-fetching logic (T018) is independent
- **User Story 3 (Phase 5)**: Depends on Foundational; wires into US2's `ItemDetailView` (T020)
- **User Story 4 (Phase 6)**: Depends on Foundational; wires into US2's `ItemDetailView` (T020) and US1's `CalendarGrid` (T014)
- **User Story 5 (Phase 7)**: Depends on Foundational and US1's dashboard page/`getScheduleForRange` wiring (T013, T017)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — buildable and testable alone right after Foundational
- **US2 (P1)**: Independently fetchable/testable (T018); its final linking task (T021) touches US1's list components, so finish US1 first for a clean integration
- **US3 (P2)**: Its UI hook-up (T025) lives inside US2's `ItemDetailView`, so US2 should land first
- **US4 (P3)**: Its UI hook-up (T028) lives inside US2's `ItemDetailView` and US1's `CalendarGrid`, so US1 and US2 should land first
- **US5 (P2)**: Its wiring (T030) extends US1's dashboard page, so US1 should land first

### Within Each User Story

- Server-side data/logic tasks before UI components
- Components before wiring/integration tasks
- Story complete before moving to the next priority (unless working in parallel with multiple people)

### Parallel Opportunities

- Setup: T002 and T003 can run in parallel
- Foundational: T005 and T009 can run in parallel with each other (and with T004 where no shared file); T006 depends on T004, T007 depends on T005, T008 depends on T007
- Once Foundational is done, US1, US2's `get-item-detail` (T018), US3's/US4's Server Actions (T022, T023, T026 — after T008), and US5's `BrandFilter` (T029 — after T010) can all start in parallel if staffed; final UI-wiring tasks within each story remain sequential
- Within US1: T014, T015, T016 can run in parallel (different component files)
- Polish: T031, T033, T034 can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch independent foundational tasks together:
Task: "Define manifest entry validation schema in lib/manifest/manifest-schema.ts"
Task: "Implement lib/timezone.ts luxon-based range/formatting helpers"
```

## Parallel Example: User Story 1

```bash
# After T012/T013 land, build the three display components together:
Task: "Build CalendarGrid component in app/(dashboard)/components/CalendarGrid.tsx"
Task: "Build UnscheduledBucket component in app/(dashboard)/components/UnscheduledBucket.tsx"
Task: "Build DataIntegrityNotices component in app/(dashboard)/components/DataIntegrityNotices.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm the calendar view works against the fixture content (T011) independently
5. Demo if ready — this alone replaces "open manifest files by hand to see what's scheduled"

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add US1 (calendar/date view) → validate → demo (MVP!)
3. Add US2 (item detail) → validate → demo
4. Add US3 (lifecycle transitions) → validate → demo
5. Add US4 (repost flow) → validate → demo
6. Add US5 (brand filter) → validate → demo
7. Polish (T031–T034) → final validation via quickstart.md

### Parallel Team Strategy

With multiple developers, after Foundational completes:
- Developer A: US1 (calendar view)
- Developer B: US2's data-fetching (T018) in parallel, then joins US1's components once ready for T021's linking
- Developer C: US3/US4 Server Actions (T022, T023, T026) once T008 lands, ahead of needing US2's `ItemDetailView`

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No test-writing tasks are embedded per-story because the spec did not request tests (T033/T034 in Polish are explicitly optional)
- Verify manifest writes against real fixture files (T011) after implementing T008, T022, T023, T026 — these are the highest-risk tasks (constitution Principle III: manifest is the single source of truth)
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
- Avoid: skipping Foundational, embedding caching logic anywhere (violates FR-005a / Principle IV), duplicating caption/body into repost entries (violates FR-014)
- During implementation, quickstart.md's original fixture setup assumed an *untracked* content file could be directly "scheduled" — but the contracts only transition an *existing* draft manifest entry. Fixed by adding a real draft manifest entry for `2026-07-10-behind-the-scenes.md` and a separate untracked file (`2026-07-12-untracked-post.md`) so both concepts (FR-003 unscheduled vs. FR-021 untracked) have distinct fixtures; quickstart.md was updated to match
