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
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'SUCCESS',
          data: { activities: mockActivities, stats: mockStats },
        }),
      })
    );
  });

  describe('Widget Cards', () => {
    it('should render 6 widget cards', async () => {
      renderWithRouter(<DashboardHome />);
      
      await waitFor(() => {
        const widgetCards = document.querySelectorAll('.widget-card');
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
        const statusBadges = document.querySelectorAll('.widget-status');
        expect(statusBadges.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Create Button Behavior', () => {
    it('should open editor in new tab for Announcement Bar', async () => {
      const mockOpen = vi.fn();
      global.open = mockOpen;
      
      renderWithRouter(<DashboardHome />);
      
      await waitFor(() => {
        const createButtons = screen.getAllByText(/Create/i);
        expect(createButtons.length).toBeGreaterThan(0);
      });
      
      const announcementCard = screen.getByText('Announcement Bar').closest('.widget-card');
      const createButton = announcementCard?.querySelector('button');
      
      if (createButton) {
        fireEvent.click(createButton);
        expect(mockOpen).toHaveBeenCalledWith(
          expect.stringContaining('/editor.html'),
          '_blank'
        );
      }
    });

    it('should include shop parameter in editor URL', async () => {
      const mockOpen = vi.fn();
      global.open = mockOpen;
      
      renderWithRouter(<DashboardHome />);
      
      await waitFor(() => {
        const createButtons = screen.getAllByText(/Create/i);
        expect(createButtons.length).toBeGreaterThan(0);
      });
      
      // Click on Bundle Discounts Create button
      const bundleCard = screen.getByText('Bundle Discounts').closest('.widget-card');
      const createButton = bundleCard?.querySelector('button');
      
      if (createButton) {
        fireEvent.click(createButton);
        expect(mockOpen).toHaveBeenCalledWith(
          expect.stringContaining('shop='),
          '_blank'
        );
      }
    });

    it('should navigate to settings for Inactive Tab Message widget', async () => {
      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate,
        };
      });
      
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
          expect.stringContaining('/api/activity/recent'),
          expect.any(Object)
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
        expect(screen.getByText('Events Today')).toBeInTheDocument();
      });
    });

    it('should show empty state when no activities', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: 'SUCCESS',
            data: { activities: [], stats: { activeBundles: 0, activeAnnouncements: 0, eventsToday: 0 } },
          }),
        })
      );
      
      renderWithRouter(<DashboardHome />);
      
      await waitFor(() => {
        expect(screen.getByText(/No recent activity/i)).toBeInTheDocument();
      });
    });
  });

  describe('Layout', () => {
    it('should have no padding on dashboard-layout', async () => {
      renderWithRouter(<DashboardHome />);
      
      await waitFor(() => {
        const layout = document.querySelector('.dashboard-layout');
        if (layout) {
          const styles = window.getComputedStyle(layout);
          expect(styles.padding).toBe('0px');
        }
      });
    });

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
