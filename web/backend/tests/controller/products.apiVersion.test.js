import { describe, it, expect, vi, beforeEach } from 'vitest';

// getProducts/getCollections were passing apiVersion: "2025-10" - not a real
// Shopify API version (the installed @shopify/shopify-api SDK's newest known
// version is "2025-07"). Shopify's Admin API rejects requests for a
// nonexistent version, so every product-picker fetch across all 4 bundle-type
// editors failed with the generic "Failed to load products" toast. This
// guards against that regressing by asserting the exact apiVersion string
// passed to the Graphql client constructor.
const { graphqlClientMock } = vi.hoisted(() => ({
  graphqlClientMock: vi.fn().mockImplementation(() => ({
    request: vi.fn().mockResolvedValue({ data: { products: { edges: [], pageInfo: {} } } }),
  })),
}));

vi.mock('../../../shopify.js', () => ({
  default: { api: { clients: { Graphql: graphqlClientMock } } },
}));

vi.mock('../../models/shop.model.js', () => ({
  default: { findOne: vi.fn() },
}));

import { getProducts, getCollections } from '../../controller/products/index.js';

// Every version the installed @shopify/shopify-api SDK actually knows about.
const KNOWN_API_VERSIONS = [
  '2022-10', '2023-01', '2023-04', '2023-07', '2023-10',
  '2024-01', '2024-04', '2024-07', '2024-10',
  '2025-01', '2025-04', '2025-07', 'unstable',
];

const createMockReq = (query = {}) => ({ query });

const createMockRes = () => ({
  locals: { shopify: { session: { shop: 'test-shop.myshopify.com' } } },
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

describe('products controller apiVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProducts requests a real Shopify API version', async () => {
    await getProducts(createMockReq(), createMockRes());

    expect(graphqlClientMock).toHaveBeenCalledTimes(1);
    const { apiVersion } = graphqlClientMock.mock.calls[0][0];
    expect(KNOWN_API_VERSIONS).toContain(apiVersion);
  });

  it('getCollections requests a real Shopify API version', async () => {
    await getCollections(createMockReq(), createMockRes());

    expect(graphqlClientMock).toHaveBeenCalledTimes(1);
    const { apiVersion } = graphqlClientMock.mock.calls[0][0];
    expect(KNOWN_API_VERSIONS).toContain(apiVersion);
  });
});
