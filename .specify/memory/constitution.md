<!--
Sync Impact Report
Version change: [TEMPLATE] → 1.0.0
Modified principles: N/A (initial ratification — all 5 principle slots filled for the first time)
Added sections:
  - Core Principles I–V (Markdown-as-Source-of-Truth, Brand-Partitioned File Structure,
    Single Manifest for Lifecycle State, Next.js as a Thin Scheduling Layer,
    Explicit Date-Driven Scheduling)
  - Content & Data Standards
  - Development Workflow & Quality Gates
  - Governance
Removed sections: none (template placeholders replaced)
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (no change needed — Constitution Check gate already
    generic and reads from this file at plan time)
  - .specify/templates/spec-template.md ✅ (no change needed — generic, principles apply via
    plan/tasks review)
  - .specify/templates/tasks-template.md ✅ (no change needed — generic phased structure
    accommodates manifest/markdown-driven task types)
  - .specify/templates/checklist-template.md ✅ (no change needed — generic)
Follow-up TODOs: none
-->

# Social Media Content Manager Constitution

## Core Principles

### I. Markdown-as-Source-of-Truth

Every piece of social content MUST exist as a standalone `.md` file with YAML
frontmatter capturing caption/body, hashtags, media references, target
platform(s), and status. The markdown file is the canonical artifact — no
database, cache, or generated index may hold content that does not also exist
in its source `.md` file. Any tool that reads or writes content data MUST do
so through these files; a database or cache MAY exist only as a disposable,
regenerable projection of the markdown files.

**Rationale**: Treating markdown as canonical keeps content portable,
diffable in version control, and recoverable without a running service or
database — the content survives even if the application layer is rebuilt
from scratch.

### II. Brand-Partitioned File Structure

Content MUST live under `content/<brand>/...`, with exactly one folder per
brand. No file may serve two brands: if the same idea applies to multiple
brands, it MUST be duplicated into each brand's folder as independent files
rather than shared or referenced across brand boundaries.

**Rationale**: Brands are isolated business contexts with independent
voices, schedules, and ownership. Sharing files across brands creates
hidden coupling — an edit intended for one brand silently changes another.
Duplication is the explicit, auditable alternative.

### III. Single Manifest for Post & Repost State (Derive, Don't Duplicate)

Each brand MUST have exactly one manifest/index file that is the single
source of truth for lifecycle state (`draft` → `scheduled` → `posted` →
`reposted`). The Next.js app and any automation MUST derive status by
reading this manifest — they MUST NOT maintain a second, independent copy
of lifecycle state. Reposts MUST reference the original content file's ID;
they MUST NOT duplicate the original's body text.

**Rationale**: A single manifest per brand eliminates the class of bugs
where two stores disagree about whether something was posted. Referencing
original content by ID for reposts keeps the body text edit in one place
and makes the relationship between a post and its reposts explicit and
queryable.

### IV. Next.js as a Thin Scheduling Layer

The Next.js application MUST read, schedule, and write against the
markdown content files and the per-brand manifest — it MUST NOT become a
second content store. Any cache the app builds (in memory, on disk, or in
a database) MUST be fully rebuildable from the markdown files and manifest
at any time, with no data loss, by discarding and regenerating the cache.

**Rationale**: Keeping the application stateless with respect to content
means the app can be redeployed, migrated, or replaced without a data
migration — the markdown files and manifest are always sufficient to
reconstruct application state.

### V. Explicit Date-Driven Scheduling

Every post MUST carry an explicit date/time with timezone in its
frontmatter before it leaves `draft` status. Reposts MUST be scheduled as
distinct manifest entries with their own explicit date/time — a repost's
schedule MUST NOT be inferred (e.g., from an offset or a default interval).
The system MUST be able to answer "what is scheduled for date X" using the
manifest alone, without reading or parsing individual content files.

**Rationale**: Explicit, queryable scheduling data prevents ambiguity about
when content goes live across timezones and prevents silent drift when
reposts are inferred rather than deliberately planned.

## Content & Data Standards

Content frontmatter MUST include, at minimum: a stable unique ID, caption/
body, hashtags, media references, target platform(s), and status. Reposts
MUST carry a reference field pointing to the original content file's ID and
MUST NOT copy the original's caption/body into their own frontmatter or
body. Manifest entries MUST carry enough information to identify the
referenced content file, its current lifecycle state, and (once scheduled)
its explicit date/time with timezone. Schema changes to frontmatter or the
manifest MUST be applied consistently across all brand folders in the same
change — partial rollouts that leave brands on divergent schemas are not
permitted.

## Development Workflow & Quality Gates

Any feature plan or task that touches content files, the manifest schema,
or the Next.js scheduling layer MUST state in its plan how it upholds
Principles I–V before implementation begins. Features that introduce a new
cache, index, or derived data store MUST document how that store is
rebuilt from markdown + manifest, and MUST NOT be approved if the store
cannot be regenerated from source. Cross-brand changes (e.g., a schema
migration) MUST be applied to every brand folder and manifest, not a
subset, before the change is considered complete.

## Governance

This constitution supersedes any conflicting practice, template default, or
ad hoc convention used elsewhere in this project. Amendments require: (1) a
documented rationale for the change, (2) an update to this file with a
version bump per the policy below, and (3) a review of dependent templates
(plan, spec, tasks, checklist) for consistency with the amendment.

Versioning policy (semantic versioning applied to governance):
- **MAJOR**: Backward-incompatible removal or redefinition of a principle
  (e.g., abandoning markdown-as-source-of-truth or brand partitioning).
- **MINOR**: Addition of a new principle or section, or material expansion
  of existing guidance.
- **PATCH**: Wording clarifications, typo fixes, and non-semantic
  refinements that do not change what is required or forbidden.

All plans, specs, and task lists MUST be checked against this constitution
during the `/speckit-plan` Constitution Check gate. Any deviation MUST be
justified in that plan's Complexity Tracking section or the plan MUST be
revised to comply. Compliance is reviewed at plan time and again after
design (Phase 1), before implementation begins.

**Version**: 1.0.0 | **Ratified**: 2026-07-02 | **Last Amended**: 2026-07-02
