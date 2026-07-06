# Quickstart & Validation: Character Profile Viewer

**Feature**: 007-character-profile-viewer | **Date**: 2026-07-06

Validates the feature end-to-end. References the [profile-viewer contract](./contracts/profile-viewer.md)
(M-1…M-7, P-1…P-5, U-1…U-4) rather than restating it.

## Prerequisites

- Dependencies installed (incl. new `react-markdown`, `remark-gfm`): `npm install`
- Feature implemented per `tasks.md`.
- `character/<slug>/*-PROFILE.md` files present (current: content-creator, doctor, fitness-trainer,
  software-developer, teacher).

## Run the app

```bash
npm run dev
```

Open `http://localhost:3000/content-generation`.

## Manual validation scenarios

### Scenario A — About action reflects selection & navigates (U-1, U-2)

1. On `/content-generation`, before selecting: confirm the "About {character}" action is disabled.
2. Select "Software Developer" → the action reads "About Software Developer".
3. Click it → the browser moves to `/character/software-developer` without a full reload.

### Scenario B — Profile renders as themed HTML with a real table (P-1, SC-002)

1. On `/character/software-developer` (or content-creator), confirm: a title derived from the
   profile heading (e.g. "Ishita Verma — Content Creator / Freelance Writer" for content-creator),
   `##` sections as headings, `**bold**` as bold, `-` items as bullet lists, and the **Likings**
   section rendered as an actual bordered table — **no raw `|` pipes or `##` shown**.
2. Confirm it uses the app's theme (cards, typography, non-white background), not an unstyled dump.

### Scenario C — Back link restores selection (P-3, U-3, SC-005)

1. From the profile page, click "← Back to Content Generation".
2. **Expected**: URL is `/content-generation?character=software-developer` and the dropdown shows
   "Software Developer" selected (not the placeholder).

### Scenario D — Profile not available (P-2, SC-004)

1. Temporarily create a character folder with no `*-PROFILE.md` (e.g. `character/tester/`), select
   it, and open its About page (`/character/tester`).
2. **Expected**: a clear "Profile not available" state with a working back link — no crash/blank.
3. Also verify `>1` match: add a second `*-PROFILE.md` to a folder → same "Profile not available".
   (Remove temp folders/files afterward.)

### Scenario E — Convention works for new characters (M-2/M-3, SC-003)

1. Add `character/marketing-strategist/MARKETING-STRATEGIST-PROFILE.md` with sample sections + a
   table.
2. On `/content-generation`, select "Marketing Strategist" → About → `/character/marketing-strategist`.
3. **Expected**: the new profile renders with no code change. (Remove afterward.)

### Scenario F — Direct visit & read-only (P-4, P-5, SC-007)

1. Navigate directly to `/character/doctor` (typed URL / refresh).
2. **Expected**: renders fully; presents no edit/generate controls (only the back link).

## Automated checks (optional, matches existing harness)

- **Unit (Vitest)**: `readCharacterProfile` against fixture folders — one match (M-3), zero
  (`profile-missing`), multiple (`profile-ambiguous`), unknown slug (`character-not-found`), title
  derivation (M-5), and path-safety (M-6). Mirrors `read-content-item` testing.
- **Component (Vitest)**: render `ProfileMarkdown` with sample Markdown incl. a GFM table → assert a
  `<table>` element renders (P-1). Render `CharacterSelect` → About disabled with no selection (U-2),
  enabled + correct href when selected (U-1), and `initialSlug` seeds the selection (U-3).
- **E2E (Playwright)**: Scenario A→B→C click-through; assert URL, visible table, and restored
  selection.

## Success = all scenarios pass

Maps to spec Success Criteria SC-001…SC-007.
