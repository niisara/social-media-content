<!--
Sync Impact Report
Version change: 1.0.0 → 2.0.0
Modified principles:
  - III. Single Manifest for Post & Repost State (Derive, Don't Duplicate)
      → III. Derived Data Is Disposable (Derive, Don't Duplicate)
        (removed lifecycle-state/repost semantics; reframed around regenerable
         projections of the markdown source)
  - IV. Next.js as a Thin Scheduling Layer
      → IV. Next.js as a Thin Presentation & Editing Layer
        (removed scheduling responsibility)
Removed sections:
  - Principle V. Explicit Date-Driven Scheduling (scheduling removed from scope)
Removed concepts throughout: scheduling, dates/timezones, lifecycle status,
  reposts, and target platform (per project scope: content management only)
Added sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (no change needed — Constitution Check gate
    reads this file at plan time; the generic "Target Platform" field refers to the app's
    runtime platform, not social-content targeting)
  - .specify/templates/spec-template.md ✅ (no change needed — generic; its "Status" field
    is document workflow state, unrelated to content lifecycle)
  - .specify/templates/tasks-template.md ✅ (no change needed — generic phased structure)
  - .specify/templates/checklist-template.md ✅ (no change needed — generic)
Follow-up TODOs: none
-->

# Social Media Content Manager Constitution

## Core Principles

### I. Markdown-as-Source-of-Truth

Every piece of social content MUST exist as a standalone `.md` file with YAML
frontmatter capturing caption/body, hashtags, and media references. The
markdown file is the canonical artifact — no database, cache, or generated
index may hold content that does not also exist in its source `.md` file. Any
tool that reads or writes content data MUST do so through these files; a
database or cache MAY exist only as a disposable, regenerable projection of
the markdown files.

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
voices and ownership. Sharing files across brands creates hidden coupling —
an edit intended for one brand silently changes another. Duplication is the
explicit, auditable alternative.

### III. Derived Data Is Disposable (Derive, Don't Duplicate)

Any index, manifest, cache, or search structure the project builds MUST be a
pure projection of the markdown content files — fully rebuildable at any time
by discarding and regenerating it from those files, with no data loss. Such
derived structures MUST NOT hold facts that do not also exist in the markdown
source, and no second, independent copy of content data may be maintained
alongside the files.

**Rationale**: A single canonical source eliminates the class of bugs where
two stores disagree. Keeping every derived structure disposable means it can
be deleted and rebuilt without ceremony, so corruption or schema drift in an
index is always recoverable from the markdown.

### IV. Next.js as a Thin Presentation & Editing Layer

The Next.js application MUST read, edit, and write against the markdown
content files — it MUST NOT become a second content store. Any cache the app
builds (in memory, on disk, or in a database) MUST be fully rebuildable from
the markdown files at any time, with no data loss, by discarding and
regenerating the cache.

**Rationale**: Keeping the application stateless with respect to content
means the app can be redeployed, migrated, or replaced without a data
migration — the markdown files are always sufficient to reconstruct
application state.

## Content & Data Standards

Content frontmatter MUST include, at minimum: a stable unique ID, caption/
body, hashtags, and media references. Schema changes to frontmatter MUST be
applied consistently across all brand folders in the same change — partial
rollouts that leave brands on divergent schemas are not permitted. Any
derived index built over the content MUST carry enough information to
identify the referenced content file and MUST be regenerable from the
markdown source alone.

## Development Workflow & Quality Gates

Any feature plan or task that touches content files, a derived index schema,
or the Next.js layer MUST state in its plan how it upholds Principles I–IV
before implementation begins. Features that introduce a new cache, index, or
derived data store MUST document how that store is rebuilt from the markdown
files, and MUST NOT be approved if the store cannot be regenerated from
source. Cross-brand changes (e.g., a schema migration) MUST be applied to
every brand folder, not a subset, before the change is considered complete.

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

**Version**: 2.0.0 | **Ratified**: 2026-07-02 | **Last Amended**: 2026-07-06
