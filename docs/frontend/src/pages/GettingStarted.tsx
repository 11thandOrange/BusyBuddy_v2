import { useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Breadcrumbs } from '../components/Layout/Breadcrumbs';
import { Badge } from '../components/ui/Badge';

function StepCard({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-surface-border bg-white/[0.02] p-5">
      <div className="font-semibold text-white">
        {number}. {title}
      </div>
      <div className="mt-2 text-sm text-content-secondary">{children}</div>
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-content-secondary">
      <CheckCircle2 size={16} className="shrink-0 text-status-success" />
      {children}
    </li>
  );
}

const SECTIONS: Record<string, { title: string; subtitle: string; body: React.ReactNode }> = {
  introduction: {
    title: 'Introduction',
    subtitle: 'What BusyBuddy is and how it\'s put together.',
    body: (
      <>
        <p className="prose-body">
          BusyBuddy is a Shopify embedded app suite: one install grants access to seven
          storefront/engagement apps - Announcement Bar, Inactive Tab Message, Bundle
          Discounts, Buy One Get One, Volume Discounts, Mix &amp; Match, and Star Rating.
          Merchants manage the plan-gated six from a single admin dashboard and enable/pay for
          only the ones they use; Star Rating ships enabled on every plan.
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
    subtitle: 'Get BusyBuddy running on a shop in a few minutes.',
    body: (
      <>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-content-muted">Prerequisites</div>
        <ul className="mb-6 space-y-2">
          <CheckItem>A Shopify store (development or live)</CheckItem>
          <CheckItem>Store owner or staff access with app-install permission</CheckItem>
        </ul>

        <div className="space-y-4">
          <StepCard number={1} title="Install from the Shopify App Store">
            Installing starts the shop on the <Badge tone="muted">Free</Badge> plan automatically - no
            payment info needed until you choose to upgrade.
          </StepCard>
          <StepCard number={2} title="Choose a plan">
            <div className="mt-1 space-y-2">
              <div className="flex items-center justify-between rounded-input border border-surface-border px-3 py-2">
                <span className="font-medium text-white">Free</span>
                <span className="text-content-secondary">$0/mo · Announcement Bar + Inactive Tab, 1 app at a time</span>
              </div>
              <div className="flex items-center justify-between rounded-input border border-surface-border px-3 py-2">
                <span className="font-medium text-white">Starter</span>
                <span className="text-content-secondary">$30/mo · +3 discount apps, up to 3 apps at once</span>
              </div>
              <div className="flex items-center justify-between rounded-input border border-surface-border px-3 py-2">
                <span className="font-medium text-white">Advanced</span>
                <span className="text-content-secondary">$60/mo · +Mix & Match, up to 6 apps at once</span>
              </div>
            </div>
          </StepCard>
          <StepCard number={3} title="Confirm billing">
            Plan changes - including switching directly between two paid plans - always go
            through Shopify's real billing confirmation screen before anything changes.
          </StepCard>
        </div>
      </>
    ),
  },
  'enable-extension': {
    title: 'Enable the Theme Extension',
    subtitle: 'Installing the app doesn\'t make widgets appear on the storefront by itself.',
    body: (
      <>
        <p className="prose-body">
          Configuring a widget in the admin dashboard is one step - the corresponding
          block/embed also needs to be turned on in the Shopify Theme Editor. There are two
          distinct flows, and BusyBuddy apps split across both:
        </p>
        <div className="mt-6 space-y-4">
          <StepCard number={1} title="Add Block (section-based)">
            Announcement Bar and all four discount/bundle apps render via section blocks.
            In the Theme Editor: <code className="font-mono text-brand">Add block → Apps → BusyBuddy Announcement</code> (or
            the relevant bundle block). <code className="font-mono">?context=apps</code> in a deep link does <em>not</em> open this panel.
          </StepCard>
          <StepCard number={2} title="App Embeds">
            Inactive Tab Message is a true app embed (target: "body"). In the Theme Editor:
            the <code className="font-mono">App embeds</code> panel, reachable via <code className="font-mono">?context=apps</code>.
          </StepCard>
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
      <Breadcrumbs items={[{ title: 'Getting Started', href: '/getting-started' }, { title: content.title }]} />
      <h1 className="mt-4 text-heading-lg font-bold text-white">{content.title}</h1>
      <p className="mt-2 text-content-secondary">{content.subtitle}</p>
      <div className="mt-6">{content.body}</div>
    </Layout>
  );
}
