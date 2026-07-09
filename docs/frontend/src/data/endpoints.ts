import type { EndpointGroup } from '../types';

const SESSION_NOTE =
  'Requires an authenticated Shopify Admin embedded-app session (App Bridge). Not callable from this docs site - shown for reference only.';
const APP_PROXY_NOTE =
  'Reachable through the Shopify App Proxy from any storefront (no merchant login required) - this is what the theme extension itself calls. Live-testable below against a real test shop.';

export const endpointGroups: EndpointGroup[] = [
  {
    slug: 'storefront',
    title: 'Storefront (Public)',
    description:
      'Called directly by the theme extension JavaScript on the storefront via the Shopify App Proxy (/apps/bogo-app/api/frontStore/*). These are the only endpoints reachable without a Shopify Admin session, so they\'re the only ones this docs site can test live.',
    endpoints: [
      {
        slug: 'get-announcement-bar',
        method: 'GET',
        path: '/apps/bogo-app/api/frontStore/getAnnouncementBar',
        title: 'Get active announcement bar',
        description:
          'Returns the highest-priority active announcement bar for the shop, or null if none is active, the plan doesn\'t include this app, or the bar is outside its scheduled date window.',
        auth: 'app-proxy',
        authNote: APP_PROXY_NOTE,
        params: [],
        responseExample: `{
  "status": "SUCCESS",
  "data": {
    "_id": "65f...",
    "message": "Free shipping on orders over $50",
    "type": "Info",
    "showMessage": true,
    "animateMessage": false,
    "generalColorSettings": { "Background Color": "#5169DD", "Message Font Color": "#ffffff" },
    "showShopNowButton": false
  }
}`,
        liveTestable: true,
      },
      {
        slug: 'get-inactive-tab',
        method: 'GET',
        path: '/apps/bogo-app/api/frontStore/getInactiveTab',
        title: 'Get inactive tab settings',
        description:
          'Returns the shop\'s Inactive Tab Message configuration. The date-window check for this one happens client-side in the theme script, not server-side, so this always returns the configured document if the plan allows it.',
        auth: 'app-proxy',
        authNote: APP_PROXY_NOTE,
        params: [],
        responseExample: `{
  "status": "SUCCESS",
  "data": {
    "message": "\\ud83d\\udc40 Don't miss out on our special offers!",
    "isEnabled": true,
    "startDate": null,
    "endDate": null,
    "imageUrl": null
  }
}`,
        liveTestable: true,
      },
      {
        slug: 'get-active-bundle',
        method: 'GET',
        path: '/apps/bogo-app/api/frontStore/getActiveBundle',
        title: 'Get active bundle for a product',
        description:
          'Returns the highest-priority active bundle (of any type - Bundle Discount, BOGO, Volume Discount, or Mix & Match) that includes the given product, with product details resolved via the Shopify Admin GraphQL API. Gated on whichever plan feature matches the bundle\'s own type.',
        auth: 'app-proxy',
        authNote: APP_PROXY_NOTE,
        params: [
          { name: 'product_id', type: 'string', required: true, in: 'query', description: 'Numeric Shopify product ID (not the GID) of the product currently being viewed' },
        ],
        responseExample: `{
  "status": true,
  "bundles": [
    {
      "_id": "65f...",
      "type": "Bundle Discount",
      "products": [ { "productId": "gid://shopify/Product/123", "title": "...", "price": "24.99" } ]
    }
  ]
}`,
        liveTestable: true,
      },
      {
        slug: 'subscribe-email',
        method: 'POST',
        path: '/apps/bogo-app/api/frontStore/subscribe',
        title: 'Subscribe an email from the announcement bar',
        description:
          'Validates the email, then forwards the subscription to the shop\'s connected email provider (e.g. Mailchimp) and increments conversion counters. Fails with 400 if the shop hasn\'t connected an email provider.',
        auth: 'app-proxy',
        authNote: APP_PROXY_NOTE,
        params: [
          { name: 'email', type: 'string', required: true, in: 'body', description: 'Shopper email address' },
          { name: 'announcementBarId', type: 'string', required: true, in: 'body', description: 'The _id of the announcement bar the form was shown on' },
          { name: 'listId', type: 'string', required: false, in: 'body', description: 'Overrides the bar/provider default mailing list' },
        ],
        requestExample: `{
  "email": "shopper@example.com",
  "announcementBarId": "65f...",
  "listId": null
}`,
        responseExample: `{
  "success": true,
  "message": "Thank you for subscribing!"
}`,
        liveTestable: true,
      },
    ],
  },
  {
    slug: 'announcement-bars',
    title: 'Announcement Bars',
    description: 'Admin CRUD for announcement bars, plus analytics tracking. Mounted at /api/announcement-bars.',
    endpoints: [
      { slug: 'create', method: 'POST', path: '/api/announcement-bars', title: 'Create announcement bar', description: 'Creates a new announcement bar for the current shop.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": { "_id": "..." } }', liveTestable: false },
      { slug: 'list', method: 'GET', path: '/api/announcement-bars', title: 'List announcement bars', description: 'Lists all announcement bars for the current shop.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": { "announcementBars": [], "pagination": {} } }', liveTestable: false },
      { slug: 'active', method: 'GET', path: '/api/announcement-bars/active', title: 'Get active bar (admin)', description: 'Admin-side equivalent of the public getAnnouncementBar endpoint, used inside the embedded app preview.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": { } }', liveTestable: false },
      { slug: 'analytics', method: 'GET', path: '/api/announcement-bars/analytics', title: 'Get bar analytics', description: 'Aggregate view/click analytics across the shop\'s bars.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": { } }', liveTestable: false },
      { slug: 'get-by-id', method: 'GET', path: '/api/announcement-bars/:id', title: 'Get bar by ID', description: 'Fetches a single announcement bar.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'id', type: 'string', required: true, in: 'path', description: 'Announcement bar _id' }], responseExample: '{ "status": "SUCCESS", "data": { } }', liveTestable: false },
      { slug: 'update', method: 'PUT', path: '/api/announcement-bars/:id', title: 'Update bar', description: 'Updates a bar\'s configuration. Validated server-side (message length, safe CSS colors, safe URLs) in addition to client-side.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'id', type: 'string', required: true, in: 'path', description: 'Announcement bar _id' }], responseExample: '{ "status": "SUCCESS", "data": { } }', liveTestable: false },
      { slug: 'update-countdown', method: 'PATCH', path: '/api/announcement-bars/:id/countdown', title: 'Update countdown settings', description: 'Updates just the countdown-timer block of a bar.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'id', type: 'string', required: true, in: 'path', description: 'Announcement bar _id' }], responseExample: '{ "status": "SUCCESS" }', liveTestable: false },
      { slug: 'delete', method: 'DELETE', path: '/api/announcement-bars/:id', title: 'Delete bar', description: 'Deletes a bar.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'id', type: 'string', required: true, in: 'path', description: 'Announcement bar _id' }], responseExample: '{ "status": "SUCCESS" }', liveTestable: false },
      { slug: 'toggle', method: 'PATCH', path: '/api/announcement-bars/:id/toggle', title: 'Toggle active status', description: 'Activates/deactivates a bar. At most one bar is active at a time.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'id', type: 'string', required: true, in: 'path', description: 'Announcement bar _id' }], responseExample: '{ "status": "SUCCESS" }', liveTestable: false },
      { slug: 'track', method: 'POST', path: '/api/announcement-bars/:id/track', title: 'Track view/click', description: 'Records a view or click event for analytics.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'id', type: 'string', required: true, in: 'path', description: 'Announcement bar _id' }], responseExample: '{ "status": "SUCCESS" }', liveTestable: false },
      { slug: 'priorities', method: 'PATCH', path: '/api/announcement-bars/priorities', title: 'Reorder priorities', description: 'Bulk-updates display priority across bars.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS" }', liveTestable: false },
      { slug: 'bulk-delete', method: 'DELETE', path: '/api/announcement-bars/bulk', title: 'Bulk delete', description: 'Deletes multiple bars at once.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS" }', liveTestable: false },
    ],
  },
  {
    slug: 'bundles',
    title: 'Bundles',
    description: 'Admin CRUD covering all four discount-app types (Bundle Discount, BOGO, Volume Discount, Mix & Match). Mounted at /api/bundles.',
    endpoints: [
      { slug: 'create', method: 'POST', path: '/api/bundles', title: 'Create bundle', description: 'Creates a Bundle Discount, BOGO, or Volume Discount bundle. Server-side validated for discount value and date ordering.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": { "_id": "..." } }', liveTestable: false },
      { slug: 'list', method: 'GET', path: '/api/bundles', title: 'List bundles', description: 'Lists all bundles for the shop.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": [] }', liveTestable: false },
      { slug: 'active-bundles', method: 'GET', path: '/api/bundles/activeBundles', title: 'List active bundles', description: 'Lists only currently-active bundles.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": [] }', liveTestable: false },
      { slug: 'create-mix-match', method: 'POST', path: '/api/bundles/mix-and-match', title: 'Create Mix & Match bundle', description: 'Creates a Mix & Match offer (Advanced plan feature).', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": { "_id": "..." } }', liveTestable: false },
      { slug: 'update-mix-match', method: 'POST', path: '/api/bundles/mix-and-match/:id', title: 'Update Mix & Match bundle', description: 'Updates a Mix & Match offer.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'id', type: 'string', required: true, in: 'path', description: 'Bundle _id' }], responseExample: '{ "status": "SUCCESS" }', liveTestable: false },
      { slug: 'update', method: 'PUT', path: '/api/bundles/:id', title: 'Update bundle', description: 'Updates a Bundle Discount, BOGO, or Volume Discount bundle.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'id', type: 'string', required: true, in: 'path', description: 'Bundle _id' }], responseExample: '{ "status": "SUCCESS" }', liveTestable: false },
      { slug: 'delete', method: 'DELETE', path: '/api/bundles/:id', title: 'Delete bundle', description: 'Deletes a bundle of any type.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'id', type: 'string', required: true, in: 'path', description: 'Bundle _id' }], responseExample: '{ "status": "SUCCESS" }', liveTestable: false },
    ],
  },
  {
    slug: 'inactive-tab',
    title: 'Inactive Tab',
    description: 'Admin config for the Inactive Tab Message app. Mounted at /api/inactive-tab.',
    endpoints: [
      { slug: 'save-settings', method: 'POST', path: '/api/inactive-tab/settings', title: 'Save settings', description: 'Saves message, schedule, and image settings. Server-validated message length and safe-URL checks.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS" }', liveTestable: false },
      { slug: 'get-settings', method: 'GET', path: '/api/inactive-tab/settings', title: 'Get settings (admin)', description: 'Admin-side read of the current configuration.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": { } }', liveTestable: false },
      { slug: 'upload-image', method: 'POST', path: '/api/inactive-tab/upload-image', title: 'Upload favicon image', description: 'Uploads a custom favicon image (multipart/form-data, 5MB limit) to Shopify\'s asset storage.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'image', type: 'file', required: true, in: 'body', description: 'Image file, multipart/form-data field name "image"' }], responseExample: '{ "status": "SUCCESS", "data": { "url": "..." } }', liveTestable: false },
    ],
  },
  {
    slug: 'subscription',
    title: 'Subscription & Billing',
    description: 'Plan management, Shopify billing integration, and per-app enable/disable. Mounted at /api/subscription.',
    endpoints: [
      { slug: 'get-user-subscription', method: 'GET', path: '/api/subscription/getUserSubscription', title: 'Get current plan', description: 'Returns the shop\'s current plan, max apps allowed, and which apps are enabled.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": { "planName": "Starter", "maxAppsAllowed": 3, "enabledApps": [] } }', liveTestable: false },
      { slug: 'subscribe', method: 'POST', path: '/api/subscription/subscribe', title: 'Change plan', description: 'Starts or changes a Shopify Billing subscription. Checks against the specific target plan (not "any paid plan") before deciding whether a new charge is needed, so switching between two paid plans always goes through Shopify\'s billing confirmation.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'planName', type: 'string', required: true, in: 'body', description: '"Free", "Starter", or "Advanced"' }], requestExample: '{ "planName": "Advanced" }', responseExample: '{ "status": "SUCCESS", "data": { "url": "https://{shop}/charges/.../confirm" } }', liveTestable: false },
      { slug: 'cancel', method: 'POST', path: '/api/subscription/cancel-subscription', title: 'Cancel subscription', description: 'Cancels the current paid plan and reverts to Free.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'planName', type: 'string', required: true, in: 'body', description: 'The plan being cancelled' }], responseExample: '{ "status": "SUCCESS", "data": { "message": "Plan cancelled" } }', liveTestable: false },
      { slug: 'check-enabled', method: 'GET', path: '/api/subscription/checkBusyBuddyEnabled', title: 'Check theme extension status', description: 'Inspects the active theme\'s header-group sections for the BusyBuddy block, to power the "enable the extension" banner.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": { "enabled": true } }', liveTestable: false },
      { slug: 'theme-editor-url', method: 'GET', path: '/api/subscription/getThemeEditorUrl', title: 'Get theme editor deep link', description: 'Builds a direct link into the Shopify Theme Editor for enabling the Announcement Bar block.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": { "url": "..." } }', liveTestable: false },
      { slug: 'toggle-app', method: 'POST', path: '/api/subscription/toggle-app', title: 'Enable/disable an app', description: 'Enables or disables one of the six apps, enforcing the current plan\'s max-apps-enabled limit.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'appId', type: 'string', required: true, in: 'body', description: 'e.g. "bundle_discount"' }, { name: 'enable', type: 'boolean', required: true, in: 'body', description: 'true to enable, false to disable' }], responseExample: '{ "status": "SUCCESS", "data": { "enabledAppsCount": 2 } }', liveTestable: false },
      { slug: 'app-status', method: 'GET', path: '/api/subscription/app-status/:appId?', title: 'Get app enabled status', description: 'Checks whether a specific app is currently enabled.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'appId', type: 'string', required: false, in: 'path', description: 'App identifier' }], responseExample: '{ "status": "SUCCESS", "data": { "isEnabled": true } }', liveTestable: false },
    ],
  },
  {
    slug: 'referrals',
    title: 'Referrals',
    description:
      'Partner referral program. Three auth tiers: admin (x-api-key header), partner (x-referral-token header, scoped to that partner\'s own financial data), and public (the shareable referral link itself). Mounted at /api/referrals, registered before Shopify auth middleware since it must work without a shop session.',
    endpoints: [
      { slug: 'create', method: 'POST', path: '/api/referrals', title: 'Create referral partner', description: 'Admin-only: creates a new referral code.', auth: 'admin-api-key', authNote: 'Requires x-api-key: <REFERRAL_ADMIN_API_KEY>.', params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'list', method: 'GET', path: '/api/referrals', title: 'List all referrals', description: 'Admin-only.', auth: 'admin-api-key', authNote: 'Requires x-api-key: <REFERRAL_ADMIN_API_KEY>.', params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'get-by-code', method: 'GET', path: '/api/referrals/:code', title: 'Get referral by code', description: 'Public lookup by referral code - the code itself is not a secret, it\'s embedded in shareable links.', auth: 'none', authNote: 'Public - the code is not a credential.', params: [{ name: 'code', type: 'string', required: true, in: 'path', description: 'Referral code' }], responseExample: '{ }', liveTestable: false },
      { slug: 'url', method: 'GET', path: '/api/referrals/:code/url', title: 'Generate referral URL', description: 'Returns the shareable install URL for a referral code.', auth: 'none', authNote: 'Public.', params: [{ name: 'code', type: 'string', required: true, in: 'path', description: 'Referral code' }], responseExample: '{ }', liveTestable: false },
      { slug: 'analytics', method: 'GET', path: '/api/referrals/:code/analytics', title: 'Get referral analytics', description: 'Financial/analytics data for a partner - requires the partner\'s own secret token, since the code itself is public.', auth: 'partner-token', authNote: 'Requires x-referral-token: <partner_token>.', params: [{ name: 'code', type: 'string', required: true, in: 'path', description: 'Referral code' }], responseExample: '{ }', liveTestable: false },
      { slug: 'mrr', method: 'GET', path: '/api/referrals/:code/mrr', title: 'Get MRR', description: 'Monthly recurring revenue attributed to this partner, computed from real charged plan prices.', auth: 'partner-token', authNote: 'Requires x-referral-token: <partner_token>.', params: [{ name: 'code', type: 'string', required: true, in: 'path', description: 'Referral code' }], responseExample: '{ }', liveTestable: false },
      { slug: 'commission', method: 'GET', path: '/api/referrals/:code/commission', title: 'Get commission owed', description: 'Commission owed to this partner.', auth: 'partner-token', authNote: 'Requires x-referral-token: <partner_token>.', params: [{ name: 'code', type: 'string', required: true, in: 'path', description: 'Referral code' }], responseExample: '{ }', liveTestable: false },
      { slug: 'track', method: 'POST', path: '/api/referrals/:code/track', title: 'Track referral event', description: 'Public: records a click event. Only "click" events are accepted here - install/paid events are recorded server-side by the app itself.', auth: 'none', authNote: 'Public.', params: [{ name: 'code', type: 'string', required: true, in: 'path', description: 'Referral code' }], responseExample: '{ "status": "SUCCESS" }', liveTestable: false },
      { slug: 'redirect', method: 'GET', path: '/api/referrals/:code/redirect', title: 'Redirect to App Store', description: 'The actual URL partners share - tracks the click, then redirects to the Shopify App Store listing.', auth: 'none', authNote: 'Public.', params: [{ name: 'code', type: 'string', required: true, in: 'path', description: 'Referral code' }], responseExample: '302 redirect', liveTestable: false },
    ],
  },
  {
    slug: 'webhooks',
    title: 'Webhooks',
    description:
      'Two mechanisms: mandatory Shopify compliance webhooks (customers/data_request, customers/redact, shop/redact) plus app-lifecycle and billing webhooks (app/uninstalled, subscription events) are handled by the Shopify library\'s own processor at POST /api/webhooks. A separate internal router at /api/webhooks/* (below) handles order/review events and admin reporting, verified via HMAC.',
    endpoints: [
      { slug: 'app-installed', method: 'POST', path: '/api/webhooks/app-installed', title: 'App installed', description: 'Internal handler for install-adjacent bookkeeping.', auth: 'none', authNote: 'HMAC-verified Shopify webhook - not user-callable.', params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'app-uninstalled', method: 'POST', path: '/api/webhooks/app-uninstalled', title: 'App uninstalled', description: 'Logs the uninstall event; the actual GDPR data purge happens via the shop/redact compliance webhook.', auth: 'none', authNote: 'HMAC-verified Shopify webhook - not user-callable.', params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'orders-paid', method: 'POST', path: '/api/webhooks/orders-paid', title: 'Order paid', description: 'Identifies whether a paid order includes a BusyBuddy bundle/BOGO/discount and logs purchase activity + revenue attribution.', auth: 'none', authNote: 'HMAC-verified Shopify webhook - not user-callable.', params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'subscription-upgraded', method: 'POST', path: '/api/webhooks/subscription-upgraded', title: 'Subscription upgraded (internal)', description: 'Internal event dispatch, not a Shopify webhook topic.', auth: 'none', authNote: 'Internal.', params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'subscription-downgraded', method: 'POST', path: '/api/webhooks/subscription-downgraded', title: 'Subscription downgraded (internal)', description: 'Internal event dispatch, not a Shopify webhook topic.', auth: 'none', authNote: 'Internal.', params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'review-submitted', method: 'POST', path: '/api/webhooks/review-submitted', title: 'Merchant review submitted', description: 'Triggers a thank-you email flow when a merchant leaves an app review.', auth: 'none', authNote: 'Internal.', params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'events', method: 'GET', path: '/api/webhooks/events', title: 'List merchant events (admin)', description: 'Internal admin reporting endpoint.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'emails', method: 'GET', path: '/api/webhooks/emails', title: 'List email logs (admin)', description: 'Internal admin reporting endpoint.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'retry-email', method: 'POST', path: '/api/webhooks/emails/:emailLogId/retry', title: 'Retry a failed email', description: 'Re-sends a previously-failed transactional email.', auth: 'session', authNote: SESSION_NOTE, params: [{ name: 'emailLogId', type: 'string', required: true, in: 'path', description: 'Email log _id' }], responseExample: '{ }', liveTestable: false },
      { slug: 'merchants-analytics', method: 'GET', path: '/api/webhooks/merchants-analytics', title: 'Merchant analytics', description: 'Aggregate merchant-lifecycle analytics.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'reviews', method: 'GET', path: '/api/webhooks/reviews', title: 'List merchant reviews', description: 'Lists submitted merchant reviews.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
    ],
  },
  {
    slug: 'activity',
    title: 'Activity & Analytics',
    description: 'Powers the dashboard\'s recent-activity feed and quick stats. Mounted at /api/activity.',
    endpoints: [
      { slug: 'recent', method: 'GET', path: '/api/activity/recent', title: 'Get recent activity', description: 'Recent activity events + quick stats (active bundles, active announcements, events today) for the dashboard history card.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": { "activities": [], "stats": {} } }', liveTestable: false },
      { slug: 'stats', method: 'GET', path: '/api/activity/stats', title: 'Get stats only', description: 'Lighter-weight endpoint returning just the quick-stats block.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "status": "SUCCESS", "data": { } }', liveTestable: false },
    ],
  },
  {
    slug: 'products',
    title: 'Products',
    description: 'Shopify product/collection lookups used by every bundle-app editor\'s product picker. Mounted at /api/products.',
    endpoints: [
      { slug: 'list', method: 'GET', path: '/api/products', title: 'List products', description: 'Paginated product list from the shop\'s Shopify catalog, for use in bundle/BOGO editors.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "data": { "edges": [], "pageInfo": {} } }', liveTestable: false },
      { slug: 'collections', method: 'GET', path: '/api/products/collections', title: 'List collections', description: 'Shop collections, for collection-scoped bundle rules.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'bundle-products', method: 'GET', path: '/api/products/bundel-products', title: 'Get bundle product details', description: 'Resolves full product details for a set of product IDs already selected into a bundle.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'orders-count', method: 'GET', path: '/api/products/fetchOrdersCount', title: 'Get orders count', description: 'Total order count for the shop.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'currency', method: 'GET', path: '/api/products/currency', title: 'Get store currency', description: 'Shop\'s currency symbol/code, used to format prices in editors.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ "symbol": "$" }', liveTestable: false },
    ],
  },
  {
    slug: 'email-provider',
    title: 'Email Provider',
    description: 'Connects a third-party email marketing provider (e.g. Mailchimp) used by the Announcement Bar\'s email-capture form. Mounted at /api/email-provider.',
    endpoints: [
      { slug: 'connect', method: 'POST', path: '/api/email-provider/connect', title: 'Connect provider', description: 'Saves and validates an email provider API key.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'get', method: 'GET', path: '/api/email-provider', title: 'Get provider settings', description: 'Returns the connected provider\'s settings.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'disconnect', method: 'DELETE', path: '/api/email-provider', title: 'Disconnect provider', description: 'Removes the connected provider.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'sync', method: 'POST', path: '/api/email-provider/sync', title: 'Sync lists/templates', description: 'Re-fetches mailing lists and templates from the provider.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'lists', method: 'GET', path: '/api/email-provider/lists', title: 'Get mailing lists', description: 'Available mailing lists from the connected provider.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'templates', method: 'GET', path: '/api/email-provider/templates', title: 'Get templates', description: 'Available email templates from the connected provider.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'default-list', method: 'PUT', path: '/api/email-provider/default-list', title: 'Set default list', description: 'Sets the default mailing list new subscribers are added to.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
    ],
  },
  {
    slug: 'google-analytics',
    title: 'Google Analytics',
    description: 'Optional Google Analytics connection for deeper storefront-level tracking. Mounted at /api/analytics/google.',
    endpoints: [
      { slug: 'status', method: 'GET', path: '/api/analytics/google/status', title: 'Get connection status', description: 'Whether a Google account is connected.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'connect', method: 'POST', path: '/api/analytics/google/connect', title: 'Start OAuth connection', description: 'Initiates the Google OAuth flow.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'callback', method: 'GET', path: '/api/analytics/google/callback', title: 'OAuth callback', description: 'Google redirects here to complete the OAuth flow.', auth: 'none', authNote: 'Called by Google, not directly.', params: [], responseExample: 'redirect', liveTestable: false },
      { slug: 'disconnect', method: 'POST', path: '/api/analytics/google/disconnect', title: 'Disconnect', description: 'Removes the Google Analytics connection.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
      { slug: 'data', method: 'GET', path: '/api/analytics/google/data', title: 'Get analytics data', description: 'Fetches storefront analytics data from Google.', auth: 'session', authNote: SESSION_NOTE, params: [], responseExample: '{ }', liveTestable: false },
    ],
  },
];

export function getGroup(slug: string) {
  return endpointGroups.find((g) => g.slug === slug);
}
