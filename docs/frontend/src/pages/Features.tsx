import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { Breadcrumbs } from '../components/Layout/Breadcrumbs';
import { features, getFeature } from '../data/features';

export function Features() {
  const { feature: slug = features[0].slug } = useParams();
  const feature = getFeature(slug) ?? features[0];
  const Icon = feature.icon;

  return (
    <Layout>
      <Breadcrumbs items={[{ title: 'Features', href: '/features' }, { title: feature.title }]} />
      <div className="mt-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${feature.color}22`, color: feature.color }}
        >
          <Icon size={18} />
        </div>
        <div>
          <h1 className="text-heading-lg font-bold text-white">{feature.title}</h1>
          <p className="text-sm text-content-secondary">{feature.tagline}</p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {feature.sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-heading-sm font-semibold text-white">{section.title}</h2>
            <p className="mt-2 prose-body">{section.content}</p>
            {section.bullets && (
              <ul className="mt-3 space-y-1.5">
                {section.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-content-secondary">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}
