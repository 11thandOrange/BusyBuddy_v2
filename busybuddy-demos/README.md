# BusyBuddy Demo Video Pipeline

Playwright scripts and recordings for all 6 BusyBuddy apps' user journeys
against the Daisy's Electronics demo store. Recordings are committed
directly into this repo (`videos/`, `traces/`, `screenshots/`) — not
uploaded as CI artifacts.

## Layout

```
busybuddy-demos/
  scripts/
    announcement-bar/         demo-video journeys (recorded, one per marketing clip)
    bundle-discounts/
    buy-one-get-one/
    volume-discounts/
    mix-and-match/
    inactive-tab-message/
    announcement-bar-e2e/     comprehensive E2E suites, one dir per app (see below)
    bundle-discounts-e2e/
    buy-one-get-one-e2e/
    volume-discounts-e2e/
    mix-and-match-e2e/
    inactive-tab-message-e2e/
  fixtures/app.js           shared auth/navigation/selector helpers
  fixtures/organize-reporter.js   renames raw Playwright output into videos/traces/screenshots
  playwright.config.js
  videos/*.webm
  traces/*.zip
  screenshots/*.png
```

Each recording is named `<app>-<journey>.webm` (matching its trace/screenshot),
e.g. `announcement-bar-create-bar.webm`.

### Comprehensive E2E suites (`*-e2e/`)

Each `*-e2e/` directory is a from-scratch Playwright suite for one app,
tracking its own GitHub ticket rather than a marketing journey:

| Directory                     | Ticket |
|--------------------------------|--------|
| `bundle-discounts-e2e/`        | #306   |
| `buy-one-get-one-e2e/`         | #307   |
| `mix-and-match-e2e/`           | #308   |
| `volume-discounts-e2e/`        | #309   |
| `announcement-bar-e2e/`        | #310   |
| `inactive-tab-message-e2e/`    | #311   |

Files are numbered per app (`01-create-and-customize.spec.js`,
`02-discounts-page.spec.js`, `03-settings.spec.js`, etc.) and depend on
running in that order within their own directory - `playwright.config.js`
sets `workers: 1` / `fullyParallel: false` so file order is preserved.
`01-*` in the 5 bundle-type/bar apps also exercises each app's app-wide
Active/Inactive switch (`components/ToggelSwitch.jsx`, via the shared
`toggleAppWideSwitchAndRestore` fixture helper) before creating anything -
that switch lives on the app's own "Manage" page, separate from any
per-item Active/Inactive status covered later in the same suite.
`inactive-tab-message-e2e/` has no popup editor at all (see its own
Settings form), so its 3 files instead cover settings configuration,
live storefront `visibilitychange` behavior, and tab navigation.

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
```

Every run needs the same two env vars set (shown once here, omitted from
the examples below for brevity):

```
export SHOPIFY_STORE_DOMAIN=daisys-electronics-9kihd5yl.myshopify.com
export BUSYBUDDY_ADMIN_URL=https://admin.shopify.com/store/daisys-electronics-9kihd5yl/apps/<app-handle>
```

**All tests** (every demo journey and every `*-e2e/` suite):
```
npx playwright test
```

**A single suite** (one app's whole `*-e2e/` directory, e.g. Bundle Discount's #306):
```
npx playwright test scripts/bundle-discounts-e2e
```
To run all 6 comprehensive `*-e2e/` suites and nothing else:
```
npx playwright test scripts/bundle-discounts-e2e scripts/buy-one-get-one-e2e scripts/mix-and-match-e2e scripts/volume-discounts-e2e scripts/announcement-bar-e2e scripts/inactive-tab-message-e2e
```

**A single test file** (e.g. just Suite 1/2 of Bundle Discount):
```
npx playwright test scripts/bundle-discounts-e2e/01-create-and-customize.spec.js
```

**A single `test()` block** by its title (`-g` is a regex match against the
`test(...)` name, e.g. this app's `01-create-and-customize.spec.js` defines
exactly one test titled `Bundle Discount: create + customize full editor
workflow`):
```
npx playwright test scripts/bundle-discounts-e2e/01-create-and-customize.spec.js -g "create \+ customize"
```

## Notes

- Selectors were derived directly from the source components
  (`web/frontend/components/BundelDiscountList.jsx`, `apps/*/`, `components/Editor/`)
  rather than from a live run, since this sandbox can't reach the store to
  verify them. Expect to need small selector fixes after the first real
  run — re-run just the failing spec file with `npx playwright test <path>`.
- The storefront-only journeys (`*-storefront-live.spec.js`) don't need
  `auth.json` or `admin_url` — they hit the public storefront directly.
  Same for `inactive-tab-message-e2e/02-storefront-behavior.spec.js`.
- The `*-e2e/` suites are hand-written against the real components (not
  copied from the `scripts/<app>/` demo journeys, which were built for
  video recording and have different assumptions) - do not merge or dedupe
  the two sets of specs.
