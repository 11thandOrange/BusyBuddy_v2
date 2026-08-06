import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ThemeExtensionBanner from '../../components/ThemeExtensionBanner';

function mockFetch({ extensionEnabled, url = 'https://test-shop.myshopify.com/admin/themes/current/editor' } = {}) {
  global.fetch = vi.fn((requestUrl) => {
    if (requestUrl.includes('/api/subscription/extension-status')) {
      return Promise.resolve({ json: () => Promise.resolve({ status: 'SUCCESS', data: { extensionEnabled } }) });
    }
    if (requestUrl.includes('/api/subscription/getThemeEditorUrl')) {
      return Promise.resolve({ json: () => Promise.resolve({ status: 'SUCCESS', data: { url } }) });
    }
    return Promise.reject(new Error(`Unexpected fetch: ${requestUrl}`));
  });
}

describe('ThemeExtensionBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing while the extension-status check is still loading', () => {
    global.fetch = vi.fn(() => new Promise(() => {})); // never resolves
    render(<ThemeExtensionBanner appId="bundle_discount" />);

    expect(screen.queryByText(/Enable Bundle Discount/)).not.toBeInTheDocument();
  });

  it('renders nothing once the extension is confirmed enabled', async () => {
    mockFetch({ extensionEnabled: true });
    render(<ThemeExtensionBanner appId="bundle_discount" />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.queryByText(/Enable Bundle Discount/)).not.toBeInTheDocument();
  });

  it('renders a banner naming the specific app, mentioning Save, and linking to the deep link', async () => {
    mockFetch({
      extensionEnabled: false,
      url: 'https://test-shop.myshopify.com/admin/themes/current/editor?template=product&addAppBlockId=uid/bundles_and_discounts&target=newAppsSection',
    });
    render(<ThemeExtensionBanner appId="bundle_discount" />);

    const link = await screen.findByRole('link');
    expect(link.textContent).toContain('Enable Bundle Discount');
    expect(link.textContent).toContain('Save');
    expect(link).toHaveAttribute(
      'href',
      'https://test-shop.myshopify.com/admin/themes/current/editor?template=product&addAppBlockId=uid/bundles_and_discounts&target=newAppsSection'
    );
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('gives each app a distinct background color', async () => {
    mockFetch({ extensionEnabled: false });
    const seen = new Set();

    for (const appId of [
      'announcement_bar',
      'bundle_discount',
      'buy_one_get_one',
      'volume_discounts',
      'mix_match',
      'inactive_tab',
    ]) {
      const { unmount } = render(<ThemeExtensionBanner appId={appId} />);
      const link = await screen.findByRole('link');
      const bg = link.style.background;
      expect(seen.has(bg)).toBe(false);
      seen.add(bg);
      unmount();
    }
  });

  it('re-checks extension status when the window regains focus', async () => {
    mockFetch({ extensionEnabled: false });
    render(<ThemeExtensionBanner appId="announcement_bar" />);

    await waitFor(() => {
      const calls = global.fetch.mock.calls.filter(([url]) => url.includes('extension-status'));
      expect(calls.length).toBe(1);
    });

    window.dispatchEvent(new Event('focus'));

    await waitFor(() => {
      const calls = global.fetch.mock.calls.filter(([url]) => url.includes('extension-status'));
      expect(calls.length).toBe(2);
    });
  });
});
