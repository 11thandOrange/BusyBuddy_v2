import type { WorkflowDoc } from '../types';

export const workflows: WorkflowDoc[] = [
  {
    slug: 'node-ci',
    title: 'Node CI',
    file: '.github/workflows/node-ci.yml',
    trigger: 'pull_request → branches: [main]',
    description:
      'Runs on every PR targeting main. Two jobs: test-and-build installs and tests all four independently-versioned packages (root, web, web/frontend, extensions/cart-transformer, extensions/bogo-shopify-app) and builds the admin frontend; storefront-e2e then runs the real Playwright suite against the theme extension assets in a headless browser.',
    jobs: [
      {
        name: 'test-and-build',
        runsOn: 'ubuntu-latest',
        steps: [
          { name: 'Install dependencies', detail: 'npm ci/install across root, web, web/frontend, extensions/cart-transformer, extensions/bogo-shopify-app, and docs/frontend' },
          { name: 'Run backend tests', detail: 'npx vitest run in web/backend - unit + integration tests (routes, controllers, session storage, auth flow)' },
          { name: 'Run frontend tests', detail: 'npm test in web/frontend - React component tests via vitest + Testing Library' },
          { name: 'Run extension tests', detail: 'npm test in extensions/cart-transformer - Cart Transform Function unit tests' },
          { name: 'Run bogo-shopify-app unit tests', detail: 'npm test - XSS-sanitization helper tests, executed against the real theme-extension source file via Node\'s vm module' },
          { name: 'Build frontend', detail: 'npm run build in web/frontend (CI=true)' },
          { name: 'Build docs site', detail: 'npm run build in docs/frontend - catches docs-site build breakage on every PR, ahead of deploy-docs.yml' },
          { name: 'Upload test results', detail: 'Coverage artifacts from web/coverage and web/frontend/coverage' },
        ],
      },
      {
        name: 'storefront-e2e',
        runsOn: 'ubuntu-latest (needs: test-and-build)',
        steps: [
          { name: 'Draft-PR gate', detail: 'if: github.event.pull_request.draft == false - skips this job entirely while a PR is still a draft' },
          { name: 'Job permissions', detail: 'permissions: contents: read, pull-requests: write - scoped to this job only, so the "Post PR comment" step can comment without granting write access to the rest of the workflow' },
          { name: 'Install Playwright Chromium', detail: 'extensions/bogo-shopify-app' },
          { name: 'Run storefront e2e tests', detail: 'Real browser tests against the actual announcement-bar-extension.js and inactiveTab.js files - render/no-render on enable-disable, date-window gating, email capture, XSS-safety regression' },
          { name: 'Post PR comment', detail: 'Posts a pass/fail summary comment on the PR (requires pull-requests: write permission, scoped to this job)' },
        ],
      },
    ],
  },
  {
    slug: 'deploy-docs',
    title: 'Deploy Docs Site',
    file: '.github/workflows/deploy-docs.yml',
    trigger: 'push → branches: [main], paths: [docs/**, .github/workflows/deploy-docs.yml]  (also workflow_dispatch)',
    description:
      'Builds and publishes this documentation site to GitHub Pages whenever docs/** changes on main. Uses the standard actions/configure-pages + upload-pages-artifact + deploy-pages flow, gated by a pages/cancel-in-progress: false concurrency group so deploys queue rather than race.',
    jobs: [
      {
        name: 'build',
        runsOn: 'ubuntu-latest',
        steps: [
          { name: 'Install dependencies', detail: 'npm ci in docs/frontend' },
          { name: 'Build', detail: 'npm run build in docs/frontend' },
          { name: 'Setup Pages', detail: 'actions/configure-pages@v4' },
          { name: 'Upload artifact', detail: 'actions/upload-pages-artifact@v3, path: docs/frontend/dist' },
        ],
      },
      {
        name: 'deploy',
        runsOn: 'ubuntu-latest (needs: build, environment: github-pages)',
        steps: [
          { name: 'Deploy to GitHub Pages', detail: 'actions/deploy-pages@v4 - publishes the uploaded artifact and exposes the live page_url' },
        ],
      },
    ],
  },
  {
    slug: 'deploy',
    title: 'Deploy to Production',
    file: '.github/workflows/deploy.yml',
    trigger: 'push → branches: [main]  (also workflow_dispatch)',
    description:
      'Every merge to main triggers an immediate production deploy on a self-hosted runner: pulls the latest main, reinstalls dependencies, rebuilds the frontend, and restarts the live process via pm2. There is no separate staging step - main is production.',
    jobs: [
      {
        name: 'deploy',
        runsOn: 'self-hosted',
        steps: [
          { name: 'Pull latest main and rebuild', detail: 'git fetch + reset --hard origin/main, npm install in web and web/frontend, npm run build' },
          { name: 'Restart', detail: 'pm2 restart BusyBuddy_v2 --update-env && pm2 save' },
          { name: 'Report deployed commit', detail: 'Logs the deployed commit hash and message' },
        ],
      },
    ],
  },
  {
    slug: 'dev-pipeline',
    title: 'AI Dev-Agent Pipeline',
    file: '.github/workflows/dev-pipeline.yml',
    trigger: 'issues: labeled  ·  issue_comment: created  ·  repository_dispatch: agent-trigger',
    description:
      'Dispatches to a reusable workflow (HeyItsChloe/pipeline-orchestrator) that runs an AI coding agent against a labeled/commented GitHub issue in two modes: "plan" (produces an implementation approach) and "implement" (writes the code). Skills are pulled separately from HeyItsChloe/agent-ops. Triggered either by applying the approach-ready/approved labels or by commenting "@dev-agent plan"/"@dev-agent implement" on an issue. This replaced an older OpenHands-based pipeline (.github/workflows/openhands.yml.legacy), which is retired: renamed to a .yml.legacy extension so GitHub Actions no longer picks it up, its label trigger neutralized, kept only for historical reference.',
    jobs: [
      {
        name: 'dispatch',
        runsOn: 'reusable workflow (HeyItsChloe/pipeline-orchestrator/.github/workflows/dev-pipeline-reusable.yml)',
        steps: [
          { name: 'Determine action', detail: 'plan vs. implement, based on the label applied or comment text' },
          { name: 'Run agent', detail: 'TypeScript project, test command npm test -- --coverage, 85% desired coverage threshold, cobertura coverage format, skills pulled from HeyItsChloe/agent-ops@main' },
        ],
      },
      {
        name: 'legacy: openhands dispatch (retired)',
        runsOn: 'manual, via Postman - not a live GitHub Actions job',
        steps: [
          { name: 'Postman collection', detail: 'postman/OpenHands_Automations.postman_collection.json documents the retired OpenHands Cloud API this pipeline used to run on: POST /automation/v1/{id}/dispatch to trigger a run, GET /automation/v1/{id}/runs/{run_id} to poll status, POST and GET /conversation/{id}/messages to send issue context and read agent logs.' },
          { name: 'Status', detail: 'Superseded by the GitHub-native trigger above (labels/comments on the issue itself). Kept for historical reference only - do not re-register new automations against it.' },
        ],
      },
    ],
  },
  {
    slug: 'seed-demo-store',
    title: 'Seed Demo Store',
    file: '.github/workflows/seed-demo-store.yml',
    trigger: 'workflow_dispatch (input: store_domain, default daisys-electronics-9kihd5yl.myshopify.com)',
    description:
      'Manual workflow that seeds a demo Shopify store with sample data via scripts/seed-demo-store/seed.mjs, then verifies image media finished processing. Used to keep the demo/screenshot store in a known-good state.',
    jobs: [
      {
        name: 'seed',
        runsOn: 'ubuntu-latest',
        steps: [
          { name: 'Run seed script', detail: 'node scripts/seed-demo-store/seed.mjs against SHOPIFY_STORE_DOMAIN using SHOPIFY_DEMO_CLIENT_ID/SECRET' },
          { name: 'Check image media status', detail: 'node scripts/seed-demo-store/check-images.mjs - confirms uploaded product images finished Shopify media processing' },
        ],
      },
    ],
  },
  {
    slug: 'fetch-demo-images',
    title: 'Fetch Demo Store Images (Unsplash API)',
    file: '.github/workflows/fetch-demo-images.yml',
    trigger: 'workflow_dispatch',
    description:
      'Manual workflow that fetches product photography from the Unsplash API and commits the resulting URL list back to the repo for use by the seeding scripts.',
    jobs: [
      {
        name: 'fetch',
        runsOn: 'ubuntu-latest',
        steps: [
          { name: 'Fetch images via Unsplash API', detail: 'node scripts/seed-demo-store/fetch-images.mjs, using UNSPLASH_ACCESS_KEY' },
          { name: 'Commit updated images.json', detail: 'Commits and pushes scripts/seed-demo-store/images.json if it changed' },
        ],
      },
    ],
  },
  {
    slug: 'resolve-demo-images',
    title: 'Resolve Demo Store Images',
    file: '.github/workflows/resolve-demo-images.yml',
    trigger: 'workflow_dispatch',
    description: 'Manual workflow that resolves/validates the demo store\'s image URL list via scripts/seed-demo-store/resolve-images.mjs.',
    jobs: [
      {
        name: 'resolve',
        runsOn: 'ubuntu-latest',
        steps: [{ name: 'Resolve image URLs', detail: 'node scripts/seed-demo-store/resolve-images.mjs' }],
      },
    ],
  },
  {
    slug: 'inspect-demo-theme',
    title: 'Inspect Demo Store Theme',
    file: '.github/workflows/inspect-demo-theme.yml',
    trigger: 'workflow_dispatch (input: store_domain, default daisys-electronics-9kihd5yl.myshopify.com)',
    description: 'Manual diagnostic workflow that inspects the demo store\'s current theme structure via scripts/seed-demo-store/inspect-theme.mjs, used while building/debugging the demo recordings.',
    jobs: [
      {
        name: 'inspect',
        runsOn: 'ubuntu-latest',
        steps: [{ name: 'Inspect theme structure', detail: 'node scripts/seed-demo-store/inspect-theme.mjs against SHOPIFY_STORE_DOMAIN' }],
      },
    ],
  },
  {
    slug: 'record-demos',
    title: 'Record BusyBuddy Demo Videos',
    file: '.github/workflows/record-demos.yml',
    trigger: 'workflow_dispatch (inputs: store_domain, admin_url, test_filter, record)',
    description:
      'Manual workflow that runs the Playwright-based demo-recording suite in busybuddy-demos/ against a real storefront + embedded admin session, then commits the resulting videos/traces/screenshots into the repo under a per-run timestamped folder. The "record" input can be unchecked for a fast pass/fail-only run with nothing committed.',
    jobs: [
      {
        name: 'record',
        runsOn: 'ubuntu-latest',
        steps: [
          { name: 'Restore admin session', detail: 'Decodes SHOPIFY_ADMIN_AUTH_STATE into auth.json for the Playwright browser context' },
          { name: 'Set run folder', detail: 'DEMO_RUN_FOLDER=<UTC timestamp> - keeps each run\'s videos/traces/screenshots in their own subfolder instead of overwriting the last run' },
          { name: 'Record demo journeys', detail: 'npx playwright test (optionally filtered via test_filter) against store_domain / admin_url' },
          { name: 'Remove admin session before commit', detail: 'Deletes auth.json (runs even on failure) so the session token is never committed' },
          { name: 'Commit recordings into the repo', detail: 'Commits busybuddy-demos/videos, /traces, /screenshots if there\'s anything new, and pushes to the triggering branch (runs even on failure, so partial passes aren\'t lost)' },
          { name: 'Upload diagnostic output on failure', detail: 'Uploads raw Playwright output (screenshots/error-context) as a 3-day artifact - temporary aid for debugging selector failures' },
        ],
      },
    ],
  },
];

export function getWorkflow(slug: string) {
  return workflows.find((w) => w.slug === slug);
}
