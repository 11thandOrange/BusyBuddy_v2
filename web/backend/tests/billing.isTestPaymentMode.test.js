import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// billing.js imports shopify.js, which eagerly constructs the Shopify API
// client and a MongoDB session store from env vars - neither of which is
// available in the test environment, so it's mocked out here.
vi.mock('../../shopify.js', () => ({
  default: {
    api: {
      billing: {
        check: vi.fn(),
        request: vi.fn(),
      },
    },
  },
}));

import { isTestPaymentMode } from '../../billing.js';

describe('isTestPaymentMode', () => {
  const originalPaymentMode = process.env.SHOPIFY_PAYMENT_MODE;
  const originalNodeEnv = process.env.NODE_ENV;
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    if (originalPaymentMode === undefined) {
      delete process.env.SHOPIFY_PAYMENT_MODE;
    } else {
      process.env.SHOPIFY_PAYMENT_MODE = originalPaymentMode;
    }
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
    warnSpy.mockRestore();
  });

  it('returns true when explicitly set to "true"', () => {
    process.env.SHOPIFY_PAYMENT_MODE = 'true';
    expect(isTestPaymentMode()).toBe(true);
  });

  it('returns false when explicitly set to "false"', () => {
    process.env.SHOPIFY_PAYMENT_MODE = 'false';
    expect(isTestPaymentMode()).toBe(false);
  });

  it('does not throw and falls back to NODE_ENV when unset', () => {
    delete process.env.SHOPIFY_PAYMENT_MODE;
    process.env.NODE_ENV = 'production';
    expect(() => isTestPaymentMode()).not.toThrow();
    expect(isTestPaymentMode()).toBe(false);
  });

  it('defaults to test mode when unset and NODE_ENV is not production', () => {
    delete process.env.SHOPIFY_PAYMENT_MODE;
    process.env.NODE_ENV = 'development';
    expect(isTestPaymentMode()).toBe(true);
  });

  it('does not throw and falls back to NODE_ENV default for a malformed value', () => {
    process.env.SHOPIFY_PAYMENT_MODE = 'not-json';
    process.env.NODE_ENV = 'development';
    expect(() => isTestPaymentMode()).not.toThrow();
    expect(isTestPaymentMode()).toBe(true);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('does not throw and falls back to NODE_ENV default for a non-boolean JSON value', () => {
    process.env.SHOPIFY_PAYMENT_MODE = '"yes"';
    process.env.NODE_ENV = 'production';
    expect(() => isTestPaymentMode()).not.toThrow();
    expect(isTestPaymentMode()).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
  });
});
