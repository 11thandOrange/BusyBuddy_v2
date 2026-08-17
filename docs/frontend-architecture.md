# Frontend Architecture

The merchant-facing admin UI is a Vite + React app under `web/frontend`, embedded inside Shopify
admin. It is a Shopify app-template-node frontend using Polaris and App Bridge.

## Entry & providers

`index.jsx` mounts `App.jsx`, which wraps the tree in:

- `PolarisProvider` (`components/providers/PolarisProvider.jsx`) — Shopify Polaris `AppProvider`
  with a custom App Bridge-aware `Link` component for in-app navigation.
- `BrowserRouter` (react-router-dom).
- `QueryProvider` (`components/providers/QueryProvider.jsx`) — `react-query` client.
- `NavMenu` from `@shopify/app-bridge-react` for the embedded-app nav.

## Routing

`Routes.jsx` uses **file-based routing**: `App.jsx` calls `import.meta.glob("./pages/**/...")` and
`useRoutes` maps each file in `pages/` to a route (`/pages/index.jsx` → `/`, `[handle]` → `:handle`).
On top of the file routes, `Routes.jsx` explicitly registers the **standalone editor routes** for
each discount/widget app, e.g. `/announcement-bar/editor(/:id)`, `/bundle-discount/editor(/:id)`,
`/buy-one-get-one/editor(/:id)`, `/volume-discounts/editor(/:id)`, `/mix-and-match/editor(/:id)`.

## Pages, apps, and components

- `pages/` — top-level dashboard pages: `DashboardHome.jsx` (the widget grid), `Plan.jsx`, and one
  page per feature (`announcement-bar.jsx`, `bundles.jsx`, `bundle-discount.jsx`,
  `buy-one-get-one.jsx`, `volume-discounts.jsx`, `mix-and-match.jsx`, `inactive-tab-message.jsx`).
- `apps/` — the self-contained editor app per feature (`buy-one-get-one`, `volume-discounts`,
  `mix-and-match-discounts`, `bundle-discounts`, `announcement-bar`, `inactive-tab-message`). Each
  bundles its editor component, a `*Form`, and (for the discount apps) a reducer/actions pair for
  local state. The discount apps also share `components/BundelDiscountList.jsx`.
- `components/` — shared UI: providers, `Analytics/`, `Settings/AdvancedAnalyticsSettings.jsx`,
  `Editor/`, `Modals/`, `Plans/`, `Header.jsx`, `OverviewTab.jsx`, buttons/toggles.
- `hooks/` — `useEditorNavigation`, `useSimpleToast` (re-exported from `hooks/index.js`).

State is local component state plus reducer/actions inside each app; server state is fetched with
`react-query` and plain `fetch`/`authenticatedFetch` calls to `/api/*`.

## App Bridge & Shopify session auth

`index.html` loads Shopify App Bridge from the CDN
(`https://cdn.shopify.com/shopifycloud/app-bridge.js`) and injects the API key via the
`shopify-api-key` meta tag (`%VITE_SHOPIFY_API_KEY%`, substituted at build). App Bridge provides the
session token that authenticates admin `/api/*` calls against the backend's
`validateAuthenticatedSession()` gate.

The **standalone editors** open in their own tab and are not inside the App Bridge session, so they
authenticate with a signed `shop`+`signature` pair minted by `GET /api/editor/signature`
(`generateSignature`) — the backend's app-proxy branch verifies it (see
[Backend Architecture](./backend-architecture.md)).

## Config & environment

Vite config (`web/frontend/vite.config.js`) reads `SHOPIFY_API_KEY` into `VITE_SHOPIFY_API_KEY`,
and proxies `/` and `/api` to the backend at `http://127.0.0.1:${BACKEND_PORT}` during dev. `HOST`,
`FRONTEND_PORT`, `BACKEND_PORT`, and `SERVER_IP_ADDRESS` drive the dev server host/port and HMR.
