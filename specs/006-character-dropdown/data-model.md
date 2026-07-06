# Phase 1 Data Model: Character Dropdown

**Feature**: 006-character-dropdown | **Date**: 2026-07-06

## Entity: Character (option)

A selectable persona, represented **solely** by an immediate subdirectory under `character/`. This
is an in-memory, read-derived value object — it is not persisted, and none of the folder's contents
are read.

| Field   | Type   | Source / Rule                                                                 |
|---------|--------|-------------------------------------------------------------------------------|
| `slug`  | string | The exact subdirectory name under `character/` (e.g. `software-developer`). Used as the option value and future file-path key. Immutable, unique per folder. |
| `label` | string | Derived from `slug`: split on `-`/`_`, drop empties, upper-case each word's first letter, join with spaces (e.g. `software-developer` → "Software Developer"). Used for display and sort key. |

### Derivation rules (from requirements)

- **Directories only** (FR-004): only entries where `isDirectory()` is true become Characters;
  files directly under `character/` (e.g. `README.md`, `.DS_Store`) are excluded.
- **Dynamic source** (FR-001): the set of Characters is recomputed from the filesystem on each page
  render; no hardcoded list.
- **Ordering** (FR-003): the produced list is sorted ascending by `label` (locale-aware).
- **Missing/empty source** (FR-006): if `character/` does not exist or contains no subdirectories,
  the list is empty (`[]`), which drives the disabled "No characters available" UI state.

### Current instances (informational, not hardcoded)

`content-creator` → "Content Creator", `doctor` → "Doctor", `fitness-trainer` → "Fitness Trainer",
`software-developer` → "Software Developer", `teacher` → "Teacher". Sorted by label:
Content Creator, Doctor, Fitness Trainer, Software Developer, Teacher.

## UI Selection State (client, ephemeral)

| Field            | Type             | Rule                                                                 |
|------------------|------------------|---------------------------------------------------------------------|
| `selectedSlug`   | string \| null   | The currently chosen character's slug, or `null` when the placeholder is shown. Held in client component state only. |

### State rules (from requirements)

- **Default no selection** (FR-005/SC-007): initial `selectedSlug` is `null`; a non-selectable
  "Select a character…" placeholder is shown.
- **Selection feedback** (FR-007): changing `selectedSlug` updates a visible display of the matching
  Character's `label` on the page.
- **No side effects** (FR-008): setting `selectedSlug` triggers no generation, no read of the
  character folder's contents, no persistence, and no network request — it is pure local state.
- **No persistence** (edge case): `selectedSlug` resets to `null` on reload; it is not stored.

## Relationships

- The client `CharacterSelect` receives the server-computed `Character[]` as a prop and maps
  `selectedSlug` back to a `Character` (for its `label`) purely in memory. There are no relationships
  to brands, content items, or the manifest — `character/` is an independent persona library.

## Validation

- No user free-text input exists; the only selectable values are the discovered `slug`s plus the
  non-selectable placeholder. No additional validation is required.
