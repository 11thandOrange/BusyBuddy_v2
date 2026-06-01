# Docs Deploy Skill — BusyBuddy_v2

Deploy the BusyBuddy_v2 documentation site to GitHub Pages.
Use via `site-deployer` agent — this skill provides the raw commands.

## Quick Commands

### Build
```bash
cd docs/frontend && npm ci && npm run build
```

### Deploy via gh-pages
```bash
cd docs/frontend && npx gh-pages -d dist -m "docs: deploy site [skip ci]"
```

### Trigger GitHub Actions (if workflow exists)
```bash
gh workflow run deploy-docs.yml --repo 11thandOrange/BusyBuddy_v2
```

### Check Deployment Status
```bash
gh api repos/11thandOrange/BusyBuddy_v2/pages --jq '.status'
```

## Vite Configuration

`docs/frontend/vite.config.ts` must have:
```typescript
export default defineConfig({
  base: '/BusyBuddy_v2/',  // Must match repo name
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false },
});
```

## Verification

```bash
# Site responds with 200
curl -s -o /dev/null -w "%{http_code}" https://11thandorange.github.io/BusyBuddy_v2/
```

## Troubleshooting

**404 on routes:** Verify `base` in vite.config.ts matches `/BusyBuddy_v2/`
**Stale content:** Wait 5-10 min or hard-refresh (Ctrl+Shift+R)
**Build fails:** Check Node.js >= 18, delete node_modules and reinstall

## Environment Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | >= 18 |
| npm | >= 9 |
| GITHUB_TOKEN | write access to 11thandOrange/BusyBuddy_v2 |
