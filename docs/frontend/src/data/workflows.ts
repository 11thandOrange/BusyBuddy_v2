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
      'Dispatches to a reusable workflow (HeyItsChloe/agent-ops) that runs an AI coding agent against a labeled/commented GitHub issue in two modes: "plan" (produces an implementation approach) and "implement" (writes the code). Triggered either by applying the approach-ready/approved labels or by commenting "@dev-agent plan"/"@dev-agent implement" on an issue. This replaced an older OpenHands-based pipeline (.github/workflows/openhands.yml.legacy), which is retired: renamed to a .yml.legacy extension so GitHub Actions no longer picks it up, its label trigger neutralized, kept only for historical reference.',
    jobs: [
      {
        name: 'dispatch',
        runsOn: 'reusable workflow (HeyItsChloe/agent-ops/.github/workflows/dev-pipeline-reusable.yml)',
        steps: [
          { name: 'Determine action', detail: 'plan vs. implement, based on the label applied or comment text' },
          { name: 'Run agent', detail: 'TypeScript project, test command npm test -- --coverage, 85% desired coverage threshold, cobertura coverage format' },
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
];

export function getWorkflow(slug: string) {
  return workflows.find((w) => w.slug === slug);
}
