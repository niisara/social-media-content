# Contract: Character Profile Viewer

**Feature**: 007-character-profile-viewer | **Date**: 2026-07-06

No network/HTTP API. Contracts are (1) the profile-resolution module, (2) the profile route/page
behavior, and (3) the About action + selection restoration. Captured for test assertions.

## Module Contract — `readCharacterProfile(slug)`

**Location**: `lib/character/read-character-profile.ts`.

**Signature (conceptual)**: `readCharacterProfile(slug: string): ProfileResult` where
`ProfileResult = { ok: true; slug; title; markdown } | { ok: false; reason }` and `reason ∈
{ "character-not-found", "profile-missing", "profile-ambiguous" }`.

| ID   | Rule |
|------|------|
| M-1  | Resolves the character folder as `character/<slug>/`; if it does not exist → `{ ok:false, reason:"character-not-found" }`. |
| M-2  | Finds files matching `/-PROFILE\.md$/i` (case-insensitive) directly in the folder (FR-004). |
| M-3  | Exactly one match → reads it and returns `{ ok:true, slug, title, markdown }`. |
| M-4  | Zero matches → `{ ok:false, reason:"profile-missing" }`; more than one → `{ ok:false, reason:"profile-ambiguous" }` (FR-008). |
| M-5  | `title` is derived from the profile heading + `## Name` (role from H1 with "Profession Profile — " stripped), falling back to the slug display label when absent (FR-007). |
| M-6  | The resolved file path MUST stay within `CHARACTER_ROOT`; a traversal slug (`../…`) is rejected as not-found (path safety). |
| M-7  | Reads only; never writes/modifies the file (FR-009). Recomputed per call (no cache). |

## Route/Page Contract — `/character/[slug]`

**Location**: `app/(dashboard)/character/[slug]/page.tsx`.

| ID   | Given → When → Then |
|------|---------------------|
| P-1  | Given a slug with one well-formed profile → on visit → the page renders the derived title and the profile body as themed HTML: headings, bold, bullet lists, and the Likings **table as an actual `<table>`** (no raw pipes/markdown symbols). (FR-005, FR-006, FR-007, SC-002) |
| P-2  | Given any `ok:false` result (missing/ambiguous/not-found) → on visit → the page shows a clear "Profile not available" state with a working back link, not a crash/blank. (FR-008, SC-004) |
| P-3  | The page header includes a "← Back to Content Generation" link to `/content-generation?character=<slug>`, consistent with the item-detail back-nav pattern. (FR-007, FR-010) |
| P-4  | Direct visit/refresh of `/character/<slug>` renders correctly (server-rendered), independent of arriving from the dropdown. (edge case) |
| P-5  | The page presents no controls to edit/generate/modify — read-only. (FR-009, SC-007) |

## UI Contract — About action + restoration (`CharacterSelect`)

**Location**: `app/(dashboard)/content-generation/CharacterSelect.tsx` (client) and
`.../content-generation/page.tsx` (server, reads `?character=`).

| ID   | Given → When → Then |
|------|---------------------|
| U-1  | Given a character is selected → an "About {label}" action (e.g. "About Software Developer") is shown, linking to `/character/<slug>`; activating it client-navigates to the profile (no full reload). (FR-001, FR-003, SC-001) |
| U-2  | Given no character is selected → the "About {character}" action is disabled/non-interactive. (FR-002, SC-006) |
| U-3  | Given the user returns via the profile's back link (`?character=<slug>`) → the page reads and validates the param and `CharacterSelect` initializes with that character selected (not the placeholder). (FR-010, SC-005) |
| U-4  | Given `?character=` is absent or not a known character → the dropdown shows the placeholder (no selection). (robustness) |

## Out of Scope (No Contract)

No editing/creation of characters or profiles, no AI/generation calls, no manifest/content-file
access, no persistence beyond the round-trip query param, no HTTP endpoint.
