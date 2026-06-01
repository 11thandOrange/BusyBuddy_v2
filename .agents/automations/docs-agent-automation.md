# Docs Agent Automation — BusyBuddy_v2

Triggers the `docs-agent` when code is pushed to `main` on BusyBuddy_v2.

## Overview

The automation detects:
1. Express route changes (`web/backend/routes/`) → runs `api-spec-generator`
2. Release commits → runs `changelog-agent`
3. Any `docs/` changes → verifies the build

## Setup

### Prerequisites

1. OpenHands account at https://app.all-hands.dev
2. `OPENHANDS_API_KEY` from Settings → API Keys
3. GitHub integration configured in OpenHands

### Create the Automation

```bash
OPENHANDS_HOST="https://app.all-hands.dev"

curl -X POST "${OPENHANDS_HOST}/api/automation/v1/preset/prompt" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BusyBuddy_v2 Docs Agent — Auto Update",
    "prompt": "You are the docs-agent for BusyBuddy_v2. A push to main has occurred.\n\n1. Check what files changed: git diff HEAD~1 --name-only\n\n2. If Express route files in web/backend/routes/ changed:\n   - Run api-spec-generator to extract updated endpoints\n   - Update docs/frontend/src/data/endpoints.ts\n\n3. If this looks like a release (tagged commit or version bump in package.json):\n   - Run changelog-agent to generate changelog entries\n   - Update CHANGELOG.md and docs/frontend/src/pages/Changelog.tsx\n\n4. If docs/ files changed:\n   - Verify the build: cd docs/frontend && npm ci && npm run build\n\n5. If any docs/ updates were made:\n   - Commit: git add docs/ CHANGELOG.md && git commit -m \'docs: auto-update [skip ci]\'\n   - Push to main\n\nReport all actions taken.",
    "trigger": {
      "type": "event",
      "source": "github",
      "on": "push",
      "filter": "ref == 'refs/heads/main' && glob(repository.full_name, '11thandOrange/BusyBuddy_v2')"
    },
    "timeout": 600,
    "repos": [
      {"url": "https://github.com/11thandOrange/BusyBuddy_v2", "ref": "main"}
    ]
  }'
```

### Verify

```bash
curl "${OPENHANDS_HOST}/api/automation/v1" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  | python3 -c "import json,sys; [print(a['name'], a['id']) for a in json.load(sys.stdin)]"
```

## Trigger Configuration

| Setting | Value |
|---------|-------|
| Source | GitHub |
| Event | `push` |
| Filter | `ref == 'refs/heads/main' && glob(repository.full_name, '11thandOrange/BusyBuddy_v2')` |
| Timeout | 600 seconds |

## Related Files

- `.agents/agents/docs-agent.md`
- `.agents/agents/api-spec-generator.md`
- `.agents/agents/changelog-agent.md`
- `.agents/agents/site-deployer.md`
