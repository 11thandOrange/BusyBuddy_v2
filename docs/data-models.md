# Data Models

All persistence is MongoDB via Mongoose. The schemas live in `web/backend/models` (one file per
model, `*.model.js`). Field lists below are the actual top-level schema fields.

## shop (`shop.model.js`)
The installed store record, created during the OAuth install callback (and lazily self-healed on
read by `services/shopService.js`). Fields: `shopId`, `myshopify_domain`, `shopName`,
`shopDomain`, `shopCountry`, `status`, `data`, `referral_code`, `referral_source`,
`referral_campaign`, `installed_at`, `paid_at`.

## Subscription (`subscription.model.js`)
The plan / entitlement record keyed by `myshopify_domain`. Fields include `activeSubscriptions`,
`currentPlan`, `billingHistory[]` (plan name, price, date, Shopify subscription id), `trialEndsAt`,
`gracePeriodEndsAt`, `enabledApps[]`, `maxAppsAllowed`, `enabledAppsCount`, and an `appLimits`
object with per-app booleans: `announcement_bar`, `inactive_tab`, `bundle_discount`,
`buy_one_get_one`, `volume_discounts`, `mix_match`. This model is the source of truth for whether
the app (and each widget) is active for a shop.

## shopify_sessions (`shopify_sessions.model.js`)
Shopify offline/online session storage. Fields: `id`, `shop`, `state`, `scope`, `accessToken`,
`isOnline`.

## bundle (`bundle.model.js`)
The single model behind the whole discount-app family (bundle-discount, BOGO, volume, mix-and-match),
distinguished by `type`. Core fields: `title`, `type`, `products[]`, `productsX[]`, `productsY[]`
(BOGO buy/get sides), `quantityBreaks[]` and `tierDiscounts` (volume tiers), plus rich widget
appearance settings (an embedded `widgetAppearanceSchema` with colours, timer, add-to-cart / skip
button styling, emoji, margins).

## announcementBar (`announcementBar.model.js`)
The announcement-bar widget config, composed of several embedded sub-schemas: font settings, color
settings, countdown-timer color / label / block settings, end-of-sale message, shop-now button, and
save-box styling.

## InactiveTab (`inactiveTab.model.js`)
Inactive-tab message settings, unique per `myshopify_domain`. Fields: `message`, `startDate`,
`endDate`, `imageUrl`, `faviconEmoji`, `timezone`, `isEnabled`.

## EmailProvider (`emailProvider.model.js`)
Per-shop ESP connection (`shopId`, `provider` enum `mailchimp|klaviyo|sendgrid|mailerlite|none`,
API key, connection flags/dates) plus embedded `lists[]` and `templates[]` and a default list.

## EmailLog (`emailLog.model.js`)
A record of every outbound email: recipient, type, template, provider IDs (campaign/member/list/
template), `status` enum (`pending|sent|delivered|failed|bounced|opened|clicked`), timestamps, and
retry/error fields.

## GoogleAnalytics (`googleAnalytics.model.js`)
Per-shop Google (GA4) OAuth connection, unique per `shopDomain`. Fields: `googleEmail`,
`accessToken`, `refreshToken`, `tokenExpiresAt`, `propertyId`, `propertyName`, `connectedAt`,
`updatedAt`.

## referral (`referral.model.js`)
A referral partner. Fields: `code` (unique, public), `partner_token` (unique, sparse,
`select: false` secret), `partner_name`, `payout_percent`, `source`, `campaign`, `is_active`,
`metadata`, `created_at`, `updated_at`.

## referralevent (`referralEvent.model.js`)
An individual referral event. Fields: `referral_code`, `event_type` enum (`click|install|paid`),
`shop_domain`, `myshopify_domain`, `plan_name`, `source`, `campaign`, `metadata`, `occurred_at`.

## ActivityLog (`activityLog.model.js`)
Dashboard activity-feed events. Fields: `shopId`, `type` enum
(`purchase|view|click|redemption|created|updated|deleted|activated|deactivated`), `widget` enum
(`bundle|bogo|volume|mix-match|announcement|upsell|inactive-tab`), `title`, `meta`, `amount`,
`offerId`, `orderId`, `discountCode`, `createdAt`.

## MerchantEvent (`merchantEvent.model.js`)
Lifecycle events for a merchant (install, uninstall, plan change, etc.). Fields: `shopId`,
`myshopify_domain`, `eventType` (enum), `eventData`, `previousState`, `newState`, `emailTriggered`,
`emailId` (ref → EmailLog), `processed`, `processedAt`, `createdAt`.

## MerchantReview (`merchantReview.model.js`)
Tracks merchant app-store review state, unique per `myshopify_domain`. Fields include
`merchantEmail`, `merchantName`, `hasLeftReview`, `rating`, `reviewText`, `reviewDate`, `source`
enum (`shopify_app_store|in_app|external`), `reviewUrl`, `isVerified`, response fields,
`emailSentOnReview`, `emailLogId` (ref → EmailLog), timestamps.
