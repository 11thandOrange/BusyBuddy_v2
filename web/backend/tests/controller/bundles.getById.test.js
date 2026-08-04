import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/activityLogService.js', () => ({
  default: { logActivity: vi.fn() },
}));

vi.mock('../../models/bundle.model.js', () => ({
  default: { findOne: vi.fn() },
}));

vi.mock('../../models/shop.model.js', () => ({
  default: { findOne: vi.fn() },
}));

vi.mock('../../../shopify.js', () => ({
  default: { api: { clients: { Graphql: vi.fn() } } },
}));

import { getBundleById } from '../../controller/bundles/index.js';
import Bundle from '../../models/bundle.model.js';
import Shop from '../../models/shop.model.js';

const createMockReq = (params = {}) => ({ params });

const createMockRes = () => ({
  locals: { shopify: { session: { shop: 'test-shop.myshopify.com' } } },
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

describe('getBundleById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the bundle when it exists for this shop (this route was previously missing entirely)', async () => {
    Shop.findOne.mockResolvedValue({ _id: 'shop-1' });
    const bundle = { _id: 'bundle-1', title: 'Summer Bundle', type: 'Bundle Discount' };
    Bundle.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(bundle) });

    const req = createMockReq({ id: 'bundle-1' });
    const res = createMockRes();
    await getBundleById(req, res);

    expect(Bundle.findOne).toHaveBeenCalledWith({ _id: 'bundle-1', shopId: 'shop-1' });
    expect(res.json).toHaveBeenCalledWith({ status: true, data: bundle });
  });

  it('returns 404 when the shop has no matching bundle', async () => {
    Shop.findOne.mockResolvedValue({ _id: 'shop-1' });
    Bundle.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });

    const req = createMockReq({ id: 'missing' });
    const res = createMockRes();
    await getBundleById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 404 when the shop itself is not found', async () => {
    Shop.findOne.mockResolvedValue(null);

    const req = createMockReq({ id: 'bundle-1' });
    const res = createMockRes();
    await getBundleById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(Bundle.findOne).not.toHaveBeenCalled();
  });
});
