import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
