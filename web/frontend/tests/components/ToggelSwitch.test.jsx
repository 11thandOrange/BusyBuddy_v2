import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ToggleSwitch from '../../components/ToggelSwitch';

// Mirrors what /api/subscription/getUserSubscription actually returns -
// plenty of room under the Advanced plan's 6-app limit so plan limits never
// interfere with the extension-gating assertions below.
const SUBSCRIPTION_RESPONSE = {
  status: 'SUCCESS',
  data: { planName: 'Advanced', enabledAppsCount: 0, enabledApps: [] },
};

function mockFetch({ isEnabled = false, extensionEnabled = true, toggleOk = true } = {}) {
  global.fetch = vi.fn((url, options) => {
    if (url.includes('/api/subscription/app-status')) {
      return Promise.resolve({ json: () => Promise.resolve({ status: 'SUCCESS', data: { isEnabled } }) });
    }
    if (url.includes('/api/subscription/getUserSubscription')) {
      return Promise.resolve({ json: () => Promise.resolve(SUBSCRIPTION_RESPONSE) });
    }
    if (url.includes('/api/subscription/extension-status')) {
      return Promise.resolve({
        json: () => Promise.resolve({ status: 'SUCCESS', data: { extensionEnabled } }),
      });
    }
    if (url.includes('/api/subscription/toggle-app')) {
      return Promise.resolve({
        json: () =>
          Promise.resolve(
            toggleOk
              ? { status: 'SUCCESS', data: { enabledAppsCount: 1 } }
              : { status: 'ERROR', error: "This app's extension isn't enabled in your theme editor yet." }
          ),
      });
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`));
  });
}

describe('ToggleSwitch - theme-extension gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks enabling and explains why when the extension is not enabled in the theme editor', async () => {
    mockFetch({ isEnabled: false, extensionEnabled: false });
    render(<ToggleSwitch appId="bundle_discount" />);

    await waitFor(() =>
      expect(screen.getByText('Inactive').closest('[title]')).toHaveAttribute(
        'title',
        "This app won't be enabled until its extension is turned on in your theme editor."
      )
    );

    fireEvent.click(screen.getByText('Inactive'));

    // Clicking while blocked must not even attempt the toggle request.
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/subscription/toggle-app'),
        expect.anything()
      );
    });
  });

  it('allows enabling once the extension-status check confirms it is enabled', async () => {
    mockFetch({ isEnabled: false, extensionEnabled: true });
    render(<ToggleSwitch appId="bundle_discount" />);

    await waitFor(() =>
      expect(screen.getByText('Inactive').closest('[title]')).toHaveAttribute('title', 'Click to enable')
    );

    fireEvent.click(screen.getByText('Inactive'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/subscription/toggle-app',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('still allows disabling an already-active app even if the extension check comes back false', async () => {
    mockFetch({ isEnabled: true, extensionEnabled: false });
    render(<ToggleSwitch appId="bundle_discount" />);

    await waitFor(() => expect(screen.getByText('Active')).toBeInTheDocument());

    const toggleTitle = screen.getByText('Active').closest('[title]').getAttribute('title');
    expect(toggleTitle).toBe('Click to disable');

    fireEvent.click(screen.getByText('Active'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/subscription/toggle-app',
        expect.objectContaining({ body: JSON.stringify({ appId: 'bundle_discount', enable: false }) })
      );
    });
  });

  it('re-checks extension status when the window regains focus', async () => {
    mockFetch({ isEnabled: false, extensionEnabled: false });
    render(<ToggleSwitch appId="announcement_bar" />);

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
