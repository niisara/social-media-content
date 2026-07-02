# Feature Specification: Card Overflow Fix & UI Polish

**Feature Branch**: `003-fix-card-overflow-polish`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "Fix card layout overflow bugs and deliver a genuinely polished, non-white UI for the scheduling dashboard. Specific reproducible bug: on narrower calendar day cards (e.g. 'Sun, Jul 5' / 'Mon, Jul 6' cells), the status chip gets clipped/cut off and overflows past the right edge of the card instead of wrapping or shrinking. The brand name + status chip header row must always stay fully inside the card at every card width, down to the narrowest day-cell width in the 7-day week grid. Root cause: the brand label + status chip row is laid out as a fixed inline row that doesn't respond to the card's available width — must wrap, truncate, or reflow so nothing renders outside the card boundary at any viewport width down to mobile. Additional requirements: (1) actually deliver a non-white cohesive page background this time; (2) all 7 day cards equal width/height regardless of content, with consistent caption truncation; (3) chips/labels get minimum comfortable padding plus max-width with ellipsis for long brand names; (4) real visual hierarchy — standout page header, cohesive toolbar grouping for controls, modern SaaS card elevation; (5) verification requirement: confirm via rendered output at the narrowest supported width that nothing overflows any card boundary and the background is not white before marking complete. Non-goals: no new functional features, no manifest/data model changes."

## Clarifications

### Session 2026-07-02

- Q: Which direction should the non-white page background take — warm off-white, cool light gray, or a subtle brand tint? → A: Cool light gray — classic SaaS dashboard feel, white cards pop clearly, neutral against every brand accent color.
- Q: Should all 7 day cells share a uniform row height (stretching to the tallest cell), or only a shared minimum height with independent growth? → A: Equal width AND uniform row height — all 7 cells match the tallest cell in the row; empty days stretch too.
- Q: Should the toolbar be an enclosed surface (controls inside one container) or an open grouping (aligned controls directly on the background)? → A: Enclosed toolbar — one white, rounded, subtly elevated container holds the date navigation, week/month toggle, and brand filters together.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Card content never overflows its boundary (Priority: P1)

As the content manager scanning the week view, I want every element inside a day card — brand label, status chip, caption, badges — to stay fully within that card's visible boundary at every card width, so the calendar is readable and doesn't look broken on narrow cells or small screens.

**Why this priority**: This is a reproducible rendering bug, visible today on ordinary desktop widths ("Sun, Jul 5" / "Mon, Jul 6" cells clip the "Scheduled" chip). A dashboard that visibly clips its own content is broken regardless of how polished anything else is — this must be fixed first.

**Independent Test**: Can be fully tested by rendering the week view with items whose brand-label + status-chip rows are wider than the narrowest day cell, at desktop width and at a narrow (~375px) viewport, and confirming via rendered output that no element extends past any card's boundary.

**Acceptance Scenarios**:

1. **Given** the 7-day week view at a desktop width where day cells are at their narrowest, **When** a card contains a brand label and a status chip whose combined natural width exceeds the cell width, **Then** the row wraps, shrinks, or truncates so both remain fully inside the card — nothing is clipped by or rendered past the card edge.
2. **Given** the dashboard at a narrow mobile viewport (~375px), **When** any card renders, **Then** all of its content remains inside its boundary with no horizontal clipping or overflow.
3. **Given** an item that carries a status chip, a repost badge, and a broken-reference indicator all at once, **When** its card renders at the narrowest supported cell width, **Then** all indicators remain fully visible inside the card (wrapping onto additional lines as needed).

---

### User Story 2 - A deliberate non-white theme is visibly applied (Priority: P1)

As a daily user, I want the page to have an obviously intentional, soft non-white background with cards standing out as lighter surfaces on top of it, so the dashboard reads as a designed product instead of a white page with boxes on it.

**Why this priority**: This was the intent of the prior redesign but the delivered background still reads as plain white/near-white. It's the single most visible "unfinished" signal on the page and is called out explicitly as still missing.

**Independent Test**: Can be fully tested by inspecting the rendered page background color and confirming it is measurably not white (not #ffffff or visually indistinguishable from it), that cards render as visibly distinct surfaces against it, and that the same background appears on both the dashboard and item detail screens.

**Acceptance Scenarios**:

1. **Given** the dashboard is open, **When** the page background is inspected in the rendered output, **Then** it is a soft neutral or subtly tinted tone that is measurably and visibly not white.
2. **Given** any screen of the app (dashboard, item detail), **When** viewed, **Then** the same non-white background is applied — no screen falls back to a white body background.
3. **Given** cards sit on the new background, **When** viewed, **Then** each card is visibly distinguishable from the background as an elevated surface (not white-on-white or same-tone-on-same-tone).

---

### User Story 3 - Uniform day-card sizing in the week grid (Priority: P2)

As the content manager, I want all 7 day cards in the week view to be equal width and consistent in height regardless of how much content each contains, so the grid stays orderly and one long caption can't distort the layout.

**Why this priority**: Directly supports the calendar's scannability, but the dashboard is functional without it once overflow (US1) is fixed; this is about grid discipline rather than broken rendering.

**Independent Test**: Can be fully tested by rendering the week view with one day containing a very long caption and others containing little or nothing, and confirming all 7 columns remain equal width and the long-caption card truncates its text rather than growing to distort the row.

**Acceptance Scenarios**:

1. **Given** the week view with uneven content across days, **When** rendered at desktop width, **Then** all 7 day columns are equal width and share a uniform height matching the tallest cell — empty days occupy the same footprint as full days.
2. **Given** a card whose caption is very long, **When** it renders inside a day cell, **Then** the caption is truncated to a consistent number of lines with an ellipsis rather than expanding the card or overflowing it.

---

### User Story 4 - Chips and labels handle long brand names gracefully (Priority: P2)

As someone who may add brands with longer names in the future, I want status chips and brand labels to have comfortable minimum padding and a defined maximum width with ellipsis truncation, so a long brand name degrades gracefully instead of breaking the card layout.

**Why this priority**: Preventive robustness on top of US1's fix — current fixtures have short names (Acme, Globex), but the layout must not silently assume that.

**Independent Test**: Can be fully tested by introducing a brand with a long name (e.g. a 30+ character folder name) into the content structure and confirming its label truncates with an ellipsis inside cards and filter pills while chips retain their padding, with no overflow anywhere.

**Acceptance Scenarios**:

1. **Given** a brand with a long display name, **When** its label renders inside a day card, **Then** the label truncates with an ellipsis at a defined maximum width instead of pushing the status chip out of the card.
2. **Given** any status chip, **When** rendered anywhere, **Then** it retains comfortable internal padding and its text is never squeezed or clipped.

---

### User Story 5 - Cohesive toolbar and modern card polish (Priority: P3)

As a daily user, I want the page header to stand out, the date navigation / view toggle / brand filters to read as one cohesive toolbar, and cards to carry enough rounding and elevation to feel like a modern SaaS product, so the whole page feels finished.

**Why this priority**: Pure polish on top of the structural fixes — valuable for the "considered product" goal but nothing is broken without it.

**Independent Test**: Can be fully tested by viewing the dashboard and confirming: the page title is visually dominant, the control groups sit together in one visually contained toolbar region (not scattered rows), and cards have visible rounded corners and elevation against the new background.

**Acceptance Scenarios**:

1. **Given** the dashboard is open, **When** viewing the top of the page, **Then** the page header is clearly the most visually prominent text element on screen.
2. **Given** the navigation controls, view toggle, and brand filter, **When** viewed together, **Then** they sit inside one enclosed, elevated toolbar container with consistent control heights and spacing between groups.
3. **Given** cards on the page, **When** viewed against the non-white background, **Then** they show consistent rounded corners and a visible (but soft) elevation treatment.

### Edge Cases

- What happens when a single day cell contains multiple items, each with chips and badges? Every item card MUST individually contain its content; the cell grows vertically, never horizontally.
- What happens at viewport widths between mobile and desktop (e.g. tablet ~768px) where the 7-column grid first engages and cells are at their absolute narrowest? This is the highest-risk width for overflow and MUST be explicitly verified.
- What happens when a brand display name contains no spaces (one long unbroken word)? Truncation MUST still apply — an unbreakable string must not force the card wider.
- What happens when the caption itself contains a very long unbroken string (e.g. a URL or hashtag run)? It MUST wrap or truncate within the card rather than forcing horizontal overflow.
- What happens on the "Today" cell, which carries a highlight treatment plus a "Today" badge next to the date? The extra badge MUST NOT cause the date header row to overflow at narrow cell widths.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No element inside any card (brand label, status chip, repost badge, broken-reference indicator, caption, date header) may render outside or be clipped by its card's boundary, at any supported viewport width from ~375px up to common desktop widths.
- **FR-002**: The brand-label + status-chip header row inside item cards MUST respond to the card's available width — wrapping to additional lines and/or truncating the label — rather than assuming a fixed width.
- **FR-003**: Brand labels MUST have a defined maximum width with ellipsis truncation for names that exceed it, everywhere they appear (day cards, unscheduled cards, item detail, filter pills).
- **FR-004**: Status chips MUST retain a defined minimum comfortable padding and MUST never have their text clipped or squeezed; a chip that cannot fit beside the brand label moves below it rather than shrinking illegibly.
- **FR-005**: All 7 day columns in the week view MUST be equal width AND share a uniform row height — every cell stretches to match the tallest cell in the row (with a sensible minimum height), so empty days occupy the same footprint as full days.
- **FR-006**: Captions inside day cells MUST be truncated to a consistent maximum number of lines with an ellipsis; long captions MUST NOT expand a card horizontally or distort the grid.
- **FR-007**: The page background MUST be a cool light gray tone — measurably and visibly different from pure white — applied globally to every screen (dashboard and item detail alike) from the single existing central theme definition, not per-screen. Cards remain white/near-white surfaces so they visibly "pop" against the gray background.
- **FR-008**: Cards MUST render as visibly distinct elevated surfaces against the non-white background, with consistent rounded corners and a soft shadow treatment shared by all card types.
- **FR-009**: The page header MUST be the most visually prominent text element on the dashboard.
- **FR-010**: The date navigation group, week/month toggle, and brand filter MUST present as one cohesive toolbar: all three control groups sit inside a single white, rounded, subtly elevated container on the gray background, with consistent control heights and consistent spacing between groups — not loose stacked rows on the page background.
- **FR-011**: All existing interactive behaviors (date navigation, view toggle, brand filtering, item detail, scheduling, marking posted, reposting) MUST continue to work identically — this is a rendering/styling pass only.
- **FR-012**: Before the feature is considered complete, the week view MUST be verified via rendered output (screenshot or equivalent inspection) at the narrowest supported width, confirming zero card-boundary overflow, and the rendered background MUST be confirmed non-white. This verification is part of the feature's definition of done, not an optional extra.
- **FR-013**: Text contrast MUST remain readable (WCAG AA for normal text) after the background change, including muted/secondary text on the new non-white background.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At every supported viewport width from ~375px to desktop, zero elements render outside or are clipped by their card boundary in the week view — verified in rendered output, including the previously-broken narrow day cells.
- **SC-002**: The rendered page background color is measurably not white on every screen of the app.
- **SC-003**: All 7 week-view day columns render at equal width even when one day's content is much longer than others', 100% of the time.
- **SC-004**: A brand name of 30+ characters renders with ellipsis truncation and causes zero layout overflow anywhere it appears.
- **SC-005**: 100% of existing functional flows continue to work identically after this pass, with zero functional regressions.
- **SC-006**: A side-by-side comparison of the week view before and after shows the clipping bug eliminated and the page visibly themed (non-white background, cohesive toolbar, elevated cards).

## Assumptions

- The single central theme definition introduced in the prior redesign (shared color/status token modules and UI primitives) remains the sole source for colors; this pass adjusts token *values* and layout behavior, it does not introduce a parallel theming mechanism.
- "Non-white" means a soft neutral or subtly tinted light tone that keeps the app a light-theme product — this pass does not introduce a dark theme (out of scope per feature 002's clarifications, unchanged here).
- "Narrowest supported width" is interpreted as ~375px (common small phone), consistent with feature 002's responsive baseline; ultra-narrow widths below 360px are out of scope.
- Caption truncation depth (number of clamped lines) is a design judgment made during implementation, as long as it is consistent across all day cells.
- The verification requirement (FR-012) is satisfied by rendered-output inspection (screenshot or measured element-boundary checks in the running app); no new automated visual-regression infrastructure is required.
- No new pages, data fields, or manifest changes are introduced (explicit non-goals).
