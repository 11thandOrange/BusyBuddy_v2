# BusyBuddy Demo Video Pipeline

Playwright scripts and recordings for all 6 BusyBuddy apps' user journeys
against the Daisy's Electronics demo store. Recordings are committed
directly into this repo (`videos/`, `traces/`, `screenshots/`) — not
uploaded as CI artifacts.

## Layout

```
busybuddy-demos/
  scripts/                  one independently-runnable spec per journey
    announcement-bar/
    bundle-discounts/
    buy-one-get-one/
    volume-discounts/
    mix-and-match/
    inactive-tab-message/
  fixtures/app.js           shared auth/navigation/selector helpers
  fixtures/organize-reporter.js   renames raw Playwright output into videos/traces/screenshots
  playwright.config.js
  videos/*.webm
  traces/*.zip
  screenshots/*.png
```

Each recording is named `<app>-<journey>.webm` (matching its trace/screenshot),
e.g. `announcement-bar-create-bar.webm`.

## Prerequisites

1. **BusyBuddy must be installed on Daisy's Electronics** with at least one
   widget of each type created from the seeded product catalog
   (`scripts/seed-demo-store/`), so the "edit existing" journeys have
   something to open.
2. **A saved admin session** (`auth.json`), since the admin-app journeys
   need an authenticated embedded session:
   ```
   npx playwright codegen --save-storage=auth.json https://admin.shopify.com
   ```
   Log into the Daisy's Electronics admin in the window that opens, then
   close it. Base64-encode the file and store it as the `SHOPIFY_ADMIN_AUTH_STATE`
   GitHub secret:
   ```
   base64 -i auth.json | pbcopy
   ```
3. **The BusyBuddy admin URL** for this store — the embedded app URL under
   `https://admin.shopify.com/store/daisys-electronics-9kihd5yl/apps/<app-handle>`.
   Passed as the `admin_url` workflow input each run (not hardcoded, since
   the app handle isn't checked into this repo).

## Running via GitHub Actions (only supported path)

This sandbox and most local machines can't reach `*.myshopify.com`, so
recording runs via the `Record BusyBuddy Demo Videos` workflow
(`.github/workflows/record-demos.yml`):

1. Add the `SHOPIFY_ADMIN_AUTH_STATE` secret (see above) if not already set.
2. Trigger the workflow (`workflow_dispatch`) with `store_domain` and `admin_url`.
3. It restores `auth.json` from the secret, runs `npx playwright test`,
   organizes the output into `videos/`, `traces/`, `screenshots/` with
   descriptive names, deletes the session file, and commits + pushes the
   new recordings directly to the branch it ran on.

## Running locally (optional, requires real network access)

```
cd busybuddy-demos
npm install
npx playwright install --with-deps chromium
npx playwright codegen --save-storage=auth.json https://admin.shopify.com
SHOPIFY_STORE_DOMAIN=daisys-electronics-9kihd5yl.myshopify.com \
BUSYBUDDY_ADMIN_URL=https://admin.shopify.com/store/daisys-electronics-9kihd5yl/apps/<app-handle> \
npx playwright test
```

## Notes

- Selectors were derived directly from the source components
  (`web/frontend/components/BundelDiscountList.jsx`, `apps/*/`, `components/Editor/`)
  rather than from a live run, since this sandbox can't reach the store to
  verify them. Expect to need small selector fixes after the first real
  run — re-run just the failing spec file with `npx playwright test <path>`.
- The storefront-only journeys (`*-storefront-live.spec.js`) don't need
  `auth.json` or `admin_url` — they hit the public storefront directly.
