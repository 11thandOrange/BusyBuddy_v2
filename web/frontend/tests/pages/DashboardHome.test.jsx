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
  AreaChart: () => <div data-testid="area-chart" />,
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

describe('DashboardHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn((url) => {
      if (url && url.includes('/api/activity/recent')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: 'SUCCESS',
            data: { activities: mockActivities, stats: mockStats },
          }),
        });
      }
      // Subscription and other calls — return safe defaults
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'SUCCESS', data: {} }),
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

    it('should show Active/Inactive status badge for each widget', async () => {
      renderWithRouter(<DashboardHome />);
      
      await waitFor(() => {
        const statusBadges = document.querySelectorAll('.status-indicator');
        expect(statusBadges.length).toBeGreaterThan(0);
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
      // useNavigate is already mocked globally in tests/setup.js
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
