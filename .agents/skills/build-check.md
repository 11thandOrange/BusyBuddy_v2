# Build Check Skill — BusyBuddy_v2

Verify the BusyBuddy_v2 frontend builds cleanly. Run after all tests pass,
before opening a PR. Does not deploy or release.

## Build Commands

The Dockerfile defines the canonical build:

```bash
cd web && npm install
cd web/frontend && npm install && SHOPIFY_API_KEY=$SHOPIFY_API_KEY npm run build
```

In CI (or any sandbox without `SHOPIFY_API_KEY`), set `CI=true` to bypass the
API key check in `vite.config.js`:

```bash
cd web && npm install
cd web/frontend && npm install && CI=true npm run build
```

`CI=true` is safe for verification builds — it skips the guard that prevents
accidental local builds without a key. The actual app still needs `SHOPIFY_API_KEY`
at runtime.

## Step-by-Step

### Step 1 — Install Dependencies

```bash
cd /repo && npm install          # root (Shopify CLI)
cd web && npm install            # backend
cd web/frontend && npm install   # frontend
```

### Step 2 — Run the Build

```bash
cd web/frontend
CI=true npm run build 2>&1
```

A successful build outputs:
```
vite v5.x.x building for production...
✓ N modules transformed.
dist/index.html     X kB
dist/assets/...     X kB
✓ built in Xs
```

### Step 3 — Verify Output

```bash
ls -la web/frontend/dist/
# Must contain index.html and assets/
```

### Step 4 — Report

```markdown
## Build Check: BusyBuddy_v2

**Status:** ✅ SUCCESS / ❌ FAILED
**Duration:** Xs

### Output Files
| File | Size |
|------|------|
| dist/index.html | X kB |
| dist/assets/index-*.js | X kB |
| dist/assets/index-*.css | X kB |

### Warnings
<list any Vite warnings — unused imports, large chunks, etc.>

### Errors
<paste full error if failed>

### Recommended Fix
<if failed, what to fix>
```

## Common Build Failures

| Error | Cause | Fix |
|-------|-------|-----|
| `The frontend build will not work without an API key` | `CI` not set and no `SHOPIFY_API_KEY` | Set `CI=true` |
| `Cannot find module '...'` | Missing import or wrong path | Check the import path and file exists |
| `X is not exported from '...'` | Named export mismatch | Check the export in the source file |
| `Rollup failed to resolve import` | Missing npm package | Run `npm install <package>` in `web/frontend/` |
| `Out of memory` | Large bundle | Check for accidental full-library imports (e.g. `import * from 'lodash'`) |

## Never Do

- Run `shopify app deploy` — that deploys to production
- Push to `main`
- Bump version numbers
- Modify `vite.config.js` to remove the API key check permanently
