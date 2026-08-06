import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/subscription.model.js', () => ({
  default: { findOne: vi.fn() },
}));

import { checkSubscriptionAccess } from '../../configs/subscriptionUtils.js';
import subscriptionModel from '../../models/subscription.model.js';

// Confirms the app-level enable/disable toggle (ToggelSwitch.jsx on each
// app's homepage -> POST /api/subscription/toggle-app) actually gates the
// storefront-facing data: checkSubscriptionAccess is what
// getActiveBundle/getInactiveTab/getAnnouncementBar call to decide whether
// to return real data or a blank response.
describe('checkSubscriptionAccess - app-level enable/disable gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseSubscription = (enabledApps) => ({
    activeSubscriptions: [{ name: 'Starter', status: 'active' }],
    enabledAppsCount: enabledApps.filter((a) => a.enabled).length,
    enabledApps,
  });

  it('returns shouldReturnBlank: true when the app has never been toggled on', async () => {
    subscriptionModel.findOne.mockResolvedValue(baseSubscription([]));

    const result = await checkSubscriptionAccess('test-shop.myshopify.com', 'Bundle Discount');

    expect(result.shouldReturnBlank).toBe(true);
    expect(result.isAppEnabled).toBe(false);
    expect(result.reason).toBe('App is not enabled');
  });

  it('returns shouldReturnBlank: true when the merchant explicitly disabled the app', async () => {
    subscriptionModel.findOne.mockResolvedValue(
      baseSubscription([{ appId: 'bundle_discount', appName: 'Bundle Discount', enabled: false }])
    );

    const result = await checkSubscriptionAccess('test-shop.myshopify.com', 'Bundle Discount');

    expect(result.shouldReturnBlank).toBe(true);
    expect(result.isAppEnabled).toBe(false);
  });

  it('grants access when the app is enabled and the plan allows it', async () => {
    subscriptionModel.findOne.mockResolvedValue(
      baseSubscription([{ appId: 'bundle_discount', appName: 'Bundle Discount', enabled: true }])
    );

    const result = await checkSubscriptionAccess('test-shop.myshopify.com', 'Bundle Discount');

    expect(result.shouldReturnBlank).toBe(false);
    expect(result.hasAccess).toBe(true);
  });

  it('returns shouldReturnBlank: true when the plan does not include the feature, even if toggled on', async () => {
    // Free plan does not include Bundle Discount at all - simulates a
    // downgrade that left a stale `enabled: true` entry from a paid plan.
    subscriptionModel.findOne.mockResolvedValue({
      activeSubscriptions: [{ name: 'Free', status: 'active' }],
      enabledAppsCount: 1,
      enabledApps: [{ appId: 'bundle_discount', appName: 'Bundle Discount', enabled: true }],
    });

    const result = await checkSubscriptionAccess('test-shop.myshopify.com', 'Bundle Discount');

    expect(result.shouldReturnBlank).toBe(true);
    expect(result.reason).toBe('Feature not available in Free plan');
  });

  it('returns shouldReturnBlank: true when no subscription document exists at all', async () => {
    subscriptionModel.findOne.mockResolvedValue(null);

    const result = await checkSubscriptionAccess('test-shop.myshopify.com', 'Announcement Bar');

    expect(result.shouldReturnBlank).toBe(true);
    expect(result.reason).toBe('No subscription found');
  });

  it('matches every appMapping name used by toggle-app against the feature names the storefront endpoints check', async () => {
    // Guards the appName <-> featureName string match this whole mechanism
    // depends on - a mismatch here would make every app permanently look
    // disabled (or permanently look enabled for the wrong app) regardless
    // of what the merchant actually toggled.
    const { appMapping } = await import('../../configs/subscriptionConfig.js');
    const featureNamesChecked = [
      'Announcement Bar',
      'Inactive Tab Message',
      'Bundle Discount',
      'Buy One Get One',
      'Volume Discounts',
      'Mix & Match',
    ];

    for (const featureName of featureNamesChecked) {
      const matchingAppId = Object.keys(appMapping).find((id) => appMapping[id].name === featureName);
      expect(matchingAppId, `no appMapping entry has name "${featureName}"`).toBeDefined();
    }
  });
});
