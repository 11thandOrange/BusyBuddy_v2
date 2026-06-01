export interface NavItem { title: string; path: string; }
export interface NavSection { title: string; items: NavItem[]; }

export const navigation: NavSection[] = [
  { title: 'Getting Started', items: [
    { title: 'Overview', path: '/' },
    { title: 'Quick Start', path: '/getting-started' },
    { title: 'Features', path: '/features' },
  ]},
  { title: 'API Reference', items: [
    { title: 'Overview', path: '/api' },
    { title: 'Bundles', path: '/api/bundles' },
    { title: 'BOGO Discounts', path: '/api/bogo' },
    { title: 'Announcement Bars', path: '/api/announcement-bars' },
    { title: 'Volume Discounts', path: '/api/volume-discounts' },
    { title: 'Analytics', path: '/api/analytics' },
    { title: 'Referrals', path: '/api/referrals' },
  ]},
  { title: 'Changelog', items: [{ title: 'Changelog', path: '/changelog' }]},
];
