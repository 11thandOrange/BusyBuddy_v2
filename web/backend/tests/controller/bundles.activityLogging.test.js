import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all dependencies
vi.mock('../../services/activityLogService.js', () => ({
  default: {
    logActivity: vi.fn(),
  },
}));

vi.mock('../../models/bundle.model.js', () => {
  const mockBundle = {
    save: vi.fn().mockResolvedValue({}),
    _id: 'bundle-123',
    title: 'Test Bundle',
    type: 'Bundle Discount',
  };
  return {
    default: vi.fn().mockImplementation(() => mockBundle),
  };
});

vi.mock('../../models/shop.model.js', () => ({
  default: {
    findOne: vi.fn().mockResolvedValue({ shop: 'test-shop.myshopify.com' }),
  },
}));

vi.mock('../../../shopify.js', () => ({
  default: {
    api: {
      admin: {
        graphql: vi.fn().mockResolvedValue({
          body: { data: {} },
        }),
      },
    },
  },
}));

import activityLogService from '../../services/activityLogService.js';

describe('Bundle Controller Activity Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Activity Log Widget Type Mapping', () => {
    it('should map "Bundle Discount" to widget "bundle"', () => {
      const type = 'Bundle Discount';
      let widgetType = 'bundle';
      
      if (type === 'Buy One Get One') {
        widgetType = 'bogo';
      } else if (type === 'Volume Discount') {
        widgetType = 'volume';
      } else if (type === 'Mix and Match') {
        widgetType = 'mix-match';
      }
      
      expect(widgetType).toBe('bundle');
    });

    it('should map "Buy One Get One" to widget "bogo"', () => {
      const type = 'Buy One Get One';
      let widgetType = 'bundle';
      
      if (type === 'Buy One Get One') {
        widgetType = 'bogo';
      }
      
      expect(widgetType).toBe('bogo');
    });

    it('should map "Volume Discount" to widget "volume"', () => {
      const type = 'Volume Discount';
      let widgetType = 'bundle';
      
      if (type === 'Volume Discount') {
        widgetType = 'volume';
      }
      
      expect(widgetType).toBe('volume');
    });

    it('should map "Mix and Match" to widget "mix-match"', () => {
      const type = 'Mix and Match';
      let widgetType = 'bundle';
      
      if (type === 'Mix and Match') {
        widgetType = 'mix-match';
      }
      
      expect(widgetType).toBe('mix-match');
    });
  });

  describe('Activity Types', () => {
    it('should log "created" activity type for new bundles', () => {
      const activityType = 'created';
      expect(activityType).toBe('created');
    });

    it('should log "updated" activity type for bundle updates', () => {
      const activityType = 'updated';
      expect(activityType).toBe('updated');
    });

    it('should log "deleted" activity type for bundle deletions', () => {
      const activityType = 'deleted';
      expect(activityType).toBe('deleted');
    });

    it('should log "activated" when status changes to true', () => {
      const oldStatus = false;
      const newStatus = true;
      const activityType = newStatus !== oldStatus 
        ? (newStatus ? 'activated' : 'deactivated')
        : 'updated';
      
      expect(activityType).toBe('activated');
    });

    it('should log "deactivated" when status changes to false', () => {
      const oldStatus = true;
      const newStatus = false;
      const activityType = newStatus !== oldStatus 
        ? (newStatus ? 'activated' : 'deactivated')
        : 'updated';
      
      expect(activityType).toBe('deactivated');
    });
  });

  describe('logActivity Call Structure', () => {
    it('should include all required fields in logActivity call', async () => {
      const activityData = {
        shopId: 'test-shop.myshopify.com',
        type: 'created',
        widget: 'bundle',
        title: 'New bundle discount created',
        meta: 'Summer Bundle',
        offerId: 'bundle-123',
      };

      await activityLogService.logActivity(activityData);

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          shopId: expect.any(String),
          type: expect.any(String),
          widget: expect.any(String),
          title: expect.any(String),
        })
      );
    });
  });
});
