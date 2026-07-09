import { ArrowUpRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { HeroCarousel } from '../components/HeroCarousel';
import { apps } from '../data/apps';

export function Home() {
  return (
    <div className="min-h-screen bg-background text-content">
      <Header />
      <HeroCarousel />

      <section className="mx-auto max-w-container-lg px-6 py-20">
        <div className="max-w-xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">The suite</div>
          <h2 className="mt-2 text-heading-lg font-bold text-white">Six apps. One install.</h2>
          <p className="mt-3 prose-body">
            BusyBuddy bundles six storefront and engagement apps behind a single Shopify install.
            Enable only what you need, manage everything from one dashboard, and pay one bill.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.slug}
                id={`app-${app.slug}`}
                className="rounded-card border border-surface-border bg-white/[0.02] p-5 transition-fast hover:border-surface-border-hover hover:bg-surface-hover"
              >
                <div
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: `${app.color}22`, color: app.color }}
                >
                  <Icon size={17} />
                </div>
                <div className="font-semibold text-white">{app.name}</div>
                <p className="mt-1 text-sm text-content-secondary">{app.tagline}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-surface-border">
        <div className="mx-auto flex max-w-container-lg flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-heading-lg font-bold text-white">Ready to get started?</h2>
            <p className="mt-2 max-w-md prose-body">
              Install BusyBuddy from the Shopify App Store and start on the Free plan - no payment
              info required until you choose to upgrade.
            </p>
          </div>
          <a
            href="https://apps.shopify.com/busybuddy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-button bg-brand px-5 py-3 text-sm font-semibold text-white shadow-button transition-fast hover:bg-brand-hover"
          >
            Install BusyBuddy <ArrowUpRight size={15} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
