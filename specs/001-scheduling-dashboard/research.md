# Research: Scheduling Dashboard

**Feature**: [spec.md](./spec.md) | **Date**: 2026-07-02

This file resolves every technical unknown from the plan's Technical Context.
Each decision is scoped to what the constitution and spec already constrain —
where the constitution or spec already mandates something, no alternative is
evaluated.

## Decision 1: Manifest file format

**Decision**: Each brand manifest is a single YAML file at
`content/<brand>/manifest.yaml`.

**Rationale**: The constitution requires content frontmatter to be YAML, and
the manifest must be a plain, human-diffable file that automation and (per
the spec's Q3 clarification) occasional hand-edits can both touch safely.
YAML keeps the manifest visually consistent with the frontmatter it
describes and stays readable/diffable in git.

**Alternatives considered**:
- **JSON**: simpler to parse with zero ambiguity, but no comments and
  noisier hand-edits (quoting every key). Rejected — the spec explicitly
  anticipates hand-edited manifests, and YAML is friendlier for that.
- **SQLite/embedded DB**: rejected outright — the constitution (Principle I,
  III) forbids a database from holding lifecycle state; the manifest file
  itself must be the canonical, git-diffable artifact.

## Decision 2: Content item identity

**Decision**: A content item's ID is its path relative to `content/`,
e.g. `acme/2026-08-03-launch-teaser.md`. This value is stored in the file's
own frontmatter as `id` (for self-description) and is what manifest entries
reference in their `contentId` field.

**Rationale**: Path-derived IDs are unique by construction (the filesystem
already enforces uniqueness), human-readable, and make the "missing file"
edge case trivial to detect: if `content/<contentId>` doesn't resolve to an
existing file, the reference is broken. No ID-generation step or registry is
needed.

**Alternatives considered**:
- **UUID v4**: collision-proof but opaque, and adds a generation step with
  no benefit at this scale (single user, low volume, files usually created
  by hand or a simple script).
- **Sequential integer IDs**: requires a central counter, which conflicts
  with markdown-as-source-of-truth (the counter would itself need a store).

## Decision 3: Status and schedule live in the manifest only

**Decision**: The manifest is the sole authoritative source for `status`,
`scheduledAt` (date+time), and `timezone`. A content file's frontmatter MAY
carry its own `status` field for human context when someone opens the `.md`
file directly (satisfying the constitution's Principle I list of frontmatter
fields), but the dashboard never reads, writes, or trusts that field — it
always displays and mutates status via the manifest, per Principle III
("derive, don't duplicate") and spec FR-011/FR-019.

**Rationale**: Reconciles two constitution principles that would otherwise
conflict if taken literally: Principle I lists `status` as a frontmatter
concern, Principle III makes the manifest the single source of lifecycle
truth. Treating frontmatter's `status` as a non-authoritative, informational
mirror (not read by the app) avoids ever having two writable copies of the
same fact.

**Alternatives considered**:
- **Status only in manifest, omit from frontmatter schema entirely**:
  simpler, but breaks a content file's ability to self-describe when read in
  isolation (e.g. in an editor), which the constitution's Principle I intent
  seems to want.
- **Status in frontmatter, manifest just indexes**: rejected — this is
  exactly the duplication Principle III prohibits, and creates a real
  divergence risk (which one wins on disagreement?).

## Decision 4: Framework and runtime

**Decision**: Next.js 15 (App Router) with React 19 and TypeScript, running
under the Node.js runtime (not Edge) for every route/action that touches the
filesystem.

**Rationale**: File-system access (`fs`) requires the Node.js runtime. App
Router Server Actions are the idiomatic way to run server-side mutations
(status transitions, repost creation) directly from form submissions without
standing up a separate API layer, keeping the app a "thin" layer per
Principle IV.

**Alternatives considered**:
- **Pages Router + API routes**: legacy pattern; would work but adds
  boilerplate (separate `/api/*` handlers) for no benefit over Server
  Actions in a single first-party app.
- **Edge runtime**: rejected — no `fs` access to markdown/manifest files.

## Decision 5: Server-side data access pattern

**Decision**: All reads and writes go through a small set of server-only
functions (`getScheduleForRange`, `getItemDetail`, `transitionStatus`,
`createRepost`, `listBrands`) documented as the feature's contract in
`contracts/`. These are called as Next.js Server Actions / server
components — no REST/HTTP API is introduced.

**Rationale**: There is exactly one consumer (this app's own UI) in this
feature's scope; an HTTP API would be a second surface to keep in sync for
no current benefit. Documenting the functions as a contract still gives
future automation (per the constitution's "any automation derives status
from this manifest") a stable interface to import directly, since it's the
same codebase's exported functions rather than a network boundary.

**Alternatives considered**:
- **Route Handlers exposing REST endpoints**: deferred — nothing in this
  feature's scope needs cross-process/network access; can be added later
  without changing the underlying functions.

## Decision 6: Frontmatter/manifest parsing and validation

**Decision**: Use `gray-matter` to split markdown body from YAML
frontmatter, the `yaml` package to read/write manifest files, and `zod`
schemas to validate both shapes at read time.

**Rationale**: `gray-matter` is the de facto standard for this exact split.
`zod` gives explicit, typed runtime validation so malformed or
missing fields are caught and surfaced (per the spec's edge cases:
missing files, untracked content, duplicate IDs) instead of throwing
unhandled exceptions or silently coercing bad data.

**Alternatives considered**:
- **Hand-rolled frontmatter splitting/regex**: more error-prone, no benefit
  over a well-tested library.

## Decision 7: Timezone handling

**Decision**: Use `luxon` for all date/timezone arithmetic (storing,
displaying, and computing week/month ranges per an item's stored IANA
timezone).

**Rationale**: The spec requires explicit per-item timezones (constitution
Principle V) and computing "current week" boundaries in a specific
timezone. Luxon's `DateTime` has first-class IANA timezone support and a
more ergonomic zoned-time API than raw `Intl`/`Date` for this.

**Alternatives considered**:
- **date-fns-tz**: also viable; Luxon chosen for its more cohesive
  zoned-DateTime object model, reducing the chance of accidental
  timezone-naive arithmetic.
- **Native `Date`/`Intl`**: rejected — notoriously easy to misuse for
  timezone-aware range math.

## Decision 8: Atomic manifest writes

**Decision**: Every manifest write follows read → locate target entry by
`contentId` → mutate → serialize → write to a temp file in the same
directory → rename over the original manifest file. If the target entry is
not found at write time, the write is aborted and a clear error is returned
(per spec FR-010a).

**Rationale**: Temp-file-then-rename is atomic on POSIX and effectively
atomic on Windows via `fs.renameSync`, preventing a truncated/corrupted
manifest if the process is interrupted mid-write — protecting the one file
the constitution designates as the single source of truth.

**Alternatives considered**:
- **In-place write**: rejected — a crash mid-write could corrupt the
  manifest with no recovery path.
- **File locking (e.g. `proper-lockfile`)**: unnecessary for a single-user
  local tool with no concurrent writers; the read-modify-write-or-fail
  check (Decision from spec clarification) is sufficient at this scale.

## Decision 9: Testing strategy

**Decision**: `vitest` for unit/integration tests of pure logic (frontmatter
parsing, manifest read-modify-write, status-transition validation, date/
timezone range grouping, broken-reference detection), plus a small
`playwright` suite covering the five user-story flows end-to-end (view
calendar, drill into detail, transition status, create repost, filter by
brand).

**Rationale**: The logic most likely to have subtle bugs (file I/O,
timezone math, the write-conflict-detection path) is cheap and valuable to
unit test. A handful of e2e tests validate the actual UI journeys the spec
describes, catching regressions that unit tests alone would miss since
status transitions write real files.

**Alternatives considered**:
- **E2E-only**: rejected — slower feedback loop for the file-I/O edge cases
  that matter most here.
- **Unit-only, rely on manual quickstart validation**: rejected — status
  transitions mutate real files; a few automated e2e checks are cheap
  insurance against silent regressions.

## Summary of resolved Technical Context

| Item | Resolution |
|---|---|
| Language/Version | TypeScript 5.x, Node.js 20 LTS |
| Primary Dependencies | Next.js 15 (App Router), React 19, gray-matter, yaml, zod, luxon |
| Storage | Local filesystem: `content/<brand>/*.md` + `content/<brand>/manifest.yaml` |
| Testing | vitest (unit/integration), playwright (e2e for the 5 user stories) |
| Target Platform | Local Node.js server (localhost), cross-platform dev machine |
| Project Type | Single full-stack Next.js web application (no separate backend) |
| Performance Goals | Current week's schedule loads in <1s at personal scale (tens of brands, low thousands of items) |
| Constraints | No caching between requests (FR-005a); manifest-only answer for "scheduled on date X" (FR-019); read-modify-write-or-fail on manifest entries (FR-010a) |
| Scale/Scope | Single concurrent user; single-digit to low-tens of brands; low thousands of content items per brand over time |
