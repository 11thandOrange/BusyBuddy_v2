---
title: "Referrals"
order: 8
summary: "A partner-referral program: admins mint referral codes, partners share tracked links to the Shopify App Store, and clicks/installs/paid conversions drive analytics, MRR, and commission reporting."
status: stable
implements:
  workflows:
    - ci
  skills: []
  dependencies: []
  integrations:
    - shopify-admin-api
runWith:
  - "Admins create and manage referral partners via POST/PUT/DELETE /api/referrals/:code (x-api-key: REFERRAL_ADMIN_API_KEY)."
  - "Partners share /api/referrals/:code/redirect, which records a click and redirects to the Shopify App Store."
  - "Partners read their own analytics/MRR/commission via /api/referrals/:code/* using the x-referral-token header (partner_token)."
tradeoffs:
  - "Unlike the storefront widgets, the referral routes are registered in web/index.js BEFORE the Shopify auth middleware, so they are reachable without a shop session."
  - "The referral code is public (it lives in shareable links) so it cannot be a credential: financial/analytics endpoints require the partner's separate partner_token secret; non-financial lookups stay open."
notes:
  - kind: important
    body: "Two auth tiers guard this route family: adminAuth (x-api-key) for partner management, and partnerAuth (x-referral-token) for a partner's own financial data. Track and redirect are fully public."
---

## What it does

Referrals is BusyBuddy's partner-referral program. Admins create referral partners, each with
a shareable code; partners share a tracked link that redirects to the app's Shopify App Store
listing; and the system records click / install / paid events to power analytics, MRR,
commission, and fraud-detection reporting.

## How it works

There is no dashboard page — this is an API feature. The routes live in
`web/backend/routes/referrals/index.js`, backed by `web/backend/controller/referrals/` and the
`web/backend/services/referral.js` service, and persist to the `referral` and `referralevent`
Mongoose models.

- Admin (adminAuth, `x-api-key`): `POST /` create, `GET /` list, `PUT /:code`, `DELETE /:code`,
  `GET /:code/fraud`, `GET /:code/query`
- Partner (partnerAuth, `x-referral-token`): `GET /:code/analytics`, `/:code/mrr`,
  `/:code/commission`, `/:code/dashboard`
- Public: `GET /:code`, `GET /:code/url`, `POST /:code/track`, `GET /:code/redirect`

Routes are mounted at `/api/referrals` and are registered in `web/index.js` ahead of Shopify
session auth so partners and visitors can reach them without a shop session.

## Configuration & running

Admins mint and manage partners with the admin API key. Partners share
`/api/referrals/:code/redirect` (records the click, then redirects to the App Store) and read
their own performance data with their `partner_token` via the `x-referral-token` header.
