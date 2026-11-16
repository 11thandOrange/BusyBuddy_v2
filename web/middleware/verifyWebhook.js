import crypto from 'crypto';

/**
 * Middleware to verify Shopify webhook HMAC signature.
 *
 * This guards the mandatory compliance webhooks (customers/data_request,
 * customers/redact, shop/redact) as well as app/uninstalled, so it has to
 * reject anything unsigned or mis-signed with a 401 - that behaviour is
 * checked during App Store review.
 */
export function verifyShopifyWebhook(req, res, next) {
  // SKIP_WEBHOOK_VERIFICATION is a local-testing affordance. It used to be
  // honoured unconditionally, which meant a single env var on the production
  // host would accept unsigned payloads on every webhook route, compliance
  // topics included. It is now ignored in production rather than trusted to
  // stay unset, and says so loudly if something sets it there.
  if (process.env.SKIP_WEBHOOK_VERIFICATION === 'true') {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'SKIP_WEBHOOK_VERIFICATION is set in production - ignoring it and verifying signatures as normal'
      );
    } else {
      return next();
    }
  }

  const hmac = req.get('X-Shopify-Hmac-Sha256');

  if (!hmac) {
    console.error('Webhook request missing HMAC signature');
    return res.status(401).json({ error: 'Unauthorized - Missing webhook signature' });
  }

  const body = req.rawBody || JSON.stringify(req.body);
  const secret = process.env.SHOPIFY_API_SECRET;

  if (!secret) {
    console.error('SHOPIFY_API_SECRET not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  // Constant-time comparison: `===` on strings short-circuits at the first
  // differing character, which leaks how much of a forged signature was
  // correct. timingSafeEqual throws when the buffers differ in length, so the
  // length check has to come first - and a malformed base64 signature decodes
  // to a different length, which fails here rather than throwing.
  const expected = Buffer.from(hash, 'base64');
  const provided = Buffer.from(hmac, 'base64');

  if (expected.length === provided.length && crypto.timingSafeEqual(expected, provided)) {
    return next();
  }

  console.error('Webhook HMAC verification failed');
  return res.status(401).json({ error: 'Unauthorized - Invalid webhook signature' });
}
