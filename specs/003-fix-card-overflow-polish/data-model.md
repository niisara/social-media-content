# Design Deltas: Card Overflow Fix & UI Polish

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

No new data entities (explicit non-goals: no manifest/data changes). This
document records the *visual token deltas* against feature 002's design
tokens ([../002-dashboard-visual-redesign/data-model.md](../002-dashboard-visual-redesign/data-model.md))
and the layout-behavior rules this feature introduces.

## Color role deltas

| Role | 002 value | 003 value | Why |
|---|---|---|---|
| `background` (page) | `gray-50` (#f9fafb, reads as white) | `slate-200` (#e2e8f0) | FR-007 / Clarification Q1 — measurably non-white cool gray |
| `surface` (cards, toolbar) | white | white (unchanged) | Cards must pop against the gray page (US2) |
| `surface-weekend` (day cell) | `gray-50` on white page | `slate-50` on white cell family | Old treatment is invisible against the new gray page |
| `text-muted` on page background | `gray-500` | `gray-600` minimum | `gray-500` on slate-200 ≈ 3.9:1, fails AA (FR-013) |
| `text-muted` inside white cards | `gray-500`+ | unchanged | Card surface unchanged; existing ratios hold |

All other roles (brand palette, status chips, warning, danger) are
unchanged from 002 — chips render on their own tinted backgrounds, not the
page background, so the background change does not affect their ratios.

## Layout behavior rules (new in 003)

| Rule | Requirement |
|---|---|
| Card containment | Every `Card` clips its own content (`overflow-hidden`); nothing may paint past the card edge (FR-001) |
| Item-card header row | Wraps (`flex-wrap`); brand label may truncate; chip never shrinks — it drops to the next line when it doesn't fit (FR-002, FR-004) |
| Brand label max width | Defined max width with ellipsis everywhere the label appears: day cards, unscheduled cards, item detail, filter pills (FR-003) |
| Status chip minimums | Fixed comfortable padding, `whitespace-nowrap`, `shrink-0` (FR-004) |
| Week grid tracks | `repeat(7, minmax(0,1fr))` — equal widths guaranteed by track definition, not content (FR-005) |
| Row height | Grid default stretch + shared `min-h` — all cells in a row match the tallest (FR-005 / Clarification Q2) |
| Caption clamp | `line-clamp-2` uniformly in day cells and unscheduled cards; `break-words` so unbroken strings wrap (FR-006, Edge Cases) |
| Date header row in cells | Wrap-safe (Today badge must not overflow narrow cells — Edge Cases) |

## Structural composition (new in 003)

| Element | Treatment |
|---|---|
| Toolbar | One white, `rounded-xl`, `shadow-sm`, padded container in the dashboard page holding: date-nav SegmentedControl, week/month SegmentedControl, date-range meta line, BrandFilter pills (FR-010 / Clarification Q3) |
| Page header | Dominant tier: larger and bolder than any other on-screen text (FR-009) |
| Day cells | Same surface family as cards (white, rounded, `shadow-sm`) so calendar and list cards share one design language (FR-008); weekend = `slate-50` surface; today = strong ring/border; empty = quieter treatment + muted "No content" |

## Verification model (FR-012 — definition of done)

| Check | Method | Pass condition |
|---|---|---|
| No card overflow | Programmatic: per card, `scrollWidth <= clientWidth + 1` and all descendant bounding boxes within card bounding box | Zero violations at 375px and ~768px viewports |
| Non-white background | Programmatic: computed `background-color` of `body` | Equals slate-200 value; not white/near-white |
| Visual record | Screenshot of week view (best-effort; programmatic checks are authoritative) | Human-reviewable render attached/described |
