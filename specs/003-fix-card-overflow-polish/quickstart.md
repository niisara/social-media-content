# Quickstart: Card Overflow Fix & UI Polish

**Feature**: [spec.md](./spec.md) | **Contracts**: [contracts/component-changes.md](./contracts/component-changes.md)

Validation guide for this bug-fix + polish pass. Scenario 1 and Scenario 6
together constitute FR-012's definition of done — this feature is not
complete until they pass against rendered output.

## Prerequisites

- Fixture content from 001 (`content/acme/`, `content/globex/`) present.
- For US4 (long brand names): temporarily add a brand folder with a long
  name, e.g. `content/extraordinarily-long-brand-name-inc/` containing a
  `manifest.yaml` with one draft entry and a matching content file. Remove
  it after validation.
- Dev server running (`npm run dev`).

## Validation scenarios

### 1. No card overflow at any width (User Story 1 — FR-012 gate, part 1)

- Navigate to the week containing the scheduled fixtures (e.g. Jul 5 /
  Jul 6, 2026) so cards with brand label + "Scheduled" chip render.
- At ~768px viewport width (7-column grid at its narrowest — highest-risk
  width): programmatically verify for every card element that
  `scrollWidth <= clientWidth + 1` and that every descendant's bounding box
  lies inside its card's bounding box. Zero violations required.
- Repeat at 375px viewport width. Zero violations required.
- Visually confirm (screenshot best-effort): the previously-clipped
  "Scheduled" chip on narrow Sun/Mon cells now either sits beside the brand
  label or wraps below it — never cut off at the card edge.

### 2. Non-white background everywhere (User Story 2 — FR-012 gate, part 2)

- Programmatically read the computed `background-color` of `body` on the
  dashboard AND on an item detail page: both must equal the cool light gray
  token value (slate-200), not white or near-white.
- Visually confirm cards and the toolbar read as white surfaces clearly
  lifted off the gray page.

### 3. Uniform day-cell sizing (User Story 3)

- With one day holding a long-caption item and adjacent days empty, verify
  all 7 columns have equal widths (bounding-box widths within 1px) and all
  cells in the row have equal heights (grid stretch) at desktop width.
- Verify the long caption clamps to 2 lines with an ellipsis and a long
  unbroken string (add a URL to a fixture caption temporarily) wraps rather
  than widening the card.

### 4. Long brand name degrades gracefully (User Story 4)

- With the long-name brand fixture in place, verify its label truncates
  with an ellipsis in: a day card, the unscheduled bucket, the brand filter
  pill, and the item detail header — with zero overflow in any of them.
- Verify status chips everywhere keep full padding and untruncated labels.

### 5. Toolbar and hierarchy polish (User Story 5)

- Verify the date navigation, week/month toggle, date-range line, and brand
  filter pills all sit inside one white rounded elevated container.
- Verify the page title is visibly the most prominent text on screen.
- Verify day cells and item cards share the same surface treatment family
  (rounding + shadow) against the gray background; weekend cells subtly
  tinted; today's cell distinctly highlighted; empty cells quiet with
  muted "No content".

### 6. Contrast spot-check (FR-013)

- Verify muted/secondary text that sits directly on the gray page
  background (section headings, date-range line, "No content") uses tones
  at or above the AA threshold for the new background (per
  [research.md](./research.md) Decision 2: `gray-600` minimum on
  slate-200).

### 7. Zero functional regressions (FR-011)

- Re-run 001's core flows: navigate weeks/months, filter by brand, open an
  item detail, schedule a draft (check manifest on disk), mark it posted,
  create a repost. All must behave identically to before this pass.
- Confirm no files under `lib/manifest/`, `lib/schedule/get-*`,
  `app/actions/`, or `content/` (beyond temporary fixtures added above)
  were modified.

## Success check

Scenarios 1–7 passing = SC-001 through SC-006 satisfied, including FR-012's
rendered-output verification as part of completion — not after it.
