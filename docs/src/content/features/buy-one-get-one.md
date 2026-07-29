---
title: "Buy One Get One (BOGO)"
order: 1
summary: "A Shopify discount app that lets merchants configure buy-X-get-Y promotions from the BusyBuddy dashboard."
status: stable
implements:
  workflows:
    - ci
    - e2e-pipeline
  skills: []
  dependencies: []
  integrations:
    - shopify-admin-api
    - shopify-app-proxy
runWith:
  - "Open the BusyBuddy dashboard and choose the Buy One Get One app."
  - "Create a discount in the editor, set the buy quantity and the reward, then save to publish it to your store."
  - "Enable the app for the shop from the dashboard's app toggle before the storefront applies it."
tradeoffs:
  - "BOGO is one member of BusyBuddy's discount-app family (bundles, bundle-discount, volume-discounts, mix-and-match); they share the BundelDiscountList editor component rather than each owning bespoke UI, which keeps them consistent but couples their editing surface."
  - "Discount logic runs through Shopify's discount/cart machinery, so behavior is bounded by what the Shopify platform exposes."
notes:
  - kind: note
    body: "BOGO sits inside BusyBuddy's plan-gated app-toggle system: the promotion only affects the storefront while the app is enabled for the shop."
---

## What it does

Buy One Get One (BOGO) is a Shopify discount app in the BusyBuddy suite. It lets a
merchant configure "buy X, get Y" promotions — for example, buy one item and get a
second at a discount or for free — and publish them to their storefront without
touching theme code.

## How it works

The editor is a frontend page, `web/frontend/pages/buy-one-get-one.jsx`, which renders
the app under `web/frontend/apps/buy-one-get-one/` (`buyoneGetone.jsx`, plus its
`BuyXGetYEditor.jsx`, reducers, and actions). It is built on the shared
`web/frontend/components/BundelDiscountList.jsx` component that the other
discount apps in the suite reuse. Saved discounts are applied to the storefront through
Shopify's discount and cart-transform layer.

## Configuration & running

Configure BOGO from the BusyBuddy dashboard: pick the Buy One Get One app, define the
buy quantity and the reward in the editor, and save. Because BOGO is part of the
plan-gated app family, the promotion is only live while the app is toggled on for the
shop.
