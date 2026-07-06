# Phase 1 Data Model: Character Profile Viewer

**Feature**: 007-character-profile-viewer | **Date**: 2026-07-06

## Entity: Character Profile (read result)

The displayable profile for one character, produced by reading the single `*-PROFILE.md` in that
character's folder. Represented as a typed result value (no persistence, read-only).

**Success shape** `{ ok: true, ... }`:

| Field      | Type   | Source / Rule                                                                      |
|------------|--------|------------------------------------------------------------------------------------|
| `slug`     | string | The character folder name the profile belongs to (validated to exist).             |
| `title`    | string | Derived display title — Name (`## Name` value) + role (from the top `#` heading, "Profession Profile — " prefix stripped). Falls back to the slug's display label if heading/name absent. (FR-007) |
| `markdown` | string | The raw Markdown body of the profile file, rendered to themed HTML by the viewer.  |

**Failure shape** `{ ok: false, reason }`:

| Field    | Type   | Rule                                                                                 |
|----------|--------|--------------------------------------------------------------------------------------|
| `reason` | enum   | One of: `character-not-found` (no such folder), `profile-missing` (0 matches), `profile-ambiguous` (>1 match). All map to the same "Profile not available" UI. (FR-008) |

### Resolution & validation rules (from requirements)

- **Convention match** (FR-004): the profile is the single directory entry matching `/-PROFILE\.md$/i`
  that is a file, inside `character/<slug>/`. Not hardcoded per character.
- **Cardinality** (FR-008): exactly one match → `ok: true`; zero → `profile-missing`; more than one →
  `profile-ambiguous`.
- **Existence** (FR-008): a `slug` with no corresponding folder → `character-not-found`.
- **Path safety**: the resolved file path MUST stay within `CHARACTER_ROOT` (guard against `../`
  traversal), mirroring `lib/content/read-content-item.ts`.
- **Freshness**: read fresh from disk per request (dynamic route); no caching (constitution IV).
- **Read-only** (FR-009): the file is only read; never written or modified.

## Rendered content structure (informational)

Each profile Markdown contains (current five characters): a top `#` heading, then `##` sections —
Name, Nature, Characteristics, Family/Relatives, Hobby, Location — and a `## Likings (tit-bits)`
GFM table of `| Category | Preference |` rows. The viewer renders:

| Markdown construct        | Rendered as (themed)                                  |
|---------------------------|-------------------------------------------------------|
| `#` / `##` headings       | Typography-scale headings                              |
| `**bold**`                | `font-semibold` text                                   |
| `-` bullet lists          | Styled `<ul>`                                          |
| pipe table (Likings)      | Actual `<table>` with header row + bordered cells (FR-005) |

## UI Selection State (client, from feature 006 — extended)

| Field          | Type            | Rule                                                                       |
|----------------|-----------------|----------------------------------------------------------------------------|
| `selectedSlug` | string \| null  | Chosen character; seeds the About action's target and label.               |
| `initialSlug`  | string \| null  | NEW prop — a validated slug from `?character=` used to seed `selectedSlug` on mount, restoring selection after returning from a profile (FR-010). Null/invalid → placeholder. |

### State rules

- **About action** (FR-001/FR-002): label is "About {selected label}"; disabled (non-interactive)
  when `selectedSlug` is null; otherwise links to `/character/<selectedSlug>`.
- **Restoration** (FR-010/SC-005): when `initialSlug` is a valid known character, `selectedSlug`
  initializes to it (dropdown pre-selected); otherwise the placeholder shows.

## Relationships

- A **Character Profile** is keyed by the existing **Character** (`{ slug, label }`, feature 006).
  No relationship to brands, content items, or the manifest — `character/` is an independent persona
  library.
