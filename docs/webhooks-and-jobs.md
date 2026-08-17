# Webhooks & Jobs

## Webhook routing

Webhook handling is deliberately separated from the authenticated `/api` surface. Two things run
in `web/index.js` ahead of the global `express.json()` and the Shopify auth gate:

1. **Shopify's own privacy/compliance webhooks** — `shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })`
   mounted at `shopify.config.webhooks.path` (see `web/privacy.js`).
2. **BusyBuddy's webhook router** — mounted at `/api/webhooks` with a scoped `express.json()` that
   captures `req.rawBody` for HMAC verification (`verifyShopifyWebhook` middleware), then the
   router in `web/backend/routes/webhooks/index.js`.

These must stay before the global body parser: HMAC verification and `processWebhooks` both need the
untouched raw request stream, which a global `express.json()` would drain first.

## Webhook endpoints

`web/backend/routes/webhooks/index.js` (controller: `web/backend/controller/webhooks/`):

**Shopify / storefront events**
- `POST /app-installed` → `handleAppInstall`
- `POST /app-uninstalled` → `handleAppUninstall`
- `POST /orders-paid` → `handleOrderPaid`

**Internal subscription events**
- `POST /subscription-upgraded` → `handleSubscriptionUpgrade`
- `POST /subscription-downgraded` → `handleSubscriptionDowngrade`

**Merchant review**
- `POST /review-submitted` → `handleMerchantReview`

**Admin / read endpoints**
- `GET /events` → `getMerchantEvents`
- `GET /emails` → `getEmailLogs`
- `POST /emails/:emailLogId/retry` → `retryFailedEmail`
- `GET /merchants-analytics` → `getMerchantsAnalytics`
- `GET /reviews` → `getMerchantReviews`

## Event processing (the "jobs" layer)

There is no cron/scheduler in the backend. Instead, work is driven synchronously off webhooks
through the service layer:

- Lifecycle webhooks (install, uninstall, plan change, review) create `MerchantEvent` records and
  are processed by `services/merchantEventService.js`, whose `EVENT_CONFIG` table decides per event
  type whether to **send an email** (via `merchantEmailService.js` → the shared `EmailService`),
  **update ESP segments**, and **log to the DB**.
- Outbound emails are written to the `EmailLog` model; failed sends can be re-driven via
  `POST /api/webhooks/emails/:emailLogId/retry`.
- The billing-confirmation redirect in `web/index.js` calls `services/subscription.js`'s
  `subscriptionUpdate` to resync a shop's plan after checkout.

> Note (inferred): "jobs" here means webhook-triggered background work in the service layer — no
> standalone job scheduler or queue was found in `web/backend`.
