# Implementation Plan: Character Dropdown on Content Generation Page

**Branch**: `006-character-dropdown` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-character-dropdown/spec.md`

## Summary

Add a "Character" dropdown to the `/content-generation` page whose options are derived at request
time from the immediate subdirectories of the project-root `character/` folder. Each folder name
(slug) is shown as a title-cased, hyphen→space label; options are sorted alphabetically by label;
non-directory entries are excluded. The page reads the character list on the server (dynamic, so
adding/removing a folder changes options on the next load with no code change) and passes it to a
small client component that manages local selection state — showing a "Select a character…"
placeholder by default, echoing the chosen label on selection, and rendering a disabled
"No characters available" state when the folder is empty or missing. No file contents are read, no
persistence, no network/generation logic. Mirrors the existing brand-discovery pattern
(`lib/fs-paths.ts` `listBrandSlugs`, `lib/schedule/list-brands.ts` `slugToDisplayName`).

## Technical Context

**Language/Version**: TypeScript 5.9 (React 19.2)

**Primary Dependencies**: Next.js 15.5 (App Router — server component reads FS, client component
holds selection state), Tailwind CSS 4.3. `node:fs` + `node:path` for directory reads (already
used by `lib/fs-paths.ts`).

**Storage**: Filesystem read-only — enumerates immediate subdirectory names under
`<repo>/character/`. No file contents read; no writes; no manifest/content interaction.

**Testing**: Vitest (unit — directory-listing + label formatting logic), optional Playwright
(e2e) — existing project harnesses. Tests optional per spec.

**Target Platform**: Web (server-rendered React via Next.js App Router)

**Performance Goals**: Directory read is O(number of character folders) on page render; negligible.
Selection is instant client-side state update.

**Constraints**: Options MUST reflect current folders at request/build time (page must render
dynamically, not be frozen by static generation) so folder changes appear on next load without a
code change (FR-001). Reuse existing design system for the control (FR-009). No selection
persistence (ephemeral local state).

**Scale/Scope**: 1 new lib module (character discovery), 1 new client component (the select), and
an edit to the existing `/content-generation` page. Currently 5 character folders; expected to
remain a small handful.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution governs content files (`content/<brand>/…`), the per-brand manifest, and the
Next.js scheduling layer's relationship to them. The `character/` directory is a **separate
persona library**, not brand content, and this feature only enumerates its subfolder names:

- **I. Markdown-as-Source-of-Truth**: ✅ N/A — no content `.md` files are read or written; only
  directory names are listed. No new content store is introduced.
- **II. Brand-Partitioned File Structure**: ✅ N/A — `character/` is not `content/<brand>/`; no
  brand content is touched, moved, or shared.
- **III. Single Manifest for Post & Repost State**: ✅ N/A — no manifest reads or writes; no
  lifecycle state.
- **IV. Next.js as a Thin Scheduling Layer**: ✅ Upheld — the app remains a thin layer. Character
  discovery is a pure, disposable read derived directly from the filesystem (no cache, no second
  store). The result is fully recomputed on each render.
- **V. Explicit Date-Driven Scheduling**: ✅ N/A — no scheduling data involved.

**Result**: PASS. No violations, no Complexity Tracking entries required. (Re-checked post-design
below — still PASS; the design adds only a read-only directory enumeration and local UI state.)

## Project Structure

### Documentation (this feature)

```text
specs/006-character-dropdown/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output
│   └── character-select.md
├── checklists/
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
character/                              # EXISTING data source (persona folders)
├── content-creator/
├── doctor/
├── fitness-trainer/
├── software-developer/
└── teacher/

lib/
├── fs-paths.ts                         # REFERENCE + MODIFY: add CHARACTER_ROOT + listCharacterSlugs()
│                                       #   (mirrors existing CONTENT_ROOT / listBrandSlugs)
└── character/
    └── list-characters.ts              # NEW: listCharacters() → { slug, label }[] sorted by label

app/
└── (dashboard)/
    └── content-generation/
        ├── page.tsx                    # MODIFY: server-read listCharacters(), render CharacterSelect
        └── CharacterSelect.tsx         # NEW: "use client" component — dropdown + local selection state

components/ui/                          # REFERENCE: existing control styling (SegmentedControl, pills)
```

**Structure Decision**: Single Next.js App Router web app. Directory discovery follows the
established brand pattern: a low-level `listCharacterSlugs()` in `lib/fs-paths.ts` (alongside
`listBrandSlugs`) and a `lib/character/list-characters.ts` mapper (mirroring
`lib/schedule/list-brands.ts`) that produces `{ slug, label }` sorted by label. The
`/content-generation` `page.tsx` (server component) calls `listCharacters()` at render time and
passes the array to a new `CharacterSelect.tsx` client component that owns the ephemeral selection
state. The page is rendered dynamically so folder changes appear on the next load.

## Complexity Tracking

> No Constitution Check violations. Section intentionally empty.
