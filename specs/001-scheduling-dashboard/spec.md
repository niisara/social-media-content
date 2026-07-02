# Feature Specification: Scheduling Dashboard

**Feature Branch**: `001-scheduling-dashboard`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "Build a Next.js scheduling dashboard for the social media content project. Purpose: give me a single screen where I can see all content across brands, grouped by scheduled date, and manage its lifecycle without hand-editing manifest files. Core capabilities: (1) Calendar/date view showing all content items on their scheduled date, brand-distinguishable, plus an unscheduled bucket for dateless drafts. (2) Content detail view showing caption, hashtags, media references, target platform(s), and status read directly from the markdown file's frontmatter. (3) Status transitions draft -> scheduled (requires date+timezone) -> posted, written to the brand's manifest file. (4) Repost flow from a posted item creating a new manifest entry referencing the original content file's ID (not copying body text) with its own independent scheduled date. (5) Brand filter respecting the content/<brand>/ folder structure. (6) Read-only on markdown content itself in this version; dashboard only schedules and tracks status. Out of scope: publishing integration with social platforms, analytics, approval workflows."

## Clarifications

### Session 2026-07-02

- Q: If the underlying markdown/manifest files change on disk while the dashboard is open (e.g., hand-edited or updated by another process), how should the dashboard reflect that? → A: Always read fresh from disk on every page load/action — no caching, no refresh button needed.
- Q: Should users be able to navigate the calendar/date view to weeks or months other than the current one? → A: Full navigation — user can move to any past/future week or month, defaulting to the current week on load.
- Q: If a manifest file changes between when the dashboard reads it for a status transition and when it writes the update back, how should the write be handled? → A: Read-modify-write just the target entry, overwriting it with the dashboard's change; fail clearly if the target entry itself is missing/gone by write time.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See everything scheduled across brands (Priority: P1)

As the person managing content across multiple brands, I want to open a single dashboard and see every piece of content grouped by the date it's scheduled for, with each brand visually distinguishable, so I know what's going out and when without opening manifest files by hand.

**Why this priority**: This is the core value of the feature — a unified view replacing manual manifest inspection. Without it, nothing else in the feature has a surface to operate from.

**Independent Test**: Can be fully tested by pointing the dashboard at a set of brand folders with existing manifests and content files, and confirming every scheduled item appears on its correct date with a visible brand indicator, and every dateless draft appears in a distinct "unscheduled" bucket.

**Acceptance Scenarios**:

1. **Given** two brands each with several scheduled items on different dates, **When** I open the dashboard, **Then** I see all items grouped by their scheduled date, each item's brand visually identifiable at a glance.
2. **Given** a brand has a draft item with no scheduled date, **When** I open the dashboard, **Then** that item appears in an "unscheduled" bucket rather than on any date.
3. **Given** items scheduled across multiple weeks, **When** I open the dashboard, **Then** it defaults to showing the current week and I see exactly the items scheduled within that week's date range and no others.
4. **Given** I am viewing the current week, **When** I navigate to a past or future week or month, **Then** the dashboard shows exactly the items scheduled within that newly selected date range.

---

### User Story 2 - Drill into a single item's details (Priority: P1)

As the content manager, I want to click any item on the dashboard and see its full caption, hashtags, media references, target platform(s), and current lifecycle status, so I can confirm what will go out before or after it's posted.

**Why this priority**: Viewing the underlying content is necessary to make any scheduling or status decision confidently; it's the second half of "see everything" and must ship alongside the calendar view for the feature to be useful.

**Independent Test**: Can be fully tested by selecting an item from the dashboard and verifying every displayed field (caption, hashtags, media references, platforms, status) matches the corresponding markdown file's frontmatter exactly, with no discrepancy against a separately stored copy.

**Acceptance Scenarios**:

1. **Given** a scheduled item with a caption, hashtags, media references, and two target platforms, **When** I click it, **Then** I see all of that information displayed, matching its markdown file exactly.
2. **Given** an item's status is "draft", **When** I view its detail, **Then** the displayed status reads "draft" and no scheduled date is shown.
3. **Given** the underlying markdown file changes on disk (e.g., caption edited outside the dashboard), **When** I reopen that item's detail, **Then** the dashboard reflects the updated content, confirming it reads live from the file rather than a cached copy.

---

### User Story 3 - Move an item through its lifecycle (Priority: P2)

As the content manager, I want to move an item from draft to scheduled (by giving it a date and timezone) and later to posted, so the manifest reflects reality without me editing it by hand.

**Why this priority**: This is the primary "management" action the dashboard exists to replace; it depends on Stories 1 and 2 (seeing and inspecting items) being in place first.

**Independent Test**: Can be fully tested by taking a draft item, supplying a date and timezone to move it to "scheduled", confirming the manifest file is updated accordingly, then marking it "posted" and confirming the manifest reflects that too — all verifiable by reading the manifest file after each action.

**Acceptance Scenarios**:

1. **Given** an item with status "draft" and no scheduled date, **When** I attempt to mark it "scheduled" without supplying a date and timezone, **Then** the transition is rejected and I'm prompted to supply both.
2. **Given** an item with status "draft", **When** I supply a valid date and timezone and confirm, **Then** the item's status becomes "scheduled", the manifest file on disk shows the new status and date/timezone, and the item now appears on the dashboard under that date.
3. **Given** an item with status "scheduled", **When** I mark it "posted", **Then** the manifest file on disk shows status "posted" for that item.

---

### User Story 4 - Repost a previously posted item (Priority: P3)

As the content manager, I want to create a repost from an already-posted item without retyping or copying its caption, so the repost stays linked to the original and I only need to give it a new schedule.

**Why this priority**: Valuable but dependent on the lifecycle management in Story 3 being functional first; reposting is a secondary workflow layered on top of the core schedule/status loop.

**Independent Test**: Can be fully tested by selecting a posted item, initiating a repost, supplying an independent date and timezone, and confirming a new manifest entry is created that references the original content file's ID rather than containing a duplicated caption/body.

**Acceptance Scenarios**:

1. **Given** an item with status "posted", **When** I choose to repost it, **Then** I'm asked for a new, independent scheduled date and timezone before the repost can be created.
2. **Given** I've supplied a valid date and timezone for the repost, **When** I confirm, **Then** a new manifest entry is created that references the original item's ID and does not contain a copy of its caption/body text.
3. **Given** a repost has been created, **When** I view the dashboard for the repost's scheduled date, **Then** the repost appears as its own item, distinguishable from the original, and its lifecycle status can progress independently of the original.

---

### User Story 5 - Filter the dashboard by brand (Priority: P2)

As someone managing several brands, I want to narrow the dashboard to one brand or view all brands together, so I can focus on a single brand's schedule when needed.

**Why this priority**: Improves usability once multiple brands are involved, but the dashboard is still useful showing all brands by default without this; it refines Story 1 rather than being foundational.

**Independent Test**: Can be fully tested by selecting a single brand from the filter and confirming only that brand's content items appear across all dates and the unscheduled bucket, then clearing the filter and confirming all brands reappear.

**Acceptance Scenarios**:

1. **Given** content exists for three brands, **When** I filter to one brand, **Then** only that brand's items are shown, on the calendar and in the unscheduled bucket.
2. **Given** a brand filter is active, **When** I clear it, **Then** items from all brands reappear.

---

### Edge Cases

- What happens when a manifest entry references a content file ID that no longer exists on disk (e.g., file deleted or moved)? The dashboard MUST surface this as a visibly broken/missing reference rather than silently omitting or crashing.
- What happens when a content file exists under a brand folder but has no corresponding manifest entry at all? The dashboard MUST surface it as an untracked draft so nothing is silently hidden from view.
- What happens when two items are scheduled for the exact same date and time within the same brand? Both MUST be shown; the dashboard does not treat this as an error or prevent it.
- What happens when a repost target (the original item) is itself later deleted or its file goes missing? The repost entry MUST still display, showing its reference as broken rather than failing to load.
- What happens when a user attempts to mark an item "posted" while it is still in "draft" status (skipping "scheduled")? The transition MUST be rejected — only draft→scheduled and scheduled→posted are permitted moves.
- What happens when the same content ID appears more than once across manifests (e.g., duplicated by mistake)? The dashboard MUST flag the duplicate rather than silently merging or picking one arbitrarily.
- What happens when a manifest entry is removed or changed externally between the dashboard reading it and writing a status transition back? The write MUST fail with a clear error rather than silently succeeding or corrupting the manifest.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard MUST display all content items across all configured brands grouped by their scheduled date, reading date information from each brand's manifest file.
- **FR-001a**: The dashboard MUST default to showing the current week on load, and MUST allow the user to navigate to any other past or future week or month.
- **FR-002**: The dashboard MUST visually distinguish which brand each displayed item belongs to.
- **FR-003**: The dashboard MUST display a distinct "unscheduled" grouping containing all draft items that have no scheduled date.
- **FR-004**: The dashboard MUST let the user select any displayed item to view its full detail: caption/body, hashtags, media references, target platform(s), and current lifecycle status.
- **FR-005**: All detail fields displayed for an item MUST be read directly from that item's markdown content file at the time of viewing; the dashboard MUST NOT persist a separate copy of caption/body content.
- **FR-005a**: The dashboard MUST read content and manifest files fresh from disk on every page load and every action (no in-memory or client-side caching of content/status between requests), so that external edits made to markdown or manifest files are reflected immediately on the next view without requiring a manual refresh control.
- **FR-006**: The dashboard MUST allow transitioning an item from "draft" to "scheduled" only when the user supplies both an explicit date and an explicit timezone for that item.
- **FR-007**: The dashboard MUST reject a draft→scheduled transition attempt that lacks a date or timezone, and MUST inform the user what is missing.
- **FR-008**: The dashboard MUST allow transitioning an item from "scheduled" to "posted".
- **FR-009**: The dashboard MUST NOT allow skipping directly from "draft" to "posted", or moving to any status out of the defined order (draft → scheduled → posted).
- **FR-010**: Every status transition MUST be written to the item's brand manifest file, and the manifest file MUST reflect the change immediately upon confirmation.
- **FR-010a**: Writing a status transition MUST overwrite only the target manifest entry (read-modify-write), leaving all other entries in the manifest untouched. If the target entry no longer exists in the manifest at write time (e.g., removed by an external edit after the dashboard last read it), the write MUST fail with a clear error rather than silently creating or misapplying the change.
- **FR-011**: The dashboard MUST NOT maintain any status or scheduling data outside of the brand manifest files; the manifest remains the sole source of lifecycle truth.
- **FR-012**: The dashboard MUST allow the user to initiate a repost from any item whose status is "posted".
- **FR-013**: Creating a repost MUST require the user to supply an independent date and timezone for the repost, separate from the original item's schedule.
- **FR-014**: Creating a repost MUST create a new manifest entry that references the original content file's ID and MUST NOT duplicate the original's caption/body text into the new entry.
- **FR-015**: A repost entry MUST be independently viewable and MUST progress through the same lifecycle states (draft → scheduled → posted) independently of the original item's status.
- **FR-016**: The dashboard MUST allow filtering the displayed content down to a single brand, corresponding to one `content/<brand>/` folder.
- **FR-017**: The dashboard MUST allow clearing the brand filter to display content from all brands at once.
- **FR-018**: The dashboard MUST NOT provide any means to edit a content file's caption, hashtags, or media references in this version; content files are read-only from the dashboard's perspective.
- **FR-019**: The dashboard MUST be able to answer "what is scheduled for date X" using manifest data alone, without needing to open or parse individual content markdown files.
- **FR-020**: The dashboard MUST surface, rather than hide, any manifest entry whose referenced content file cannot be found on disk.
- **FR-021**: The dashboard MUST surface, rather than hide, any content file that has no corresponding manifest entry.

### Key Entities

- **Content Item**: A standalone markdown file representing one piece of social content. Key attributes: unique ID, caption/body, hashtags, media references, target platform(s), current lifecycle status. Belongs to exactly one brand.
- **Manifest Entry**: A record within a brand's single manifest file describing one content item's (or repost's) lifecycle state. Key attributes: reference to a content item's unique ID, current status (draft/scheduled/posted), scheduled date and timezone (once scheduled), and — for reposts — a reference to the original content item's ID instead of its own body text.
- **Brand**: A named partition corresponding to one `content/<brand>/` folder and one manifest file. All content items and manifest entries belong to exactly one brand.
- **Repost**: A manifest entry that references an existing, already-posted content item's ID rather than introducing new caption/body content, carrying its own independent schedule and lifecycle status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can see everything scheduled for the current week across all brands within a single screen on load, and can reach any other week or month's schedule without opening any manifest or content file directly.
- **SC-002**: A user can go from opening the dashboard to viewing a specific item's full caption, hashtags, media references, and platforms in 2 clicks or fewer.
- **SC-003**: Marking an item "posted" is reflected in the corresponding manifest file on disk within the same user action — no manual file editing required, 100% of the time.
- **SC-004**: Creating a repost never results in the original item's caption/body being duplicated into a new file or manifest entry — verified across all repost creations.
- **SC-005**: A user can filter the dashboard down to a single brand and confirm, with 100% accuracy, that only that brand's items appear.
- **SC-006**: Every scheduled item shown on the dashboard for a given date matches exactly what the brand manifest(s) record for that date, with zero discrepancies.

## Assumptions

- This is a single-user, locally operated tool for the person managing content; no multi-user accounts, roles, or authentication are in scope for this version.
- "Posted" is a manual status the user sets to reflect that they published the content themselves elsewhere; this feature does not verify or trigger any actual publish action on a social platform.
- Media references are displayed as identifying information (e.g., filename or path/URL) in the detail view; rendering full media previews (image/video playback) is not required for this version.
- Status transitions are forward-only in this version (draft → scheduled → posted, plus repost creation from posted); reverting a status (e.g., scheduled back to draft) is out of scope and can be added later if needed.
- When a repost is created from a posted item, the original item's own status and file are left unmodified; the new repost entry begins at "draft" and progresses independently through its own lifecycle.
- The dashboard is expected to operate against the existing `content/<brand>/` folder structure and per-brand manifest files as the constitution defines them; no new brands or folders are created by this feature.
- "This week" and other date-range views use each item's own stored timezone (from its manifest entry) to determine which calendar date it falls on.
