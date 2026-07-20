import { Layout } from '../components/Layout/Layout';
import { Breadcrumbs } from '../components/Layout/Breadcrumbs';
import { Badge } from '../components/ui/Badge';
import { changelog } from '../data/changelog';

const SECTIONS: { key: 'added' | 'changed' | 'fixed'; label: string; tone: 'brand' | 'default' | 'success' }[] = [
  { key: 'added', label: 'Added', tone: 'brand' },
  { key: 'changed', label: 'Changed', tone: 'default' },
  { key: 'fixed', label: 'Fixed', tone: 'success' },
];

export function Changelog() {
  return (
    <Layout>
      <Breadcrumbs items={[{ title: 'Changelog' }]} />
      <h1 className="mt-4 text-heading-lg font-bold text-white">Changelog</h1>
      <p className="mt-2 prose-body">
        Generated from git history via <code className="font-mono">scripts/generate-changelog.mjs</code>,
        grouped by day and bucketed by conventional-commit type (feat → Added, fix → Fixed,
        everything else → Changed). Re-run the script to pick up new commits.
      </p>

      <div className="mt-8 space-y-10">
        {changelog.map((entry) => (
          <div key={entry.date}>
            <h2 className="text-heading-sm font-semibold text-white font-mono">{entry.date}</h2>
            <div className="mt-3 space-y-4 border-l border-surface-border pl-4">
              {SECTIONS.map(({ key, label, tone }) => {
                const items = entry[key];
                if (items.length === 0) return null;
                return (
                  <div key={key}>
                    <Badge tone={tone}>{label}</Badge>
                    <ul className="mt-2 space-y-1.5">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-content-secondary">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
