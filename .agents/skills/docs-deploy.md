# Docs Deploy Skill

Deploy the BusyBuddy_v2 documentation site to GitHub Pages using GitHub Actions.

## Quick Commands

### Build Site
```bash
cd docs/frontend && npm ci && npm run build
```

### Deploy via gh-pages
```bash
cd docs/frontend && npx gh-pages -d dist
```

### Trigger GitHub Action
```bash
gh workflow run deploy-docs.yml
```

### Check Deployment Status
```bash
gh api repos/11thandOrange/BusyBuddy_v2/pages --jq '.status'
```

## GitHub Actions Workflow

`.github/workflows/deploy-docs.yml` (already exists):

```yaml
name: Deploy Docs Site

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: docs/frontend/package-lock.json

      - name: Install dependencies
        working-directory: docs/frontend
        run: npm ci

      - name: Build
        working-directory: docs/frontend
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/frontend/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Vite Configuration

`docs/frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',  // Served from the custom domain root - see public/CNAME
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

## GitHub Pages Setup

### Enable GitHub Pages
1. Go to repo Settings → Pages
2. Source: GitHub Actions
3. Custom domain: `busybuddy.dev` (requires `docs/frontend/public/CNAME` containing `busybuddy.dev`, plus DNS records pointing at GitHub Pages)
4. Save, then enable "Enforce HTTPS" once the certificate provisions

### Verify Settings via API
```bash
gh api repos/11thandOrange/BusyBuddy_v2/pages
```

### Expected Response
```json
{
  "url": "https://busybuddy.dev/",
  "status": "built",
  "source": {
    "branch": "main",
    "path": "/"
  }
}
```

## Manual Deployment Steps

If GitHub Actions is not available:

```bash
# 1. Build the site
cd docs/frontend
npm ci
npm run build

# 2. Create/checkout gh-pages branch
git checkout --orphan gh-pages

# 3. Remove all files
git rm -rf .

# 4. Copy dist contents
cp -r docs/frontend/dist/* .

# 5. Add .nojekyll to bypass Jekyll processing
touch .nojekyll

# 6. Commit and push
git add .
git commit -m "Deploy docs site"
git push origin gh-pages --force

# 7. Return to main
git checkout main
```

## Deployment Verification

### Check Site is Live
```bash
curl -s -o /dev/null -w "%{http_code}" https://busybuddy.dev/
# Should return 200
```

### Check Specific Routes
```bash
# Home page
curl -I https://busybuddy.dev/

# API docs (SPA route, should return index.html)
curl -I https://busybuddy.dev/api
```

### Monitor Workflow
```bash
# Watch latest run
gh run watch

# List recent runs
gh run list --workflow=deploy-docs.yml --limit=5
```

## Troubleshooting

### 404 on Routes
`docs/frontend/public/404.html` already handles this via the rafgraph SPA-fallback redirect
pattern (redirects to `index.html` with the path preserved as a query string). If deep
links 404 after a domain change, check `pathSegmentsToKeep` in `404.html` matches the
current base path (0 for the custom domain root, 1 if ever reverted to the
`/BusyBuddy_v2/` GitHub Pages project path).

### Assets Not Loading
Check browser console for 404s. Common fixes:
- Verify `base` in vite.config.ts matches how the site is actually served
- Ensure paths use relative URLs or start with base path

### Stale Cache
GitHub Pages caches aggressively. Wait 5-10 minutes or:
```bash
# Hard refresh in browser: Ctrl+Shift+R
# Or purge via API (if available)
```

### Build Fails in CI
Check:
- Node version matches local
- Dependencies are committed (package-lock.json)
- No missing env vars

## Environment Requirements

- Node.js 18+
- npm 9+
- GitHub token with `pages:write` permission
