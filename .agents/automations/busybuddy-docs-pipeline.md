# Docs Agent Automation

This document describes the OpenHands automation that triggers the docs-agent when code is pushed to main.

## Overview

The automation monitors pushes to the main branch of the BusyBuddy_v2 repository and:
1. Detects if backend/frontend code changed → runs api-spec-generator
2. Detects if a release occurred → runs changelog-agent  
3. Verifies docs-site builds correctly
4. Commits any auto-generated updates

## Setup Instructions

### Prerequisites

1. An OpenHands account at https://app.all-hands.dev
2. Your `OPENHANDS_API_KEY` from Settings → API Keys
3. GitHub integration configured in OpenHands

### Create the Automation

Run the following curl command (replace `${OPENHANDS_API_KEY}` with your actual key):

```bash
curl -X POST "https://app.all-hands.dev/api/automation/v1/preset/prompt" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BusyBuddy_v2 Docs Agent - Auto Update",
    "prompt": "You are the docs-agent for the BusyBuddy_v2 repository. A push to main has occurred.\n\n1. Check what files changed using: git diff HEAD~1 --name-only\n\n2. If backend/frontend files under web/backend/routes or web/frontend changed:\n   - Run the api-spec-generator to extract any new API endpoints\n   - Update docs/frontend/src/data/endpoints.ts if needed\n\n3. If this looks like a release (tagged commit or version bump):\n   - Run the changelog-agent to generate changelog entries\n   - Update CHANGELOG.md\n\n4. If docs/ files changed but no deployment needed:\n   - Verify the build still works: cd docs/frontend && npm ci && npm run build\n\n5. If any updates were made to the docs site:\n   - Commit the changes with message: \"docs: Auto-update documentation [skip ci]\"\n   - Push to the current branch\n\nReport what actions were taken.",
    "trigger": {
      "type": "event",
      "source": "github",
      "on": "push",
      "filter": "ref == '\''refs/heads/main'\'' && glob(repository.full_name, '\''11thandOrange/BusyBuddy_v2'\'')"
    },
    "timeout": 600,
    "repos": [
      {"url": "https://github.com/11thandOrange/BusyBuddy_v2", "ref": "main"}
    ]
  }'
```

### Verify the Automation

```bash
# List automations
curl "https://app.all-hands.dev/api/automation/v1" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}"

# Check runs
curl "https://app.all-hands.dev/api/automation/v1/{automation_id}/runs" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}"
```

### Manually Trigger a Run

```bash
curl -X POST "https://app.all-hands.dev/api/automation/v1/{automation_id}/dispatch" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}"
```

## Trigger Configuration

| Setting | Value |
|---------|-------|
| Event Source | GitHub |
| Event Type | `push` |
| Filter | `ref == 'refs/heads/main' && glob(repository.full_name, '11thandOrange/BusyBuddy_v2')` |
| Timeout | 600 seconds (10 minutes) |

## What the Automation Does

### On Backend/Frontend Code Changes (web/backend, web/frontend)
- Invokes `api-spec-generator` agent behavior
- Scans Express route definitions under `web/backend/routes/`
- Updates `docs/frontend/src/data/endpoints.ts`

### On Release Commits
- Invokes `changelog-agent` agent behavior
- Parses conventional commits
- Updates `CHANGELOG.md`

### On docs-site Changes
- Verifies the build passes
- Does not deploy (GitHub Actions handles deployment via `.github/workflows/deploy-docs.yml`)

## Related Files

- `.agents/agents/busybuddy-docs-agent.md` - Main orchestrator
- `.agents/agents/busybuddy-api-spec-generator.md` - API extraction
- `.agents/agents/busybuddy-changelog-agent.md` - Changelog generation
- `.github/workflows/deploy-docs.yml` - GitHub Actions deployment

## Troubleshooting

### Automation Not Triggering
1. Verify the automation is enabled
2. Check the filter matches your repository name
3. Ensure GitHub integration is connected in OpenHands

### Build Failures
1. Check that `docs/frontend/package-lock.json` is committed
2. Verify Node.js version compatibility (requires 18+)

### API Extraction Issues
1. Ensure Express route files follow the existing router patterns
2. Check for syntax errors in source files
