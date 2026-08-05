import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openEditorTab } from '../../utils/openEditorTab';

// window.open() must be called synchronously (before any await) so the
// browser still attributes it to the user's click - calling it only after
// an awaited fetch resolves gets treated as a blocked popup in most
// browsers, since it's no longer directly inside the click handler's call
// stack. This is why the signature fetch happens *after* opening a blank
// tab and navigates it in place, rather than fetching first and opening
// the real URL directly.
describe('openEditorTab', () => {
  let fakeWindow;

  beforeEach(() => {
    fakeWindow = { location: { href: '' } };
    global.open = vi.fn(() => fakeWindow);
  });

  it('opens a blank tab synchronously, before the signature fetch resolves', () => {
    global.fetch.mockReturnValueOnce(new Promise(() => {})); // never resolves in this test

    openEditorTab('/bundle-discount/editor', '?shop=test-shop.myshopify.com');

    expect(global.open).toHaveBeenCalledWith('', '_blank');
  });

  it('navigates the opened tab to editor.html with the shop and fetched signature once ready', async () => {
    global.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ signature: 'sig-123' }), { status: 200 }));

    openEditorTab('/bundle-discount/editor', '?shop=test-shop.myshopify.com');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fakeWindow.location.href).toBe(
      '/editor.html?shop=test-shop.myshopify.com&signature=sig-123#/bundle-discount/editor'
    );
  });

  it('still navigates the tab (without a signature) if the signature fetch fails, instead of leaving it blank forever', async () => {
    global.fetch.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));

    openEditorTab('/bundle-discount/editor', '?shop=test-shop.myshopify.com');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fakeWindow.location.href).toBe('/editor.html?shop=test-shop.myshopify.com#/bundle-discount/editor');
  });

  it('does not call fetch at all when there is no shop in the current URL', () => {
    openEditorTab('/bundle-discount/editor', '');

    expect(global.fetch).not.toHaveBeenCalled();
    expect(fakeWindow.location.href).toBe('/editor.html#/bundle-discount/editor');
  });
});
