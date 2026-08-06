import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/shop.model.js', () => ({
  default: { findOne: vi.fn(), create: vi.fn() },
}));

vi.mock('../../../shopify.js', () => ({
  default: {
    api: {
      rest: { Shop: { all: vi.fn() } },
    },
  },
}));

import { getOrCreateShop } from '../../services/shopService.js';
import Shop from '../../models/shop.model.js';
import shopify from '../../../shopify.js';

const session = { shop: 'test-shop.myshopify.com' };

describe('getOrCreateShop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the existing Shop doc without calling the Admin API', async () => {
    const existing = { _id: 'existing-1', myshopify_domain: session.shop };
    Shop.findOne.mockResolvedValue(existing);

    const result = await getOrCreateShop(session);

    expect(result).toBe(existing);
    expect(shopify.api.rest.Shop.all).not.toHaveBeenCalled();
    expect(Shop.create).not.toHaveBeenCalled();
  });

  it('creates a Shop doc from the Admin API when none exists', async () => {
    Shop.findOne.mockResolvedValue(null);
    shopify.api.rest.Shop.all.mockResolvedValue({
      data: [{ id: 42, name: 'Healed Shop', domain: 'healed.myshopify.com', country: 'US', myshopify_domain: session.shop }],
    });
    Shop.create.mockResolvedValue({ _id: 'new-shop' });

    const result = await getOrCreateShop(session);

    expect(Shop.create).toHaveBeenCalledWith(
      expect.objectContaining({ shopId: 42, shopName: 'Healed Shop', myshopify_domain: session.shop, status: 'active' })
    );
    expect(result).toEqual({ _id: 'new-shop' });
  });

  it('returns null (rather than throwing) when the Admin API returns no shop data', async () => {
    Shop.findOne.mockResolvedValue(null);
    shopify.api.rest.Shop.all.mockResolvedValue({ data: [] });

    const result = await getOrCreateShop(session);

    expect(result).toBeNull();
    expect(Shop.create).not.toHaveBeenCalled();
  });

  it('returns null (rather than throwing) when the Admin API call itself rejects', async () => {
    Shop.findOne.mockResolvedValue(null);
    shopify.api.rest.Shop.all.mockRejectedValue(new Error('rate limited'));

    await expect(getOrCreateShop(session)).resolves.toBeNull();
    expect(Shop.create).not.toHaveBeenCalled();
  });
});
