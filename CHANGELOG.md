# Changelog

All notable changes to BusyBuddy_v2 are documented here.

## 2026-07-23

### Changed
- Record BusyBuddy demo videos (2026-07-23)
- Add server-side product search to the standalone editors' picker
- Add temporary diagnostic for the product-search title matching
- Fix editor API auth rejecting requests with extra query params
- Add diagnostic for picker state after a confirmed-working search
- Fix overlapping product search terms in bundle-discounts/02
- Fix guessed discount-value placeholder in bundle-discounts specs
- Fix save-verification across all 11 create/edit specs
- Add diagnostic for the save flow after waitForSaveAndClose still times out
- Fix two real bugs blocking new-discount creation in standalone editors
- Fix strict-mode violation in refreshAndVerifyInList
- Add diagnostic to list currently available (untagged) products
- Fix BOGO list-verification to check title instead of product name
- Replace consumed/nonexistent product names in mix-and-match and volume-discounts specs
- Fix mix-and-match tier-preset bugs; add diagnostic for Palm Pilot search
- Fix volume-discounts product picker: rows are divs, not +Add buttons
- Add diagnostic for volume-discounts save flow
- Fix Volume Discounts: product fetch never built optionSelections
- Bump waitForSaveAndClose timeout to 30s
- Re-add volume-save-probe with a 60s wait
- Increase pollBundleStatus retry budget for slow Volume Discount provisioning
- Add per-run recording folders and optional recording toggle to record-demos.yml

## 2026-07-22

### Changed
- Add BusyBuddy demo video recording pipeline (Phase 3)
- Fix record-demos.yml to commit partial results and add diagnostics
- Record BusyBuddy demo videos (2026-07-22)
- Fix app fixture to not guess the embedded iframe's name
- Retry on cold-start 502s from the app backend
- Disambiguate strict-mode violations in sidepane/tier-preset clicks
- Wait for the subscription fetch before clicking Create/Manage
- Fix product-picker and tier-selector selectors from real source, not guesses
- Add journey comments, save-then-verify-in-list checks, and tab pacing
- Fix standalone editor's /api/* calls having no way to authenticate
- Add temporary diagnostic for the standalone editor auth fix
- Fix the real bug: serve-static ran before the editor auth handler
- Fix product picker response-shape mismatch in standalone editors

## 2026-07-21

### Changed
- Add demo store seed script scaffolding for Daisy's Electronics
- Have seed script perform Shopify client_credentials token exchange itself
- Add GH Actions workflow to run the demo store seed script
- Add sourced Unsplash image URLs for demo store products
- Drop unused location name field to avoid extra read_locations scope
- Fix productSet variant creation and surface per-product failures in CI
- Publish seeded products to the Online Store sales channel
- Look up existing product by handle so re-runs update instead of colliding
- Add media-status diagnostic to seed workflow
- Add image URL resolver to fix failed media on demo store products
- Use browser-like headers in image resolver to avoid 401s
- Fetch demo store images via the official Unsplash Search API
- Update demo store image URLs via Unsplash API
- Crop demo store images to a uniform 2048x2048 square
- Add theme inspector for editing the homepage hero image
- Add script to set the homepage hero banner image
- Use themeFilesUpsert GraphQL mutation instead of REST asset PUT
- Remove hero image update tooling — blocked by Shopify's themeFilesUpsert exemption gate

## 2026-07-20

### Changed
- Docs site: add Star Rating app, fix CI/CD staleness, add changelog, migrate to busybuddy.dev (#232)
- Fix remaining OrderMate copy-paste bugs in agent docs (#233)
- Point dev-pipeline caller at pipeline-orchestrator's reusable workflow (#234)
- Pass dev-pipeline secrets explicitly instead of secrets: inherit (#236)

## 2026-07-09

### Changed
- Fix critical billing/GDPR gaps (Category H)
- Improve reliability and error handling (Category I)
- Fix webhook body-draining bug and bump stale Functions API version
- Add the four missing test-coverage areas identified in the last audit
- Grant pull-requests: write to the storefront-e2e CI job
- Add BusyBuddy documentation site (docs/)
- Docs site: fix Tailwind design tokens and GitHub Pages deep-link 404s (#230)
- Docs site: sandbox panel on every API page + visible breakpoint fix (#231)

## 2026-07-08

### Changed
- Add automatic deploy-to-production workflow (#172)
- Fix critical security issues (#185-191)
- Delete non-functional Countdown Timer and Car Notice stub apps (#183-184)
- Cleanup: fix error masking, gate billing resync, remove dead code (#214-218)
- Add server + client validation for all bundle apps (#200-204)
- Add Announcement Bar / Inactive Tab form validation (#205-209)
- Fix storefront widget rendering/enablement issues (Category F)
- Fix UI issues: homepage layout, overview tab truncation, plan-page hangs (Category G)

## 2026-07-03

### Changed
- Remove skill_folder from dev-pipeline.yml caller inputs (#170)
- Add repo-local skills: cart-transformer + backend/frontend conventions (#171)

## 2026-07-02

### Added
- add dev-pipeline.yml caller workflow

### Changed
- retire OpenHands automation pipeline

### Fixed
- explicitly pass secrets to cross-org reusable workflow
- grant id-token: write to dispatch job for OIDC token

## 2026-06-17

### Changed
- remove invalid workflow and update Postman collection

## 2026-06-16

### Added
- support local OpenHands backend (defaults to localhost:18000)
- add cloudflared tunnel in workflow for local backend

### Fixed
- properly capture cloudflared tunnel URL from stdout
- combine tunnel and API call into single step
- properly check for empty/local OPENHANDS_HOST env var

## 2026-06-15

### Fixed
- add 401 error handling with helpful user guidance

## 2026-06-14

### Added
- add OpenHands Cloud automation workflow (#132)
- OpenHands automation workflow (#134)

### Changed
- Add OpenHands automation trigger workflow

### Fixed
- update workflow to support both event and manual trigger (#133)
- improve workflow reliability (#135)
- improve workflow error handling for missing API key
- add API response handling for OpenHands trigger
- use HTTP status code for trigger success detection

## 2026-06-07

### Added
- add parity agents and pipelines for BusyBuddy_v2 (#126)

### Changed
- standardize agent naming and cleanup shared skills
- rename playwright-smoke to screenshot-smoke (#127)

## 2026-06-01

### Added
- add smoke-tester agent and Playwright AC screenshot pipeline
- add mark-pr-ready skill; invoke before WhatsApp in STEP 9
- add complex-logic pipeline automation doc

### Changed
- demote build-check from agent to skill
- move smoke tests to CI job, remove from agent pipeline

### Fixed
- **tests**: final GoogleAnalyticsSection test fixes
- **tests**: remove orphaned test body causing syntax error in DashboardHome
- **tests**: replace unmockable window.open tests with button existence checks
- **tests**: pass proper empty cart input to cart-transformer run()
- enforce test-before-commit; add agent, skill, and GitHub templates
- **ci**: only run smoke job when PR is not a draft
- add PR link to WhatsApp ready message
- **tester**: add unhappy path examples to frontend and extension templates

## 2026-05-31

### Fixed
- **tests**: align activityLogService tests with actual implementation
- **tests**: use vi.hoisted() for ActivityLog constructor mock
- **tests**: mock Shop model in activity controller tests
- **tests**: fix two frontend test failures
- **tests**: fix remaining pre-existing frontend test failures
- **tests**: fix BundleAnalytics mock data fields and DashboardHome patterns
- **tests**: fix remaining frontend test failures
- **tests**: fix GoogleAnalyticsSection mock completeness and DashboardHome open stub
- **tests**: use Object.defineProperty for window.open in jsdom

## 2026-03-21

### Changed
- Complete remaining refinements for issue #110
- Refine OverviewTab and homepage:
- OverviewTab: Update list item styling - default bg from hover, hover/selected use selected styles
- OverviewTab: Remove chevron/carrot from list items
- Homepage: Add notification card beneath activity history
- DEBUG: Add console logging to diagnose production routing hang
- Add timeout to subscription API call and fallback loading state
- DEBUG: Add logging to MixMatchForm and BundelDiscountList to trace navigation issue
- Add shop param to API calls for proper session authentication
- Pass full query string to API calls for signature verification
- DEBUG: Try simple URL with credentials:include for session auth
- DEBUG: Add server-side logging to auth middleware

## 2026-03-20

### Changed
- Dashboard homepage refinements: Inactive Tab Message, button behavior, styling
- Fix editor to open fullscreen without Shopify admin shell
- Add height: fit-content to .widgets-column and .history-column
- Remove autoTriggerActions from bundle app homepages
- Remove undefined authenticatedFetch reference causing analytics crash
- App homepage Create buttons open editor in fullscreen tab + Analytics empty states
- Remove duplicate dashboard-homepage.html demo file
- Add unit tests for dashboard, app homepages, editor, and analytics
- Fix activity API ObjectId cast error
- Fix race condition: don't redirect to plan while subscription loading
- Fix plan access - don't block on subscription API failure
- Revert "Fix plan access - don't block on subscription API failure"
- Add debug logging to handleManage
- height fix

## 2026-03-19

### Changed
- Update dashboard history card to show end-user analytics
- Implement real-time activity feed for dashboard history card
- Filter activity feed to show only customer events
- Separate stats: Active Bundles and Active Bars
- Fix bundle model import path (bundle.model.js not bundles.model.js)
- Fix theme extension toml format - add [[extensions]] block
- Revert theme extension toml to original format (without api_version)

## 2026-03-16

### Changed
- Include shop param in editor navigation query strings
- Allow editor routes to work in new tab with session validation
- Use sessionModel directly for editor route validation
- Debug: Add logging to editor session validation
- Use originalUrl instead of path for editor route detection
- Disable App Bridge for editor routes to allow standalone new tab
- Separate editor entry point without App Bridge
- Use existing QueryProvider in editor.jsx

## 2026-03-15

### Changed
- Merge PR #103 (#17_advanced_analytics) - Advanced Analytics with Google Analytics Integration
- Update package-lock.json with googleapis dependencies

### Fixed
- Add authenticated fetch to Google Analytics components
- Correct hook ordering in Google Analytics components
- Add unique key to product badges in DiscountList
- Remove App Bridge session token auth - use plain fetch

## 2026-03-13

### Fixed
- bypass Shopify auth for referral routes and add admin API key auth
- add referral redirect endpoint for click tracking

## 2026-03-08

### Added
- Implement BusyBuddy Referral URL Logic (#42)

### Fixed
- Update cart-transformer API version from 2025-01 to 2025-04

## 2025-11-10

### Changed
- Merge pull request #1 from 11thandOrange/release_busyBuddy_phase1
- updating server host from localhost to public server IP
