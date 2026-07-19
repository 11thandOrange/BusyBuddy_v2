import type { NavSection } from '../types';

/** Top nav bar (also drives which sidebar section renders per top-level tab). */
export const topNav: { title: string; href: string }[] = [
  { title: 'Getting Started', href: '/getting-started' },
  { title: 'Features', href: '/features/multi-app' },
  { title: 'App List', href: '/apps/announcement-bar' },
  { title: 'API Reference', href: '/api/announcement-bars' },
  { title: 'CI/CD', href: '/ci-cd/node-ci' },
  { title: 'Architecture', href: '/architecture' },
  { title: 'Stretch Features', href: '/stretch-features' },
  { title: 'Changelog', href: '/changelog' },
];

/** Sidebar sections, one per top-level tab, each with real sub-tabs. */
export const sidebarSections: Record<string, NavSection> = {
  'getting-started': {
    title: 'Getting Started',
    href: '/getting-started',
    children: [
      { title: 'Introduction', href: '/getting-started' },
      { title: 'Install & Choose a Plan', href: '/getting-started/install' },
      { title: 'Enable the Theme Extension', href: '/getting-started/enable-extension' },
    ],
  },
  features: {
    title: 'Features',
    href: '/features',
    children: [
      { title: 'Multi-App Suite', href: '/features/multi-app' },
      { title: 'Easy Editor', href: '/features/easy-editor' },
      { title: 'Competitive Pricing', href: '/features/pricing' },
      { title: 'Comprehensive Analytics', href: '/features/analytics' },
      { title: 'Per-App Feature Depth', href: '/features/per-app-depth' },
    ],
  },
  apps: {
    title: 'App List',
    href: '/apps',
    children: [
      { title: 'Announcement Bar', href: '/apps/announcement-bar' },
      { title: 'Inactive Tab Message', href: '/apps/inactive-tab-message' },
      { title: 'Bundle Discounts', href: '/apps/bundle-discounts' },
      { title: 'Buy One Get One', href: '/apps/buy-one-get-one' },
      { title: 'Volume Discounts', href: '/apps/volume-discounts' },
      { title: 'Mix & Match', href: '/apps/mix-and-match' },
      { title: 'Star Rating', href: '/apps/star-rating' },
    ],
  },
  api: {
    title: 'API Reference',
    href: '/api',
    children: [
      { title: 'Storefront (Public)', href: '/api/storefront' },
      { title: 'Announcement Bars', href: '/api/announcement-bars' },
      { title: 'Bundles', href: '/api/bundles' },
      { title: 'Inactive Tab', href: '/api/inactive-tab' },
      { title: 'Subscription & Billing', href: '/api/subscription' },
      { title: 'Referrals', href: '/api/referrals' },
      { title: 'Webhooks', href: '/api/webhooks' },
      { title: 'Activity & Analytics', href: '/api/activity' },
      { title: 'Products', href: '/api/products' },
      { title: 'Email Provider', href: '/api/email-provider' },
      { title: 'Google Analytics', href: '/api/google-analytics' },
    ],
  },
  'ci-cd': {
    title: 'CI/CD',
    href: '/ci-cd',
    children: [
      { title: 'Node CI (test + e2e)', href: '/ci-cd/node-ci' },
      { title: 'Production Deploy', href: '/ci-cd/deploy' },
      { title: 'AI Dev-Agent Pipeline', href: '/ci-cd/dev-pipeline' },
      { title: 'Deploy Docs Site', href: '/ci-cd/deploy-docs' },
    ],
  },
  architecture: {
    title: 'Architecture',
    href: '/architecture',
    children: [{ title: 'System Overview', href: '/architecture' }],
  },
  'stretch-features': {
    title: 'Stretch Features',
    href: '/stretch-features',
    children: [{ title: 'Custom App Creation', href: '/stretch-features' }],
  },
  changelog: {
    title: 'Changelog',
    href: '/changelog',
    children: [{ title: 'All changes', href: '/changelog' }],
  },
};

export function sectionKeyForPath(pathname: string): string {
  const seg = pathname.split('/').filter(Boolean)[0] ?? '';
  if (seg === 'getting-started') return 'getting-started';
  if (seg === 'features') return 'features';
  if (seg === 'apps') return 'apps';
  if (seg === 'api') return 'api';
  if (seg === 'ci-cd') return 'ci-cd';
  if (seg === 'architecture') return 'architecture';
  if (seg === 'stretch-features') return 'stretch-features';
  if (seg === 'changelog') return 'changelog';
  return 'getting-started';
}
