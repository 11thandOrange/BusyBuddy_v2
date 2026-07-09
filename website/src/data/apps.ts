import { Megaphone, Eye, Package, Gift, Layers, Shuffle, type LucideIcon } from 'lucide-react';

export interface MarketingApp {
  slug: string;
  name: string;
  color: string;
  icon: LucideIcon;
  tagline: string;
  plans: string[];
  description: string;
  monsterVariant: 1 | 2 | 3 | 4 | 5 | 6;
}

// Mirrors the six real BusyBuddy apps (see docs/frontend/src/data/apps.ts
// for the full technical writeups) with shorter, marketing-facing copy.
export const apps: MarketingApp[] = [
  {
    slug: 'announcement-bar',
    name: 'Announcement Bar',
    color: '#e67e00',
    icon: Megaphone,
    tagline: 'Display alerts and promotions at the top of your store',
    plans: ['Free', 'Starter', 'Advanced'],
    description:
      'A configurable bar for announcements, promotions, countdowns, or email capture - scheduled, themed to your store, and live in minutes.',
    monsterVariant: 1,
  },
  {
    slug: 'inactive-tab-message',
    name: 'Inactive Tab Message',
    color: '#5856d6',
    icon: Eye,
    tagline: 'Re-engage visitors when they switch browser tabs',
    plans: ['Free', 'Starter', 'Advanced'],
    description:
      'Swaps the browser tab title (and favicon) to a custom message the moment a shopper looks away, then restores it when they return.',
    monsterVariant: 2,
  },
  {
    slug: 'bundle-discounts',
    name: 'Bundle Discounts',
    color: '#007aff',
    icon: Package,
    tagline: 'Create product bundles with automatic discounts',
    plans: ['Starter', 'Advanced'],
    description:
      'Pick a set of products, set a discount, and BusyBuddy renders the bundle widget and applies it at checkout automatically.',
    monsterVariant: 3,
  },
  {
    slug: 'buy-one-get-one',
    name: 'Buy One Get One',
    color: '#34c759',
    icon: Gift,
    tagline: 'BOGO deals, free gifts, and special offers',
    plans: ['Starter', 'Advanced'],
    description:
      'Configure "buy X get Y" offers - a free or discounted item added automatically when a qualifying product is purchased.',
    monsterVariant: 4,
  },
  {
    slug: 'volume-discounts',
    name: 'Volume Discounts',
    color: '#ff2d55',
    icon: Layers,
    tagline: 'Quantity-based pricing tiers and bulk savings',
    plans: ['Starter', 'Advanced'],
    description:
      'Buy 2, save 10%. Buy 4, save 20%. Set quantity-break pricing per product with a clean tier picker widget.',
    monsterVariant: 5,
  },
  {
    slug: 'mix-and-match',
    name: 'Mix & Match',
    color: '#af52de',
    icon: Shuffle,
    tagline: 'Let customers build their own custom bundles',
    plans: ['Advanced'],
    description:
      'Define a pool of eligible products and a quantity discount - shoppers mix and match any combination to qualify.',
    monsterVariant: 6,
  },
];

export function getApp(slug: string): MarketingApp | undefined {
  return apps.find((a) => a.slug === slug);
}
