import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as crypto from 'crypto';

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

// web/index.js derives STATIC_PATH from process.cwd() (there's no build
// step under test, so it resolves to <cwd>/frontend/), matching how
// `npm run serve` is actually launched - as an npm script, whose cwd is
// always the package's own directory (web/), not wherever the shell
// happened to be. CI's own backend-test job cwd is web/backend though
// (see .github/workflows/ci.yml's `working-directory: web/backend`), so
// without this the process never finds frontend/editor.html to serve.
// process.chdir() itself isn't available in Vitest's worker threads, so
// process.cwd() is stubbed instead - it's read once, at import time, by
// web/index.js's STATIC_PATH constant.
const __dirname = dirname(fileURLToPath(import.meta.url));
vi.spyOn(process, 'cwd').mockReturnValue(join(__dirname, '../..'));

let app;
let shopify;

beforeAll(async () => {
  ({ default: app } = await import('../../index.js'));
  ({ default: shopify } = await import('../../shopify.js'));
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
  // editor.html used to be gated behind a server-side session lookup that
  // substituted a signed shop/signature pair into the page - which only
  // ever ran when Express itself served the file. In local dev
  // (`npm run dev`), Vite's dev server serves editor.html directly and
  // never goes near this Express app at all, so that gate silently never
  // applied and the page always loaded with unsubstituted placeholders.
  // editor.html is now a plain static file with no server-side gating: the
  // signed shop/signature pair is fetched from GET /api/editor/signature
  // and put directly in the URL before the tab is even opened (see
  // web/frontend/utils/openEditorTab.js), so this route just needs to
  // serve the file, identically in dev and production.
  it('serves the file directly with no session check or redirect', async () => {
    const res = await request(app).get('/editor.html?shop=test-shop.myshopify.com');

    expect(res.status).toBe(200);
    expect(res.text).toContain('BusyBuddy Editor');
  });
});

describe('GET /api/editor/signature - integration', () => {
  // Called by the main embedded app right before it opens the standalone
  // editor tab. It goes through the same /api/* auth middleware as every
  // other authenticated endpoint, so with no session token in this request
  // it correctly falls through to shopify.validateAuthenticatedSession()
  // and gets rejected rather than ever minting a signature.
  it('rejects a request with no valid App Bridge session', async () => {
    const res = await request(app).get('/api/editor/signature');

    expect(res.status).not.toBe(200);
  });
});

// Real Shopify App Proxy requests (getActiveBundle/getInactiveTab/
// getAnnouncementBar, hit directly by storefront visitors) sign every query
// param, not just `shop` - the /api/* middleware used to only check the
// shop-only signature the standalone editor mints for itself, so a real
// proxy request's signature could never match and always 401'd.
function signAllParams(params) {
  const parts = Object.entries(params).map(([key, value]) => `${key}=${value}`);
  return crypto.createHmac('sha256', 'test-api-secret').update(parts.sort().join('')).digest('hex');
}

describe('GET /api/frontStore/* (App Proxy) - integration', () => {
  it('accepts a request signed the way Shopify actually signs App Proxy calls (all params, not just shop)', async () => {
    // loadSession would otherwise try to actually reach this test's
    // deliberately-unreachable DB_CONNECTION host and hang - stubbed here
    // purely so the test can observe the signature check's own outcome
    // without waiting on a real Mongo connection attempt.
    const loadSessionSpy = vi.spyOn(shopify.config.sessionStorage, 'loadSession').mockResolvedValue(null);

    const params = { shop: 'test-shop.myshopify.com', product_id: '123', timestamp: '1700000000' };
    const signature = signAllParams(params);

    const res = await request(app).get(
      `/api/frontStore/getActiveBundle?shop=${params.shop}&product_id=${params.product_id}&timestamp=${params.timestamp}&signature=${signature}`
    );

    // The signature itself must be accepted (not the old "Invalid request
    // signature" 401) - it still 401s past that point since no offline
    // session exists in this test's empty session storage, which is a
    // separate, correctly-behaving check.
    expect(res.body?.message).not.toMatch(/invalid request signature/i);
    expect(res.body?.message).toMatch(/no active session found/i);

    loadSessionSpy.mockRestore();
  });

  it('still rejects a request with a wrong/forged signature', async () => {
    const res = await request(app).get(
      '/api/frontStore/getActiveBundle?shop=test-shop.myshopify.com&product_id=123&signature=not-a-real-signature'
    );

    expect(res.status).toBe(401);
    expect(res.body?.message).toMatch(/invalid request signature/i);
  });
});
