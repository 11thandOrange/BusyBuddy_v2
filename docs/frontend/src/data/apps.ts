import { Megaphone, Eye, Package, Gift, Layers, Shuffle } from 'lucide-react';
import type { AppDoc } from '../types';

export const apps: AppDoc[] = [
  {
    slug: 'announcement-bar',
    name: 'Announcement Bar',
    color: '#e67e00',
    icon: Megaphone,
    tagline: 'Display alerts and promotions at the top of your store',
    plans: ['Free', 'Starter', 'Advanced'],
    overview:
      'A configurable bar rendered at the top (or bottom) of the storefront for announcements, promotions, countdowns, or an email capture form. Themed independently of the store, with scheduling and per-shop enable/disable.',
    keyFeatures: [
      'Solid color, image, or scrolling-text message display',
      'Optional email capture form wired to a connected email provider (Mailchimp, etc.)',
      'Optional "Shop Now" button with click tracking',
      'Scheduling window (start/end date) enforced server-side',
      'View + click analytics per bar',
    ],
    configuration: [
      'Create/edit bars from the admin app\'s Announcement Bar tab',
      'Enable on the storefront via Shopify Theme Editor → Add Block → Apps → BusyBuddy Announcement (this is a section block, not an app embed)',
      'Only one bar is ever shown at a time - the highest-priority active bar within its date window',
    ],
    storefrontBehavior:
      'The theme extension script fetches the active bar from a public app-proxy endpoint on load, builds the bar via safe DOM APIs (not innerHTML, to prevent stored XSS from merchant-entered text), and tracks view/click analytics via IntersectionObserver.',
  },
  {
    slug: 'inactive-tab-message',
    name: 'Inactive Tab Message',
    color: '#5856d6',
    icon: Eye,
    tagline: 'Re-engage visitors when they switch browser tabs',
    plans: ['Free', 'Starter', 'Advanced'],
    overview:
      'Swaps the browser tab title (and optionally favicon) to a custom message when a shopper switches away from the tab, then restores it when they return - a lightweight re-engagement nudge.',
    keyFeatures: [
      'Custom message and optional custom favicon image',
      'Scheduling window (start/end date), enforced client-side by the theme script',
      'Per-shop enable/disable toggle',
    ],
    configuration: [
      'Configure the message and schedule from the admin app\'s Inactive Tab Message tab',
      'Enable on the storefront via Shopify Theme Editor → App Embeds - this one is a real app embed (target: "body"), unlike Announcement Bar',
    ],
    storefrontBehavior:
      'A small class-based manager listens for the browser\'s visibilitychange/blur/focus events and swaps document.title (and the favicon link tag) only while the tab is hidden and the configured date window is active.',
  },
  {
    slug: 'bundle-discounts',
    name: 'Bundle Discounts',
    color: '#007aff',
    icon: Package,
    tagline: 'Create product bundles with automatic discounts',
    plans: ['Starter', 'Advanced'],
    overview:
      'Merchants pick a set of products, set a discount, and BusyBuddy renders a bundle widget on the product page plus applies the discount at checkout via a Shopify Cart Transform Function.',
    keyFeatures: [
      'Percentage or fixed-amount discount per bundle',
      'Custom widget appearance (colors, fonts) per bundle',
      'Scheduling window and priority when multiple bundles could apply to a product',
    ],
    configuration: [
      'Build bundles in the admin app\'s standalone bundle editor',
      'The discount is applied server-side by extensions/cart-transformer (a Shopify Function), not by client-side price manipulation',
    ],
    storefrontBehavior:
      'The theme extension script queries the public app-proxy endpoint for the active bundle covering the current product, and renders the picker if the shop\'s plan includes Bundle Discounts.',
  },
  {
    slug: 'buy-one-get-one',
    name: 'Buy One Get One',
    color: '#34c759',
    icon: Gift,
    tagline: 'BOGO deals, free gifts, and special offers',
    plans: ['Starter', 'Advanced'],
    overview:
      'Configure "buy X get Y" offers - a free or discounted item added when a qualifying product is purchased - rendered as a widget and enforced at checkout via the same Cart Transform Function used by Bundle Discounts.',
    keyFeatures: [
      'Separate "X" (trigger) and "Y" (reward) product pools',
      'Percentage, fixed, or free reward pricing',
      'Custom widget appearance per offer',
    ],
    configuration: [
      'Build offers in the admin app\'s BOGO editor',
      'Requires the Starter plan or above',
    ],
    storefrontBehavior:
      'Same rendering/discount-application pattern as Bundle Discounts, scoped to BOGO-type bundle documents.',
  },
  {
    slug: 'volume-discounts',
    name: 'Volume Discounts',
    color: '#ff2d55',
    icon: Layers,
    tagline: 'Quantity-based pricing tiers and bulk savings',
    plans: ['Starter', 'Advanced'],
    overview:
      'Quantity-break pricing (e.g. buy 2 save 10%, buy 4 save 20%) configured per product, rendered as a tier picker widget and enforced at checkout.',
    keyFeatures: [
      'Multiple quantity tiers per offer, each with its own discount',
      'Custom widget appearance per offer',
    ],
    configuration: [
      'Build tiers in the admin app\'s Volume Discounts editor',
      'Requires the Starter plan or above',
    ],
    storefrontBehavior:
      'Same rendering/discount-application pattern as Bundle Discounts, scoped to Volume Discount-type bundle documents.',
  },
  {
    slug: 'mix-and-match',
    name: 'Mix & Match',
    color: '#af52de',
    icon: Shuffle,
    tagline: 'Let customers build their own custom bundles',
    plans: ['Advanced'],
    overview:
      'Merchants define a pool of eligible products and a quantity-based discount; shoppers pick any combination from the pool to qualify - the most flexible of the four discount apps.',
    keyFeatures: [
      'Merchant-defined eligible product pool',
      'Quantity-tier discounts across any mix of eligible products',
      'Custom widget appearance per offer',
    ],
    configuration: [
      'Build offers in the admin app\'s Mix & Match editor',
      'Advanced plan only',
    ],
    storefrontBehavior:
      'Same rendering/discount-application pattern as Bundle Discounts, scoped to Mix & Match-type bundle documents.',
  },
];

export function getApp(slug: string): AppDoc | undefined {
  return apps.find((a) => a.slug === slug);
}
