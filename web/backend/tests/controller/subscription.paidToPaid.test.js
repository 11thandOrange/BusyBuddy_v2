import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/subscription.model.js', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('../../../shopify.js', () => ({
  default: {
    api: {
      billing: {
        check: vi.fn(),
        request: vi.fn(),
      },
      clients: {
        Rest: vi.fn(),
      },
    },
  },
}));

vi.mock('../../../billing.js', () => ({
  billingConfig: { Starter: {}, Advanced: {} },
  cancelSubscriptionPlan: vi.fn(),
  getAppSubscription: vi.fn(),
  isTestPaymentMode: vi.fn(() => true),
}));

vi.mock('../../services/subscription.js', () => ({
  subscriptionUpdate: vi.fn(),
}));

vi.mock('../../services/merchantEventService.js', () => ({
  merchantEventService: {
    handleSubscriptionUpgrade: vi.fn(() => Promise.resolve()),
    handleSubscriptionDowngrade: vi.fn(() => Promise.resolve()),
  },
}));

import subscriptionModel from '../../models/subscription.model.js';
import shopify from '../../../shopify.js';
import { cancelSubscriptionPlan } from '../../../billing.js';
import { subscribeToPlan } from '../../controller/subscription/index.js';

const createMockRes = (session) => ({
  locals: { shopify: { session } },
  json: vi.fn().mockReturnThis(),
  status: vi.fn().mockReturnThis(),
});

describe('subscribeToPlan - paid-to-paid plan changes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('charges for the new plan and cancels the old one when switching between two paid plans', async () => {
    const session = { shop: 'test-shop.myshopify.com', id: 'session-1' };
    subscriptionModel.findOne.mockResolvedValue({
      activeSubscriptions: [{ name: 'Starter', status: 'active' }],
      enabledApps: [],
      enabledAppsCount: 0,
    });
    // Shop is not subscribed to the *target* plan (Advanced) - only to Starter.
    shopify.api.billing.check.mockResolvedValue(false);
    shopify.api.billing.request.mockResolvedValue('https://shopify.example/charge');

    const req = { body: { planName: 'Advanced' } };
    const res = createMockRes(session);

    await subscribeToPlan(req, res);

    // Must check against the specific target plan, not "any paid plan".
    expect(shopify.api.billing.check).toHaveBeenCalledWith(
      expect.objectContaining({ plans: ['Advanced'] })
    );
    // The old Starter subscription must be cancelled before charging for Advanced.
    expect(cancelSubscriptionPlan).toHaveBeenCalledWith(session, 'Starter');
    // A real charge must be requested for the new plan - the database must
    // not be silently updated to Advanced without Shopify billing involved.
    expect(shopify.api.billing.request).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'Advanced' })
    );
    expect(subscriptionModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'SUCCESS',
        data: expect.objectContaining({ url: 'https://shopify.example/charge' }),
      })
    );
  });

  it('does not request a new charge when already subscribed to the exact target plan', async () => {
    const session = { shop: 'test-shop.myshopify.com', id: 'session-1' };
    subscriptionModel.findOne.mockResolvedValue({
      activeSubscriptions: [{ name: 'Advanced', status: 'active' }],
      enabledApps: [],
      enabledAppsCount: 0,
    });
    shopify.api.billing.check.mockResolvedValue(true);
    subscriptionModel.findOneAndUpdate.mockResolvedValue({});

    const req = { body: { planName: 'Advanced' } };
    const res = createMockRes(session);

    await subscribeToPlan(req, res);

    expect(shopify.api.billing.check).toHaveBeenCalledWith(
      expect.objectContaining({ plans: ['Advanced'] })
    );
    expect(cancelSubscriptionPlan).not.toHaveBeenCalled();
    expect(shopify.api.billing.request).not.toHaveBeenCalled();
    expect(subscriptionModel.findOneAndUpdate).toHaveBeenCalled();
  });

  it('requests a charge without cancelling anything for a free-to-paid upgrade', async () => {
    const session = { shop: 'test-shop.myshopify.com', id: 'session-1' };
    subscriptionModel.findOne.mockResolvedValue({
      activeSubscriptions: [{ name: 'Free', status: 'active' }],
      enabledApps: [],
      enabledAppsCount: 0,
    });
    shopify.api.billing.check.mockResolvedValue(false);
    shopify.api.billing.request.mockResolvedValue('https://shopify.example/charge');

    const req = { body: { planName: 'Starter' } };
    const res = createMockRes(session);

    await subscribeToPlan(req, res);

    expect(cancelSubscriptionPlan).not.toHaveBeenCalled();
    expect(shopify.api.billing.request).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'Starter' })
    );
  });
});
