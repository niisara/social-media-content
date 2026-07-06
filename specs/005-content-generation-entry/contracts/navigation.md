# UI Navigation Contract: Content Generation Entry Point

**Feature**: 005-content-generation-entry | **Date**: 2026-07-06

This feature exposes no programmatic API, CLI, or network endpoint. Its only external contract is
the user-facing navigation behavior between two routes. This document captures that contract so
acceptance tests can assert against it.

## Routes

| Route                   | Type            | Renders                                                        |
|-------------------------|-----------------|---------------------------------------------------------------|
| `/`                     | Existing (home) | Scheduling Dashboard; now includes a "Content Generation" control in the header toolbar |
| `/content-generation`   | New             | Placeholder page: "Content Generation" title + "coming soon" message + "← Back to dashboard" link |

## Navigation Contract

### C-1: Dashboard → Content Generation

- **Trigger**: User activates the "Content Generation" control in the dashboard header toolbar.
- **Precondition**: User is on `/` (any `view`/`offset`/`brand` query state).
- **Postcondition**: Browser location is `/content-generation`; the placeholder page is
  displayed.
- **Manner**: Client-side navigation (App Router, `next/link`) — **no full page reload**.

### C-2: Content Generation → Dashboard

- **Trigger**: User activates the "← Back to dashboard" link on the Content Generation page.
- **Precondition**: User is on `/content-generation` (reached via C-1 **or** by direct
  visit/refresh).
- **Postcondition**: Browser location is `/` (dashboard home).
- **Manner**: Client-side navigation via `next/link`.

### C-3: Direct visit / refresh of Content Generation

- **Trigger**: User navigates directly to `/content-generation` (typed URL, bookmark, or page
  refresh) without coming from the dashboard.
- **Postcondition**: The placeholder page renders correctly with its theme, title, "coming soon"
  message, and a working back link (C-2 still holds).

## Visual / Structural Contract

- **VC-1**: The "Content Generation" control is present in the dashboard header toolbar area
  (alongside the range navigation, view toggle, and brand filters) and is styled consistently
  with existing controls (not a bare, unstyled element). — FR-001, FR-002
- **VC-2**: The `/content-generation` page uses the shared global theme: non-white body
  background, consistent typography, and the item-detail back-navigation header pattern. — FR-004,
  FR-006, FR-007
- **VC-3**: The `/content-generation` page displays the title text "Content Generation" and a
  short "coming soon"-style placeholder message. — FR-005
- **VC-4**: The `/content-generation` page presents **no** content-creation affordances — no
  forms, inputs, or generation action controls beyond the back-navigation link. — FR-008

## Out of Scope (No Contract)

No request/response payloads, no server actions, no data reads/writes, no manifest or content
mutations. Any generation behavior is a future feature built atop this shell.
