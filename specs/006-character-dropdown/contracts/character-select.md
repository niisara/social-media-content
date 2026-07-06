# Contract: Character Discovery & Select

**Feature**: 006-character-dropdown | **Date**: 2026-07-06

This feature exposes no network/HTTP API. Its contracts are (1) an internal module function that
discovers characters and (2) the UI behavior of the select control. Both are captured so tests can
assert against them.

## Module Contract — `listCharacters()`

**Location**: `lib/character/list-characters.ts` (backed by `listCharacterSlugs()` in
`lib/fs-paths.ts`).

**Signature (conceptual)**: `listCharacters(): Character[]` where `Character = { slug: string;
label: string }`.

| ID   | Rule |
|------|------|
| M-1  | Returns one entry per **immediate subdirectory** of `<repo>/character/`. |
| M-2  | Non-directory entries directly under `character/` are excluded (FR-004). |
| M-3  | `slug` equals the exact folder name; `label` is the hyphen/underscore→space, title-cased form (FR-002). |
| M-4  | The array is sorted ascending by `label` (locale-aware) (FR-003). |
| M-5  | If `character/` is absent or has no subdirectories, returns `[]` (FR-006 empty-state driver). |
| M-6  | Reads directory names only — never opens or reads any file inside a character folder (FR-008, non-goals). |
| M-7  | Result is recomputed per call (no memoized/hardcoded list) so folder changes are reflected on the next render (FR-001). |

## UI Contract — `CharacterSelect` (client component)

**Location**: `app/(dashboard)/content-generation/CharacterSelect.tsx`. Receives
`characters: Character[]` as a prop (server-computed).

| ID   | Given → When → Then |
|------|---------------------|
| U-1  | Given `characters` is non-empty → on render → a labeled "Character" dropdown lists every character by `label`, in the received (alphabetical) order, plus a non-selectable "Select a character…" placeholder selected by default; no character is pre-selected. (FR-003, FR-005, FR-007, SC-001, SC-007) |
| U-2  | Given the dropdown is shown → when the user picks a character → the page visibly shows that character's `label` (selection feedback) and **no** generation, character file-content read, persistence, or network request occurs. (FR-007, FR-008, SC-004) |
| U-3  | Given a character is selected → when the user picks a different one → the displayed label updates to the new selection. (FR-007) |
| U-4  | Given `characters` is empty (`[]`) → on render → the control is disabled and shows "No characters available"; no options are selectable. (FR-006, SC-005) |
| U-5  | The control is styled with the existing design-system utilities (rounded, theme border/background, consistent typography) — not a raw unstyled `<select>`. (FR-009) |
| U-6  | The control appears on the `/content-generation` page below the "Content Generation" heading/description and near the "coming soon" indicator. (FR-009) |
| U-7  | On page reload, selection returns to the placeholder (no persistence). (edge case) |

## Out of Scope (No Contract)

No reading of character folder contents, no AI/generation calls, no selection persistence, no
manifest or content-file access, no HTTP endpoint.
