# Phase 0 Research: Character Profile Viewer

**Feature**: 007-character-profile-viewer | **Date**: 2026-07-06

Clarification deferred one item to planning: the Markdown-rendering mechanism. That plus the other
implementation-pattern choices are resolved below against the existing codebase.

## Decision 1 — Markdown → themed HTML rendering (the deferred item)

- **Decision**: Add `react-markdown` + `remark-gfm` and render the profile in a `ProfileMarkdown`
  component that maps Markdown elements to themed Tailwind components — in particular mapping the
  GFM table to a styled `<table>` (bordered, header row, zebra/rounded to match the item-detail
  cards), headings to the app's typography scale, `**bold**` to `font-semibold`, and `-` lists to
  styled `<ul>`.
- **Rationale**: The profiles use a GFM pipe table ("Likings") that MUST render as a real table
  (FR-005). `remark-gfm` adds table/strikethrough/task-list support that base Markdown lacks.
  `react-markdown` renders to React elements (no `dangerouslySetInnerHTML`) and lets each element be
  styled with existing Tailwind utility classes — matching the app's "utility classes, no global
  component CSS" idiom (the project has no `@tailwindcss/typography` plugin). Works in a server
  component. No sanitization layer is required because profiles are trusted, author-controlled repo
  files (spec assumption), and no HTML is dangerously injected.
- **Alternatives considered**:
  - `marked` (Markdown→HTML string) + `dangerouslySetInnerHTML` + a scoped `.profile` CSS block in
    `globals.css`: fewer deps (1) but requires `dangerouslySetInnerHTML` and hand-written descendant
    CSS that diverges from the app's utility-class styling. Rejected for weaker theming fit.
  - Adding `@tailwindcss/typography` (`prose`) for a marked/HTML approach: pulls a larger styling
    system and still needs an HTML pipeline; heavier than a targeted component map. Rejected.
  - Hand-rolled Markdown parser: brittle for tables/edge cases; rejected.

## Decision 2 — Profile file resolution by convention

- **Decision**: Add `lib/character/read-character-profile.ts` exposing a `readCharacterProfile(slug)`
  returning a typed result `{ ok: true, title, markdown } | { ok: false, reason }`. Resolve the
  character dir as `path.join(CHARACTER_ROOT, slug)`; guard the resolved path stays within
  `CHARACTER_ROOT` (mirror the `startsWith` check in `read-content-item.ts`); if the dir is missing
  return not-available; `readdirSync` and filter entries matching `/-PROFILE\.md$/i` that are files;
  require **exactly one** match (0 or >1 → not-available); `fs.readFileSync(match, "utf8")`.
- **Rationale**: FR-004 requires convention-based matching (`*-PROFILE.md`), not per-character
  hardcoding, so a new character folder works automatically (SC-003). FR-008 requires the
  zero/multiple/missing/non-existent cases to yield a clear "Profile not available" state — a typed
  err result lets the page render that cleanly without throwing. Path-safety mirrors the existing
  content reader, preventing slug traversal (`../`).
- **Alternatives considered**: Hardcoding `<SLUG>-PROFILE.md` per slug — violates FR-004. Throwing on
  missing and catching in the page — the existing codebase favors typed ok/err results
  (`ContentReadResult`), so match that. Case-sensitive match — the real files are uppercase, but a
  case-insensitive regex is more robust to convention drift.

## Decision 3 — Page title derivation from the profile

- **Decision**: Derive the page title from the profile's own top `#` heading plus the `## Name`
  value: e.g. from `# Profession Profile — Content Creator / Freelance Writer` and `## Name` →
  **Ishita Verma** produce "Ishita Verma — Content Creator / Freelance Writer" by combining the Name
  with the role portion of the H1 (strip a leading "Profession Profile — " prefix). If the heading
  or name is absent, fall back to the character's slug-derived display label (feature 006's
  `slugToLabel`).
- **Rationale**: FR-007 wants a title derived from the profile's own heading; the example in the
  spec matches Name + role. A defined fallback satisfies the "profile heading missing" edge case
  without failing the page.
- **Alternatives considered**: Using only the slug label — loses the richer name/role title the spec
  asks for. Using only the raw H1 — misses the person's Name; combining both matches the example.

## Decision 4 — Route, navigation, and disabled About action

- **Decision**: New dynamic route `app/(dashboard)/character/[slug]/page.tsx` → `/character/<slug>`
  (server component, read profile at render). The About action lives inside `CharacterSelect`
  (client) as a `next/link` to `/character/<slug>` when a character is selected; when nothing is
  selected it renders as a disabled, non-interactive element (FR-002). The profile page's back link
  is `next/link` to `/content-generation?character=<slug>`.
- **Rationale**: The About label/target depend on the client-held selection, so the action belongs in
  the existing client `CharacterSelect`. `next/link` gives client-side navigation (FR-003) and the
  back link matches the item-detail pattern (FR-007). Dynamic route reflects the current profile file
  per request.
- **Alternatives considered**: A server-rendered About button outside the select — can't see the
  client selection without lifting state or a round-trip; rejected. `useRouter().push` — unnecessary
  vs. a plain themed `Link`.

## Decision 5 — Selection restoration on return

- **Decision**: Carry the slug via `?character=<slug>` on the back link. The `/content-generation`
  page reads `searchParams.character`, validates it against `listCharacters()`, and passes a valid
  slug as `initialSlug` to `CharacterSelect`, which seeds `useState` from it (falling back to the
  placeholder when absent/invalid).
- **Rationale**: FR-010/SC-005 require the dropdown to re-show the previously viewed character. A
  query param is robust (survives refresh/deep-link) and keeps the selector's state model simple.
  Validating against the known list avoids trusting an arbitrary query value.
- **Alternatives considered**: Client-only state preserved across navigation — App Router unmounts
  the page, so local state is lost; a query param is the reliable mechanism. Persisting selection
  (localStorage) — the spec's prior feature intentionally kept selection ephemeral; scope the
  restoration to the round-trip only.

## Decision 6 — Reuse the back-nav page shell

- **Decision**: Reuse the item-detail/`content-generation` back-nav header bar (rounded bar,
  `← Back to Content Generation` link + small uppercase context label) and themed card(s) for the
  profile body and title (FR-006, FR-007). The global theme (non-white body, typography) applies via
  the root layout.
- **Rationale**: Avoids a one-off layout; matches established patterns.
- **Alternatives considered**: A bespoke layout — rejected per FR-007 and to stay consistent.

## Outcome

All unknowns resolved. New deps: `react-markdown`, `remark-gfm` (presentation only). No content/
manifest interaction, no API routes. Ready for Phase 1 design artifacts.
