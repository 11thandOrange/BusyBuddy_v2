import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../billing.js', () => ({
  getAppSubscription: vi.fn(),
}));

vi.mock('../../models/subscription.model.js', () => ({
  default: { updateOne: vi.fn() },
}));

import { getAppSubscription } from '../../../billing.js';
import sbModel from '../../models/subscription.model.js';
import { subscriptionUpdate } from '../../services/subscription.js';

// Regression: Shopify's GraphQL API returns AppSubscription.status as an
// uppercase enum ("ACTIVE"), but every read site that later checks
// activeSubscriptions[].status compares against lowercase "active".
// subscriptionUpdate used to persist Shopify's raw casing verbatim, which
// silently broke checkSubscriptionAccess (and everything else gated on
// "is this shop's subscription active") the moment a real paid shop's
// subscription synced from Shopify's own billing-confirmation redirect.
describe('subscriptionUpdate - status casing normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lowercases Shopify\'s uppercase status enum before storing', async () => {
    getAppSubscription.mockResolvedValue([
      { name: 'Advanced', status: 'ACTIVE', id: 'gid://shopify/AppSubscription/1' },
    ]);

    await subscriptionUpdate({ shop: 'test-shop.myshopify.com' });

    expect(sbModel.updateOne).toHaveBeenCalledWith(
      { myshopify_domain: 'test-shop.myshopify.com' },
      {
        $set: {
          myshopify_domain: 'test-shop.myshopify.com',
          activeSubscriptions: [
            { name: 'Advanced', status: 'active', id: 'gid://shopify/AppSubscription/1' },
          ],
        },
      },
      { upsert: true }
    );
  });

  it('does not throw and stores an empty array when Shopify returns no subscriptions', async () => {
    getAppSubscription.mockResolvedValue([]);

    await subscriptionUpdate({ shop: 'test-shop.myshopify.com' });

    expect(sbModel.updateOne).toHaveBeenCalledWith(
      { myshopify_domain: 'test-shop.myshopify.com' },
      { $set: { myshopify_domain: 'test-shop.myshopify.com', activeSubscriptions: [] } },
      { upsert: true }
    );
  });
});
