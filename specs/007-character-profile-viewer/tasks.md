---
description: "Task list for Character Profile Viewer"
---

# Tasks: Character Profile Viewer

**Input**: Design documents from `/specs/007-character-profile-viewer/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/profile-viewer.md, quickstart.md

**Tests**: Test tasks are included as **OPTIONAL** (marked ⚠️). The spec did not mandate TDD and the
project has no `tests/` directory yet; tests are offered but not required for completion.

**Organization**: Tasks are grouped by user story. Profile resolution is shared foundation; the
profile route page is shared by US1 (success render) and US3 (not-available render); selection
restoration (US2) touches the content-generation page + `CharacterSelect`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Exact file paths included in each task.

## Path Conventions

Single Next.js App Router web app (per plan.md). Profile resolution under `lib/character/`; the
profile route + renderer under `app/(dashboard)/character/[slug]/`; About action + restoration in
`app/(dashboard)/content-generation/`. Mirrors `lib/content/read-content-item.ts` (typed ok/err +
path guard).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the Markdown-rendering dependencies.

- [X] T001 Install runtime dependencies for Markdown rendering: `npm install react-markdown remark-gfm` (adds GFM table support per research.md Decision 1); verify they appear in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Profile resolution — the typed result consumed by BOTH the success render (US1) and the
not-available render (US3).

**⚠️ CRITICAL**: The profile route cannot render until the resolver exists.

- [X] T002 Create `lib/character/read-character-profile.ts` exporting `readCharacterProfile(slug: string)` returning `{ ok: true; slug; title; markdown } | { ok: false; reason: "character-not-found" | "profile-missing" | "profile-ambiguous" }`: resolve `path.join(CHARACTER_ROOT, slug)` and guard the resolved path stays within `CHARACTER_ROOT` (mirror the `startsWith` check in `lib/content/read-content-item.ts`); if the folder is absent → `character-not-found`; `readdirSync` and filter file entries matching `/-PROFILE\.md$/i`; exactly one → `fs.readFileSync(..., "utf8")` and return `ok:true`; zero → `profile-missing`; more than one → `profile-ambiguous` (contract M-1…M-4, M-6, M-7; FR-004, FR-008)
- [X] T003 In `lib/character/read-character-profile.ts`, derive `title` from the profile Markdown: take the `## Name` bold value + the role from the top `#` heading (strip a leading "Profession Profile — " prefix), combine as "Name — Role"; fall back to the slug display label (`slugToLabel`, feature 006) when heading/name absent (contract M-5; FR-007)

**Checkpoint**: `readCharacterProfile(slug)` returns a typed ok/err result with a derived title —
ready for both the success and not-available renders.

---

## Phase 3: User Story 1 - View a character's profile (Priority: P1) 🎯 MVP

**Goal**: An "About {character}" action navigates to `/character/<slug>`, which renders the profile
as themed HTML (headings, bold, lists, and the Likings table as a real table) in the item-detail
back-nav shell.

**Independent Test**: Select a character, click "About {character}", and confirm the profile page
opens showing formatted content with the Likings table rendered as an actual table (Scenarios A & B;
contract U-1, P-1, P-3, P-4).

### Implementation for User Story 1

- [X] T004 [P] [US1] Create `app/(dashboard)/character/[slug]/ProfileMarkdown.tsx` rendering profile Markdown via `react-markdown` + `remark-gfm`, with a component map applying existing-theme Tailwind classes: `table`/`thead`/`th`/`td` → a bordered themed table (header row, rounded/zebra to match item-detail cards), `h1`/`h2` → typography-scale headings, `strong` → `font-semibold`, `ul`/`li` → styled bullet list (contract P-1; FR-005, FR-006)
- [X] T005 [US1] Create `app/(dashboard)/character/[slug]/page.tsx` (server component, dynamic): await `params`, call `readCharacterProfile(slug)`; on `ok:true` render the item-detail back-nav header bar with a "← Back to Content Generation" link to `/content-generation?character=<slug>` + a themed card containing the derived `title` and `<ProfileMarkdown markdown={...} />` (contract P-3, P-4, P-5; FR-006, FR-007). (Not-available branch added in US3 / T009)
- [X] T006 [US1] In `app/(dashboard)/content-generation/CharacterSelect.tsx`, add an "About {label}" action next to the dropdown: when a character is selected, render a themed `next/link` to `/character/<selectedSlug>` labeled "About {selected label}"; when nothing is selected, render it disabled/non-interactive (FR-001, FR-002, FR-003; contract U-1, U-2)

### Tests for User Story 1 (OPTIONAL) ⚠️

- [ ] T007 [P] [US1] (SKIPPED — optional; no `tests/` harness exists; resolver verified via browser preview) Optional Vitest unit test in `tests/unit/read-character-profile.test.ts`: fixture folders → assert one-match success (M-3), title derivation (M-5), and path-safety (M-6)
- [ ] T008 [P] [US1] (SKIPPED — optional; no `tests/` harness exists; table rendering verified via browser preview) Optional Vitest component test in `tests/unit/profile-markdown.test.tsx`: render `ProfileMarkdown` with sample Markdown incl. a GFM table → assert a `<table>` element renders and no raw `|` pipes remain (P-1)

**Checkpoint**: MVP functional — About action navigates to a themed, table-rendering profile page.

---

## Phase 4: User Story 2 - Return with selection preserved (Priority: P2)

**Goal**: Returning from a profile via the back link restores the previously viewed character in the
dropdown.

**Independent Test**: Visit `/content-generation?character=software-developer` (the back link target)
and confirm the dropdown shows "Software Developer" selected, not the placeholder (Scenario C;
contract U-3, U-4).

### Implementation for User Story 2

- [X] T009 [US2] In `app/(dashboard)/content-generation/page.tsx`, read `searchParams.character`, validate it against `listCharacters()` (ignore unknown values), and pass the valid slug as an `initialSlug` prop to `<CharacterSelect>` (FR-010; contract U-3, U-4). Update the page signature to accept `searchParams`
- [X] T010 [US2] In `app/(dashboard)/content-generation/CharacterSelect.tsx`, accept an optional `initialSlug` prop and seed `useState` from it (falling back to `null`/placeholder when absent or invalid), so a restored selection pre-selects the dropdown and enables the About action (FR-010; contract U-3)

### Tests for User Story 2 (OPTIONAL) ⚠️

- [ ] T011 [P] [US2] (SKIPPED — optional; no `tests/` harness exists; restoration verified via browser preview) Optional Vitest component test in `tests/unit/character-select-initial.test.tsx`: render `CharacterSelect` with `initialSlug` set → assert that character is pre-selected and the About action is enabled with the correct href (U-3)

**Checkpoint**: Round-trip works — view a profile, go back, and the selection is restored.

---

## Phase 5: User Story 3 - Profile not available state (Priority: P3)

**Goal**: Missing / multiple / non-existent profiles render a clear "Profile not available" state
instead of a crash or blank page.

**Independent Test**: Open `/character/<slug>` for a character with zero or multiple `*-PROFILE.md`
files (or an unknown slug) and confirm the "Profile not available" state with a working back link
(Scenario D; contract P-2).

### Implementation for User Story 3

- [X] T012 [US3] In `app/(dashboard)/character/[slug]/page.tsx`, handle the `readCharacterProfile` `ok:false` results: render a clear "Profile not available" state (themed card/message) within the same back-nav shell (keeping the "← Back to Content Generation" link working), for `character-not-found`, `profile-missing`, and `profile-ambiguous` (FR-008; contract P-2, SC-004)

### Tests for User Story 3 (OPTIONAL) ⚠️

- [ ] T013 [P] [US3] (SKIPPED — optional; no `tests/` harness exists; character-not-found path verified via browser preview) Optional Vitest unit test in `tests/unit/read-character-profile-errors.test.ts`: assert `profile-missing` (zero matches), `profile-ambiguous` (>1 match), and `character-not-found` (unknown slug) results (M-4, M-1)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation against the spec.

- [X] T014 Run the [quickstart.md](./quickstart.md) validation scenarios A–F (About action + nav, themed render with real table, back-link restores selection, profile-not-available, new-character convention, direct-visit/read-only) and confirm SC-001…SC-007
- [X] T015 [P] Run `npm run lint` and confirm no new lint/type errors from the resolver, route, renderer, and updated selector/page

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — install deps first (T004's renderer imports them).
- **Foundational (Phase 2)**: Depends on Setup. T003 depends on T002 (same resolver file). BLOCKS US1 and US3 (both consume the resolver).
- **User Story 1 (Phase 3)**: Depends on Foundational. T005 depends on T002/T003 (resolver) and T004 (renderer component). T006 is independent of the route (edits `CharacterSelect`).
- **User Story 2 (Phase 4)**: Depends on `CharacterSelect` existing (edited in US1/T006). T010 edits the same file as T006 → sequential.
- **User Story 3 (Phase 5)**: Depends on the route page from US1 (T005) — adds the err branch to the same `page.tsx` → sequential with T005.
- **Polish (Phase 6)**: Depends on US1–US3 complete.

### User Story Dependencies

- **US1 (P1)**: The MVP — profile view + About action. Independently testable once the resolver exists.
- **US2 (P2)**: Builds on `CharacterSelect` (US1) and the content-generation page; independently testable via `?character=` deep-link.
- **US3 (P3)**: Adds the err branch to the US1 route page; independently testable via a malformed character folder.

### Within Each User Story

- US1: T004 (renderer, [P]) can start alongside the resolver; T005 (page) needs T002/T003 + T004; T006 (About action) is independent (different file).
- US2: T009 (page reads param) and T010 (`CharacterSelect` initialSlug) — T010 is same file as T006 (sequential); T009 is a different file.
- US3: T012 edits the US1 route page (sequential with T005).

### Parallel Opportunities

- **T004** (`ProfileMarkdown.tsx`) is [P] — a new file independent of the resolver; can be built while T002/T003 proceed.
- **T006** (About action in `CharacterSelect`) and **T005** (route page) are different files → parallelizable.
- **Same-file sequential (NOT [P])**: T002→T003 (resolver); T006→T010 (`CharacterSelect`); T005→T012 (route `page.tsx`).
- Optional tests **T007, T008, T011, T013** are distinct new files → parallelizable with each other.
- **T015** (lint) can run alongside **T014**.

---

## Parallel Example: after Foundational

```bash
# T002+T003 (resolver) and T004 (renderer) can overlap since they are different files:
Task T002/T003: lib/character/read-character-profile.ts (resolver + title)
Task T004:      app/(dashboard)/character/[slug]/ProfileMarkdown.tsx (themed renderer)

# Within US1, the About action is a different file from the route page:
Task T005: app/(dashboard)/character/[slug]/page.tsx (success render)
Task T006: app/(dashboard)/content-generation/CharacterSelect.tsx (About action)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1: Setup (T001 — install deps)
2. Phase 2: Foundational (T002 → T003 — resolver + title)
3. Phase 3: US1 (T004, T005, T006 — renderer, route, About action)
4. **STOP and VALIDATE**: select a character → About → themed profile with real table (Scenarios A & B)
5. Demo the profile viewer

### Incremental Delivery

1. Setup + Foundational → resolver works
2. US1 → view profile + About action → **MVP demo**
3. US2 → selection restored on return → demo
4. US3 → graceful profile-not-available → demo
5. Polish → quickstart validation + lint

---

## Notes

- [P] tasks = different files, no dependencies.
- Reads a persona profile file for display only; no content/manifest reads or writes (constitution Principles I–V unaffected — see plan.md Constitution Check).
- New deps `react-markdown` + `remark-gfm` are presentation-only.
- Tests (T007, T008, T011, T013) are OPTIONAL; skip without blocking completion (no `tests/` harness yet).
- Commit after each task or logical group.
