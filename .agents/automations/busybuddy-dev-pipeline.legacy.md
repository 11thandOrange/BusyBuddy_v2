> ⚠️ **LEGACY — retired.** This OpenHands Cloud automation and its
> `ready-to-implement` label trigger have been retired in favor of the
> GitHub Actions + Claude Code pipeline orchestrated from
> `HeyItsChloe/agent-ops` (see `.github/workflows/dev-pipeline.yml`).
> The automation registration must be disabled/deleted on the OpenHands
> Cloud side separately — nothing here can do that. Kept for historical
> reference only; do not re-register.

# Autonomous Dev Pipeline — BusyBuddy_v2 (LEGACY)

End-to-end automation: GitHub Issue labelled `ready-to-implement` →
implemented → PR → reviewed → CI green → WhatsApp review request.

## Pipeline

```
Issue labelled "ready-to-implement"
        ↓
  ticket-planner              reads issue, maps to codebase, writes plan
        ↓
 busybuddy-implementer        creates branch, writes JS/React/Node code
        ↓
shopify-extension-implementer if extensions/ changes needed (plan determines this)
        ↓
       tester                 fills missing tests across all 3 suites
        ↓
   build-check (skill)        npm install + CI=true npm run build
        ↓
   ticket-manager             gh pr create linking to the issue
        ↓
   pr-reviewer                self-review, inline comments, iterate (max 2)
        ↓
   ci-monitor                 waits for GitHub Actions to green — includes smoke job (max 3 retries)
        ↓
 whatsapp-notifier            sends review request to your phone  [REMOVED — see banner]
```

## Live Automation

| Field | Value |
|-------|-------|
| **Automation ID** | `3cfefdb0-a1bc-4f26-bcc6-4136ff0fb4da` |
| **Status** | ✅ Enabled |
| **Registered** | 2026-05-31 |
| **Trigger** | `issues.labeled` → `ready-to-implement` on `11thandOrange/BusyBuddy_v2` |

## Required Secrets

| Secret | Used by |
|--------|---------|
| `GITHUB_TOKEN` | All GitHub operations |
| `DB_CONNECTION` | env-setup → dev-server |
| `SHOPIFY_API_KEY` | build-check, dev-server |
| `SHOPIFY_API_SECRET` | dev-server |
| `SHOPIFY_CLI_PARTNERS_TOKEN` | dev-server |
| `WHATSAPP_PHONE` | whatsapp-notifier _(removed — pipeline retired)_ |
| `WHATSAPP_API_KEY` | whatsapp-notifier _(removed — pipeline retired)_ |

## Setup: Register the Automation

```bash
curl -X POST "https://app.all-hands.dev/api/automation/v1/preset/prompt" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BusyBuddy_v2 — Autonomous Dev Pipeline",
    "prompt": "You are the autonomous development pipeline for the BusyBuddy_v2 Shopify app (https://github.com/11thandOrange/BusyBuddy_v2).\n\nA GitHub Issue has been labelled ready-to-implement. Find it: gh issue list --repo 11thandOrange/BusyBuddy_v2 --label ready-to-implement --state open --json number,title,body,labels --limit 1\n\nExecute each step. On unrecoverable failure go to Step 9 with failure message.\n\nSTEP 1 - ticket-planner: Follow .agents/agents/ticket-planner.md. Fetch issue, explore codebase, produce plan, save to /tmp/plan-NUMBER.md.\n\nSTEP 2 - busybuddy-implementer: Follow .agents/agents/busybuddy-implementer.md. Create branch, install deps (npm install in root, web/, web/frontend/), implement web/ changes, run cd web && npm test and cd web/frontend && npm test, fix failures, commit.\n\nSTEP 3 - shopify-extension-implementer: Follow .agents/agents/shopify-extension-implementer.md ONLY IF the plan flags extensions/ changes. Run cd extensions/cart-transformer && npm test. Skip otherwise.\n\nSTEP 4 - tester: Follow .agents/agents/tester.md. Write missing tests for new code. Run all three test suites. Commit new test files.\n\nSTEP 5 - build-check: Follow .agents/skills/build-check.md. Run cd web/frontend && CI=true npm run build. Fix any errors.\n\nSTEP 6 - ticket-manager: Push branch (git push -u origin BRANCH), create PR: gh pr create --repo 11thandOrange/BusyBuddy_v2 --title ISSUE_TITLE --body Closes #NUMBER. DESCRIPTION --base main. Record PR number and URL.\n\nSTEP 7 - pr-reviewer: Follow .agents/agents/pr-reviewer.md. Review diff, post inline comments, iterate on critical issues (max 2 iterations). Do NOT merge.\n\nSTEP 8 - ci-monitor: Follow .agents/skills/ci-monitor.md. Poll gh pr checks PR_NUMBER. On failure fetch logs, fix, push, re-poll (max 3 retries).\n\nSTEP 9 [REMOVED — whatsapp-notifier retired, do not re-register]: previously ran mark-pr-ready then whatsapp-notifier (callmebot/Twilio WhatsApp send) on success or failure.",
    "trigger": {
      "type": "event",
      "source": "github",
      "on": "issues.labeled",
      "filter": "event.label.name == '\''ready-to-implement'\'' && glob(repository.full_name, '\''11thandOrange/BusyBuddy_v2'\'')"
    },
    "timeout": 3600,
    "repos": [
      {"url": "https://github.com/11thandOrange/BusyBuddy_v2", "ref": "main"}
    ]
  }'
```

## Verify

```bash
curl -s "https://app.all-hands.dev/api/automation/v1" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  | python3 -c "import json,sys; [print(a['id'], a['name'], a['enabled']) for a in json.load(sys.stdin)['automations']]"
```

## Trigger the Pipeline

```bash
# Create the label if it doesn't exist
gh label create "ready-to-implement" \
  --repo 11thandOrange/BusyBuddy_v2 \
  --color "0075ca" \
  --description "Queued for autonomous implementation"

# Label an issue to fire the pipeline
gh issue edit <ISSUE_NUMBER> \
  --repo 11thandOrange/BusyBuddy_v2 \
  --add-label "ready-to-implement"
```

## What the Pipeline Will Never Do

- Merge to `main`
- Run `shopify app deploy`
- Modify production environment variables
- Upload to the Shopify App Store

## Related Files

```
.agents/agents/ticket-planner.md
.agents/agents/busybuddy-implementer.md
.agents/agents/shopify-extension-implementer.md
.agents/agents/tester.md
.agents/agents/build-check.md
.agents/agents/pr-reviewer.md
.agents/skills/env-setup.md
.agents/skills/dev-server.md
.github/workflows/node-ci.yml
```

User-level (HeyItsChloe/.agents):
```
agents/ticket-manager.md
skills/ci-monitor.md
skills/whatsapp-notifier.md
```
