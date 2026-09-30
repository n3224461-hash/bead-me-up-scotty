# Changelog

## 0.4.0 — 2026-09-30

### Added

- A shared Board at `/board`, accessible from the project list, showing tasks across registered projects.
- A project multi-select alongside existing search, status, type, priority, origin, label, assignee, and archive filters. Filter selections persist in the URL.
- Project names on cards and navigation to the owning project's task detail for viewing and editing.
- Epics and an Other column for pinned or otherwise unclassified items in the shared Board.
- Direct WorkPost registry support through `SCOTTY_PROJECTS_FILE` and optional `SCOTTY_PROJECTS_ROOT`.
- Independent project loading, partial-error messages, retry, and periodic refresh.
- Three local test projects with Markdown artifacts, a registry, and a test launcher. Beads databases remain local and excluded from Git.

### Fixed

- Explicitly select the owning project's `.beads` directory for CLI calls in repositories containing multiple databases.
- Isolate duplicate task IDs, dependencies, and parents across projects in the shared Board.
- Recreate a cached project store when its registered path changes.

The shared Board is for browsing; editing and dragging remain in each project's
Board. Tasks are read through Beads CLI from local Dolt, with existing `BD_BIN`
wrappers preserved. See [release notes](docs/releases/v0.4.0.md) for setup and validation.

## Earlier versions

- [0.3.0 — Clearer Board drag and drop](docs/releases/v0.3.0.md)
- [0.2.0](docs/releases/v0.2.0.md)
