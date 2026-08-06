import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

vi.mock('../../models/subscription.model.js', () => {
  // A real class (not a plain object) so `subscriptionData instanceof
  // subscriptionModel` in toggleApp doesn't throw - it only needs to be
  // callable, findOne/create results in these tests are plain objects and
  // so correctly evaluate as "not an instance" (skipping .save()).
  class MockSubscriptionModel {}
  MockSubscriptionModel.findOne = vi.fn();
  MockSubscriptionModel.create = vi.fn();
  return { default: MockSubscriptionModel };
});

vi.mock('../../../shopify.js', () => ({
  default: {
    api: {
      billing: { check: vi.fn(), request: vi.fn() },
      clients: { Rest: vi.fn() },
    },
  },
}));

vi.mock('../../services/merchantEventService.js', () => ({
  merchantEventService: {
    handleSubscriptionUpgrade: vi.fn(() => Promise.resolve()),
    handleSubscriptionDowngrade: vi.fn(() => Promise.resolve()),
  },
}));

import subscriptionModel from '../../models/subscription.model.js';
import shopify from '../../../shopify.js';
import { getExtensionStatus, getThemeEditorUrl } from '../../controller/subscription/index.js';

const createMockRes = (session) => ({
  locals: { shopify: { session } },
  json: vi.fn().mockReturnThis(),
  status: vi.fn().mockReturnThis(),
});

const THEMES_RESPONSE = { body: { themes: [{ id: 111, role: 'main' }] } };

// Builds a Rest client mock: `assets` maps an asset[key] string to the raw
// JSON string that would come back as `asset.value`. Anything not listed
// 404s, matching how a theme without that section/template actually behaves.
function mockRestClient(assets) {
  shopify.api.clients.Rest.mockImplementation(() => ({
    get: vi.fn(({ path, query }) => {
      if (path === 'themes') return Promise.resolve(THEMES_RESPONSE);
      const key = query?.['asset[key]'];
      if (path === 'themes/111/assets' && assets[key]) {
        return Promise.resolve({ body: { asset: { value: assets[key] } } });
      }
      return Promise.reject(new Error('not found'));
    }),
  }));
}

// checkExtensionStatus caches per shop+appId for 30s, so each test uses its
// own shop domain to avoid one test's mocked result leaking into the next.
let shopCounter = 0;
const nextShop = () => `test-shop-${++shopCounter}.myshopify.com`;

describe('getExtensionStatus - per-block theme detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports enabled for a body-target embed (inactive_tab) found in settings_data.json', async () => {
    mockRestClient({
      'config/settings_data.json': JSON.stringify({
        current: {
          blocks: {
            abc: { type: 'shopify://apps/busybuddy/blocks/inactive_tab/some-uuid', disabled: false },
          },
        },
      }),
    });

    const req = { query: { appId: 'inactive_tab' } };
    const res = createMockRes({ shop: nextShop() });
    await getExtensionStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ extensionEnabled: true }) })
    );
  });

  it('reports disabled for a body-target embed explicitly turned off', async () => {
    mockRestClient({
      'config/settings_data.json': JSON.stringify({
        current: {
          blocks: {
            abc: { type: 'shopify://apps/busybuddy/blocks/inactive_tab/some-uuid', disabled: true },
          },
        },
      }),
    });

    const req = { query: { appId: 'inactive_tab' } };
    const res = createMockRes({ shop: nextShop() });
    await getExtensionStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ extensionEnabled: false }) })
    );
  });

  it('reports enabled for a section-target block (the shared bundle block) found on the product template', async () => {
    mockRestClient({
      'templates/product.json': JSON.stringify({
        sections: {
          main: {
            blocks: {
              xyz: { type: 'shopify://apps/busybuddy/blocks/bundles_and_discounts/some-uuid' },
            },
          },
        },
      }),
    });

    for (const appId of ['bundle_discount', 'buy_one_get_one', 'volume_discounts', 'mix_match']) {
      const req = { query: { appId } };
      const res = createMockRes({ shop: nextShop() });
      await getExtensionStatus(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ appId, extensionEnabled: true }) })
      );
    }
  });

  it('reports disabled when none of the scanned templates contain the block', async () => {
    mockRestClient({
      'templates/product.json': JSON.stringify({ sections: {} }),
    });

    const req = { query: { appId: 'bundle_discount' } };
    const res = createMockRes({ shop: nextShop() });
    await getExtensionStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ extensionEnabled: false }) })
    );
  });

  it('checks both scan locations for announcement_bar, not just header-group', async () => {
    mockRestClient({
      'templates/index.json': JSON.stringify({
        sections: { hero: { blocks: { b1: { type: 'shopify://apps/busybuddy/blocks/announcement_bar/uuid' } } } },
      }),
    });

    const req = { query: { appId: 'announcement_bar' } };
    const res = createMockRes({ shop: nextShop() });
    await getExtensionStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ extensionEnabled: true }) })
    );
  });

  it('rejects an unknown appId', async () => {
    const req = { query: { appId: 'not_a_real_app' } };
    const res = createMockRes({ shop: nextShop() });
    await getExtensionStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('getThemeEditorUrl - per-app deep link generation', () => {
  const originalEnv = process.env.SHOPIFY_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SHOPIFY_API_KEY = 'test-uid-123';
  });

  afterAll(() => {
    process.env.SHOPIFY_API_KEY = originalEnv;
  });

  it('builds an activateAppId (app-embed) link for inactive_tab', async () => {
    const req = { query: { appId: 'inactive_tab' } };
    const res = createMockRes({ shop: 'test-shop.myshopify.com' });
    await getThemeEditorUrl(req, res);

    const [[payload]] = res.json.mock.calls;
    expect(payload.data.url).toBe(
      'https://test-shop.myshopify.com/admin/themes/current/editor?context=apps&activateAppId=test-uid-123/inactive_tab'
    );
  });

  it('builds an addAppBlockId (section block) link for the shared bundle block', async () => {
    const req = { query: { appId: 'buy_one_get_one' } };
    const res = createMockRes({ shop: 'test-shop.myshopify.com' });
    await getThemeEditorUrl(req, res);

    const [[payload]] = res.json.mock.calls;
    expect(payload.data.url).toBe(
      'https://test-shop.myshopify.com/admin/themes/current/editor?template=product&addAppBlockId=test-uid-123/bundles_and_discounts&target=newAppsSection'
    );
  });

  it('rejects an unknown appId', async () => {
    const req = { query: { appId: 'not_a_real_app' } };
    const res = createMockRes({ shop: 'test-shop.myshopify.com' });
    await getThemeEditorUrl(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// toggleApp itself is intentionally NOT extension-gated server-side - only
// the frontend ToggleSwitch blocks turning an app on (see
// tests/components/ToggelSwitch.test.jsx). Enforcing it here too would also
// block the E2E suites' toggleAppWideSwitchAndRestore helper, which flips
// every app's toggle on/off freely regardless of the demo store's actual
// theme-block placement.
