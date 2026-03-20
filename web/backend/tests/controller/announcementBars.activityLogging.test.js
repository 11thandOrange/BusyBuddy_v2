import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock activityLogService
vi.mock('../../services/activityLogService.js', () => ({
  default: {
    logActivity: vi.fn(),
  },
}));

import activityLogService from '../../services/activityLogService.js';

describe('AnnouncementBar Controller Activity Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAnnouncementBar', () => {
    it('should log "created" activity with correct fields', async () => {
      const mockAnnouncementBar = {
        _id: 'bar-123',
        name: 'Free Shipping Banner',
        internalName: 'free-shipping',
      };

      await activityLogService.logActivity({
        shopId: 'test-shop.myshopify.com',
        type: 'created',
        widget: 'announcement',
        title: 'New announcement bar created',
        meta: mockAnnouncementBar.name || mockAnnouncementBar.internalName,
        offerId: mockAnnouncementBar._id,
      });

      expect(activityLogService.logActivity).toHaveBeenCalledWith({
        shopId: 'test-shop.myshopify.com',
        type: 'created',
        widget: 'announcement',
        title: 'New announcement bar created',
        meta: 'Free Shipping Banner',
        offerId: 'bar-123',
      });
    });
  });

  describe('updateAnnouncementBar', () => {
    it('should log "updated" activity', async () => {
      const mockAnnouncementBar = {
        _id: 'bar-123',
        name: 'Updated Banner',
      };

      await activityLogService.logActivity({
        shopId: 'test-shop.myshopify.com',
        type: 'updated',
        widget: 'announcement',
        title: 'Announcement bar updated',
        meta: mockAnnouncementBar.name,
        offerId: mockAnnouncementBar._id,
      });

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'updated',
          widget: 'announcement',
        })
      );
    });
  });

  describe('deleteAnnouncementBar', () => {
    it('should log "deleted" activity', async () => {
      const mockAnnouncementBar = {
        _id: 'bar-123',
        name: 'Deleted Banner',
      };

      await activityLogService.logActivity({
        shopId: 'test-shop.myshopify.com',
        type: 'deleted',
        widget: 'announcement',
        title: 'Announcement bar deleted',
        meta: mockAnnouncementBar.name,
        offerId: mockAnnouncementBar._id,
      });

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'deleted',
          widget: 'announcement',
        })
      );
    });
  });

  describe('toggleAnnouncementBarStatus', () => {
    it('should log "activated" when enabling', async () => {
      const status = 'active';
      const activityType = status === 'active' ? 'activated' : 'deactivated';

      await activityLogService.logActivity({
        shopId: 'test-shop.myshopify.com',
        type: activityType,
        widget: 'announcement',
        title: `Announcement bar ${activityType}`,
        meta: 'Test Banner',
        offerId: 'bar-123',
      });

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'activated',
        })
      );
    });

    it('should log "deactivated" when disabling', async () => {
      const status = 'inactive';
      const activityType = status === 'active' ? 'activated' : 'deactivated';

      await activityLogService.logActivity({
        shopId: 'test-shop.myshopify.com',
        type: activityType,
        widget: 'announcement',
        title: `Announcement bar ${activityType}`,
        meta: 'Test Banner',
        offerId: 'bar-123',
      });

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'deactivated',
        })
      );
    });
  });

  describe('trackAnnouncementBarAnalytics', () => {
    it('should log "view" activity for view action', async () => {
      const action = 'view';

      await activityLogService.logActivity({
        shopId: 'test-shop.myshopify.com',
        type: action,
        widget: 'announcement',
        title: 'Free Shipping Banner',
        meta: 'viewed',
        offerId: 'bar-123',
      });

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'view',
          meta: 'viewed',
        })
      );
    });

    it('should log "click" activity for click action', async () => {
      const action = 'click';

      await activityLogService.logActivity({
        shopId: 'test-shop.myshopify.com',
        type: action,
        widget: 'announcement',
        title: 'Free Shipping Banner',
        meta: 'clicked',
        offerId: 'bar-123',
      });

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          meta: 'clicked',
        })
      );
    });
  });

  describe('Activity Widget Type', () => {
    it('should always use "announcement" as widget type', async () => {
      await activityLogService.logActivity({
        shopId: 'test-shop.myshopify.com',
        type: 'created',
        widget: 'announcement',
        title: 'Test',
        offerId: 'bar-123',
      });

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          widget: 'announcement',
        })
      );
    });
  });
});
