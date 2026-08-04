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
  { id: '1', widget: 'bundle', title: 'Summer Bundle', meta: 'purchased', time: '2m ago', iconClass: 'text-success' },
  { id: '2', widget: 'announcement', title: 'Free Shipping', meta: 'viewed', time: '5m ago', iconClass: 'text-primary' },
];

const mockStats = {
  activeBundles: 3,
  activeAnnouncements: 2,
  eventsToday: 15,
};

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
    'inactive-tab-message',
    'bundle-discount',
    'buy-one-get-one',
    'volume-discounts',
    'mix-and-match',
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

function mockFetchWith({ planName = 'Advanced', enabledApps = [], summary = emptySummary } = {}) {
  return vi.fn((url) => {
    if (url && url.includes('/api/activity/recent')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'SUCCESS',
          data: { activities: mockActivities, stats: mockStats },
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

      fireEvent.click(screen.getByText('30D'));

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

  describe('Recent Activity Card', () => {
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

    it('should display stats', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText('Active Bundles')).toBeInTheDocument();
        expect(screen.getByText('Active Bars')).toBeInTheDocument();
      });
    });

    it('should show empty state when no activities', async () => {
      global.fetch = vi.fn((url) => {
        if (url && url.includes('/api/activity/recent')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              status: 'SUCCESS',
              data: { activities: [], stats: { activeBundles: 0, activeAnnouncements: 0, eventsToday: 0 } },
            }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'SUCCESS', data: { planName: 'Advanced', enabled: true } }) });
      });

      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText(/No activity yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Layout', () => {
    it('should render "Your Widgets" header', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText('Your Widgets')).toBeInTheDocument();
      });
    });

    it('should render "Recent Activity" header', async () => {
      renderWithRouter(<DashboardHome />);

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });
    });
  });
});
