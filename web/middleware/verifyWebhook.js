import crypto from 'crypto';

/**
 * Middleware to verify Shopify webhook HMAC signature
 * For testing, set SKIP_WEBHOOK_VERIFICATION=true in .env
 */
export function verifyShopifyWebhook(req, res, next) {
  // Skip verification in development/testing if needed
  if (process.env.SKIP_WEBHOOK_VERIFICATION === 'true') {
    return next();
  }

  const hmac = req.get('X-Shopify-Hmac-Sha256');
  
  // If no HMAC header, this might be an internal call (e.g., subscription changes)
  // For internal webhooks, you can add additional verification like IP whitelist or internal tokens
  if (!hmac) {
    return next();
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

  if (hash === hmac) {
    return next();
  }
  
  console.error('Webhook HMAC verification failed');
  return res.status(401).json({ error: 'Unauthorized - Invalid webhook signature' });
}
