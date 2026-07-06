# Feature Specification: Character Dropdown on Content Generation Page

**Feature Branch**: `006-character-dropdown`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Add a \"Character\" dropdown field to the Content Generation page, populated dynamically from the folder names under the character/ directory."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose a character from the current library (Priority: P1)

A person preparing to create content opens the Content Generation page and needs to pick which
"character" (persona/voice) the eventual content will be generated for. They see a "Character"
dropdown listing every character that currently exists as a folder under `character/`, each shown
as a clean, human-readable label, sorted alphabetically. They open it, pick one, and the page
reflects their choice — without anything being generated or any backend action firing yet.

**Why this priority**: Selecting the character is the core new capability of this step and the
prerequisite for the future generation flow. The dropdown, its dynamic options, formatting, and
selection feedback are the whole deliverable — without them there is nothing to ship.

**Independent Test**: Open the Content Generation page, confirm the dropdown lists the current
character folders as formatted labels in alphabetical order, select one, and confirm the page
shows the chosen character's label with no generation, file-content read, or API call triggered.

**Acceptance Scenarios**:

1. **Given** the `character/` directory contains subfolders (content-creator, doctor,
   fitness-trainer, software-developer, teacher), **When** the user opens the Content Generation
   page, **Then** the "Character" dropdown lists exactly those characters, each as a
   human-readable label ("Content Creator", "Doctor", "Fitness Trainer", "Software Developer",
   "Teacher"), sorted alphabetically by label.
2. **Given** the dropdown is displayed with characters available, **When** the user has not yet
   made a choice, **Then** the dropdown shows a non-selectable "Select a character…" placeholder
   and no character is pre-selected.
3. **Given** the dropdown is open, **When** the user selects a character, **Then** the page
   updates to reflect the selected character's human-readable label somewhere visible on the
   page, and no content generation, character file-content read, or API/network call is
   triggered.
4. **Given** a character has been selected, **When** the user selects a different character,
   **Then** the displayed selection updates to the newly chosen character's label.

---

### User Story 2 - Understand when no characters exist (Priority: P2)

A person opens the Content Generation page in an environment where the `character/` directory has
no character subfolders. Instead of a broken or empty dropdown, they see a clearly disabled
control communicating that no characters are available, so they understand the state rather than
being confused by an empty menu.

**Why this priority**: Graceful handling of the empty state prevents a confusing/broken-looking
UI, but it is a secondary path — the primary value is delivered by Story 1 when characters exist.

**Independent Test**: With no subfolders under `character/`, open the Content Generation page and
confirm the dropdown is disabled and displays a clear "No characters available" message rather
than an empty or interactive-but-empty control.

**Acceptance Scenarios**:

1. **Given** the `character/` directory has no subfolders, **When** the user opens the Content
   Generation page, **Then** the character control is shown in a disabled state with a clear
   "No characters available" message and cannot be interacted with.
2. **Given** the empty state is shown, **When** the user views the page, **Then** no character
   options are listed and no selection can be made.

---

### Edge Cases

- **Stray non-directory files**: If `character/` contains loose files (e.g. a `README.md`,
  `.DS_Store`, or other non-folder entries) directly inside it, those MUST NOT appear as
  character options — only true subdirectories are treated as characters.
- **Single character**: If exactly one character folder exists, the dropdown still shows the
  "Select a character…" placeholder (no auto-selection) and lists that one character.
- **Folder name formatting variations**: A folder name with multiple hyphens (e.g.
  `software-developer`) is displayed with every word title-cased and hyphens replaced by spaces
  ("Software Developer"); the internal value stays the exact folder name (`software-developer`).
- **Directory missing entirely**: If the `character/` directory itself does not exist, the page
  behaves the same as the empty state (disabled control, "No characters available") rather than
  erroring.
- **No selection persistence**: Reloading the page returns the dropdown to the unselected
  placeholder state — the previously selected character is not remembered.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Content Generation page MUST display a "Character" dropdown control whose
  options are derived from the subfolder names under the `character/` directory, determined at
  request/build time rather than from a hardcoded list. Adding or removing a subfolder under
  `character/` MUST change the available options without any code change.
- **FR-002**: Each character option MUST display a human-readable label produced from its folder
  name by replacing hyphens with spaces and title-casing each word (e.g. `content-creator` →
  "Content Creator"), while the underlying selection value MUST remain the exact folder name
  (slug) unchanged.
- **FR-003**: Character options MUST be listed in ascending alphabetical order by their displayed
  human-readable label.
- **FR-004**: Only true subdirectories of `character/` MUST be treated as characters; any
  non-directory entries directly under `character/` MUST be excluded from the options.
- **FR-005**: When one or more characters exist, the dropdown MUST default to no selection,
  showing a non-selectable "Select a character…" placeholder rather than pre-selecting any
  character.
- **FR-006**: When no character subfolders exist (or the directory is absent), the control MUST
  be shown in a disabled state with a clear "No characters available" message, instead of an
  empty or broken dropdown.
- **FR-007**: Selecting a character MUST update the page's local selection state and visibly
  reflect the chosen character's human-readable label on the page.
- **FR-008**: Selecting a character MUST NOT trigger any content generation, reading of any file
  contents inside the character's folder, persistence of the selection, or any API/network
  request.
- **FR-009**: The dropdown MUST appear on the Content Generation page below the existing
  "Content Generation" heading and description and near the existing "coming soon" indicator, and
  MUST be styled consistently with the existing design system/theme (not a raw, unstyled
  control).

### Key Entities

- **Character**: A selectable persona represented solely by a subdirectory under `character/`.
  Attributes: a **slug** (the exact folder name, used as the internal value and consistent with
  file paths) and a derived **display label** (hyphens→spaces, title-cased). No other attributes
  are read or used in this feature; the folder's contents are not accessed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When character folders exist, the dropdown lists 100% of the current character
  subdirectories (and nothing else), each as a correctly formatted, human-readable label.
- **SC-002**: Character options appear in alphabetical order by label 100% of the time,
  regardless of the order the folders happen to exist on disk.
- **SC-003**: Adding or removing a folder under `character/` changes the dropdown options on the
  next page load with no code change required.
- **SC-004**: A user can select a character and see their choice reflected on the page in a single
  interaction, with zero generation actions, character file-content reads, or network calls
  triggered as a result.
- **SC-005**: When no character subfolders exist, 100% of page loads show a disabled control with
  a "No characters available" message rather than an empty or interactive-but-empty dropdown.
- **SC-006**: Non-directory entries placed directly under `character/` never appear as selectable
  options (0% leakage of stray files into the dropdown).
- **SC-007**: On initial load with characters present, no character is pre-selected — the
  placeholder is shown 100% of the time.

## Assumptions

- The `character/` directory lives at the project root (confirmed to currently contain
  content-creator, doctor, fitness-trainer, software-developer, teacher); this feature reads only
  the names of its immediate subdirectories, never their contents.
- "Request/build time" derivation means the option list reflects the folders present when the
  page is served/rendered; a running page does not need to live-watch the filesystem for changes
  mid-session — a reload reflects the current folders.
- The selection is UI-local and ephemeral: it is intentionally not persisted, not stored in the
  manifest, and not sent anywhere, consistent with this being groundwork for a later generation
  feature.
- Title-casing capitalizes the first letter of each hyphen-delimited word; no special-case
  acronym handling (e.g. "seo") is required for the current known folders, and reasonable
  default title-casing is acceptable for future folders.
- The existing Content Generation page's "coming soon" placeholder remains; this feature adds the
  character selector alongside it and does not remove the page's placeholder framing.
- This feature does not read, write, or alter any content files or the per-brand manifest, so the
  project's markdown-as-source-of-truth and single-manifest principles are unaffected. The
  `character/` folders are a separate persona library, not brand content.
