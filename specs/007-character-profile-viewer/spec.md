# Feature Specification: Character Profile Viewer

**Feature Branch**: `007-character-profile-viewer`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Add an \"About {character}\" button next to the Character dropdown on the Content Generation page that navigates to a new page displaying that character's full profile."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View a character's profile before choosing them (Priority: P1)

A person on the Content Generation page has selected a character (e.g. "Software Developer") and
wants to understand who that persona is before committing to generate content as them. Next to the
Character dropdown they see an "About Software Developer" action. They click it, and a dedicated,
nicely formatted profile page opens showing that character's full details — name, nature,
characteristics, family, hobbies, location, and a "Likings" table rendered as a real table — read
straight from that character's profile file.

**Why this priority**: Reading the profile is the core value of this feature — it lets users make
an informed character choice. The button, the navigation, and the rendered profile page together
form the whole deliverable; without them there is nothing to ship.

**Independent Test**: Select a character on the Content Generation page, click the "About
{character}" action, and confirm the profile page opens showing that character's formatted
content (headings, bold text, bullet lists, and the Likings table rendered as an actual table).

**Acceptance Scenarios**:

1. **Given** a character is selected in the dropdown, **When** the user views the controls next to
   the dropdown, **Then** an "About {Character Display Name}" action is shown (e.g. "About Software
   Developer") reflecting the current selection.
2. **Given** a character is selected, **When** the user activates the "About {character}" action,
   **Then** they are taken to that character's dedicated profile page without a full page reload.
3. **Given** the profile page has loaded for a character, **When** it renders, **Then** the
   character's profile content is shown as formatted HTML — `##` headings as headings, `**bold**`
   as bold, `-` lists as bullet lists, and the pipe-delimited "Likings" section as an actual
   formatted table (no raw pipe characters or raw markdown symbols visible).
4. **Given** the profile page has loaded, **When** the user reads it, **Then** a clear page title
   shows the character's display name derived from the profile's own heading (e.g. "Ishita Verma —
   Content Creator / Freelance Writer").
5. **Given** the profile page uses the app's shared design system, **When** it renders, **Then** it
   appears as styled cards/typography consistent with the rest of the app, not an unstyled markdown
   dump.

---

### User Story 2 - Return to Content Generation with the selection preserved (Priority: P2)

After reading a character's profile, the user wants to go back to the Content Generation page and
continue — with the character they were viewing still selected in the dropdown, so they don't have
to re-pick it.

**Why this priority**: Preserving context on return removes friction and prevents the frustrating
"my selection was lost" experience, but it is secondary to being able to view the profile at all
(Story 1).

**Independent Test**: From a character's profile page, use the back-navigation link and confirm the
Content Generation page reopens with that same character pre-selected in the dropdown rather than
the empty placeholder.

**Acceptance Scenarios**:

1. **Given** the user is on a character's profile page, **When** they view the page header, **Then**
   a "← Back to Content Generation" link is shown, consistent with the back-navigation pattern used
   on the item detail and Content Generation pages.
2. **Given** the user is on a character's profile page, **When** they activate the "← Back to
   Content Generation" link, **Then** the Content Generation page reopens with that character
   restored as the selected value in the dropdown (not reset to the "Select a character…"
   placeholder).

---

### User Story 3 - Understand when a profile is unavailable (Priority: P3)

A user opens a character's profile page for a character whose folder is missing its profile file,
or has more than one file matching the expected profile pattern. Instead of a crash or a blank
page, they see a clear "Profile not available" message so they understand the profile can't be
shown.

**Why this priority**: This guards against broken/blank pages for malformed character folders, but
it is an edge path — the common case (a single, well-formed profile file) is handled by Story 1.

**Independent Test**: Point the profile page at a character folder that has zero or more-than-one
matching profile files and confirm a clear "Profile not available" state is shown rather than an
error or blank page.

**Acceptance Scenarios**:

1. **Given** a character folder contains no file matching the profile pattern, **When** the user
   opens that character's profile page, **Then** a clear "Profile not available" state is shown
   (with the back-navigation link still working), not a crash or blank page.
2. **Given** a character folder contains more than one file matching the profile pattern, **When**
   the user opens that character's profile page, **Then** a clear "Profile not available" state is
   shown rather than guessing which file to render.
3. **Given** the requested character does not correspond to any character folder, **When** the user
   opens that profile page, **Then** a clear not-found / "Profile not available" state is shown.

---

### Edge Cases

- **No character selected**: When no character is selected in the dropdown, the "About {character}"
  action is not actionable (shown disabled) since there is nothing to display.
- **Direct visit / refresh**: Navigating directly to a character's profile location (typed address,
  bookmark, or refresh) renders the profile (or the "Profile not available" state) correctly
  without depending on having come from the Content Generation page.
- **Profile heading missing**: If the profile file lacks the expected top heading used to derive the
  page title, the page still renders the body content and falls back to the character's display
  name (from the folder slug) for the title rather than failing.
- **Read-only guarantee**: The profile page offers no controls to edit, generate from, or otherwise
  act on the profile — it only displays it.
- **Case/format of profile filename**: Profile files are matched by the agreed pattern
  (`*-PROFILE.md` within the character's folder) rather than a per-character hardcoded name, so a
  new character folder following the same convention works with no code change.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Content Generation page MUST show an "About {character}" action next to the
  Character dropdown whose label reflects the currently selected character's display name (e.g.
  "About Software Developer").
- **FR-002**: When no character is selected, the "About {character}" action MUST NOT be actionable
  (it is shown in a disabled state), since there is no profile to display.
- **FR-003**: Activating the "About {character}" action MUST navigate the user to that character's
  dedicated profile page without a full browser page reload.
- **FR-004**: The profile page MUST locate the selected character's profile file by convention —
  the single file matching the `*-PROFILE.md` pattern within that character's folder — without
  relying on a per-character hardcoded filename, so new character folders following the convention
  work automatically.
- **FR-005**: The profile page MUST render the profile's Markdown content as formatted HTML:
  headings, bold text, and bullet lists MUST render as such, and the pipe-delimited "Likings"
  section MUST render as an actual formatted table (no raw pipe characters or markdown symbols
  shown to the user).
- **FR-006**: The profile page MUST use the app's existing design system/theme (cards, typography
  scale, spacing) so the rendered profile is styled consistently with the rest of the app, not an
  unstyled markdown dump.
- **FR-007**: The profile page MUST reuse the existing page-shell pattern — a header bar containing
  a "← Back to Content Generation" link consistent with the item detail and Content Generation
  pages — plus a clear page title showing the character's display name derived from the profile's
  own heading.
- **FR-008**: If a character folder has no file matching the profile pattern, or has more than one
  match, or the character does not exist, the profile page MUST show a clear "Profile not available"
  state (with working back-navigation) rather than crashing or showing a blank page.
- **FR-009**: The profile page MUST be read-only — it MUST NOT provide any means to edit, generate
  from, or otherwise modify the character or its profile, and MUST NOT make any AI/generation calls.
- **FR-010**: Returning from the profile page to the Content Generation page via the back link MUST
  restore the previously viewed character as the selected value in the dropdown, rather than
  resetting to the placeholder.

### Key Entities

- **Character Profile**: The displayable persona details for one character, sourced from the single
  `*-PROFILE.md` file inside that character's folder. Structured as a top heading (used to derive
  the page title), plus sections (Name, Nature, Characteristics, Family/Relatives, Hobby, Location)
  and a "Likings" table of category→preference pairs. Read-only reference material; not edited by
  this feature.
- **Character** (existing): Identified by its folder slug (e.g. `software-developer`) with a derived
  human-readable display label; the profile page and About action are keyed off the selected
  character's slug. (See feature 006 — the Character dropdown.)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From a selected character, a user can reach that character's formatted profile in a
  single click on the "About {character}" action, 100% of the time.
- **SC-002**: For every character folder that contains a single well-formed `*-PROFILE.md`, the
  profile page renders all sections (name, nature, characteristics, family, hobbies, location) and
  the Likings table as an actual table (0 instances of raw pipe/markdown characters shown).
- **SC-003**: Adding a new character folder that follows the `*-PROFILE.md` convention makes its
  profile viewable with no code change.
- **SC-004**: When a character folder is missing its profile or has multiple matches, 100% of visits
  show the "Profile not available" state instead of a crash or blank page.
- **SC-005**: After viewing a profile and using the back link, the Content Generation dropdown shows
  the previously viewed character as selected 100% of the time (no reset to placeholder).
- **SC-006**: The "About {character}" action is non-actionable whenever no character is selected
  (100% of the unselected state), and actionable whenever one is selected.
- **SC-007**: The profile page presents zero controls that edit, generate from, or otherwise modify
  the profile — it is verifiably read-only.

## Assumptions

- Each character folder is expected to contain exactly one profile file matching `*-PROFILE.md`
  (confirmed for the current five characters: CONTENT-CREATOR-PROFILE.md, DOCTOR-PROFILE.md,
  FITNESS-TRAINER-PROFILE.md, SOFTWARE-DEVELOPER-PROFILE.md, TEACHER-PROFILE.md). Zero or multiple
  matches are treated as the "Profile not available" case.
- The page title's display name is derived from the profile's own top heading (e.g. the "…—
  Content Creator / Freelance Writer" heading) combined with the character's name where available;
  when the heading is absent, the character's slug-derived display label is used as a fallback.
- Selection restoration on return is achieved by carrying the character identifier in the profile
  page's location/back link (e.g. a `?character=<slug>` query parameter on the Content Generation
  page) so the dropdown can pre-select it; the precise mechanism is an implementation detail as long
  as the selection is restored.
- The profile files are persona reference material read only for display; this feature does not read
  or write any social content files or the per-brand manifest, so the project's
  markdown-as-source-of-truth and single-manifest principles (which govern `content/<brand>/…` and
  the manifest) are unaffected.
- The profile content is trusted, author-controlled Markdown within the repository (not
  user-submitted), so it is rendered as formatted content; this feature adds no content-editing or
  upload capability.
- Reasonable, standard rendering is expected for the Markdown constructs present in the profiles
  (headings, bold, bullet lists, tables); exotic Markdown beyond these is out of scope for the
  current profiles.
