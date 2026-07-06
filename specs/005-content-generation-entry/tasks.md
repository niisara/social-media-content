---
description: "Task list for Content Generation Entry Point"
---

# Tasks: Content Generation Entry Point

**Input**: Design documents from `/specs/005-content-generation-entry/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/navigation.md, quickstart.md

**Tests**: Test tasks are included as **OPTIONAL** (marked ⚠️). The spec did not mandate TDD;
the project ships Vitest + Playwright harnesses, so lightweight tests are offered but not required
for the feature to be complete.

**Organization**: Tasks are grouped by user story. This feature has no data model and no backend
work — it is a navigation control plus a static placeholder page.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2
- Exact file paths are included in each task.

## Path Conventions

Single Next.js App Router web app (per plan.md). Routes live under `app/`, shared UI under
`components/ui/`. Route group `(dashboard)` does not affect the URL, so
`app/(dashboard)/content-generation/page.tsx` resolves to `/content-generation`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the new route location. No new dependencies are needed (Next.js, React,
Tailwind, `next/link` are already present per plan.md).

- [X] T001 Create the route directory `app/(dashboard)/content-generation/` for the new page

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the `/content-generation` route target so navigation (US1) has a
destination and page content (US2) has a base file.

**⚠️ CRITICAL**: US1's navigation cannot be verified until this route resolves.

- [X] T002 Create a minimal server-component page at `app/(dashboard)/content-generation/page.tsx` that resolves the `/content-generation` route — export a default async/sync React component returning a `<main className="mx-auto max-w-4xl p-6">` wrapper with a temporary `<h1>Content Generation</h1>`. No `"use client"`, no forms, no data reads (per research.md Decision 5 and FR-008).

**Checkpoint**: Visiting `/content-generation` renders a themed (non-white body) page — the shell
is ready for US1 navigation and US2 content.

---

## Phase 3: User Story 1 - Reach the Content Generation area from the dashboard (Priority: P1) 🎯 MVP

**Goal**: Add a discoverable, on-brand "Content Generation" control to the dashboard header
toolbar that navigates to `/content-generation` via client-side routing (no full reload).

**Independent Test**: On `/`, the "Content Generation" control is visible in the header toolbar
alongside the existing controls and styled consistently; clicking it lands on
`/content-generation` without a full page reload (spec Scenarios A & B, contract C-1/VC-1).

### Implementation for User Story 1

- [X] T003 [US1] Add a "Content Generation" control to the header toolbar in `app/(dashboard)/page.tsx` — render a `next/link` `<Link href="/content-generation">` styled as a filled primary pill matching the existing token palette (e.g. `inline-flex items-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800`), placed in the toolbar row alongside the two `SegmentedControl` groups (research.md Decision 2 & 3; FR-001, FR-002, FR-003).

### Tests for User Story 1 (OPTIONAL) ⚠️

- [ ] T004 [P] [US1] (SKIPPED — optional; no `tests/` harness exists in this project; navigation verified via browser preview instead) Optional Playwright e2e in `tests/e2e/content-generation.spec.ts`: from `/`, assert a link with text "Content Generation" is visible in the header, click it, assert URL is `/content-generation` and the page title is visible (Scenario B, contract C-1).

**Checkpoint**: The MVP is functional — the control appears on the dashboard and navigates to the
(minimal) Content Generation page client-side.

---

## Phase 4: User Story 2 - Understand the page is a placeholder and return to the dashboard (Priority: P2)

**Goal**: Turn the minimal route target into a clear, on-brand "coming soon" placeholder that
reuses the item detail back-navigation pattern and returns to the dashboard.

**Independent Test**: Visiting `/content-generation` (via the control or directly) shows a
"Content Generation" title, a "coming soon" message, the shared theme, and a working
"← Back to dashboard" link that returns to `/` (spec Scenarios C, D, E, F; contract
C-2/C-3/VC-2/VC-3/VC-4).

### Implementation for User Story 2

- [X] T005 [US2] Flesh out `app/(dashboard)/content-generation/page.tsx`: add the back-navigation header bar reused from `app/(dashboard)/items/[entryId]/page.tsx` (a `next/link` `<Link href="/">← Back to dashboard</Link>` inside `<div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm ...">` with a small uppercase context label), then a themed card containing the `<h1>` "Content Generation" title and a short "coming soon"-style placeholder message. Keep it a server component with no forms/inputs/actions beyond the back link (FR-004, FR-005, FR-006, FR-007, FR-008; VC-2/VC-3/VC-4).

### Tests for User Story 2 (OPTIONAL) ⚠️

- [ ] T006 [P] [US2] (SKIPPED — optional; no `tests/` harness exists in this project; page content verified via browser preview instead) Optional Vitest component test in `tests/unit/content-generation-page.test.tsx`: render the page and assert it contains the "Content Generation" title, a coming-soon message, and a back link with `href="/"` (Scenarios C, D, F).

**Checkpoint**: Both stories work independently — the control navigates (US1) and the destination
is a clear, on-brand placeholder with a working return path (US2).

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation against the spec.

- [X] T007 Run the [quickstart.md](./quickstart.md) validation scenarios A–F and confirm SC-001…SC-006 are met (control present & on-brand, client-side nav, themed placeholder, back link, direct-visit render, no functional affordances)
- [X] T008 [P] Run `npm run lint` and confirm no new lint/type errors from the added control and page

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup (T001). BLOCKS US1 navigation verification and US2 content.
- **User Story 1 (Phase 3)**: Depends on Foundational (T002 must exist as a route target).
- **User Story 2 (Phase 4)**: Depends on Foundational (T002 file exists). Independent of US1 — it enriches the page file US1 navigates to, but neither story breaks the other.
- **Polish (Phase 5)**: Depends on US1 + US2 being complete.

### User Story Dependencies

- **US1 (P1)**: Needs the route target from Phase 2; edits `app/(dashboard)/page.tsx` (a different file from US2's page), so its implementation is independent of US2.
- **US2 (P2)**: Needs the page file from Phase 2; edits `app/(dashboard)/content-generation/page.tsx`. Independently testable.

### Within Each User Story

- US1: single implementation file (`app/(dashboard)/page.tsx`); optional test after.
- US2: single implementation file (`app/(dashboard)/content-generation/page.tsx`); optional test after.

### Parallel Opportunities

- T003 (US1, edits `page.tsx`) and T005 (US2, edits `content-generation/page.tsx`) touch **different files** after T002 exists, so they can be worked in parallel by two developers.
- Optional tests T004 [P] and T006 [P] can run in parallel with each other.
- T008 [P] (lint) can run alongside T007.

---

## Parallel Example: US1 and US2 after Foundational

```bash
# After T001 + T002 are done, two developers can proceed in parallel:
Developer A → Task T003: add the "Content Generation" control in app/(dashboard)/page.tsx
Developer B → Task T005: build the placeholder page in app/(dashboard)/content-generation/page.tsx

# Optional tests, also parallel:
Task T004: Playwright nav test in tests/e2e/content-generation.spec.ts
Task T006: Vitest page test in tests/unit/content-generation-page.test.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001)
2. Phase 2: Foundational (T002) — creates the route target
3. Phase 3: User Story 1 (T003) — add the header control
4. **STOP and VALIDATE**: from `/`, click "Content Generation" → lands on `/content-generation` client-side (Scenarios A & B)
5. Demo the entry point

### Incremental Delivery

1. Setup + Foundational → `/content-generation` resolves
2. US1 → control navigates → **MVP demo**
3. US2 → polished "coming soon" placeholder with back link → demo
4. Polish → quickstart validation + lint

---

## Notes

- [P] tasks = different files, no dependencies.
- No data model, no manifest/content changes, no new dependencies (constitution Principles I–V unaffected — see plan.md Constitution Check).
- Tests (T004, T006) are OPTIONAL; skip if not desired without blocking completion.
- Commit after each task or logical group.
- The future content-generation workflow feature will build on the T005 page shell.
