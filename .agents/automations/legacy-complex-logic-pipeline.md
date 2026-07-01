# Complex Logic Pipeline — BusyBuddy_v2

> **LEGACY — RETIRED.** This OpenHands Cloud pipeline (including the
> whatsapp-notifier handoff) has been retired in favor of a GitHub Actions +
> Claude Code pipeline maintained in a separate agent-ops control repo. Kept
> for historical reference only; the `complex-logic` label is not wired to
> any active automation in this repo.

For GitHub Issues labelled `complex-logic`, the pipeline generates three
distinct implementations on separate branches, reviews them, and opens a PR
from the best one.

## Pipeline

```
Issue labelled "complex-logic"
        ↓
  approach-planner       reads issue + codebase, posts 3 approach comments on issue
        ↓
 approach-implementer    implements approach 1 on feat/issue-N-approach-1
        ↓
 approach-implementer    implements approach 2 on feat/issue-N-approach-2
        ↓
 approach-implementer    implements approach 3 on feat/issue-N-approach-3
        ↓
  approach-reviewer      checks out all 3 branches, scores, posts decision comment
        ↓
submit-winning-approach  opens PR from winning branch with decision doc
        ↓
  whatsapp-notifier      ✅ PR #N is ready for your review. Link: PR_URL
        ↓
  mark-pr-ready          removes draft status, triggers smoke CI
```

## Approach Plans

Plans are stored as GitHub Issue comments (not `/tmp/`) so they persist across
restarts and are visible before implementation starts. The approach-reviewer
reads them back via `gh issue view --json comments`.

## Required Label

```bash
gh label create "complex-logic" \
  --color "e4e669" \
  --description "Ticket requires three approaches before implementation" \
  --repo 11thandOrange/BusyBuddy_v2
```

## Register the Automation

```bash
curl -X POST "https://app.all-hands.dev/api/automation/v1/preset/prompt" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BusyBuddy_v2 — Complex Logic Pipeline",
    "prompt": "You are the complex-logic pipeline for BusyBuddy_v2 (https://github.com/11thandOrange/BusyBuddy_v2).\n\nA GitHub Issue has been labelled complex-logic. Find it: gh issue list --repo 11thandOrange/BusyBuddy_v2 --label complex-logic --state open --json number,title,body --limit 1\n\nExecute each step. On unrecoverable failure post the error as an issue comment and go to STEP 8.\n\nSTEP 1 - approach-planner: Follow .agents/agents/approach-planner.md. Read the issue, explore the codebase, post 3 approach comments on the issue. Each comment must include branch name, files to change, key design decision, complexity, and trade-offs.\n\nSTEP 2 - approach-implementer (approach 1): Follow .agents/agents/approach-implementer.md. Implement approach 1 on feat/issue-NUMBER-approach-1. Run tests before every commit. Post completion comment on issue.\n\nSTEP 3 - approach-implementer (approach 2): Follow .agents/agents/approach-implementer.md. Implement approach 2 on feat/issue-NUMBER-approach-2. Run tests before every commit. Post completion comment on issue.\n\nSTEP 4 - approach-implementer (approach 3): Follow .agents/agents/approach-implementer.md. Implement approach 3 on feat/issue-NUMBER-approach-3. Run tests before every commit. Post completion comment on issue.\n\nSTEP 5 - approach-reviewer: Follow .agents/agents/approach-reviewer.md. Check out all 3 branches, score each on simplicity/pattern-fit/AC-coverage/test-quality, post decision comment with scores and winner on the issue.\n\nSTEP 6 - submit-winning-approach: Follow .agents/skills/submit-winning-approach.md. Open PR from the winning branch. Record PR URL as issue comment.\n\nSTEP 7 - mark-pr-ready then whatsapp-notifier: Follow .agents/skills/mark-pr-ready.md then .agents/skills/whatsapp-notifier.md. Message: ✅ PR #NUMBER is ready for your review. Link: PR_URL.\n\nSTEP 8 - failure: Post issue comment with failure details. Do not open a PR.",
    "trigger": {
      "type": "event",
      "source": "github",
      "on": "issues.labeled",
      "filter": "contains(issue.labels[].name, '\''complex-logic'\'') && repository.full_name == '\''11thandOrange/BusyBuddy_v2'\''"
    },
    "repos": [
      {"url": "https://github.com/11thandOrange/BusyBuddy_v2", "ref": "main"}
    ]
  }'
```

## Both Pipelines at a Glance

| Label | Pipeline | Branches |
|-------|----------|---------|
| `ready-to-implement` | Standard pipeline — single implementation | 1 |
| `complex-logic` | This pipeline — three approaches, reviewer picks best | 3 + 1 PR |
