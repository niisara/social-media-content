# Implementation Plan: Character Profile Viewer

**Branch**: `007-character-profile-viewer` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-character-profile-viewer/spec.md`

## Summary

Add an "About {character}" action beside the Character dropdown on `/content-generation` that
client-navigates to a new `/character/[slug]` route rendering that character's profile. The route
resolves the single `*-PROFILE.md` file in the character's folder by convention, reads it on the
server, and renders its Markdown (headings, bold, bullet lists, and the GFM "Likings" table) as
themed HTML using the app's design system — reusing the item-detail back-navigation shell with a
"← Back to Content Generation" link. Missing/multiple/non-existent profiles render a "Profile not
available" state. Returning carries the slug (`?character=<slug>`) so the dropdown re-selects it.
Read-only; no content/manifest interaction, no AI.

## Technical Context

**Language/Version**: TypeScript 5.9 (React 19.2)

**Primary Dependencies**: Next.js 15.5 (App Router). New: `react-markdown` + `remark-gfm` for
Markdown→React rendering with GFM table support. Existing: `node:fs`/`node:path` (directory +
file read), Tailwind CSS 4.3. Reuses feature 006's `lib/character` discovery.

**Storage**: Filesystem read-only — reads one `*-PROFILE.md` per character folder. No writes, no
manifest/content interaction.

**Testing**: Vitest (unit — profile resolution + title derivation), optional Playwright (e2e) —
existing harnesses. Tests optional per spec.

**Target Platform**: Web (server-rendered React via Next.js App Router)

**Performance Goals**: One directory scan + one file read per profile view; negligible. Markdown
render happens server-side.

**Constraints**: Render must reflect the current profile file at request time (dynamic route). The
`*-PROFILE.md` match must be by pattern, not hardcoded per character (FR-004). Must reuse the
existing back-nav shell + theme (FR-006, FR-007). Path-safety: resolved file must stay within the
character folder (mirror `read-content-item.ts` `startsWith` guard).

**Scale/Scope**: 1 new lib module (profile resolution), 1 new dynamic route + a small "profile
body" rendering component, edits to `CharacterSelect.tsx` (About button + `initialSlug`) and the
`/content-generation` page (read `?character=`). Adds 2 runtime dependencies.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution governs social content files (`content/<brand>/…`), the per-brand manifest, and
the app's relationship to them. The `character/` directory is a separate persona library; this
feature reads a profile file **only for display**:

- **I. Markdown-as-Source-of-Truth**: ✅ N/A — no social content `.md` under `content/` is read or
  written; the profile is persona reference material, not scheduled content. No new content store.
- **II. Brand-Partitioned File Structure**: ✅ N/A — `character/` is not `content/<brand>/`; no
  brand content touched.
- **III. Single Manifest for Post & Repost State**: ✅ N/A — no manifest reads/writes; no lifecycle
  state.
- **IV. Next.js as a Thin Scheduling Layer**: ✅ Upheld — the profile is read fresh from disk on
  each request and rendered; no cache, no second content store, fully regenerable from the file.
- **V. Explicit Date-Driven Scheduling**: ✅ N/A — no scheduling data.

**Result**: PASS. No violations, no Complexity Tracking entries. Adding `react-markdown`/`remark-gfm`
is a presentation dependency and does not create a content store. (Re-checked post-design — still
PASS.)

## Project Structure

### Documentation (this feature)

```text
specs/007-character-profile-viewer/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── profile-viewer.md
├── checklists/
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
character/                                   # EXISTING data source
└── <slug>/<SLUG>-PROFILE.md                 # one profile file per character (read-only)

lib/
├── fs-paths.ts                              # REFERENCE: CHARACTER_ROOT (from feature 006)
└── character/
    ├── list-characters.ts                   # REFERENCE: Character { slug, label } (feature 006)
    └── read-character-profile.ts            # NEW: resolve *-PROFILE.md, read it, derive title →
                                             #      { ok: true, title, markdown } | { ok: false, reason }

app/
└── (dashboard)/
    ├── content-generation/
    │   ├── page.tsx                          # MODIFY: read ?character= searchParam → pass initialSlug
    │   └── CharacterSelect.tsx               # MODIFY: accept initialSlug; add disabled-aware
    │                                         #         "About {label}" Link → /character/<slug>
    └── character/
        └── [slug]/
            ├── page.tsx                      # NEW: /character/[slug] — read profile, back-nav shell,
            │                                 #      "Profile not available" fallback
            └── ProfileMarkdown.tsx           # NEW: react-markdown + remark-gfm with themed
                                              #      component mapping (table, headings, lists, bold)
```

**Structure Decision**: Single Next.js App Router web app. Profile resolution lives in
`lib/character/read-character-profile.ts` (mirrors `read-content-item.ts`: fs read + path-safety
guard + typed ok/err result). The dynamic route `app/(dashboard)/character/[slug]/page.tsx`
resolves to `/character/<slug>` (route group adds no path), reuses the item-detail back-nav header,
and delegates Markdown rendering to `ProfileMarkdown.tsx` (react-markdown + remark-gfm with a
Tailwind component map so the GFM table renders as a themed table). `CharacterSelect.tsx` gains the
About action and an `initialSlug` prop; the content-generation page reads `?character=` to restore
selection.

## Complexity Tracking

> No Constitution Check violations. Section intentionally empty.
