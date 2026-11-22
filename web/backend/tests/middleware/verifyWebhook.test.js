import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

import { verifyShopifyWebhook } from '../../../middleware/verifyWebhook.js';

const SECRET = 'test-webhook-secret';
const BODY = JSON.stringify({ shop_domain: 'test-shop.myshopify.com' });

const sign = (body, secret = SECRET) =>
  crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64');

const buildReq = (hmac, body = BODY) => ({
  rawBody: body,
  body: JSON.parse(body),
  get: (header) => (header === 'X-Shopify-Hmac-Sha256' ? hmac : undefined),
});

const buildRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

describe('verifyShopifyWebhook', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.SHOPIFY_API_SECRET = SECRET;
    delete process.env.SKIP_WEBHOOK_VERIFICATION;
    delete process.env.NODE_ENV;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('calls next() for a correctly signed payload', () => {
    const next = vi.fn();
    const res = buildRes();

    verifyShopifyWebhook(buildReq(sign(BODY)), res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('401s when the signature header is absent', () => {
    const next = vi.fn();
    const res = buildRes();

    verifyShopifyWebhook(buildReq(undefined), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('401s when the payload was signed with the wrong secret', () => {
    const next = vi.fn();
    const res = buildRes();

    verifyShopifyWebhook(buildReq(sign(BODY, 'not-the-secret')), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('401s when the body was tampered with after signing', () => {
    const next = vi.fn();
    const res = buildRes();
    const signature = sign(BODY);

    verifyShopifyWebhook(buildReq(signature, JSON.stringify({ shop_domain: 'evil.myshopify.com' })), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  // timingSafeEqual throws on length mismatch, so a junk signature has to be
  // rejected by the length guard rather than crashing the request.
  it('401s on a malformed signature instead of throwing', () => {
    const next = vi.fn();
    const res = buildRes();

    expect(() => verifyShopifyWebhook(buildReq('not-valid-base64!!'), res, next)).not.toThrow();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('500s when the app secret is not configured', () => {
    delete process.env.SHOPIFY_API_SECRET;
    const next = vi.fn();
    const res = buildRes();

    verifyShopifyWebhook(buildReq(sign(BODY)), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('honours SKIP_WEBHOOK_VERIFICATION outside production', () => {
    process.env.SKIP_WEBHOOK_VERIFICATION = 'true';
    process.env.NODE_ENV = 'development';
    const next = vi.fn();
    const res = buildRes();

    verifyShopifyWebhook(buildReq('garbage'), res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  // The whole point of the hardening: a stray env var on the production host
  // must not turn the mandatory compliance webhooks into open endpoints.
  it('ignores SKIP_WEBHOOK_VERIFICATION in production and still rejects bad signatures', () => {
    process.env.SKIP_WEBHOOK_VERIFICATION = 'true';
    process.env.NODE_ENV = 'production';
    const next = vi.fn();
    const res = buildRes();

    verifyShopifyWebhook(buildReq('garbage'), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('still admits a correctly signed payload in production with the flag set', () => {
    process.env.SKIP_WEBHOOK_VERIFICATION = 'true';
    process.env.NODE_ENV = 'production';
    const next = vi.fn();
    const res = buildRes();

    verifyShopifyWebhook(buildReq(sign(BODY)), res, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
