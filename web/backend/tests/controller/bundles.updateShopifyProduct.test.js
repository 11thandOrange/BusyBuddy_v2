import { describe, it, expect, vi } from 'vitest';

vi.mock('../../services/activityLogService.js', () => ({
  default: { logActivity: vi.fn() },
}));

vi.mock('../../models/bundle.model.js', () => ({
  default: { findById: vi.fn() },
}));

vi.mock('../../models/shop.model.js', () => ({
  default: { findOne: vi.fn() },
}));

vi.mock('../../../shopify.js', () => ({
  default: {
    api: { clients: { Graphql: vi.fn() } },
  },
}));

const { updateShopifyProduct } = await import('../../controller/bundles/index.js');

// Regression coverage for a bug where this helper built an unused
// `inputFields` array while spreading a mismatched `description` key
// directly into the GraphQL variables - meaning a caller passing
// descriptionHtml never actually sent it to Shopify.
describe('updateShopifyProduct', () => {
  const makeClient = (response = { data: { productUpdate: { product: { id: 'gid://1' }, userErrors: [] } } }) => ({
    request: vi.fn().mockResolvedValue(response),
  });

  it('sends descriptionHtml (not description) as part of a ProductInput', async () => {
    const client = makeClient();
    await updateShopifyProduct(client, { shop: 'test.myshopify.com' }, 'gid://shopify/Product/1', {
      descriptionHtml: '<p>Hello</p>',
    });

    expect(client.request).toHaveBeenCalledTimes(1);
    const [, callArgs] = client.request.mock.calls[0];
    expect(callArgs.variables.input).toEqual({
      id: 'gid://shopify/Product/1',
      descriptionHtml: '<p>Hello</p>',
    });
    expect(callArgs.variables.input.description).toBeUndefined();
  });

  it('includes title when provided alongside descriptionHtml', async () => {
    const client = makeClient();
    await updateShopifyProduct(client, {}, 'gid://shopify/Product/1', {
      title: 'New Title',
      descriptionHtml: '<p>Hello</p>',
    });

    const [, callArgs] = client.request.mock.calls[0];
    expect(callArgs.variables.input).toEqual({
      id: 'gid://shopify/Product/1',
      title: 'New Title',
      descriptionHtml: '<p>Hello</p>',
    });
  });

  it('does nothing and returns null when no recognized fields are provided', async () => {
    const client = makeClient();
    const result = await updateShopifyProduct(client, {}, 'gid://shopify/Product/1', {});

    expect(client.request).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('throws when Shopify returns userErrors', async () => {
    const client = makeClient({
      data: { productUpdate: { product: null, userErrors: [{ field: ['descriptionHtml'], message: 'Too long' }] } },
    });

    await expect(
      updateShopifyProduct(client, {}, 'gid://shopify/Product/1', { descriptionHtml: '<p>Hello</p>' })
    ).rejects.toThrow(/Too long/);
  });
});
