import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid, DollarSign, BarChart3, Sparkles } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { apps } from '../data/apps';
import { features } from '../data/features';

export function Home() {
  return (
    <div className="min-h-screen bg-background text-content">
      <Header />
      <main className="pt-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
          <div className="relative mx-auto max-w-container px-6 py-24 text-center">
            <h1 className="text-display-lg font-extrabold tracking-tight text-white">
              <span className="text-brand">Busy</span>Buddy Documentation
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-body-lg text-content-secondary">
              Six storefront apps, one install. Announcement bars, tab re-engagement, and four
              product-bundling apps for Shopify - all documented here, generated from the real
              codebase.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                to="/getting-started"
                className="flex items-center gap-2 rounded-button bg-brand px-5 py-3 text-sm font-semibold text-white shadow-button transition-fast hover:bg-brand-hover"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <Link
                to="/api"
                className="rounded-button border border-surface-border bg-surface px-5 py-3 text-sm font-semibold text-content-secondary transition-fast hover:text-white hover:border-surface-border-hover"
              >
                API Reference
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-container px-6 py-16">
          <h2 className="text-heading-lg font-bold text-white text-center">Why BusyBuddy</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.slug}
                  to={`/features/${f.slug}`}
                  className="group rounded-card border border-surface-border bg-surface p-6 transition-fast hover:border-surface-border-hover hover:bg-surface-hover"
                >
                  <div
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: `${f.color}22`, color: f.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-content-secondary">{f.tagline}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-container px-6 py-16">
          <h2 className="text-heading-lg font-bold text-white text-center">The Six Apps</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => {
              const Icon = app.icon;
              return (
                <Link
                  key={app.slug}
                  to={`/apps/${app.slug}`}
                  className="group rounded-card border border-surface-border bg-surface p-6 transition-fast hover:border-surface-border-hover hover:bg-surface-hover"
                >
                  <div
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: `${app.color}22`, color: app.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-white">{app.name}</h3>
                  <p className="mt-1.5 text-sm text-content-secondary">{app.tagline}</p>
                  <div className="mt-3 flex gap-1.5">
                    {app.plans.map((p) => (
                      <span key={p} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-content-muted">
                        {p}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-container px-6 py-16 pb-24">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link to="/ci-cd/node-ci" className="flex items-center gap-3 rounded-card border border-surface-border bg-surface p-5 transition-fast hover:border-surface-border-hover">
              <BarChart3 className="text-brand" size={20} />
              <span className="text-sm font-medium text-white">CI/CD Pipelines</span>
            </Link>
            <Link to="/architecture" className="flex items-center gap-3 rounded-card border border-surface-border bg-surface p-5 transition-fast hover:border-surface-border-hover">
              <LayoutGrid className="text-brand" size={20} />
              <span className="text-sm font-medium text-white">Architecture</span>
            </Link>
            <Link to="/stretch-features" className="flex items-center gap-3 rounded-card border border-surface-border bg-surface p-5 transition-fast hover:border-surface-border-hover">
              <Sparkles className="text-brand" size={20} />
              <span className="text-sm font-medium text-white">Stretch Features</span>
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-surface-border py-8 text-center text-xs text-content-muted">
        <DollarSign className="mx-auto mb-2 text-content-muted" size={16} />
        BusyBuddy · Documentation generated from the live BusyBuddy_v2 codebase
      </footer>
    </div>
  );
}
