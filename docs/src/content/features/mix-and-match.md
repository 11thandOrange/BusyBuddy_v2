---
title: "Mix and Match"
order: 5
summary: "A Shopify discount app that lets merchants build mix-and-match bundles — pick any N products from a set for a bundled price — from the BusyBuddy dashboard."
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
  - "Open the BusyBuddy dashboard and choose the Mix and Match app."
  - "Choose the eligible products and the bundle pricing in the editor, then save to publish."
  - "Enable the app for the shop from the dashboard's app toggle before the storefront applies it."
tradeoffs:
  - "Mix and Match is one member of BusyBuddy's discount-app family; unlike the others it has its own create/update endpoints (POST /api/bundles/mix-and-match and /api/bundles/mix-and-match/:id) rather than the generic bundle create route."
  - "Discount behavior is bounded by what Shopify's discount and cart-transform layer exposes."
notes:
  - kind: note
    body: "Mix and Match sits inside BusyBuddy's plan-gated app-toggle system (subscription appLimits.mix_match): the offer only affects the storefront while the app is enabled for the shop."
---

## What it does

Mix and Match is a Shopify discount app in the BusyBuddy suite. It lets a merchant define
a "pick any N from this set" bundle — customers assemble their own bundle from eligible
products and receive the bundle price — and publish it to the storefront.

## How it works

The dashboard page is `web/frontend/pages/mix-and-match.jsx`, which renders the app under
`web/frontend/apps/mix-and-match-discounts/` (`MixAndMatchEditor.jsx`, `MixMatchForm.jsx`,
plus its reducers and actions). The standalone editor is mounted at `/mix-and-match/editor`
(and `/mix-and-match/editor/:id`) in `web/frontend/Routes.jsx`.

Mix-and-match offers use dedicated backend routes in `web/backend/routes/bundles/`:
`POST /api/bundles/mix-and-match` (create) and `POST /api/bundles/mix-and-match/:id`
(update), handled by `createMixAndMatchBundle` / `updateMixAndMatchBundle`. They are read
back through the shared bundle list routes, and the storefront reads the active offer via
the app-proxy route `GET /api/frontStore/getActiveBundle`.

## Configuration & running

Configure Mix and Match from the dashboard: pick the app, choose the eligible products and
the bundle pricing, and save. Because it is part of the plan-gated app family, the offer is
only live while the app is toggled on for the shop.
