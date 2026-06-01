import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecentActivity, getActivityStats } from '../../controller/activity/index.js';

// vi.hoisted so the value is available inside vi.mock factories (which are hoisted above const declarations)
const { MOCK_SHOP_ID } = vi.hoisted(() => ({ MOCK_SHOP_ID: 'shop-object-id-123' }));

// Mock Shop model — controller does Shop.findOne() to resolve the MongoDB _id before calling the service
vi.mock('../../models/shop.model.js', () => ({
  default: {
    findOne: vi.fn().mockResolvedValue({ _id: 'shop-object-id-123', shopDomain: 'test-shop.myshopify.com' }),
  },
}));

// Mock activityLogService
vi.mock('../../services/activityLogService.js', () => ({
  default: {
    getRecentActivities: vi.fn(),
    getQuickStats: vi.fn(),
    formatTimeAgo: vi.fn(() => '2m ago'),
    getIconClass: vi.fn((type) => `icon-${type}`),
  },
}));

import activityLogService from '../../services/activityLogService.js';
import Shop from '../../models/shop.model.js';

const createMockReq = (overrides = {}) => ({
  ...overrides,
});

const createMockRes = (overrides = {}) => {
  const res = {
    locals: {
      shopify: {
        session: { shop: 'test-shop.myshopify.com' },
      },
    },
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    ...overrides,
  };
  return res;
};

describe('Activity Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRecentActivity', () => {
    it('should return 401 if no shop session', async () => {
      const req = createMockReq();
      const res = createMockRes({
        locals: { shopify: { session: null } },
      });

      await getRecentActivity(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ERROR',
        message: 'Unauthorized - No shop session',
      });
    });

    it('should fetch activities and stats in parallel', async () => {
      const mockActivities = [
        { _id: '1', widget: 'bundle', title: 'Test Bundle', type: 'purchase', createdAt: new Date(), amount: 100 },
      ];
      const mockStats = { activeBundles: 5, activeAnnouncements: 3, eventsToday: 10 };

      activityLogService.getRecentActivities.mockResolvedValue(mockActivities);
      activityLogService.getQuickStats.mockResolvedValue(mockStats);

      const req = createMockReq();
      const res = createMockRes();

      await getRecentActivity(req, res);

      // Controller resolves shop domain → MongoDB _id via Shop.findOne, then passes _id to service
      expect(activityLogService.getRecentActivities).toHaveBeenCalledWith(MOCK_SHOP_ID, 20);
      expect(activityLogService.getQuickStats).toHaveBeenCalledWith(MOCK_SHOP_ID);
    });

    it('should format activities with id, widget, title, meta, amount, time, iconClass', async () => {
      const mockActivities = [
        { 
          _id: '1', 
          widget: 'bundle', 
          title: 'Test Bundle', 
          type: 'purchase', 
          meta: 'purchased',
          createdAt: new Date(), 
          amount: 100 
        },
      ];
      const mockStats = { activeBundles: 5, activeAnnouncements: 3, eventsToday: 10 };

      activityLogService.getRecentActivities.mockResolvedValue(mockActivities);
      activityLogService.getQuickStats.mockResolvedValue(mockStats);

      const req = createMockReq();
      const res = createMockRes();

      await getRecentActivity(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: 'SUCCESS',
        data: {
          activities: expect.arrayContaining([
            expect.objectContaining({
              id: '1',
              widget: 'bundle',
              title: 'Test Bundle',
              meta: expect.any(String),
              amount: expect.any(String),
              time: '2m ago',
              iconClass: expect.any(String),
            }),
          ]),
          stats: expect.objectContaining({
            activeBundles: 5,
            activeAnnouncements: 3,
            eventsToday: 10,
          }),
        },
      });
    });

    it('should return 500 on error', async () => {
      activityLogService.getRecentActivities.mockRejectedValue(new Error('Database error'));

      const req = createMockReq();
      const res = createMockRes();

      await getRecentActivity(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ERROR',
        message: 'Failed to fetch activity',
      });
    });
  });

  describe('getActivityStats', () => {
    it('should return 401 if no shop session', async () => {
      const req = createMockReq();
      const res = createMockRes({
        locals: { shopify: { session: null } },
      });

      await getActivityStats(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return quick stats only', async () => {
      const mockStats = { activeBundles: 5, activeAnnouncements: 3, eventsToday: 10 };
      activityLogService.getQuickStats.mockResolvedValue(mockStats);

      const req = createMockReq();
      const res = createMockRes();

      await getActivityStats(req, res);

      expect(activityLogService.getQuickStats).toHaveBeenCalledWith(MOCK_SHOP_ID);
      expect(res.json).toHaveBeenCalledWith({
        status: 'SUCCESS',
        data: {
          activeBundles: 5,
          activeAnnouncements: 3,
          eventsToday: 10,
        },
      });
    });
  });
});

describe('formatActivityMeta helper', () => {
  // Test the internal formatActivityMeta function behavior through getRecentActivity
  it('should return correct label for purchase type', async () => {
    const mockActivities = [
      { _id: '1', widget: 'bundle', title: 'Test', type: 'purchase', createdAt: new Date() },
    ];
    activityLogService.getRecentActivities.mockResolvedValue(mockActivities);
    activityLogService.getQuickStats.mockResolvedValue({ activeBundles: 0, activeAnnouncements: 0, eventsToday: 0 });

    const req = createMockReq();
    const res = createMockRes();

    await getRecentActivity(req, res);

    const response = res.json.mock.calls[0][0];
    expect(response.data.activities[0].meta).toBe('purchased');
  });

  it('should return activity.meta if available', async () => {
    const mockActivities = [
      { _id: '1', widget: 'bundle', title: 'Test', type: 'purchase', meta: 'custom meta', createdAt: new Date() },
    ];
    activityLogService.getRecentActivities.mockResolvedValue(mockActivities);
    activityLogService.getQuickStats.mockResolvedValue({ activeBundles: 0, activeAnnouncements: 0, eventsToday: 0 });

    const req = createMockReq();
    const res = createMockRes();

    await getRecentActivity(req, res);

    const response = res.json.mock.calls[0][0];
    expect(response.data.activities[0].meta).toBe('custom meta');
  });
});
