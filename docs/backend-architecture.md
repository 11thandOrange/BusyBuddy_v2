# Backend Architecture

BusyBuddy's backend is an Express app that serves a Shopify embedded admin app plus the
storefront-facing endpoints its theme extensions call. The entry point is `web/index.js`.

## Express app structure

`web/index.js` builds a single Express app and wires middleware in a deliberate order:

1. **Error handling** — `unhandledRejection` is reported; `uncaughtException` is reported and
   then exits the process.
2. **Mongo connection** — `mongoose.connect(process.env.DB_CONNECTION)` (see below).
3. **Request logging** — `morgan("tiny")`.
4. **Webhook routes first** — Shopify's `shopify.processWebhooks(...)` and `/api/webhooks/*` are
   registered *before* any global `express.json()`, because HMAC verification and
   `processWebhooks` need the untouched raw request stream. A global body parser earlier would
   drain the stream and break signature verification.
5. **Global `express.json()`**, then the **public referral routes** at `/api/referrals` —
   registered *before* Shopify auth so partners and visitors can reach them without a shop
   session.
6. **Shopify auth endpoints** (`auth.begin`, `auth.callback` → `shopData` → redirect) and the
   **Google OAuth callback** at `/api/analytics/google/callback` (registered here, ahead of auth,
   because Google redirects back without Shopify credentials; the controller is dynamically
   imported so `googleapis` is not loaded at startup).
7. **Authenticated `/api/*` gate** (see App-proxy auth below).
8. **Main API router** mounted at `/api` (`web/backend/routes/index.js`).
9. **Billing-confirmation catch** at `/` — on a signed `charge_id`+`shop` redirect it triggers a
   subscription resync.
10. **Static frontend** — serves `frontend/dist` (production) with the App Bridge HTML.

## /api routing

`web/backend/routes/index.js` mounts one router per feature under `/api`:

| Mount | Router |
| --- | --- |
| `/api/products` | products |
| `/api/bundles` | bundles (BOGO, volume, mix-and-match, bundle-discount all share this) |
| `/api/frontStore` | public storefront endpoints (app-proxy) |
| `/api/announcement-bars` | announcement bars |
| `/api/subscription` | subscription / plan gating |
| `/api/inactive-tab` | inactive tab message |
| `/api/analytics` | analytics |
| `/api/email-provider` | email provider integration |
| `/api/analytics/google` | Google Analytics OAuth + data |
| `/api/activity` | dashboard activity feed |
| `/api/dashboard` | dashboard |
| `/api/editor` | editor signature minting |

Two route families are **not** mounted here and are instead registered directly in `web/index.js`:
`/api/webhooks` (before body parsing / auth) and `/api/referrals` (before Shopify auth). See
[Webhooks & Jobs](./webhooks-and-jobs.md).

## App-proxy & session auth

The `/api/*` gate in `web/index.js` uses `express-conditional-middleware`:

- **Requests with a `shop` query param** take the app-proxy / editor branch. Two distinct signers
  land here:
  - **Shopify App Proxy** requests (storefront visitors hitting `getActiveBundle` /
    `getInactiveTab` / `getAnnouncementBar`) sign *all* query params — verified by `verifySHA256`.
  - The **standalone editor's** own links sign only `{shop}` via `generateSignature` — verified by
    `verifyShopSignature` as a fallback when `verifySHA256` fails.
  On a valid signature, the offline session for the shop is loaded from session storage and placed
  on `res.locals.shopify`. Invalid signatures return `401` JSON.
- **All other `/api/*` requests** fall through to `shopify.validateAuthenticatedSession()` — the
  normal App Bridge embedded-app session check.

The public storefront routes under `web/backend/routes/frontStore/` additionally run
`requireSubscriptionAccess`, so a widget only responds while BusyBuddy is enabled for the shop.

## MongoDB

Persistence is MongoDB via Mongoose. The connection is opened once at startup from
`process.env.DB_CONNECTION` with `strictQuery` enabled. Shopify offline sessions are stored via a
custom session storage (`web/customeMongoSession.js`, referenced through `web/shopify.js`). The
domain models live in `web/backend/models` — see [Data Models](./data-models.md).
