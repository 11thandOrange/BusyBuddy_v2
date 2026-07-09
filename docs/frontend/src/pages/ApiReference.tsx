import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { endpointGroups, getGroup } from '../data/endpoints';
import { EndpointDoc } from '../components/ApiReference/EndpointDoc';
import { Sandbox } from '../components/ApiReference/Sandbox';
import { cn } from '../lib/cn';

export function ApiReference() {
  const { group: slug = endpointGroups[0].slug } = useParams();
  const group = getGroup(slug) ?? endpointGroups[0];
  const liveEndpoints = group.endpoints.filter((e) => e.liveTestable);
  const [activeLive, setActiveLive] = useState(liveEndpoints[0]?.slug);
  const activeEndpoint = liveEndpoints.find((e) => e.slug === activeLive) ?? liveEndpoints[0];

  const rightPanel =
    liveEndpoints.length > 0 && activeEndpoint ? (
      <div>
        {liveEndpoints.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {liveEndpoints.map((e) => (
              <button
                key={e.slug}
                onClick={() => setActiveLive(e.slug)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium transition-fast',
                  activeEndpoint.slug === e.slug
                    ? 'bg-brand text-white'
                    : 'bg-surface text-content-secondary hover:text-white'
                )}
              >
                {e.title}
              </button>
            ))}
          </div>
        )}
        <Sandbox key={activeEndpoint.slug} endpoint={activeEndpoint} />
      </div>
    ) : undefined;

  return (
    <Layout rightPanel={rightPanel}>
      <h1 className="text-heading-lg font-bold text-white">{group.title}</h1>
      <p className="mt-2 prose-body">{group.description}</p>
      <div className="mt-8">
        {group.endpoints.map((endpoint) => (
          <EndpointDoc key={endpoint.slug} endpoint={endpoint} />
        ))}
      </div>
    </Layout>
  );
}
