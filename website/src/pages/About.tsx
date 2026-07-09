import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function About() {
  return (
    <div className="min-h-screen bg-background text-content">
      <Header />
      <main className="mx-auto max-w-container px-6 pb-20 pt-32">
        <div className="text-xs font-semibold uppercase tracking-wider text-brand">About</div>
        <h1 className="mt-2 text-heading-lg font-bold text-content">Built for stores that need more than one app</h1>
        <p className="mt-4 max-w-2xl prose-body">
          Most Shopify stores end up with a different app for every storefront feature - one for
          announcement bars, one for bundles, one for BOGO offers - each with its own install, its
          own bill, and its own settings screen. BusyBuddy is one app that does all of it.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-heading-sm font-bold text-content">One install, six apps</h2>
            <p className="mt-2 prose-body">
              Announcement Bar, Inactive Tab Message, Bundle Discounts, Buy One Get One, Volume
              Discounts, and Mix &amp; Match all live behind a single Shopify install and a single
              admin dashboard. Enable only what your store needs.
            </p>
          </div>
          <div>
            <h2 className="text-heading-sm font-bold text-content">Pay for what you use</h2>
            <p className="mt-2 prose-body">
              Every plan includes Announcement Bar and Inactive Tab Message for free. Paid plans
              unlock the discount and bundle apps as your store grows - no separate purchase or
              re-authentication for each one.
            </p>
          </div>
          <div>
            <h2 className="text-heading-sm font-bold text-content">Consistent by design</h2>
            <p className="mt-2 prose-body">
              Every widget-based app shares the same editor pattern: pick products or content,
              configure appearance, preview live, save. Learn one editor, and the rest feel
              familiar.
            </p>
          </div>
          <div>
            <h2 className="text-heading-sm font-bold text-content">Built on the Shopify platform</h2>
            <p className="mt-2 prose-body">
              Discounts are applied server-side through a Shopify Cart Transform Function, not
              client-side price manipulation, and storefront widgets render through a Shopify
              Theme App Extension - so BusyBuddy behaves the way merchants expect a Shopify app to
              behave.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
