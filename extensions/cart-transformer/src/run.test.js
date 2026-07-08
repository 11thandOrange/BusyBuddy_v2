import { describe, it, expect } from 'vitest';
import { run } from './run';

/**
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

describe('cart transform function', () => {
  it('returns no operations', () => {
    const result = run({ cart: { lines: [] } });
    const expected = /** @type {FunctionRunResult} */ ({ operations: [] });

    expect(result).toEqual(expected);
  });

  it('does not crash the whole cart when one bundle has no discount value', () => {
    const cartLine = {
      id: 'gid://shopify/CartLine/1',
      bundleVariantIds: { value: '111,222' },
      merchandise: {
        __typename: 'ProductVariant',
        product: {
          bundledProducts: { value: '111:10.00,222:20.00' },
          // bundledDiscountValue intentionally absent (legacy/malformed bundle)
          bundledDiscountValue: { value: '' },
          bundledDiscountType: { value: 'percentage' },
        },
      },
    };

    expect(() => run({ cart: { lines: [cartLine] } })).not.toThrow();

    const result = run({ cart: { lines: [cartLine] } });
    expect(result.operations).toHaveLength(1);
    expect(result.operations[0].expand.expandedCartItems).toHaveLength(2);
  });

  it('skips a malformed bundle line without aborting the rest of the cart', () => {
    const badLine = {
      id: 'gid://shopify/CartLine/bad',
      bundleVariantIds: { value: '111,222' },
      merchandise: {
        __typename: 'ProductVariant',
        product: {
          bundledProducts: { value: '' },
          bundledDiscountValue: { value: '' },
          bundledDiscountType: { value: null },
        },
      },
    };
    const normalLine = {
      id: 'gid://shopify/CartLine/ok',
      bundleVariantIds: { value: null },
      merchandise: { __typename: 'ProductVariant' },
    };

    const result = run({ cart: { lines: [badLine, normalLine] } });
    expect(result.operations).toEqual([]);
  });
});