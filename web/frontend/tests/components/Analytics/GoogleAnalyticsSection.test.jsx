import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GoogleAnalyticsSection from '../../../components/Analytics/GoogleAnalyticsSection';

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('GoogleAnalyticsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Code Quality', () => {
    it('should NOT reference undefined authenticatedFetch', async () => {
      // This test ensures the fix for the crash is maintained
      // The component should work without authenticatedFetch in useCallback deps
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { isConnected: false } }),
        })
      );
      
      // Should not throw error during render
      expect(() => {
        renderWithRouter(<GoogleAnalyticsSection />);
      }).not.toThrow();
    });
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      global.fetch = vi.fn(() => new Promise(() => {}));
      
      renderWithRouter(<GoogleAnalyticsSection />);
      
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });
  });

  describe('Empty State (Not Connected)', () => {
    it('should show empty state when not connected', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { isConnected: false },
          }),
        })
      );
      
      renderWithRouter(<GoogleAnalyticsSection />);
      
      await waitFor(() => {
        expect(screen.getByText(/Connect Google Analytics/i)).toBeInTheDocument();
      });
    });

    it('should show connect button when not connected', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { isConnected: false },
          }),
        })
      );
      
      renderWithRouter(<GoogleAnalyticsSection />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Connect/i })).toBeInTheDocument();
      });
    });
  });

  describe('Connected State', () => {
    const mockGAData = {
      isConnected: true,
      data: {
        sessions: 1000,
        users: 500,
        pageViews: 2500,
        bounceRate: 45,
        trend: [
          { date: '2026-03-13', sessions: 100, users: 50 },
          { date: '2026-03-14', sessions: 120, users: 60 },
        ],
      },
    };

    beforeEach(() => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockGAData }),
        })
      );
    });

    it('should fetch connection status on mount', async () => {
      renderWithRouter(<GoogleAnalyticsSection />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/analytics/google'),
          expect.any(Object)
        );
      });
    });

    it('should display GA metrics when connected', async () => {
      renderWithRouter(<GoogleAnalyticsSection />);
      
      await waitFor(() => {
        expect(screen.getByText('Sessions')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          text: () => Promise.resolve('Server error'),
        })
      );
      
      // Should not throw
      expect(() => {
        renderWithRouter(<GoogleAnalyticsSection />);
      }).not.toThrow();
    });
  });

  describe('Time Range Prop', () => {
    it('should refetch data when timeRange changes', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { isConnected: true, data: {} },
          }),
        })
      );
      
      const { rerender } = renderWithRouter(<GoogleAnalyticsSection timeRange="7d" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      const initialCallCount = global.fetch.mock.calls.length;
      
      rerender(
        <BrowserRouter>
          <GoogleAnalyticsSection timeRange="30d" />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(global.fetch.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });
  });
});
