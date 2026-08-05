import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useEditorNavigation } from '../../hooks/useEditorNavigation';

// Regression test: closeEditor() used to fall back to loading the main app
// *inside the editor popup itself* whenever window.close() didn't take
// effect. That popup is deliberately opened without `host` (it's meant to
// run outside the App Bridge shell), so the fallback rendered the app
// without the embedded context Shopify expects and landed on the app's
// default/home route instead of the results list a merchant just saved to.
// closeEditor now hands navigation back to window.opener - the original
// tab, which still has a real `host` in its own URL - instead of ever
// trying to render the main app inside the popup.
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/bundle-discount/editor?shop=test-shop.myshopify.com']}>
    {children}
  </MemoryRouter>
);

describe('useEditorNavigation - closeEditor', () => {
  let originalOpener;
  let originalClose;

  beforeEach(() => {
    originalOpener = window.opener;
    originalClose = window.close;
    window.close = vi.fn();
  });

  afterEach(() => {
    window.opener = originalOpener;
    window.close = originalClose;
  });

  it('sends the opener tab to the results page (using the opener\'s own host+shop) and closes itself', () => {
    const openerLocation = { href: '', search: '?host=aGVsbG8&shop=test-shop.myshopify.com' };
    window.opener = { closed: false, location: openerLocation, focus: vi.fn() };

    const { result } = renderHook(() => useEditorNavigation('bundle-discount'), { wrapper });
    result.current.closeEditor();

    expect(openerLocation.href).toBe('/bundle-discount?host=aGVsbG8&shop=test-shop.myshopify.com');
    expect(window.opener.focus).toHaveBeenCalled();
    expect(window.close).toHaveBeenCalled();
  });

  it('falls back to closing/redirecting this tab when there is no opener', () => {
    window.opener = null;

    const { result } = renderHook(() => useEditorNavigation('bundle-discount'), { wrapper });
    result.current.closeEditor();

    expect(window.close).toHaveBeenCalled();
    expect(window.location.href).toContain('/bundle-discount');
  });

  it('falls back when the opener tab has already been closed', () => {
    window.opener = { closed: true, location: { href: '' }, focus: vi.fn() };

    const { result } = renderHook(() => useEditorNavigation('bundle-discount'), { wrapper });
    result.current.closeEditor();

    expect(window.opener.focus).not.toHaveBeenCalled();
    expect(window.close).toHaveBeenCalled();
  });
});
