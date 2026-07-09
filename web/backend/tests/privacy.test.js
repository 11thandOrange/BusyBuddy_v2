import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/merchantEventService.js', () => ({
  merchantEventService: {
    handleSubscriptionDowngrade: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('../models/shop.model.js', () => ({
  default: {
    findOne: vi.fn(),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  },
}));

vi.mock('../models/subscription.model.js', () => ({
  default: {
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('../models/bundle.model.js', () => ({ default: { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }) } }));
vi.mock('../models/announcementBar.model.js', () => ({ default: { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }) } }));
vi.mock('../models/inactiveTab.model.js', () => ({ default: { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }) } }));
vi.mock('../models/activityLog.model.js', () => ({
  default: {
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    find: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }),
    updateMany: vi.fn().mockResolvedValue({ modifiedCount: 0 }),
  },
}));
vi.mock('../models/emailLog.model.js', () => ({ default: { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }) } }));
vi.mock('../models/emailProvider.model.js', () => ({ default: { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }) } }));
vi.mock('../models/googleAnalytics.model.js', () => ({ default: { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }) } }));
vi.mock('../models/merchantEvent.model.js', () => ({ default: { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }) } }));
vi.mock('../models/merchantReview.model.js', () => ({ default: { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }) } }));
vi.mock('../models/shopify_sessions.model.js', () => ({ default: { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }) } }));

import PrivacyWebhookHandlers from '../../privacy.js';
import Shop from '../models/shop.model.js';
import Subscription from '../models/subscription.model.js';
import Bundle from '../models/bundle.model.js';
import AnnouncementBar from '../models/announcementBar.model.js';
import ActivityLog from '../models/activityLog.model.js';
import ShopifySession from '../models/shopify_sessions.model.js';
import { merchantEventService } from '../services/merchantEventService.js';

const SHOP = 'test-shop.myshopify.com';
const SHOP_OBJECT_ID = { _id: 'shop-mongo-id', toString: () => 'shop-mongo-id' };

describe('privacy.js GDPR + billing webhooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SHOP_REDACT', () => {
    it('purges shop-scoped data across all collections and the shop record itself', async () => {
      Shop.findOne.mockResolvedValue({ _id: SHOP_OBJECT_ID });

      await PrivacyWebhookHandlers.SHOP_REDACT.callback(
        'shop/redact',
        SHOP,
        JSON.stringify({ shop_id: 954889, shop_domain: SHOP }),
        'webhook-1'
      );

      expect(Subscription.deleteMany).toHaveBeenCalledWith({ myshopify_domain: SHOP });
      expect(Bundle.deleteMany).toHaveBeenCalledWith({ shopId: SHOP_OBJECT_ID });
      expect(AnnouncementBar.deleteMany).toHaveBeenCalledWith({ shopId: SHOP_OBJECT_ID });
      expect(ActivityLog.deleteMany).toHaveBeenCalledWith({ shopId: 'shop-mongo-id' });
      expect(ShopifySession.deleteMany).toHaveBeenCalledWith({ shop: SHOP });
      expect(Shop.deleteOne).toHaveBeenCalledWith({ _id: SHOP_OBJECT_ID });
    });

    it('does not throw when the shop record is already gone', async () => {
      Shop.findOne.mockResolvedValue(null);

      await expect(
        PrivacyWebhookHandlers.SHOP_REDACT.callback(
          'shop/redact',
          SHOP,
          JSON.stringify({ shop_id: 954889, shop_domain: SHOP }),
          'webhook-1'
        )
      ).resolves.not.toThrow();

      expect(Shop.deleteOne).not.toHaveBeenCalled();
      // Domain-scoped collections should still be cleaned up.
      expect(Subscription.deleteMany).toHaveBeenCalledWith({ myshopify_domain: SHOP });
    });
  });

  describe('CUSTOMERS_REDACT', () => {
    it('redacts order-ID linkage on matching activity log entries', async () => {
      Shop.findOne.mockResolvedValue({ _id: SHOP_OBJECT_ID });

      await PrivacyWebhookHandlers.CUSTOMERS_REDACT.callback(
        'customers/redact',
        SHOP,
        JSON.stringify({
          shop_id: 954889,
          shop_domain: SHOP,
          customer: { id: 191167 },
          orders_to_redact: [299938, 280263],
        }),
        'webhook-2'
      );

      expect(ActivityLog.updateMany).toHaveBeenCalledWith(
        { shopId: 'shop-mongo-id', orderId: { $in: ['299938', '280263'] } },
        { $set: { orderId: '[redacted]' } }
      );
    });

    it('does nothing when there are no orders to redact', async () => {
      Shop.findOne.mockResolvedValue({ _id: SHOP_OBJECT_ID });

      await PrivacyWebhookHandlers.CUSTOMERS_REDACT.callback(
        'customers/redact',
        SHOP,
        JSON.stringify({ shop_id: 954889, shop_domain: SHOP, customer: { id: 1 }, orders_to_redact: [] }),
        'webhook-2'
      );

      expect(ActivityLog.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('CUSTOMERS_DATA_REQUEST', () => {
    it('does not throw and looks up related activity for an audit trail', async () => {
      Shop.findOne.mockResolvedValue({ _id: SHOP_OBJECT_ID });

      await expect(
        PrivacyWebhookHandlers.CUSTOMERS_DATA_REQUEST.callback(
          'customers/data_request',
          SHOP,
          JSON.stringify({
            shop_id: 954889,
            shop_domain: SHOP,
            orders_requested: [299938],
            customer: { id: 191167 },
            data_request: { id: 9999 },
          }),
          'webhook-3'
        )
      ).resolves.not.toThrow();

      expect(ActivityLog.find).toHaveBeenCalledWith({
        shopId: 'shop-mongo-id',
        orderId: { $in: ['299938'] },
      });
    });
  });

  describe('APP_SUBSCRIPTIONS_UPDATE', () => {
    it('downgrades the local subscription to Free when Shopify reports a terminal status', async () => {
      Subscription.findOne.mockResolvedValue({
        _id: 'sub-doc-id',
        activeSubscriptions: [{ name: 'Advanced', status: 'active' }],
        enabledApps: [],
        enabledAppsCount: 0,
      });
      Subscription.findOneAndUpdate.mockResolvedValue({});

      await PrivacyWebhookHandlers.APP_SUBSCRIPTIONS_UPDATE.callback(
        'app_subscriptions/update',
        SHOP,
        JSON.stringify({ app_subscription: { name: 'Advanced', status: 'CANCELLED' } }),
        'webhook-4'
      );

      expect(Subscription.findOneAndUpdate).toHaveBeenCalledWith(
        { myshopify_domain: SHOP },
        expect.objectContaining({ currentPlan: 'Free', maxAppsAllowed: 1 }),
        { new: true }
      );
      expect(merchantEventService.handleSubscriptionDowngrade).toHaveBeenCalledWith(
        expect.objectContaining({ shopDomain: SHOP, previousPlan: 'Advanced', newPlan: 'Free' })
      );
    });

    it('does nothing for a non-terminal status like ACTIVE', async () => {
      await PrivacyWebhookHandlers.APP_SUBSCRIPTIONS_UPDATE.callback(
        'app_subscriptions/update',
        SHOP,
        JSON.stringify({ app_subscription: { name: 'Advanced', status: 'ACTIVE' } }),
        'webhook-4'
      );

      expect(Subscription.findOne).not.toHaveBeenCalled();
      expect(Subscription.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('does nothing when the local record is already on a different active plan', async () => {
      Subscription.findOne.mockResolvedValue({
        _id: 'sub-doc-id',
        activeSubscriptions: [{ name: 'Free', status: 'active' }],
        enabledApps: [],
        enabledAppsCount: 0,
      });

      await PrivacyWebhookHandlers.APP_SUBSCRIPTIONS_UPDATE.callback(
        'app_subscriptions/update',
        SHOP,
        JSON.stringify({ app_subscription: { name: 'Advanced', status: 'CANCELLED' } }),
        'webhook-4'
      );

      expect(Subscription.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });
});
