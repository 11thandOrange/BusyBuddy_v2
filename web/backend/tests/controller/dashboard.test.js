import { describe, it, expect, vi, beforeEach } from 'vitest';

const { MockActivityLog } = vi.hoisted(() => {
  const MockActivityLog = { aggregate: vi.fn() };
  return { MockActivityLog };
});

vi.mock('../../models/activityLog.model.js', () => ({ default: MockActivityLog }));

import { getDashboardSummary } from '../../controller/dashboard/index.js';

const createMockReq = (query = {}) => ({ query });

const createMockRes = (overrides = {}) => ({
  locals: {
    shopify: {
      session: { shop: 'test-shop.myshopify.com' },
    },
  },
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  ...overrides,
});

describe('getDashboardSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no shop session', async () => {
    const req = createMockReq();
    const res = createMockRes({ locals: { shopify: { session: null } } });

    await getDashboardSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ERROR',
      message: 'Unauthorized - No shop session',
    });
  });

  it('should report no data (not zero-as-fact) when nothing has been logged yet', async () => {
    MockActivityLog.aggregate.mockResolvedValue([]);

    const req = createMockReq({ range: '7d' });
    const res = createMockRes();

    await getDashboardSummary(req, res);

    const response = res.json.mock.calls[0][0];
    expect(response.status).toBe('SUCCESS');
    expect(response.data.revenue.hasData).toBe(false);
    expect(response.data.revenue.amount).toBe(0);
    expect(response.data.revenue.change).toBeNull();
    expect(response.data.avgOrderValue).toBeNull();
    expect(response.data.impressions.hasData).toBe(false);

    const announcement = response.data.widgets.find((w) => w.id === 'announcement-bar');
    expect(announcement.impressions.tracked).toBe(true);
    expect(announcement.impressions.hasData).toBe(false);
    expect(announcement.impressions.views).toBe(0);

    const bundle = response.data.widgets.find((w) => w.id === 'bundle-discount');
    expect(bundle.impressions.tracked).toBe(false);
    expect(bundle.impressions.views).toBeNull();
    expect(bundle.impressions.ctr).toBeNull();
    expect(bundle.revenue.hasData).toBe(false);
  });

  it('should default an unknown range to 7d', async () => {
    MockActivityLog.aggregate.mockResolvedValue([]);
    const req = createMockReq({ range: 'not-a-range' });
    const res = createMockRes();

    await getDashboardSummary(req, res);

    expect(res.json.mock.calls[0][0].data.range).toBe('7d');
  });

  it('should populate real per-widget revenue and impressions from ActivityLog', async () => {
    // Order of ActivityLog.aggregate() calls: current totals, previous totals, daily revenue trend
    MockActivityLog.aggregate
      .mockResolvedValueOnce([
        { _id: 'bundle', revenue: 500, purchaseCount: 4, views: 0, clicks: 0 },
        { _id: 'announcement', revenue: 0, purchaseCount: 0, views: 1000, clicks: 40 },
      ])
      .mockResolvedValueOnce([{ _id: 'bundle', revenue: 200, purchaseCount: 2, views: 0, clicks: 0 }])
      .mockResolvedValueOnce([
        { _id: { widget: 'bundle', day: '2026-08-01' }, revenue: 500 },
      ]);

    const req = createMockReq({ range: '30d' });
    const res = createMockRes();

    await getDashboardSummary(req, res);

    const response = res.json.mock.calls[0][0];
    expect(response.data.revenue.amount).toBe(500);
    expect(response.data.revenue.hasData).toBe(true);
    expect(response.data.revenue.change).toEqual({ pct: 150, kind: 'up' });
    expect(response.data.avgOrderValue).toBe(125);

    const bundle = response.data.widgets.find((w) => w.id === 'bundle-discount');
    expect(bundle.revenue.amount).toBe(500);
    expect(bundle.revenue.purchaseCount).toBe(4);
    expect(bundle.revenue.hasData).toBe(true);
    expect(bundle.revenue.trend).toEqual([{ date: '2026-08-01', revenue: 500 }]);

    const announcement = response.data.widgets.find((w) => w.id === 'announcement-bar');
    expect(announcement.impressions.views).toBe(1000);
    expect(announcement.impressions.clicks).toBe(40);
    expect(announcement.impressions.ctr).toBe(4);
    expect(response.data.impressions.views).toBe(1000);
    expect(response.data.impressions.ctr).toBe(4);
  });

  it('should mark revenue change as "new" when there was no revenue in the prior period', async () => {
    MockActivityLog.aggregate
      .mockResolvedValueOnce([{ _id: 'bundle', revenue: 100, purchaseCount: 1, views: 0, clicks: 0 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const req = createMockReq({ range: '7d' });
    const res = createMockRes();

    await getDashboardSummary(req, res);

    const response = res.json.mock.calls[0][0];
    expect(response.data.revenue.change).toEqual({ pct: null, kind: 'new' });
  });

  it('should return 500 on error', async () => {
    MockActivityLog.aggregate.mockRejectedValue(new Error('Database error'));

    const req = createMockReq();
    const res = createMockRes();

    await getDashboardSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ERROR',
      message: 'Failed to fetch dashboard summary',
    });
  });
});
