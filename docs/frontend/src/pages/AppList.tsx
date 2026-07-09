import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { apps, getApp } from '../data/apps';
import { Badge } from '../components/ui/Badge';

export function AppList() {
  const { app: slug = apps[0].slug } = useParams();
  const app = getApp(slug) ?? apps[0];
  const Icon = app.icon;

  return (
    <Layout>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${app.color}22`, color: app.color }}
        >
          <Icon size={18} />
        </div>
        <div>
          <h1 className="text-heading-lg font-bold text-white">{app.name}</h1>
          <p className="text-sm text-content-secondary">{app.tagline}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5">
        {app.plans.map((p) => (
          <Badge key={p} tone={p === 'Free' ? 'muted' : 'brand'}>
            {p}
          </Badge>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-heading-sm font-semibold text-white">Overview</h2>
        <p className="mt-2 prose-body">{app.overview}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-heading-sm font-semibold text-white">Key features</h2>
        <ul className="mt-3 space-y-1.5">
          {app.keyFeatures.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-content-secondary">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-heading-sm font-semibold text-white">Configuration</h2>
        <ul className="mt-3 space-y-1.5">
          {app.configuration.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-content-secondary">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-heading-sm font-semibold text-white">Storefront behavior</h2>
        <p className="mt-2 prose-body">{app.storefrontBehavior}</p>
      </div>
    </Layout>
  );
}
