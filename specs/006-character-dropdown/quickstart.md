# Quickstart & Validation: Character Dropdown

**Feature**: 006-character-dropdown | **Date**: 2026-07-06

Validates the feature end-to-end. References the [character-select contract](./contracts/character-select.md)
(M-1…M-7, U-1…U-7) rather than restating it.

## Prerequisites

- Dependencies installed: `npm install`
- Feature implemented per `tasks.md`.
- `character/` exists at repo root with subfolders (currently: content-creator, doctor,
  fitness-trainer, software-developer, teacher).

## Run the app

```bash
npm run dev
```

Open `http://localhost:3000/content-generation`.

## Manual validation scenarios

### Scenario A — Options are dynamic, formatted, and sorted (M-1…M-4, U-1)

1. Load `/content-generation`.
2. **Expected**: A "Character" dropdown appears below the heading/description, near the
   "coming soon" indicator. Opening it lists: **Content Creator, Doctor, Fitness Trainer,
   Software Developer, Teacher** — human-readable labels, alphabetical by label, with a
   "Select a character…" placeholder selected and no character pre-selected.

### Scenario B — Selection updates local state only, no side effects (U-2, U-3)

1. Pick "Fitness Trainer".
2. **Expected**: The page visibly shows the selected label ("Fitness Trainer"). No network request
   fires (check devtools Network tab — no request results from selecting), nothing is generated,
   and no character file is read.
3. Pick "Teacher" → the displayed selection updates to "Teacher".

### Scenario C — Directories only, stray files excluded (M-2, SC-006)

1. Temporarily add a file `character/README.md` (not a folder).
2. Reload `/content-generation`.
3. **Expected**: "README" does **not** appear as an option; only the five character folders are
   listed. (Remove the temp file afterward.)

### Scenario D — Dynamic source reflects folder changes (M-7, U-1, SC-003)

1. Temporarily add a folder `character/marketing-strategist/`.
2. Reload the page.
3. **Expected**: "Marketing Strategist" now appears in the dropdown, alphabetically placed, with no
   code change. (Remove the temp folder afterward — the option disappears on next reload.)

### Scenario E — Empty / missing directory state (M-5, U-4, SC-005)

1. Temporarily rename `character/` (or empty it of subfolders).
2. Reload the page.
3. **Expected**: The control is disabled and shows "No characters available" — not an empty,
   interactive dropdown. (Restore `character/` afterward.)

### Scenario F — No persistence on reload (U-7)

1. Select a character, then reload the page.
2. **Expected**: The dropdown returns to the "Select a character…" placeholder; the prior choice is
   not remembered.

## Automated checks (optional, matches existing harness)

- **Unit (Vitest)**: test `listCharacters()` against a fixture directory — asserts directories-only
  filtering (M-2), slug→label formatting (M-3), label sort order (M-4), and `[]` for missing/empty
  (M-5). This mirrors how brand discovery logic is unit-tested.
- **Component (Vitest)**: render `CharacterSelect` with a sample `characters` prop → assert
  placeholder default (U-1), selection feedback on change (U-2), and disabled "No characters
  available" when passed `[]` (U-4).
- **E2E (Playwright)**: load `/content-generation`, assert the five sorted labels (Scenario A),
  select one and assert the visible label + no network call (Scenario B).

## Success = all scenarios pass

Maps to spec Success Criteria SC-001…SC-007. When every scenario passes, the character selector is
complete and ready for the future generation flow to consume the selected slug.
