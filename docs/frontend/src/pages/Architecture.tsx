import { Layout } from '../components/Layout/Layout';
import { Breadcrumbs } from '../components/Layout/Breadcrumbs';

function Box({ title, detail, className }: { title: string; detail: string; className?: string }) {
  return (
    <div className={`rounded-input border border-surface-border bg-white/[0.02] p-4 ${className ?? ''}`}>
      <div className="font-mono text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-xs text-content-secondary">{detail}</div>
    </div>
  );
}

export function Architecture() {
  return (
    <Layout>
      <Breadcrumbs items={[{ title: 'Architecture' }]} />
      <h1 className="mt-4 text-heading-lg font-bold text-white">System Architecture</h1>
      <p className="mt-2 prose-body">
        BusyBuddy is a monorepo: an Express backend, a React admin frontend embedded in Shopify
        Admin via App Bridge, a Shopify Theme App Extension for storefront widgets, and a
        Shopify Function for checkout-time discount application.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3">
        <Box title="web/frontend — React Admin UI" detail="Vite + React, embedded in Shopify Admin via App Bridge. One editor per app (Announcement Bar, 4 discount apps), a dashboard, and a plan/billing page." />
        <Box title="web/backend — Express API" detail="REST API under /api/*. Routes split by feature (bundles, announcement-bars, subscription, referrals, webhooks, activity, products, email-provider, google-analytics)." />
        <Box title="MongoDB" detail="Sessions, shops, bundles, announcement bars, inactive-tab config, subscriptions, referrals, activity logs, email logs, merchant events." />
        <Box title="extensions/bogo-shopify-app — Theme App Extension" detail="Storefront-facing JS/Liquid: announcement bar rendering, inactive tab title-swap, bundle widget rendering. Talks to the backend through the Shopify App Proxy (/apps/bogo-app/*), so it works without a merchant session." />
        <Box title="extensions/cart-transformer — Shopify Function" detail="A Cart Transform Function that applies bundle/BOGO/volume discounts server-side at checkout - the discount is never computed client-side, so it can't be tampered with." />
      </div>

      <h2 className="mt-10 text-heading-sm font-semibold text-white">Request flow: storefront widget</h2>
      <ol className="mt-3 space-y-2 text-sm text-content-secondary list-decimal list-inside">
        <li>Theme extension script loads on the storefront (via Add Block or App Embed, depending on the app).</li>
        <li>It fetches its config from a public endpoint via the Shopify App Proxy (e.g. /apps/bogo-app/api/frontStore/getAnnouncementBar).</li>
        <li>The App Proxy forwards the request to the Express backend with a shop-scoped signature; the backend verifies it (lighter-weight than a full session) and checks plan/schedule gating.</li>
        <li>The script renders the widget via safe DOM APIs (not innerHTML) to prevent stored XSS from merchant-entered content.</li>
      </ol>

      <h2 className="mt-8 text-heading-sm font-semibold text-white">Request flow: admin actions</h2>
      <ol className="mt-3 space-y-2 text-sm text-content-secondary list-decimal list-inside">
        <li>Admin frontend runs inside the Shopify Admin iframe, authenticated via App Bridge.</li>
        <li>API calls to /api/* carry a session token validated by shopify.validateAuthenticatedSession().</li>
        <li>Controllers read/write MongoDB directly, or call the Shopify Admin GraphQL/REST API for product data.</li>
      </ol>

      <h2 className="mt-8 text-heading-sm font-semibold text-white">Billing flow</h2>
      <p className="mt-2 prose-body">
        Plan changes go through the Shopify Billing API. The backend checks whether the shop is
        already subscribed to the <em>specific target plan</em> (not just any paid plan) before
        deciding whether a new charge confirmation is needed - so switching directly between two
        paid plans always surfaces Shopify's real billing confirmation screen rather than
        silently swapping plans without a corresponding charge.
      </p>

      <h2 className="mt-8 text-heading-sm font-semibold text-white">Compliance & lifecycle webhooks</h2>
      <p className="mt-2 prose-body">
        Shopify's mandatory GDPR webhooks are implemented for real: <code className="font-mono">shop/redact</code> purges
        all shop-scoped data across every collection, <code className="font-mono">customers/redact</code> anonymizes
        order-ID linkage in activity logs, and <code className="font-mono">customers/data_request</code> logs the
        request with any matching activity for audit. An <code className="font-mono">app_subscriptions/update</code> handler
        keeps the local plan state in sync when Shopify cancels a subscription on its own (e.g. a
        declined recurring charge).
      </p>
    </Layout>
  );
}
