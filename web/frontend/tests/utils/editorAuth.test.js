import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Regression test for a real production incident: editorAuth.js's
// unsubstituted-placeholder guard used to run unconditionally at module
// import time. StandardBundleEditor/BuyXGetYEditor/VolumeDiscountEditor/
// MixAndMatchEditor/AnnouncementBarEditor all import this module, and
// Routes.jsx (used by the *main* embedded app's App.jsx, not just the
// standalone editor) statically imports all of them - so this file's
// top-level code runs on every load of the main embedded app too, where
// the editor-shop/editor-signature meta tags legitimately don't exist
// (they're only in editor.html). That gave an empty string indistinguishable
// from an unsubstituted placeholder, and the guard tried to redirect
// window.location to /api/auth from inside Shopify's admin iframe - a
// redirect that gets blocked once it lands on accounts.shopify.com,
// breaking the entire embedded app, not just the editor.
//
// Note: tests/setup.js globally stubs window.location as a plain mutable
// object (vi.stubGlobal('location', {...})), not a real jsdom Location, so
// history.pushState has no effect on it here - pathname is set directly.
describe('editorAuth.js placeholder guard', () => {
  let consoleErrorSpy;
  const originalPathname = window.location.pathname;

  beforeEach(() => {
    vi.resetModules();
    document.head.querySelectorAll('meta[name="editor-shop"], meta[name="editor-signature"]').forEach((el) => el.remove());
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    window.location.pathname = originalPathname;
  });

  const setMeta = (name, content) => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', name);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  };

  it('does nothing on a non-editor page even with no meta tags present (the main embedded app)', async () => {
    window.location.pathname = '/';

    await import('../../utils/editorAuth.js?case=main-app-no-meta');

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('does nothing on a non-editor page even if stray editor meta tags exist', async () => {
    window.location.pathname = '/some-app-route';
    setMeta('editor-shop', '%EDITOR_SHOP%');
    setMeta('editor-signature', '%EDITOR_SIGNATURE%');

    await import('../../utils/editorAuth.js?case=main-app-stray-meta');

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('flags an unsubstituted placeholder on the actual standalone editor page', async () => {
    window.location.pathname = '/editor.html';
    setMeta('editor-shop', '%EDITOR_SHOP%');
    setMeta('editor-signature', '%EDITOR_SIGNATURE%');

    await import('../../utils/editorAuth.js?case=editor-placeholder');

    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('flags missing meta tags entirely on the standalone editor page (raw un-substituted file served)', async () => {
    window.location.pathname = '/editor.html';
    // No meta tags at all - same signal as serve-static answering with the
    // raw file before serveEditorHtml's substitution ever ran.

    await import('../../utils/editorAuth.js?case=editor-no-meta');

    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('does nothing on the standalone editor page when the meta tags were properly substituted', async () => {
    window.location.pathname = '/editor.html';
    setMeta('editor-shop', 'test-shop.myshopify.com');
    setMeta('editor-signature', 'real-signature-value');

    const mod = await import('../../utils/editorAuth.js?case=editor-substituted');

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mod.EDITOR_SHOP).toBe('test-shop.myshopify.com');
    expect(mod.EDITOR_SIGNATURE).toBe('real-signature-value');
  });
});
