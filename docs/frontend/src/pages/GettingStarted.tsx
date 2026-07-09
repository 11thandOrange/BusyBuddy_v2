import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { Badge } from '../components/ui/Badge';

const SECTIONS: Record<string, { title: string; body: React.ReactNode }> = {
  introduction: {
    title: 'Introduction',
    body: (
      <>
        <p className="prose-body">
          BusyBuddy is a Shopify embedded app suite: one install grants access to six
          storefront/engagement apps - Announcement Bar, Inactive Tab Message, Bundle
          Discounts, Buy One Get One, Volume Discounts, and Mix &amp; Match. Merchants manage
          all six from a single admin dashboard, and enable/pay for only the ones they use.
        </p>
        <p className="mt-4 prose-body">
          The app is built as a standard Shopify embedded app: an Express backend, a React
          admin frontend loaded via App Bridge, MongoDB for storage, a Shopify Theme App
          Extension for the storefront-facing widgets, and a Shopify Function (Cart Transform)
          that applies bundle discounts at checkout.
        </p>
      </>
    ),
  },
  install: {
    title: 'Install & Choose a Plan',
    body: (
      <>
        <p className="prose-body">Install BusyBuddy from the Shopify App Store like any other app. On first install, the shop starts on the <Badge tone="brand">Free</Badge> plan automatically.</p>
        <div className="mt-6 space-y-3">
          <div className="rounded-input border border-surface-border p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Free</span>
              <span className="text-content-secondary">$0/mo</span>
            </div>
            <p className="mt-1 text-sm text-content-secondary">Announcement Bar + Inactive Tab Message. 1 app enabled at a time.</p>
          </div>
          <div className="rounded-input border border-surface-border p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Starter</span>
              <span className="text-content-secondary">$30/mo</span>
            </div>
            <p className="mt-1 text-sm text-content-secondary">Adds Bundle Discounts, Buy One Get One, Volume Discounts. Up to 3 apps enabled at once.</p>
          </div>
          <div className="rounded-input border border-surface-border p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Advanced</span>
              <span className="text-content-secondary">$60/mo</span>
            </div>
            <p className="mt-1 text-sm text-content-secondary">Adds Mix &amp; Match. Up to 6 apps enabled at once.</p>
          </div>
        </div>
        <p className="mt-6 prose-body">
          Changing plans always goes through Shopify's real billing confirmation screen before
          anything changes - including switching directly between two paid plans.
        </p>
      </>
    ),
  },
  'enable-extension': {
    title: 'Enable the Theme Extension',
    body: (
      <>
        <p className="prose-body">
          Installing the app and configuring a widget in the admin dashboard doesn't make it
          appear on the storefront by itself - the corresponding block/embed also needs to be
          turned on in the Shopify Theme Editor. There are two distinct flows, and BusyBuddy
          apps split across both:
        </p>
        <div className="mt-6 space-y-4">
          <div className="rounded-input border border-surface-border p-4">
            <div className="font-semibold text-white">Add Block (section-based)</div>
            <p className="mt-1 text-sm text-content-secondary">
              Announcement Bar and all four discount/bundle apps render via section blocks.
              In the Theme Editor: <code className="font-mono text-brand">Add block → Apps → BusyBuddy Announcement</code> (or the
              relevant bundle block). <code className="font-mono">?context=apps</code> in a deep link does <em>not</em> open this panel.
            </p>
          </div>
          <div className="rounded-input border border-surface-border p-4">
            <div className="font-semibold text-white">App Embeds</div>
            <p className="mt-1 text-sm text-content-secondary">
              Inactive Tab Message is a true app embed (target: "body"). In the Theme Editor:
              the <code className="font-mono">App embeds</code> panel, reachable via <code className="font-mono">?context=apps</code>.
            </p>
          </div>
        </div>
        <p className="mt-6 prose-body">
          The admin dashboard's "Enable BusyBuddy" banner links to the correct flow for the app
          you're configuring.
        </p>
      </>
    ),
  },
};

export function GettingStarted() {
  const { section = 'introduction' } = useParams();
  const content = SECTIONS[section] ?? SECTIONS.introduction;

  return (
    <Layout>
      <h1 className="text-heading-lg font-bold text-white">{content.title}</h1>
      <div className="mt-6">{content.body}</div>
    </Layout>
  );
}
