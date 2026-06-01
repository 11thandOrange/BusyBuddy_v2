## Problem

<!-- What issue does this PR fix? Link the issue: Closes #N -->

Closes #

## Solution

<!-- What was built or changed, and why this approach? -->

## Acceptance Criteria

<!-- Copy from the issue. Check each one that this PR satisfies. -->

- [ ] 
- [ ] 
- [ ] 

## Approach

<!-- Key implementation decisions, trade-offs, or deviations from the original plan. -->

## Test Results

| Suite | Status | Count |
|-------|--------|-------|
| Backend (`cd web && npm test`) | ⬜ | — |
| Frontend (`cd web/frontend && npm test`) | ⬜ | — |
| Extension (`cd extensions/cart-transformer && npm test`) | ⬜ / N/A | — |
| Build (`CI=true npm run build`) | ⬜ | — |

## Checklist

- [ ] Tests pass locally before every commit
- [ ] No `console.log` in production paths
- [ ] No hardcoded secrets, shop URLs, or `localhost`
- [ ] New routes registered in `web/backend/routes/index.js`
- [ ] Polaris components used for all admin UI
- [ ] ES modules only — no `require()`
- [ ] `shopify app deploy` was NOT run
