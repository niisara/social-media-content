# Design Tokens: Dashboard Visual Redesign

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

This feature introduces no new data entities (per the spec's explicit
non-goals — no new data fields, no manifest schema changes). What follows
is the *visual* token model the redesign is built from: the fixed set of
color, type, spacing, and elevation decisions every component draws from,
so that "one central, reusable definition" (FR-002) applies to more than
just brand color.

## Color roles

| Role | Value | Used for |
|---|---|---|
| `background` | near-white neutral | Page background |
| `surface` | white | Card/panel backgrounds |
| `border` | light neutral gray | Card borders, dividers |
| `text-primary` | near-black neutral | Page title, captions, primary text |
| `text-secondary` | mid gray | Section headings, labels |
| `text-muted` | lighter gray | Meta text (dates, counts) |
| `brand-accent` | per-brand, from expanded palette (research.md Decision 7) | Brand borders/tags, filter pill active state |
| `status-draft` | gray | Draft status chip |
| `status-scheduled` | blue | Scheduled status chip |
| `status-posted` | green | Posted status chip |
| `status-repost` | purple | Repost indicator badge |
| `warning` | amber | Untracked-content warning banner |
| `danger` | red | Broken-reference indicators (carried over from 001) |

All pairings above (text on background/surface, status chip text on status
color, brand accent text/border on surface) are chosen to keep readable
contrast per FR-018, and re-checked whenever the brand palette (Decision 7)
or any semantic color changes.

## Type scale

| Tier | Used for | Relative size |
|---|---|---|
| Page title | "Scheduling Dashboard" | Largest |
| Section heading | "Unscheduled", date-range label, item detail sections | Large |
| Primary content | Item captions, item detail caption body | Base/medium |
| Meta text | Dates, brand labels inside cards, counts | Small |

Each tier is also distinguished by weight (title and section headings
bolder than body/meta text), not size alone, so the hierarchy holds even
where two tiers are visually close in size (FR-010).

## Spacing scale

- A single base spacing unit is used throughout (no ad hoc pixel values),
  with larger multiples reserved for separating major page sections
  (navigation, calendar, unscheduled bucket, warnings) and smaller
  multiples for spacing within a single card or control group (FR-011).

## Elevation & shape

- Cards: subtle shadow + rounded corners + comfortable internal padding
  (FR-006).
- Interactive control groups (nav, view toggle, brand filter): a
  contained, grouped visual boundary so they read as one control set
  rather than separate elements (FR-012, FR-013).

## Status indicator model

| Entry state | Chip color | Notes |
|---|---|---|
| `status: draft` | `status-draft` (gray) | Neutral — the entry hasn't been committed to a date yet |
| `status: scheduled` | `status-scheduled` (blue) | |
| `status: posted` | `status-posted` (green) | |
| *(any status)* + `repostOf` present | + `status-repost` (purple) badge | Shown **in addition to** the status chip above (Clarification/Assumption from spec: repost is a badge, not a fourth status value) |

## Calendar day states

| State | Treatment |
|---|---|
| Today | Distinct highlight (background/border), applied regardless of whether it also has content |
| Has scheduled items | "Full" treatment — item cards visible, day reads as populated |
| Empty | Minimal, intentionally quiet treatment — not a blank/broken-looking box |
| Weekend | Subtly differentiated background from weekdays (FR-009) |

## Responsive breakpoints

| Breakpoint | Week/calendar grid layout |
|---|---|
| Below `md` (768px) | Single column — days stack vertically |
| `md` and above | 7-column grid — full week visible side by side |

Navigation, view toggle, and brand filter controls remain visible and
usable (wrapping as needed) at all widths (FR-016).
