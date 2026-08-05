import { describe, it, expect, vi, beforeEach } from 'vitest';

const { graphqlClientMock, requestMock } = vi.hoisted(() => {
  const requestMock = vi.fn().mockResolvedValue({ data: { products: { edges: [], pageInfo: {} } } });
  return {
    requestMock,
    graphqlClientMock: vi.fn().mockImplementation(() => ({ request: requestMock })),
  };
});

vi.mock('../../../shopify.js', () => ({
  default: { api: { clients: { Graphql: graphqlClientMock } } },
}));

vi.mock('../../models/shop.model.js', () => ({
  default: { findOne: vi.fn() },
}));

import { getProducts } from '../../controller/products/index.js';

const createMockReq = (query = {}) => ({ query });

const createMockRes = () => ({
  locals: { shopify: { session: { shop: 'test-shop.myshopify.com' } } },
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

// Editing an existing bundle needs to re-fetch specific already-selected
// products by id (to refresh images/description/metafields), not run a
// title search. This covers the id-filter query-building path added for
// that, and that the query still selects descriptionHtml/metafields so
// callers can rely on them.
describe('getProducts - fetching by ids', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters by id (not title search) when an ids param is present', async () => {
    await getProducts(createMockReq({ ids: '111,222' }), createMockRes());

    const [, variables] = requestMock.mock.calls[0];
    expect(variables.variables.searchQuery).toBe('bundles:false AND tag_not:busybuddybundles AND (id:111 OR id:222)');
  });

  it('trims whitespace and drops empty entries in the ids list', async () => {
    await getProducts(createMockReq({ ids: ' 111 , , 222 ' }), createMockRes());

    const [, variables] = requestMock.mock.calls[0];
    expect(variables.variables.searchQuery).toBe('bundles:false AND tag_not:busybuddybundles AND (id:111 OR id:222)');
  });

  it('falls back to the title-search path when ids is absent', async () => {
    await getProducts(createMockReq({ search: 'shirt' }), createMockRes());

    const [, variables] = requestMock.mock.calls[0];
    expect(variables.variables.searchQuery).toBe('bundles:false AND tag_not:busybuddybundles AND title:*shirt*');
  });

  it('requests descriptionHtml and metafields on every call', async () => {
    await getProducts(createMockReq({}), createMockRes());

    const [query] = requestMock.mock.calls[0];
    expect(query).toContain('descriptionHtml');
    expect(query).toContain('metafields(first: 20)');
  });
});
