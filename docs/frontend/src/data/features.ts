import { LayoutGrid, Wand2, DollarSign, BarChart3, Sparkles } from 'lucide-react';
import type { FeatureDoc } from '../types';

export const features: FeatureDoc[] = [
  {
    slug: 'multi-app',
    title: 'Multi-App Suite',
    tagline: 'All the apps your store needs, in one place',
    icon: LayoutGrid,
    color: '#5169DD',
    sections: [
      {
        title: 'One install, seven apps',
        content:
          'BusyBuddy bundles seven separate storefront/engagement apps behind a single install: Announcement Bar, Inactive Tab Message, Bundle Discounts, Buy One Get One, Volume Discounts, Mix & Match, and Star Rating. Instead of installing and paying for seven separate Shopify apps, merchants manage everything from one dashboard.',
        bullets: [
          'Single dashboard shows every app\'s status, quick stats, and recent activity',
          'Consistent editor and theming pattern across every discount app',
          'One subscription, one billing relationship with Shopify',
          'Star Rating ships enabled on every plan - it isn\'t part of the plan-gated app-toggle system the other six apps use',
        ],
      },
      {
        title: 'Grows with the store',
        content:
          'Every plan includes Announcement Bar and Inactive Tab Message. Paid plans unlock the four discount/bundle apps as the store grows, without a separate install or re-authentication for each one. Star Rating sits outside this plan gating entirely and is always available.',
      },
    ],
  },
  {
    slug: 'easy-editor',
    title: 'Easy Editor',
    tagline: 'Easy to use, easy to customize',
    icon: Wand2,
    color: '#34c759',
    sections: [
      {
        title: 'A consistent editing pattern',
        content:
          'Every app that renders a storefront widget - Announcement Bar and all four discount apps - shares the same editor shape: pick products or content, configure colors/fonts/copy, preview live, save. Once a merchant learns one editor, the rest feel familiar.',
        bullets: [
          'Live preview of the actual widget while editing',
          'Full appearance control: colors, fonts, spacing per widget',
          'No code or theme-file editing required for day-to-day configuration',
        ],
      },
      {
        title: 'Storefront enablement is one step',
        content:
          'Each app maps to a single, clearly-labeled step in the Shopify Theme Editor (either "Add Block" for section-based widgets, or "App Embeds" for the Inactive Tab Message) - the admin app links directly to the right place.',
      },
    ],
  },
  {
    slug: 'pricing',
    title: 'Competitive Pricing',
    tagline: 'Pay for what you enable, not what you don\'t use',
    icon: DollarSign,
    color: '#f59e0b',
    sections: [
      {
        title: 'Pay-as-you-need plans',
        content:
          'BusyBuddy has three tiers - Free, Starter, and Advanced - gated by which apps are enabled and how many can run at once, not by usage caps or hidden per-transaction fees.',
        bullets: [
          'Free: Announcement Bar + Inactive Tab Message, 1 app enabled at a time',
          'Starter: adds Bundle Discounts, Buy One Get One, and Volume Discounts, up to 3 apps enabled at once',
          'Advanced: adds Mix & Match, up to 6 apps enabled at once',
          'Star Rating is not part of this toggle/limit system - it\'s available on every plan regardless of how many of the other six apps are enabled',
        ],
      },
      {
        title: 'No surprise changes',
        content:
          'Switching plans (including between two paid plans) always goes through a real Shopify billing confirmation before anything changes - the merchant sees and approves the exact new charge before it takes effect.',
      },
    ],
  },
  {
    slug: 'analytics',
    title: 'Comprehensive Analytics',
    tagline: 'Know what\'s working, per app',
    icon: BarChart3,
    color: '#7367F0',
    sections: [
      {
        title: 'Per-app analytics',
        content:
          'Announcement Bar tracks views and clicks per bar via IntersectionObserver-based view tracking. Discount apps log purchase activity (which bundle/offer, revenue attributed) whenever an order containing a bundled product is paid.',
        bullets: [
          'Recent-activity feed on the dashboard, aggregated across all apps',
          'Quick stats: active bundles, active announcements, events today',
          'Google Analytics integration available for deeper storefront-level tracking',
        ],
      },
    ],
  },
  {
    slug: 'per-app-depth',
    title: 'Per-App Feature Depth',
    tagline: 'Each app is a fully-featured tool on its own',
    icon: Sparkles,
    color: '#ff2d55',
    sections: [
      {
        title: 'Not just a checkbox feature',
        content:
          'Every app in the suite supports real configuration depth: scheduling windows, custom theming, priority ordering when multiple offers could apply, and validation on both the editor and the server so a merchant can\'t accidentally publish a broken offer (e.g. a bundle with no discount value, or an end date before its start date).',
      },
    ],
  },
];

export function getFeature(slug: string) {
  return features.find((f) => f.slug === slug);
}
