# BusyBuddy Documentation Site

Public docs for BusyBuddy, built with React + TypeScript + Vite + Tailwind, deployed to
GitHub Pages from `docs/frontend/dist`.

## Structure

```
docs/
└── frontend/
    ├── src/
    │   ├── components/   # Layout (Header, Sidebar) + API reference (EndpointDoc, Sandbox) + ui primitives
    │   ├── data/          # Content: apps.ts, endpoints.ts, features.ts, workflows.ts, navigation.ts
    │   ├── pages/         # One component per top-level tab
    │   └── types/
    └── ...
```

## Content is hand-sourced from the real codebase

The `src/data/*.ts` files are the source of truth for every page's content. They're written by
hand, but each was populated by reading the actual code they document (`web/backend/routes/*`
for API Reference, `.github/workflows/*.yml` for CI/CD, `web/frontend/pages/DashboardHome.jsx`'s
`widgetConfig`/`planFeatures` for App List). There's no automated generation step - if the real
routes or workflows change, these files need a manual update to stay accurate.

## API sandbox

`API Reference → Storefront (Public)` includes a live "Try it" sandbox. It only targets the four
endpoints reachable through the Shopify App Proxy without a merchant session
(`getAnnouncementBar`, `getInactiveTab`, `getActiveBundle`, `subscribeEmail`) - every other
endpoint requires an authenticated Shopify Admin session and is documented as example-only, with
no working "Send" button.

**Known limitation:** the sandbox calls `https://{shop}/apps/bogo-app/api/frontStore/...`
directly from the browser, which is cross-origin relative to the docs site. Unless the backend
sends `Access-Control-Allow-Origin` for this origin, the browser will block reading the response
even though the request may succeed - the sandbox shows a specific message for this case rather
than a generic failure.

## Routing

Uses `HashRouter` (`#/getting-started`, `#/api/bundles`, etc.) rather than `BrowserRouter`,
since GitHub Pages project sites have no server-side rewrite for deep-linked client-side routes.

## Development

```bash
cd frontend
npm install
npm run dev
```

## Deployment

Automatic via `.github/workflows/deploy-docs.yml` on every push to `main` that touches `docs/**`.
Requires GitHub Pages to be enabled in repo settings with source set to "GitHub Actions" (Settings
→ Pages → Build and deployment → Source).
