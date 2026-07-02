# Quickstart: Dashboard Visual Redesign

**Feature**: [spec.md](./spec.md) | **Contracts**: [contracts/ui-components.md](./contracts/ui-components.md)

This is a validation guide for confirming the redesign meets the spec's
user stories without regressing any existing behavior from
[001-scheduling-dashboard](../001-scheduling-dashboard/quickstart.md). It
assumes Tailwind CSS and the shared `components/ui/` primitives (see
research.md) are already wired in.

## Prerequisites

- The fixture content from 001's quickstart (`content/acme/`,
  `content/globex/`) already exists, covering: a scheduled item, a posted
  item, a draft (unscheduled) item, and an untracked file. Add one repost
  entry (via the existing repost flow) so a repost is present to verify
  against, if one doesn't already exist.
- `npm run dev` running.

## Validation scenarios

### 1. Recognize content at a glance by brand and status (User Story 1)

- Open the dashboard with items from both `acme` and `globex` visible
  (switch to month view if needed). Confirm each item's brand is
  identifiable by a consistent color cue, and that the *same* color is used
  for that brand in the calendar, the unscheduled bucket, the brand filter
  pill, and the item detail page.
- Confirm a draft, a scheduled, and a posted item each show a
  differently-colored `StatusChip`, and no two statuses share a color.
- Confirm a repost item shows both its own status chip and a separate
  purple repost indicator — not a status chip that says "reposted."

### 2. Experience a polished, well-typeset page (User Story 2)

- Compare the page title, a section heading (e.g. "Unscheduled"), an item's
  caption, and a piece of meta text (a date). Confirm each is visually
  distinguishable by size and/or weight.
- Confirm there is clear whitespace separating the navigation, calendar,
  unscheduled bucket, and any warning banner — not a tightly packed page.

### 3. Navigate dates and filter brands through clear, interactive controls (User Story 3)

- Confirm the week/month toggle and Previous/Today/Next controls appear as
  one grouped control set (not plain underlined links), with the active
  view/selection clearly marked.
- Confirm "All brands" is visibly marked active by default, and each brand
  pill is rendered in that brand's own accent color.
- Select a brand's filter pill and confirm its active state is visually
  distinguished from the other, now-inactive pills.

### 4. See today and content density highlighted on the calendar (User Story 4)

- Navigate to the week/month containing today's date. Confirm today's cell
  is visually highlighted distinctly from every other date.
- Confirm days with scheduled items look visually "full" (cards visible)
  while empty days look intentionally minimal, not broken.
- If viewing a range that includes a weekend, confirm weekend days are
  subtly visually differentiated from weekdays.

### 5. Distinguish warnings and unscheduled content from normal content (User Story 5)

- With an untracked content file present, confirm its warning banner uses
  a distinct warning treatment (amber/red + icon) clearly different from a
  normal item card.
- Confirm the "Unscheduled" section reads as visually separated and more
  subdued than the dated calendar content above it.

### 6. Use the dashboard comfortably on a small screen (User Story 6)

- Resize the viewport to a common mobile width (~375px).
- Confirm the calendar/week grid stacks into a single column (per
  research.md Decision 6) rather than clipping or overlapping.
- Confirm navigation controls and brand filter pills remain fully visible
  and usable (wrapping as needed) rather than being cut off.

### 7. No functional regressions (SC-003)

Re-run every scenario from
[001-scheduling-dashboard/quickstart.md](../001-scheduling-dashboard/quickstart.md):
date navigation, brand filtering, opening item detail, scheduling a draft,
marking an item posted, and creating a repost. All must behave exactly as
before — only appearance has changed.

## Success check

If all seven scenarios pass, the feature satisfies SC-001 through SC-005 in
[spec.md](./spec.md) without regressing 001's SC-001 through SC-006.
