import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../shopify.js', () => ({
  default: {
    api: {
      rest: {
        Shop: { all: vi.fn() },
      },
    },
  },
}));

vi.mock('../models/shop.model.js', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../models/referralEvent.model.js', () => ({
  default: { create: vi.fn() },
}));

vi.mock('../models/referral.model.js', () => ({
  default: { findOne: vi.fn() },
}));

import shopify from '../../shopify.js';
import shop from '../models/shop.model.js';
import referralEventModel from '../models/referralEvent.model.js';
import referralModel from '../models/referral.model.js';
import shopDataMiddleware from '../../middleware/shopData.js';

const SHOPIFY_SHOP_RECORD = {
  id: 998877,
  name: 'Test Shop',
  domain: 'test-shop.com',
  country: 'US',
  myshopify_domain: 'test-shop.myshopify.com',
};

function createReqRes(query = {}) {
  return {
    req: { query },
    res: { locals: { shopify: { session: { shop: 'test-shop.myshopify.com' } } } },
    next: vi.fn(),
  };
}

describe('shopData install middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shopify.api.rest.Shop.all.mockResolvedValue({ data: [SHOPIFY_SHOP_RECORD] });
  });

  it('creates a new Shop record on first install and calls next()', async () => {
    shop.findOne.mockResolvedValue(null);
    const { req, res, next } = createReqRes();

    await shopDataMiddleware.shopData(req, res, next);

    expect(shop.create).toHaveBeenCalledWith(
      expect.objectContaining({
        shopId: 998877,
        shopName: 'Test Shop',
        shopDomain: 'test-shop.com',
        myshopify_domain: 'test-shop.myshopify.com',
        status: 'active',
      })
    );
    expect(next).toHaveBeenCalled();
  });

  it('does not create a duplicate Shop record when one already exists', async () => {
    shop.findOne.mockResolvedValue({ _id: 'existing-shop', myshopify_domain: 'test-shop.myshopify.com' });
    const { req, res, next } = createReqRes();

    await shopDataMiddleware.shopData(req, res, next);

    expect(shop.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('tracks a referral install event when a valid, active referral code is present', async () => {
    shop.findOne.mockResolvedValue(null);
    referralModel.findOne.mockResolvedValue({ code: 'PARTNER1', is_active: true });
    const { req, res, next } = createReqRes({ ref: 'PARTNER1', source: 'newsletter', campaign: 'launch' });

    await shopDataMiddleware.shopData(req, res, next);

    expect(shop.create).toHaveBeenCalledWith(
      expect.objectContaining({ referral_code: 'PARTNER1', referral_source: 'newsletter', referral_campaign: 'launch' })
    );
    expect(referralEventModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        referral_code: 'PARTNER1',
        event_type: 'install',
        myshopify_domain: 'test-shop.myshopify.com',
      })
    );
    expect(next).toHaveBeenCalled();
  });

  it('does not track a referral install event for an unknown/inactive referral code', async () => {
    shop.findOne.mockResolvedValue(null);
    referralModel.findOne.mockResolvedValue(null);
    const { req, res, next } = createReqRes({ ref: 'NOT-A-REAL-CODE' });

    await shopDataMiddleware.shopData(req, res, next);

    expect(referralEventModel.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('still calls next() when referral event tracking throws', async () => {
    shop.findOne.mockResolvedValue(null);
    referralModel.findOne.mockRejectedValue(new Error('DB unavailable'));
    const { req, res, next } = createReqRes({ ref: 'PARTNER1' });

    await shopDataMiddleware.shopData(req, res, next);

    // A failure in the best-effort referral tracking must not block
    // installation from completing.
    expect(next).toHaveBeenCalled();
  });

  it('backfills referral info on an existing shop that was installed without one', async () => {
    shop.findOne.mockResolvedValue({ _id: 'existing-shop', myshopify_domain: 'test-shop.myshopify.com', referral_code: null });
    const { req, res, next } = createReqRes({ ref: 'PARTNER1', source: 'ads' });

    await shopDataMiddleware.shopData(req, res, next);

    expect(shop.findOneAndUpdate).toHaveBeenCalledWith(
      { myshopify_domain: 'test-shop.myshopify.com' },
      expect.objectContaining({ referral_code: 'PARTNER1', referral_source: 'ads' })
    );
    expect(next).toHaveBeenCalled();
  });

  it('does not overwrite an existing shop that already has a referral code', async () => {
    shop.findOne.mockResolvedValue({ _id: 'existing-shop', myshopify_domain: 'test-shop.myshopify.com', referral_code: 'ORIGINAL' });
    const { req, res, next } = createReqRes({ ref: 'NEW-CODE' });

    await shopDataMiddleware.shopData(req, res, next);

    expect(shop.findOneAndUpdate).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
