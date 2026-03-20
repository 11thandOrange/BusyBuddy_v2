import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BundleAnalytics from '../../../components/Analytics/BundleAnalytics';

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ data }) => <div data-testid="line-chart" data-has-data={data?.length > 0} />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  BarChart: ({ data }) => <div data-testid="bar-chart" data-has-data={data?.length > 0} />,
  Pie: ({ data }) => <div data-testid="pie" data-has-data={data?.length > 0} />,
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
  totalRevenue: 5000,
  totalOrders: 50,
  avgOrderValue: 100,
  totalBundles: 10,
  currency: 'USD',
  topBundles: [
    { name: 'Summer Bundle', revenue: 2000, quantity: 20 },
    { name: 'Winter Bundle', revenue: 1500, quantity: 15 },
  ],
  revenueTrend: [
    { date: '2026-03-13', revenue: 500 },
    { date: '2026-03-14', revenue: 700 },
  ],
  allBundles: [
    { _id: '1', title: 'Summer Bundle', status: true, revenue: 2000, quantity: 20 },
    { _id: '2', title: 'Winter Bundle', status: false, revenue: 1500, quantity: 15 },
  ],
};

describe('BundleAnalytics', () => {
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
      
      renderWithRouter(<BundleAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText(/No Bundle Analytics Data/i)).toBeInTheDocument();
      });
    });

    it('should show empty state message about creating bundles', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: false, data: null }),
        })
      );
      
      renderWithRouter(<BundleAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText(/Create bundles and make sales/i)).toBeInTheDocument();
      });
    });

    it('should show empty state for Revenue Trend chart when no data', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { ...mockAnalyticsData, revenueTrend: [] },
          }),
        })
      );
      
      renderWithRouter(<BundleAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText(/No revenue trend data available/i)).toBeInTheDocument();
      });
    });

    it('should show empty state for Bundle Distribution pie chart when no data', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { ...mockAnalyticsData, topBundles: [] },
          }),
        })
      );
      
      renderWithRouter(<BundleAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText(/No bundle data available/i)).toBeInTheDocument();
      });
    });

    it('should show empty state for Bundle Performance bar chart when no data', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { ...mockAnalyticsData, topBundles: [] },
          }),
        })
      );
      
      renderWithRouter(<BundleAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText(/No performance data available/i)).toBeInTheDocument();
      });
    });

    it('should show "No bundles found" in table when allBundles is empty', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { ...mockAnalyticsData, allBundles: [] },
          }),
        })
      );
      
      renderWithRouter(<BundleAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText(/No bundles found/i)).toBeInTheDocument();
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

    it('should render summary cards with correct values', async () => {
      renderWithRouter(<BundleAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        expect(screen.getByText('Total Orders')).toBeInTheDocument();
      });
    });

    it('should render charts when data is available', async () => {
      renderWithRouter(<BundleAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });

    it('should render GoogleAnalyticsSection', async () => {
      renderWithRouter(<BundleAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByTestId('google-analytics-section')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      global.fetch = vi.fn(() => new Promise(() => {})); // Never resolves
      
      renderWithRouter(<BundleAnalytics />);
      
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
      
      renderWithRouter(<BundleAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch analytics/i)).toBeInTheDocument();
      });
    });
  });
});
