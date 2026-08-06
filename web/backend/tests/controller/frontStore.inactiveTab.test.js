import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/inactiveTab.model.js', () => ({
  default: { findOne: vi.fn() },
}));

vi.mock('../../models/announcementBar.model.js', () => ({ default: {} }));
vi.mock('../../models/bundle.model.js', () => ({ default: { find: vi.fn() } }));
vi.mock('../../models/shop.model.js', () => ({ default: { findOne: vi.fn() } }));
vi.mock('../../models/emailProvider.model.js', () => ({ default: {} }));
vi.mock('../../services/emailService.js', () => ({ default: {}, EmailServiceError: class EmailServiceError extends Error {} }));

vi.mock('../../configs/subscriptionUtils.js', () => ({
  checkSubscriptionAccess: vi.fn().mockResolvedValue({ shouldReturnBlank: false }),
  getFeatureNameFromEndpoint: vi.fn(),
  getFeatureNameFromBundleType: vi.fn(),
}));

vi.mock('../../../shopify.js', () => ({
  default: {
    api: {
      clients: {
        Graphql: vi.fn().mockImplementation(({ session }) => ({ session })),
      },
    },
  },
}));

import { getInactiveTab } from '../../controller/frontStore/index.js';
import InactiveTab from '../../models/inactiveTab.model.js';

const createMockRes = () => ({
  locals: { shopify: { session: { shop: 'test-shop.myshopify.com' } } },
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

function mockDoc(doc) {
  InactiveTab.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(doc) });
}

describe('getInactiveTab - storefront enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the message when enabled and within schedule', async () => {
    mockDoc({ message: 'Come back!', isEnabled: true, startDate: null, endDate: null });
    const res = createMockRes();
    await getInactiveTab({}, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'SUCCESS', data: expect.objectContaining({ message: 'Come back!' }) });
  });

  it('returns null when the merchant has turned the widget off (previously ignored)', async () => {
    mockDoc({ message: 'Come back!', isEnabled: false });
    const res = createMockRes();
    await getInactiveTab({}, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'SUCCESS', data: null });
  });

  it('returns null once the schedule end date has passed (previously ignored)', async () => {
    mockDoc({
      message: 'Come back!',
      isEnabled: true,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-02-01'),
    });
    const res = createMockRes();
    await getInactiveTab({}, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'SUCCESS', data: null });
  });

  it('returns null before the schedule start date', async () => {
    const future = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    mockDoc({ message: 'Come back!', isEnabled: true, startDate: future, endDate: null });
    const res = createMockRes();
    await getInactiveTab({}, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'SUCCESS', data: null });
  });
});
