# Playwright Smoke Skill — BusyBuddy_v2

Run Playwright smoke tests against the Vite dev server, capture AC screenshots,
commit them to the PR branch, and post a proof comment on the PR.

## Problem

After implementation, prove each acceptance criterion is visually met in a real
browser — not just in jsdom unit tests.  Screenshots are committed to the feature
branch and linked in a PR comment so reviewers can see proof without checking out
the branch.

## Prerequisites

```bash
node --version          # must be ≥ 18
cd web/frontend && node -e "require('@playwright/test')" 2>/dev/null \
  || echo "Playwright not installed — run: npm run smoke:install"
```

## Approach

1. Install Playwright Chromium once per sandbox (skip if already present)
2. Start the Vite dev server and run tests — the config handles both automatically
3. Playwright intercepts all Shopify App Bridge module loads and `/api/*` calls,
   so no live Shopify store or backend is needed
4. Tests save screenshots to `.smoke-results/` at the repo root
5. Commit `.smoke-results/` to the PR branch and post a comment with raw links

## Commands

### Install (once per sandbox)

```bash
cd web/frontend && npm run smoke:install
```

### Run all smoke tests

```bash
cd web/frontend && npm run smoke
# Exit 0 = all pass, exit 1 = failures (check output for details)
```

### Run one specific test file

```bash
cd web/frontend && npm run smoke -- tests/smoke/<feature>.smoke.js
```

### Run with visible browser (debugging only)

```bash
cd web/frontend && npx playwright test --config=playwright.config.js --headed
```

## Screenshot → PR Comment Workflow

```bash
# 1. After npm run smoke completes, commit screenshots
cd /repo
git add .smoke-results/
git commit -m "test(smoke): add AC screenshots for PR #${PR_NUMBER}"
git push origin HEAD

# 2. Build raw content URLs
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
BRANCH=$(git branch --show-current)
RAW_BASE="https://raw.githubusercontent.com/${REPO}/${BRANCH}/.smoke-results"

# 3. List screenshot files and build markdown table
SCREENSHOTS=$(ls .smoke-results/*.png 2>/dev/null)

# 4. Post PR comment
BODY="## 🖥️ Smoke Test Results — PR #${PR_NUMBER}

| Acceptance Criterion | Screenshot |
|----------------------|------------|
$(for f in $SCREENSHOTS; do
  NAME=$(basename "$f" .png)
  echo "| ${NAME} | ![${NAME}](${RAW_BASE}/${NAME}.png) |"
done)

All screenshots captured against the running Vite dev server with mocked API and
Shopify App Bridge.  Chromium, 1280×800, headless."

gh pr comment "${PR_NUMBER}" --body "${BODY}"
```

## Success Output

```
Running 8 tests using 1 worker

  ✓  base.smoke.js:18 › dashboard page renders without crash (2.1s)
  ✓  base.smoke.js:18 › bundles page renders without crash (1.8s)
  ...
  ✓  <feature>.smoke.js:12 › ac-1: <criterion text> (2.4s)

  8 passed (18.3s)
```

Screenshots saved:
```
.smoke-results/
├── base-dashboard.png
├── base-bundles.png
├── ac-1-<feature-name>.png
└── ac-2-<feature-name>.png
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `browserType.launch: Executable doesn't exist` | Chromium not installed | Run `npm run smoke:install` |
| `ECONNREFUSED localhost:4000` | Vite server didn't start | Check `npm run dev` works manually; ensure `FRONTEND_PORT=4000` |
| `Test timeout 30000ms exceeded` | Page load too slow | Increase `timeout` in `playwright.config.js` or check for blocking network calls |
| `Error: @shopify/app-bridge` in console | App Bridge init outside iframe | Expected — handled by route stub. Not a failure. |
| Screenshot is blank/white | App crashed before render | Check `pageerror` events; look at Playwright HTML report |
| `Cannot find module '@playwright/test'` | Not installed | Run `npm install` then `npm run smoke:install` |

## Never Do

- Run against a production Shopify store URL
- Commit `.smoke-results/` to `main` directly — only commit to feature branches
- Check in `.playwright-output/` or `.playwright-report/` — these are gitignored
