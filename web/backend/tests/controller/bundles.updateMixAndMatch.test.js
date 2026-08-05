import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/activityLogService.js', () => ({
  default: { logActivity: vi.fn() },
}));

vi.mock('../../models/bundle.model.js', () => ({
  default: { findById: vi.fn(), findByIdAndUpdate: vi.fn() },
}));

vi.mock('../../models/shop.model.js', () => ({
  default: { findOne: vi.fn() },
}));

vi.mock('../../../shopify.js', () => ({
  default: { api: { clients: { Graphql: vi.fn() } } },
}));

import { updateMixAndMatchBundle } from '../../controller/bundles/index.js';
import Bundle from '../../models/bundle.model.js';
import Shop from '../../models/shop.model.js';
import shopify from '../../../shopify.js';

const existingBundle = {
  _id: 'bundle-1',
  shopifyBundleId: 'gid://shopify/Product/999',
  description: 'old description',
  specs: [],
  secondaryMessage: 'old secondary message',
  selectedTier: 2,
  tierDiscounts: { 2: '10' },
};

const createMockReq = (body) => ({ params: { id: 'bundle-1' }, body });

const createMockRes = () => ({
  locals: { shopify: { session: { shop: 'test-shop.myshopify.com' } } },
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

// Sequenced fake GraphQL responses matching updateMixAndMatchBundle's 3
// sequential client.request calls: fetchProductDetailsByIds, the
// mixMatchProductUpdate mutation, then the price-update mutation.
const makeGraphqlClient = () => ({
  request: vi
    .fn()
    .mockResolvedValueOnce({
      data: {
        nodes: [
          {
            id: 'gid://shopify/Product/1',
            variants: { nodes: [{ id: 'gid://shopify/ProductVariant/1', price: '10.00' }] },
          },
        ],
      },
    })
    .mockResolvedValueOnce({
      data: {
        productUpdate: {
          product: { id: 'gid://shopify/Product/999', variants: { nodes: [{ id: 'gid://shopify/ProductVariant/999' }] } },
          userErrors: [],
        },
      },
    })
    .mockResolvedValueOnce({
      data: {
        productVariantsBulkUpdate: {
          product: { id: 'gid://shopify/Product/999' },
          userErrors: [],
        },
      },
    }),
});

// Regression coverage for two bugs in this update path: (1) it reported
// "created successfully" with a 201 status even when updating an existing
// bundle, and (2) secondaryMessage/selectedTier/tierDiscounts were read
// from req.body but never actually written to the DB update object, so
// editing them and saving silently lost the change on reload.
describe('updateMixAndMatchBundle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Bundle.findById.mockResolvedValue(existingBundle);
    Bundle.findByIdAndUpdate.mockResolvedValue({});
    Shop.findOne.mockResolvedValue({ _id: 'shop-1' });
    shopify.api.clients.Graphql.mockImplementation(() => makeGraphqlClient());
  });

  it('reports an update (200, "updated successfully"), not a create', async () => {
    const req = createMockReq({
      title: 'New Title',
      products: [{ productId: 'gid://shopify/Product/1' }],
      discountType: 'Percentage',
      tierDiscounts: { 2: '20' },
      status: true,
    });
    const res = createMockRes();

    await updateMixAndMatchBundle(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: true, message: 'Mix and Match Bundle updated successfully.' })
    );
  });

  it('persists secondaryMessage, selectedTier, and tierDiscounts from the request body', async () => {
    const req = createMockReq({
      title: 'New Title',
      products: [{ productId: 'gid://shopify/Product/1' }],
      discountType: 'Percentage',
      tierDiscounts: { 2: '20' },
      status: true,
      secondaryMessage: 'new secondary message',
      selectedTier: 3,
    });
    const res = createMockRes();

    await updateMixAndMatchBundle(req, res);

    expect(Bundle.findByIdAndUpdate).toHaveBeenCalledWith(
      'bundle-1',
      expect.objectContaining({
        secondaryMessage: 'new secondary message',
        selectedTier: 3,
        tierDiscounts: { 2: '20' },
      })
    );
  });

  it('falls back to the existing bundle values when the request omits them', async () => {
    const req = createMockReq({
      title: 'New Title',
      products: [{ productId: 'gid://shopify/Product/1' }],
      discountType: 'Percentage',
      tierDiscounts: { 2: '10' },
      status: true,
    });
    const res = createMockRes();

    await updateMixAndMatchBundle(req, res);

    expect(Bundle.findByIdAndUpdate).toHaveBeenCalledWith(
      'bundle-1',
      expect.objectContaining({
        secondaryMessage: 'old secondary message',
        selectedTier: 2,
      })
    );
  });
});
