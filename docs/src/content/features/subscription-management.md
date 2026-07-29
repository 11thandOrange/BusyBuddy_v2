---
title: "Subscription Management"
order: 2
summary: "Backend routes that govern whether BusyBuddy and its widgets are active and enabled for a given shop."
status: stable
implements:
  workflows:
    - ci
  skills: []
  dependencies: []
  integrations:
    - shopify-admin-api
    - shopify-app-proxy
runWith:
  - "Merchants pick a plan from the dashboard; the frontend calls POST /api/subscription/subscribe."
  - "The app checks GET /api/subscription/checkBusyBuddyEnabled before applying storefront behavior."
  - "Individual apps are switched on or off per shop via POST /api/subscription/toggle-app and read back via GET /api/subscription/app-status/:appId?."
tradeoffs:
  - "Subscription state is the single gate for the whole suite: if the app is not enabled for a shop, its widgets do not apply, so this route family is a dependency of every other feature."
  - "Plan tiers are enforced server-side in the controller rather than in the client, so the dashboard reflects — but does not decide — entitlement."
notes:
  - kind: important
    body: "This route family is the source of truth for whether the app is active for a shop. Most other BusyBuddy features check it before doing anything on the storefront."
---

## What it does

Subscription Management governs whether BusyBuddy — and each of its widgets — is active
and enabled for a given shop. It handles plan selection, cancellation, the app-level
enable check, and per-app on/off toggling.

## How it works

The routes live in `web/backend/routes/subscription/index.js` and are handled in
`web/backend/controller/subscription/index.js`:

- `GET /getUserSubscription` — the shop's current subscription
- `POST /subscribe` — subscribe to a plan
- `POST /cancel-subscription` — cancel the subscription
- `GET /checkBusyBuddyEnabled` — whether the app is enabled for the shop
- `GET /getThemeEditorUrl` — deep link into the Shopify Theme Editor
- `POST /toggle-app` — enable or disable an individual app
- `GET /app-status/:appId?` — read an app's enabled state

All routes are mounted under the `/api` prefix.

## Configuration & running

A merchant selects a plan from the dashboard, which drives `POST /subscribe`. Before any
widget renders on the storefront, the app consults `GET /checkBusyBuddyEnabled`.
Merchants turn individual apps on or off with `POST /toggle-app`, and the dashboard
reflects the current state via `GET /app-status/:appId?`.
