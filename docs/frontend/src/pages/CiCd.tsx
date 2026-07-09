import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { Breadcrumbs } from '../components/Layout/Breadcrumbs';
import { workflows, getWorkflow } from '../data/workflows';
import { Badge } from '../components/ui/Badge';

export function CiCd() {
  const { workflow: slug = workflows[0].slug } = useParams();
  const workflow = getWorkflow(slug) ?? workflows[0];

  return (
    <Layout>
      <Breadcrumbs items={[{ title: 'CI/CD', href: '/ci-cd' }, { title: workflow.title }]} />
      <h1 className="mt-4 text-heading-lg font-bold text-white">{workflow.title}</h1>
      <code className="mt-2 block font-mono text-sm text-content-muted">{workflow.file}</code>

      <div className="mt-4">
        <Badge tone="brand">{workflow.trigger}</Badge>
      </div>

      <p className="mt-6 prose-body">{workflow.description}</p>

      <div className="mt-8 space-y-8">
        {workflow.jobs.map((job) => (
          <div key={job.name}>
            <div className="flex items-baseline gap-2">
              <h2 className="text-heading-sm font-semibold text-white font-mono">{job.name}</h2>
              <span className="text-xs text-content-muted">{job.runsOn}</span>
            </div>
            <ol className="mt-3 space-y-3 border-l border-surface-border pl-4">
              {job.steps.map((step, i) => (
                <li key={step.name} className="relative">
                  <span className="absolute -left-[21px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="text-sm font-medium text-white">{step.name}</div>
                  <div className="text-sm text-content-secondary">{step.detail}</div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </Layout>
  );
}
