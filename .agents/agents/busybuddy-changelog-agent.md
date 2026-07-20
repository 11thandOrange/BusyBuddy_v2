---
name: changelog-agent
description: >
  Generates changelog entries from git commits for BusyBuddy_v2 releases.
  Parses conventional commits and creates formatted release notes.
  <example>Generate changelog for the latest release</example>
  <example>Update CHANGELOG.md with recent commits</example>
  <example>Regenerate the docs site changelog page</example>
tools:
  - file_editor
  - terminal
model: inherit
---

# Changelog Agent

You are a specialized agent that generates changelogs and release notes from git
commit history for the BusyBuddy_v2 project. The real implementation lives at
`scripts/generate-changelog.mjs` - this doc describes how it works and how to run it.

## Commit Convention

BusyBuddy_v2's history is a mix of Conventional Commits and plain descriptive titles
(often with a trailing PR number, e.g. `Fix critical security issues (#185-191)`).
The generator handles both:

```
<type>(<scope>): <description>
```

### Recognized Types
| Type | Changelog Section |
|------|-------------------|
| feat | Added |
| fix | Fixed |
| docs, style, refactor, perf, test, build, ci, chore, revert | Changed |
| (no recognized `type:` prefix) | Changed, using the full original subject |

### Scopes (Optional)
Scopes are repo-area names such as `announcement-bar`, `bundles`, `subscription`,
`webhooks`, `docs`, `ci`. They're optional and only rendered as a bold prefix when
present in the commit subject (`fix(webhooks): ...`).

## Output Locations

```
BusyBuddy_v2/
├── CHANGELOG.md                          # Full changelog, generated
├── .changelog-state.json                 # Last-processed commit SHA (incremental runs)
├── scripts/
│   └── generate-changelog.mjs            # The generator
└── docs/frontend/src/
    ├── data/
    │   └── changelog.ts                  # Generated ChangelogEntry[] consumed by the page
    └── pages/
        └── Changelog.tsx                 # Docs site changelog page
```

There is no version-tag scheme in this repo (no `git tag` history), so entries are
grouped by **commit date**, not by release version.

## Generation Process

The script is idempotent and incremental:

1. Read `.changelog-state.json` for the last-processed SHA (absent → full history).
2. `git log <lastSha>..HEAD --no-merges --date=short --pretty=format:'%H%x1f%ad%x1f%s'`
3. Group commits by date; within each date, bucket by type (Added/Changed/Fixed).
4. Prepend the new date sections to `CHANGELOG.md`.
5. Re-parse the full merged `CHANGELOG.md` back into structured groups and rewrite
   `docs/frontend/src/data/changelog.ts` from it, so the TS data file always mirrors
   the complete markdown file rather than just this run's delta.
6. Write the newest commit SHA back to `.changelog-state.json`.

### Run it

```bash
node scripts/generate-changelog.mjs
```

### Full regeneration (ignore prior state)

```bash
rm -f .changelog-state.json CHANGELOG.md
node scripts/generate-changelog.mjs
```

## Changelog Format

### CHANGELOG.md

```markdown
# Changelog

All notable changes to BusyBuddy_v2 are documented here.

## 2026-07-09

### Changed
- Fix critical billing/GDPR gaps (Category H)
- Add BusyBuddy documentation site (docs/)

## 2026-07-02

### Added
- add dev-pipeline.yml caller workflow

### Fixed
- explicitly pass secrets to cross-org reusable workflow
```

### docs/frontend/src/data/changelog.ts

```typescript
import type { ChangelogEntry } from '../types';

export const changelog: ChangelogEntry[] = [
  {
    date: '2026-07-09',
    added: [],
    changed: ['Fix critical billing/GDPR gaps (Category H)', '...'],
    fixed: [],
  },
];
```

`ChangelogEntry` is defined in `docs/frontend/src/types/index.ts` alongside the other
doc-data types (`AppDoc`, `WorkflowDoc`, etc.).

## When to Run

- Manually, whenever the docs site should reflect recent commits.
- Not currently wired into a GitHub Actions trigger - `deploy-docs.yml` deploys
  whatever is already committed under `docs/**`, so re-run this script and commit
  the result before/alongside a docs change if you want the changelog current.

## Edge Cases

- **No recognized type prefix**: categorized as "Changed", full subject kept as-is
  (a leading non-conventional word like `Cleanup:` is preserved rather than treated
  as a type).
- **Merge commits**: skipped (`--no-merges`).
- **Duplicate subjects on the same date**: de-duplicated within a date/section pair.
- **No new commits since last run**: script logs "No new commits" and exits without
  touching any files.
