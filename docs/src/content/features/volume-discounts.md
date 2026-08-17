---
title: "Volume Discounts"
order: 4
summary: "A Shopify discount app that lets merchants configure quantity-break pricing (buy more, save more) from the BusyBuddy dashboard."
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
  - "Open the BusyBuddy dashboard and choose the Volume Discounts app."
  - "Add quantity tiers and their discounts in the editor, then save to publish the offer."
  - "Enable the app for the shop from the dashboard's app toggle before the storefront applies it."
tradeoffs:
  - "Volume Discounts is one member of BusyBuddy's discount-app family (bundles, bundle-discount, bogo, mix-and-match); they persist through the shared /api/bundles route family and the bundle model's quantityBreaks/tierDiscounts fields rather than a bespoke store."
  - "Discount behavior is bounded by what Shopify's discount and cart-transform layer exposes."
notes:
  - kind: note
    body: "Volume Discounts sits inside BusyBuddy's plan-gated app-toggle system: the offer only affects the storefront while the app is enabled for the shop (see Subscription Management)."
---

## What it does

Volume Discounts is a Shopify discount app in the BusyBuddy suite. It lets a merchant
set up quantity-break pricing — for example, buy 3 and save 10%, buy 5 and save 20% —
and publish it to the storefront without touching theme code.

## How it works

The dashboard page is `web/frontend/pages/volume-discounts.jsx`, which renders the app
under `web/frontend/apps/volume-discounts/` (`VolumeDiscountEditor.jsx`, `VolumeForm.jsx`,
plus its reducers and actions). The standalone editor is mounted at
`/volume-discounts/editor` (and `/volume-discounts/editor/:id`) in `web/frontend/Routes.jsx`.

Offers are saved through the shared bundle backend under `web/backend/routes/bundles/`:
`POST /api/bundles` creates an offer, `PUT /api/bundles/:id` updates it, and the tiers
are stored in the bundle model's `quantityBreaks` / `tierDiscounts` fields. The storefront
reads the active offer via the app-proxy route `GET /api/frontStore/getActiveBundle`.

## Configuration & running

Configure Volume Discounts from the dashboard: pick the app, define the quantity tiers and
their discounts in the editor, and save. Because it is part of the plan-gated app family,
the offer is only live while the app is toggled on for the shop.
