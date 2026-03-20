import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock mongoose models before importing service
vi.mock('../../models/activityLog.model.js', () => ({
  default: {
    create: vi.fn(),
    find: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('../../models/bundle.model.js', () => ({
  default: {
    countDocuments: vi.fn(),
  },
}));

vi.mock('../../models/announcementBar.model.js', () => ({
  default: {
    countDocuments: vi.fn(),
  },
}));

import activityLogService from '../../services/activityLogService.js';
import ActivityLog from '../../models/activityLog.model.js';
import Bundle from '../../models/bundle.model.js';
import AnnouncementBar from '../../models/announcementBar.model.js';

describe('activityLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logActivity', () => {
    it('should create ActivityLog document with required fields', async () => {
      ActivityLog.create.mockResolvedValue({ _id: '123' });

      await activityLogService.logActivity({
        shopId: 'test-shop.myshopify.com',
        type: 'purchase',
        widget: 'bundle',
        title: 'Summer Bundle',
      });

      expect(ActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          shopId: 'test-shop.myshopify.com',
          type: 'purchase',
          widget: 'bundle',
          title: 'Summer Bundle',
        })
      );
    });

    it('should handle optional fields (amount, orderId, discountCode)', async () => {
      ActivityLog.create.mockResolvedValue({ _id: '123' });

      await activityLogService.logActivity({
        shopId: 'test-shop.myshopify.com',
        type: 'purchase',
        widget: 'bundle',
        title: 'Summer Bundle',
        amount: 99.99,
        orderId: 'order-123',
        discountCode: 'SUMMER20',
      });

      expect(ActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 99.99,
          orderId: 'order-123',
          discountCode: 'SUMMER20',
        })
      );
    });
  });

  describe('getRecentActivities', () => {
    it('should filter by shopId', async () => {
      ActivityLog.find.mockReturnThis();
      ActivityLog.sort.mockReturnThis();
      ActivityLog.limit.mockReturnThis();
      ActivityLog.lean.mockResolvedValue([]);

      await activityLogService.getRecentActivities('test-shop.myshopify.com', 20);

      expect(ActivityLog.find).toHaveBeenCalledWith(
        expect.objectContaining({
          shopId: 'test-shop.myshopify.com',
        })
      );
    });

    it('should filter by customer event types (view, click, purchase)', async () => {
      ActivityLog.find.mockReturnThis();
      ActivityLog.sort.mockReturnThis();
      ActivityLog.limit.mockReturnThis();
      ActivityLog.lean.mockResolvedValue([]);

      await activityLogService.getRecentActivities('test-shop.myshopify.com', 20);

      expect(ActivityLog.find).toHaveBeenCalledWith(
        expect.objectContaining({
          type: { $in: ['view', 'click', 'purchase'] },
        })
      );
    });

    it('should sort by createdAt descending', async () => {
      ActivityLog.find.mockReturnThis();
      ActivityLog.sort.mockReturnThis();
      ActivityLog.limit.mockReturnThis();
      ActivityLog.lean.mockResolvedValue([]);

      await activityLogService.getRecentActivities('test-shop.myshopify.com', 20);

      expect(ActivityLog.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should limit results', async () => {
      ActivityLog.find.mockReturnThis();
      ActivityLog.sort.mockReturnThis();
      ActivityLog.limit.mockReturnThis();
      ActivityLog.lean.mockResolvedValue([]);

      await activityLogService.getRecentActivities('test-shop.myshopify.com', 15);

      expect(ActivityLog.limit).toHaveBeenCalledWith(15);
    });
  });

  describe('getQuickStats', () => {
    it('should count active bundles', async () => {
      Bundle.countDocuments.mockResolvedValue(5);
      AnnouncementBar.countDocuments.mockResolvedValue(3);
      ActivityLog.countDocuments.mockResolvedValue(10);

      const stats = await activityLogService.getQuickStats('test-shop.myshopify.com');

      expect(Bundle.countDocuments).toHaveBeenCalledWith({
        shopId: 'test-shop.myshopify.com',
        status: true,
      });
      expect(stats.activeBundles).toBe(5);
    });

    it('should count active announcements', async () => {
      Bundle.countDocuments.mockResolvedValue(5);
      AnnouncementBar.countDocuments.mockResolvedValue(3);
      ActivityLog.countDocuments.mockResolvedValue(10);

      const stats = await activityLogService.getQuickStats('test-shop.myshopify.com');

      expect(AnnouncementBar.countDocuments).toHaveBeenCalledWith({
        shop: 'test-shop.myshopify.com',
        status: 'active',
      });
      expect(stats.activeAnnouncements).toBe(3);
    });

    it('should count events today', async () => {
      Bundle.countDocuments.mockResolvedValue(5);
      AnnouncementBar.countDocuments.mockResolvedValue(3);
      ActivityLog.countDocuments.mockResolvedValue(10);

      const stats = await activityLogService.getQuickStats('test-shop.myshopify.com');

      expect(ActivityLog.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          shopId: 'test-shop.myshopify.com',
          type: { $in: ['view', 'click', 'purchase'] },
          createdAt: expect.any(Object),
        })
      );
      expect(stats.eventsToday).toBe(10);
    });
  });

  describe('formatTimeAgo', () => {
    it('should return "just now" for recent times (< 1 minute)', () => {
      const now = new Date();
      const result = activityLogService.formatTimeAgo(now);
      expect(result).toBe('just now');
    });

    it('should return "Xm ago" for minutes', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = activityLogService.formatTimeAgo(fiveMinutesAgo);
      expect(result).toBe('5m ago');
    });

    it('should return "Xh ago" for hours', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = activityLogService.formatTimeAgo(twoHoursAgo);
      expect(result).toBe('2h ago');
    });

    it('should return "Xd ago" for days', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = activityLogService.formatTimeAgo(threeDaysAgo);
      expect(result).toBe('3d ago');
    });
  });

  describe('getIconClass', () => {
    it('should return correct class for purchase type', () => {
      const result = activityLogService.getIconClass('purchase');
      expect(result).toContain('success');
    });

    it('should return correct class for view type', () => {
      const result = activityLogService.getIconClass('view');
      expect(result).toContain('primary');
    });

    it('should return correct class for click type', () => {
      const result = activityLogService.getIconClass('click');
      expect(result).toContain('warning');
    });
  });
});
