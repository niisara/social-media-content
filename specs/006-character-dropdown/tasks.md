---
description: "Task list for Character Dropdown on Content Generation Page"
---

# Tasks: Character Dropdown on Content Generation Page

**Input**: Design documents from `/specs/006-character-dropdown/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/character-select.md, quickstart.md

**Tests**: Test tasks are included as **OPTIONAL** (marked ⚠️). The spec did not mandate TDD; the
project ships Vitest + Playwright but currently has no `tests/` directory, so tests are offered but
not required for completion.

**Organization**: Tasks are grouped by user story. Character discovery is shared foundation; the
two stories differ in the `CharacterSelect` UI branches (populated vs. empty).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2
- Exact file paths are included in each task.

## Path Conventions

Single Next.js App Router web app (per plan.md). Discovery logic under `lib/`, the page and its
client island under `app/(dashboard)/content-generation/`. Mirrors the existing brand-discovery
pattern (`lib/fs-paths.ts` `listBrandSlugs`, `lib/schedule/list-brands.ts` `slugToDisplayName`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the new module location. No new dependencies (Next.js, React, Tailwind,
`node:fs`/`node:path` already present).

- [X] T001 Create the `lib/character/` directory for the character-discovery module

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Character discovery — the single source of options that BOTH stories depend on
(populated list for US1, empty `[]` for US2's empty state).

**⚠️ CRITICAL**: No user story UI can be verified until discovery exists.

- [X] T002 Add `CHARACTER_ROOT = path.join(process.cwd(), "character")` and `listCharacterSlugs(): string[]` to `lib/fs-paths.ts`, mirroring `CONTENT_ROOT` / `listBrandSlugs`: guard with `fs.existsSync` (return `[]` if absent), `readdirSync(CHARACTER_ROOT, { withFileTypes: true })`, filter `entry.isDirectory()` (excludes stray files — FR-004/M-2), map to `entry.name` (contract M-1, M-5, M-6, M-7)
- [X] T003 Create `lib/character/list-characters.ts` exporting `interface Character { slug: string; label: string }` and `listCharacters(): Character[]` — call `listCharacterSlugs()`, map each slug to `{ slug, label }` where `label` is the hyphen/underscore→space, title-cased form (same transform as `slugToDisplayName` in `lib/schedule/list-brands.ts`), then sort ascending by `label` via `localeCompare` (contract M-3, M-4; FR-002, FR-003)

**Checkpoint**: `listCharacters()` returns a sorted `Character[]` from disk (or `[]` when the folder
is missing/empty) — ready for both UI stories.

---

## Phase 3: User Story 1 - Choose a character from the current library (Priority: P1) 🎯 MVP

**Goal**: Render a themed "Character" dropdown on `/content-generation` populated from
`listCharacters()`, with a "Select a character…" placeholder default and visible selection feedback
— no side effects.

**Independent Test**: Open `/content-generation`; the dropdown lists the current character folders
as formatted labels in alphabetical order with a placeholder default; selecting one shows its label
and fires no generation/file-read/network call (Scenarios A & B; contract U-1, U-2, U-3, U-5, U-6).

### Implementation for User Story 1

- [X] T004 [US1] Create the client component `app/(dashboard)/content-generation/CharacterSelect.tsx` (`"use client"`) accepting `{ characters: Character[] }`: render a labeled "Character" `<select>` styled with existing theme utilities (rounded, slate border/background, `text-sm` — not raw/unstyled, FR-009/U-5), with a non-selectable "Select a character…" placeholder as the default (no pre-selection, FR-005/SC-007/U-1), holding the chosen slug in `useState<string | null>(null)`; on change, update state and render the matching character's `label` visibly as selection feedback (FR-007/U-2/U-3). Do NOT trigger any generation, file read, persistence, or network request (FR-008)
- [X] T005 [US1] Wire the selector into `app/(dashboard)/content-generation/page.tsx`: import and call `listCharacters()` (server) at render, add `export const dynamic = "force-dynamic"` so options reflect current folders on each load (FR-001/M-7/SC-003), and render `<CharacterSelect characters={characters} />` below the "Content Generation" heading/description and near the "coming soon" indicator (FR-009/U-6)

### Tests for User Story 1 (OPTIONAL) ⚠️

- [ ] T006 [P] [US1] (SKIPPED — optional; no `tests/` harness exists; server render verified via browser preview) Optional Vitest unit test in `tests/unit/list-characters.test.ts`: against a fixture dir, assert directories-only filtering (M-2), slug→label formatting (M-3), alphabetical-by-label order (M-4), and `[]` for missing/empty (M-5)
- [ ] T007 [P] [US1] (SKIPPED — optional; no `tests/` harness exists; selection behavior verified via browser preview) Optional Vitest component test in `tests/unit/character-select.test.tsx`: render `CharacterSelect` with a sample `characters` prop → assert placeholder default (U-1) and that selecting an option shows its label (U-2/U-3)

**Checkpoint**: MVP functional — the populated, themed dropdown works with selection feedback and no
side effects.

---

## Phase 4: User Story 2 - Understand when no characters exist (Priority: P2)

**Goal**: When `character/` has no subfolders (or is absent), show a clearly disabled control with a
"No characters available" message instead of an empty/broken dropdown.

**Independent Test**: With no subfolders under `character/`, open `/content-generation` and confirm
the control is disabled and shows "No characters available", with nothing selectable (Scenario E;
contract U-4/SC-005).

### Implementation for User Story 2

- [X] T008 [US2] In `app/(dashboard)/content-generation/CharacterSelect.tsx`, handle the empty case: when `characters.length === 0`, render a disabled control showing "No characters available" (no options, not interactive) instead of the populated dropdown (FR-006/U-4/SC-005). Reuses the same server data path — `listCharacters()` already returns `[]` for a missing/empty directory (T002/T003)

### Tests for User Story 2 (OPTIONAL) ⚠️

- [ ] T009 [P] [US2] (SKIPPED — optional; no `tests/` harness exists; empty branch verified by code inspection) Optional Vitest component test in `tests/unit/character-select-empty.test.tsx`: render `CharacterSelect` with `characters={[]}` → assert the control is disabled and shows "No characters available" (U-4)

**Checkpoint**: Both stories work — populated selection (US1) and graceful empty state (US2).

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation against the spec.

- [X] T010 Run the [quickstart.md](./quickstart.md) validation scenarios A–F (dynamic/formatted/sorted options, selection-no-side-effects, stray-file exclusion, folder add/remove reflected, empty state, no persistence) and confirm SC-001…SC-007
- [X] T011 [P] Run `npm run lint` and confirm no new lint/type errors from the added module, component, and page

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. T003 depends on T002 (same discovery chain). BLOCKS both user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational (needs `listCharacters()`). T005 depends on T004 (page renders the component).
- **User Story 2 (Phase 4)**: Depends on Foundational and on T004 existing (US2 adds the empty-state branch to the same `CharacterSelect.tsx` created in US1).
- **Polish (Phase 5)**: Depends on US1 + US2 complete.

### User Story Dependencies

- **US1 (P1)**: Independently testable once discovery exists — populated dropdown + selection.
- **US2 (P2)**: Builds on the `CharacterSelect.tsx` file from US1 (adds the empty branch). Not independent of US1's file, but independently *testable* via the empty-state path.

### Within Each User Story

- US1: T004 (component) → T005 (page wiring); optional tests after.
- US2: T008 (empty branch in the existing component); optional test after.

### Parallel Opportunities

- **T002 → T003** are sequential (same discovery chain, same/adjacent files).
- Within US1, **T004 → T005** are sequential (page renders the component).
- Optional tests **T006, T007, T009** touch different new test files → parallelizable with each other.
- **T011** (lint) can run alongside **T010**.
- Note: T004 (US1) and T008 (US2) edit the **same file** (`CharacterSelect.tsx`) → must be sequential, NOT [P].

---

## Parallel Example: optional tests

```bash
# After the implementation tasks, the optional tests are independent files:
Task T006: unit test lib in tests/unit/list-characters.test.ts
Task T007: component test in tests/unit/character-select.test.tsx
Task T009: empty-state component test in tests/unit/character-select-empty.test.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001)
2. Phase 2: Foundational (T002 → T003) — character discovery
3. Phase 3: User Story 1 (T004 → T005) — populated themed dropdown with selection feedback
4. **STOP and VALIDATE**: open `/content-generation`, confirm sorted labels + selection with no side effects (Scenarios A & B)
5. Demo the character selector

### Incremental Delivery

1. Setup + Foundational → `listCharacters()` works
2. US1 → populated dropdown + selection → **MVP demo**
3. US2 → graceful empty state → demo
4. Polish → quickstart validation + lint

---

## Notes

- [P] tasks = different files, no dependencies.
- No content/manifest reads or writes; `character/` is a separate persona library (constitution Principles I–V unaffected — see plan.md Constitution Check).
- Tests (T006, T007, T009) are OPTIONAL; skip without blocking completion (no `tests/` harness exists yet).
- The future generation feature will consume the selected slug produced by this selector.
- Commit after each task or logical group.
