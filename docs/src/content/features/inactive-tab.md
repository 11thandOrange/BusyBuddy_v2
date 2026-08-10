---
title: "Inactive Tab Message"
order: 7
summary: "A storefront widget that changes the browser tab's title (and favicon) with a custom message when a visitor switches away, to win the visitor back."
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
  - "Configure the message, favicon emoji, and optional schedule from the Inactive Tab page in the BusyBuddy dashboard."
  - "Settings are saved via POST /api/inactive-tab/settings and read back via GET /api/inactive-tab/settings."
  - "The storefront fetches the active message via the app-proxy route GET /api/frontStore/getInactiveTab."
tradeoffs:
  - "The message is schedule-aware: getInactiveTab returns nothing outside the configured startDate/endDate window, so an expired or not-yet-started message never displays."
  - "Like the rest of the suite, the widget only renders while BusyBuddy is enabled for the shop (see Subscription Management)."
notes:
  - kind: tip
    body: "Image uploads for the message go through POST /api/inactive-tab/upload-image, which stores the file on Shopify via the Admin API and returns a hosted URL."
---

## What it does

Inactive Tab Message is a storefront widget that swaps the browser tab's title — and
optionally its favicon — for a custom message when a visitor tabs away from the store, nudging
them to come back.

## How it works

The dashboard page is `web/frontend/pages/inactive-tab-message.jsx`, which renders the app under
`web/frontend/apps/inactive-tab-message/` (`InactiveTabMessageForm`). Settings persist to the
`InactiveTab` Mongoose model (message, favicon emoji, start/end date, timezone, isEnabled).

The backend routes live under `web/backend/routes/inactivetabs/` and are mounted at
`/api/inactive-tab`:

- `POST /settings` and `GET /settings` — save and read the message settings
- `POST /upload-image` — upload an image to Shopify (multer memory storage, 5MB, images only)

The storefront reads the currently-active message through the app-proxy route
`GET /api/frontStore/getInactiveTab`, which enforces the schedule window and the shop's
subscription access.

## Configuration & running

Merchants set the message, favicon emoji, and optional schedule from the dashboard. The
storefront fetches the active message from `getInactiveTab`; it displays only within the
configured date window and only while BusyBuddy is enabled for the shop.
