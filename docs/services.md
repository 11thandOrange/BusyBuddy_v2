# Services

The service layer lives in `web/backend/services`. Controllers call these modules so that the
Shopify GraphQL calls, third-party ESP calls, and cross-model bookkeeping stay out of the route
handlers.

## shopService.js
`getOrCreateShop(session)` — reads the `shop` document for a session, and lazily creates it if the
install-time `shopData` middleware never ran or failed partway. This self-heals the case where an
otherwise fully-installed shop would be treated as nonexistent by bare `Shop.findOne` calls.

## subscription.js
`subscriptionUpdate(session)` — resyncs a shop's subscription from Shopify's billing API
(`getAppSubscription` in `web/billing.js`) into the `Subscription` model. Normalises Shopify's
uppercase status enum (`ACTIVE`) to the lowercase `active` the rest of the codebase compares
against. Invoked from the billing-confirmation redirect in `web/index.js`.

## referral.js
The referral-program engine backing the `/api/referrals` controllers. Exports include
`createReferral`, `generateReferralUrl`, `getShopifyAppStoreUrl`, `getReferralByCode`,
`getAllReferrals`, `trackReferralEvent`, `getReferralAnalytics`, `getReferralQuery`,
`updateReferral`, `deactivateReferral`, `calculateMRR`, `calculateCommission`, `detectFraud`, and
`getDashboardMetrics`. It reads/writes the `referral`, `referralevent`, `shop`, and `subscription`
models and uses `configs/subscriptionConfig.js` for plan pricing.

## activityLogService.js
`activityLogService` (default export) — logs and retrieves dashboard activity events
(`ActivityLog` model), reading bundle/announcement models to enrich entries. Feeds the
`/api/activity` history card.

## emailService.js
The **shared email caller** — an adapter-per-provider abstraction. Exports `EmailService`,
`EmailServiceError`, and the `EmailProviderAdapter` base class. Concrete adapters implement the same
interface (`validateConnection`, `getLists`, `getTemplates`, `subscribeToList`,
`sendTemplateEmail`) for Mailchimp, Klaviyo, SendGrid, and MailerLite, so callers never special-case
the ESP. Used by the email-provider feature, the frontStore subscribe endpoint, and
`merchantEmailService.js`.

## merchantEmailService.js
`emailService` singleton plus `EMAIL_TEMPLATES` and `MAILCHIMP_SEGMENTS`. Sends the
merchant-lifecycle emails (welcome on install, uninstall survey, etc.) and records them in the
`EmailLog` model.

## merchantEventService.js
`merchantEventService` singleton. Processes merchant lifecycle events (`MerchantEvent` /
`MerchantReview` models) per an `EVENT_CONFIG` table that decides, per event type, whether to send
an email, update ESP segments, and log to the DB. Bridges the webhook controllers to
`merchantEmailService`.

## mutations.js
A library of Shopify Admin GraphQL query/mutation builders (products, bundles, orders,
collections, publications) used by the bundle/product controllers — e.g. `GET_PRODUCTS`,
`getCreateBundlesMutation`, `getBundlePriceUpdateMutation`, `CREATE_COLLECTIONV2`. Not a stateful
service; a shared source of GraphQL strings.
