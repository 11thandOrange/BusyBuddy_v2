---
title: "Announcement Bars"
order: 3
summary: "A storefront widget merchants configure to show promotional banners, with full CRUD, an active-bar lookup, and click/impression analytics."
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
  - "Create and edit bars from the Announcement Bar page in the BusyBuddy dashboard."
  - "The storefront reads the current bar via GET /api/announcement-bars/active."
  - "Impressions and clicks are recorded via POST /api/announcement-bars/:id/track and surfaced through GET /api/announcement-bars/analytics."
tradeoffs:
  - "Analytics are tracked per-bar through a dedicated track endpoint rather than a general analytics pipeline, keeping the feature self-contained but separate from the app-wide analytics routes."
  - "Like the rest of the suite, the bar only renders on the storefront while BusyBuddy is enabled for the shop (see Subscription Management)."
notes:
  - kind: tip
    body: "Use the /active endpoint to fetch only the bar that should currently display, rather than filtering the full list client-side."
---

## What it does

Announcement Bars is a storefront widget merchants configure to display promotional
banners — sales, shipping thresholds, seasonal messaging — across their store. It
supports creating multiple bars, selecting which is active, and measuring engagement.

## How it works

The dashboard page is `web/frontend/pages/announcement-bar.jsx`. The backend routes live
under `web/backend/routes/announcementBars/`:

- `POST /` and `GET /` — create and list bars
- `GET /active` — the bar that should currently display on the storefront
- `GET /:id`, `PUT /:id`, `DELETE /:id` — read, update, delete a bar
- `DELETE /bulk` — bulk delete
- `GET /analytics` and `POST /:id/track` — read and record impression/click analytics

Routes are mounted under `/api/announcement-bars`.

## Configuration & running

Merchants create and edit bars from the Announcement Bar page in the dashboard. The
storefront fetches the current bar from `GET /active` and reports engagement through
`POST /:id/track`, which the dashboard reads back via `GET /analytics`. The bar displays
only while BusyBuddy is enabled for the shop.
