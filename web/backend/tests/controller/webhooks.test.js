import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleOrderPaid } from '../../controller/webhooks/index.js';

// Mock dependencies
vi.mock('../../services/activityLogService.js', () => ({
  default: {
    logActivity: vi.fn(),
  },
}));

vi.mock('../../models/bundle.model.js', () => ({
  default: {
    findOne: vi.fn().mockReturnThis(),
    lean: vi.fn(),
  },
}));

import activityLogService from '../../services/activityLogService.js';
import Bundle from '../../models/bundle.model.js';

const createMockReq = (body = {}, headers = {}) => ({
  body,
  headers: {
    'x-shopify-shop-domain': 'test-shop.myshopify.com',
    ...headers,
  },
});

const createMockRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  send: vi.fn().mockReturnThis(),
});

describe('handleOrderPaid Webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if shop domain header missing', async () => {
    const req = createMockReq({}, { 'x-shopify-shop-domain': undefined });
    delete req.headers['x-shopify-shop-domain'];
    const res = createMockRes();

    await handleOrderPaid(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ERROR',
      message: 'Missing shop domain header',
    });
  });

  it('should process discount codes from order', async () => {
    const mockBundle = {
      _id: 'bundle-123',
      title: 'Summer Bundle',
      type: 'Bundle Discount',
    };
    Bundle.findOne.mockReturnThis();
    Bundle.lean.mockResolvedValue(mockBundle);

    const req = createMockReq({
      id: 'order-123',
      total_price: '99.99',
      discount_codes: [{ code: 'SUMMER20' }],
      discount_applications: [],
    });
    const res = createMockRes();

    await handleOrderPaid(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should log purchase activity for identified app discounts', async () => {
    const mockBundle = {
      _id: 'bundle-123',
      title: 'Summer Bundle',
      type: 'Bundle Discount',
    };
    Bundle.findOne.mockReturnThis();
    Bundle.lean.mockResolvedValue(mockBundle);

    const req = createMockReq({
      id: 'order-123',
      total_price: '99.99',
      discount_codes: [{ code: 'SUMMER20' }],
      discount_applications: [],
    });
    const res = createMockRes();

    await handleOrderPaid(req, res);

    expect(activityLogService.logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        shopId: 'test-shop.myshopify.com',
        type: 'purchase',
        widget: 'bundle',
      })
    );
  });

  it('should check automatic discounts', async () => {
    Bundle.findOne.mockReturnThis();
    Bundle.lean.mockResolvedValue(null);

    const req = createMockReq({
      id: 'order-123',
      total_price: '99.99',
      discount_codes: [],
      discount_applications: [{ type: 'automatic' }],
      line_items: [],
    });
    const res = createMockRes();

    await handleOrderPaid(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 200 even on error (acknowledge receipt)', async () => {
    Bundle.findOne.mockImplementation(() => {
      throw new Error('Database error');
    });

    const req = createMockReq({
      id: 'order-123',
      discount_codes: [{ code: 'TEST' }],
    });
    const res = createMockRes();

    await handleOrderPaid(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  describe('identifyAppDiscount', () => {
    it('should identify bundle discount', async () => {
      const mockBundle = {
        _id: 'bundle-123',
        title: 'Test Bundle',
        type: 'Bundle Discount',
      };
      Bundle.findOne.mockReturnThis();
      Bundle.lean.mockResolvedValue(mockBundle);

      const req = createMockReq({
        id: 'order-123',
        total_price: '99.99',
        discount_codes: [{ code: 'BUNDLE10' }],
        discount_applications: [],
      });
      const res = createMockRes();

      await handleOrderPaid(req, res);

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          widget: 'bundle',
          title: expect.stringContaining('Bundle'),
        })
      );
    });

    it('should identify BOGO discount', async () => {
      const mockBundle = {
        _id: 'bogo-123',
        title: 'Buy 2 Get 1',
        type: 'Buy One Get One',
      };
      Bundle.findOne.mockReturnThis();
      Bundle.lean.mockResolvedValue(mockBundle);

      const req = createMockReq({
        id: 'order-123',
        total_price: '149.99',
        discount_codes: [{ code: 'BOGO' }],
        discount_applications: [],
      });
      const res = createMockRes();

      await handleOrderPaid(req, res);

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          widget: 'bogo',
        })
      );
    });

    it('should identify volume discount', async () => {
      const mockBundle = {
        _id: 'volume-123',
        title: 'Bulk Discount',
        type: 'Volume Discount',
      };
      Bundle.findOne.mockReturnThis();
      Bundle.lean.mockResolvedValue(mockBundle);

      const req = createMockReq({
        id: 'order-123',
        total_price: '199.99',
        discount_codes: [{ code: 'BULK20' }],
        discount_applications: [],
      });
      const res = createMockRes();

      await handleOrderPaid(req, res);

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          widget: 'volume',
        })
      );
    });

    it('should return null for unknown discount (no activity logged)', async () => {
      Bundle.findOne.mockReturnThis();
      Bundle.lean.mockResolvedValue(null);

      const req = createMockReq({
        id: 'order-123',
        total_price: '99.99',
        discount_codes: [{ code: 'UNKNOWN' }],
        discount_applications: [],
      });
      const res = createMockRes();

      await handleOrderPaid(req, res);

      expect(activityLogService.logActivity).not.toHaveBeenCalled();
    });
  });

  describe('identifyBundleFromOrder', () => {
    it('should identify bundle from line item with busybuddybundles tag', async () => {
      const mockBundle = {
        _id: 'bundle-123',
        title: 'Summer Bundle',
        type: 'Bundle Discount',
      };
      Bundle.findOne.mockReturnThis();
      Bundle.lean.mockResolvedValueOnce(null).mockResolvedValueOnce(mockBundle);

      const req = createMockReq({
        id: 'order-123',
        total_price: '99.99',
        discount_codes: [],
        discount_applications: [{ type: 'automatic' }],
        line_items: [
          {
            product_id: 'prod-123',
            properties: [{ name: '_tags', value: 'busybuddybundles' }],
          },
        ],
      });
      const res = createMockRes();

      await handleOrderPaid(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return null if no matching bundle', async () => {
      Bundle.findOne.mockReturnThis();
      Bundle.lean.mockResolvedValue(null);

      const req = createMockReq({
        id: 'order-123',
        total_price: '99.99',
        discount_codes: [],
        discount_applications: [{ type: 'automatic' }],
        line_items: [
          {
            product_id: 'prod-123',
            properties: [],
          },
        ],
      });
      const res = createMockRes();

      await handleOrderPaid(req, res);

      expect(activityLogService.logActivity).not.toHaveBeenCalled();
    });
  });
});
