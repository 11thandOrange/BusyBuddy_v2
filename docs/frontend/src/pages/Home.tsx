import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, LayoutGrid, Code2, Workflow, Boxes, Sparkles } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';

const TOPICS = [
  {
    title: 'Getting Started',
    description: 'Install BusyBuddy, choose a plan, and enable the theme extension.',
    href: '/getting-started',
    icon: BookOpen,
    color: '#5169DD',
  },
  {
    title: 'App List',
    description: 'All seven apps - what they do, how to configure them, and how they render.',
    href: '/apps/announcement-bar',
    icon: LayoutGrid,
    color: '#e67e00',
  },
  {
    title: 'Features',
    description: 'Multi-app suite, easy editor, competitive pricing, analytics, and more.',
    href: '/features/multi-app',
    icon: Sparkles,
    color: '#34c759',
  },
  {
    title: 'API Reference',
    description: 'Every endpoint, sourced from the real routes - with a live sandbox for public ones.',
    href: '/api/storefront',
    icon: Code2,
    color: '#af52de',
  },
  {
    title: 'CI/CD',
    description: 'The four real pipelines: PR checks, production deploy, the AI dev-agent, and the docs-site deploy.',
    href: '/ci-cd/node-ci',
    icon: Workflow,
    color: '#ff2d55',
  },
  {
    title: 'Architecture',
    description: 'How the backend, admin frontend, theme extension, and Cart Transform Function fit together.',
    href: '/architecture',
    icon: Boxes,
    color: '#5856d6',
  },
];

export function Home() {
  return (
    <Layout>
      <div className="text-sm text-content-muted">Documentation</div>
      <h1 className="mt-2 text-heading-lg font-bold text-white">
        <span className="text-brand">Busy</span>Buddy Docs
      </h1>
      <p className="mt-3 max-w-content prose-body">
        Everything you need to work with BusyBuddy: the seven-app suite, the admin API, the
        storefront theme extension, and the CI/CD pipelines that ship it - all documented
        straight from the codebase.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TOPICS.map((topic) => {
          const Icon = topic.icon;
          return (
            <Link
              key={topic.href}
              to={topic.href}
              className="rounded-card border border-surface-border bg-white/[0.02] p-5 transition-fast hover:border-surface-border-hover hover:bg-surface-hover"
            >
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: `${topic.color}22`, color: topic.color }}
              >
                <Icon size={17} />
              </div>
              <div className="font-semibold text-white">{topic.title}</div>
              <p className="mt-1 text-sm text-content-secondary">{topic.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-card border border-surface-border bg-white/[0.02] p-6">
        <div className="text-heading-sm font-bold text-white">Quick Start</div>
        <p className="mt-2 max-w-content text-sm text-content-secondary">
          New to BusyBuddy? Start with the install &amp; plan guide, then enable the theme
          extension on your storefront - most setup questions come from that second step.
        </p>
        <Link
          to="/getting-started/install"
          className="mt-4 inline-flex items-center gap-2 rounded-button bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-button transition-fast hover:bg-brand-hover"
        >
          Get Started <ArrowRight size={15} />
        </Link>
      </div>
    </Layout>
  );
}
