---
title: "Bundle Discounts"
order: 6
summary: "A Shopify discount app that lets merchants group products into a discounted bundle from the BusyBuddy dashboard."
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
  - "Open the BusyBuddy dashboard and choose the Bundle Discounts app."
  - "Select the products in the bundle and the bundle price/discount in the editor, then save to publish."
  - "Enable the app for the shop from the dashboard's app toggle before the storefront applies it."
tradeoffs:
  - "Bundle Discounts is one member of BusyBuddy's discount-app family (bogo, volume-discounts, mix-and-match); they persist through the shared /api/bundles route family and the single bundle model, distinguished by the document's `type` field."
  - "Discount behavior is bounded by what Shopify's discount and cart-transform layer exposes."
notes:
  - kind: note
    body: "Bundle Discounts sits inside BusyBuddy's plan-gated app-toggle system (subscription appLimits.bundle_discount): the offer only affects the storefront while the app is enabled for the shop."
---

## What it does

Bundle Discounts is a Shopify discount app in the BusyBuddy suite. It lets a merchant group
a fixed set of products into a bundle sold at a discounted price, and publish it to the
storefront without touching theme code.

## How it works

The dashboard page is `web/frontend/pages/bundle-discount.jsx`, which renders the app under
`web/frontend/apps/bundle-discounts/` (`StandardBundleEditor.jsx`, `BundleForm.jsx`, plus its
reducers and actions). The standalone editor is mounted at `/bundle-discount/editor` (and
`/bundle-discount/editor/:id`) in `web/frontend/Routes.jsx`.

Bundles are saved through `web/backend/routes/bundles/`: `POST /api/bundles`
(`createProductBundleV2`) creates a bundle, `GET /api/bundles` lists them, `GET /api/bundles/:id`
reads one, and `PUT` / `DELETE /api/bundles/:id` update and remove it. The storefront reads the
active bundle via the app-proxy route `GET /api/frontStore/getActiveBundle`.

## Configuration & running

Configure Bundle Discounts from the dashboard: pick the app, select the products and the bundle
price, and save. Because it is part of the plan-gated app family, the bundle is only live while
the app is toggled on for the shop.
