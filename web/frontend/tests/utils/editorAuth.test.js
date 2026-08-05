import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// editorAuth.js reads shop/signature from the page's URL query string, put
// there by web/frontend/utils/openEditorTab.js before the tab was opened
// (via GET /api/editor/signature). This replaced an older design where a
// signed shop/signature pair was substituted into editor.html's <meta>
// tags server-side - that substitution only ran when Express itself served
// the file, which never happened in local dev (`npm run dev` serves
// editor.html straight off Vite's dev server), so the editor was always
// broken outside of a production build. Reading from the URL works
// identically regardless of which server (if any) served the HTML.
//
// Note: tests/setup.js globally stubs window.location as a plain mutable
// object (vi.stubGlobal('location', {...})) with a default
// search of '?shop=test-shop.myshopify.com' - each test overrides it.
describe('editorAuth.js', () => {
  let consoleErrorSpy;
  const originalSearch = window.location.search;

  beforeEach(() => {
    vi.resetModules();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    window.location.search = originalSearch;
  });

  it('reads shop and signature from the URL query string', async () => {
    window.location.search = '?shop=test-shop.myshopify.com&signature=real-signature-value';

    const mod = await import('../../utils/editorAuth.js?case=substituted');

    expect(mod.EDITOR_SHOP).toBe('test-shop.myshopify.com');
    expect(mod.EDITOR_SIGNATURE).toBe('real-signature-value');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('logs (but does not redirect) when a shop is present with no signature', async () => {
    window.location.search = '?shop=test-shop.myshopify.com';

    const mod = await import('../../utils/editorAuth.js?case=no-signature');

    expect(mod.EDITOR_SHOP).toBe('test-shop.myshopify.com');
    expect(mod.EDITOR_SIGNATURE).toBe('');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('does nothing when there is no shop at all (e.g. this module loaded outside the editor)', async () => {
    window.location.search = '';

    const mod = await import('../../utils/editorAuth.js?case=empty');

    expect(mod.EDITOR_SHOP).toBe('');
    expect(mod.EDITOR_SIGNATURE).toBe('');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('editorFetch appends shop and signature to the request URL', async () => {
    window.location.search = '?shop=test-shop.myshopify.com&signature=abc123';
    const mod = await import('../../utils/editorAuth.js?case=fetch-append');

    global.fetch.mockResolvedValueOnce(new Response('{}'));
    await mod.editorFetch('/api/products?search=x');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/products?search=x&shop=test-shop.myshopify.com&signature=abc123',
      undefined
    );
  });

  describe('safeParseJson', () => {
    it('parses a valid JSON body', async () => {
      const mod = await import('../../utils/editorAuth.js?case=safe-json-valid');
      const response = new Response(JSON.stringify({ message: 'ok' }));

      await expect(mod.safeParseJson(response)).resolves.toEqual({ message: 'ok' });
    });

    it('wraps a non-JSON body instead of throwing (the original crash: plain-text 401 bodies)', async () => {
      const mod = await import('../../utils/editorAuth.js?case=safe-json-invalid');
      const response = new Response('Unauthorized');

      await expect(mod.safeParseJson(response)).resolves.toEqual({ message: 'Unauthorized' });
    });

    it('returns null for an empty body', async () => {
      const mod = await import('../../utils/editorAuth.js?case=safe-json-empty');
      const response = new Response('');

      await expect(mod.safeParseJson(response)).resolves.toBeNull();
    });
  });
});
