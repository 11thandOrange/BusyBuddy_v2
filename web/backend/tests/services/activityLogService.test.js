import { describe, it, expect, vi, beforeEach } from 'vitest';

// ActivityLog uses new Model({}).save() — mock as a constructor
const mockSave = vi.fn().mockResolvedValue({ _id: '123' });
const MockActivityLog = vi.fn().mockImplementation((data) => ({ ...data, save: mockSave }));
MockActivityLog.find = vi.fn().mockReturnThis();
MockActivityLog.sort = vi.fn().mockReturnThis();
MockActivityLog.limit = vi.fn().mockReturnThis();
MockActivityLog.lean = vi.fn().mockResolvedValue([]);
MockActivityLog.aggregate = vi.fn().mockResolvedValue([]);

vi.mock('../../models/activityLog.model.js', () => ({ default: MockActivityLog }));

vi.mock('../../models/bundle.model.js', () => ({
  default: { countDocuments: vi.fn() },
}));

vi.mock('../../models/announcementBar.model.js', () => ({
  default: { countDocuments: vi.fn() },
}));

import activityLogService from '../../services/activityLogService.js';
import ActivityLog from '../../models/activityLog.model.js';
import Bundle from '../../models/bundle.model.js';
import AnnouncementBar from '../../models/announcementBar.model.js';

describe('activityLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-apply defaults after clearAllMocks
    MockActivityLog.find.mockReturnThis();
    MockActivityLog.sort.mockReturnThis();
    MockActivityLog.limit.mockReturnThis();
    MockActivityLog.lean.mockResolvedValue([]);
    MockActivityLog.aggregate.mockResolvedValue([]);
    mockSave.mockResolvedValue({ _id: '123' });
  });

  describe('logActivity', () => {
    it('should instantiate ActivityLog with required fields', async () => {
      await activityLogService.logActivity({
        shopId: 'test-shop.myshopify.com',
        type: 'purchase',
        widget: 'bundle',
        title: 'Summer Bundle',
      });

      expect(MockActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          shopId: 'test-shop.myshopify.com',
          type: 'purchase',
          widget: 'bundle',
          title: 'Summer Bundle',
        })
      );
      expect(mockSave).toHaveBeenCalled();
    });

    it('should include optional fields when provided', async () => {
      await activityLogService.logActivity({
        shopId: 'test-shop.myshopify.com',
        type: 'purchase',
        widget: 'bundle',
        title: 'Summer Bundle',
        amount: 99.99,
        orderId: 'order-123',
        discountCode: 'SUMMER20',
      });

      expect(MockActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 99.99,
          orderId: 'order-123',
          discountCode: 'SUMMER20',
        })
      );
    });

    it('should not throw if save fails', async () => {
      mockSave.mockRejectedValueOnce(new Error('DB error'));
      await expect(
        activityLogService.logActivity({ shopId: 'shop', type: 'view', widget: 'bundle', title: 'Test' })
      ).resolves.toBeNull();
    });
  });

  describe('getRecentActivities', () => {
    it('should filter by shopId and customer event types', async () => {
      await activityLogService.getRecentActivities('test-shop.myshopify.com', 20);

      expect(ActivityLog.find).toHaveBeenCalledWith(
        expect.objectContaining({
          shopId: 'test-shop.myshopify.com',
          type: { $in: ['view', 'click', 'purchase'] },
        })
      );
    });

    it('should sort by createdAt descending', async () => {
      await activityLogService.getRecentActivities('test-shop.myshopify.com', 20);
      expect(ActivityLog.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should apply the limit', async () => {
      await activityLogService.getRecentActivities('test-shop.myshopify.com', 15);
      expect(ActivityLog.limit).toHaveBeenCalledWith(15);
    });
  });

  describe('getQuickStats', () => {
    beforeEach(() => {
      Bundle.countDocuments.mockResolvedValue(5);
      AnnouncementBar.countDocuments.mockResolvedValue(3);
      // getQuickStats uses aggregate for usage stats
      MockActivityLog.aggregate.mockResolvedValue([{ eventsToday: 10, revenueToday: 50 }]);
    });

    it('should count active bundles by shopId and status', async () => {
      const stats = await activityLogService.getQuickStats('test-shop.myshopify.com');

      expect(Bundle.countDocuments).toHaveBeenCalledWith({
        shopId: 'test-shop.myshopify.com',
        status: true,
      });
      expect(stats.activeBundles).toBe(5);
    });

    it('should count active announcements by shopId and status', async () => {
      const stats = await activityLogService.getQuickStats('test-shop.myshopify.com');

      expect(AnnouncementBar.countDocuments).toHaveBeenCalledWith({
        shopId: 'test-shop.myshopify.com',
        status: 'active',
      });
      expect(stats.activeAnnouncements).toBe(3);
    });

    it('should use aggregate to compute eventsToday and revenueToday', async () => {
      const stats = await activityLogService.getQuickStats('test-shop.myshopify.com');

      expect(ActivityLog.aggregate).toHaveBeenCalled();
      expect(stats.eventsToday).toBe(10);
      expect(stats.revenueToday).toBe(50);
    });

    it('should return zeros when aggregate returns no results', async () => {
      MockActivityLog.aggregate.mockResolvedValueOnce([]);
      const stats = await activityLogService.getQuickStats('test-shop.myshopify.com');
      expect(stats.eventsToday).toBe(0);
      expect(stats.revenueToday).toBe(0);
    });
  });

  describe('formatTimeAgo', () => {
    it('should return "Just now" for recent times (< 1 minute)', () => {
      const result = activityLogService.formatTimeAgo(new Date());
      expect(result).toBe('Just now');
    });

    it('should return "Xm ago" for minutes', () => {
      const result = activityLogService.formatTimeAgo(new Date(Date.now() - 5 * 60 * 1000));
      expect(result).toBe('5m ago');
    });

    it('should return "Xh ago" for hours', () => {
      const result = activityLogService.formatTimeAgo(new Date(Date.now() - 2 * 60 * 60 * 1000));
      expect(result).toBe('2h ago');
    });

    it('should return "Yesterday" for 24-48 hours ago', () => {
      const result = activityLogService.formatTimeAgo(new Date(Date.now() - 25 * 60 * 60 * 1000));
      expect(result).toBe('Yesterday');
    });

    it('should return "Xd ago" for older dates', () => {
      const result = activityLogService.formatTimeAgo(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));
      expect(result).toBe('3d ago');
    });
  });

  describe('getIconClass', () => {
    it('should return "revenue" for purchase type', () => {
      expect(activityLogService.getIconClass('purchase')).toBe('revenue');
    });

    it('should return "views" for view type', () => {
      expect(activityLogService.getIconClass('view')).toBe('views');
    });

    it('should return "clicks" for click type', () => {
      expect(activityLogService.getIconClass('click')).toBe('clicks');
    });

    it('should return "default" for unknown type', () => {
      expect(activityLogService.getIconClass('unknown')).toBe('default');
    });
  });
});
