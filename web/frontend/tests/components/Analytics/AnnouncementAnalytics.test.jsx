import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnnouncementAnalytics from '../../../components/Analytics/AnnouncementAnalytics';

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ data }) => <div data-testid="line-chart" data-has-data={data?.length > 0} />,
  BarChart: ({ data }) => <div data-testid="bar-chart" data-has-data={data?.length > 0} />,
  Line: () => null,
  Bar: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

vi.mock('../../../components/Analytics/GoogleAnalyticsSection', () => ({
  default: () => <div data-testid="google-analytics-section">GoogleAnalyticsSection</div>,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

const mockAnalyticsData = {
  totalViews: 1000,
  totalClicks: 150,
  totalAnnouncementBars: 5,
  activeAnnouncementBars: 3,
  trend: [
    { date: '2026-03-13', views: 100, clicks: 15 },
    { date: '2026-03-14', views: 120, clicks: 18 },
  ],
};

describe('AnnouncementAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty States', () => {
    it('should show main empty state when analytics is null', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: false, data: null }),
        })
      );
      
      renderWithRouter(<AnnouncementAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText(/No Announcement Bar Analytics Data/i)).toBeInTheDocument();
      });
    });

    it('should show empty state message about creating announcement bars', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: false, data: null }),
        })
      );
      
      renderWithRouter(<AnnouncementAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText(/Create announcement bars to see your analytics/i)).toBeInTheDocument();
      });
    });

    it('should show empty state for Performance Trend chart when no data', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { ...mockAnalyticsData, trend: [] },
          }),
        })
      );
      
      renderWithRouter(<AnnouncementAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText(/No trend data available/i)).toBeInTheDocument();
      });
    });

    it('should show empty state for Views vs Clicks chart when all values are 0', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { ...mockAnalyticsData, totalViews: 0, totalClicks: 0 },
          }),
        })
      );
      
      renderWithRouter(<AnnouncementAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText(/No performance data available/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockAnalyticsData }),
        })
      );
    });

    it('should render summary cards', async () => {
      renderWithRouter(<AnnouncementAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Views')).toBeInTheDocument();
        expect(screen.getByText('Total Clicks')).toBeInTheDocument();
      });
    });

    it('should render charts when data is available', async () => {
      renderWithRouter(<AnnouncementAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });

    it('should render GoogleAnalyticsSection', async () => {
      renderWithRouter(<AnnouncementAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByTestId('google-analytics-section')).toBeInTheDocument();
      });
    });
  });

  describe('Time Range Filter', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockAnalyticsData }),
        })
      );
    });

    it('should have time range buttons', async () => {
      renderWithRouter(<AnnouncementAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText('7D')).toBeInTheDocument();
        expect(screen.getByText('30D')).toBeInTheDocument();
        expect(screen.getByText('90D')).toBeInTheDocument();
        expect(screen.getByText('Custom')).toBeInTheDocument();
      });
    });

    it('should refetch data when time range changes', async () => {
      renderWithRouter(<AnnouncementAnalytics />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      const initialCallCount = global.fetch.mock.calls.length;
      
      fireEvent.click(screen.getByText('7D'));
      
      await waitFor(() => {
        expect(global.fetch.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });
  });

  describe('Custom Date Filter', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockAnalyticsData }),
        })
      );
    });

    it('should show date inputs when "Custom" time range selected', async () => {
      renderWithRouter(<AnnouncementAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText('Custom')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Custom'));
      
      await waitFor(() => {
        expect(screen.getByText('From Date')).toBeInTheDocument();
        expect(screen.getByText('To Date')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      global.fetch = vi.fn(() => new Promise(() => {}));
      
      renderWithRouter(<AnnouncementAnalytics />);
      
      expect(screen.getByText(/Loading analytics data/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message on fetch failure', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          text: () => Promise.resolve('Server error'),
        })
      );
      
      renderWithRouter(<AnnouncementAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch analytics/i)).toBeInTheDocument();
      });
    });
  });
});
