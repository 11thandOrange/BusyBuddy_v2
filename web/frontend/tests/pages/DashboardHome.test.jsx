import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardHome from '../../pages/DashboardHome';

// Mock components
vi.mock('../../components', () => ({
  QueryProvider: ({ children }) => children,
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

const mockActivities = [
  { id: '1', widget: 'bundle', title: 'Summer Bundle', meta: 'purchased', time: '2m ago', amount: '$35' },
  { id: '2', widget: 'announcement', title: 'Free Shipping', meta: 'viewed', time: '5m ago' },
];

const subscriptionConfig = {
  Free: {
    maxApps: 1,
    allowedApps: ['announcement_bar', 'inactive_tab'],
  },
  Starter: {
    maxApps: 3,
    allowedApps: ['announcement_bar', 'inactive_tab', 'bundle_discount', 'buy_one_get_one', 'volume_discounts'],
  },
  Advanced: {
    maxApps: 6,
    allowedApps: [
      'announcement_bar',
      'inactive_tab',
      'bundle_discount',
      'buy_one_get_one',
      'volume_discounts',
      'mix_match',
    ],
  },
};

const emptySummary = {
  range: '7d',
  revenue: { amount: 0, hasData: false, change: null, trend: [] },
  avgOrderValue: null,
  purchaseCount: 0,
  impressions: { hasData: false, views: 0, clicks: 0, ctr: null, trackedWidgetIds: ['announcement-bar'] },
  widgets: [
    'announcement-bar',
    'bundle-discount',
    'buy-one-get-one',
    'volume-discounts',
    'mix-and-match',
    'inactive-tab-message',
  ].map((id) => ({
    id,
    revenue: { amount: 0, purchaseCount: 0, hasData: false, trend: [] },
    impressions: {
      tracked: id === 'announcement-bar',
      hasData: false,
      views: id === 'announcement-bar' ? 0 : null,
      clicks: id === 'announcement-bar' ? 0 : null,
      ctr: null,
    },
  })),
};

function mockFetchWith({ planName = 'Advanced', enabledApps = [], summary = emptySummary, activities = mockActivities } = {}) {
  return vi.fn((url) => {
    if (url && url.includes('/api/activity/recent')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'SUCCESS',
          data: { activities, stats: {} },
        }),
      });
    }
    if (url && url.includes('/api/dashboard/summary')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'SUCCESS', data: summary }),
      });
    }
    if (url && url.includes('/api/subscription/getUserSubscription')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'SUCCESS',
          data: {
            planName,
            maxAppsAllowed: subscriptionConfig[planName].maxApps,
            enabledAppsCount: enabledApps.filter((a) => a.enabled).length,
            enabledApps,
            subscriptionConfig,
          },
        }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ status: 'SUCCESS', data: {} }),
    });
  });
}

describe('DashboardHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetchWith({
      planName: 'Advanced',
      enabledApps: [
        { appId: 'announcement_bar', enabled: true },
        { appId: 'bundle_discount', enabled: true },
        { appId: 'buy_one_get_one', enabled: false },
      ],
    });
  });

  describe('Header', () => {
    it('should not render its own header bar (Shopify\'s page header is the only one)', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(document.querySelector('.app-header')).toBeNull();
        expect(document.querySelector('.app-frame')).toBeNull();
        expect(screen.queryByText('BusyBuddy')).not.toBeInTheDocument();
        expect(screen.queryByText('Home')).not.toBeInTheDocument();
      });
    });

    it('should render the range pills and Help link inside the hero band', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const heroBand = document.querySelector('.hero-band');
        expect(heroBand.querySelector('.hero-controls-row')).toBeTruthy();
        expect(screen.getByText('7d')).toBeInTheDocument();
        expect(screen.getByText('30d')).toBeInTheDocument();
        expect(screen.getByText('90d')).toBeInTheDocument();
        expect(screen.getByText('Help')).toBeInTheDocument();
      });
    });
  });

  describe('Widget Cards', () => {
    it('should render 6 widget cards', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const widgetCards = document.querySelectorAll('.widget-tile');
        expect(widgetCards.length).toBe(6);
      });
    });

    it('should display correct widget names', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText('Announcement Bar')).toBeInTheDocument();
        expect(screen.getByText('Bundle Discounts')).toBeInTheDocument();
        expect(screen.getByText('Buy One Get One')).toBeInTheDocument();
        expect(screen.getByText('Volume Discounts')).toBeInTheDocument();
        expect(screen.getByText('Mix & Match')).toBeInTheDocument();
        expect(screen.getByText('Inactive Tab Message')).toBeInTheDocument();
      });
    });

    it('should use a snooze emoji (not a clock icon) for Inactive Tab Message', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const card = screen.getByText('Inactive Tab Message').closest('.widget-tile');
        expect(card.querySelector('.icon-emoji')?.textContent).toBe('💤');
        expect(card.querySelector('.widget-icon-large svg')).toBeNull();
      });
    });

    it('should show a truthful status badge per widget: active, paused, needs setup', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const statusBadges = document.querySelectorAll('.status-indicator');
        expect(statusBadges.length).toBe(6);
      });

      // announcement_bar: enabled: true
      const announcementCard = screen.getByText('Announcement Bar').closest('.widget-tile');
      expect(announcementCard.querySelector('.status-indicator.active')).toBeTruthy();

      // buy_one_get_one: enabled: false (has a toggle entry -> paused, not "locked")
      const bogoCard = screen.getByText('Buy One Get One').closest('.widget-tile');
      expect(bogoCard.querySelector('.status-indicator.paused')).toBeTruthy();

      // volume_discounts: no entry at all -> needs setup
      const volumeCard = screen.getByText('Volume Discounts').closest('.widget-tile');
      expect(volumeCard.querySelector('.status-indicator.not-set-up')).toBeTruthy();
      expect(screen.getAllByText('Needs setup').length).toBeGreaterThan(0);
    });

    it('should lock widgets that are not included on the current plan', async () => {
      global.fetch = mockFetchWith({ planName: 'Free', enabledApps: [{ appId: 'announcement_bar', enabled: true }] });
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const bundleCard = screen.getByText('Bundle Discounts').closest('.widget-tile');
        expect(bundleCard.querySelector('.status-indicator.locked')).toBeTruthy();
      });
    });
  });

  describe('Widget performance metrics', () => {
    const summaryWithData = {
      ...emptySummary,
      widgets: emptySummary.widgets.map((w) => {
        if (w.id === 'bundle-discount') {
          return {
            ...w,
            revenue: { amount: 240, purchaseCount: 3, hasData: true, trend: [{ date: '2026-08-01', revenue: 240 }] },
          };
        }
        if (w.id === 'announcement-bar') {
          return {
            ...w,
            impressions: { tracked: true, hasData: true, views: 5000, clicks: 150, ctr: 3 },
          };
        }
        return w;
      }),
    };

    it('should show real revenue for a widget with attributed purchases', async () => {
      global.fetch = mockFetchWith({ summary: summaryWithData });
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const bundleCard = screen.getByText('Bundle Discounts').closest('.widget-tile');
        expect(bundleCard.textContent).toContain('$240');
      });
    });

    it('should show a "not tracked" note instead of a fake CTR for widgets without impression tracking', async () => {
      global.fetch = mockFetchWith({ summary: summaryWithData });
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const bundleCard = screen.getByText('Bundle Discounts').closest('.widget-tile');
        expect(bundleCard.textContent).toMatch(/not tracked/i);
      });
    });

    it('should show real impressions/CTR for the announcement bar', async () => {
      global.fetch = mockFetchWith({ summary: summaryWithData });
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const announcementCard = screen.getByText('Announcement Bar').closest('.widget-tile');
        expect(announcementCard.textContent).toContain('5.0k');
        expect(announcementCard.textContent).toContain('3.0%');
      });
    });

    it('should show an explicit no-data message when nothing has happened for a widget yet', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const volumeCard = screen.getByText('Volume Discounts').closest('.widget-tile');
        expect(volumeCard.textContent).toMatch(/no activity recorded/i);
      });
    });
  });

  describe('Widget card layout', () => {
    it('should keep Create/Manage buttons at the bottom of the card whether or not a sparkline is shown', async () => {
      const summary = {
        ...emptySummary,
        widgets: emptySummary.widgets.map((w) =>
          w.id === 'bundle-discount'
            ? { ...w, revenue: { amount: 240, purchaseCount: 3, hasData: true, trend: [{ date: '2026-08-01', revenue: 240 }] } }
            : w
        ),
      };
      global.fetch = mockFetchWith({ summary });
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        // Bundle Discounts has a sparkline (real revenue data); Volume Discounts has none.
        const bundleCard = screen.getByText('Bundle Discounts').closest('.widget-tile');
        const volumeCard = screen.getByText('Volume Discounts').closest('.widget-tile');
        expect(bundleCard.querySelector('.widget-buttons')).toBeTruthy();
        expect(volumeCard.querySelector('.widget-buttons')).toBeTruthy();
        // Both button rows are the last element in their card, so they land at the
        // bottom regardless of how much metrics content precedes them.
        expect(bundleCard.lastElementChild.className).toContain('widget-buttons');
        expect(volumeCard.lastElementChild.className).toContain('widget-buttons');
      });
    });
  });

  describe('Hero metrics band', () => {
    it('should show an explicit no-data message instead of a fabricated $0 when there is no revenue', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText(/No attributed revenue recorded in this period yet/i)).toBeInTheDocument();
      });
    });

    it('should show real attributed revenue and a change badge when data exists', async () => {
      global.fetch = mockFetchWith({
        summary: {
          ...emptySummary,
          revenue: { amount: 1200, hasData: true, change: { pct: 25, kind: 'up' }, trend: [{ date: '2026-08-01', revenue: 1200 }] },
          avgOrderValue: 400,
          purchaseCount: 3,
        },
      });
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText('$1,200')).toBeInTheDocument();
        expect(screen.getByText('+25.0%')).toBeInTheDocument();
        expect(screen.getByText('$400')).toBeInTheDocument();
      });
    });

    it('should show the real active-widget count from the subscription API', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const activeWidgetsTile = screen.getByText('Active widgets').closest('.hero-tile');
        expect(activeWidgetsTile.querySelector('.hero-value').textContent).toBe('2 / 6');
        expect(activeWidgetsTile.textContent).toContain('Advanced plan');
      });
    });

    it('should refetch dashboard summary when the date range changes', async () => {
      const fetchedUrl = (n) => global.fetch.mock.calls.some((call) => call[0].includes(n));
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(fetchedUrl('range=7d')).toBe(true);
      });

      fireEvent.click(screen.getByText('30d'));

      await waitFor(() => {
        expect(fetchedUrl('range=30d')).toBe(true);
      });
    });
  });

  describe('Create Button Behavior', () => {
    it('should have a Create button on the Announcement Bar widget card', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const announcementCard = screen.getByText('Announcement Bar').closest('.widget-tile');
        const createButton = announcementCard?.querySelector('.widget-btn.create');
        expect(createButton).toBeTruthy();
      });
    });

    it('should have a Create button on the Bundle Discounts widget card', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const bundleCard = screen.getByText('Bundle Discounts').closest('.widget-tile');
        const createButton = bundleCard?.querySelector('.widget-btn.create');
        expect(createButton).toBeTruthy();
      });
    });

    it('should render the Inactive Tab Message widget card', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText('Inactive Tab Message')).toBeInTheDocument();
      });
    });
  });

  describe('Manage Button Behavior', () => {
    it('should have Manage buttons for all widgets', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        const manageButtons = screen.getAllByText('Manage');
        expect(manageButtons.length).toBe(6);
      });
    });
  });

  describe('Live activity rail', () => {
    it('should fetch activities from /api/activity/recent on mount', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/activity/recent')
        );
      });
    });

    it('should display activity list when data is loaded', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText('Summer Bundle')).toBeInTheDocument();
        expect(screen.getByText('Free Shipping')).toBeInTheDocument();
      });
    });

    it('should render a Streaming tag next to Live activity', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText('Live activity')).toBeInTheDocument();
        expect(screen.getByText('Streaming')).toBeInTheDocument();
      });
    });

    it('should render every fetched activity without a "View all" button', async () => {
      const manyActivities = Array.from({ length: 7 }, (_, i) => ({
        id: String(i),
        widget: 'bundle',
        title: `Event ${i}`,
        meta: 'purchased',
        time: `${i}m ago`,
      }));
      global.fetch = mockFetchWith({ activities: manyActivities });
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText('Event 0')).toBeInTheDocument();
        expect(screen.getByText('Event 6')).toBeInTheDocument();
      });

      expect(screen.queryByText('View all activity')).not.toBeInTheDocument();
    });

    it('should show empty state when no activities', async () => {
      global.fetch = mockFetchWith({ activities: [] });

      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText(/No activity yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Layout', () => {
    it('should render "Your widgets" header', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText('Your widgets')).toBeInTheDocument();
      });
    });

    it('should render "Live activity" header', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText('Live activity')).toBeInTheDocument();
      });
    });
  });
});
