import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

// web/index.js reads Shopify config + DB env vars at import time (shopify.js
// throws synchronously if apiKey/apiSecretKey/hostName are missing), so
// these must be set *before* it's imported. A dynamic import inside
// beforeAll (after setting them here) is used instead of a static top-level
// import, since static imports are hoisted above any test-file code.
process.env.NODE_ENV = 'test';
process.env.SHOPIFY_API_KEY = 'test-api-key';
process.env.SHOPIFY_API_SECRET = 'test-api-secret';
process.env.HOST = 'https://test-app.example.com';
process.env.SCOPES = 'read_products,write_products';
process.env.DB_CONNECTION = 'mongodb://127.0.0.1:1/unused-in-this-test';
process.env.DB_NAME = 'test';

let app;

beforeAll(async () => {
  ({ default: app } = await import('../../index.js'));
});

describe('GET /api/auth (OAuth begin) - integration', () => {
  it('redirects to the shop\'s Shopify OAuth authorize URL with the correct params', async () => {
    const res = await request(app).get('/api/auth?shop=test-shop.myshopify.com');

    expect(res.status).toBe(302);
    const location = new URL(res.headers.location);
    expect(location.hostname).toBe('test-shop.myshopify.com');
    expect(location.pathname).toBe('/admin/oauth/authorize');
    expect(location.searchParams.get('client_id')).toBe('test-api-key');
    expect(location.searchParams.get('scope')).toBeTruthy();
    expect(location.searchParams.get('redirect_uri')).toBe('https://test-app.example.com/api/auth/callback');
    // The library generates a per-request nonce and stores it server-side
    // (as a signed cookie) to be checked against the callback's `state`
    // param - this is the CSRF protection for the OAuth flow.
    expect(location.searchParams.get('state')).toBeTruthy();
  });

  it('rejects a request with no shop param rather than redirecting blindly', async () => {
    const res = await request(app).get('/api/auth');

    // The Shopify API library requires a shop param to know which store to
    // authorize against; without one it must not produce a redirect at all.
    expect(res.status).not.toBe(302);
  });

  it('rejects a shop domain that is not a valid *.myshopify.com host', async () => {
    const res = await request(app).get('/api/auth?shop=not-a-real-shop-domain.com');

    expect(res.status).not.toBe(302);
  });
});

describe('GET /api/auth/callback (OAuth callback) - integration', () => {
  it('restarts the OAuth flow instead of completing installation for an invalid callback', async () => {
    // A real callback from Shopify includes a state matching the nonce
    // cookie set during /api/auth and an hmac signed with the app's client
    // secret. Forging a full, valid token exchange is out of scope here (it
    // requires faking Shopify's token endpoint), but this exercises real
    // validation in our route wiring: without a matching OAuth cookie
    // (supertest has no browser session), the library must not treat this
    // as a completed install - it redirects back into the OAuth flow
    // rather than ever reaching shopData.shopData/redirectToShopifyOrAppRoot.
    const res = await request(app).get(
      '/api/auth/callback?shop=test-shop.myshopify.com&code=fake-code&state=fake-state&hmac=0000000000000000000000000000000000000000000000000000000000000000'
    );

    expect(res.status).toBe(302);
    const location = new URL(res.headers.location);
    expect(location.pathname).toBe('/admin/oauth/authorize');
  });
});

describe('GET /editor.html (standalone editor) - integration', () => {
  // This route's session lookup goes through mongoose against the fake,
  // unreachable DB_CONNECTION set up above, so it takes the full
  // serverSelectionTimeoutMS (mongoose's 30s default, not something this
  // test configures) to give up before the redirect fires - hence the long
  // timeout here, not a slow assertion.
  it('redirects to OAuth instead of serving the raw, un-substituted editor.html when there is no session for the shop', async () => {
    // Regression test: this route used to fall through to serve-static when
    // no session was found, which answers with the built editor.html file
    // exactly as it is on disk - still containing the literal
    // %EDITOR_SHOP%/%EDITOR_SIGNATURE% placeholders, since the substitution
    // in serveEditorHtml never ran. Every /api/* call the editor then made
    // was signed with that literal placeholder text and failed auth with a
    // confusing 401 far from the actual cause (no session for this shop).
    const res = await request(app).get('/editor.html?shop=test-shop.myshopify.com');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/api/auth?shop=test-shop.myshopify.com');
  }, 35000);
});
