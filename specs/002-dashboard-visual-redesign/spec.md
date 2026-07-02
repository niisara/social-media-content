# Feature Specification: Dashboard Visual Redesign

**Feature Branch**: `002-dashboard-visual-redesign`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "Redesign the scheduling dashboard UI to be visually modern and engaging while keeping all existing functionality (week/month view navigation, brand filters, untracked-content warnings, unscheduled bucket). Purpose: the current dashboard is functionally correct but looks like an unstyled prototype (plain black/white, default browser typography, no visual hierarchy). It needs to feel like a polished product someone would want to open every day, not a wireframe. Visual direction covers: (1) distinct, centrally-defined per-brand accent colors applied consistently everywhere; (2) card design with elevation, rounded corners, spacing, and a clear brand/caption/status hierarchy, with status chips color-coded (draft=neutral, scheduled=blue, posted=green, reposted=purple); (3) calendar grid highlighting today, differentiating full vs. empty days, and optionally weekends; (4) a real typographic scale and increased whitespace; (5) navigation/filter controls redesigned as grouped, stateful controls instead of plain links; (6) visually distinct warning styling for untracked content and a muted, separated treatment for the unscheduled bucket; (7) responsive behavior so the week grid adapts on small screens. Non-goals: no new functionality, no new data fields, no manifest schema or scheduling logic changes — purely a visual/UX redesign layer on top of existing behavior. Success: the dashboard feels like a considered product with clear visual hierarchy, instantly recognizable brand colors, at-a-glance status, and no default browser styling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recognize content at a glance by brand and status (Priority: P1)

As the person managing content across brands, I want each item's brand and lifecycle status to be instantly recognizable from its color and layout alone, so I can scan the dashboard quickly without reading every line of text.

**Why this priority**: This is the core of the redesign's value — going from "functionally correct but illegible at a glance" to "scannable." Without it, the redesign hasn't achieved its purpose no matter how polished other details look.

**Independent Test**: Can be fully tested by viewing the dashboard with content from multiple brands in multiple statuses (draft, scheduled, posted, and a repost) and confirming each item's brand and status are identifiable purely from color/visual treatment, without reading the caption text.

**Acceptance Scenarios**:

1. **Given** items from two different brands are visible on the same screen, **When** I look at the dashboard, **Then** I can tell which item belongs to which brand purely from a consistent color cue, and that same color is used for that brand everywhere it appears (calendar, unscheduled bucket, filter pill).
2. **Given** items with different lifecycle statuses (draft, scheduled, posted) are visible, **When** I look at each item's card, **Then** each shows a distinctly colored status indicator and no two different statuses share the same color.
3. **Given** an item is a repost of another item, **When** I look at its card, **Then** it shows a visual indicator marking it as a repost, in addition to (not instead of) its own current lifecycle status.

---

### User Story 2 - Experience a polished, well-typeset page (Priority: P1)

As a daily user of the dashboard, I want clear typographic hierarchy and comfortable spacing throughout the page, so it feels like a considered product rather than unstyled default browser output.

**Why this priority**: Typography and spacing affect every single screen and element; without this foundation, improvements to any individual component (cards, nav, calendar) still sit inside a page that reads as a wireframe.

**Independent Test**: Can be fully tested by comparing the page title, section headings, card text, and meta text (dates, brand labels) and confirming each occupies a visually distinct size/weight tier, with clear whitespace separating major sections.

**Acceptance Scenarios**:

1. **Given** the dashboard is open, **When** I compare the page title, a section heading, an item's caption, and a piece of meta text (like a date), **Then** each is visually distinguishable from the others by size and/or weight.
2. **Given** the dashboard has multiple sections (navigation, calendar, unscheduled bucket, warnings), **When** I view the full page, **Then** there is clear visual separation (whitespace) between sections rather than everything being tightly packed together.

---

### User Story 3 - Navigate dates and filter brands through clear, interactive controls (Priority: P2)

As the content manager, I want the date navigation (Previous/Today/Next, week/month toggle) and brand filter to look and feel like real interactive controls with obvious active states, so I always know what I'm currently viewing.

**Why this priority**: These controls are used on every visit, but the dashboard is still functional without this polish (Story 1 and 2 deliver the bulk of the "feels considered" value); this story refines an already-working interaction.

**Independent Test**: Can be fully tested by switching between week/month views and toggling brand filters, confirming at each step which option is currently active is visually obvious, and that the controls are grouped as a cohesive set rather than a row of plain text links.

**Acceptance Scenarios**:

1. **Given** I am viewing the week view, **When** I look at the view toggle, **Then** it's visually clear that "week" is the active selection versus "month."
2. **Given** no brand filter is applied, **When** I look at the brand filter controls, **Then** "All brands" is visibly marked active, and each individual brand pill uses that brand's own accent color rather than a generic default.
3. **Given** I select a specific brand's filter pill, **When** the filter is applied, **Then** that pill's active state is visually distinguished from the other, now-inactive pills.

---

### User Story 4 - See today and content density highlighted on the calendar (Priority: P2)

As the content manager, I want today's date and days with scheduled content to stand out visually on the calendar, so I can immediately orient myself and see which days need attention.

**Why this priority**: This meaningfully improves daily usability of the calendar view specifically, but the dashboard remains usable without it once Stories 1–3 are in place.

**Independent Test**: Can be fully tested by viewing a week or month that includes today's date along with a mix of days that have and don't have scheduled items, confirming today is visually distinct from other days, and days with content look visually "full" compared to empty days.

**Acceptance Scenarios**:

1. **Given** today's date falls within the currently displayed range, **When** I view the calendar, **Then** today's cell is visually highlighted in a way no other date is.
2. **Given** a mix of days with and without scheduled items, **When** I view the calendar, **Then** days with content are visually distinguishable from empty days, and empty days look intentionally minimal rather than like a missing/broken cell.

---

### User Story 5 - Distinguish warnings and unscheduled content from normal content (Priority: P3)

As the content manager, I want the "untracked content" warning and the "unscheduled" section to look visually different from normal scheduled content, so I don't confuse a data-integrity warning with a real dated post, and unscheduled drafts don't visually compete with what's actually scheduled.

**Why this priority**: These are secondary, lower-frequency areas of the page (most days there may be no untracked content at all); refining their visual treatment is a polish pass on top of the core redesign.

**Independent Test**: Can be fully tested by viewing the dashboard with at least one untracked content item and one unscheduled draft present, confirming the warning area is visually distinct (e.g., warning coloring) and the unscheduled section reads as visually separate and less prominent than dated calendar content.

**Acceptance Scenarios**:

1. **Given** an untracked content file exists, **When** I view the dashboard, **Then** the untracked content warning is styled distinctly from normal item cards, using a visual treatment that reads as a warning/alert.
2. **Given** unscheduled draft items exist, **When** I view the dashboard, **Then** the unscheduled section is visually separated from the dated calendar content and uses a noticeably more subdued treatment.

---

### User Story 6 - Use the dashboard comfortably on a small screen (Priority: P3)

As someone who might check the dashboard from a phone or narrow browser window, I want the calendar and page layout to adapt rather than break, so the dashboard stays usable at smaller widths.

**Why this priority**: Most day-to-day use is expected on a desktop screen (this is a personal scheduling tool), so this is the lowest-priority refinement, but it prevents the redesign from looking broken if opened on a smaller device.

**Independent Test**: Can be fully tested by viewing the dashboard at a narrow (mobile-width) viewport and confirming the week/calendar grid adapts (e.g., stacks or scrolls) without any content being clipped, overlapping, or requiring horizontal page scrolling to read.

**Acceptance Scenarios**:

1. **Given** the dashboard is viewed at a narrow mobile-width viewport, **When** I view the calendar/week grid, **Then** it adapts (stacking or scrolling horizontally within its own area) rather than clipping or overlapping content.
2. **Given** the dashboard is viewed at a narrow viewport, **When** I view navigation controls and brand filters, **Then** they remain fully visible and usable without being cut off.

### Edge Cases

- What happens when there are more brands than there are distinct colors in the accent palette? Colors MAY repeat across brands once the palette is exhausted, but each individual brand's own color MUST still stay consistent everywhere it appears.
- What happens when a caption is very long? Cards MUST handle long text gracefully (e.g., truncation or wrapping) without breaking the card's layout or pushing other elements off-screen.
- What happens when a single day has many scheduled items? The calendar cell MUST handle overflow gracefully (e.g., internal scrolling or a "+N more" indicator) rather than expanding uncontrollably or clipping content.
- What happens when there is no content at all (empty brand, empty manifest)? Empty states MUST still look visually intentional and styled, not like unstyled placeholder text.
- What happens when a brand's accent color would produce poor text contrast against its background? Status/brand color treatments MUST preserve readable contrast regardless of which color a given brand is assigned.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every displayed content item MUST show its brand's accent color consistently (e.g., as a border, tag, or background accent) in every view where it appears — calendar, unscheduled bucket, item detail, and brand filter.
- **FR-002**: Each brand's accent color MUST come from one central, reusable definition rather than being independently chosen or duplicated within each screen or component.
- **FR-003**: Each content item's card MUST visually separate three pieces of information at a glance: which brand it belongs to, its caption, and its current lifecycle status.
- **FR-004**: An item's lifecycle status (draft, scheduled, or posted) MUST be shown as a distinctly colored, scannable indicator, with a different color for each of the three states.
- **FR-005**: An item that is a repost of another item MUST display a visual indicator marking it as a repost, separate from — and shown in addition to — its own lifecycle status indicator.
- **FR-006**: Content cards MUST use visual elevation (e.g., shadow or border), rounded corners, and comfortable internal padding so they read as distinct objects rather than plain inline text.
- **FR-007**: The calendar view MUST visually highlight the current date distinctly from all other displayed dates.
- **FR-008**: The calendar view MUST visually differentiate days that contain scheduled items from days that contain none, so empty days read as intentionally minimal rather than broken.
- **FR-009**: The calendar view MUST apply a subtle, distinct visual treatment to weekend days so they are distinguishable from weekdays.
- **FR-010**: The page MUST use a consistent type scale that visually distinguishes, at minimum: the page title, section headings, primary content text (e.g., captions), and secondary/meta text (e.g., dates, brand names).
- **FR-011**: Major sections of the page MUST be visually separated by consistent whitespace rather than packed tightly together.
- **FR-012**: The date-range navigation controls (Previous / Today / Next) and the week/month view toggle MUST be presented as a visually grouped, interactive control set, with the currently active view/selection clearly indicated.
- **FR-013**: Brand filter options MUST be presented as selectable pills/buttons with a clearly distinguished active vs. inactive visual state, using each brand's own accent color rather than a generic default.
- **FR-014**: The "untracked content" warning MUST use a visually distinct warning treatment (e.g., warning color and icon) clearly different from normal scheduled-content styling.
- **FR-015**: The "unscheduled" section MUST be visually separated from dated calendar content and use a visibly more subdued treatment so it does not compete for attention with scheduled items.
- **FR-016**: The calendar/week view MUST remain usable at narrow (mobile-width) viewports, either by stacking days or allowing horizontal scrolling, without clipping or overlapping content.
- **FR-017**: Every existing interactive behavior (date navigation, view toggling, brand filtering, opening item detail, scheduling, marking posted, creating a repost) MUST continue to work exactly as before — this feature changes appearance only, not behavior.
- **FR-018**: All status and brand color indicators MUST maintain readable text contrast against their background at all times.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can correctly identify which brand a given item belongs to purely from its color cue, without reading any text, on first glance.
- **SC-002**: A user can correctly state an item's lifecycle status (draft/scheduled/posted) purely from its status indicator, without opening the item, on first glance.
- **SC-003**: 100% of existing functional flows (date navigation, view toggling, brand filtering, viewing item detail, scheduling, marking posted, creating a repost) continue to work identically after the redesign, with zero functional regressions.
- **SC-004**: The dashboard remains fully usable — no clipped, overlapping, or horizontally-scrolling-page content — at both a common mobile viewport width (~375px) and common desktop widths.
- **SC-005**: When compared side-by-side with the pre-redesign version, the dashboard is assessed as visually polished and product-like rather than an unstyled prototype.

## Assumptions

- This is a presentation/styling-only change: no new data fields, manifest schema changes, or scheduling/business logic changes are introduced, per the feature's explicit non-goals.
- "Configurable per brand" accent colors are satisfied by one centralized, reusable color-assignment definition applied consistently across every view; this does not require a new settings UI or a persisted per-brand color preference, since introducing a stored color preference would itself be a new data field, which is explicitly out of scope.
- The "reposted = purple" treatment is implemented as a separate repost indicator/badge shown alongside the existing three-state (draft/scheduled/posted) status indicator, rather than as a fourth lifecycle status value — the underlying data model only ever has three lifecycle statuses; a repost is a distinct entry that independently carries one of those three statuses.
- Today-highlighting and weekend differentiation are purely visual cues; they do not change which items are considered "in range" for a given calendar view.
- No new pages, routes, or navigation destinations are introduced; the existing dashboard and item-detail pages are restyled, not restructured.
- Accessibility scope for this pass is limited to readable color contrast; a full accessibility audit (e.g., screen-reader-specific redesign) is not required.
- "Success" for SC-005 is validated through direct visual review (a before/after comparison) rather than an automated metric, since visual polish is inherently a qualitative judgment.
