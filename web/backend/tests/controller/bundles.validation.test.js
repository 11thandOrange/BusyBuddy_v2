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

const { validateBundlePayload } = await import('../../controller/bundles/index.js');

describe('validateBundlePayload', () => {
  const validCreatePayload = {
    title: 'Summer Bundle',
    products: [{ productId: 'gid://shopify/Product/1' }],
    discountType: 'Percentage',
    discountValue: 20,
  };

  it('accepts a valid create payload', () => {
    expect(validateBundlePayload(validCreatePayload)).toBeNull();
  });

  it('rejects a missing title on create', () => {
    const { title, ...rest } = validCreatePayload;
    expect(validateBundlePayload(rest)).toMatch(/title is required/i);
  });

  it('rejects a blank title', () => {
    expect(validateBundlePayload({ ...validCreatePayload, title: '   ' })).toMatch(/title cannot be empty/i);
  });

  it('rejects a title over the max length', () => {
    expect(validateBundlePayload({ ...validCreatePayload, title: 'a'.repeat(300) })).toMatch(/255 characters/i);
  });

  it('rejects a create payload with no products and no BOGO products', () => {
    expect(validateBundlePayload({ title: 'X', discountType: 'Percentage', discountValue: 10 })).toMatch(/at least one product/i);
  });

  it('accepts BOGO products in place of the general products array', () => {
    const payload = {
      title: 'BOGO',
      productsX: [{ productId: 'x1' }],
      productsY: [{ productId: 'y1' }],
    };
    expect(validateBundlePayload(payload)).toBeNull();
  });

  it('rejects a negative discount value', () => {
    expect(validateBundlePayload({ ...validCreatePayload, discountValue: -5 })).toMatch(/non-negative/i);
  });

  it('rejects a percentage discount over 100', () => {
    expect(validateBundlePayload({ ...validCreatePayload, discountValue: 150 })).toMatch(/cannot exceed 100/i);
  });

  it('allows a fixed-amount discount over 100', () => {
    expect(validateBundlePayload({ ...validCreatePayload, discountType: 'Fixed Amount', discountValue: 150 })).toBeNull();
  });

  it('rejects startDate on or after endDate', () => {
    const payload = { ...validCreatePayload, startDate: '2026-05-10', endDate: '2026-05-01' };
    expect(validateBundlePayload(payload)).toMatch(/start date must be before end date/i);
  });

  it('accepts a valid date range', () => {
    const payload = { ...validCreatePayload, startDate: '2026-05-01', endDate: '2026-05-10' };
    expect(validateBundlePayload(payload)).toBeNull();
  });

  it('rejects a non-integer quantity break', () => {
    const payload = { ...validCreatePayload, quantityBreaks: [{ quantity: 2.5, discount: 10 }] };
    expect(validateBundlePayload(payload)).toMatch(/positive whole-number quantity/i);
  });

  it('rejects duplicate quantity breaks', () => {
    const payload = {
      ...validCreatePayload,
      quantityBreaks: [
        { quantity: 2, discount: 10 },
        { quantity: 2, discount: 15 },
      ],
    };
    expect(validateBundlePayload(payload)).toMatch(/duplicate quantity break/i);
  });

  it('rejects a negative quantity-break discount', () => {
    const payload = { ...validCreatePayload, quantityBreaks: [{ quantity: 2, discount: -10 }] };
    expect(validateBundlePayload(payload)).toMatch(/non-negative discount/i);
  });

  it('accepts valid quantity breaks', () => {
    const payload = {
      ...validCreatePayload,
      quantityBreaks: [
        { quantity: 2, discount: 10 },
        { quantity: 3, discount: 15 },
      ],
    };
    expect(validateBundlePayload(payload)).toBeNull();
  });

  it('rejects a tierDiscounts percentage over 100', () => {
    const payload = { ...validCreatePayload, tierDiscounts: { 2: 150 } };
    expect(validateBundlePayload(payload)).toMatch(/cannot exceed 100/i);
  });

  it('accepts valid tierDiscounts', () => {
    const payload = { ...validCreatePayload, tierDiscounts: { 2: 10, 3: 15 } };
    expect(validateBundlePayload(payload)).toBeNull();
  });

  describe('update payloads (requireProducts: false, requireTitle: false)', () => {
    const updateOptions = { requireProducts: false, requireTitle: false };

    it('allows omitting title and products entirely', () => {
      expect(validateBundlePayload({ discountValue: 10 }, updateOptions)).toBeNull();
    });

    it('rejects an empty products array explicitly sent to wipe products', () => {
      expect(validateBundlePayload({ products: [] }, updateOptions)).toMatch(/at least one product/i);
    });

    it('rejects an explicitly blank title', () => {
      expect(validateBundlePayload({ title: '' }, updateOptions)).toMatch(/title cannot be empty/i);
    });
  });
});
