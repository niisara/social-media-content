# Phase 0 Research: Character Dropdown

**Feature**: 006-character-dropdown | **Date**: 2026-07-06

The spec had no `[NEEDS CLARIFICATION]` markers and clarification found none. Remaining decisions
are implementation-pattern choices, resolved below against the existing codebase.

## Decision 1 — Directory discovery (dynamic source, directories only)

- **Decision**: Add `CHARACTER_ROOT = path.join(process.cwd(), "character")` and
  `listCharacterSlugs(): string[]` to `lib/fs-paths.ts`, directly mirroring the existing
  `CONTENT_ROOT` / `listBrandSlugs()`: guard with `fs.existsSync`, `readdirSync(root, {
  withFileTypes: true })`, filter `entry.isDirectory()`, map to `entry.name`, and `.sort()`.
- **Rationale**: Reuses a proven, in-repo pattern for exactly this problem (enumerate subfolder
  names as slugs). `withFileTypes` + `isDirectory()` satisfies FR-004 (exclude stray files like
  `README.md`/`.DS_Store`). `existsSync` guard satisfies the "directory missing entirely" edge
  case (returns `[]`, driving the empty state). Recomputed on each call → no cache, no code change
  needed when folders change (FR-001).
- **Alternatives considered**: A hardcoded list — explicitly forbidden by FR-001. Async `fs/promises`
  — unnecessary; the existing sibling code is synchronous and this runs during server render of a
  tiny directory. Globbing — heavier than needed.

## Decision 2 — Slug → display label formatting

- **Decision**: Produce the label by splitting the slug on `-`/`_`, filtering empties, upper-casing
  the first letter of each word, and joining with spaces — the same transform as
  `slugToDisplayName()` in `lib/schedule/list-brands.ts`. Keep the raw slug as the option's value.
- **Rationale**: FR-002 requires hyphens→spaces + title-case for display while the value stays the
  exact folder name. This logic already exists and is battle-tested for brand slugs; keeping the
  behavior identical avoids surprising inconsistency (`software-developer` → "Software Developer").
- **Alternatives considered**: Extracting a single shared `slugToTitleCase` util used by both brands
  and characters — attractive but out of scope; `slugToDisplayName` is currently private to
  `list-brands.ts`. To avoid touching brand code and risking regressions, the character mapper
  re-implements the same tiny transform locally (noted as a possible future refactor, not required).

## Decision 3 — Alphabetical order by label

- **Decision**: In `listCharacters()`, sort the resulting `{ slug, label }` array by `label` using
  a locale-aware comparison (`a.label.localeCompare(b.label)`).
- **Rationale**: FR-003/SC-002 require alphabetical order by displayed label regardless of on-disk
  order. Sorting by label (not slug) is the correct key; for the current folders slug-order and
  label-order coincide, but sorting by label is future-proof (e.g. a folder whose label diverges).
- **Alternatives considered**: Sorting slugs only (as `listBrandSlugs` does) — insufficient because
  the spec's ordering key is the label. Sorting in the component — the server mapper is the single
  place responsible for producing an ordered list; keep ordering there.

## Decision 4 — Server read + client selection split

- **Decision**: The `/content-generation` `page.tsx` stays a server component and calls
  `listCharacters()` at render time, passing the array as a prop to a new client component
  `CharacterSelect.tsx` (`"use client"`) that holds the selected slug in `useState` and renders the
  selection feedback.
- **Rationale**: Directory reads require server/Node (`node:fs`); selection interactivity requires
  client state. The App Router idiom is exactly this split — server does I/O, passes plain data to a
  client island. Satisfies FR-007 (local selection state + visible label) and FR-008 (no
  network/generation — selection is pure client state, nothing is fetched).
- **Alternatives considered**: A fully client component fetching an API route for characters —
  rejected: adds a network call the spec forbids and an endpoint we don't need. A server-only
  component with URL/searchParam-driven selection — rejected: FR-008 forbids persistence and a
  navigation/round-trip is heavier than local state; the spec wants ephemeral local UI state.

## Decision 5 — Dynamic rendering (reflect current folders on next load)

- **Decision**: Ensure the page is rendered dynamically (e.g. `export const dynamic =
  "force-dynamic"`, or equivalently avoid static caching of the character read) so the option list
  reflects the folders present at request time.
- **Rationale**: FR-001/SC-003 require that adding/removing a `character/` subfolder changes options
  on the next page load with no code change. Under default static generation, the directory read
  could be frozen at build time. Forcing dynamic rendering keeps the read per-request, matching the
  spec's "request/build time" derivation and the assumption that a reload reflects current folders.
- **Alternatives considered**: Time-based `revalidate` — adds a staleness window inconsistent with
  "changes on next load". Leaving default caching — risks a stale/build-frozen list, violating
  FR-001.

## Decision 6 — Empty / disabled state & placeholder

- **Decision**: When `listCharacters()` returns `[]`, `CharacterSelect` renders a disabled control
  showing "No characters available" (FR-006). When non-empty, the control shows a non-selectable
  "Select a character…" placeholder as the default (no pre-selection, FR-005/SC-007). Style the
  control with the existing theme utility classes (rounded, slate border/background, `text-sm`) so
  it is not a raw `<select>` (FR-009).
- **Rationale**: Directly encodes the spec's default/empty-state requirements. A disabled control
  with an explicit message is clearer than an empty menu.
- **Alternatives considered**: Hiding the control entirely when empty — rejected; the spec wants a
  visible "No characters available" affordance. Auto-selecting the first character — explicitly
  forbidden by FR-005.

## Outcome

All implementation-pattern unknowns resolved by mirroring existing repo conventions. No new
dependencies, no API routes, no content/manifest interaction. Ready for Phase 1 design artifacts.
