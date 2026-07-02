# Research: Card Overflow Fix & UI Polish

**Feature**: [spec.md](./spec.md) | **Date**: 2026-07-02

This feature fixes a confirmed rendering bug and finishes the visual pass
started in [002-dashboard-visual-redesign](../002-dashboard-visual-redesign/plan.md).
No backend, data, routing, or dependency decisions are revisited — the stack
(Next.js 15, Tailwind v4, existing `components/ui/` primitives) is unchanged.

## Decision 1: Root cause of the chip-clipping bug (verified in code)

**Finding**: The item-card header row in `CalendarGrid.tsx` (line 75) and
`UnscheduledBucket.tsx` (line 29) is:

```
<div className="flex items-center justify-between gap-2">
  <BrandTag … />        ← inline-flex, no truncate, no min-w-0
  <StatusChip … />      ← inline-flex, single-word label, cannot shrink
</div>
```

Three compounding issues:
1. The row has no `flex-wrap`, so when the two children's combined natural
   width exceeds the cell width, they cannot move to separate lines.
2. Flex children default to `min-width: auto`, meaning neither child can
   shrink below its content width — so instead of shrinking, they overflow.
3. `BrandTag` has no max-width/truncation, so a longer brand name pushes the
   chip out even in wider cells.

At `md:grid-cols-7` on a ~768–1100px viewport, each day cell's content area
is roughly 90–120px wide — narrower than "Globex " + "Scheduled"-chip, which
reproduces exactly the reported clipping on the Sun/Mon cells.

**Fix decision**: make the header row `flex flex-wrap` (chip drops to its own
line when it doesn't fit, satisfying FR-004's "moves below rather than
shrinking illegibly"), give the BrandTag wrapper `min-w-0` with `truncate`
and a `max-w` cap on its label span (FR-003), and mark `StatusChip`
`shrink-0 whitespace-nowrap` so it never squeezes (FR-004). Add
`overflow-hidden` to `Card` as a final containment guarantee (FR-001) — with
wrapping and truncation in place it should never trigger, but it makes
"nothing paints outside the card" structurally true rather than emergent.

**Alternatives considered**:
- **Shrink the chip text/padding at narrow widths**: rejected — spec FR-004
  explicitly forbids squeezing chips; wrap-below is the mandated behavior.
- **Container queries per cell**: heavier machinery than needed; flex-wrap +
  min-w-0 solves it with plain CSS behavior.

## Decision 2: Page background — Tailwind `slate-200`

**Decision**: Page background becomes `bg-slate-200` (#e2e8f0). Cards remain
`bg-white`. The near-white `bg-gray-50` (#f9fafb) applied in 002 is the
direct cause of the "still reads as white" complaint — it is only ~1.5%
luminance below pure white, indistinguishable on most monitors.

**Rationale**: Clarification Q1 chose cool light gray. `slate-100` (#f1f5f9)
is still within "reads as white" territory on bright displays; `slate-200`
is unmistakably gray while keeping the app light-themed, and gives white
cards obvious lift (satisfying US2 scenario 3 without needing heavier
shadows). Slate (blue-tinted gray) reads cooler and more "SaaS" than the
neutral gray scale.

**Contrast implications (FR-013)**: text sitting directly on the page
background (section headings, meta text, date-range line, "No content"
labels on non-white cells) must be re-checked. Computed WCAG ratios against
#e2e8f0:
- `gray-500` (#6b7280): ~3.9:1 — **fails** AA for normal text → any
  body-size muted text on the page background moves to `gray-600`.
- `gray-600` (#4b5563): ~5.5:1 — passes.
- `gray-700`/`gray-900`: pass comfortably.
Text *inside* white cards is unaffected (unchanged white surface).

**Alternatives considered**:
- `gray-100`/`slate-100`: rejected — repeats 002's mistake; still reads as
  white at a glance.
- `slate-300`: unambiguously gray but starts to feel heavy/dim as a full-page
  tone and pushes more muted-text tiers below AA.

## Decision 3: Uniform day-cell width and row height

**Finding**: Tailwind's `grid-cols-7` compiles to
`repeat(7, minmax(0, 1fr))`, so equal column widths (FR-005's width half)
are already structurally guaranteed — the visual "unequal card" impression
comes from content overflow (Decision 1), not track sizing. CSS grid items
also stretch to the row height by default (`align-items: stretch`), so
uniform row height (Clarification Q2) is already the browser default; the
002 implementation didn't break it. The remaining work is (a) ensuring
nothing disables that stretch, (b) a consistent `min-h` so sparse weeks
don't collapse, and (c) caption `line-clamp` (already present as
`line-clamp-2`) staying consistent across day cells and unscheduled cards.

**Decision**: keep `grid-cols-7` + default stretch; standardize `min-h` on
day cells; keep `line-clamp-2` as the uniform caption clamp everywhere a
caption preview appears; add `break-words` to caption/label text so
unbroken strings (URLs, hashtag runs — spec Edge Cases) wrap instead of
forcing width.

## Decision 4: Toolbar as one enclosed surface

**Decision**: Per Clarification Q3, wrap the two `SegmentedControl` groups
and the `BrandFilter` row in a single white, rounded (`rounded-xl`),
`shadow-sm`, padded container in `app/(dashboard)/page.tsx`. The date-range
"Showing X – Y" line moves inside the toolbar as its meta text. Controls
keep their existing components — this is composition, not new primitives.

**Alternatives considered**: a new `Toolbar` primitive component in
`components/ui/` — rejected as premature; it's used exactly once, and the
constitution-adjacent "one definition" concern applies to *tokens/styles*
(radius, shadow, padding all come from the same Tailwind scale), not to
requiring every layout grouping be a shared component.

## Decision 5: Elevation & hierarchy polish scope

**Decision**:
- Page header: larger/bolder (`text-3xl font-bold tracking-tight`) so it is
  unambiguously the dominant element (FR-009) over the toolbar and section
  headings.
- Cards: keep `rounded-lg` + `shadow-sm`→`hover:shadow-md` from 002 for item
  cards; day *cells* (currently flat `border` boxes) get the same white
  surface + `shadow-sm` treatment so calendar cells and list cards no longer
  look like two different design languages against the gray background.
  Weekend cells differentiate via a slightly tinted surface (`bg-slate-50`)
  instead of the old gray-on-near-white (which becomes invisible on the new
  gray page background); today keeps its strong border ring.
- Empty cells: muted "No content" stays, and empty cells use a quieter
  surface treatment so full cells visibly stand out (US "empty vs filled"
  contrast carried from the description).

**Rationale**: smallest set of changes that delivers "modern SaaS" reading
without redesigning components again; every value stays on the Tailwind
token scale (no raw hex anywhere new).

## Decision 6: Verification approach (FR-012 — part of definition of done)

**Decision**: Use the existing preview tooling against the running dev
server:
1. Resize viewport to 375px and to ~768px (the 7-column grid's narrowest
   engagement — spec Edge Cases call this the highest-risk width).
2. Programmatic overflow check: for every rendered card, assert
   `element.scrollWidth <= element.clientWidth + 1` and that no descendant's
   bounding box exceeds its card's bounding box (this is stronger and more
   reliable than eyeballing a screenshot, and satisfies "screenshot or
   equivalent inspection" per spec Assumptions).
3. Programmatic background check: computed `background-color` of `body` must
   equal the slate-200 value, not white/near-white.
4. A screenshot of the week view for the human-visible record, if the
   preview tooling cooperates (it timed out in the 002 session; the
   programmatic checks are the authoritative gate, the screenshot is
   best-effort).

**Alternatives considered**: adding Playwright visual-regression tests —
still disproportionate for this project (unchanged from 002 Decision 8),
and FR-012 is explicitly satisfiable by rendered-output inspection.

## Summary of resolved Technical Context

| Item | Resolution |
|---|---|
| Root cause | Non-wrapping flex header row + unshrinkable children + no truncation (verified at CalendarGrid.tsx:75, UnscheduledBucket.tsx:29) |
| Fix pattern | `flex-wrap` + `min-w-0`/`truncate` label + `shrink-0` chip + `overflow-hidden` Card containment |
| Background | `slate-200` page, white cards; muted-on-background text bumped to `gray-600`+ for AA |
| Grid | `grid-cols-7` already equal-width; default grid stretch gives uniform row height; add consistent `min-h` + `break-words` |
| Toolbar | One white rounded elevated container wrapping existing controls (no new primitive) |
| Verification | Programmatic overflow + background-color checks at 375px and ~768px, screenshot best-effort (FR-012 gate) |
| New dependencies | None |
