---
title: "Google Analytics"
order: 9
summary: "An OAuth integration that connects a merchant's Google Analytics (GA4) account so BusyBuddy can pull and surface analytics data in the dashboard."
status: stable
implements:
  workflows:
    - ci
  skills: []
  dependencies: []
  integrations:
    - shopify-admin-api
runWith:
  - "Start the connection from the Advanced Analytics settings in the dashboard; the app calls POST /api/analytics/google/connect to begin OAuth."
  - "Google redirects to GET /api/analytics/google/callback, which is registered before Shopify auth so Google can reach it without a shop session."
  - "The dashboard reads connection state via GET /api/analytics/google/status and data via GET /api/analytics/google/data."
tradeoffs:
  - "The OAuth callback is wired directly in web/index.js (with a dynamic import of the controller) so googleapis is not loaded at server startup and Google's session-less redirect can be handled."
  - "Tokens (access, refresh, expiry) are stored per shop in the GoogleAnalytics Mongoose model and refreshed as needed."
notes:
  - kind: note
    body: "Google Analytics is a third-party integration reached through the googleapis SDK; it is not on the storefront request path — it only feeds the merchant-facing dashboard."
---

## What it does

Google Analytics lets a merchant connect their GA4 account to BusyBuddy over OAuth, so the
dashboard can display Google Analytics metrics alongside BusyBuddy's own analytics.

## How it works

The frontend surface is the analytics settings in the dashboard
(`web/frontend/components/Analytics/` and `components/Settings/AdvancedAnalyticsSettings.jsx`).
The backend routes live under `web/backend/routes/googleAnalytics/` and are mounted at
`/api/analytics/google`:

- `GET /status` — connection status
- `POST /connect` — begin the OAuth flow
- `GET /callback` — OAuth redirect handler
- `POST /disconnect` — disconnect the account
- `GET /data` — fetch analytics data

The OAuth callback is additionally registered directly in `web/index.js` (ahead of the Shopify
auth middleware, via a dynamic import of the controller) because Google redirects there without
Shopify credentials. Credentials are persisted per shop in the `GoogleAnalytics` model
(`googleEmail`, `accessToken`, `refreshToken`, `tokenExpiresAt`, `propertyId`).

## Configuration & running

A merchant starts the connection from the Advanced Analytics settings, completes Google's OAuth
consent, and is redirected back to the callback. The dashboard then reads `status` and `data`
to render the merchant's Google Analytics figures.
