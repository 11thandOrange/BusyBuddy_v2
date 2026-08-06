import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/inactiveTab.model.js', () => ({ default: {} }));
vi.mock('../../models/announcementBar.model.js', () => ({ default: {} }));
vi.mock('../../models/emailProvider.model.js', () => ({ default: {} }));
vi.mock('../../services/emailService.js', () => ({ default: {}, EmailServiceError: class EmailServiceError extends Error {} }));

vi.mock('../../models/bundle.model.js', () => ({
  default: { find: vi.fn() },
}));

vi.mock('../../models/shop.model.js', () => ({
  default: { findOne: vi.fn(), create: vi.fn() },
}));

vi.mock('../../configs/subscriptionUtils.js', () => ({
  checkSubscriptionAccess: vi.fn().mockResolvedValue({ shouldReturnBlank: false }),
  getFeatureNameFromEndpoint: vi.fn(),
  getFeatureNameFromBundleType: vi.fn().mockReturnValue('Bundle Discount'),
}));

const graphqlRequestMock = vi.fn().mockResolvedValue({ data: { products: { edges: [] } } });

vi.mock('../../../shopify.js', () => ({
  default: {
    api: {
      clients: {
        Graphql: vi.fn().mockImplementation(({ session }) => ({
          session,
          request: graphqlRequestMock,
        })),
      },
      rest: {
        Shop: { all: vi.fn() },
      },
    },
  },
}));

import { getActiveBundle } from '../../controller/frontStore/index.js';
import Bundle from '../../models/bundle.model.js';
import Shop from '../../models/shop.model.js';
import shopify from '../../../shopify.js';

const createMockRes = (shop = 'test-shop.myshopify.com') => ({
  locals: { shopify: { session: { shop } } },
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

const REAL_BUNDLE = {
  _id: 'bundle-1',
  type: 'Bundle Discount',
  products: [{ productId: 'gid://shopify/Product/123' }],
  productsX: [],
  productsY: [],
};

function mockBundleFind(result) {
  Bundle.find.mockReturnValue({
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(result),
  });
}

describe('getActiveBundle - Shop-missing resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    graphqlRequestMock.mockResolvedValue({ data: { products: { edges: [] } } });
  });

  it('finds a real bundle when the Shop document exists (baseline)', async () => {
    Shop.findOne.mockResolvedValue({ _id: 'shop-doc-1' });
    mockBundleFind([REAL_BUNDLE]);
    const res = createMockRes();

    await getActiveBundle({ query: { product_id: '123' } }, res);

    expect(Bundle.find).toHaveBeenCalledWith(
      expect.objectContaining({ shopId: 'shop-doc-1' })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: true, bundles: expect.arrayContaining([expect.anything()]) })
    );
  });

  it('self-heals a missing Shop doc via the Admin API and still finds the bundle', async () => {
    Shop.findOne.mockResolvedValue(null);
    shopify.api.rest.Shop.all.mockResolvedValue({
      data: [{ id: 999, name: 'Healed Shop', domain: 'healed.myshopify.com', country: 'US', myshopify_domain: 'test-shop.myshopify.com' }],
    });
    Shop.create.mockResolvedValue({ _id: 'newly-created-shop' });
    mockBundleFind([REAL_BUNDLE]);
    const res = createMockRes();

    await getActiveBundle({ query: { product_id: '123' } }, res);

    expect(Shop.create).toHaveBeenCalled();
    expect(Bundle.find).toHaveBeenCalledWith(
      expect.objectContaining({ shopId: 'newly-created-shop' })
    );
    expect(res.json).not.toHaveBeenCalledWith({ bundles: [] });
  });

  it('still finds a real bundle by product id even when the Shop doc is missing and cannot be healed (regression: used to silently return zero bundles)', async () => {
    Shop.findOne.mockResolvedValue(null);
    shopify.api.rest.Shop.all.mockRejectedValue(new Error('Admin API unavailable'));
    mockBundleFind([REAL_BUNDLE]);
    const res = createMockRes();

    await expect(getActiveBundle({ query: { product_id: '123' } }, res)).resolves.not.toThrow();

    // Must not have filtered by shopId: null, which could never match a
    // real bundle (they always have a real shopId).
    const queryArg = Bundle.find.mock.calls[0][0];
    expect(queryArg).not.toHaveProperty('shopId');
    expect(res.json).not.toHaveBeenCalledWith({ bundles: [] });
  });

  it('returns bundles: [] when no bundle actually matches this product, regardless of Shop state', async () => {
    Shop.findOne.mockResolvedValue({ _id: 'shop-doc-1' });
    mockBundleFind([]);
    const res = createMockRes();

    await getActiveBundle({ query: { product_id: '999999' } }, res);

    expect(res.json).toHaveBeenCalledWith({ bundles: [] });
  });
});
